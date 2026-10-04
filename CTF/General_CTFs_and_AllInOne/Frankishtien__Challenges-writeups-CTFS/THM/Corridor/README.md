# TryHackMe Corridor Writeup

## nmap scan

```
nmap -sCV 10.10.216.138
```

```
Starting Nmap 7.95 ( https://nmap.org ) at 2025-07-04 23:19 EDT
Nmap scan report for 10.10.216.138
Host is up (0.26s latency).
Not shown: 999 closed tcp ports (reset)
PORT   STATE SERVICE VERSION
80/tcp open  http    Werkzeug httpd 2.0.3 (Python 3.10.2)
|_http-title: Corridor

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 11.36 seconds
```

![image](https://github.com/user-attachments/assets/ed55518e-e0d5-4e8b-bf98-37bb19dc1ad7)

i notise a nice thing if you click the door you will enter the room 😅

![image](https://github.com/user-attachments/assets/b184ec85-d70f-4615-bb2a-d0ee44e5a5e5)

notice in url something like encrptyed endpoint 

```
http://10.10.216.138/c9f0f895fb98ab9159f51fd0297e236d
```

![image](https://github.com/user-attachments/assets/3901ab1c-b478-4ba1-adfb-e14ee8734681)

```
c4ca4238a0b923820dcc509a6f75849b == 1
c81e728d9d4c2f636f067f89cc14862c == 2
eccbc87e4b5ce2fe28308fd9f2a7baf3 == 3
a87ff679a2f3e71d9181a67b7542122c == 4
e4da3b7fbbce2345d7772b0674a318d5 == 5
1679091c5a880faf6fb5e6087eb1b2dc == 6
8f14e45fceea167a5a36dedd4bea2543 == 7
c9f0f895fb98ab9159f51fd0297e236d == 8
45c48cce2e2d7fbdea1afc51c7c6ad26 == 9
d3d9446802a44259755d38e6d163e820 == 10
6512bd43d9caa6e02c990b0a82652dca == 11
c20ad4d76fe97759aa27a0c99bff6710 == 12
c51ce410c124a10e0db5e4b97fc2af39 == 13

```

i encrypt ``0`` to ``MD5``

```
http://10.10.216.138/cfcd208495d565ef66e7dff9f98764da
```

![image](https://github.com/user-attachments/assets/c248f122-10ff-4b3b-8337-c7690edd2f38)

```
flag{2477ef02448ad9156661ac40a6b8862e} 
```

