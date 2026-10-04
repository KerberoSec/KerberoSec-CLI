## Three HackTheBox
#### Short Bio
Cool room if you are tring to get into cloud security. This room will teach you basic of `AWS` and how you can use it to list out directories and upload them.

**`Skills:`**
- awscli
- ffuf
- vHost
- nmap

---
#### Step `Uno`: Recon and others
First I will run Nmap:
```bash
sudo nmap -A -sV --privileged -T4 10.129.123.43 -p- -O -sC -v | tee -a nmap.md
```
**`Result`**

|PORT|STATE|SERVICE|VERSION|
|---|---|---|---|
|22/tcp|open|ssh|OpenSSH 7.6p1 Ubuntu 4ubuntu0.7 (Ubuntu Linux; protocol 2.0)|
|80/tcp|open|http|Apache httpd 2.4.29 ((Ubuntu))|

We have 2 ports open and we got an apache server.

**`Wappalyzer`** says we have:
- ubuntu
- apache
- php
- hypercorn

As this is a `S3` box, we will try to get into vertual host. In the beginning we've seen one called `s3.thetoppers.htb`. 

You can discover virutal hosts using **FFUF**:
```bash
ffuf -u http://10.129.123.43/ -H "HOST: FUZZ.thetoppers.htb" -w ~/custom-wl/sub-permutation/n0kovo_subdomains/n0kovo_subdomains_tiny.txt -v -r -c -mc 404 -fs 11952
```
there is a cool article about it:
- [Medium](https://medium.com/r3d-buck3t/virtual-host-enumeration-for-uncovering-hidden-subdomains-e800625c2b8f)
- [I've downloaded it](./vhost_enum.html)

>> You might wondering why I've added `-mc 404`. Well sometimes a valid vHost might return 404 and **FFUF** by default filters 404.

Now let's **Fuzz** this subdomain. I've fuzzed the original one but got nothing.

But in the subdomain, I've got some interesting files.

|Path/ Dir|Stat|content|
|---|---|---|
|graph|405| Json|
|?wsdl|200| XML|
|health|200| Json with bunch of info|
|?view=log|200| XML|

Let's get into it.
>> Note Here: I had to look at the write up since I have absolute zer0 knowledge about aws.

#### Getting in: a basic way to `AWS`
since our main domain doesn't have much things to offer, we will get to our `s3` domain. This domain is actually an `aws bucket`. **`Buckets`** contains necessary files for the websites to run and if not maintained properly, hacker might get unauthorized access.

Well we have unauthorized access here. To access this bucket we need `aws` cli command.

First we have to install this and the installation guide can be found on [their site](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)

After that we have to configure the `aws` but if you don't have creadit card like me and stuck in the middle. then just use random creds. **Why?** some sever doesn't check if the person accessing their bucket is authenticated or not. 

command for that = `aws configure`

Then we can view the files in the bucket. But don't forget to add it into your `/etc/hosts` file otherwise it will give you error.

```bash
aws --endpoint=http://s3.thetoppers.htb/ s3 ls s3://thetoppers.htb/
```
this will give you all the available files in the directry of our main domain.

But it doesn't stop there. You can also upload files via `awscli`.

As our server running on PHP, why not upload a small shell to execute command?! Cause that's exactly what we are about to do.
```bash
aws --endpoint=http://s3.thetoppers.htb/ s3 cp ourShell.php s3://thetoppers.htb/
```
Now we will visit the main domain and view our shell to get flag.

