---
author: "Shebu"
title: "Git Happens: THM"
date: "2021-11-17"
tags: ["git", "tryhackme"]
cover:
    image: img/Githappens.jpg
    # can also paste direct link from external site
    # ex. https://i.ibb.co/K0HVPBd/paper-mod-profilemode.png
    alt: "<alt text>"
    caption: "<text>"
    relative: false # To use relative path for cover image, used in hugo Page-bundles
---

## Room Description -

  Boss wanted me to create a prototype, so here it is! We even used something called "version control" that made deploying this really easy!

**Room Link -**  [https://tryhackme.com/room/githappens](https://tryhackme.com/room/githappens) 

**Creator -**  [hydragyrum](https://tryhackme.com/p/hydragyrum) 

### Task 1: Find the Super Secret Password

**NMAP**

```bash
# Nmap 7.91 scan initiated Wed Jul 21 01:43:34 2021 as: nmap -sC -sV -v -p 80 -Pn -oN git-happens.nmap 10.10.73.189
Nmap scan report for 10.10.73.189
Host is up.

PORT   STATE    SERVICE VERSION
80/tcp filtered http

Read data files from: /usr/bin/../share/nmap
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Wed Jul 21 01:43:37 2021 -- 1 IP address (1 host up) scanned in 3.18 seconds

``` 

As you can see there is only one port open :

**Port 80**: ` HTTP `

**Web Enumeration**

We get a static login page  as below 👇🏻

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1628158807688/vn3YzWyKU.png)

There is nothing much here , let's do some directory busting .

> ffuf -c -t 100 -w /usr/share/wordlists/dirb/common.txt -u http://git-happens.thm/FUZZ

We get the following directories

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1628158936558/ZSR8JmSD5.png)

```bash
.git/HEAD
css
index.html
``` 

The .git directory is what interests me since this box is related to git .

Lets take a look at that directory

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1628159120067/OXABUNUtq.png)

Cool ! Let's download all of them using a tool called `gitdumper` which is a part of `GitTools` repo.
Link: https://github.com/internetwache/GitTools

Runnning the help command on `gitdumper.sh` tells us the syntax which we need to use to run the tool .

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1628159392614/HaMgY6fPQ.png)

As the tool says lets create a directory to download all the files. I made a directory called **git** and ran the script along with the URL of the website.

```bash
 /opt/tools/GitTools/Dumper/gitdumper.sh http://git-happens.thm/.git/    git

``` 

```bash
┌──(shebu㉿kali)-[~/Desktop/thm/git-happens]
└─$ /opt/tools/GitTools/Dumper/gitdumper.sh http://git-happens.thm/.git/ git                                 127 ⨯
###########
# GitDumper is part of https://github.com/internetwache/GitTools
#
# Developed and maintained by @gehaxelt from @internetwache
#
# Use at your own risk. Usage might be illegal in certain circumstances. 
# Only for educational purposes!
###########

[*] Destination folder does not exist
[+] Creating git/.git/
[+] Downloaded: HEAD
[-] Downloaded: objects/info/packs
[+] Downloaded: description
[+] Downloaded: config
[-] Downloaded: COMMIT_EDITMSG
[+] Downloaded: index
[+] Downloaded: packed-refs
[+] Downloaded: refs/heads/master
[-] Downloaded: refs/remotes/origin/HEAD
[-] Downloaded: refs/stash
[+] Downloaded: logs/HEAD
[+] Downloaded: logs/refs/heads/master
[-] Downloaded: logs/refs/remotes/origin/HEAD
[-] Downloaded: info/refs
[+] Downloaded: info/exclude
[-] Downloaded: /refs/wip/index/refs/heads/master
[-] Downloaded: /refs/wip/wtree/refs/heads/master
[+] Downloaded: objects/d0/b3578a628889f38c0affb1b75457146a4678e5
[-] Downloaded: objects/00/00000000000000000000000000000000000000
[+] Downloaded: objects/b8/6ab47bacf3550a5450b0eb324e36ce46ba73f1
[+] Downloaded: objects/77/aab78e2624ec9400f9ed3f43a6f0c942eeb82d
[+] Downloaded: objects/f1/4bcee8053e39eeb414053db4ec7b985f65edc8
[+] Downloaded: objects/9d/74a92581071ae7c4a470ff035e0de4598877e5
[+] Downloaded: objects/20/9515b2f7cbdfb731d275c4b089e41ba35c3bc8
[+] Downloaded: objects/5a/35c9b7c787c22f689d0364cf57b013a11561a2
[+] Downloaded: objects/08/906612dfe6821cebc21794eb85601fc4f54de9
[+] Downloaded: objects/4a/2aab268541cbcc434e0565b4f4f2deca29ee5f
[+] Downloaded: objects/7c/578d86a8713b67af2cb1b1d7c524c23cefe7aa
[+] Downloaded: objects/4e/7178fa5b68fec15e54f2b79ace6f9ce0169e01
[+] Downloaded: objects/2e/b93ac3534155069a8ef59cb25b9c1971d5d199
[+] Downloaded: objects/4c/f757268c6824041664d132a29908aa9c362a26
[+] Downloaded: objects/3a/39b02d3b9d12222bac4737ee67e31403d62f13
[+] Downloaded: objects/ae/f68b1e25df81a8c96ee4d57b20cc9f7a1ebee5
[+] Downloaded: objects/d6/df4000639981d032f628af2b4d03b8eff31213
[+] Downloaded: objects/56/820adbbd5ac0f66f61916122c94ea52937e9b2
[+] Downloaded: objects/d9/54a99b96ff11c37a558a5d93ce52d0f3702a7d
[+] Downloaded: objects/06/012255f074d7bc4acc6fadbcff004380b5f83b
[+] Downloaded: objects/bc/8054d9d95854d278359a432b6d97c27e24061d
[+] Downloaded: objects/dd/13038df878d41b774ce4fd4552091d46873c25
[+] Downloaded: objects/8c/94b154aef92380e29a3f16f1a889b56127cf13
[+] Downloaded: objects/e5/6eaa8e29b589976f33d76bc58a0c4dfb9315b1
[+] Downloaded: objects/48/926fdeb371c8ba174b1669d102e8c873afabf1
[+] Downloaded: objects/ce/b8d530ebcf79806dffc981905ec8c2e0d7a65b
[+] Downloaded: objects/87/bcbcb476578c6cc90ed39f9404292539fe1c9c
[+] Downloaded: objects/39/5e087334d613d5e423cdf8f7be27196a360459
[-] Downloaded: objects/40/04c23a71fd6ba9b03ec9cb7eed08471197d843
[-] Downloaded: objects/19/a865c5442a9d6a7c7cbea070f3cb6aa5106ef8
[-] Downloaded: objects/0f/679a88dbbaf89ff64cb351a151a5f29819a3c0
[+] Downloaded: objects/0e/abcfcd62467d64fb30b889e8de5886e028c3ed
[+] Downloaded: objects/ba/5e4a76e3f7b6c49850c41716f8f1091fbdc84e
[+] Downloaded: objects/2f/423697bf81fe5956684f66fb6fc6596a1903cc
[+] Downloaded: objects/e3/8d9df9b13e6499b749e36e064ec30f2fa45657
[+] Downloaded: objects/0e/0de07611ada4690fc0ea5b5c04721ba6f3fd0d
[+] Downloaded: objects/66/64f4e548df7591da3728d7662b6376debfce8d

``` 

Once its done , let's check it out using git commands.
 

```bash
 git status
``` 

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1628159716089/mjXTQFDuZ.png)

So these were the files which were not committed yet .Lets enumerate further and see whether we get any other information

```bash
git log
``` 

Running `git log` command gives us these results 

```bash
┌──(shebu㉿kali)-[~/Desktop/thm/git-happens/git]
└─$ git log   
commit d0b3578a628889f38c0affb1b75457146a4678e5 (HEAD -> master, tag: v1.0)
Author: Adam Bertrand <hydragyrum@gmail.com>
Date:   Thu Jul 23 22:22:16 2020 +0000

    Update .gitlab-ci.yml

commit 77aab78e2624ec9400f9ed3f43a6f0c942eeb82d
Author: Hydragyrum <hydragyrum@gmail.com>
Date:   Fri Jul 24 00:21:25 2020 +0200

    add gitlab-ci config to build docker file.

commit 2eb93ac3534155069a8ef59cb25b9c1971d5d199
Author: Hydragyrum <hydragyrum@gmail.com>
Date:   Fri Jul 24 00:08:38 2020 +0200

    setup dockerfile and setup defaults.

commit d6df4000639981d032f628af2b4d03b8eff31213
Author: Hydragyrum <hydragyrum@gmail.com>
Date:   Thu Jul 23 23:42:30 2020 +0200

    Make sure the css is standard-ish!

commit d954a99b96ff11c37a558a5d93ce52d0f3702a7d
Author: Hydragyrum <hydragyrum@gmail.com>
Date:   Thu Jul 23 23:41:12 2020 +0200

    re-obfuscating the code to be really secure!

commit bc8054d9d95854d278359a432b6d97c27e24061d
Author: Hydragyrum <hydragyrum@gmail.com>
Date:   Thu Jul 23 23:37:32 2020 +0200

    Security says obfuscation isn't enough.
    
    They want me to use something called 'SHA-512'

commit e56eaa8e29b589976f33d76bc58a0c4dfb9315b1
Author: Hydragyrum <hydragyrum@gmail.com>
Date:   Thu Jul 23 23:25:52 2020 +0200

    Obfuscated the source code.
    
    Hopefully security will be happy!

commit 395e087334d613d5e423cdf8f7be27196a360459
Author: Hydragyrum <hydragyrum@gmail.com>
Date:   Thu Jul 23 23:17:43 2020 +0200

    Made the login page, boss!

commit 2f423697bf81fe5956684f66fb6fc6596a1903cc
Author: Adam Bertrand <hydragyrum@gmail.com>
Date:   Mon Jul 20 20:46:28 2020 +0000

    Initial commit
(END)

``` 

If you go through the comments of all the commits , one of the comments seem quite interesting .

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1628159885300/BOjbUQyBP.png)

Seems like its the source code of the login page we saw earlier !

Lets view what changes were made during that commit -

```python
git show 395e087334d613d5e423cdf8f7be27196a360459
``` 

After scrolling through the source code, we find this piece of code where there is an insecure login function which contains the username & password of admin 😂

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1628160093356/x5nqTYA6z.png)

Grab the Super Secret Password 🚩  and submit it  ! Yes it's the flag which you want ✔
