#Phishing #Subscribers 

https://tryhackme.com/room/phishingemails5fgjlzxc

A Sales Executive at Greenholt PLC received an email that he didn't expect to receive from a customer. He claims that the customer never uses generic greetings such as "Good day" and didn't expect any amount of money to be transferred to his account. The email also contains an attachment that he never requested. He forwarded the email to the SOC (Security Operations Center) department for further investigation.   

Investigate the email sample to determine if it is legitimate.

```
challenge.eml > right click > open with thunderbird mail > open

```

```
What is the **Transfer Reference Number** listed in the email's **Subject**?
Transfer Reference Number:(09674321)

Who is the email from?
Mr. James Jackson <info@mutawamarine.com>

What is his email address?
info@mutawamarine.com

What email address will receive a reply to this email?
Mr. James Jackson <info.mutawamarine@mail.com>

What is the Originating IP?

Received: from hwsrv-737338.hostwindsdns.com [192.119.71.157]

Who is the owner of the Originating IP? (Do not include the "." in your answer.)

mxtoolbox.com > reverse lookup > 192.119.71.157
Hostwinds LLC

What is the SPF record for the Return-Path domain?

mxtoolbox.com > SPF record > mutawamarine.com
v=spf1 include:spf.protection.outlook.com -all

What is the DMARC record for the Return-Path domain?

mutawamarine.com > DMARC
v=DMARC1; p=quarantine; fo=1

What is the name of the attachment?

SWT_#09674321____PDF__.CAB

What is the SHA256 hash of the file attachment?

download file
sha256sum SWT
2e91c533615a9bb8929ac4bb76707b2444597ce063d84a4b33525e25074fff3f

What is the attachments file size? (Don't forget to add "KB" to your answer, **NUM KB**)

virustotal = malicious
400.26 KB

What is the actual file extension of the attachment?

RAR

```

