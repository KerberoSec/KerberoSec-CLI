```
▌ ▌▞▀▖▞▀▖     ▙▗▌             ▌ ▌▞▀▖▞▀▖▙▗▌      
▝▞ ▚▄ ▚▄  ▄▄▖ ▌▘▌▞▀▖▙▀▖▙▀▖▌ ▌ ▝▞ ▚▄ ▚▄ ▌▘▌▝▀▖▞▀▘
▞▝▖▖ ▌▖ ▌     ▌ ▌▛▀ ▌  ▌  ▚▄▌ ▞▝▖▖ ▌▖ ▌▌ ▌▞▀▌▝▀▖
▘ ▘▝▀ ▝▀      ▘ ▘▝▀▘▘  ▘  ▗▄▘ ▘ ▘▝▀ ▝▀ ▘ ▘▝▀▘▀▀
```
In this THM room from AoC 2025, we learn about the different types of XSS vulnerabilities
and how to prevent them [^1].

Which type of XSS attack requires payloads to be persisted on the backend?
-----------------------------------------------------------------------------------------
There are mainly two types of XSS attacks. In reflected XSS, victims are targeted
individually, usually via phishing. In *stored* XSS however, the malicious script is
saved on the server, i.e. persistent on the backend.

What's the reflected XSS flag?
-----------------------------------------------------------------------------------------
By reading the introduction to reflected cross-site scripting, we get suspicious of the
URL payload `<script>alert(atob("VEhNe0V2aWxfQnVubnl9"))</script>` to be Base64-encoded.
And indeed, upon using `base64 -d` we find out that the string "VEhNe0V2aWxfQnVubnl9" is
the flag in the reflected XSS attack.

What's the stored XSS flag?
-----------------------------------------------------------------------------------------
The malicious payload for the comment submission as part of the stored XSS example lists
`comment=<script>alert(atob("VEhNe0V2aWxfU3RvcmVkX0VnZ30="))</script>` which raises the
suspicion, that there is a Base64-encoded string once again. This string is indeed the
flag that we want to obtain.

So far, we have not looked at the target machine yet. Upon navigating to the target
machine's IP address, we discover a website send Chrismas wishes and questions to Santa's
Chief Security elf McSkidy. Here, we can print an alert message by exploiting the search
input which is reflected directly without any encoding. The browser therefore interprets
the JavaScript as executable code and an alert box appears to demonstrate the successful
XSS execution.

[^1]: https://tryhackme.com/room/xss-aoc2025-c5j8b1m4t6
