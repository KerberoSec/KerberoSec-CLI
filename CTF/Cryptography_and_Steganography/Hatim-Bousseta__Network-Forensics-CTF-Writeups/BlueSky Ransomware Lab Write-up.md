# 🛡️ BlueSky Ransomware Lab Write-up

The **BlueSky Ransomware Lab** focuses on analyzing a ransomware intrusion through captured **network traffic** and **host event logs**.  
The goal is to **reconstruct the attack**, identify the attacker’s activity, and map it to the **MITRE ATT&CK framework**.  
Combines **network forensics** and **host-based investigation** to understand the infection chain, persistence mechanisms, and data exfiltration.

🔗 [Challenge Link](https://cyberdefenders.org/blueteam-ctf-challenges/bluesky-ransomware/)

---

## Scenario

A high-profile corporation that manages critical data and services across diverse industries has reported a **significant security incident**.  
Recently, their network has been impacted by a **suspected ransomware attack**. Key files have been encrypted, causing disruptions and raising concerns about potential data compromise.  

Early signs point to the involvement of a **sophisticated threat actor**.  
Your task is to **analyze the evidence** provided to uncover the attacker’s methods, assess the extent of the breach, and aid in containing the threat to restore the network’s integrity.

---

##  Q1: Knowing the source IP of the attack allows security teams to respond to potential threats quickly. Can you identify the source IP responsible for potential port scanning activity? :

I filtered the PCAP in Wireshark using icmp to identify any reconnaissance activity such as ping sweeps ,  I observed a single source IP sending requests , This repeated pattern indicated the attacker’s reconnaissance phase, allowing me to identify the source IP responsible for the potential scanning activity.

<img width="980" height="472" alt="image" src="https://github.com/user-attachments/assets/e922839a-a1cd-49da-9c84-c5640cdbaaf6" />

##  Q2: During the investigation, it's essential to determine the account targeted by the attacker. Can you identify the targeted account username?

During the network analysis, I noticed repeated TDS (Tabular Data Stream) traffic, which is commonly associated with Microsoft SQL Server. This naturally raised suspicion of database-related activity. Investigating these packets revealed authentication attempts, allowing me to extract the username used during the connection.

I filtered the traffic in Wireshark by tds to focus on Microsoft SQL Server communications. I then searched for TDS7 Login packets, which contain authentication details, and from there was able to identify the username used in the connection attempts.

Within these packets, I was able to extract both the username and password used in the authentication attempts. Wireshark also allows filtering directly with tds.login7.username or tds.login7.password to quickly locate these credentials.

<img width="1747" height="986" alt="2" src="https://github.com/user-attachments/assets/1c4db003-3145-4ca3-95e9-6cc450af14e4" />
<img width="816" height="716" alt="3" src="https://github.com/user-attachments/assets/f1bd339d-4e19-40bd-85d5-9d4ef1c8e8b5" />
<img width="932" height="167" alt="4" src="https://github.com/user-attachments/assets/1d8299ab-bae9-483c-a904-bbf55260d4c5" />

##  Q3: We need to determine if the attacker succeeded in gaining access. Can you provide the correct password discovered by the attacker?

Check TDS7 Login packet.

##  Q4: Attackers often change some settings to facilitate lateral movement within a network. What setting did the attacker enable to control the target host further and execute further commands?

In TDS (and SQL Server in general), a SQL Batch is simply a group of one or more SQL statements sent together from the client to the server for execution in a single request.

In the TDS protocol, a SQL Batch packet contains raw T‑SQL commands (like SELECT, INSERT, DROP, etc.).

They’re used when the client isn’t running a stored procedure but sending direct SQL commands.

In Wireshark, if you expand a TDS SQL Batch packet, you can often see the SQL query text that was sent to the server.

Any SQL Batch packets from the same connection might reveal what the attacker tried to do once logged in .

<img width="947" height="558" alt="5" src="https://github.com/user-attachments/assets/980724fb-7ad0-4a53-9220-d0bb13d6cbb7" />

EXEC sp_configure 'show advanced options', 1; RECONFIGURE; EXEC sp_configure 'xp_cmdshell', 1; RECONFIGURE;

EXEC sp_configure is a Transact‑SQL (T‑SQL) system stored procedure in Microsoft SQL Server that lets an administrator view or change server‑level settings.

EXEC → tells SQL Server to execute a stored procedure.

sp_configure → the procedure that manages configuration options.

It takes parameters:

The option name (e.g., 'show advanced options', 'xp_cmdshell').

The value to set (e.g., 1 to enable, 0 to disable).

EXEC sp_configure 'xp_cmdshell', 1;
means Enable xp_cmdshell so SQL queries can run system commands.
Which is bad :)

xp_cmdshell is a SQL Server extended stored procedure that lets you run Windows operating system commands directly from SQL Server.

##  Q5: Process injection is often used by attackers to escalate privileges within a system. What process did the attacker inject the C2 into to gain administrative privileges?

I used Windows Event Viewer and applied a filter for PowerShell events

<img width="962" height="708" alt="6" src="https://github.com/user-attachments/assets/6bb010b3-693e-4b81-b90e-6fb656130d73" />

The attacker injected into this legitimate Windows process, a common technique to maintain persistence and evade detection.

##  Q6 -Following privilege escalation, the attacker attempted to download a file. Can you identify the URL of this file downloaded?

To identify the URL of the downloaded file, I filtered the traffic by http in Wireshark. The first downloaded file observed was checking.ps1.

An interesting observation was that at some point, the attacker’s system started sending HTTP responses rather than requests. This makes sense because once the attacker had access to the system.

<img width="1035" height="527" alt="7" src="https://github.com/user-attachments/assets/b881fe4b-9ddd-417b-8cae-dff157e38733" />

##  Q7: Understanding which group Security Identifier (SID) the malicious script checks to verify the current user's privileges can provide insights into the attacker's intentions. Can you provide the specific Group SID that is being checked?

The attacker’s script likely checks the SID of the Administrators group to see if the current user has administrative privileges.

<img width="1022" height="867" alt="8" src="https://github.com/user-attachments/assets/7c972ad0-ca53-4094-a030-eb5bb46ad73c" />

obvious.

##  Q8: Windows Defender plays a critical role in defending against cyber threats. If an attacker disables it, the system becomes more vulnerable to further attacks. What are the registry keys used by the attacker to disable Windows Defender functionalities? Provide them in the same order found.

Attackers like to turn off Windows Defender so their malware can run without being caught. They do this by changing some important settings stored in the Windows Registry, which is like Windows’ control center for all system configurations

When these protections are turned off, the malware can work quietly in the background without raising any alarms. In the script we analyzed, the attacker clearly changes certain registry keys to switch off Windows Defender and avoid detection.

<img width="766" height="191" alt="9" src="https://github.com/user-attachments/assets/25a7b63a-e90c-4b55-88a0-2be4df02d920" />

##  Q9: Can you determine the URL of the second file downloaded by the attacker?

filter http.

<img width="1152" height="47" alt="10" src="https://github.com/user-attachments/assets/4545a7e8-99af-4e77-a91f-e8833fad3c9f" />

##  Q10: Identifying malicious tasks and understanding how they were used for persistence helps in fortifying defenses against future attacks. What's the full name of the task created by the attacker to maintain persistence?

Since the hint said to look for commands using schtasks.exe in the PowerShell script, I searched the PCAP with the filter frame contains "schtasks.exe". Then, I followed the TCP stream to analyze the commands and see how the attacker used scheduled tasks for persistence

<img width="1857" height="166" alt="12" src="https://github.com/user-attachments/assets/6c0db050-fce7-47e0-8212-2aaffd8acb67" />

<img width="1242" height="187" alt="11" src="https://github.com/user-attachments/assets/ec882deb-49f3-4dbb-9a76-2d95208cf0e8" />

##  Q11: Based on your analysis of the second malicious file, What is the MITRE ID of the main tactic the second file tries to accomplish?

1-Removes WMI event subscriptions:

Get-WmiObject _FilterToConsumerBinding -Namespace root\subscription | Remove-WmiObject
This disables WMI persistence or monitoring mechanisms, which attackers use to hide or maintain presence.

2-Stops processes related to monitoring/debugging:
The list includes taskmgr, perfmon, ProcessHacker, procexp64, Procmon, etc.: all tools used to monitor or analyze running processes.

3-Stops its own PowerShell process:

stop-process $pid -Force

This kills the script itself to reduce traces.

This activity clearly falls under Defense Evasion (TA0005), as the attacker uses techniques like scheduled tasks and disabling security tools to avoid detection and maintain access.

<img width="1252" height="313" alt="Capture d'écran 2025-08-06 032740" src="https://github.com/user-attachments/assets/921b6115-4567-4187-85d6-cb5bae8192c5" />

##  Q12: What's the invoked PowerShell script used by the attacker for dumping credentials?

<img width="1051" height="58" alt="13" src="https://github.com/user-attachments/assets/3dc0df76-f7f1-4fb7-b0ea-adfd75931236" />

##  Q13: Understanding which credentials have been compromised is essential for assessing the extent of the data breach. What's the name of the saved text file containing the dumped credentials?

During reconnaissance, attackers scan the network to find active or vulnerable hosts . They often save these results in a file to plan further attacks . Knowing this file helps defenders focus on the specific machines the attacker targeted.

Look through the attacker’s files, scripts, or captured traffic for any text file that contains IP addresses or hostnames.

The question wants the exact filename used by the attacker to store these discovered hosts.

Examine the dump file in question .

<img width="1102" height="875" alt="image" src="https://github.com/user-attachments/assets/87334d50-62c6-43dc-b4f3-cc27d3d486f4" />

##  Q14: Knowing the hosts targeted during the attacker's reconnaissance phase, the security team can prioritize their remediation efforts on these specific hosts. What's the name of the text file containing the discovered hosts?

<img width="1116" height="42" alt="14" src="https://github.com/user-attachments/assets/6255284e-f40b-438f-9d1b-1d2c26b0cfb1" />

##  Q15: After hash dumping, the attacker attempted to deploy ransomware on the compromised host, spreading it to the rest of the network through previous lateral movement activities using SMB. You’re provided with the ransomware sample for further analysis. By performing behavioral analysis, what’s the name of the ransom note file?

-Get the hash .

<img width="1918" height="869" alt="image" src="https://github.com/user-attachments/assets/8cc6625f-4fff-4fb9-b220-9e577f1a64c0" />

-In behavior tap, Go to Files Dropped section :

You ll find the answer.

##  Q16: In some cases, decryption tools are available for specific ransomware families. Identifying the family name can lead to a potential decryption solution. What's the name of this ransomware family?

 Clear.
 
-BlueSky

Thanks for taking the time to read this write-up.  
I appreciate the opportunity to learn and share my analysis of the **BlueSky Ransomware Lab**.  
Feedback and suggestions are always welcome!

