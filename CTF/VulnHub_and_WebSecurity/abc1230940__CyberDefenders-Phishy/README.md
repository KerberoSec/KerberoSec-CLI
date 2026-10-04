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

<h2 align="center"> CyberDefenders Write-up: Phishy </h2>
<h2 id="scenario"> Scenario </h2>
<p> A company’s employee joined a fake iPhone giveaway. Our team took a disk image of the employee's system for further analysis. </p>
<p> As a soc analyst, you are tasked to identify how the system was compromised. </p>
<p align="right">(<a href="#top">Back to Top</a>)</p>

<h2 id="tools-used"> Tools Used </h2>
<ol>
  <li> <a href="https://www.exterro.com/digital-forensics-software/ftk-imager"> FTK Imager </a> </li>
  <li> <a href="https://ericzimmerman.github.io/#contributesupport-opportunities"> Registry Explorer </li>
  <li> <a href="https://sqlitebrowser.org/"> DB Browser for SQLite </li>
  <li> <a href="https://github.com/andreas-mausch/whatsapp-viewer/releases/tag/v1.15"> Whatsapp Viewer </li>
  <li> <a href="https://blog.didierstevens.com/2026/03/17/update-oledump-py-version-0-0-85/"> oledump </li>
  <li> <a href="https://github.com/decalage2/oletools"> oletools </a> </li>
  <li> <a href="https://www.nirsoft.net/utils/passwordfox.html"> Passwordfox </a> </li>
  <li> <a href="https://www.virustotal.com/"> VirusTotal </a> </li>
</ol>
<p align="right">(<a href="#top">Back to Top</a>)</p>

<h2 id="prerequisite"> Prerequisite </h2>
<p> Before analyzing the disk image, we needed to mount the investigated image in FTK Imager. </p>
<img width="380" height="533" alt="Screenshot 2026-06-25 151423" src="https://github.com/user-attachments/assets/cffc2d1d-52d0-4b16-a82e-61496a894cdf" />
<p> We first navigated to <strong>File -> Image Mounting...</strong> </p>
<img width="568" height="562" alt="Screenshot 2026-06-25 151520" src="https://github.com/user-attachments/assets/cb24f10c-dd2b-465e-a4f3-64ada4da6b13" />
<p> Then chose the disk image GiveAway.ad1 and mounted. </p>
<img width="213" height="81" alt="Screenshot 2026-06-25 151845" src="https://github.com/user-attachments/assets/f61115d7-fc22-45ea-b9ea-fe878e57626a" />
<p> Once it is mounted, the image will be shown in your removable disk. And Great! Let us go through the task. </p>
<p align="right">(<a href="#top">Back to Top</a>)</p>

<h2 id="questions"> Questions </h2>
<p> <strong> 1. What is the hostname of the victim machine? </strong></p>
<p> We needed to obtain the hostname in the SYSTEM Registry hive, which was stored in a binary format and unreadable. Therefore, we needed to parse the hive using Registry Explorer from Eric Zimmerman Suite. </p>
<img width="321" height="272" alt="Screenshot 2026-06-25 153539" src="https://github.com/user-attachments/assets/8c763647-26de-4436-9e14-293e7f18b04b" />
<p> we navigated to <strong>File -> Load hive</strong> </p>
<img width="600" height="487" alt="Screenshot 2026-06-25 153734" src="https://github.com/user-attachments/assets/4d30d39b-b2ce-4975-83c9-08a117e417a1" />
<p> Chose the SYSTEM hive where it was located in the path \Windows\System32\config\SYSTEM </p>
<img width="1146" height="400" alt="Screenshot 2026-06-25 154027" src="https://github.com/user-attachments/assets/c2e8e5f9-67f8-404b-aeb4-8d781396834b" />
<p> We can find the hostname by following the path \SYSTEM\CurrentControlSet002\Control\ComputerName\ComputerName</p>
<img width="697" height="146" alt="Screenshot 2026-06-25 154446" src="https://github.com/user-attachments/assets/43ad78f6-bed1-4d06-a680-3fd619bfc612" />
<p> The hostname was <strong>WIN-NF3JQEU4G0T</strong>. </p>
<img width="881" height="850" alt="Screenshot 2026-06-25 154555" src="https://github.com/user-attachments/assets/75814951-1e37-439c-b85c-133166666a6b" />
<p> There was a Registry Forensics Cheatsheet from <a href="https://assets.tryhackme.com/cheatsheets/Windows%20Forensics%20Cheatsheet.pdf">TryHackMe</a> to check the other configuration settings. </p>
<br>
<p> <strong> 2. What is the messaging app installed on the victim machine? </strong></p>
<p> In order to find the installed app on the machine, we can navigate to <strong>"\Users\Semah\AppData\Roaming"</strong> </p>
<img width="623" height="146" alt="Screenshot 2026-06-25 160254" src="https://github.com/user-attachments/assets/c62ab966-3911-4a86-9e4e-d5ef5a1d3919" />
<p> The messaging app was <strong>Whatsapp</strong>. </p>
<br>
<p> <strong> 3. The attacker tricked the victim into downloading a malicious document. Provide the full download URL. </strong></p>
<p> In order to find the document downloaded from the chatroom with the attacker, we needed to navigate to the Whatsapp folder to look through the chat history. I asked Gemini for the name and the path of the Whatsapp chat history database. </p>
<img width="830" height="461" alt="Screenshot 2026-06-24 165335" src="https://github.com/user-attachments/assets/09bd0807-329e-4e61-bf0a-e8dd2a6226ee" />
<p> The name of database in Windows OS is msgstore.db and it is located in the path <strong>"\Whatsapp\Database"</strong></p>
<img width="618" height="167" alt="Screenshot 2026-06-25 160640" src="https://github.com/user-attachments/assets/c801f061-2574-4792-a200-fc0ecbfdff22" />
<p> Then we opened the database with DB Browser for SQLite and checked the table available_message_view to find the conversations with the attacker. </p>
<img width="681" height="362" alt="Screenshot 2026-06-25 160958" src="https://github.com/user-attachments/assets/1241e09d-216d-46ab-8437-58cab181e146" />
<p> In the conversation the attacker lied to Semah to click on the URL <strong>hxxp[://]appIe[.]com/IPhone-Winners[.]doc</strong> to download a document containing 5 winners of iPhone 12 special edition. Let us check the reputation of the domain on VirusTotal. </p>
<img width="1830" height="582" alt="Screenshot 2026-06-25 161605" src="https://github.com/user-attachments/assets/455b335c-29ec-4673-834f-816176db1eb8" />
<p> The typosquatted domain appIe[.]com impersonating apple.com was classified as malicious, it was believed that it was a smishing move with a malicious URL. </p>
<br>
<p> <strong> 4. Multiple streams contain macros in the document. Provide the number of the highest stream. </strong></p>
<p> Based on the conversation it was believed that Semah clicked on the malicious URL and downloaded the malicious document IPhone-winner.doc. Therefore we can navigate to <strong>"Users\Semah\Downloads" to find the document. </strong></p> 
<img width="632" height="390" alt="Screenshot 2026-06-25 162642" src="https://github.com/user-attachments/assets/9db35acd-ebb8-4b13-b062-d0afd22d8670" />
<p> In order to identify the embedded macros streams in the document, we needed to use oledump.py to extract them. </p>
<pre> <code lang="cmd"> python oledump.py "path\\to\\IPhone-winners.doc" </code> </pre>
<img width="912" height="203" alt="Screenshot 2026-06-25 164039" src="https://github.com/user-attachments/assets/595dc2f2-f452-4cd2-ba3f-d8a68c459b68" />
<p> Based on the result, stream 9 and <strong>10</strong> contained the macros. The letter M represented that the macros contained VBA script. </p>
<br>
<p> <strong> 5. The macro executed a program. Provide the program name? </strong></p>
<p> Let us dive into the macros streams to find out the malicious VBA script using the same tool oledump.py. </p>
<pre> <code lang="cmd"> python oledump.py -s 9 -v "path\\to\\IPhone-winners.doc" </code> </pre>
<ul>
  <li> -s: stream number </li>
  <li> -v: VBA decompression to obtain the script </li>
</ul>
<img width="958" height="237" alt="Screenshot 2026-06-25 165149" src="https://github.com/user-attachments/assets/939d23da-deb5-4815-9f65-7cefed4cf94f" />
<p> There was nothing special in stream 9. Let us check the stream 10. </p>
<img width="983" height="605" alt="Screenshot 2026-06-25 165252" src="https://github.com/user-attachments/assets/de8f24c3-5422-4758-a5fc-8e060dca9ed8" />
<p> When we saw a bunch of chr(), we can realize that the VBA script was obfuscated to evade detection and make reverse engineering more difficult. In order to deobfuscate the VBA script, we can use olevba from the oletools suite to decode the chr(). </p>
<p> First extract the VBA script from the document </p>
<pre> <code lang="cmd"> olevba.exe "path\\to\\IPhone-winners.doc" > Iphone-winners.vba </code> </pre>
<img width="82" height="100" alt="Screenshot 2026-06-25 172250" src="https://github.com/user-attachments/assets/fe60cc3c-a5a6-47e3-9867-1915e54b3300" />
<p> Then deobfuscate the VBA script </p>
<pre> <code lang="cmd"> olevba.exe --deobf --reveal "path\\to\\IPhone-winners.vba" > Iphone-winners_deobf.vba </code> </pre>
<img width="80" height="105" alt="Screenshot 2026-06-25 172324" src="https://github.com/user-attachments/assets/1106882e-715d-41da-aa4d-d1b70466afc1" />
<p> Finally we opened the deobfuscated script with notepad.exe or VSCode and checked out the script. </p>
<img width="1710" height="702" alt="Screenshot 2026-06-25 172709" src="https://github.com/user-attachments/assets/00e5b308-e1f2-4745-9231-6019b93f6124" />
<p> When the macro stream 10 (iphoneevil) was executed, <strong>powershell</strong> was spawned to decode and execute the above base64 encoded script in the background! </p>
<br>
<p> <strong> 6. The macro downloaded a malicious file. Provide the full download URL. </strong></p>
<p> Let us decode the script in the variable lllllllllll on Cyberchef. </p>
<img width="948" height="157" alt="Screenshot 2026-06-25 173623" src="https://github.com/user-attachments/assets/5324220c-fc94-497a-89d2-fcaddb435e41" />
<p> The script made a HTTP GET request to <strong>hxxp[://]appIe[.]com/Iphone[.]exe</strong>. </p>
<br>
<p> <strong> 7. Where was the malicious file downloaded to? (Provide the full path) </strong></p>
<p> Based on the script in the last screenshot, the file was downloaded to <strong>"C:\Temp\IPhone.exe"</strong>. </p>
<br>
<p> <strong> 8. What is the name of the framework used to create the malware? </strong></p>
<p> First, we navigated to <strong>"\Temp\IPhone.exe"</strong> and uploaded the malware to VirusTotal for static analysis. </p>
<img width="625" height="70" alt="Screenshot 2026-06-25 174836" src="https://github.com/user-attachments/assets/5087f1de-908b-4cd2-b151-ca06c8eeaddb" />
<img width="1706" height="718" alt="Screenshot 2026-06-25 174811" src="https://github.com/user-attachments/assets/05aeccac-7fde-4e8e-a963-554c0c67ddc5" />
<p> IPhone.exe (original name: ab.exe) belongs to Meterpreter malware family, which is a core component in <strong>Metasploit</strong> framework and often used in penetration testing. </p>
<br>
<p> <strong> 9. What is the attacker's IP address? </strong></p>
<p> We can navigate to the Relations section of the same analysis report on VirusTotal and look at the contacted IP Addresses of IPhone.exe. </p>
<img width="567" height="562" alt="Screenshot 2026-06-25 175705" src="https://github.com/user-attachments/assets/a38e167f-3c34-49ef-a55c-50d2aef031e3" />
<p> I tried one by one and the answer was <strong>155[.]94[.]69[.]27</strong> </p>
<br>
<p> <strong> 10. The fake giveaway used a login page to collect user information. Provide the full URL of the login page? </strong></p>
<p> In order to identify the fake login page, we needed to review the browsing history of Semah. </p>
<img width="623" height="146" alt="Screenshot 2026-06-25 160254" src="https://github.com/user-attachments/assets/83674fc6-b962-488c-8c16-32acdf4a2f7f" />
<p> There was a folder "Mozilla" in the same folder of Whatsapp, it was believed that Semah configured Mozilla Firefox as her default web browser. Therefore, the database of browsing history can also be found. </p>
<img width="1888" height="667" alt="Screenshot 2026-06-25 182939" src="https://github.com/user-attachments/assets/7ad3e445-8e27-4824-b33b-27dba79aad86" />
<p> To learn more about the artifacts of different browsers, please check out the <a href="https://app.letsdefend.io/training/lessons/browser-forensics">Browser Forensics course</a> provided by LetsDefend, which provided an excellent tutorial about this topic. </p>
<img width="605" height="70" alt="Screenshot 2026-06-25 183603" src="https://github.com/user-attachments/assets/bbba1140-0812-4a38-bcca-529e3b83f8a2" />
<p> We can navigate to <strong>"\Users\Semah\AppData\Roaming\Mozilla\Firefox\Profiles\pyb51x2n.default-release"</strong> and open the places.sqlite with DB Browser for SQLite, which contained the browsing history of the Mozilla Firefox. <strong>Please be reminded that the temporary SHM and WAL files were also included to give a full picture of browsing history</strong>. </p>
<img width="1222" height="540" alt="Screenshot 2026-06-25 184615" src="https://github.com/user-attachments/assets/eb93661b-894e-48ea-8352-fd8616731530" />
<p> The moz_places table revealed all browsing history and it was predicted <strong>hxxp[://]appIe[.]competitions[.]com/login[.]php</strong> was the fake login page, belonging to the same malicious domain appIe[.]com </p>
<br>
<p> <strong> 11. What is the password the user submitted to the login page? </strong></p>
<p> This question took me long time to think because I could not find any data in the formhistory.sqlite and other possible database until I looked at the hint. We can identify the entered password using <a href="https://www.nirsoft.net/utils/passwordfox.html">passwordfox from Nirsoft</a>. </p>
<img width="620" height="467" alt="Screenshot 2026-06-25 185802" src="https://github.com/user-attachments/assets/f06ea9fe-2e74-4702-984f-da45b8ec1bc8" />
<p> After analysing the Firefox folder pyb51x2n.default-release, we can identify the password submitted to hxxp[://]appIe[.]competitions[.]com/login[.]php was <strong>GacsriicUZMY4xiAF4yl</strong>. </p>
<p align="right">(<a href="#top">Back to Top</a>)</p>

<h2 id="reference"> Reference </h2>
<p> <a href="https://cyberdefenders.org/blueteam-ctf-challenges/achievements/abc1230940/phishy/"> CyberDefenders: Phishy Lab </a> </p>
<p> <a href="https://www.virustotal.com/gui/domain/appie.com/detection"> Static analysis report for the suspcious domain hxxp[://]appIe[.]com on VirusTotal </a> </p>
<p> <a href="https://www.virustotal.com/gui/file/72c677ba5bf40394361b3566b6bb2b1c0c5e726b10c9af2debf7384385ebdbd1"> Static analysis report for IPhone.exe on VirusTotal </a> </p>
<p> <a href="https://assets.tryhackme.com/cheatsheets/Windows%20Forensics%20Cheatsheet.pdf"> Windows Registry Forensics Cheatsheet from TryHackMe </a> </p>
<p> <a href="https://app.letsdefend.io/training/lessons/browser-forensics"> LetsDefend Browser Forensics course </a> </p>
<p align="right">(<a href="#top">Back to Top</a>)</p>
