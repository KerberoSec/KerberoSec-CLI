```
   _             _                     _                 
 _//           _//    _/__/_         _//        /        
 /   __, __    /   _  /  /  _  __    /   __ _. /_  _  __ 
/___(_)\/</_  /___</_<__<__</_/ (_  /___(_)(__/ <_</_/ (_
```
Welcome to LoverLetterLocker, where you can safely write and store your Valentine's
letters. For your eyes only? [^1]

What is the flag after accessing other users' letters?
-----------------------------------------------------------------------------------------
We start by opening the web application in the browser of our attacking machine and are
prompted with a simple login/registration screen. So, we create a sample test account
with a random password and log in. On the dashboard, we can already spot a useful tip,
that every love letter gets a unique number in the archive hinting at a potential 
*Insecure Direct Object References* (IDOR) attack. Therefore, create a new love letter
and notice the file ID number 3 in the URL bar. Since, there are only two more other
love letters in the database, we can now check the letter 1 and 2 `./letter/1` with the
flag.

[^1]: https://tryhackme.com/room/lafb2026e2
