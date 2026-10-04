# Social Engineering Attack Simulation Using SET

> ⚠️ **Disclaimer:** This project was performed only in a controlled lab environment for cybersecurity education and authorized testing. No real users, credentials, or third-party systems were targeted. The purpose of this project is to understand how social engineering attacks work so that organizations and users can better defend against them.

## 📌 Project Overview

As part of my hands-on cybersecurity learning journey, I practiced a controlled social engineering attack simulation using the **Social-Engineer Toolkit (SET)**.

The objective of this lab was to understand the complete attack flow from the attacker's perspective in a safe environment.

The practical exercise included:

- Using the Social-Engineer Toolkit (SET)
- Exploring Website Attack Vectors
- Cloning a webpage in a controlled lab
- Creating a demonstration payload
- Configuring a listener in a lab environment
- Hosting controlled files using a local HTTP server
- Observing how submitted data can be captured
- Verifying a successful session inside the isolated lab
- Understanding the security risks associated with social engineering

This project helped me understand an important cybersecurity lesson:

> Technical security alone is not enough. Human interaction is often one of the biggest attack surfaces.

---

## 🎯 Learning Objectives

The main objectives of this lab were:

1. Understand the basics of social engineering.
2. Learn how the Social-Engineer Toolkit works.
3. Explore webpage cloning in a controlled environment.
4. Understand how fake login pages can be used to capture submitted information.
5. Learn the concept of payload creation and listener configuration.
6. Understand the importance of network configuration.
7. Observe how a simulated compromised session appears in a controlled environment.
8. Learn how organizations can defend against these techniques.

# 🛠️ Tools Used

| Tool | Purpose |
|---|---|
| Kali Linux | Attack simulation environment |
| Social-Engineer Toolkit (SET) | Social engineering simulation |
| Metasploit Framework | Controlled listener and session management |
| Python HTTP Server | Local file hosting |
| Web Browser | Accessing the cloned webpage |
| DVWA | Deliberately vulnerable web application used in the lab |

# 🧪 Lab Environment

This project was performed in an isolated and authorized environment.

The environment contained:

- An attacker/testing machine running Kali Linux
- A deliberately vulnerable web application
- A controlled victim/test machine
- Private laboratory network addresses
- No real users or production systems

Using an isolated environment is important because social engineering and credential-harvesting techniques can cause serious harm if performed without authorization.

# 🔄 Attack Simulation Workflow

The overall workflow followed in this lab was:<br>

SET<br>

Social Engineering Attacks<br>
 
Website Attack Vectors<br>
 
Credential Harvester / Site Cloning <br>
 
Controlled Webpage Clone<br>
 
Test User Interaction<br>
 
Submitted Data Captured in Lab<br>
 
Payload Demonstration<br>
 
Listener Configuration<br>
 
Controlled Session Verification

### Step 1: Launching the Social-Engineer Toolkit

The first step was to launch the Social-Engineer Toolkit.

SET provides multiple modules for security testing and social engineering simulations.

The main menu included options such as:

Social-Engineering Attacks
Penetration Testing
Third-Party Modules
Toolkit Configuration

<img width="730" height="519" alt="1" src="https://github.com/user-attachments/assets/fbf33c09-8811-4195-a11d-f73dba68d819" />

### Step 2: Exploring Social Engineering Attack Options

After entering the Social Engineering section, I explored different attack vectors available in SET.

The toolkit provides multiple modules, including:

Spear-phishing simulations
Website attack vectors
Infectious media demonstrations
Payload creation
PowerShell-related modules
Other testing modules

For this project, the focus was on the Website Attack Vector.
<img width="731" height="293" alt="2" src="https://github.com/user-attachments/assets/60e30391-e228-4ee9-b3a5-5af736fc941c" />

### Step 3: Exploring Website Attack Methods

Inside the Website Attack Vector section, SET displayed different web-based attack simulation methods.

Examples included:

Credential Harvester
Tabnabbing
Multi-Attack Web Method
Other browser-focused testing modules

For this controlled exercise, I selected the webpage cloning and credential-harvesting demonstration.

<img width="586" height="212" alt="3" src="https://github.com/user-attachments/assets/eaf58a75-3efd-414d-a1a1-08e25df5ed76" />

### Step 4: Selecting the Site Cloning Method

The next step was selecting the website cloning option.

SET provides different approaches for preparing a testing webpage, including:

Web Templates
Site Cloner
Custom Import

For this exercise, I used the site cloning functionality against a deliberately vulnerable application available inside my laboratory environment.

<img width="714" height="130" alt="4" src="https://github.com/user-attachments/assets/28dc2a3b-513c-41ee-b97b-a6e5a10060f8" />

### Step 5: Configuring the Controlled Clone

SET requested information required to host and process the cloned page.

The target webpage used in this project was a deliberately vulnerable web application running inside the lab.

The purpose was not to impersonate a real public service or target real users.

Instead, the exercise demonstrated an important concept:

If a user cannot distinguish between a legitimate page and a malicious clone, the user may unknowingly submit sensitive information.

<img width="615" height="271" alt="5" src="https://github.com/user-attachments/assets/b48579c7-803a-4107-8b4d-1f398f53295a" />

### Step 6: Understanding Credential Capture

After the cloned webpage was prepared, SET started a local credential-harvesting service.

When a test user submitted data through the controlled cloned page, the toolkit logged the submitted fields.

This demonstrates why phishing pages are dangerous.

The important lesson from this stage was that an attacker does not always need to exploit a complex software vulnerability. Sometimes, convincing a user to voluntarily submit information can be enough.

<img width="642" height="203" alt="6" src="https://github.com/user-attachments/assets/ccbbe323-5a05-4db2-9829-092fbd405a8a" />
<img width="645" height="381" alt="7" src="https://github.com/user-attachments/assets/72eeb59d-b3ed-4888-81c7-d14aace52d54" />
<img width="610" height="433" alt="8" src="https://github.com/user-attachments/assets/24075efe-df12-47ed-b569-0b567c4671be" />

🔒 Sensitive values have been intentionally omitted from this documentation.

### Step 7: Creating a Demonstration Payload

The next part of the lab focused on understanding payload creation.

SET provides options for creating payload demonstrations and connecting them with a listener.

The available options included different types of reverse connections and testing payloads.

For this project, the payload functionality was used only inside the authorized lab environment.

<img width="590" height="326" alt="1" src="https://github.com/user-attachments/assets/268de94f-b3aa-4fa2-bfea-87a347d6788b" />
<img width="408" height="284" alt="2" src="https://github.com/user-attachments/assets/9572ceeb-150b-400a-88bb-2053e5a5f259" />

### Step 8: Configuring the Payload Listener

After selecting the demonstration payload, the listener configuration was prepared.

The configuration included concepts such as:

LHOST: Listener host address
LPORT: Listener port
Payload type
Session handling

A listener waits for an authorized laboratory payload to connect back.
<img width="614" height="354" alt="3" src="https://github.com/user-attachments/assets/46f162dd-07b9-48ad-aaf4-2b706d29a18c" />
<img width="604" height="133" alt="4" src="https://github.com/user-attachments/assets/62a7154e-29fc-4d9c-a8fe-14a423d767e4" />
<img width="608" height="291" alt="5" src="https://github.com/user-attachments/assets/f6567beb-a999-4daf-a446-1a1b5da15e8b" />

### Step 9: Reviewing Listener Options

Before running the listener, I reviewed the available configuration.

This helped me understand the difference between:

Payload configuration
Listener configuration
Network addressing
Ports
Session handling
<img width="615" height="351" alt="6" src="https://github.com/user-attachments/assets/e5c43377-de78-46d7-b502-c8c53f8e37b6" />

### Step 10: Preparing a Controlled Redirect Page

As part of the practical exercise, I also created a simple HTML page used for controlled redirection inside the lab.

This demonstrated how web content can redirect a browser to another controlled location.

<img width="697" height="262" alt="7" src="https://github.com/user-attachments/assets/2ed1d5d4-2606-41e0-837d-4641d4abe727" />

### Step 11: Hosting Files Using a Local HTTP Server

The required demonstration files were placed inside a local directory.

A local HTTP server was then used to make the files accessible inside the isolated network.

The directory listing showed the files available for the controlled test.

<img width="812" height="177" alt="8" src="https://github.com/user-attachments/assets/ee857ecb-7ee7-4bf3-9116-e254e6ddf325" />
<img width="829" height="334" alt="9" src="https://github.com/user-attachments/assets/3a35fd65-6d7a-4c88-a42d-10750b3e2999" />

This stage helped me understand the difference between:

Creating a file
Hosting a file
Making it reachable over the network

### Step 12: Verifying the Controlled Session

After the authorized test interaction, the listener received a session.

The session information confirmed that the laboratory connection had been established.

This allowed me to understand how a reverse connection is represented from the attacker's perspective.

<img width="612" height="468" alt="10" src="https://github.com/user-attachments/assets/aebc5ac5-106b-44ed-93f7-6877c2ea3641" />

The session was examined only for educational purposes inside the isolated environment.

📊 What I Learned

This project taught me several important cybersecurity concepts.

1. Humans Are Part of the Attack Surface

An organization may have:

Firewalls
Antivirus
Endpoint protection
IDS/IPS
Strong passwords

But a successful social engineering attack can still begin when a user trusts the wrong webpage, link, email, or attachment.

2. Website Cloning Can Be Convincing

A cloned webpage can visually resemble the original page.

Users may focus on the design of a website without checking:

The URL
The domain name
HTTPS certificate details
Unexpected redirects
Suspicious spelling
Login requests

This makes user awareness extremely important.

3. Credential Harvesting Is a Serious Risk

The credential-harvesting demonstration showed that sensitive information can be exposed when users submit data to an attacker-controlled form.

Defensive measures include:

Multi-factor authentication
Password managers
Phishing-resistant authentication
User awareness training
Email filtering
Domain monitoring
4. Network Configuration Matters

During the lab, I worked with concepts such as:

IP Address
    ↓
Listener
    ↓
Port
    ↓
Network Connection
    ↓
Session

A correct network configuration is essential for authorized penetration testing labs.

5. Payloads Are Only One Part of an Attack

Before a payload can become relevant, an attacker may need:

User interaction
Successful delivery
Network connectivity
Security bypass opportunities

This is why defense should focus on the complete attack chain instead of a single security product.

🛡️ Defensive Recommendations

Based on this practical exercise, the following security measures are important.

For Users
Always check the URL before entering credentials.
Do not trust a webpage only because it looks familiar.
Avoid downloading unexpected files.
Use a password manager where possible.
Enable multi-factor authentication.
Be suspicious of urgent or unusual requests.
For Organizations
Conduct regular phishing awareness training.
Use MFA across critical services.
Implement email filtering and anti-phishing controls.
Monitor suspicious domains and lookalike domains.
Use endpoint detection and response solutions.
Restrict unnecessary administrative privileges.
Segment networks.
Monitor unusual outbound connections.
Perform authorized phishing simulations.
🧠 Key Takeaway

This project changed the way I think about cybersecurity attacks.

Before performing this lab, I mainly focused on technical vulnerabilities such as:

SQL Injection
Cross-Site Scripting
Open ports
Vulnerable services

However, social engineering demonstrated something equally important:

Sometimes the easiest path into a system is not breaking the technology. It is manipulating the person using it.

Understanding these techniques from an attacker's perspective helps security professionals build better defenses.

⚠️ Ethical Use

This project is strictly for:

Cybersecurity education
Authorized penetration testing
CTF challenges
Personal laboratory environments
Security awareness training

Never use these techniques against:

Real users without consent
Public websites
Production systems
Organizations without written authorization

📚 Skills Practiced

Social Engineering Concepts
SET Framework
Website Attack Vectors
Webpage Cloning Concepts
Credential Harvesting Awareness
Payload Concepts
Listener Configuration
Metasploit Session Basics
Local HTTP Hosting
Network Fundamentals
Security Awareness
Ethical Hacking Methodology

Cybersecurity Student | Ethical Hacking Learner | Web Security Enthusiast
