<a name="top"></a>

<p align="center"> 
  <a href="https://www.linkedin.com/in/clarence-fong" target="_blank">
    <img width="50" height="50" alt="LinkedIn" src="https://github.com/user-attachments/assets/7ab6e12b-ca8a-4aa6-8f10-79ba89d485b5" />
  </a>
  <a href="mailto:abc1230940@gmail.com">
    <img width="50" height="50" alt="Gmail" src="https://github.com/user-attachments/assets/4e0491ce-239c-413c-b433-74a5ff48f231" />
  </a>
  <a href="https://www.instagram.com/cyberbrexel?igsh=MXNxeWJid2VxZWxxaw%3D%3D&utm_source=qr" target="_blank">
    <img width="50" height="50" alt="Instagram Old" src="https://github.com/user-attachments/assets/62e4672b-d424-4489-a204-c301040905a3" />
  </a>
  <a href="https://discordapp.com/users/cyberbrexel" target="_blank">
    <img width="50" height="50" alt="Discord" src="https://github.com/user-attachments/assets/f76173ca-fad3-4390-bca1-5c2305bc748e" />
  </a>
  <a href="https://www.reddit.com/user/abc1230940/" target="_blank">
    <img width="50" height="50" alt="Reddit" src="https://github.com/user-attachments/assets/6e9bd985-dfa3-4349-b966-4cf49362bd61" />
  </a>
</p> <br>

<h2 align="center"> CyberDefenders Write-up: BlueSky Ransomware </h2>
<img width="2388" height="1668" alt="IMG_0208" src="https://github.com/user-attachments/assets/c6c9b863-b30f-457e-b4fe-f146afa32948" />
<h2 id="scenario"> Scenario </h2>
<p> A high-profile corporation that manages critical data and services across diverse industries has reported a significant security incident. Recently, their network has been impacted by a suspected ransomware attack. Key files have been encrypted, causing disruptions and raising concerns about potential data compromise. Early signs point to the involvement of a sophisticated threat actor. Your task is to analyze the evidence provided to uncover the attacker’s methods, assess the extent of the breach, and aid in containing the threat to restore the network’s integrity. </p>
<p align="right">(<a href="#top">Back to Top</a>)</p>

<h2 id="tools-used"> Tools Used </h2>
<ol>
  <li> Wireshark </li>
  <li> Networkminer </li>
  <li> Event Viewer </li>
  <li> <a href="https://gchq.github.io/CyberChef/"> CyberChef </a> </li>
  <li> <a href="https://www.virustotal.com/"> VirusTotal </li>
  <li> <a href="https://attack.mitre.org/"> MITRE ATT&CK </a> </li>
</ol>
<p align="right">(<a href="#top">Back to Top</a>)</p>

<h2 id="questions"> Questions </h2>
<p> <strong> 1. Knowing the source IP of the attack allows security teams to respond to potential threats quickly. Can you identify the source IP responsible for potential port scanning activity? </strong> </p>
<p> We can look at the pcap file using Wireshark and go to <strong>Statistics -> Conversations -> TCP</strong> to check the conversations between 2 endpoints </p>
<img width="1647" height="1062" alt="Screenshot 2026-06-21 171016" src="https://github.com/user-attachments/assets/f46f7d03-4116-47e0-9f02-83fcbd17e6f4" />
<p> We can discover that many various ports at 87.96.21.81 was connected from <strong>87.96.21.84</strong>, indicating that it was the port scanning activities. </p>
<p> Attacker: <strong>87.96.21.84</strong </p>
<p> Victim: 87.96.21.81 </p>
<br>
<p> <strong> 2. During the investigation, it's essential to determine the account targeted by the attacker. Can you identify the targeted account username? </strong> </p>
<p> First, we need to find which ports were successfully scanned by the attacker using a display filter. </p>
<pre> <code lang="text"> ip.src == 87.96.21.84 && ip.dst == 87.96.21.81 && tcp.flags.ack == 1 </code> </pre>
<img width="1492" height="850" alt="Screenshot 2026-06-21 174311" src="https://github.com/user-attachments/assets/bc414f89-1118-4d9f-aee1-29227e2263ed" />
<p> According to the result, the port utilizing TDS protocol was successfully scanned by the attacker. </p>
<img width="707" height="162" alt="Screenshot 2026-06-21 175349" src="https://github.com/user-attachments/assets/6011ef2a-48c2-4ee7-9bd6-c7ff55120ff6" />
<p> According to <a href="https://en.wikipedia.org/wiki/Tabular_Data_Stream"> Wikipedia</a>, TDS (Tabular Data Stream) is an application layer protocol utilized by Microsoft SQL Server at the port TCP/1433. </p>
<br>
<p> Second we need to find the login information with targeted account of MSSQL service using the display filter. </p>
<pre> <code lang="text"> tds.type==16 </code> </pre>
<img width="948" height="251" alt="Screenshot 2026-06-21 180501" src="https://github.com/user-attachments/assets/72ce9c58-baa5-428d-8a95-d021f873ad06" />
<p> And we click 1 of those packet for detailed information. </p>
<img width="341" height="342" alt="Screenshot 2026-06-21 180357" src="https://github.com/user-attachments/assets/61bd6f85-b87b-4ddf-b1f6-b5714fa30549" />
<p> We discovered that the attacker logged in the MSSQL database using the username <strong>sa</strong>. </p>
<br>
<p> <strong> 3. We need to determine if the attacker succeeded in gaining access. Can you provide the correct password discovered by the attacker? </strong> </p>
<p> As shown in the last screenshot, the password entered by the attacker was <strong>cyb3rd3f3nd3r$</strong>. </p>
<br>
<p> <strong> 4. Attackers often change some settings to facilitate lateral movement within a network. What setting did the attacker enable to control the target host further and execute further commands? </strong> </p>
<p> First, we would like to check the network traffic just after the first login. </p>
<img width="1422" height="238" alt="Screenshot 2026-06-21 181639" src="https://github.com/user-attachments/assets/5d88bb02-ca56-4156-a261-8cff563f163b" />
<p> And we click the SQL batch for detailed information. </p>
<img width="1103" height="187" alt="Screenshot 2026-06-21 181933" src="https://github.com/user-attachments/assets/75f3351a-6374-4bbb-850f-86faf002cc24" />
<p> We discover that the MSSQL command "EXEC sp_configure 'show advanced options', 1; RECONFIGURE; EXEC sp_configure 'xp_cmdshell', 1; RECONFIGURE;" was executed. </p>
<p> show advanced options: Enabled to display advanced settings </p>
<p> <strong>xp_cmdshell</strong>: Enabled to execute commands </p>
<p> 1: Setted to True </p>
<p> The command allowed the attacker to enter command in the MSSQL database! </p>
<br>
<p> <strong> 5. Process injection is often used by attackers to escalate privileges within a system. What process did the attacker inject the C2 into to gain administrative privileges? </strong></p>
<p> The attacker needed to move from the MSSQL database service to the host operating system by injecting malicious code into a process running as a high-privileged user. Because i did not know how to find powershell execution in a pcap file, I found the related events using event viewer by filtering <strong>Event ID: 600</strong>, finding if there was any process injection to spawn the powershell. </p>
<img width="647" height="708" alt="Screenshot 2026-06-21 184255" src="https://github.com/user-attachments/assets/a629667b-9eb7-4430-9253-160f94615e3f" />
<p>As the detail shown, the attacker utilized MSFConsole, which was a component of Metasploit framework, injecting codes into the process <strong>winlogon.exe</strong> to spawn a malicious powershell process.</p>
<p> <strong>winlogon.exe</strong> is a windows bulit-in process handling users logins, logouts, screensaver running as NT AUTHORITY\SYSTEM. </p>
<br>
<p> <strong> 6. Following privilege escalation, the attacker attempted to download a file. Can you identify the URL of this file downloaded? </strong> </p>
<p> We would like to find the HTTP traffic from the victim using the display filter. </p>
<pre> <code lang="text"> http </code> </pre>
<img width="1275" height="837" alt="Screenshot 2026-06-21 191434" src="https://github.com/user-attachments/assets/5a19a6d7-0681-4020-9ccf-b2377e6b094c" />
<p> The first file downloaded from the attacker was checking.ps1 with the URL <strong>hxxp[://]87[.]96[.]21[.]84/checking[.]ps1</strong>. </p>
<br>
<p> <strong> 7. Understanding which group Security Identifier (SID) the malicious script checks to verify the current user's privileges can provide insights into the attacker's intentions. Can you provide the specific Group SID that is being checked? </strong> </p>
<p> First, we would like to follow the HTTP stream of checking.ps1 to get the powershell script. </p>
<img width="966" height="437" alt="Screenshot 2026-06-21 192401" src="https://github.com/user-attachments/assets/3fe150f4-ea82-4926-b993-91822539bbfa" />
<p> The script first checked the user's current privileged of SID: <strong>S-1-5-32-544</strong>, which represented the Administrators group in windows OS. </p>
<br>
<p> <strong> 8. Windows Defender plays a critical role in defending against cyber threats. If an attacker disables it, the system becomes more vulnerable to further attacks. What are the registry keys used by the attacker to disable Windows Defender functionalities? Provide them in the same order found. </strong> </p>
<p> We scrolled down further and looked at the script about Windows Defender. </p>
<img width="902" height="460" alt="Screenshot 2026-06-21 193011" src="https://github.com/user-attachments/assets/369ceec8-6754-4427-8621-5ec12f8ec31a" />
<p> The script setted the Registry keys <strong>DisableAntiSpyware, DisableRoutinelyTakingAction, DisableRealtimeMonitoring, SubmitSamplesConsent, SpynetReporting</strong> to 1, indicating those functions were disabled. </p>
<br>
<p> <strong> 9. Can you determine the URL of the second file downloaded by the attacker? </strong></p>
<p> We can look back the HTTP packets in Wireshark. </p>
<img width="1275" height="837" alt="Screenshot 2026-06-21 191434" src="https://github.com/user-attachments/assets/3d61ad97-b59a-4ba3-8760-fd3708473c70" />
<p> The second payload downloaded from the attacker was <strong>del.ps1</strong>. </p>
<br>
<p> <strong> 10. Identifying malicious tasks and understanding how they were used for persistence helps in fortifying defenses against future attacks. What's the full name of the task created by the attacker to maintain persistence? </strong> </p>
<p> We scrolled down checking.ps1 further and looked at the script about scheduled task. </p>
<img width="1860" height="180" alt="Screenshot 2026-06-21 194207" src="https://github.com/user-attachments/assets/d161e357-e7dc-4771-8b37-1c66a933565e" />
<p> A scheduled task named <strong>"\Microsoft\Windows\MUI\LPupdate"</strong> executing "C:\ProgramData\del.ps1" with cmd.exe every hour. </p>
<br>
<p> <strong> 11. Based on your analysis of the second malicious file, What is the MITRE ID of the main tactic the second file tries to accomplish? </strong></p>
<p> We looked at the second payload del.ps1. </p>
<img width="1092" height="531" alt="Screenshot 2026-06-21 200339" src="https://github.com/user-attachments/assets/d52d639e-d04f-420a-8db1-942d89b9d167" />
<p> First the script deleted the WmiObject by using Remove-WmiObject and then killed the processes of "taskmgr", "perfmon", "SystemExplorer", "taskman", "ProcessHacker", "procexp64", "procexp", "Procmon", "Daphne" to avoid detection by the above monitoring tools. </p>
<img width="1397" height="402" alt="Screenshot 2026-06-21 200101" src="https://github.com/user-attachments/assets/f2cd4da8-fbb9-409e-91ef-ecf41b9c2fd2" />
<p> According to <a href="https://attack.mitre.org/tactics/TA0005/"> MITRE ATT&CK</a>, the Tatic ID of shealth is <strong>TA0005</strong>. </p>
<br>
<p> <strong> 12. What's the invoked PowerShell script used by the attacker for dumping credentials? </strong></p>
<img width="1860" height="180" alt="Screenshot 2026-06-21 194207" src="https://github.com/user-attachments/assets/9babc6fa-4295-4946-b5d2-5c02f91f5a16" />
<p> We looked back the checking.ps1, if the user's privilege was SYSTEM, the third script ichigo-lite.ps1 was downloaded from the attacker. We follow the HTTP stream of the ichigo-lite.ps1 in Wireshark. </p>
<img width="998" height="320" alt="Screenshot 2026-06-21 201634" src="https://github.com/user-attachments/assets/21254f42-b34e-42b5-91e9-a7011897a2ef" />
<p> ichigo-lite.ps1 showed nothing about credential dumping but it first downloaded 2 other scripts from the attacker. The forth payload <strong>Invoke-PowerDump.ps1</strong> caught my eyes so I followed the HTTP stream of <strong>Invoke-PowerDump.ps1</strong>. </p>
<img width="1386" height="956" alt="Screenshot 2026-06-21 202159" src="https://github.com/user-attachments/assets/3a136169-edad-49b0-a394-1d20959ff8d5" />
<p> And yes! We found this script was about dumping credential. The windows users' NTLM hashes were encrypted and dumped with powershell. Therefore, <strong>Invoke-PowerDump.ps1</strong> was used b the attacker to dump credentials. </p>
<br>
<p> <strong> 13. Understanding which credentials have been compromised is essential for assessing the extent of the data breach. What's the name of the saved text file containing the dumped credentials? </strong></p>
<p> When we scrolled down the script ichigo-lite.ps1 further, we discovered there were 2 Base64 encoded commands and decoded them with CyberChef. </p>
<img width="1593" height="156" alt="Screenshot 2026-06-22 120407" src="https://github.com/user-attachments/assets/91a03184-bbc5-4578-8d89-286588430587" />
<img width="953" height="127" alt="Screenshot 2026-06-22 120255" src="https://github.com/user-attachments/assets/385fa945-73d5-4dd8-88ed-fb14d2e24da2" />
<p> Invoke-PowerDump.ps1 was first downloaded from the attacker and executed. </p>
<img width="955" height="146" alt="Screenshot 2026-06-22 120520" src="https://github.com/user-attachments/assets/d59c4929-5c51-4836-8593-bbfdf7ca4e42" />
<p> The NTLM hashes were then dumped to a text file <strong>hashes.txt</strong> in the path "C:\ProgramData\hashes.txt". </p>
<br>
<p> <strong> 14. Knowing the hosts targeted during the attacker's reconnaissance phase, the security team can prioritize their remediation efforts on these specific hosts. What's the name of the text file containing the discovered hosts? </strong> </p>
<img width="1252" height="113" alt="Screenshot 2026-06-22 121708" src="https://github.com/user-attachments/assets/27f8e641-3c64-4ee6-844c-44344f247bbc" />
<p> In the script ichigo-lite.ps1, there was an interesting text file name <strong>extracted_hosts.txt</strong> was downloaded after downloading Invoke-PowerDump.ps1 and Invoke-SMBExec.ps1. Therefore, we can look at the contents of the file. </p>
<img width="853" height="380" alt="Screenshot 2026-06-22 122007" src="https://github.com/user-attachments/assets/76cd99e2-a319-4207-8c2d-4184ece10e67" />
<p> Since 87.96.21.81 was the compromised host, it was believed that the other IP addresses were the hosts targeted by the attacker. </p>
<br>
<p> <strong> 15. After hash dumping, the attacker attempted to deploy ransomware on the compromised host, spreading it to the rest of the network through previous lateral movement activities using SMB. You’re provided with the ransomware sample for further analysis. By performing behavioral analysis, what’s the name of the ransom note file? </strong> </p>
<img width="866" height="207" alt="Screenshot 2026-06-22 123618" src="https://github.com/user-attachments/assets/d6d7d973-ce41-4442-ae8e-bfba6d0600d6" />
<p> We can scroll down the ichigo-lite.ps1 further and looked at the script after credential dumping, we discovered that an executable javaw.exe was then downloaded from the attacker which was the ransomware. </p>
<img width="1540" height="478" alt="Screenshot 2026-06-22 123723" src="https://github.com/user-attachments/assets/2cf3c2ed-f928-41b8-bae3-54b57c0e3eb8" />
<p> Instead of output the ransomware, we can open the pcap file in Networkminer and looked throught the files. </p>
<img width="727" height="483" alt="Screenshot 2026-06-22 124010" src="https://github.com/user-attachments/assets/f1714531-8cbe-4ea1-bcca-142c8e004afd" />
<p> Then we copied the MD5 hash of javaw.exe for static analysis in VirusTotal. </p>
<img width="911" height="42" alt="Screenshot 2026-06-22 124239" src="https://github.com/user-attachments/assets/888c9f85-4ef2-4640-a1a4-967245a28529" />
<p> We can look at the dropped files of the ransomware in Relations section, the sole dropped text file was <strong># DECRYPT FILES BLUESKY #</strong>, believed that it was the ransom note. </p>
<p> <strong> 16. In some cases, decryption tools are available for specific ransomware families. Identifying the family name can lead to a potential decryption solution. What's the name of this ransomware family? </strong></p>
<p> Lets go back to the Detection section in VirusTotal. </p>
<img width="1808" height="588" alt="Screenshot 2026-06-22 125011" src="https://github.com/user-attachments/assets/b38a0f82-4694-4e1f-bff6-71b7822a49ff" />
<p> The ransomware was from <strong>BlueSky</strong> family. </p>
<img width="1363" height="877" alt="Screenshot 2026-06-22 130043" src="https://github.com/user-attachments/assets/fc89fd53-b2ed-4946-be11-c66504234f17" />
<p> The brief introduction of BlueSky ransomare from <a href="https://unit42.paloaltonetworks.com/bluesky-ransomware/"> Unit 42</a>. </p>
<p align="right">(<a href="#top">Back to Top</a>)</p>

<h2 id="reference"> Reference </h2>
<p> <a href="https://cyberdefenders.org/blueteam-ctf-challenges/achievements/abc1230940/bluesky-ransomware/"> CyberDefenders: Bluesky Ransomware Lab </a> </p>
<p> <a href="https://en.wikipedia.org/wiki/Tabular_Data_Stream"> Wikipedia </a> </p>
<p> <a href="https://unit42.paloaltonetworks.com/bluesky-ransomware/"> BlueSky Ransomware: Fast Encryption via Multithreading </a> </p>
<p align="right">(<a href="#top">Back to Top</a>)</p>
