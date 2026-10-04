```
▗▄▄▄▖▄   ▄ ▄    ■     ■  ▗▞▀▚▖ ▄▄▄     ▗▞▀▜▌█  ▐▌   ■  ▐▌   ▗▞▀▚▖▄▄▄▄     ■  ▄ ▗▞▀▘▗▞▀▜▌   ■  ▄  ▄▄▄  ▄▄▄▄  
  █  █ ▄ █ ▄ ▗▄▟▙▄▖▗▄▟▙▄▖▐▛▀▀▘█        ▝▚▄▟▌▀▄▄▞▘▗▄▟▙▄▖▐▌   ▐▛▀▀▘█   █ ▗▄▟▙▄▖▄ ▝▚▄▖▝▚▄▟▌▗▄▟▙▄▖▄ █   █ █   █ 
  █  █▄█▄█ █   ▐▌    ▐▌  ▝▚▄▄▖█                    ▐▌  ▐▛▀▚▖▝▚▄▄▖█   █   ▐▌  █            ▐▌  █ ▀▄▄▄▀ █   █ 
  █        █   ▐▌    ▐▌                            ▐▌  ▐▌ ▐▌             ▐▌  █            ▐▌  █             
               ▐▌    ▐▌                            ▐▌                    ▐▌               ▐▌                                                                                                                         
```
A twitter authentication session has been captured, you have to retrieve the password.
[^1]

Solution
----------------------------------------------------------------------------------------
Upon opening the challenge resource in `wireshark ch3.pcap` we can spot exactly one
intercepted packet which appears to be a HTTP GET request to Twitter as follows. Here,
under credentials, we can already spot the password in plaintext.
```
Frame 1: 518 bytes on wire (4144 bits), 518 bytes captured (4144 bits)
Ethernet II, Src: Apple_94:b1:0e (00:1b:63:94:b1:0e), Dst: Cisco_eb:e0:80 (00:d0:bc:eb:e0:80)
Internet Protocol Version 4, Src: 128.222.228.85 (128.222.228.85), Dst: 128.121.146.100 (128.121.146.100)
Transmission Control Protocol, Src Port: 55872, Dst Port: 80, Seq: 1, Ack: 1, Len: 452
Hypertext Transfer Protocol
    GET /statuses/replies.xml HTTP/1.1\r\n
        [Expert Info (Chat/Sequence): GET /statuses/replies.xml HTTP/1.1\r\n]
        Request Method: GET
        Request URI: /statuses/replies.xml
    <--snip-->
    Accept-Language: en-us\r\n
    Accept-Encoding: gzip, deflate\r\n
    Authorization: Basic dXNlcnRlc3Q6cGFzc3dvcmQ=\r\n
        Credentials: usertest:[REDACTED]
    Connection: keep-alive\r\n
    Host: twitter.com\r\n
    \r\n
    [Full request URI: http://twitter.com/statuses/replies.xml]
    [HTTP request 1/1]
```

[^1]: https://www.root-me.org/en/Challenges/Network/Twitter-authentication-101
