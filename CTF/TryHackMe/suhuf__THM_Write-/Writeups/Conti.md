## **Conti Ransomware: TryHackMe Room Write-Up**

**Basic Introduction:**

This is a write-up of the **Conti** challenge on TryHackMe. **Conti** is an infamous commercialized black-hat ransomware, most likely of Russian origin, that is sold by RAAS (Ransomware as a Service) providers and is/was one of the most popular samples used from 2019 to 2022.

In addition to the software itself, which is attributed to multiple different APTs, there was also a group called the Conti Group that used this Ransomware in attacks.

Mitre has an entry detailing the TTPs of this RAAS here: https://attack.mitre.org/software/S0575/  

As a result of the above, this room is going to be mostly post-compromise Malware Analysis covering behavior, TTPs, IOCs, and others.

This challenge is focused on **Splunk** Logs.

## **SITREP**

<img width="1301" height="718" alt="image" src="https://github.com/user-attachments/assets/b9eba922-f6d3-469b-8250-e3d3eabb3607" />

Referenced link: https://www.bleepingcomputer.com/news/security/fbi-cisa-and-nsa-warn-of-escalating-conti-ransomware-attacks/

## **Exchange Server Compromised**

<img width="1304" height="888" alt="image" src="https://github.com/user-attachments/assets/d1abb5e3-0d5a-4bdf-b679-a9a6915c909d" />

**Can you identify the location of the ransomware?**

Let's take a visit to our instance of Splunk and see how many logs we are working with for this investigation:

We go to search and reporting, set the time period to all time, and set the index to main:

<img width="1875" height="712" alt="image" src="https://github.com/user-attachments/assets/140cd2dd-b412-4560-ab77-28e2c1a5d8d2" />

We have nearly 30k events logged, Meaning we are going to have to be smarter about our filtering for this exercise than we were with Volt Typhoon.

Let's also check our hint for our question:

<img width="427" height="178" alt="image" src="https://github.com/user-attachments/assets/fbbb7e56-b4bc-4cdb-8882-92b3c9584515" />

When it comes to analyzing malware, an easy way to spot the source process is by checking for processes that are connected to .Exes. Let's quickly check how many logs we can find for the commandline field that have the .exe extension:

<img width="1883" height="466" alt="image" src="https://github.com/user-attachments/assets/a7149843-c144-45a5-938b-6137eccbb8ac" />

We filter the command line with the * wildcard before .exe, meaning we are including any argument and path that ends with .exe. We end up with 16 logs. Let's check them:

Here, we find the supposed cmd.exe Windows binary in an abnormal area. 

<img width="1560" height="617" alt="image" src="https://github.com/user-attachments/assets/8b69d119-fca4-4fbf-9033-e7305cfa55ce" />

Despite finding this info, we don't have anything just yet that solidifies with certainty that this is from the malware. However, we can see what processes and actions this process is creating to determine if it is the Ransomware or not. 

Let's grab the process ID first: 

<img width="1495" height="532" alt="image" src="https://github.com/user-attachments/assets/fd523c7d-ca23-440a-945a-bf9f45c9276c" />

We find that it is **15540** great, let's apply a filter for all actions that are being spawned from this process ID:

<img width="1455" height="150" alt="image" src="https://github.com/user-attachments/assets/e1672699-c951-4ee4-9885-9778e8d0b70e" />

We see 26 logs, and we see that this process produces the ransomware note we saw earlier:

<img width="1641" height="681" alt="image" src="https://github.com/user-attachments/assets/0084c9e3-b298-415b-a814-fa25f6d6cdcb" />

We can see that the source image is the CMD.exe binary in the Administrator's documents folder. 

Looking further through the logs, we see that it is spawning child processes as well when it is run:

<img width="1503" height="673" alt="image" src="https://github.com/user-attachments/assets/c28d6516-97d5-4452-9a1a-99db57a080c4" />

This means there is a decent chance this is the source binary that starts the malware detonation and spawns multiple different processes. We should take note of this process ID **15540** and set it as a Parent Process filter later.

As for this question, we should provide **C:\Users\Administrator\Documents\cmd.exe** as our answer.

**What is the Sysmon event ID for the related file creation event?** 

We can check the logged event from earlier to grab the Sysmon event ID:

<img width="1508" height="549" alt="image" src="https://github.com/user-attachments/assets/e7b118f2-125d-4766-9023-814d17bd0cb9" />

We can see that it is **11**, so we should provide that.

**Can you find the MD5 hash of the ransomware?**

We find that with our filter in place, there is still a field available called **"hashes"**

<img width="1771" height="664" alt="image" src="https://github.com/user-attachments/assets/05758a54-c23e-43cc-b8a2-6c1bed5c9ba7" />

Let's select this and see what data we can find:

<img width="1601" height="217" alt="image" src="https://github.com/user-attachments/assets/ed482e05-1c74-4d36-99cf-4972a155956c" />

We are able to easily locate the MD5 hash of the ransomware and know it is the right cmd.exe binary due to the process ID filter we applied earlier.

We should provide this as our answer: **290C7DFB01E50CEA9E19DA81A781AF2C**

Let's also check VirusTotal just to see if this is truly malicious or not:

<img width="1653" height="933" alt="image" src="https://github.com/user-attachments/assets/b5984185-1367-4c9f-ad82-90605167de97" />

Link: https://www.virustotal.com/gui/file/53b1c1b2f41a7fc300e97d036e57539453ff82001dd3f6abf07f4896b1f9ca22

(I think it might be malicious)

**What file was saved to multiple folder locations?**

We already checked the logs for this and saw that the **readme.txt** ransom note was being spammed to multiple different directory locations with the previously mentioned process ID we should put **readme.txt** as our answer.

## **Persistence**

**What was the command the attacker used to add a new user to the compromised system?**

Here, we can filter the logs to only include the event ID for a new user getting created and try to find a lead. After doing some research, we can find that the event ID **'4720'** corresponds with the event of a new user being added. Let's apply this filter:

<img width="1776" height="830" alt="image" src="https://github.com/user-attachments/assets/b5a402b1-287d-4536-8d6e-1ac4616fce71" />

We see in the first log that a user named "securityninja" was created. This is a possible lead we can use to find the original command.

Let's look for all events that are within a 5-second range of this event and filter for the string "security ninja"

<img width="1906" height="317" alt="image" src="https://github.com/user-attachments/assets/c53850a0-feee-4233-9c94-ba3172fdd2c3" />

We find 10 events we can sort through, and one is the target:

<img width="1697" height="695" alt="image" src="https://github.com/user-attachments/assets/37ec0958-fdf1-4794-8b79-8d7cc5d3bb7c" />

We should provide: net user /add securityninja hardToHack123$ as our answer here.

**The attacker migrated the process for better persistence. What is the migrated process image (executable), and what is the original process image (executable) when the attacker got on the system?**

This is a bit of a trickier one; let's check for events that match making a remote thread. According to some research and our provided hint, the Event code 8 corresponds to remote threads being created with Sysmon. Let's apply this filter and see what we find.

**index="main" EventCode=8**

<img width="1639" height="601" alt="image" src="https://github.com/user-attachments/assets/6d10c9b2-af1a-4b89-b724-93fcf3d8cb24" />

The earlier event shows the source image and the respective remote thread being created. A PowerShell process is being migrated to an .exe named unsecapp.exe

We also see in the same logs that this exe is accessing lsass.exe, LSASS is used by attackers to dump hashes and credentials from Windows systems:

<img width="1233" height="590" alt="image" src="https://github.com/user-attachments/assets/a5a817c9-a834-4ae9-8dab-c26f1bddd93a" />

We can tell we are now moving into the Final phases of the attack chain.

With this, we can answer two questions: 

**The attacker migrated the process for better persistence. What is the migrated process image (executable), and what is the original process image (executable) when the attacker got on the system?**

Our answer should be: **C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe,C:\Windows\System32\wbem\unsecapp.exe**

**The attacker also retrieved the system hashes. What is the process image used for getting the system hashes?**

And also: **C:\Windows\System32\lsass.exe**

**What is the web shell the exploit deployed to the system?**

Just like Volt Typhoon, since this is explicitly a webshell, we should be looking for specific extensions; examples of common extensions for webshells are: **.asp .aspx .php**.

Let's search for **.aspx** looking for a webshell

<img width="1888" height="802" alt="image" src="https://github.com/user-attachments/assets/6fb432c2-471c-417a-afcb-fe43a1069e5b" />

This time, there are a lot of logs. However, we can see there is 1 event that contains .aspx in the command line field. Let's apply that field as a filter and see what it is:

<img width="1651" height="711" alt="image" src="https://github.com/user-attachments/assets/c2e9593b-b727-48fc-be4c-3064f7d431a2" />

We have found a POST request that is putting a webshell named **i3gfPctK1c2x.aspx** into the auth directory of the webserver, we should provide the full command:

**attrib.exe  -r \\\\win-aoqkg2as2q7.bellybear.local\C$\Program Files\Microsoft\Exchange Server\V15\FrontEnd\HttpProxy\owa\auth\i3gfPctK1c2x.aspx** As our answer.

**What three CVEs did this exploit leverage? Provide the answer in ascending order.**

This question was extremely problematic. Apparently, this question was based on a specific article that was published back in 2019 regarding a specific incident. Due to numerous other more popular incidents occurring and exploiting IIS in similar ways after the article was posted, the exact 3 CVEs requested are nearly impossible to locate through easy means. This challenge is 1.3k Days old as of writing, so as a result, the search results they expect you to get are severely outdated.

To save time and rest, the three CVEs they are referring to are these:

**CVE-2018-13374, CVE-2018-13379, CVE-2020-0796** In that order.

And with that, we have completed our SIEM (Splunk) Analysis of Conti.

