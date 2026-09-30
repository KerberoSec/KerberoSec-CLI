## Manipulating WebSocket messages to exploit vulnerabilities
[Manipulating WebSocket messages to exploit vulnerabilities](https://portswigger.net/web-security/websockets/lab-manipulating-messages-to-exploit-vulnerabilities)

Write-up:

1. Using Caido to intercept a message sent in live chat allows us to use XSS: 
`{"message":""}`. This solves the lab.

## Manipulating the WebSocket handshake to exploit vulnerabilities
[Manipulating the WebSocket handshake to exploit vulnerabilities](https://portswigger.net/web-security/websockets/lab-manipulating-handshake-to-exploit-vulnerabilities)

Write-up:

1. Attempting the same solution as in the previous lab shows that our attack has been blocked.
After seeing the hint provided, I added the `X-Forwarded-For: 1.1.1.1` header to the
`/chat` request (WebSocket Handshake), which spoofs our IP address using Cloudflare's 
DNS Resolver and allows us to reconnect.

2. Attempting an obfuscated XSS payload solves the lab:

    ```html
    
    ```

### Note: Missing CSRF lab