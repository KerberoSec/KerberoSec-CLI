# XLMRat Lab 🕵️‍♂️

A compromised machine has been flagged due to suspicious network traffic. Your task is to analyze the PCAP file to determine the attack method, identify any malicious payloads, and trace the timeline of events. Focus on how the attacker gained access, what tools or techniques were used, and how the malware operated post-compromise.

---

##  Q1 -The attacker successfully executed a command to download the first stage of the malware. What is the URL from which the first malware stage was installed?

I filtered the network traffic in Wireshark using the http filter to focus only on HTTP requests . By checking the GET requests, I found the URL used by the attacker to download the first stage of the malware.

<img width="1687" height="882" alt="^1" src="https://github.com/user-attachments/assets/7a994843-1d0c-48eb-a468-94102032e48d" />

##  Q2 -Which hosting provider owns the associated IP address?

Check the IP , VirusTtotal

<img width="1812" height="370" alt="3" src="https://github.com/user-attachments/assets/4f675b53-7052-4de7-8299-a7aba311b0ff" />

##  Q3 -By analyzing the malicious scripts, two payloads were identified: a loader and a secondary executable. What is the SHA256 of the malware executable?

First, I opened the script using the “Follow HTTP Stream” option in Wireshark to view the full HTTP request and script content. Then, I extracted the encoded payload from the script and saw it was in hex format (one was the loader and the other was the actual malware executable) . I used CyberChef to convert the hex into raw binary, and then calculated its SHA256 hash directly in CyberChef to get the hash of the malware executable.

<img width="977" height="532" alt="2" src="https://github.com/user-attachments/assets/f3784822-60d7-42f2-a7b7-ce0ffd5c38d0" />

<img width="1271" height="872" alt="4" src="https://github.com/user-attachments/assets/629c7bd4-7491-4433-a7c5-3b39305e3476" />

<img width="1518" height="625" alt="5" src="https://github.com/user-attachments/assets/ddb4daa1-7463-4c2d-ad46-9fe7b646b6b8" />

##  Q4 -What is the malware family label based on Alibaba?

I uploaded the malware sample to VirusTotal and checked the detection results. Alibaba identified the family as AsyncRAT. It's a remote access trojan (RAT) used to control infected machines remotely. AsyncRAT supports keylogging, screen capture, command execution, and more, often used for stealing sensitive data or maintaining persistence on a target system.

<img width="1886" height="753" alt="6" src="https://github.com/user-attachments/assets/9cf3d77e-fb5f-4692-9bb9-ac733556efb7" />

##  Q5 -What is the timestamp of the malware's creation?

Details :

<img width="648" height="145" alt="7" src="https://github.com/user-attachments/assets/32533848-569f-4980-baa8-c0ba856e49d8" />

##  Q6 -Which LOLBin is leveraged for stealthy process execution in this script? Provide the full path.

<img width="948" height="106" alt="8" src="https://github.com/user-attachments/assets/52370dc4-da68-45cc-aa25-ef17d69d305e" />

$AC = $NA + 'osof#####t.NET\Fra###mework\v4.0.303###19\R##egSvc#####s.exe' -replace '#', ''
while $NA = 'C:\W#######indow############s\Mi####cr' -replace '#', ''

C:\Windows\Microsoft + osoft.NET\Framework\v4.0.30319\RegSvcs.exe = C:\Windows\Microsoft.NET\Framework\v4.0.30319\RegSvcs.exe

##  Q7 -The script is designed to drop several files. List the names of the files dropped by the script.

The script drops these files in C:\Users\Public\:

Conted.ps1: a PowerShell script containing the main payload execution logic.

Conted.bat: a batch file that runs the PowerShell script silently.

Conted.vbs: a VBScript that runs the batch file invisibly (hidden window).

