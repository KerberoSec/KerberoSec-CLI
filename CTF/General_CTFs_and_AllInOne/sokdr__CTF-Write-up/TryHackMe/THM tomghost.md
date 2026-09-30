 # CTF-Write-up

## Try Hack Me: tomghost

##### URL: https://tryhackme.com/room/tomghost

##### Created by _https://tryhackme.com/p/stuxnet_

![logo](https://user-images.githubusercontent.com/20625004/122586755-b876cd80-d065-11eb-9ae2-cb8af4e0116c.PNG)

You should deploy the machine first.

Add the CTF ip to your host file.

``` echo "CTF ip" >> /etc/hosts```

Run nmap against the target machine.

```nmap -sC -A  <target IP>```

Since we found open the port 8009 we try the tomcat_ghostcat exploit you can use the ``https://github.com/00theway/Ghostcat-CNVD-2020-10487`` or ``metasploit``.

![metasplot](https://user-images.githubusercontent.com/20625004/122587196-363ad900-d066-11eb-8690-b811d078aa69.PNG)

By executing the auxiliary on the target IP we found a username and password.

Use them to ssh.

``ssh skyfuck@targetip``

Search for user.txt

``find / -type f -name user.txt 2>/dev/null``

We obtained the first flag.

In home folder of the user there are some files.

There is a PGP file that needs to be decrypted using a passphrase to get the other user’s credentials.

Now transfer the files to the local system using SCP to decrypt the PGP file. Use the user’s credentials we got earlier.

![files](https://user-images.githubusercontent.com/20625004/122587606-b4977b00-d066-11eb-9a96-5047c9cc365e.PNG)

Copy ``credential.pgp`` and ``tryhackme.asc`` in your local machine.

``scp skyfuck@TargetIP:/home/skyfuck/filetocopy /destination``

Now we use gpg2john to convert the tryhackme.asc file. 

``gpg2john tryhackme.asc > test``

After converting the file use ``john`` to crack it.

``john test --wordlist=/usr/share/wordlists/rockyou.txt ``

Now we use the cracked passphrase to decrypt the PGP file. First import the crdential file to your system and decrypt it. 

``gpg --import tryhackme.asc ``

and then

``gpg --decrypt credential.pgp ``

Now we found the second user.

![second_user](https://user-images.githubusercontent.com/20625004/122589292-be21e280-d068-11eb-83cc-cf7953a3e20e.PNG)

Use SSH with the provided credentials.

![merlin](https://user-images.githubusercontent.com/20625004/122589422-e6a9dc80-d068-11eb-805b-8d86408ca6cf.PNG)

Enter ``sudo -l``

![sudo](https://user-images.githubusercontent.com/20625004/122589535-0a6d2280-d069-11eb-901f-9be9ed36f4e0.PNG)

User merlin has sudo access on zip. To perform privilege escalation we need to create any file and zip it. Lets check ``https://gtfobins.github.io/gtfobins/zip/``.

![escalate](https://user-images.githubusercontent.com/20625004/122589736-50c28180-d069-11eb-92a4-b484db2cad1e.PNG)

And we have found the second flag.

