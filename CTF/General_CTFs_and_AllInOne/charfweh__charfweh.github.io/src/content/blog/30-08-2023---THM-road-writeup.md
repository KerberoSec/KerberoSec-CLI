---
author: NotCare
pubDatetime: 2023-08-30T07:18:00Z
title: THM: Road Writeup
postSlug: thm-road-writeup
featured: false
draft: false
tags:
  - thm
  - writeup
ogImage: ""
description: Inspired by real world pentensting engagement
---

## Abstract

real world pentesting engagement, the room is all about web server compromise of admin account by resetting the password and gaining initial access. The privesc vector is about internal database services and envrionment variable<br>
before any further ado, lets jump in!

# Table of Contents

# Recon

As always, we'll start off with nmap as our initial reconn to see what ports are open

```bash
sudo nmap -sC -sV -oN road.nmap [IP)
```

## nmap

*[Image: Test]*

- 22 (ssh) is open, cant enumerate further, auth required
- 80 (webserver) a good place to start
- system information: machine is ubuntu and running php

## Enumeration

## webserver (port 80)

Let's check the website
*[Image: Test]*
Lets run gobuster to enumerate directories

## gobuster

```bash
gobuster dir -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt -u http://10.10.165.32/ -o road.gobuster -x html,js
```

*[Image: Test]*

Several interesting directories, lets check phpMyAdmin

## phpmyadmin

*[Image: Test]*

- Default creds dont work
- The error appends `localhost` maybe its exposed to localhost only?

## back to the website

Track order doesnt work
*[Image: Test]*

Scrolling down the page we see a domain `skycouriers.thm` we add that to our etc/hosts
Now, lets check what the merchant page is about.

## merchant page

*[Image: Test]*
we registered with a sample email and logging in we are presented with a merchant dashboard, out of which only edit profile and reset password works
*[Image: Test]*

going to the profile section we see avatar change functionality is only available to admin
*[Image: Test]*
which is a information disclosure, let's take advantage of this
*[Image: Test]*

## admin account compromise

To compromise the admin account, we can leverage the `ResetUser` functionality, the following steps could be taken:

- Log in as normal user
- Go to ResetUser and make sure to intercept the request
- Change the email to admin in burpsuite repeater and forward the request
  *[Image: Test]*

and we can log in as admin
*[Image: Test]*

now my next thought is to get a rev shell somewhere and im thinking its in profile image, i tried different things to know where the image is going, i checked in /assets/img and no luck.
then i went to see the source code and we see a comment linking to a `profileimages`
*[Image: Test]*
so we now know where the image is going, lets upload a reverse shell and get our initial foothold, since its an admin account there's no validation whether its an image or php application.

# Initial foothold

uploading a simple php reverse shell and navigating to /v2/profileimages/{revshell}.php we get a shell
*[Image: Test]*

lets stabilize the shell and look at available shell

```bash
cat /etc/passwd | grep bash
```

*[Image: Test]*
there are two users, now remember phpmyadmin? it errored out saying cant connect to `admin@localhost`, maybe theres a local instance running?

- `ss -alntp`: to see active listening ports

*[Image: Test]*

- now out of these ports 3306 and 33060 is for mysql and 27017 is mongodb

## mysql

lets try mysql command line
*[Image: Test]*

- tried a couple of things but it didnt work

## mongo

- lets try mongodb command line
  *[Image: Test]*
  and were in
- `show dbs`: shows available dbs
  *[Image: Test]*
- `use backup`: uses a db
- `show collections`: shows available collections(sets) in a db
  *[Image: Test]*
- `db.user.find()`: youll get the password for `webdeveloper`

lets ssh in with webdeveloper
*[Image: Test]*
and we get user.txt

## Bonus

Remember mysql? in `lostpassword.php` theres user:pass for mysql and we can use it connect and get the password of `admin@sky.thm`

*[Image: Test]*

Lets select everything from `Users` table
*[Image: Test]*

# Privesc

Usually, my first step for escalating privilege is to check sudo permission, we can do that using <br> `sudo -l` gives us
*[Image: Test]*

interesting bit here is the `LD_PRELOAD` and binary `/usr/bin/sky_backup_utility`

## LD_PRELOAD overview

```markdown
The **_LD_PRELOAD_ trick is a useful technique to influence the linkage of shared libraries and the resolution of symbols (functions) at runtime.** To explain _LD_PRELOAD_, let’s first discuss a bit about libraries in the Linux system.

In brief, a library is a collection of compiled functions. We can make use of these functions in our programs without rewriting the same functionality. This can be achieved by either including the library code in our program ([static library)(https://en.wikipedia.org/wiki/Static_library)) or by linking dynamically at runtime ([shared library)(https://en.wikipedia.org/wiki/Library_(computing)#Shared_libraries)).

Using static libraries, we can build standalone programs. On the other hand, programs built with a shared library require runtime linker/loader support. For this reason, **before executing a program, all required symbols are loaded and the program is prepared for execution**.
```

so basically, its loading any linker/loader `.so` that is available before executing the backup

## LD_PRELOAD privesc

- going to /tmp and saving our exploit
  *[Image: Test]*
- compile it
  *[Image: Test]*
- run it
  *[Image: Test]*

# Beyond root

## Source Code analysis

- Admin Password Change vulnerability
  Looking at `lostpassword.php` we see where the flaw is.

```php
if(isset($_POST['send'))){
        $username = $_POST['uname');
        $password = $_POST['npass');
        $c_password = $_POST['cpass');
        $sql = "UPDATE Users SET password = '$password' WHERE username = '$username'";
        $query = mysqli_query($con, $sql);
        $row = mysqli_num_rows($query);
                if($password == $c_password){
                        echo "Password changed. \nTaking you back...";
                        header('refresh:3;url=ResetUser.php');
                }else{
                        echo "Password change unsuccessful. \nTaking you back...";
                        header('refresh:3;url=ResetUser.php');
                }
}else{
        echo "Internal Server Error*[Image: Test]*)){
        if ($_COOKIE['cu')=='1'){
                $file_name = $_FILES['pimage')['name');
                $file_type = $_FILES['pimage')['type');
                $file_size = $_FILES['pimage')['size');
                $file_temp_loc = $_FILES['pimage')['tmp_name');
                $file_store = "profileimages/".$file_name;
                if (move_uploaded_file($file_temp_loc, $file_store))
                {
                        echo "Image saved.";
                }
                else
                {
                        echo "Image cannot be uploaded![Test](/assets/road_ss/
                }
        }
}
```

Again, theres no sanization and validation whatsover, it doesnt check if its an image or malicious php file.

Thanks for reading!

# reference links

- https://systemweakness.com/linux-privilege-escalation-with-ld-preload-sudo-a13e0b755ede
- https://www.hackingarticles.in/linux-privilege-escalation-using-ld_preload/
