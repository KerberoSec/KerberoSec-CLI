INTRO

The organization failed to act despite being alerted by the CERT about compromised usernames and passwords. In response, the CISO employed your team to examine the servers and detect any actual threats, providing a cloned server for the task.

 

TASK 1

Download the cloned server from the link: https://cyberium.s3.eu-central-1.amazonaws.com/Scenarios/PT/PT005B.zipLinks to an external site., import it into your system

1. Create a script to scan the cloned server (exclude your IP)

2. Add to your script, scan the target machine for versions of all the opening ports, saving to an xml file, and using searchsploit to find the vulnerabilities. 

Find at least three 3 CVEs from Exploit-DB
3. Add to your script, print the port number for all ftp services, along with its version

4. Add to your script, enumerate the system and find the OS version

 

TASK 2

(Given the leaked credentials: nate,1234) The FTP service's configuration seems flawed. It enables write permissions, posing a severe vulnerability. Find a way to breach the system and find the contents of the file /etc/passwd
*bonus challenge is given by using the following hints:
exploit multi/handler
payload php/reverse_php
meterpreter > shell
Elevate the session permissions and find the filenames inside the root Desktop directory
*bonus challenge is given through meterpreter using the following hints:
post multi/recon/local_exploit_suggester
exploit linux/local/glibc_ld_audit_dso_load_priv_esc
payload linux/x86/meterpreter/reverse_tcp

Find vulnerabilities to log into the server and crack the passwords of root, and msfadmin.

Expected output:

<img width="553" height="145" alt="image" src="https://github.com/user-attachments/assets/164330b0-4a99-4392-812b-cd2d6da15a3b" />
