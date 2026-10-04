# **Lockpick2.0 Writeup**
![image](https://github.com/user-attachments/assets/5d0ef072-06ff-434e-8e86-29f0ce9833e8)

We’ve been hit by Ransomware again, but this time the threat actor seems to have upped their skillset. Once again a they’ve managed to encrypt a large set of our files. It is our policy NOT to negotiate with criminals. Please recover the files they have encrypted: we have no other option! Unfortunately our CEO is on a no-tech retreat so can’t be reached. Warning This is a warning that this Sherlock includes software that is going to interact with your computer and files. This software has been intentionally included for educational purposes and is NOT intended to be executed or used otherwise. Always handle such files in isolated, controlled, and secure environments. Once the Sherlock zip has been unzipped, you will find a DANGER.txt file. Please read this to proceed.

**Tools:**
  - IDA
  - PEStudio
  - VirusTotal

**Learned:**
  - Static and dynamic malware analysis
  - Binary Analysis
  - Encryption Process Analysis
  - Code Debugging

### **Question 1**
What type of encryption has been utilised to encrypt the files provided?

Initial analysis we are given a share folder, ds_store file, malware.zip folder. In the share directory I found a countdown.txt, 2 files with the extension of 24bes which I assume to be the encryption. Unzipping the malware folder we find a file named ‘update’.

File entropy is what first comes to mind for this question or anything in relation to understanding what encryption was used… The tool I will leverage is CyberChef (https://gchq.github.io/CyberChef/) and the Entropy portion. Entropy is 8 on each file that is encrypted which is indicative the encryption algorithm has block ciphers.. from what I know AES encryption uses block ciphers during its encryption process

![image](https://github.com/user-attachments/assets/69e30551-cace-4771-ab4a-94fb06366510)

Revesting this after doing my analysis of the malware. I found under the function encrypt_file the encryption being used which was AES

**Answer:** AES

### **Question 2**
Which market is our CEO planning on expanding into? (Please answer with the wording utilised in the PDF)

I will do further analysis of the malware file ‘update’. Using Detect it Easy I can see the file is an Elf file and is packed with UPX. Doing some research I found there was a tool named ‘UPX’ and I can use that to unpack it.

![image](https://github.com/user-attachments/assets/2846dfdb-816b-4117-9de9-7a30425b3385)

Since I know it is packed with UPX I will unpack it using the UPX tool that was used.

![image](https://github.com/user-attachments/assets/bdc00dd4-d5f2-40b1-851d-85f5f42894d3)

I was able to confirm the 24BES is the encryption extension used by looking at the unpacked file in IDA. What I am looking for is what is being used to encrypt the files then from there I can write a script to decrypt it. Using F5 on your keyboard inside of the encrypt_File function it will show the pseudocode

![image](https://github.com/user-attachments/assets/08c2f4b1-3585-47f7-a0e4-974a5a7ad308)

This tells me they are using the AES 256 encryption… now just need to find the key. Under the main function I found the call for the key. I am going to run it through debugging.

![image](https://github.com/user-attachments/assets/1564a0fe-d912-43d5-8cf5-fb044b4d045f)

At this point I felt lost…. so I learned from this persons write up: https://mwalkowski.com/post/sherlock-lockpick-2/. After reading through their explanation I found the URL it reaches out to when doing dynamic analysis. At this point I got the key running a MD5 updater on it. From there following the persons steps I got the same output of successfully decrypting a the files

![image](https://github.com/user-attachments/assets/f7a36f1b-3e1b-4755-ad2a-075ec4f2ee44)

After decoding that I found in the pdf file the name of the market they plan to expand into which is Australian.
Answer: Australian Market

### **Question 3**
Please confirm the name of the bank our CEO would like to takeover?

In the document file I decrypted it and found the bank is Notionwide

![image](https://github.com/user-attachments/assets/93e9bbc6-c588-4a37-8e7d-de0462a3d499)

Answer: Notionwide

### **Question 4**
What is the file name of the key utlised by the attacker?

Through debugging the code and running it I found it makes a call out ot ‘https://rb.gy/3flsy' where it downloads updater

Answer: updater

### **Question 5**
What is the file hash of the key utilised by the attacker?

Running a file hash on the updater file I found its hash

![image](https://github.com/user-attachments/assets/ee2483a9-eab6-412a-8866-ec61e213fede)

Answer: 950efb05238d9893366a816e6609500f

### **Question 6**
What is the BTC wallet address the TA is asking for payment to?

In the countdown.txt file, you will observe the BTC wallet address.

![image](https://github.com/user-attachments/assets/12c73519-4ae2-423d-b5fc-40340e6fc7df)

Answer: 1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2

### **Question 7**
How much is the TA asking for?

Found the answer in the countdown.txt file

![image](https://github.com/user-attachments/assets/d373ee32-7eb9-4eb4-b68c-c8c55c2e67ab)

Answer: £1000000

Question 8
What was used to pack the malware?

I found this earlier through detect it easy

![image](https://github.com/user-attachments/assets/80e8744d-76b3-4ef8-998b-8ae88de4da3f)

Answer: upx

This was a fun malware once I got it started. It was interesting to learn that I could debug the code once I found what encryption algorithm they were using which was AES. From there I can see the key it passed through.
