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

<h2 align="center"> CyberDefenders Write-up: BlackEnergy </h2>
<h2 id="scenario"> Scenario </h2>
<p> A multinational corporation has suffered a cyber attack, resulting in the theft of sensitive data. The attack employed a previously unseen variant of the BlackEnergy v2 malware. The company's security team has obtained a memory dump from the infected machine and is seeking your expertise as a SOC analyst to analyze the dump in order to understand the scope and impact of the attack.</p>
<p align="right">(<a href="#top">Back to Top</a>)</p>

<h2 id="tools-used"> Tools Used </h2>
<ol>
  <li> <a href="https://github.com/volatilityfoundation/volatility/releases"> Volatility 2 </a> </li>
  <li> <a href="https://blog.onfvp.com/post/volatility-cheatsheet/"> Volatility 3 CheatSheet </a> </li>
</ol>
<h3> Installation of Volatility 2 </h3>
<p> Step 1: Download Volatility 2 Standalone Executable </p> 
<img width="1132" height="439" alt="Screenshot 2026-06-19 194047" src="https://github.com/user-attachments/assets/aa27fa48-6446-4c72-b9ec-ecb1ce12e8d8" />
<p> Download the Volatility 2 standalone executable from the <a href="https://github.com/volatilityfoundation/volatility/releases"> offical GitHub repository. </a> </p>
<p> Step 2: Verify Installation </p>
<pre> <code lang="cmd"> cd path\\to\\volatility-2.6 </code> </pre>
<pre> <code lang="cmd"> .\volatility_2.6_win64_standalone.exe -h </code> </pre>
<img width="871" height="700" alt="image" src="https://github.com/user-attachments/assets/fcd6b93b-e627-44dc-bdfa-e0e96c6004e1" />
<p> The help menu will be shown if the installation is successful. Plugins can also be found in the help menu for memory analysis. </p>
<p align="right">(<a href="#top">Back to Top</a>)</p>

<h2 id="questions"> Questions </h2>
<p> <strong> 1. Which volatility profile would be best for this machine? </strong> </p>
<p> This is the very first thing to do when analyzing the memory dump with Volatility 2. After finding the profile of the investigated machine, volatility 2 can analyze the data from the memory dump with this profile. </p>
<pre> <code lang="cmd"> volatility_2.6_win64_standalone.exe -f "path\\to\\CYBERDEF-567078-20230213-171333.raw" imageinfo </code> </pre>
<img width="1238" height="257" alt="Screenshot 2026-06-19 170244" src="https://github.com/user-attachments/assets/bfb6549d-d31e-4a5f-9bdb-8bfe9d548e0f" />
<p> the suggested profiles were WinXPSP2x86 and WinXPSP3x86 but the best for the machine was <strong>WinXPSP2x86 </strong>. </p>
<br>
<p> <strong> 2. How many processes were running when the image was acquired? </strong> </p>
<p> To find all processes running in the memory captured, we used the plugin pslist. </p>
<pre> <code lang="cmd"> volatility_2.6_win64_standalone.exe -f "path\\to\\CYBERDEF-567078-20230213-171333.raw" --profile WinXPSP2x86 pslist </code> </pre>
<img width="1387" height="480" alt="Screenshot 2026-06-19 171323" src="https://github.com/user-attachments/assets/66d5aca5-e416-4175-852c-754dbe3ab656" />
<p> There were total 25 processes running in the memory. However 6 of them exited, indicating that those processes terminated. Therefore, 25: 6 = <strong>19 </strong>were running in the memory when captured.</p>
<br>
<p> <strong> 3. What is the process ID of cmd.exe? </strong> </p>
<p> According to the above screenshot, the process ID of cmd.exe was <strong> 1960</strong>. </p>
<br>
<p> <strong> 4. What is the name of the most suspicious process? </strong> </p>
<p> In my practice I would look at the parent-child relationship of the processes to predict which the abnormal process was. However in this case, <strong> rootkit.exe</strong> caught my eyes. </p>
<br>
<p> <strong> 5. Which process shows the highest likelihood of code injection? </strong> </p>
<p> In this question, we can use malfind plugin to look at the memory allocations which malcious code could be written in the memory space. </p>
<pre> <code lang="cmd"> volatility_2.6_win64_standalone.exe -f "path\\to\\CYBERDEF-567078-20230213-171333.raw" --profile WinXPSP2x86 malfind </code> </pre>
<img width="672" height="678" alt="Screenshot 2026-06-19 172252" src="https://github.com/user-attachments/assets/520aa7e1-5539-4ee0-a422-b31b230f769a" />
<p> At the bottom of the result, a hex dump of the memory space marked as PAGE_EXECUTE_READWRITE showed the bytes 4D 5A, the MZ header in the process <strong>svchost.exe</strong> (PID: 880), indicating that a standalone Windows executable was injected and could be executed in the memory space, which was highly suspicious. </p>
<br>
<p> <strong> 6. There is an odd file referenced in the recent process. Provide the full path of that file.</strong> </p>
<p> In order to find the file dropped by the suspicious process svchost.exe (PID: 880), we can use handles plugin, which looked at the process interacting with the kernel mode resources. </p>
<pre> <code lang="cmd"> volatility_2.6_win64_standalone.exe -f "path\\to\\CYBERDEF-567078-20230213-171333.raw" --profile WinXPSP2x86 -p 880 -t file handles </code> </pre>
<p> -p 880: The process ID of svchost.exe </p>
<p> -t file: only showed the drooped files </p>
<img width="1512" height="417" alt="Screenshot 2026-06-19 174602" src="https://github.com/user-attachments/assets/a9b3c439-2fe8-4bae-b2e7-673d28089769" />
<p> According to the result, the file path of<strong> C:\WINDOWS\system32\drivers\str.sys</strong> was suspicious. .sys file is a kernel-mode driver running at ring 0, directly interacting with the hardware, invading detection by the EDR and AV! </p>
<br>
<p> <strong> 7. What is the name of the injected DLL file loaded from the recent process? </strong> </p>
<p> In order to find the .dll libraries loaded by the suspicious process svchost.exe (PID: 880), we can use ldrmodules plugin. </p>
<pre> <code lang="cmd"> volatility_2.6_win64_standalone.exe -f "path\\to\\CYBERDEF-567078-20230213-171333.raw" --profile WinXPSP2x86 -p 880 ldrmodules </code> </pre>
<p> -p 880: The process ID of svchost.exe </p>
<img width="1491" height="808" alt="Screenshot 2026-06-19 182832" src="https://github.com/user-attachments/assets/02140617-07c7-4680-9670-a0600ef8bf1e" />
<p> According to the result, only <strong>msxml3r.dll</strong> showed False flags in 3 columns, indicating that the library was not officially registed while running in the memory to invade detection by AV or EDR. </p>
<br>
<p> <strong> 8. What is the base address of the injected DLL? </strong> </p>
<p> At first i thought it was 0x9a0000 from the above screenshot, but actually we need to use malfind plugin to find the base memory of the svchost.exe </p>
<pre> <code lang="cmd"> volatility_2.6_win64_standalone.exe -f "path\\to\\CYBERDEF-567078-20230213-171333.raw" --profile WinXPSP2x86 malfind </code> </pre>
<img width="672" height="675" alt="Screenshot 2026-06-19 183503" src="https://github.com/user-attachments/assets/70a4d715-9b77-4928-9be5-7fb424d25d45" />
<p> the base address was </strong>0x980000</strong>. </p>
<p align="right">(<a href="#top">Back to Top</a>)</p>

<h2 id="reference"> Reference </h2>
<p> <a href="https://cyberdefenders.org/blueteam-ctf-challenges/achievements/abc1230940/blackenergy/"> CyberDefenders: BlackEnergy Lab </a> </p>
<p align="right">(<a href="#top">Back to Top</a>)</p>
