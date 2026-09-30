# **Agetn T**
___
#### Let's start
___
#### First
start the machine and wait for a while to boot it. then visit the IP `10.10.xxx.yyy`. You will find a website with some graphs and charts. But nothing special here.
But wait. There is a clue here. **John Hammond** said in the title:
>> **Something seems a little off with the server.**
___

Ok then let's
#### Scan The server with nmap
To understand what's going on on the server, the first thing we do is we **scan** the **sh!t** out of the server. What is better than nmap to do the job!!!
hit the sucker with the command below:
`nmap -sV -sC -T4 -v 10.10.xxx.yyy`

*Amazingly* it will not take too much time to complete the scan.
In the result, you will see that this boi is running `PHP 8.1.0-dev` in the backend on **port 80**.
___
Let's
#### Search for vulnerability
Simply search for `PHP 8.1.0-dev vulnerability/ exploits` on *google.com*. You will find that there is a ***backdoor RCE*** for this sucker.
Here's a github link for that: https://github.com/flast101/php-8.1.0-dev-backdoor-rce

Now run that code to get into the server.
___
#### Final Blow
after successfully getting into the server, first check who you are by using **`whoami`** command. Then check you present directory and what it has in it:
>> **`pwd`**
>> **`ls -la`**

Unfortunately there is no **flag** or **flag.txt** file here. Flag might not be in here, it can be somewhere else.
Let's find it out by using the command:
>> **find / -name "flag.*"**

This will find any file that starts with the name ***flag*** like: flag.txt, flag.php, flag.jpg so on.

And here's our boi *flag.txt* in */* directory. To read it simply use:
**`cat /flag.txt`** and you've got what you needed.
Submit that sucker and finish the room.
___
***Quite the mind, Let the soul speak***
------------------------------------ unknown