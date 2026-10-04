- https://tryhackme.com/room/burpsuitebasics

#BurpSuite 

Burp Suite is a Java-based framework designed to serve as a comprehensive solution for conducting web application penetration testing.

Burp Suite captures and enables manipulation of all the HTTP/HTTPS traffic between a browser and a web server.

-  web and mobile applications

Burp Suite Community features
- Proxy = interception and modification of requests & responses
- Repeater = captures , modifies and resends same request multiple times, useful for SQL payloads
- Intruder = allows for spraying endpoints with requests (brute force attacks, fuzzing) 
- Decoder = decodes captured info or encodes payloads before sending  to target
- Comparer = compares 2 data either word or byte level
- Sequencer = assess the randomness of tokens, session cookies or other data

BurpSuite dashboard
- Tasks = allows you to define background tasks
- Event Log = history of action performed 
- Issue activity = only for professional version does this matter
- advisory = detailed info about ID'd vulns 

SHORTCUTS
- `CTRL + SHIFT + D` dashboard
- `CTRL + SHIFT + T` target tab
- `CTRL + SHIFT + P` proxy tab
- `CTRL + SHIFT + I` intruder tab
- `CTRL + SHIFT + R ` repeater tab

Sessions has Cookie jar: stores all cookies issued by websites 
updates are found under Suite search
hotkeys is where you change keybindings shortcuts

---

BURP PROXY
captures user and target web server, captured traffic can be manipulated 

Intercepting Requests:
- requests are held from reaching target server and show in Proxy tab (then can drop, edit , send)
- `intercept is on` toggle on/off 

Match and Replace: 
The "Match and Replace" section in the **Proxy settings** enables the use of regular expressions (regex) to modify incoming and outgoing requests. This feature allows for dynamic changes, such as modifying the user agent or manipulating cookies.

---

FoxyProxy browser extension

Add+ 
- Title BurpSuite
- Proxy IP: `127.0.0.1`
- Port: `8080`
- save 
- BurpSuite has to be running `intercept is on` > Foxy proxy > Burp > go to website (website will hang but proxy will load) 
- right click on any request allows further actions 

` 10.10.114.159 `

Target tab
- Site map = map of the web app in a tree structure, useful for API endpoints
- Issue definitions = list of vulnerabilities the scanner looks for , a resource
- Scope settings = control the target in scope, include or exclude specific domains/ IPs to define the scope of our testing (capture only traffic you need)

in browser with Foxy proxy on `http://10.10.114.159`
Target > Site map
```
http://10.10.114.159
L /
L /5yjR2GLcoGoij2ZK  
L /about/
L /assets/
L /contact/
L /products/
L /ticket/
```

- click on a button or 2, Proxy > Intercept > Forward ( a few times )
- `/5yjR2GLcoGoij2ZK`   this appears after clicking on buttons
- Repeater shows ` THM{NmNlZTliNGE1MWU1ZTQzMzgzNmFiNWVk} `

---
if you are running Burp Suite on Linux as the root user
you may encounter an error preventing the Burp Browser from starting due to the inability to create a sandbox environment.
- Settings > Tools > Burp Browser > check all Burp's browser to run without a sandbox (be cautious!)
----

Scoping
- Target > Site map
- `https://tryhackme.com` right click > add to scope > yes
- Proxy tab > settings > Request interception rules: check `And URL is in target scope` 

Proxying HTTPS
- when going to a HTTPS domain may get an error regarding Portswigger Certificate Authority is not authorized to secure the connection
- in browser `http://burp/cert` which downloads `cacert.der` 
- Firefox settings > search `certificates` > view certificates > import downloaded certificate > Trust the CA > ok

EXAMPLE ATTACK
- `10.10.114.159/ticket`
- Support contact form `email` and `text box`
- Try typing: ` <script>alert("Succ3ssful XSS")</script> `, into the "Contact Email" field.

bypass a filter
- Proxy is on 
- in the browser enter data `fake@email.com` and `attack!`
- Burp suite Proxy > Intercept shows email and content entered (request is being held) 
- now we can edit email to have SQL injection

```
POST /ticket/ HTTP/1.1
Host: 10.10.114.159
Content-Type: application/x-www-form-urlencoded
...
email=fake%40email.com&content=attack

~~~~ change email to the SQL injection
email=<script>alert("Succ3ssful XSS")</script>&content=attack

--Forward x3 = pop up!
```

then you get a pop up `Succ3ssful XSS`

