# Pilgrimage: Hack The Box: @lautarovculic

*[Image: Untitled]*

****************Difficult:**************** Easy

****************Release:**************** 24/06/2023

****IP:**** 10.10.11.219

******OS:****** Linux

---

# User.txt

First and as in most HTB machines, we are going to configure the /**etc/hosts** file.

*[Image: Untitled]*

Let's see what **nmap** tells us.

*[Image: Untitled]*

We have port **22** and **80** running.

Let's run **dirb** on the **web address** to see if there are any *interesting directories* while looking at the **content of the web page**.

*[Image: Untitled]*

*[Image: Untitled]*

On the one hand we have the **/.git/ directory** and on the other hand we see that we could try to **upload malicious files**.

Let's use the **git-dump tool** [https://github.com/arthaud/git-dumper](https://github.com/arthaud/git-dumper)

And we will see what **interesting files** the host has.

*[Image: Untitled]*

Let's see what's in the **.php files**.

Testing the file upload, we see that the web uploads the images **to the path** [http://pilgrimage.htb/shrunk/](http://pilgrimage.htb/shrunk/)

After analyzing the files we found a path wherein it is mentioned **magick is used to convert** the images.

*[Image: Untitled]*

**************index.php**************

We find the version of **magick being used**, so we will look for a **suitable exploit**.

*[Image: Untitled]*

I found the following vulnerability, it may work for us.

ImageMagick is vulnerable to information disclosure. *When it parses a PNG image*, the resulting image could have *embedded the content of an arbitrary remote file*.
[https://github.com/Sybil-Scan/imagemagick-lfi-poc](https://github.com/Sybil-Scan/imagemagick-lfi-poc)

*[Image: Untitled]*

Now, we **will upload the exploit.png** and it **will be downloaded** (with the */etc/passwd information we asked for*).

*[Image: Untitled]*

*[Image: Untitled]*

*[Image: Untitled]*

Saved as **output.png**

And with the command **identify -verbose output.png** we will find *the content*, which will be passed to **CyberChef for decoding**.

*[Image: Untitled]*

*[Image: Untitled]*

Nice!!

We found the user "**emily**".

We will **continue to look** for something *interesting in the .php content* we downloaded a few minutes ago.

In the **dashboard.php** file we find a **database PATH**.

*[Image: Untitled]*

Now, we **will generate another image again** but **changing the path** we want to see. In this case it would be:

```bash
python3 [generate.py](http://generate.py/) -f "/var/db/pilgrimage" -o exploit.png
```

*[Image: Untitled]*

*[Image: Untitled]*

We **download the new exploit.png** that we uploaded, we call it **output.png** and with the command **identify** we *extract the content again*.

*[Image: Untitled]*

It is longer than the previous one, we will go through **CyberChef**.

We find next to *our user created in the pilgrimage.htb page* the **user** and **password** of **emily**.

*[Image: Untitled]*

**Username** = emily

**Password** = abigchonkyboi123

We are going to connect **via SSH** with these credentials.

*[Image: Untitled]*

And we get the ****************user.txt**************** flag.

# Root.txt

With **ps -aux** we will see which *processes are running on the machine*.

Using the **ps** command we find that “**/usr/sbin/malwarescan.sh**” this was a script running in the background that uses ***binwalk**.*

*[Image: Untitled]*

The version was **Binwalk v2.3.2**.

Then search to find exploit on binwalk and here what I found:

[https://www.exploit-db.com/exploits/51249](https://www.exploit-db.com/exploits/51249)

Let's download it.

*[Image: Untitled]*

The use of this script is:

```bash
python3 [exploit.py](http://exploit.py/) [-h] file ip port
```

We will use the generated file named **binwalk_exploit.png**

*[Image: Untitled]*

In addition, we will leave **rlwrap listening on port 7777**

*[Image: Untitled]*

To **transfer the exploit** (.png) we are going to raise a **python web server on port 8000**.

*[Image: Untitled]*

And on the other hand, with the vulnerable machine we will download it.

*[Image: Untitled]*

Now on the *victim machine* we **copy the .png** to **/var/www/pilgrimage.htb/shrunk/**

We *wait a moment* and in the *rlwrap connection* we **will have root access**, and we can get **root.txt**

*[Image: Untitled]*

I hope you found it useful (: