
#OffensiveSecurity 

https://tryhackme.com/r/room/offensivesecurityintro

This is the core of "Offensive Security." It involves breaking into computer systems, exploiting software bugs, and finding loopholes in applications to gain unauthorized access. The goal is to understand hacker tactics and enhance our system defences.

Fakebank website  , brute force the hidden directories and pages 

```
10.10.95.107

gobuster -u http://fakebank.thm -w wordlist.txt dir

/images (Status: 301)
/bank-transfer (Status: 200)

http://fakebank.thm/bank-transfer    

admin portal
```

Your mission is to transfer $2000 from bank account 2276 to your account (account number 8881). If your transfer was successful, you should now be able to see your new balance reflected on your account page.

Go there now and confirm you got the money! (You may need to hit Refresh for the changes to appear)

