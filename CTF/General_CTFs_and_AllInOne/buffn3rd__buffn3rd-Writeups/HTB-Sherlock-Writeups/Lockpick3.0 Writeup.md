# **Lockpick3.0 Writeup**
![image](https://github.com/user-attachments/assets/b5385902-5143-4496-baea-2f9395c5eebe)

The threat actors of the Lockpick variant of Ransomware seem to have increased their skillset. Thankfully on this occasion they only hit a development, non production server. We require your assistance performing some reverse engineering of the payload in addition to some analysis of some relevant artifacts. Interestingly we can’t find evidence of remote access so there is likely an insider threat…. Good luck! Please note on the day of release this is being utilised for a workshop, however will still be available (and free).

**Tools:**
  - Detect it easy
  - Ghidra
  - Volatility3

**Learned:**
  - Static and Dynamic binary analysis
  - Memory Forensics
### **Question 1**
Please confirm the file hash of the malware? (MD5)

Initial analysis we are given 3 files. Ubuntu-client, ubuntu client vmem and its .vmsn which is needed to perform memory analysis. I used detect it easy on the ubuntu file to gather information. We can see it was compiled using GCC and C/C++ as the language used

![image](https://github.com/user-attachments/assets/6c90d601-af6b-4d78-9a45-bfc94a76473d)

This information is relevant for when we need to do further analysis. I suspect the ubuntu-client file is the malware I will get its MD5 hash. This indeed was the malware file

![image](https://github.com/user-attachments/assets/13892a85-ebce-440e-813a-eb5660366ddf)

Answer: a2444b61b65be96fc2e65924dee8febd

### **Question 2**
Please confirm the XOR string utilised by the attacker for obfuscation?

First, lets discuss what an XOR string is and why its important. XOR is a technique used in malicious code to obfuscate it. It is a bitwise operation that can transform data to make it hard to read. It can help you understand the obfuscations

I learned a trick. I did some stringing on the memory for the malware file. I found that when the malware was ran on the virtual machine it will show the XOR string that was used

![image](https://github.com/user-attachments/assets/f2b24d2f-ed14-4e6c-b639-55667202f52d)

Answer: xGonnaGiveIt2Ya

Question 3
What is the API endpoint utilised to retrieve the key?

From my initial analysis I found that the file is stripped meaning we cannot debug it because the debugging info isn't there anymore

![image](https://github.com/user-attachments/assets/c4efa6f9-b13d-4dc9-82e1-f97d4d095c03)

In Ghidra, I found where I believe the URL is being made out… a curl command that appends the content type to it and I believe I see part of the API being connect

Here I found another URL being built out. Still unsure I leveraged someone else's write up to understand how to resolve this.

![image](https://github.com/user-attachments/assets/3e512b20-84c3-4129-b33d-f080c978b45d)

Taking it up to that point I was happy. Utilizing this person writeup I was almost there. Following their steps in GBD I was able to see the API finally.

Answer: https://plankton-app-3qigq.ondigitalocean.app/connect

### **Question 4**
What is the API endpoint utilised for upload of files?

This is actually solved from when you do a strings on the memory file. You will observer a /connect and a /upload. The connect was for when the XOR function was called and then on the endpoint it would connect back to that API. The /upload is where files were uploaded to be exfilitrated off of PCs.

![image](https://github.com/user-attachments/assets/58bd24de-45c4-46d1-a536-8200a9f22207)

Answer: https://plankton-app-3qigq.ondigitalocean.app/upload/

### **Question 5**
What is the name of the service created by the malware?

This was a bit tricky to find. But after downloading all the symbols known for Linux. I was able to start poking around. I struggled finding what I was looking for which was a server named “ubuntu….” but finally I found this plugin ‘linux.pagecache.Files’. This allowed for me to see the page cache for the Linux memory. Or what was in it. I did a grep of “ubuntu” and I found the service here: /etc/systemd/system/ubuntu_running.service

Answer: ubuntu_running.service

### **Question 6**
What is the technique ID utilised by the attacker for persistence?

Upt to this point we understand that this malware reaches out to an endpoint where it either connects or exfil files out. The last question we found the service that was created to give the user persistence. Using MITRE ATT&CK, I found that this is known as T1543.002 “Create or Modify System Process: Systemd Service”

Answer: T1543.002
