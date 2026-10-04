1. open the pcap file on wireshark
2. go to Statistics > Conversations > IPv4 tab.
*[Image: alt text]*
- look at the first item 'Address A' it has `66.66.66.66` which is illuminati idk
*[Image: alt text]*
3. right click the item > Apply as Filter > Selected > Filter on stream id
*[Image: alt text]*
4. close the window. note: the search thingy inow has `ip.stream eq 3` on it. <br>which could have saved u some time if u just put it there but oh welp.
*[Image: alt text]*
5. going to each list item heres what i found<br>u can copy it by right clicking the text and selecting `...as ASCII Text`
*[Image: alt text]*
- item 1
```
E@4=BBBB
DEBUG_INFO: UfMmILf40ANQcXfGSljmgFriMh+K+YsObBUEsFFYiYVW4VkEsfqCRHljDOdTWuLFTZZYRpz49QRRbwDtY3PmgE7NBE0=
```
- item 2
```
E@3BBBBPP NHTTP/1.1 200 OK
X-App-Auth: NLLu3Q0J06

    <html><body><h1>HA-HA-HA JAKE!</h1>
    <p>Your PC is now a zombie. I have encrypted your soul.</p>
    <p>The key to your freedom is scattered in the wind.</p>
    </body></html>
    
```
- item 3
```
E[@4aBBBBPP dUHTTP/1.1 404 Not Found
Server-Token: BBx6w9Q==
```
7. typing `ip.stream eq 2` on the search thingy only show 1 item.
```
E@&h)PP <!HTTP/1.1 200 OK
X-Session-ID: AKdgd
Content-Type: application/octet-stream

[DJ_APP_BINARY_DATA]
```
8. we combine every header i.e `X-Session-ID`, `X-App-Auth` and `Server-Token` because i notice it ends in `=` which is base 64.<br>except debug_info because it kinda looks different it has its own `=` at the end.
```
UfMmILf40ANQcXfGSljmgFriMh+K+YsObBUEsFFYiYVW4VkEsfqCRHljDOdTWuLFTZZYRpz49QRRbwDtY3PmgE7NBE0=

AKdgdNLLu3Q0J06BBx6w9Q==
```

9. i tried aes and rc4 ciphers it doesnt work. but xor does work so..
```
python xor_test.py
```
