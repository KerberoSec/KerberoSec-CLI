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

<h2 align="center"> CyberDefenders Write-up: 3CX Supply Chain </h2>
<h2 id="scenario"> Scenario </h2>
<p> A large multinational corporation heavily relies on the 3CX software for phone communication, making it a critical component of their business operations. After a recent update to the 3CX Desktop App, antivirus alerts flag sporadic instances of the software being wiped from some workstations while others remain unaffected. Dismissing this as a false positive, the IT team overlooks the alerts, only to notice degraded performance and strange network traffic to unknown servers. Employees report issues with the 3CX app, and the IT security team identifies unusual communication patterns linked to recent software updates. </p>
<p> As the threat intelligence analyst, it's your responsibility to examine this possible supply chain attack. Your objectives are to uncover how the attackers compromised the 3CX app, identify the potential threat actor involved, and assess the overall extent of the incident. </p>
<p align="right">(<a href="#top">Back to Top</a>)</p>

<h2 id="tools-used"> Tools Used </h2>
<ol>
  <li> <a href="https://www.virustotal.com/"> VirusTotal </a> </li>
  <li> <a href="https://attack.mitre.org/"> MITRE ATT&CK </a> </li>
  <li> msiinfo.exe from <a href="https://learn.microsoft.com/en-us/windows/apps/windows-sdk/downloads"> Windows SDK </a> </li>
  <li> msiexec </li>
  <li> sigcheck64.exe from <a href="https://learn.microsoft.com/en-us/sysinternals/downloads/sysinternals-suite"> Sysinternals Suite </li>
</ol>
<p align="right">(<a href="#top">Back to Top</a>)</p>

<h2 id="questions"> Questions </h2>
<p> <strong> 1. Understanding the scope of the attack and identifying which versions exhibit malicious behavior is crucial for making informed decisions if these compromised versions are present in the organization. How many versions of 3CX running on Windows have been flagged as malware? </strong> </p>
<p> I googled the related websites using the keywords "3CX windows malware" and found an article <a href="https://blogs.vmware.com/security/2023/03/investigating-3cx-desktop-application-attacks-what-you-need-to-know.html"> Investigating 3CX Desktop Application Attacks: What You Need to Know </a>from VMWare. </p>
<img width="1058" height="180" alt="Screenshot 2026-07-03 184348" src="https://github.com/user-attachments/assets/6f9e8c27-02dc-44f1-b387-7da92aa8a5f9" />
<p> According to the article, the affected versions were 18.12.407 and 18.12.416 for Windows, confirmed by 3CX. Therefore, the answer was <strong>2</strong>.</p>
<br>
<p> <strong> 2. Determining the age of the malware can help assess the extent of the compromise and track the evolution of malware families and variants. What's the UTC creation time of the .msi malware? </strong> </p>
<p> I uploaded 3CXDesktopApp-18.12.416.msi to VirusTotal and was navigating to the Details section to review the History. </p>
<img width="507" height="187" alt="Screenshot 2026-07-03 184916" src="https://github.com/user-attachments/assets/e017b341-8510-4eb7-8ddd-e6ae994d6550" />
<p> The creation Time of the malware was <strong>2023-03-13 06:33</strong>. </p>
<br>
<p> <strong> 3. Executable files (.exe) are frequently used as primary or secondary malware payloads, while dynamic link libraries (.dll) often load malicious code or enhance malware functionality. Analyzing files deposited by the Microsoft Software Installer (.msi) is crucial for identifying malicious files and investigating their full potential. Which malicious DLLs were dropped by the .msi file? </strong></p>
<p> First We can check the summary information of an .msi package using MsiInfo.exe from Windows SDK. </p>
<pre> <code lang="cmd"> C:\Program Files (x86)\Windows Kits\10\bin\10.0.19041.0\x86>MsiInfo.exe "path\\to\\3CXDesktopApp-18.12.416.msi" </code> </pre>
<img width="833" height="562" alt="Screenshot 2026-07-08 125053" src="https://github.com/user-attachments/assets/9a5bf5b6-182a-4046-889b-eb5bb9169b32" />
<p> Then we can extract the 3CXDesktopApp-18.12.416.msi without installation using msiexec. </p>
<pre> <code lang="cmd"> msiexec /a "path\\to\\3CXDesktopApp-18.12.416.msi" /qb TARGETDIR="C:\ExtractedMSI" </code> </pre>
<p> /a: Administrative mode, only extract </p>
<p> /qb: Runs the extraction with a basic, non-interactive user interface </p>
<p> TARGETDIR: the output path of the extracted files </p>
<img width="388" height="145" alt="Screenshot 2026-07-08 131610" src="https://github.com/user-attachments/assets/7474e993-2595-45f6-98c5-b2aa87964fc7" />
<p> After extraction, we can navigate to <strong>"C:\ExtractedMSI\3CXDesktopApp\app-18.12.416"</strong> which contains the libraries. </p>
<img width="657" height="501" alt="Screenshot 2026-07-08 132105" src="https://github.com/user-attachments/assets/dd95dd08-3816-4531-835f-4b6157783687" />
<p> In order to check the reputation of the extracted folder, we can use sigcheck64.exe from Sysinternals. </p>
<pre> <code lang="cmd"> sigcheck64.exe -v -e -s "C:\ExtractedMSI" </code> </pre>
<p> -v: Using VirusTotal </p>
<p> -e: Check .exe and .dll inside the folder </p>
<p> -s: Including all subfolders </p>
<img width="1110" height="387" alt="Screenshot 2026-07-08 133627" src="https://github.com/user-attachments/assets/82684691-ea26-4e47-8db1-195ca13316d4" />
<p> Based on the result, there were 2 libraries flagged as malicious by VirusTotal: <strong>ffmpeg.dll</strong> and <strong>d3dcompiler_47.dll</strong>. </p>
<br>
<p> <strong> 4. Recognizing the persistence techniques used in this incident is essential for current mitigation strategies and future defense improvements. What is the MITRE Technique ID employed by the .msi files to load the malicious DLL? </strong></p>
<p> Execution of a Windows executable using the functions from a malicious DLL library will attempt to bypass detection by the system's EDR or AV, which is called DLL Side-loading. </p>
<img width="1422" height="832" alt="Screenshot 2026-07-08 135036" src="https://github.com/user-attachments/assets/0b9faa0d-c38b-48be-8ec2-ef5f81d75d1a" />
<p> The MITRE ATT&CK Technique ID is <strong>T1574</strong>. </p>
<br>
<p> <strong> 5. Recognizing the malware type (threat category) is essential to your investigation, as it can offer valuable insight into the possible malicious actions you'll be examining. What is the threat category of the two malicious DLLs? </strong> </p>
<p> We can check the static analysis reports of the malicious dll libraries on VirusTotal from Question 3. </p>
<img width="1821" height="505" alt="Screenshot 2026-07-08 135616" src="https://github.com/user-attachments/assets/2b425949-5296-4e40-8001-b959091485b6" />
<p> ffmpeg.dll </p>
<img width="1797" height="488" alt="Screenshot 2026-07-08 135635" src="https://github.com/user-attachments/assets/b6d46de8-6f14-4017-b094-1ce019acf69d" />
<p> d3dcompiler_47.dll </p>
<p> The threat category of both malicious libraries was <strong>Trojan</strong>. </p> 
<br>
<p> <strong> 6. As a threat intelligence analyst conducting dynamic analysis, it's vital to understand how malware can evade detection in virtualized environments or analysis systems. This knowledge will help you effectively mitigate or address these evasive tactics. What is the MITRE ID for the virtualization/sandbox evasion techniques used by the two malicious DLLs? </strong></p>
<p> I searched "Virtualization/Sandbox Evasion" on MITRE ATT&CK. </p>
<img width="1402" height="700" alt="Screenshot 2026-07-08 140206" src="https://github.com/user-attachments/assets/a0b0d74c-52d4-48f0-b069-cb12f6dffb8d" />
<p> The MITRE ATT&CK Technique ID is <strong>T1497</strong>. </p>
<br>
<p> <strong> 7. When conducting malware analysis and reverse engineering, understanding anti-analysis techniques is vital to avoid wasting time. Which hypervisor is targeted by the anti-analysis techniques in the ffmpeg.dll file? </strong></p>
<p> We can check the static analysis report of ffmpeg.dll on VirusTotal again and navigated to Behaviors section and looked at MITRE ATT&CK Tactics and Techniques about Virtualization/Sandbox Evasion (T1497). </p> 
<img width="392" height="203" alt="Screenshot 2026-07-08 140635" src="https://github.com/user-attachments/assets/4192c104-a48f-49a8-8e15-50d7444f4db1" />
<img width="1422" height="270" alt="Screenshot 2026-07-08 140650" src="https://github.com/user-attachments/assets/87458556-e5bf-41c2-b159-38e921841db0" />
<p> Based on the description, we can realize that the malicious dll library will first check if it was in the <strong>VMWare</strong> hypervisor before the execution. </p>
<br>
<p> <strong> 8. Identifying the cryptographic method used in malware is crucial for understanding the techniques employed to bypass defense mechanisms and execute its functions fully. What encryption algorithm is used by the ffmpeg.dll file? </strong></p>
<p> As we looked at other techniques, we can also learn that the malicious library "Obfuscated Files or Information" to evade detection. </p>
<img width="381" height="115" alt="Screenshot 2026-07-08 141220" src="https://github.com/user-attachments/assets/2f1b0e71-d96c-4286-b2c6-2c5093bf51e2" />
<img width="1412" height="328" alt="Screenshot 2026-07-08 141416" src="https://github.com/user-attachments/assets/86dc752f-477a-48e9-a876-374fb5ddd1fc" />
<p> Based on the description, it encrypted data using <strong>RC4</strong> KSA. </p>
<br>
<p> <strong> 9. As an analyst, you've recognized some TTPs involved in the incident, but identifying the APT group responsible will help you search for their usual TTPs and uncover other potential malicious activities. Which group is responsible for this attack? </strong></p>
<p> I searched "ffmpeg.dll" on MITRE ATT&CK and found "3CX Supply Chain Attack, Campaign C0057". </p>
<img width="1397" height="775" alt="Screenshot 2026-07-08 142041" src="https://github.com/user-attachments/assets/1938868f-7c34-498d-81c7-afae2f494cac" />
<p> The 3CX supply chain attack was carried out by AppleJeus. </p>
<img width="1412" height="562" alt="Screenshot 2026-07-08 142145" src="https://github.com/user-attachments/assets/2053f9ce-9254-4f05-acc5-7a75c761c62a" />
<img width="1412" height="705" alt="Screenshot 2026-07-08 142356" src="https://github.com/user-attachments/assets/6bdecaf3-3233-4a4a-97c9-a4c6fd13b67f" />
<p> AppleJeus is a sub-group of the North Korean state-sponsored <strong>Lazarus</strong> Group that has been active since at least 2009 and is reportedly responsible for many cyberattacks. </p>
<a href="https://www.youtube.com/watch?v=VLHkxmlj_QU" target="_blank">
   <img src="https://img.youtube.com/vi/VLHkxmlj_QU/hqdefault.jpg" alt="The Most Feared Hacker Group EVER" width="560" />
</a>
<p> Please check the video "The Most Feared Hacker Group EVER" from Blackfiles on YouTube providing a profile of the North Korean state-sponsored threat group. </p>
<p align="right">(<a href="#top">Back to Top</a>)</p>

<h2 id="reference"> Reference </h2>
<p> <a href="https://cyberdefenders.org/blueteam-ctf-challenges/achievements/abc1230940/3cx-supply-chain/"> CyberDefenders: 3CX Supply Chain Lab </a> </p>
<p> <a href="https://blogs.vmware.com/security/2023/03/investigating-3cx-desktop-application-attacks-what-you-need-to-know.html"> VMWare: Investigating 3CX Desktop Application Attacks: What You Need to Know </a> </p>
<p> <a href="https://www.virustotal.com/gui/file/59e1edf4d82fae4978e97512b0331b7eb21dd4b838b850ba46794d9c7a2c0983/detection"> Static Analysis report of 3CXDesktopApp-18.12.416.msi on VirusTotal </p>
<p> <a href="https://attack.mitre.org/techniques/T1574/001/"> MITRE ATT&CK: Hijack Execution Flow: DLL </a> </p>
<p> <a href="https://www.virustotal.com/gui/file/7986bbaee8940da11ce089383521ab420c443ab7b15ed42aed91fd31ce833896/detection"> Static Analysis report of ffmpeg.dll on VirusTotal </p>
<p> <a href="https://www.virustotal.com/gui/file/11be1803e2e307b647a8a7e02d128335c448ff741bf06bf52b332e0bbf423b03/detection"> Static Analysis report of d3dcompiler_47.dll on VirusTotal </p>
<p> <a href="https://attack.mitre.org/techniques/T1497/001/"> MITRE ATT&CK: Virtualization/Sandbox Evasion: System Checks </a> </p>
<p> <a href="https://attack.mitre.org/groups/G1049/"> MITRE ATT&CK: AppleJeus </a> </p>
<p> <a href="https://attack.mitre.org/groups/G0032/"> MITRE ATT&CK: Lazarus Group </a> </p>
<p> <a href="https://www.youtube.com/watch?v=VLHkxmlj_QU"> The Most Feared Hacker Group EVER </a> </p>
<p align="right">(<a href="#top">Back to Top</a>)</p>
