# CTF-Write-up

## Try Hack Me: LFI Inclusion

##### URL: https://tryhackme.com/room/inclusion

##### Created by _https://tryhackme.com/p/falconfeast_

![logo](https://user-images.githubusercontent.com/20625004/114392227-281d9780-9ba1-11eb-9f2a-5bff340b7fa9.PNG)

You should deploy the machine first.

Run nmap against the target machine.

```nmap -sC -A <target IP>```

Port 80 web access. 

![site](https://user-images.githubusercontent.com/20625004/114392431-6f0b8d00-9ba1-11eb-925c-ce0ebf4b3e09.PNG)

View the web site to find potential LFI.

http://<Target IP?/article?name=hacking is a good canditate.

![LFI_1](https://user-images.githubusercontent.com/20625004/114393406-a464aa80-9ba2-11eb-8aa7-1a7aa39448aa.PNG)

As the web site states Local File Inclusion vulnerabiltiy occurs, when an application uses the path to a file as input.
An attacker can use LFI to trick the web application into exposing or running files on the web server. 
leading to information disclosure, remote code execution even Cross-site Scripting (XSS) attacks. 

Lets simply add after the ``=`` of the above url path ``../../../../etc/passwd``.

![LFI_payload](https://user-images.githubusercontent.com/20625004/114396032-beec5300-9ba5-11eb-8f32-764b0de8bdb5.PNG)

LFI is working.
Carefully read the ouput of the command there is a user and a password.
Use the given information and access SSH.

![user](https://user-images.githubusercontent.com/20625004/114396312-1b4f7280-9ba6-11eb-8402-d00cce3dc588.PNG)

In the home path you should find the first flag.

Privilege Escalation:

For this we type ``sudo -l`` to check if we can run some command to perform privilege escalation to root.

![sudo](https://user-images.githubusercontent.com/20625004/114397473-674ee700-9ba7-11eb-8fdb-2915adbba1c8.PNG)

Searching on  ``https://gtfobins.github.io/gtfobins/socat/``

![privilege](https://user-images.githubusercontent.com/20625004/114397881-d4fb1300-9ba7-11eb-93a8-7e4f7135236f.PNG)

Lets use it.

![root](https://user-images.githubusercontent.com/20625004/114397963-ec3a0080-9ba7-11eb-90a6-cedbea440aba.PNG)

We have root access, on the root path you can find the second flag.
