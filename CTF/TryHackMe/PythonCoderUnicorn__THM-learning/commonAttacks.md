
# Common Attacks

This room will discuss some of the most common techniques used by attackers to target people online. It will also teach some of the best ways to prevent the success of each technique.

## Social Engineering "people hacking"

Social Engineering is the term used to describe any cyberattack where a human (rather than a computer) is the target.
Social engineering attacks can become very complex and often result in an attacker gaining significant control over a target's life: both online and offline, are often multi-layered and escalate due to the snowball effect.

- attacker may start off by obtaining a small amount of publicly available information from a victim's social media presence
- get more info like phone number or IP provider
- escalate to get victims bank account

Charismatic hackers calling your phone company and taking possession of your account is one form of social engineering.

- Social engineering is a vast topic, encompassing any attack that relies on tricking humans into giving the attacker access
- other examples include dropping USB storage devices in public
- attackers may leave a "charging cable" plugged into a socket in a public place

In short, the limits to social engineering are at the bounds of an attacker's imagination. A good social engineer can (and will) use a plethora of psychological tricks under any plausible context to "hack" their targets.

protect yourself from Social Engineering attacks:

- set up multiple forms of authentication, and ensure that providers respect these. (difficult to guess security questions)
- NEVER plus external media into computers you care about
- insist on proof of identity when a stranger calles of messages you claiming to work for a company whose services you use
- no legit employee will ever ask for your password or other info that protects you account

Stuxnet

- virus by US gov't & Israel
- self replicates across networks, hard hitting weapon
- usb devices droppped around nuclear weapons development facility
- usb infected Iran nuclear program

the iran  nuclear program

## Phishing

Most common cyber attack by scammers and bad actors who target individuals and businesses.
Phishing is the initial attack vector used to gain access.

Phishing is a sub-section of social engineering, a scammer or other attacker tricks a victim into opening a malicious webpage by sending them a text message, email, or another form of online correspondence.

Phishing messages usually deploy psychological trickery (for example, inducing a false sense of urgency to make victims act rashly) and nearly always involve getting a victim to click on a link to a web application owned by the attacker.

The victim is then often asked to enter sensitive information, the attacker stores this info and the attack is complete.

- general phishing = mass phishing attack, specific to users of some service 
- spearphishing = targeted to individuals or small groups, malicious sites linked
- whaling = specific target of high value individual (CEOs etc) very well crafted attack

1. you are sent email saying it is from "Amazon" and that your account has been used to buy a costly item
2. the email has a link that looks like the real HTTPS Amazon link but taken to attacker's webpage
3. you are asked to enter credentials
4. you get redirected to the real HTTPS Amazon order page
5. attacker will use credentials to purchase items

Attackers use well known websites and clone their design

- look for characters 'royalmai1.co.uk' vs 'royalmail.co.uk' 
- masked domain names [https:/amazon.co.uk](https/ am4zon.co.uk) 

Stay Safe 

- delete unknown or untrusted emails without opening them, report it as spam
- NEVER OPEN ATTACHMENTS from untrusted emails and even trusted emails you were not expecting (spoofed email)
- DO NOT CLICK ON EMBEDDED LINKS, go to the website 
- have updated software
- avoid making email , phone number public , make 'burner' email
- if victim, change passwords immediately 

## malware & ransomware 

malware = malicious software, any software that is designed to perform malicioous actions on behalf of the attacker.
Once installed attackers commonly use malware to steal info, cause damage, or execute arbitrary commands.

- referred to as 'command and control' (C2 / C&C) which connects back to waiting server and allows attacker to control the infected system and using keyloggers

ransomware = malware that is used to infect as many systems as possible, encrypting data on the devices and holding it ransom, if victim pays in Bitcoin the data is "theoretically" returned. it spreads fast, encrypting as much data and when all data is encrypted a window pop appears. 

- ransomware window has prompt stating all data is encrypted, some of data can be decrypted for free, pay up for full decryption, which may or may not delete all of your files

## delivery methods

- social engineering
- phishing attacks
- Micosoft word document with malicious macro embedded in the document , user must enable macros for it to work
- a .exe, pdf, .ps1 (powershell), .bat (batch script), HTML app .hta, .js file

## passwords & authentication

too easy to make an insecure password but this example is good password `@Edinburgh#1988-2000!` the weakness is that 
it is personal to owner of password and can be social engineered. Strive for length, less on complexity but complexity is important. 

Simple password 'Gareth2012', starts with capital letter and ends with number, also social engineering or OSINT would gather who Gareth is and born in 2012.

If username and password are known to the attacker, allowing them to take over your account or perform "credential stuffing" attacks: using your stolen username and password pair against other services to see if you reused them elsewhere.

Local attacks require a stolen copy of the credentials in question. The attacker will take a file full of stolen usernames/emails and hashed passwords, then use software to guess the input that created the hash using a wordlist of possible passwords. 

Remote attacks tend to be one of two categories:

-  involve attempting to brute-force known usernames by sending requests to the server and seeing what it responds 
-  use known username and password pairs from previous breaches to see if they are valid on the target site (credential stuffing)

## multi factor authentication & password managers

You should always activate multi-factor authentication where available. Doing so means that an attacker must obtain more than one factor if they wish to compromise any of your accounts 

SIM Swapping = attacker uses a fake phone number, calls target's provider to switch account number to attacker's and intercepts messages

use password managers and 2FA app for passkey generator

## public network safety 

Public WiFi, whilst incredibly handy, also gives an attacker ideal opportunities to attack other users' devices
or simply intercept and record traffic to steal sensitive information. 

The attacker can quickly set up a network of their own and monitor the traffic of everyone who connects; this is referred to as a "man-in-the-middle" attack and is very easy to carry out.

-  if you were to connect to a network belonging to an attacker then logged into an account for a website that doesn't use an encrypted (HTTPS) connection, the attacker could simply pluck your credentials out of the network traffic and use them to log into your account 

less likely to occur with modern websites which implement Transport Layer Security (TLS) to encrypt traffic between their servers and users as standard.

- The ideal solution to this problem is simply not connecting to untrusted networks. 

Virtual Private Networks (VPNs) encrypt all traffic leaving and re-entering your machine, rendering any interception techniques useless as the intercepted data will simply look like gibberish.

The encrypted connection used to create HTTPS (Hyper Text Transfer Protocol Secure) is referred to as TLS (Transport Layer Security), and in most browsers is represented by a padlock

If you are accessing a website without the padlock symbol, never enter any credentials or sensitive information: especially if you are using an untrusted network.

## backups 

Golden rule: 3,2,1

- you should have 2+ up to date copies of your data ( all copies maintained)
- backups stored on 2+ different storage mediums (cloud, usb, hard drive)
- 1+ backups should be stored offsite

## software updates

When vulnerabilities are discovered in software, the developers usually release special updates called patches that contain a fix for the vulnerability or otherwise "patch" the security issue.
it is imperative that you update software whenever possible: especially for things like operating systems 

software eventually loses support from its maintainers, becoming deprecated and no longer receiving updates
At this point, the software must be replaced as soon as possible.

-  If replacing the software is not possible then the device should be segregated as far as is possible to prevent exploitation of the vulnerabilities

 when new malware is discovered, it gets sent around antivirus vendors who generate a "signature" that identifies this particular piece of malicious software. These signatures are then distributed to every device on the planet that uses the antivirus software, ensuring that your installed antivirus solution is kept up-to-date on all the latest (known) malware.

