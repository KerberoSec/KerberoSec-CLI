# Surfer

Surf some internal webpages to find the flag!

<img align="right" src="https://github.com/matthernet/Writeups/blob/main/TryHackMe/Room/images/surfer/surfer01.png" width="150" height="150">

LINK = [https://tryhackme.com/room/surfer](https://tryhackme.com/room/surfer)

### FYI
This writeup don't include any passwords/cracked hashes/flags

# Description
Woah, check out this radical app! Isn't it narly dude? We've been surfing through some webpages and we want to get you on board too! They said this application has some functionality that is only available for internal usage: but if you catch the right wave, you can probably find the sweet stuff!

# Steps

1: Join the room, start the virtual machine and the AttackBox (or connect via VPN)

2: Access the IP address of the virtual machine and you will see the appplication login (of course we have to try admin:admin 😉)

3: In the app menu there is an ```Export Reports``` option

<img src="https://github.com/matthernet/Writeups/blob/main/TryHackMe/Room/images/surfer/surfer02.png" width="50%">

* *Notice that the report request is made by http://127.0.0.1/server-infor.php*

4: In the deailed menu you will see that ```/internal/admin.php``` contains the flag, but if you try to access you will get an error

<img src="https://github.com/matthernet/Writeups/blob/main/TryHackMe/Room/images/surfer/surfer03.png" width="50%">
<img src="https://github.com/matthernet/Writeups/blob/main/TryHackMe/Room/images/surfer/surfer04.png" width="50%">

5: Inspect the buttom ```Export to PDF``` and notice that there is a hiden value ```http://127.0.0.1/server-infor.php```

<img src="https://github.com/matthernet/Writeups/blob/main/TryHackMe/Room/images/surfer/surfer05.png" width="50%">

6: In the HTML inspector modify that value for ```http://127.0.0.1/internal/admin.php``` and try again to ```Export to PDF```, that will make the request from the internal server

<img src="https://github.com/matthernet/Writeups/blob/main/TryHackMe/Room/images/surfer/surfer06.png" width="50%">

7: Get the flag!! 😎
