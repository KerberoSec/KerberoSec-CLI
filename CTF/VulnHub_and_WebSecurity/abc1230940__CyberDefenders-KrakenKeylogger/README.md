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

<h2 align="center"> CyberDefenders Write-up: KrakenKeylogger </h2>
<h2 id="scenario"> Scenario </h2>
<p> An employee at a large company was assigned a task with a two-day deadline. Realizing that he could not complete the task in that timeframe, he sought help from someone else. After one day, he received a notification from that person who informed him that he had managed to finish the assignment and sent it to the employee as a test. However, the person also sent a message to the employee stating that if he wanted the completed assignment, he would have to pay $160. </p>
<p> The helper's demand for payment revealed that he was a threat actor. The company's digital forensics team was called in to investigate and identify the attacker, determine the extent of the attack, and assess potential data breaches. The team must analyze the employee's computer and communication logs to prevent similar attacks in the future. </p>
<p align="right">(<a href="#top">Back to Top</a>)</p>

<h2 id="tools-used"> Tools Used </h2>
<ol>
  <li> DB Browser for SQLite </li>
  <li> NotePad </li>
  <li> Timeline Explorer </li>
  <li> <a href="https://www.virustotal.com/"> VirusTotal </a> </li>
  <li> <a href="https://lolapps-project.github.io/"> LOLAPPS GitHub Repository </a> </li>
</ol>
<p align="right">(<a href="#top">Back to Top</a>)</p>

<h2 id="questions"> Questions </h2>
<p> <strong> 1. What is the web messaging app the employee used to talk to the attacker? </strong> </p>
<p> In order to identify the messaging app, we can navigate to <strong>\Users\OMEN\AppData\Local\Microsoft\Windows\Notifications</strong> and locate the wpndatabase.db file, which stores the Windows Push Notification if a message was received. We opened the database with DB Browser for SQLite and navigated to <strong>Browse Data -> Table: Notification</strong>. </p>
<img width="1865" height="993" alt="Screenshot 2026-06-23 181911" src="https://github.com/user-attachments/assets/70db3acf-2d4b-445f-81f9-620509a11dc3" />
<p> The most interesting row was the one with the group column Notifications, so I clicked the Payload for more details. </p>
<img width="1565" height="356" alt="Screenshot 2026-06-23 182121" src="https://github.com/user-attachments/assets/1a44878b-a033-421b-aefc-2274c6600330" />
<p> Based on the notification, there was a message from <strong>Telegram</strong> sent from a user Nawaf and the content was "📎 our project templet test.zip,pass:@1122d". </p>
<br>
<p> <strong> 2. What is the password for the protected ZIP file sent by the attacker to the employee? </strong> </p>
<p> Based on the message received, the password of "our project templet test.zip" was <strong>@1122d</strong>. </p>
<br>
<p> <strong> 3. What domain did the attacker use to download the second stage of the malware? </strong> </p>
<p> It was predicted that our project templet test.zip will be downloaded to "/Users/OWEN/Downloads/our project templet test.zip" after clicking the attachment of the message. </p>
<img width="640" height="212" alt="Screenshot 2026-06-23 184020" src="https://github.com/user-attachments/assets/7de68488-696d-49a7-8d00-71c611f37ddd" />
<p> We navigated to the extracted folder "project templet test". </p> 
<img width="623" height="100" alt="Screenshot 2026-06-23 184117" src="https://github.com/user-attachments/assets/3af2a49e-5fad-497a-84ad-7d89ca3c81f0" />
<p> The lnk file templet was suspicious. Therefore I uploaded to VirusTotal for static analysis. </p>
<img width="1816" height="791" alt="Screenshot 2026-06-23 184429" src="https://github.com/user-attachments/assets/e7b0f23a-5d92-4711-827f-13cbf1042f8c" />
<p> 42 out of 62 vendors flagged the lnk file as malicious. It was believed that Owen clicked the malcious lnk file. We can look at the Code Insights to learn how the malware functions. </p>
<img width="1745" height="111" alt="Screenshot 2026-06-23 184606" src="https://github.com/user-attachments/assets/ec929a78-7fab-4ea0-89e1-0c65276853d8" />
<p> When the malicious lnk file was clicked, powershell.exe was spawned to decode the obfuscated malicious script and downloaded the second payload from the attacker server. The script also executed the second payload and finally deleted it. </p>
<img width="867" height="213" alt="Screenshot 2026-06-23 185141" src="https://github.com/user-attachments/assets/86316650-1adc-47dd-b586-92aa181249b0" />
<p> when we navigated to the Relations section and looked at the contacted URLs, we can identify that the lnk file would reach out to a domain <strong>masherofmasters[.]cyou</strong> to download se1.hta, which was believed as the second payload. </p>
<br>
<p> <strong> 4. What is the name of the command that the attacker injected using one of the installed LOLAPPS on the machine to achieve persistence? </strong> </p>
<p> This question took me very long time to think, I first checked what is LOLAPPS on Google and Gemini. </p>
<img width="891" height="322" alt="Screenshot 2026-06-24 132000" src="https://github.com/user-attachments/assets/225a231d-1c90-4c13-a084-cf75faa9f12c" />
<p> LOLAPPS stands for Living Off the Land Applications, which are the third-party application and abused by hackers or pententration testers to gain privileges or achieve persistence without being detected. </p>
<img width="1050" height="527" alt="Screenshot 2026-06-24 132111" src="https://github.com/user-attachments/assets/ae40295c-db26-4161-839e-a2efc1df3241" />
<p> Then we navigated to the <a href="https://lolapps-project.github.io/"> GitHub Repo</a>. </p>
<img width="1043" height="943" alt="Screenshot 2026-06-24 132200" src="https://github.com/user-attachments/assets/bac65668-c06f-47e7-9037-7882818a7fbc" />
<p> The above list of applications can be abused for a specific purpose. </p>
<img width="628" height="142" alt="Screenshot 2026-06-24 134740" src="https://github.com/user-attachments/assets/3184979e-7fe6-43e8-b0e5-9ca98fd180af" />
<img width="625" height="72" alt="Screenshot 2026-06-24 135300" src="https://github.com/user-attachments/assets/5f6f12fb-0d4e-4123-ae19-578fbb119e14" />
<p> When we navigated to <strong>"USERS\OWEN\AppData\Roaming"</strong>, a folder of Greenshot was discovered, which is one of the LOLAPPS! And there was a configuration setting file greenshot.ini inside the folder. </p>
<img width="1211" height="366" alt="Screenshot 2026-06-24 135423" src="https://github.com/user-attachments/assets/f988a2b1-cb12-4286-a54c-0085e3e772b3" />
<p> According to the official website of <a href="https://getgreenshot.org/"> Greenshot</a>, it is a light-weight screenshot software for Windows OS and screenshot can be exported to the printer, Emails and photos. </p>
<img width="1042" height="325" alt="Screenshot 2026-06-24 140143" src="https://github.com/user-attachments/assets/aed04e2f-f64d-4f71-b1ae-f7d8d2e19889" />
<p> As we turned back to the GitHub page and clicked on the <a href="https://lolapps-project.github.io/lolapps/Desktop/greenshot/"> project for Greenshot</a>, hackers can add payloads in "Command", "Commandline.name" and "Argument.name" of [ExternalCommand] plugin to achieve persistence. So let us check the configuration file and search [ExternalCommand]. </p>
<img width="1498" height="477" alt="Screenshot 2026-06-24 140609" src="https://github.com/user-attachments/assets/983b2bf2-1c96-4a91-bbc1-a17f75d8b06e" />
<p> As shown in the screenshot, we can identify that there were 2 commands in the plugin and 1 of them was malicious. </p>
<p> Default </p>
<ul>
  <li> Commands=MS Paint</li>
  <li> Commandline.MS Paint=C:\Windows\System32\mspaint.exe </li>
  <li> Argument.MS Paint="{0}" </li>
</ul>
<p> Malicious </p>
<ul> 
  <li> Commands=jlhgfjhdflghjhuhuh </li>
  <li> Commandline.jlhgfjhdflghjhuhuh=C:\Windows\system32\cmd.exe </li>
  <li> Argument.jlhgfjhdflghjhuhuh=/c "C:\Users\OMEN\AppData\Local\Temp\templet.lnk" </li>
</ul>
<p> When Owen pressed the PrtSc key on the keyboard, the malware templet.lnk was executed by cmd.exe to keep reaching out to the attacker! Therefore the command name was <strong>jlhgfjhdflghjhuhuh</strong>. </p>
<br>
<p> <strong> 5. What is the complete path of the malicious file that the attacker used to achieve persistence? </strong></p>
<p> Based on the last question, the malicious argument showed the completed file path <strong>"C:\Users\OMEN\AppData\Local\Temp\templet.lnk"</strong>. </p>
<br>
<p> <strong> 6. What is the name of the application the attacker utilized for data exfiltration? </strong></p>
<img width="628" height="142" alt="Screenshot 2026-06-24 134740" src="https://github.com/user-attachments/assets/61e1f165-4a14-4fc1-95c6-9ff21945690d" />
<p> In the same folder with Greenshot, there was another interesting folder <strong>AnyDesk</strong> catching my eyes. </p>
<img width="807" height="338" alt="Screenshot 2026-06-24 145941" src="https://github.com/user-attachments/assets/be90574c-49fa-41fa-9b44-be23c271cdb9" />
<img width="1002" height="557" alt="Screenshot 2026-06-24 145950" src="https://github.com/user-attachments/assets/02ca6230-74cf-482d-804e-289ef69fdcb6" />
<p> According to <a href="https://en.wikipedia.org/wiki/AnyDesk"> Wikipedia</a>, AnyDesk is a remote desktop application allowing file transfer between 2 machines. Therefore it was highly possible that <strong>AnyDesk</strong> was used by the attacker for data exfiltration. </p>
<br>
<p> <strong> 7. What is the IP address of the attacker?</strong> </p>
<p> We navigated to the AnyDesk folder and opened the ad.trace file with Timeline Explorer, which contained the log data. </p> 
<img width="1383" height="290" alt="Screenshot 2026-06-24 151221" src="https://github.com/user-attachments/assets/5073bbae-991b-42d5-978a-a0b6e6b09425" />
<p> There was only 1 external IP address connected in the software, believed that <strong>77[.]232[.]122[.]31</strong> was the attacker IP address. </p>
<p align="right">(<a href="#top">Back to Top</a>)</p>

<h2 id="reference"> Reference </h2>
<p> <a href="https://cyberdefenders.org/blueteam-ctf-challenges/achievements/abc1230940/krakenkeylogger/"> CyberDefenders: KrakenKeylogger Lab </p>
<p> <a href="https://lolapps-project.github.io/lolapps/Desktop/greenshot/"> LOLAPPS GitHub Repo for Greenshot </a> </p>
<p> <a href="https://getgreenshot.org/"> Greenshot </a> </p>
<p> <a href="https://en.wikipedia.org/wiki/AnyDesk"> Wikipedia: AnyDesk </a> </p>
<p align="right">(<a href="#top">Back to Top</a>)</p>
