# CTF-Write-up

## Vulnhub: EvilBox: One

##### URL: https://www.vulnhub.com/entry/evilbox-one,736/

##### Created by _https://www.vulnhub.com/author/mowree,814/_

![logo](https://user-images.githubusercontent.com/20625004/160284644-df586f72-2941-4a86-8f28-bb188464add6.jpg)

At first we run ``nmap`` tool to find open ports.

![nmap](https://user-images.githubusercontent.com/20625004/160284688-284e8800-6710-4247-a7b2-9a1b59391590.PNG)

There are two open ports lets access port 80.

![apache](https://user-images.githubusercontent.com/20625004/160284732-48c8dd77-6565-4214-8f31-84fdc3ccd719.PNG)

A default Apache page, now lets use ``gobuster`` to find any interesting directories/paths.

``gobuster dir <target IP> -w /path/to/wordlist.``

![gobuster](https://user-images.githubusercontent.com/20625004/160284818-0413c9d2-db91-4e84-84bd-35e592958ede.PNG)

We found ``robots.txt``

![robots](https://user-images.githubusercontent.com/20625004/160284971-f4d83635-0f9d-416d-8c42-0dfdd8b946a0.PNG)

Nothing usefull.

We also found ``secret`` access it.

![secret](https://user-images.githubusercontent.com/20625004/160284870-12b4c3fe-1ae4-4500-a46d-103b65beb976.PNG)

Nothing there and nothing on ``view-source`` of the page.

Use again ``gobuster`` with ``-x`` flag to search for extensions such as php,html,sh.

``gobuster dir <target IP> -w /path/to/wordlist. -x php,html``

![extensions](https://user-images.githubusercontent.com/20625004/160285094-fb9954e5-6170-4861-a57a-68455edc34b9.PNG)

We found a php script inside the /secret path ``/evil.php``

![evil](https://user-images.githubusercontent.com/20625004/160285120-a6f7ae8e-32f8-4c90-9f3c-be65ac5e61ee.PNG)

Nothing there, but we can use fuzzing to identify a valid parameter for the file.

![php](https://user-images.githubusercontent.com/20625004/160285213-1a6e2edd-2bc2-45fd-96ea-348ea3666e2c.PNG)

Manual check show nothing, lets use ``ffuf`` tool to automate the procedure.

``ffuf -u <Target IP/secret/evil.php?FUZZ=/etc/passwd -c -w /pathToWordlist/ -fs 0 ``

![fuzz](https://user-images.githubusercontent.com/20625004/160285420-11230f30-fdd3-494e-afea-a3b432805984.PNG)

The output shows a parameter ``command`` that responded with 200 code, use this parameter and open the URL. 

![passwd](https://user-images.githubusercontent.com/20625004/160285631-dc297674-22f3-4a07-b7bc-c6e49fd8dddc.PNG)

Now we accessed the ``passwd`` file and we have found a user called `mowree`.

Use that name and access ``SSH``.

![failed_ssh](https://user-images.githubusercontent.com/20625004/160285680-68da1fdc-eb32-44a9-9feb-67b2a319c7b2.PNG)

Ok it is asking for a password. I tryied to brute force the user with no success. 
At this point we have to go back in the previous step and fuzz further since we have a username.

![home](https://user-images.githubusercontent.com/20625004/160285766-bbdf8cad-382f-466a-9d48-54159a82e139.PNG)

We can user again ``ffuf`` to identify default configuration files from the users folder.

``ffuf -u <Target IP/secret/evil.php?command=/home/mowree/FUZZ -c -w /pathToWordlist/ -fs 0``

Personally it was a good oportunity to create a bash script to do the same job not so ellegant but it did the job.

![script](https://user-images.githubusercontent.com/20625004/160286204-d4c852b5-c702-4e8e-bbca-c3608f809dfb.PNG)

We found the private key of the user ``mowree``. 

![private](https://user-images.githubusercontent.com/20625004/160286228-95d7a721-1b19-4681-b659-07050a66fe64.PNG)

Copy the key in your system.

Now lets try to access the ``SSH`` with that private key. Before that changed its permissions
``chmod 600 file``

![rsa](https://user-images.githubusercontent.com/20625004/160286434-ff1ecd1c-5a71-417d-acfd-803e500c1485.PNG)

Again it is asking for a password, now we have to crack the key with ``ssh2john`` tool.

At first we have to extract the hash from the private key, and later on use the ``john`` to find the password.

![cracked](https://user-images.githubusercontent.com/20625004/160287480-0031cfc4-c759-4b51-b6ff-6c86e1522619.PNG)

We found a password lets access again ``SSH``.

![user](https://user-images.githubusercontent.com/20625004/160287528-e81bd3f1-0432-4ab9-923c-d35f708d5648.PNG)

Success we logged in to the system. After logging in, we ran the id command to check the current user.

Now lets type ``sudo -l`` to see what the user can run with root privileges.

![sudo](https://user-images.githubusercontent.com/20625004/160287675-cd10c341-0ed1-4c94-88d4-effbd883e4ef.PNG)

Nothing...after a lot of searching within the system (cron/services/kernel_version etc) i looked back on the file ``/etc/passwd``.
There from the permissions of the file we observe that anyone can read and write on that file.

![read](https://user-images.githubusercontent.com/20625004/160287833-23532a94-3e1e-4fc4-b609-34568086c342.PNG)

Since we have that ability we can try to create a root user and escalate our privileges.

By using ``mkpasswd`` tool and comand ``mkpasswd -m sha-512`` we genetated a SHA 512 hash for ``password``.

``$6$XImEtKhtxTmLAtL7$j5Vcng.LE4ZMSJZQBjQZ00BYV63p5Oq5cM4PLeL2B6OKOe2YxhOKxAB.x/QDvdPF0yJiRfV2mcDP7nNzxGuUT/``

We copy the outcome and go back to the machine and access ``passwd`` file with ``nano``.

I named my user ``newuser``
Format Syntax. 
``newuser:$6$XImEtKhtxTmLAtL7$j5Vcng.LE4ZMSJZQBjQZ00BYV63p5Oq5cM4PLeL2B6OKOe2YxhOKxAB.x/QDvdPF0yJiRfV2mcDP7nNzxGuUT/:0:0:root:/root:/bin/bash``

![passwd_format](https://user-images.githubusercontent.com/20625004/160288209-056e9545-f8d0-471a-8a5d-867c58674b48.PNG)

OK now save it and type ``su youruser``.

![privilege](https://user-images.githubusercontent.com/20625004/160288277-68189dcc-7666-4cda-a185-7188b7178f73.PNG)

Root user success.

![root](https://user-images.githubusercontent.com/20625004/160288462-00548767-838e-41a7-a255-72b0d1e7611f.PNG)

Search on the root directory and there is the root flag.

