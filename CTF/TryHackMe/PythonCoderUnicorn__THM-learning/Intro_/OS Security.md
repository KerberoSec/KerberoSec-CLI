The Operating System (OS) is the layer sitting between the hardware and the applications and programs you are running.

ensure data is secure, protecting 3 things:
- `confidentiality` = ensure secret and final files have limited access
- `integrity` = no one can tamper with files on system
- `availability` = the device remains available to use anytime

3 weaknesses targeted by hackers
- authentication & weak passwords
- weak file permissions
- malicious programs

## Authentication and Weak Passwords

Authentication is the act of verifying your identity, be it a local or a remote system. Authentication can be achieved via three main ways:

- [something you know] password or PIN code
- [something you are] fingerprint
- [something you have] phone number for SMS message

access to a remote system, malicious code to get username and password then escalate privileges
- Windows: `administrator`
- `sammie:dragon`

```
ssh sammie@x.x.x.x
johnny: abc123
whoami
root
```

## Network Security

Examples of hardware appliances include:

- `Firewall appliance`: The firewall allows and blocks connections based on a predefined set of rules. It restricts what can enter and what can leave a network.
- `Intrusion Detection System` (IDS) appliance: An IDS detects system and network intrusions and intrusion attempts. It tries to detect attackers’ attempts to break into your network. 
- `Intrusion Prevention System` (IPS) appliance: An IPS blocks detected intrusions and intrusion attempts. It aims to prevent attackers from breaking into your network.
- `Virtual Private Network` (VPN) concentrator appliance: A VPN ensures that the network traffic cannot be read nor altered by a third party. It protects the confidentiality (secrecy) and integrity of the sent data.

### Cyber Kill Chain 

Breaking into a target network usually includes a number of steps.

#CyberKillChain has seven steps:

1. `Recon`: Recon, short for reconnaissance, refers to the step where the attacker tries to learn as much as possible about the target. Information such as the types of servers, operating system, IP addresses, names of users, and email addresses, can help the attack’s success.

2. `Weaponization`: This step refers to preparing a file with a malicious component, for example, to provide the attacker with remote access.

3. `Delivery`: Delivery means delivering the “weaponized” file to the target via any feasible method, such as email or USB flash memory.

4. `Exploitation`: When the user opens the malicious file, their system executes the malicious component.

5. `Installation`: The previous step should install the malware on the target system.

6. `Command & Contro`l (C2): The successful installation of the malware provides the attacker with a command and control ability over the target system.

7. `Actions on Objectives`: After gaining control over one target system, the attacker has achieved their objectives. One example objective is Data Exfiltration (stealing target’s data).

### Nmap practice

#nmap lab

```
# THM VM
# /root/Desktop/Tools
# /usr/share/wordlists

nmap x.x.x.x

21/ftp open
22/ssh open
80/http open

ftp x.x.x.x: anonymous

ls
wget secret.txt
exit

cat secret.txt
ABC789xyz123
```

### Digital Forensics

#Forensics lab
- `sudo apt install poppler-utils` for the `pdfinfo`
- `sudo apt install libimage-exiftool-perl` for the `exiftool` for image meta data

```
# kidnapper sent document
cat Gado kidnapped
cd /root/Rooms/introddigitalforensics

# GPS position: 51° 30' 51.90" N, 0° 5' 38.73" W
# street name: milk street

```

