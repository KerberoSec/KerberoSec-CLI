#Phishing 
https://tryhackme.com/room/phishingyl

This room will take you through what phishing is, how it's performed, some valuable tools and why it's an essential part of a Red Team engagement.

## intro to phishing attacks

Before you learn what phishing is, you'll need to understand the term social engineering. 

> [!info] Social engineering 
> is the psychological manipulation of people into performing or divulging information by exploiting weaknesses in human nature. These "weaknesses" can be curiosity, jealously, greed and even kindness and the willingness to help someone. 

> [!info] Phishing 
> is a source of social engineering delivered through email to trick someone into either revealing personal information, credentials or even executing malicious code on their computer.

These emails will usually appear to come from a trusted source, whether that's a person or a business. They include content that tries to tempt or trick people into downloading software, opening attachments, or following links to a bogus website.

Spear-phishing is an effective form of phishing for a red team engagement as they are bespoke to the target it makes them hard to detect by technology such as spam filters, antivirus and firewalls.

example scenario: employee tricked into revealing their credentials
```
1. attacker locates physical location of target business
2. attacker looks for enarby food supplier  "Ultimate Cookies"
3. attacker register the domain ultimate-cookies.thm
4. attacker crafts email for target, offering free cookies if they sign up for website (trust based on local company)
5. target clicks on link in email to fake website, victim uses password
6. attacker has target email and password , can now log into victim's company email
```

```
What type of psychological manipulation is phishing part of?
social engineering

What type of phishing campaign do red teams get involved in?

spear-phishing
```

## writing convincing phishing emails

We have three things to work with regarding phishing emails: the sender's email address, the subject and the content.

**The Senders Address:**

Ideally, the sender's address would be from a domain name that spoofs a significant brand, a known contact, or a coworker. See the Choosing A Phishing Domain task below for more information on this.

To find what brands or people a victim interacts with, you can employ OSINT (Open Source Intelligence) tactics. For example:

- Observe their social media account for any brands or friends they talk to.
- Searching Google for the victim's name and rough location for any reviews the victim may have left about local businesses or brands.
- Looking at the victim's business website to find suppliers.
- Looking at LinkedIn to find coworkers of the victim.

**The Subject:**

You should set the subject to something quite urgent, worrying, or piques the victim's curiosity, so they do not ignore it and act on it quickly.

Examples of this could be:

1. Your account has been compromised.
2. Your package has been dispatched/shipped.
3. Staff payroll information (do not forward!)
4. Your photos have been published.

**The Content:**

If impersonating a brand or supplier, it would be pertinent to research their standard email templates and branding (style, logo's images, signoffs etc.) and make your content look the same as theirs, so the victim doesn't expect anything. 

If impersonating a contact or coworker, it could be beneficial to contact them; first, they may have some branding in their template, have a particular email signature or even something small such as how they refer to themselves, for example, someone might have the name Dorothy and their email is ` dorothy@company.thm `. Still, in their signature, it might say "Best Regards, Dot". 

Learning these somewhat small things can sometimes have quite dramatic psychological effects on the victim and convince them more to open and act on the email.

If you've set up a spoof website to harvest data or distribute malware, the links to this should be disguised using the **[anchor text](https://en.wikipedia.org/wiki/Anchor_text)** and changing it either to some text which says "Click Here" or changing it to a correct looking link that reflects the business you are spoofing, for example:

```
<a href="http://spoofsite.thm">Click Here</a>
<a href="http://spoofsite.thm">https://onlinebank.thm</a>
```

```
What tactic can be used to find brands or people a victim interacts with?

OSINT

What should be changed on an HTML anchor tag to disguise a link?

anchor text
```

## phishing infrastructure

A certain amount of infrastructure will need to be put in place to launch a successful phishing campaign.

```
Domain Name:

	You'll need to register either an authentic-looking domain name or one that mimics the identity of another domain. See task 5 for details on how to create the perfect domain name.

SSL/TLS Certificates:

	Creating SSL/TLS certificates for your chosen domain name will add an extra layer of authenticity to the attack.

Email Server/Account:

	You'll need to either set up an email server or register with an SMTP email provider.

DNS Records:

	Setting up DNS Records such as SPF, DKIM, DMARC will improve the deliverability of your emails and make sure they're getting into the inbox rather than the spam folder.

Web Server:

	You'll need to set up webservers or purchase web hosting from a company to host your phishing websites. Adding SSL/TLS to the websites will give them an extra layer of authenticity.

Analytics:

	When a phishing campaign is part of a red team engagement, keeping analytics information is more important. You'll need something to keep track of the emails that have been sent, opened or clicked. You'll also need to combine it with information from your phishing websites for which users have supplied personal information or downloaded software.

## Automation And Useful Software:

GoPhish - (Open-Source Phishing Framework) 

- https://getgophish.com/

	GoPhish is a web-based framework to make setting up phishing campaigns more straightforward. GoPhish allows you to store your SMTP server settings for sending emails, has a web-based tool for creating email templates using a simple WYSIWYG (What You See Is What You Get) editor. You can also schedule when emails are sent and have an analytics dashboard that shows how many emails have been sent, opened or clicked.

SET - (Social Engineering Toolkit) - [trustedsec.com](https://www.trustedsec.com/tools/the-social-engineer-toolkit-set/)  

	The Social Engineering Toolkit contains a multitude of tools, but some of the important ones for phishing are the ability to create spear-phishing attacks and deploy fake versions of common websites to trick victims into entering their credentials.

```

```
What part of a red team infrastructure can make a website look more authentic?
SSL/TLS Certificates

What protocol has TXT records that can improve email deliverability?
DNS

What tool can automate a phishing campaign and include analytics?
GoPhish

```

## using GoPhish 🐟

This task will take you through setting up GoPhish, sending a phishing campaign and capturing user credentials from a spoof website.

[https://LAB_WEB_URL.p.thmlabs.com:8443] 

```
admin : tryhackme
```

### sending profiles

- connection details required to send your Phishing emails (SMTP server) 
- click on Sending Profiles link > New Profile
- `Name: Local Server `
- `From: noreply@redteam.thm `
- `Host: 127.0.0.1:25 `
- save profile 

### Landing Pages 

the website the Phishing email to direct victim to 
- click Landing Pages > New Page 
- name ` ACME Login `  > Source > paste in HTML

```html
<!DOCTYPE html>  
<html lang="en">  
<head>  
    <meta charset="UTF-8">  
    <title>ACME IT SUPPORT - Admin Panel</title>  
    <style>        body { font-family: "Ubuntu", monospace; text-align: center }  
        div.login-form { margin:auto; width:300px; border:1px solid #ececec; padding:10px;text-align: left;font-size:13px;}  
        div.login-form div input { margin-bottom:7px;}  
        div.login-form input { width:280px;}  
        div.login-form div:last-child { text-align: center; }  
        div.login-form div:last-child input { width:100px;}  
    </style>  
</head>  
<body>  
    <h2>ACME IT SUPPORT</h2>  
    <h3>Admin Panel</h3>  
    <form method="post">  
        <div class="login-form">  
            <div>Username:</div>  
            <div><input name="username"></div>  
            <div>Password:</div>  
            <div><input type="password" name="password"></div>  
            <div><input type="submit" value="Login"></div>  
        </div>    </form></body>  
</html>
```

- click Source again
- see login box username , password 
- click Capture Submitted Data
- click Capture Passwords
- Save Page

### Email Templates 

This is the design and content of the email you're going to actually send to the victim; it will need to be persuasive and contain a link to your landing page to enable us to capture the victim's username and password.

- click Email Template > New Template
- name: ` Email 1 `
- subject: `New Message Received `
- click HTML tab > [ Source ]> HTML editor mode 
- contents: write email

```
Hello,
You've received a new message, please log in to the admin portal to view it [ https://admin.acmeitsupport.thm ](link).
Many Thanks
Online Team
```

```
# Link 
Display Text
[ https://admin.acmeitsupport.thm ]

Protocol
<other> 🔽

URL
{{.URL }}
```
- Save Template

### Users and Groups

This is where we can store the email addresses of our intended targets.

- click Users & Groups > click [New Group]
- name: ` Targets ` 

```
martin@acmeitsupport.thm  
brian@acmeitsupport.thm  
accounts@acmeitsupport.thm
```

- Save Template 

### Campaigns

- click Campaigns > [New Campaign]

```
Name: Campaign One
Email Template: Email 1
Landing Page: ACME Login
URL: http://machine_IP
Launch Date: (2 days ago)
Sending Profile: Local Server
Groups: Targets
```
- Launch Campaign > Are you Sure ? > Launch 🚀

### Results 

The results page gives us an idea of how the phishing campaign is performing by letting us know how many emails have been delivered, opened, clicked and how many users have submitted data to our spoof website.

- Martin  Email Sent ✅
- Brian    Email Sent ✅ > [Submitted Data]
- accounts `Error`  > address rejected 

```
What is the password for Brian?

p4$$w0rd!
```

## Droppers 

Droppers are software that phishing victims tend to be tricked into downloading and running on their system. The dropper may advertise itself as something useful or legitimate such as a codec to view a certain video or software to open a specific file.

The droppers are not usually malicious themselves, so they tend to pass antivirus checks. Once installed, the intended malware is either unpacked or downloaded from a server and installed onto the victim's computer. The malicious software usually connects back to the attacker's infrastructure. The attacker can take control of the victim's computer, which can further explore and exploit the local network.

## choosing a phishing domain 

Choosing the right <span style="color:#a0f958">Phishing domain </span>to launch your attack from is <span style="color:#a0f958">essential</span> to ensure you have the psychological edge over your target. A red team engagement can use some of the below methods for choosing the perfect domain name.

```
Expired Domains:

Although not essential, buying a domain name with some history may lead to better scoring of your domain when it comes to spam filters. Spam filters have a tendency to not trust brand new domain names compared to ones with some history.

Typosquatting:

Typosquatting is when a registered domain looks very similar to the target domain you're trying to impersonate. Here are some of the common methods:

	Misspelling:                     goggle.com Vs google.com
	Additional Period:              go.ogle.com Vs google.com
	Switching numbers for letters:   g00gle.com Vs google.com
	Phrasing:                       googles.com Vs google.com
	Additional Word:          googleresults.com Vs google.com

TLD Alternatives:

A TLD (Top Level Domain) is the .com .net .co.uk .org .gov e.t.c part of a domain name, there are 100's of variants of TLD's now. A common trick for choosing a domain would be to use the same name but with a different TLD. For example, register tryhackme.co.uk to impersonate tryhackme.com.

IDN Homograph Attack/Script Spoofing:

Originally domain names were made up of Latin characters a-z and 0-9, but in 1998, IDN (internationalized domain name) was implemented to support language-specific script or alphabet from other languages such as Arabic, Chinese, Cyrillic, Hebrew and more. 

An issue that arises from the IDN implementation is that different letters from different languages can actually appear identical. 

For example, Unicode character U+0430 (Cyrillic small letter a) looks identical to Unicode character U+0061 (Latin small letter a) used in English, enabling attackers to register a domain name that looks almost identical to another.

>>> print("\u0430")
а
>>> print("\u0061")
a

```

## Using MS Office in Phishing 

Often during phishing campaigns, a Microsoft Office document (typically Word, Excel or PowerPoint) will be included as an attachment. Office documents can contain macros; macros do have a legitimate use but can also be used to run computer commands that can cause malware to be installed onto the victim's computer or connect back to an attacker's network and allow the attacker to take control of the victim's computer.

> [!info] Scenario
> A staff member working for Acme IT Support receives an email from human resources with an excel spreadsheet called "Staff_Salaries.xlsx" intended to go to the boss but somehow ended up in the staff members inbox instead.

What really happened was that an attacker spoofed the human resources email address and crafted a psychologically tempting email perfectly aimed to tempt the staff member into opening the attachment.

Once the staff member opened the attachment and enabled the macros, their computer was compromised.

## Using browser exploits 

Another method of gaining control over a victim's computer could be through browser exploits; this is when there is a vulnerability against a browser itself which allows the attacker to run remote commands on the victim's computer.

Browser exploits aren't usually a common path to follow in a red team engagement unless you have prior knowledge of old technology being used on-site. Many browsers are kept up to date, hard to exploit due to how browsers are developed, and the exploits are often worth a lot of money if reported back to the developers.

That being said, it can happen, and as previously mentioned, it could be used to target old technologies on-site because possibly the browser software cannot be updated due to incompatibility with commercial software/hardware, which can happen quite often in big institutions such as education, government and especially health care.

```
the victim would receive an email
visit a particular website set up by the attacker
victim is on the site, the exploit works against the browser
attacker can perform any commands they wish on the victim's computer.
```

- An example of this is [CVE-2021-40444](https://msrc.microsoft.com/update-guide/vulnerability/CVE-2021-40444) from September 2021, which is a vulnerability found in Microsoft systems that allowed the execution of code just from visiting a website.

## Phishing practical 

Now that you've learnt what goes into a phishing email campaign, let's see if you're able to spot them!

Examine each email, including where it's from, its links and attachments and decide whether you think the email is safe or not

```
What is the flag from the challenge?
THM{I_CAUGHT_ALL_THE_PHISH}
```

