---
title: "Injection Attacks"
date: 2025-01-27 00:00:00 +0800
category: [Cyber Blog, OWASP Top Ten]
tags: [Injection]
image: https://raw.githubusercontent.com/0xfke/0xfke.github.io/refs/heads/main/Images/injection_attacks.webp
alt: "Injection"
---

Injection flaws occur when user-controlled input is interpreted as commands or parameters by an application. They are common and can lead to serious security risks, depending on the technologies used and how the input is processed.

---

### **Common Types of Injection Attacks**

1. **SQL Injection:**
    - User input manipulates SQL queries to access or modify database contents.
2. **Command Injection:**
    - User input executes arbitrary system commands on the server.

---

### **Potential Impacts of Successful Attacks**

- **Database Access:** Attackers can access, modify, or delete sensitive data like credentials and personal details.
- **System Command Execution:** Attackers can run commands to gain control of servers, steal data, or launch further attacks on linked infrastructure.

---

### **Defense Strategies**

1. **Input Validation:**
    - Use an **allow list** to only permit predefined safe input or characters.
2. **Input Sanitation:**
    - Strip dangerous characters from input before processing.

Libraries are available to automate these defenses, ensuring safer input handling without manual effort.

---
### Why XSS is under Injection:

XSS occurs when an attacker injects malicious scripts into a web application, which are then executed in the browser of other users. This injection can happen due to insufficient input sanitization and output encoding, which are common causes of injection flaws.

Here’s a brief definition for each type of **Cross-Site Scripting (XSS):**

1. **Stored XSS:**  
    Malicious script is permanently stored on a target server (e.g., in a database or comment section) and executed when users access the infected page.
    
    ![stored-xss](https://raw.githubusercontent.com/0xfke/0xfke.github.io/refs/heads/main/Images/stored.webp)
    
    1.1 **Blind XSS**:
    
    Blind XSS is a type of **Stored XSS** where the malicious script is injected into a target application but is executed in an environment not directly visible to the attacker (e.g., in an admin panel or monitoring tool). The attacker cannot see the immediate execution of the payload but relies on out-of-band communication (e.g., callbacks) to confirm successful exploitation.
    This is often used to target backend systems or privileged users with access to sensitive systems.
    
2. **Reflected XSS:**  
    Malicious script is included in a URL or request and executed immediately when the victim clicks the link or interacts with it.
    ![reflected-xss](https://raw.githubusercontent.com/0xfke/0xfke.github.io/refs/heads/main/Images/reflected_xss.webp)
    Example using Burp-suite

	 ![burp-example](https://raw.githubusercontent.com/0xfke/0xfke.github.io/refs/heads/main/Images/burp_reflected_example.webp)
    
3. **DOM-based XSS:**  
    Malicious script is executed by modifying the client-side Document Object Model (DOM) without involving the server, exploiting JavaScript vulnerabilities in the browser.
    
    - DOM XSS may sound a lot like reflected XSS at first. The difference is that the reflected XSS payload gets sent to the server and returned to the user’s browser within an HTTP response. On the other hand, the DOM XSS payload is injected onto a page because of client-side code rendering user input in an insecure manner. Although the results of the two attacks are similar, the processes of testing for them and protecting against them are different.

4. **Self-XSS**: 
    -  Self-XSS attacks require victims to input a malicious payload themselves. To perform these, attackers must trick users into doing much more than simply viewing a page or browsing to a particular URL.
    
	- In bug bounties, self-XSS bugs are not usually accepted as valid submissions because they require social engineering. Bugs that require social engineering, or manipulation of the victims, are not usually accepted in bug bounty programs because they are not purely technical issues.
	![why](https://raw.githubusercontent.com/0xfke/0xfke.github.io/refs/heads/main/Images/why_xss.webp)
# Hunting for XSS 
Look for XSS in places where user input gets rendered on a page. The process will vary for the different types of XSS, but the central principle remains the same: check for reflected user input.
Don’t limit yourself to text input fields, either. Sometimes drop-down menus or numeric fields can allow you to perform XSS, because even if you can’t enter your payload on your browser, your proxy might let you insert it directly into the request.

- For example, say a user input field seems to accept only numeric values on the 
web page, such as the age parameter in this POST request:

`POST /edit_user_age`
`(Post request body)`
`age=20`

You can still attempt to submit an XSS payload by intercepting the 
request via a web proxy and changing the input value:

`POST /edit_user_age`
`(Post request body)`
`age=<script>alert('XSS by 0xfke');</script>`

