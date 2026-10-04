# OhSINT

<img align="right" src="https://github.com/matthernet/Writeups/blob/main/TryHackMe/Room/images/ohsint1.png" width="150" height="150">

Are you able to use open source intelligence to solve this challenge?

LINK = [https://tryhackme.com/room/ohsint](https://tryhackme.com/room/ohsint)

### FYI
This writeup don't include any passwords/cracked hashes/flags

# Description

What information can you possible get with just one photo?

# Steps

1: Download the Task File and run the tool exiftool on it
* ```exiftool WindowsXP.jpeg```

2: What is this users avatar of?
* In the exiftool output find the Copyright and search it on Google, it will lead you to the [Twitter account](https://twitter.com/owoodflint) of the user with his avatar

3: What city is this person in?
* In the exiftool output find the Copyright and search it on Google, it will lead you to the [GitHub account](https://github.com/OWoodfl1nt/people_finder) of the user where he reveals his location

4: Whats the SSID of the WAP he connected to?
* In his first tweet he discloses the BSSID of his home WiFi:
```
From my house I can get free wifi ;D

Bssid: B4:5D:50:AA:86:41 - Go nuts!
```
* Using he website https://www.wigle.net/ search for that BSSID and get the SSID of the WAP he's connected to (_you will neeed to create a free account in [Wigle](https://www.wigle.net/) to view the full information_)

5: What is his personal email address?
* In the exiftool output find the Copyright and search it on Google, it will lead you to the [GitHub account](https://github.com/OWoodfl1nt/people_finder) of the user where he reveals his personal email address

6: What site did you find his email address on?
* This is reponded in the question number 5

7: Where has he gone on holiday?
* In the exiftool output find the Copyright and search it on Google, it will lead you to the user [personal website](https://oliverwoodflint.wordpress.com/author/owoodflint/) where he reveals his current holidays location

8: What is this persons password?
* Inspect the code of the [personal website](https://oliverwoodflint.wordpress.com/author/owoodflint/) and you will find the password
