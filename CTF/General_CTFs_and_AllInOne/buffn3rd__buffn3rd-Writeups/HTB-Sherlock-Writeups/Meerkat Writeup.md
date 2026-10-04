# **Meerkat Writeup**
![image](https://github.com/user-attachments/assets/7329a1b1-651f-408a-bd66-0d336710367c)

As a fast-growing startup, Forela has been utilising a business management platform. Unfortunately, our documentation is scarce, and our administrators aren't the most security aware. As our new security provider we'd like you to have a look at some PCAP and log data we have exported to confirm if we have (or have not) been compromised.

**Tools:**
- Wireshark
**Learn:**
- Packet Analysis

### **Question 1**
We believe our Business Management Platform server has been compromised. Please can you confirm the name of the application running?

Open the packet capture that is provided in the files. The best way to understand the application running would to understand the application layer in the OSI model. THerefore, I am going to look at HTTP traffic first as that is my usual start to investigations since it is an unencrypted protocol. Appears an IP of 156.146.62.213 is trying to connect to 'Bonita'. After doing some research that is the application.

![image](https://github.com/user-attachments/assets/5706c013-ed9e-492e-b7b4-1ff1797a0c82)

**Answer:** BonitaSoft

### **Question 2**
We believe the attacker may have used a subset of the brute forcing attack category: what is the name of the attack carried out?

If this is a subset of brute forcing the attack could be dictionary & hybrid attacks, credential stuffing, password sparying, mask attack etc. I suspect it will be one of those but I will look at each POST http response and look at the information that was transmitted.

![image](https://github.com/user-attachments/assets/ec660524-9319-4948-810c-8372dae0cf51)

Those are just a few samples of the various inputs I saw. Looking at the rest it is various users/passwords used which in term means they did a credential stuffing attack

**Answer:** Credential Stuffing

### **Question 3**
Does the vulnerability exploited have a CVE assigned: and if so, which one?

I will have to do further analysis before answering this. Coming back to this now that I understand the nature fo everything better I want to actually use the .json file. Because I understand the attack was a credential stuffing and they used an RCE package to run some command lines getting shell access on the server. I did a quick search for 'Login' as I was wondering what was out there a stumbled across this

![image](https://github.com/user-attachments/assets/ba44e604-1910-4eaf-8d38-ac5fd36620de)

**Answer:** CVE-2022-25237

### **Question 4**
Which string was appended to the API URL path to bypass the authorization filter by the attacker's exploit?

Here I will still stay filtered on 'http' and I will look for a http status code of 200 since the questions indicates they were able to bypass the authentication. Indeed the attacker did append a string to bypass authnetication by concatenating this string in the API page upload.

![image](https://github.com/user-attachments/assets/79568c5d-af29-431e-a19c-f217c2f2a497)

**Answer:** i18ntranslation

### **Question 5**
How many combinations of usernames and passwords were used in the credential stuffing attack?

To solve this I built a filter 'http.response.code == 401' to filter only on http responses of 401. HTTP status code 401 means unauthorized which tells me anyone who has tried credentials that are not authorized to login to somewhere. Searching for that we see 118 are displayed but filtering it further down througha  csv I found 56 unique credentials were used

![image](https://github.com/user-attachments/assets/c074a045-443d-45e7-a8a2-5eab82fbf260)

**Answer:** 56

### **Question 6**
Which username and password combination was successful?

This pair of creds were successful

![image](https://github.com/user-attachments/assets/a9549d80-8a8b-4a98-84c9-83843393625e)

**Answer:** seb.broom@forela.co.uk:g0vernm3nt

### **Question 7**
If any, which text sharing site did the attacker utilise?

I continued to dig through the HTTP logs I found where they got an RCE package across through the API and then shortly after I saw this text sharing site where they added the rce extension package allowing them to get a wget command through

![image](https://github.com/user-attachments/assets/1d7574ab-85ff-4496-bb0b-069a3b6bd6f3)

**Answer:** pastes.io

### **Question 8**
Please provide the filename of the public key used by the attacker to gain persistence on our host.

The attacker used a curl command to pull down the script from pastes.io. The file name is in the picture

![image](https://github.com/user-attachments/assets/c33b1b6c-f423-48d8-a5b9-95e1b64f044b)

**Answer:** hffgra4unv

### **Question 9**
Can you confirmed the file modified by the attacker to gain persistence?

Looks like I captured this input above in the file from pastes.io

**Answer:** /home/ubuntu/.ssh/authorized_keys

### **Question 10**
Can you confirm the MITRE technique ID of this type of persistence mechanism?

Let's talk about what we know for artifacts so far. We know the attack did a credential stuffing attack, then appended to the API a string that bypassed the authentication and then the attacker found creds that worked. From there the attacker installed an rce extension package where they pulled a script down manipulating the authorized ssh keys. Following that on MITRE ATT&CK we can see it is this: https://attack.mitre.org/techniques/T1098/004/

**Answer:** T1098.004
