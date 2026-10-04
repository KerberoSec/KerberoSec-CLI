# **Noxious Writeup**
![image](https://github.com/user-attachments/assets/722586af-6a6b-4da1-8db6-bc6db8449eaf)

We were giving a network capture to threat hunting on the network vlan where the AD server is at to investigate LLMNR poisoning

**Tools:**
- Hashcat
- Wireshark

### **Question 1**
Its suspected by the security team that there was a rogue device in Forela’s internal network running responder tool to perform an LLMNR Poisoning attack. Please find the malicious IP Address of the machine.

Since LLMNR is a protocol I will filter my results to it in Wireshark. I notice some traffic coming in but doing some google searching I found it was a UDP port running over 5355 so, my thought process was if I filter on that I should see all the devices talking to it.

We see several devices talking on the LLMNR protocol:

- 172.17.79.129: Workstation 1
- 172.17.79.136: Workstation 2
- 224.0.0.252: DC01
- 72.17.79.135: Rogue Device

In looking into it I found that 172.17.79.135 is the rogue device as it gets all the listed above IP’s to talk to it trying to help fulfill their LLMNR request.

![image](https://github.com/user-attachments/assets/ad64d042-c5a4-4eff-962f-4eeaf624f329)

Answer: 172.17.79.135

### **Question 2**
What is the hostname of the rogue machine?

There are several ways I believe to solve this but the best one I think is using the DHCP protocol which assigns the devices IP but will also show me the device name as a device has to have a name when joining a network. I created a filter to filter on the rouge devices IP and DHCP: ip.addr ==172.17.79.135 && dhcp

This was beneficial as it showed me the DHCP request that the rogue device made to get an IP on the network. Looking into the ‘DHCP Request I had a suspicion this would show me the hostname of the rogue device and it did

![image](https://github.com/user-attachments/assets/990722dd-9cb0-402a-b2d8-90d9b95d644e)

Answer: kali

### **Question 3**
Now we need to confirm whether the attacker captured the user’s hash and it is crackable!! What is the username whose hash was captured?

Since this is a .pcap file and the network protocols that encrypt traffic are TLS/SSL that is where I looked first. First, I filtered on the rogue device IP then I added if it was using TLS encryption. Looking through the logs I saw an info record of an ignored record and noticed it had a username but more importantly it said ‘mstshash’ which told me this was a hash. john.deacon appears to be the username on the 1st workstation

![image](https://github.com/user-attachments/assets/fa6a1707-6cd5-4047-874f-22c46879d180)

Answer: john.deacon

### **Question 4**
In NTLM traffic we can see that the victim credentials were relayed multiple times to the attacker’s machine. When were the hashes captured the First time?

My thought process behind this one since its asking about the use of NTLM and how many times the creds were relayed back to the machine. I thought that if I go to the first entry of the NTLM authentication process since that is when it begins to try to authenticate the username to the threat actors machine that is when the relay began. I filtered on the smb2 protocol and found the first entry of the NTLMSSP authentication and found this was the first time the hashes were captured

![image](https://github.com/user-attachments/assets/e3b18b05-efe7-41e8-acb7-70b8fd519137)

Answer: 2024-06: 24 11:18:30

### **Question 5**
What was the typo made by the victim when navigating to the file share that caused his credentials to be leaked?

This one was harder to find. Earlier I saw weird traffic come across where I saw input saying ‘DCC01’ which I could tell someone either mistyped or the DC is misnamed for some reason. So, I tried the answer and it worked. To better explain how this leaked their credentials. In the picture below, we see the input ‘dcc01’ which was the victim mistyping DC01. Since their computer could not resolve DCC01 using DNS as that was not a real hostname… it defaulted to using the next protocol LLMNR which exposed their creds through this packet capture

![image](https://github.com/user-attachments/assets/9e4c5b12-ab01-4de2-975c-a6f4fa22ced0)

Answer: DCC01

### **Question 6**
To get the actual credentials of the victim user we need to stitch together multiple values from the NTLM negotiation packets. What is the NTLM server challenge value?

I had to research what the NTLM server challenge was and after I found where the challenge response was. The NTLM server challenge value is important to the authentication process of how passwords are exchanged over the network. The server will send a challenge to the client where the client responds by giving it their password hash. The server then takes the hash of the password provided and the challenge and compares them to authenticate this is a legit user

![image](https://github.com/user-attachments/assets/520cf32a-a4ae-4a3d-aa8a-fb8ba4e00de4)

By doing a simple filter on NTLMSSP that is where I found the handshake process going on but more importantly the NTLM server challenge

Answer: 601019d191f054f1

### **Question 7**
Now doing something similar find the NTProofStr value.

Doing something similar I searched for the string ntproofstr and in the NTLMSSP_AUTH log is where I found this NTProofStr answer. The reason the NTProofStr is important is it is apart of the authentication process which helps confirm that the NTLM authentication was used furthermore, this highlights the version of the protocol which was v2. Overall, this helps me understand that the NTLM authentication was in use passing the hash of the password back-and-forth between the server and client

![image](https://github.com/user-attachments/assets/039c8da1-b83c-43de-a753-b0560db70f2a)

Answer: c0cc803a6d9fb5a9082253a04dbd4cd4

### **Question 8**
To test the password complexity, try recovering the password from the information found from packet capture. This is a crucial step as this way we can find whether the attacker was able to crack this and how quickly.

I had to take a hint as I was not fully sure what to do. So, it told me to gather all the hashing stuff thus far and use hashcat. Here is what I crafted from all my hashes:

john.deacon: Forela:601019d191f054f1:c0cc803a6d9fb5a9082253a04dbd4cd4:010100000000000080e4d59406c6da01cc3dcfc0de9b5f2600000000020008004e0042004600590001001e00570049004e002d00360036004100530035004c003100470052005700540004003400570049004e002d00360036

Here is the command I ran in hashcat: hashcat -a0 -m5600 hashfile.txt /usr/share/wordlists/rockyou.txt

Answer: NotMyPassword0K?

### **Question 9**
Just to get more context surrounding the incident, what is the actual file share that the victim was trying to navigate to?

My thought process here was I understand the SMB2 protocol and its purpose. So, I was thinking that this is where I would find where the TA was connecting to a file share they should not have. I found a few shares but this one given its name is what stuck out to me

![image](https://github.com/user-attachments/assets/d5e01de3-ca86-4b91-b564-71fcf3e7e973)

Answer: dc01 dc-confidential
