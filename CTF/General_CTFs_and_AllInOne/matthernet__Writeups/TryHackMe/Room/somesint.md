# KaffeeSec: SoMeSINT

<img align="right" src="https://github.com/matthernet/Writeups/blob/main/TryHackMe/Room/images/somesint1.png" width="150" height="150">

An intro to SOCMINT (Social Media Intelligence/Investigation) techniques and tooling. Use your awesome OSINT skills to perform an online investigation of a mysterious husband!

LINK = [https://tryhackme.com/room/somesint](https://tryhackme.com/room/somesint)

### FYI
This writeup don't include any passwords/cracked hashes/flags

# Description

In this room, you will be learning social media analysis and forensics. You will learn about google dorking, website archiving, social media enumeration/analysis, and the basic usage of OSINT techniques in the context of social media investigation. You don't need any previous knowledge of OSINT to do well in this room, but it definitely helps. I have included some resources in the "Resources" task at the bottom of the room that I encourage you to check out after completing this room!

# Steps

1: Join the room, start the virtual machine (or connect via VPN)

2: Task 2
* The anwers are in the __Background Information__

3: Task 3
* Search his name in Google, it will lead you to his [Twitter account](https://twitter.com/tstraussman) where hi details his favorite holiday
* Search his name in Google, it will lead you to his [Reddit account](https://www.reddit.com/user/Tstraussman/) where hi details his birhtday data
* Look the followers list of his [Twitter account](https://twitter.com/tstraussman) and you will find the twitter handle of his fiancee
* Look his [Twitter account](https://twitter.com/tstraussman) and you will find the background picture

4: Task 4
* Follow the instruction and install [Spiderfoot](https://github.com/smicallef/spiderfoot)
* Set the name of the target as ```Scan Target``` and 
* Go the the ```Scans``` tab and the ```Browse``` section to find the source __module used__
* Go to the ```shadowban.eu API``` link used in the scan and you will find the value of __"search"__

5: Task 5
* Search in the fiancee Twitter account and you will find the vacations picture, a everse image search of that image will give you the place
* Search in the fiancee Twitter account and you will find a twitt wishing happy birthday to her mother with the date 
* Search in the fiancee Twitter account and you will find the cat picture with the name
* Search in the fiancee Twitter account and you will find the several hints of her favorite show

6: Task 6

* Using [Wayback Machine](https://web.archive.org/) search in the captures of his [old Reddit birthday post](https://old.reddit.com/user/Tstraussman/comments/kh1pzg/big_thank_you/) and you will find a comment from his coworker
* In the coworker profile you will find his name and where he live
* Using [Wayback Machine](https://web.archive.org/) search in the captures of his coworker Reddit profil and you will find a strange comment that will lead you to a post with the link ID
* In the same post you will find the password for the link
* Access the link using that pasword and you will find the mistress name
* In the same link you will also find the email address from Thomas
