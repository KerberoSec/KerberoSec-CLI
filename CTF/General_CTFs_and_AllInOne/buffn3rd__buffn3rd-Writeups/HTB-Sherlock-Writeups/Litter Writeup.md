# **Litter Writeup**
![image](https://github.com/user-attachments/assets/a8569433-f278-4b92-9b3b-5a0710a0cf1b)

Khalid has just logged onto a host that he and his team use as a testing host for many different purposes. It’s off their corporate network but has access to lots of resources on the network. The host is used as a dumping ground for a lot of people at the company, but it’s very useful, so no one has raised any issues. Little does Khalid know; the machine has been compromised and company information that should not have been on there has now been stolen: it’s up to you to figure out what has happened and what data has been taken.

**Tools:**
- Wireshark
**Learned:**
- Network Traffic Analysis
- Intrusion Analysis
- DNS Tunneling Analysis

### **Question 1**
At a glance, what protocol seems to be suspect in this attack?

I filtered on several protocols I know are abused by TA such as HTTP and DNS. I saw alot of traffic on DNS

![image](https://github.com/user-attachments/assets/0e891c8d-f627-4526-a8ca-a17bf6880e05)

**Answer:** DNS
### **Question 2**
There seems to be a lot of traffic between our host and another, what is the IP address of the suspect host?

This was easy to find scrolling through the DNS logs

![image](https://github.com/user-attachments/assets/58868667-daf9-4593-a5dd-f0b21e3ef34f)

**Answer:** 192.168.157.145
### **Question 3**
What is the first command the attacker sends to the client?

I am noticing signs of DNS tunneling which is an attack where someone will encode data an abuse the DNS protocol. They will transmit this info between them and a compromised transmission and the attacker DNS server receives the qureies, decodes the data, and will process any commands and gives a response back. I see this as I saw several logs where the length of the DNS query was massive and it what seemed at first was a bunch of garbage but then I remembered from graduate school signs of DNS tunneling are where in a packet capture you will see the TA communicating with a device and they will send encoded data over the DNS protocol to it that has commands in it. See my first artifact below of signs of DNS tunneling

![image](https://github.com/user-attachments/assets/72db5191-4f43-43af-8105-21fb969cbe00)

I went ahead and followed that UDP Stream and copied the entire body text and used CyberChef to convert it From Hex. I found the command the attacker used

![image](https://github.com/user-attachments/assets/147f9523-6559-4d20-a783-4219338ad504)

**Answer:** whoami
### **Question 4**
What is the version of the DNS tunneling tool the attacker is using?

Following the same UDP stream I continued scrolling down to gather more info and saw the tool they used was 'dnscat2' which is a common DNS tunneling tool and its version was 0.0.7

![image](https://github.com/user-attachments/assets/668ee7f5-7ea9-4b17-9baa-0bce1a7287b1)

**Answer:** 0.07
### **Question 5**
The attackers attempts to rename the tool they accidentally left on the clients host. What do they name it to?

Seraching by 'ren' its common command to rename a file I found it.

![image](https://github.com/user-attachments/assets/8d7a569b-2df7-42e2-915d-e417a13137a6)

**Answer:** win_installer.exe
### **Question 6**
The attacker attempts to enumerate the users cloud storage. How many files do they locate in their cloud storage directory?

I spent time searching for OneDrive since this is a windows machine this happened on. I found OneDrive in hte udp stream but didn't find any info on them enumerating it.

**Answer:** 0
### **Question 7**
What is the full location of the PII file that was stolen?

I continued digging in the captured UDP stream and found the location of the PII file the TA staged.

![image](https://github.com/user-attachments/assets/d161d0c1-580b-4efd-b0a2-2251c4aac1d1)

**Answer:** C:\users\test\documents\client data optimisation\user details.csv
### **Question 8**
Exactly how many customer PII records were stolen?

I saw the data that was being exfilitrated and I saw the contents being packed in the .csv and it was 720 but there was 1 account it didn't factor at the end of the excel sheet.

![image](https://github.com/user-attachments/assets/c70edeeb-6298-4fce-a733-5d5de3adb7e9)

**Answer:** 721

Overall, this was a fun way to recognize a DNS tunnelling attack and how sophisticated they can be and pretty sneaky! I mean the TA was able to pass commands to the DNS server to execute on their behalf getting the name of the PC, changing directories, downloading files, and exfiltrating data.
