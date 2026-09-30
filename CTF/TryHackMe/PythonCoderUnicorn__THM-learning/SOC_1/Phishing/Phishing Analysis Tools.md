#Phishing #Subscribers 

https://tryhackme.com/room/phishingemails3tryoe

Remember from [Phishing Room 1](https://tryhackme.com/room/phishingemails1tryoe); we covered how to manually sift through the email raw source code to extract information.

> [!warning] Warning: 
> The samples throughout this room contain information from actual spam and/or phishing emails. Proceed with caution if you attempt to interact with any IP, domain, attachment, etc.

## what info to collect

In this task, we will outline the steps performed when analyzing a suspicious or malicious email. 

Below is a checklist of the pertinent information an analyst (you) is to collect from the email header:

```
sender email address
L sender IP address 
L reverse lookup of the sender IP
L email subject line
L recipient email address (cc: | bcc: )
L reply to email (if any)
L date/time

email body & attachments
L any URL links
L name of attachment
L hash value of attachment
```

## email header analysis

Some of the pertinent information that we need to collect can be obtained visually from an email client or web client (such as Gmail, Yahoo!, etc.). But some information, such as the sender's IP address and reply-to information, can only be obtained via the email header.

info from email's source code

- Google that can assist us with analyzing email headers called `Messageheader` from the Google Admin Toolbox.
- copy & paste the whole email header > run 
- - **Messageheader**: [https://toolbox.googleapps.com/apps/messageheader/analyzeheader](https://toolbox.googleapps.com/apps/messageheader/analyzeheader)

- **Message Header Analyzer**: [https://mha.azurewebsites.net/](https://mha.azurewebsites.net/)
- [mailheader.org](https://mailheader.org/) 

Even though not covered in the previous Phishing rooms, a Message Transfer Agent (MTA) is software that transfers emails between sender and recipient. Read more about MTAs [here](https://csrc.nist.gov/glossary/term/mail_transfer_agent). Since we're on the subject, read about MUAs (Mail User Agent) [here](https://csrc.nist.gov/glossary/term/mail_user_agent).

The tools below can help you analyze information about the sender's IP address:
- IPinfo.io: [https://ipinfo.io/](https://ipinfo.io/)

- URLScan.io: [https://urlscan.io/](https://urlscan.io/)

- Talos Reputation Center: [https://talosintelligence.com/reputation](https://talosintelligence.com/reputation)

## email body analysis 

Now it's time to direct your focus to the email body. This is where the malicious payload may be delivered to the recipient either as a link or an attachment. 

Links can be extracted manually, either directly from an HTML formatted email or by sifting through the raw email header.

Below is an example of obtaining a link manually from an email by right-clicking the link and choosing **Copy Link Location**.

The same can be accomplished with the assistance of a tool. One tool that can aid us with this task is URL Extractor. 

- URL Extractor: [https://www.convertcsv.com/url-extractor.htm](https://www.convertcsv.com/url-extractor.htm)

You can copy and paste the raw header into the text box for 
**Step 1: Select your input**.
The extracted URLs are visible in **Step 3**.

You may also use [CyberChef](https://gchq.github.io/CyberChef/) to extract URLs with the Extract URLs recipe.

Tip: It's important to note the root domain for the extracted URLs. You will need to perform an analysis on the root domain as well.   

After extracting the URLs, the next step is to check the reputation of the URLs and root domain. You can use any of the tools mentioned in the previous task to aid you with this. 

If the email has an attachment, you'll need to obtain the attachment safely. Accomplishing this is easy in Thunderbird by using the Save button.

After you have obtained the attachment, you can then get its hash. You can check the file's reputation with the hash to see if it's a known malicious document.

There are many tools available to help us with this, but we'll focus on two primarily; they are listed below:

- Talos File Reputation: [https://talosintelligence.com/talos_file_reputation](https://talosintelligence.com/talos_file_reputation)[](https://talosintelligence.com/talos_file_reputation)

Per the [site](https://talosintelligence.com/talos_file_reputation), "_The Cisco Talos Intelligence Group maintains a reputation disposition on billions of files. This reputation system is fed into the AMP, FirePower, ClamAV, and Open-Source Snort product lines. The tool below allows you to do casual lookups against the Talos File Reputation system. This system limits you to one lookup at a time, and is limited to only hash matching. This lookup does not reflect the full capabilities of the Advanced Malware Protection (AMP) system_".

- VirusTotal: [https://www.virustotal.com/gui/](https://www.virustotal.com/gui/)

Per the [site](https://www.virustotal.com/gui/), "Analyze suspicious files and URLs to detect types of malware, automatically share them with the security community."

Another tool/company worth mentioning is [Reversing Labs](https://www.reversinglabs.com/), which also has a [file reputation service](https://register.reversinglabs.com/file_reputation).

```
copy link location
```

## malware sandbox 

Luckily as Defenders, we don't need to have malware analysis skills to dissect and reverse engineer a malicious attachment to understand the malware better. 

There are online tools and services where malicious files can be uploaded and analyzed to better understand what the malware was programmed to do. These services are known as malware sandboxes. 

For instance, we can upload an attachment we obtained from a potentially malicious email and see what URLs it attempts to communicate with, what additional payloads are downloaded to the endpoint, persistence mechanisms, Indicators of Compromise (IOCs), etc. 

Some of these online malware sandboxes are listed below.

- Any.Run: [https://app.any.run/](https://app.any.run/)
- Hybrid Analysis: [https://www.hybrid-analysis.com/](https://www.hybrid-analysis.com/)
- [https://www.joesecurity.org/](https://www.joesecurity.org/)
- 

## PhishTool 

A tool that will help with automated phishing analysis is [PhishTool](https://www.phishtool.com/).

_PhishTool combines threat intelligence, OSINT, email metadata and battle tested auto-analysis pathways into one powerful phishing response platform. Making you and your organization a formidable adversary: immune to phishing campaigns that those with lesser email security capabilities fall victim to._"

Note: There is a free community edition you can download and use. :)

 the PhishTool conveniently grabs all the pertinent information we'll need regarding the email.
- Email sender
- Email recipient (in this case, a long list of CCed email addresses)
- Timestamp
- Originating IP and Reverse DNS lookup

We can obtain information about the SMTP relays, specific X-header information, and IP info information.
the tool notifies us that '**Reply-To no present**' although it provides the alternative header information, **Return-Path**.
PhishTool dashboard, we can see the email body. There are two tabs across the top that we can toggle to view the email in text format or its HTML source code.
The left pane will show information about the attachment. This particular malicious email has a zip file.

We can automatically get feedback from VirusTotal since our community edition API key is connected.
Here we can grab the zip file name and its hashes without manually interacting with the malicious email.

Let's look at the Strings output.
Next, let's look at the information from VirusTotal.

Since the <span style="color:#a0f958">VirusTotal API key is the free community edition</span>, an analyst can manually navigate to VirusTotal and do a file hash search to view more information about this attachment.

The attachment file name and file hashes will be marked as malicious. Next, click on **Resolve**.

**Note**: I didn't perform further analysis on the domain name or the IP address. Neither did I perform any research regarding the root domain the email originated from. The attachment can further be analyzed by uploading it to a malware sandbox to see what exactly it's doing, which I did not do. Hence the reason why additional Flag artifacts and Classifications codes weren't selected for this malicious email. :)

To expand on classification codes briefly, not all phishing emails can be categorized as the same. A classification code allows us to tag a case with a specific code, such as Whaling (high-value target). Not all phishing emails will target a high-value target, such as a Chief Financial Officer (CFO).

```
Look at the Strings output. What is the name of the EXE file?

#454326_PDF.exe
```

## phishing case 1

Scenario: 
You are a Level 1 SOC Analyst. Several suspicious emails have been forwarded to you from other coworkers. You must obtain details from each email for your team to implement the appropriate rules to prevent colleagues from receiving additional spam/phishing emails.   

Task: 
Use the tools discussed throughout this room (or use your own resources) to help you analyze each email header and email body.

- open .eml file with thunderbird
```
What brand was this email tailored to impersonate?
netflix

What is the From email address?

n e t f l i x <JGQ47wazXe1xYVBrkeDg-JOg7ODDQwWdR@JOg7ODDQwWdR-yVkCaBkTNp.gogolecloud.com

What is the originating IP? Defang the IP address.
209[.]85[.]167[.]226

From what you can gather, what do you think will be a domain of interest? Defang the domain.
etekno[.]xyz

What is the shortened URL? Defang the URL.

hxxps[://]t[.]co/yuxfZm8KPg?amp==1

```

## Phishing case 2

**Scenario**: 
You are a Level 1 SOC Analyst. Several suspicious emails have been forwarded to you from other coworkers. You must obtain details from each email for your team to implement the appropriate rules to prevent colleagues from receiving additional spam/phishing emails. 

A malicious attachment from a phishing email inspected in the previous Phishing Room was uploaded to Any Run for analysis.

Task: Investigate the analysis and answer the questions below.   

Link: [https://app.any.run/tasks/8bfd4c58-ec0d-4371-bfeb-52a334b69f59](https://app.any.run/tasks/8bfd4c58-ec0d-4371-bfeb-52a334b69f59)

Text report
```
What does AnyRun classify this email as?
suspicious activity

What is the name of the PDF file?
Payment-updateid.pdf

What is the SHA 256 hash for the PDF file?
CC6F1A04B10BCB168AEEC8D870B97BD7C20FC161E8310B5BCE1AF8ED420E2C24

What two IP addresses are classified as malicious? Defang the IP addresses. (answer: IP_ADDR,IP_ADDR)
2[.]16[.]107[.]24,2[.]16[.]107[.]24

2[.]16[.]107[.]24,2[.]16[.]107[.]83

What Windows process was flagged as **Potentially Bad Traffic**?

svchost.exe

```

## phishing case 3 

Scenario: You are a Level 1 SOC Analyst. Several suspicious emails have been forwarded to you from other coworkers. You must obtain details from each email for your team to implement the appropriate rules to prevent colleagues from receiving additional spam/phishing emails. 

A malicious attachment from a phishing email inspected in the previous Phishing Room was uploaded to Any Run for analysis. 

Task: Investigate the analysis and answer the questions below.   

**Link**: [https://app.any.run/tasks/82d8adc9-38a0-4f0e-a160-48a5e09a6e83](https://app.any.run/tasks/82d8adc9-38a0-4f0e-a160-48a5e09a6e83)

```
What is this analysis classified as?

malicious activity

What is the name of the Excel file?

CBJ200620039539.xlsx

What is the SHA 256 hash for the file?
5F94A66E0CE78D17AFC2DD27FC17B44B3FFC13AC5F42D3AD6A5DCFB36715F3EB

What domains are listed as malicious? Defang the URLs & submit answers in alphabetical order. (answer: **URL1,URL2,URL3**)

biz9holdings[.]com
findresults[.]site
ww38[.]findresults[.]site

biz9holdings[.]com,findresults[.]site,ww38[.]findresults[.]site

What IP addresses are listed as malicious? Defang the IP addresses & submit answers from lowest to highest. (answer: **IP1,IP2,IP3**)

204.11.56.48, 75.2.11.242, 103.224.182.251

75[.]2[.]11[.]242,103[.]224[.]182[.]251,204[.]11[.]56[.]48

What vulnerability does this malicious attachment attempt to exploit?
CVE number
cve-2017-11882

```

Here are a few other tools that we have not covered in detail within this room that deserve a shout:

- [https://mxtoolbox.com/](https://mxtoolbox.com/)
- [https://phishtank.com/?](https://phishtank.com/?)
- [https://www.spamhaus.org/](https://www.spamhaus.org/)[](https://www.spamhaus.org/)

That's all, folks! Happy Hunting!

![[Pasted image 20250315065951.png]]

152 points

