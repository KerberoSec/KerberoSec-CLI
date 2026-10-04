# CTF-Write-up

## Try Hack Me: Brute IT

##### URL: https://tryhackme.com/room/bruteit

##### Created by _https://tryhackme.com/p/ReddyyZ_

![logo](https://user-images.githubusercontent.com/20625004/117316006-de1e8d80-ae90-11eb-8cc3-0a8fcdd81d5b.PNG)

You should deploy the machine first.

Add the CTF ip to your host file.

``` echo "CTF ip" >> /etc/hosts```

Run nmap against the target machine.

```nmap -sC -A  <target IP>```

With the above command you should be able to find the 4 questions of the "Reconnaissance" stage.

For the last one we will use ``gobuster`` tool.

``gobuster dir <TargetIP> -w /path/to/wordlsit``

![gobuster](https://user-images.githubusercontent.com/20625004/117318314-f98a9800-ae92-11eb-845d-e2366fd5bc4b.PNG)

And we found the hidden directory.

Access the hidden path and you find a login page. View source the page and we found a name.

![hidden_1](https://user-images.githubusercontent.com/20625004/117318692-55552100-ae93-11eb-8c2d-004c87c89e78.PNG)

Since we found a name we are going to bute force the login page with ``hydra``.

``hydra -l <username> -P <wordlist> <TargetIP> http-post-form "/admin/:user=^USER^&pass=^PASS^:F=Username or password invalid" -V -f``

![brute](https://user-images.githubusercontent.com/20625004/117319594-1f646c80-ae94-11eb-8a5f-617b0ac65ba0.PNG)

We now have found a password access the login page.

![rsa](https://user-images.githubusercontent.com/20625004/117319797-4fac0b00-ae94-11eb-96f3-34bd498cc97c.PNG)

Download the rsa private key.

Since we have the user and the private key we try to login to the SSH service but here is the problem that key is password protected 
and we have to crack it with ``ssh2john``, first we have to convert that key to hash and then crack that hash value.

``python /usr/share/john/ssh2john.py key > hash``

![ssh2john](https://user-images.githubusercontent.com/20625004/117322991-2771db80-ae97-11eb-8ec6-dedccd64d5c0.PNG)

Then we crack it with ``john``.

![john](https://user-images.githubusercontent.com/20625004/117323140-4d977b80-ae97-11eb-8ef7-74ad1b9fefd0.PNG)

Now lets access SSH service.

![access](https://user-images.githubusercontent.com/20625004/117323444-8fc0bd00-ae97-11eb-9ed8-f8cf2770f2b0.PNG)

We access the SSH service and also we found the user flag and the web flag from previous step when we found the login password for the web service.

Now Privilege Escalation.

We run ``sudo -l`` to find what the user can run with root privileges. Always search in ``https://gtfobins.github.io/gtfobins/cat/``.

Looks like the user can run ``cat`` as sudo, then you can cat the root.txt flag  in the path /root/root.txt:

![root](https://user-images.githubusercontent.com/20625004/117324273-50df3700-ae98-11eb-9f28-24a68957bdd8.PNG)

We found the root flag. 

Next you can use the info that the user can run ``cat`` as root and copy passwd and shadow files in your system. 

![pass](https://user-images.githubusercontent.com/20625004/117346174-1386a380-aeb0-11eb-800e-9e4a8d196252.PNG)

Use ``john`` again to crack and you have the root password.

