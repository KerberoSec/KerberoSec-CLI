---
title: THM Advent of Cyber 3 (2021) NoSQL WriteUp
layout: post
categories: [TryHackMe,NoSQL]
tags: [THM]
toc: true
published: true
---

# Advent of Cyber 3 (2021) [Day 7: NoSQL]

# [Day 7] Web Exploitation Migration Without Security

Credits: [RealTryHackMe](https://tryhackme.com/room/adventofcyber3)

## Please Read Day 07 About **NoSQL**

### First Flag: Q: Interact with the MongoDB server to find the flag. What is the flag?
1. As you read **turn on your Machine**
2. Open **Terminal**
3. Type **ssh thm@MACHINE_IP -p 2222**
4. As you read in This room of **day 07**
5. Do the same steps like the **image Below**
6. ![](https://i.imgur.com/HfVghdS.png)
7. **login ssh**
8. Interact with **mongo db**
9. **show** your **databases**
10. Use **flagdb** DataBase
11. So Now** you'r in flagdb** Database
12. List All **Collections == Tables**
13. Will Find flag **Column == Fields** in this **Records == Documents**

-----------------------------

### Second Flag: Q: Interact with the MongoDB server to find the flag. What is the flag?
1. Open **http://MACHINE_IP**
2. Try to inject dummy data in **username** and **password** Fields
3. Fire up Your **Burp**
4. Intercept the Request after sending **username** and **password** Inputs Fields
5. As you read in This room of **day 07**
6. ![](https://i.imgur.com/J0CqeMJ.png)
7. As You learned send **username** parameter with **admin**
8. Change password paramter to **anything**
9. Paramter **password[$ne]=anything**
10. **$ne == Not Equal**
11. To make all statement Like True as **SQLI**
12. **Username is admin** & **Password not equal anything** == **[TRUE]**
13. Respose will be **302 Found** 
14. ![](https://i.imgur.com/WyvVnaj.png)
15. **Press Follow Redirection**
16. You will find **flag Directory**
17. Click Right and Choose Copy Response Link from burp response in repeater
18. Paste Link in Browser and clcik on flag link
19. ![](https://i.imgur.com/H0tm2U9.png)

-----------------------------

### Third Flag: Q: Once you are logged in, use the gift search page to list all usernames that have guest roles. What is the flag?
1. After login you will see **search link**
2. Search with any **dummy data**
3. As you read in This room of **day 07**
4. ![](https://i.imgur.com/VLW1pi4.png)
5. Change GET Paramters **username & role** to be **TRUE**
6. How to make it **True** **First** and **Second** Paramter each paramter should be **TRUT** to make all Request True
7. **Username** Paramter **Not Equal admin** == **anyusername**
8. **Role** Paramter **Not Equal admin** also == **Role=guest**
9. **From 7,8** The Request will be **True** To get **All guests Usernames Not Admin**
10. The Response Will Retraive The THM flag

-----------------------------

### Fourth Flag: Q: Use the gift search page to perform NoSQL injection and retrieve the mcskidy record. What is the details record?
1. After login you will see **search link**
2. Search with any **dummy data**
3. As you read in This room of **day 07**
4. ![](https://i.imgur.com/McV8cSL.png)

5. Change GET Paramters **username & role** to be **TRUE**
6. How to make it True First and Second Paramter each paramter should be TRUT to make all Request True
7. **Username** Paramter Value **mcskidy**
8. **Role** Paramter Value **Not Equal admin also**
9. But i didn't ant flag in respose
10. Change **Role** Paramter Value Not **Equal admin guest** == Role=admin
11. **From 7,10** The Request will be True To get **mcskidy** Username with **Admin Role**
12. The Response Will Retraive The THM flag
