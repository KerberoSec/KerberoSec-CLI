# 🌐 Web Application Security Learning Journey: SQL Injection & Cross-Site Scripting (XSS)
## 📌 Introduction

After practicing networking, reconnaissance, port scanning, service enumeration, and vulnerability scanning, I decided to take the next step in my cybersecurity learning journey: Web Application Security.

This practice session focused on understanding two of the most well-known web application vulnerabilities:

## 💉 SQL Injection (SQLi)
## 🕸️ Cross-Site Scripting (XSS)

For this hands-on learning exercise, I used DVWA (Damn Vulnerable Web Application) in my own controlled laboratory environment.

The objective was not simply to enter payloads and observe results. I wanted to understand why the application behaved differently, how input validation affected security, how information could be exposed, and why developers need proper defensive mechanisms.

⚠️ Disclaimer: All activities described in this repository were performed in an intentionally vulnerable DVWA environment for educational and authorized security training purposes only.

🎯 Learning Objectives

### During this practice, my goals were to:

Understand how user input interacts with a web application.
Learn the basic concept behind SQL Injection.
Observe how SQL queries can behave unexpectedly when input is not properly handled.
Understand reflected Cross-Site Scripting.
Compare different security levels and filtering mechanisms.
Learn how source code review can help understand vulnerabilities.
Extract information in a controlled lab environment.
Understand why secure coding practices are important.

## 🛠️ Lab Environment
The following environment was used during this practice:
Operating System: Kali Linux
Target Application: Damn Vulnerable Web Application (DVWA)
Browser: Mozilla Firefox
Target IP: 10.6.6.13
Practice Type: Controlled and authorized lab environment

### NOTE: Download Kali from the Cisco resource site so you do not need to set up DVWA and all other machines by yourself; it is built in that package.

DVWA is intentionally designed for security learning and allows students to understand common web vulnerabilities under different security configurations.

## 💉 Part 1: SQL Injection
📖 What is SQL Injection?

SQL Injection is a vulnerability that can occur when an application takes user-controlled input and places it into a database query without proper validation or parameterization.

In a vulnerable situation, the application's intended query logic may be altered by specially crafted input.

For example, a normal application may internally perform a database lookup similar to:

SELECT first_name, last_name
FROM users
WHERE user_id = '<user_input>';

If user input is not handled securely, the database query may behave differently from what the developer originally intended.

My goal during this lab was to observe this behavior step by step.

### 🔎 Step 1: Testing the Normal Input

I first interacted with the SQL Injection page using normal values.

The application accepted a User ID and returned the corresponding user information.

This established a baseline and helped me understand the expected behavior of the application before testing any security issues.

### 🔓 Step 2: Testing Authentication/Query Logic

The next stage was to test how the application responded when special SQL characters were introduced into the input.

During the lab, I observed that changing the input structure could affect the application's query processing.

For example, the screenshots show testing involving SQL expressions such as:

' OR 1=1 #

The application returned multiple records instead of behaving like a normal single-user lookup.

This demonstrated an important security concept:

If an application directly trusts user input while constructing a database query, the user may influence the logic of that query.

<img width="821" height="546" alt="1_sql" src="https://github.com/user-attachments/assets/d7198bb0-08ad-4fa0-b6f9-4c0fb4eba7ff" />

### 📊 Step 3: Understanding Query Behavior

I continued experimenting with SQL expressions to understand how the application processed the supplied input.

One of the key observations was that a logical condition that always evaluates as true could change the application's behavior.

This helped me understand that SQL Injection is not simply about "breaking into a database." At a fundamental level, it is about:

Untrusted input changing the meaning of an application's database query.

That was one of the most important lessons from this practice.

### 🧪 Step 4: Using ORDER BY

I then practiced using an ORDER BY clause to better understand the structure of the underlying query.

The screenshots show testing with values similar to:

' ORDER BY 1 #

and other column positions.

At one point, increasing the number produced an error similar to:

Unknown column '3' in 'order clause'

This was a useful learning moment.

The error suggested that the application was attempting to process the supplied SQL syntax. In a real security assessment, error messages can sometimes reveal useful information about the application's backend.

<img width="812" height="557" alt="2_sql" src="https://github.com/user-attachments/assets/c3507ceb-8736-41eb-ba5e-6f48a67e6f17" />
<img width="435" height="184" alt="3_sql" src="https://github.com/user-attachments/assets/68a3df0f-722e-4f53-9af4-36bfeff2fa5d" />
<img width="704" height="191" alt="4_sql" src="https://github.com/user-attachments/assets/4268bc11-1641-4bd1-971f-9eaad43d5cc3" />

### 🗄️ Step 5: Database Information Discovery

After understanding the basic query behavior, I practiced retrieving information about the database in the lab environment.

The screenshots show testing with database functions such as:

VERSION()

and:

DATABASE()

This demonstrated how SQL database systems contain functions that can provide information about the database environment.

During the lab, the application displayed the database version and database name.

This was an important lesson because exposed database information can help an attacker better understand the target environment.

<img width="804" height="503" alt="6_sql" src="https://github.com/user-attachments/assets/0fd5e423-3a27-4a40-ae78-726f4a569715" />
<img width="809" height="508" alt="5_sql" src="https://github.com/user-attachments/assets/746f3d3e-2ce0-44d7-9e31-b829fb0afb1c" />

### 📋 Step 6: Exploring Database Metadata

Next, I learned about the concept of information_schema.

Modern relational databases maintain metadata about databases, tables, and columns.

In the controlled DVWA environment, I practiced querying metadata to understand:

Available databases
Table names
Column names

The screenshots show exploration of database metadata and the discovery of tables related to the DVWA application.
<img width="725" height="429" alt="7_sql" src="https://github.com/user-attachments/assets/586a4a4b-7c7b-4f82-8d21-87efafee03ae" />

### 🧱 Step 7: Identifying Columns

After identifying the relevant table, I continued the lab by exploring its column structure.

The screenshots show the discovery of columns including information such as:

user
password
user_id
first_name
last_name

This step demonstrated why database metadata protection is important.

If an attacker can successfully manipulate a vulnerable query, they may eventually gain access to information that the application never intended to expose.

<img width="814" height="432" alt="8_sql" src="https://github.com/user-attachments/assets/4a37f6e0-428c-4212-8f7d-2583485643c2" />

### 🔐 Step 8: Understanding Sensitive Data Exposure

In the final SQL Injection stages of my practice, I observed how data stored in the users table could be returned by the vulnerable application.

The lab demonstrated the risk of exposing sensitive information, including usernames and password hashes.

The important point here was that the passwords were represented as hashes rather than plaintext. This introduced another learning topic: password hashing and offline password security.

For example, one of the observed hashes was tested separately in a password-hash cracking demonstration within the lab workflow.

<img width="801" height="440" alt="9_sql" src="https://github.com/user-attachments/assets/ed95f1d6-c024-4cb9-a415-282fb3c1d07a" />
<img width="948" height="532" alt="10_sql" src="https://github.com/user-attachments/assets/aab7b545-0120-4454-9025-6da39a5fc04c" />

## 🕸️ Part 2: Reflected Cross-Site Scripting (XSS)
### 📖 What is Reflected XSS?

After practicing SQL Injection, I moved to Reflected Cross-Site Scripting (XSS).

Reflected XSS occurs when an application receives user-controlled input and immediately includes that input in the server response without properly encoding or sanitizing it.

A simple example is a web application that displays:

Hello <user_input>

If the application does not safely handle special characters and HTML or JavaScript-related input, the browser may interpret the supplied content differently from plain text.

### 🧪 Step 1: Testing Normal Application Behavior

I first entered a normal name into the DVWA XSS page.
The application responded with a greeting similar to:

Hello Jimmy

This gave me a baseline for understanding the intended behavior of the page.
<img width="812" height="565" alt="1_xss" src="https://github.com/user-attachments/assets/b7ce927f-2b67-4750-9911-57eb1a42d81c" />

### 🔍 Step 2: Testing Script-Based Input

Next, I tested how the application handled script-related input.
The screenshots show attempts involving HTML and JavaScript-related characters.
At lower security configurations, the application did not properly protect the reflected input, demonstrating how unsafe output handling can allow browser-side code execution.

An alert was successfully triggered during the controlled lab exercise.

<img width="508" height="149" alt="3_xss" src="https://github.com/user-attachments/assets/21c3bf03-fc7f-48da-be30-da4ca9a04ab9" />
<img width="561" height="259" alt="2_xss" src="https://github.com/user-attachments/assets/2eb0b6ac-4047-479b-92a9-afd48b0e8e3d" />

### ⚙️ Step 3: Reviewing the Application Source

One of the most useful parts of this exercise was reviewing the DVWA source code.

The source showed how the application processed the name parameter.

At one security level, the code used filtering logic similar to removing specific <script> patterns before reflecting the value back to the user.

This taught me an important lesson:

Blocking one specific malicious pattern is not the same as securely handling untrusted input.

Security filters that only look for a particular keyword or tag may be bypassed by alternative representations or unexpected input formats.

### 🛡️ Step 4: Comparing Security Levels

I continued testing the application at different DVWA security levels.

The screenshots demonstrate that the behavior of the application changed depending on the configured protection level.

At higher security levels, certain characters and patterns were filtered using regular expressions.

This was particularly interesting because it demonstrated the limitations of blacklist-based filtering.

For example, filtering one dangerous keyword does not necessarily guarantee that all dangerous browser behavior is prevented.

The more I practiced, the clearer it became that context-aware output encoding is generally much stronger than trying to maintain a blacklist of every possible malicious input.

<img width="848" height="344" alt="5 ke baad" src="https://github.com/user-attachments/assets/bbf1582b-3e20-427a-91f2-21913708e626" />

### 🧩 Step 5: Testing Alternative Input Formats

I then continued experimenting with different HTML contexts.

The screenshots show attempts involving image elements and event-handler-style attributes.

This was useful because it demonstrated that browser-side behavior is not limited to only one HTML tag.

A security filter that focuses only on <script> tags may still fail if other executable contexts are not handled correctly.

<img width="521" height="155" alt="6_xss" src="https://github.com/user-attachments/assets/d5511fe2-5643-4c7d-abc7-0db90d9b9fe9" />
<img width="795" height="468" alt="5_xss" src="https://github.com/user-attachments/assets/356ca271-1c4d-4095-810f-9869f7a0bfe3" />

### 🔎 Step 6: Observing Application Responses

During the practice, I observed several possible responses from the application:

The input was reflected normally.
Certain parts of the input were filtered.
The browser interpreted the input differently.
An alert was triggered.
The page displayed only part of the supplied input.

These different outcomes helped me understand that web application security testing requires observation and analysis rather than simply trying random inputs.

The context in which input appears matters significantly.

For example, user-controlled data behaves differently when placed inside:

HTML text
HTML attributes
JavaScript
URLs
CSS
Browser DOM elements

<img width="506" height="143" alt="10_xss" src="https://github.com/user-attachments/assets/52897d3c-9be6-4710-a3ae-133459375c47" />
<img width="861" height="517" alt="9_xss" src="https://github.com/user-attachments/assets/98eb1e3e-8798-443b-9fea-74fab466170e" />
<img width="865" height="368" alt="8_xss" src="https://github.com/user-attachments/assets/d885965f-9ef3-490c-86a7-41e1d0b7d2a6" />
<img width="793" height="444" alt="7_xss" src="https://github.com/user-attachments/assets/116039ac-ccf1-49e9-9615-dd6097fba25a" />

### 🧠 Key Lessons Learned

This practice session gave me a much deeper understanding of web application security.

1. Never Trust User Input

Both SQL Injection and XSS begin with the same fundamental problem:

The application accepts untrusted input and handles it insecurely.

The vulnerability may occur at different layers, but the root cause is often improper handling of user-controlled data.

2. SQL Injection Can Reveal More Than Data

Before this lab, SQL Injection seemed like a vulnerability mainly related to bypassing authentication.

After practicing it step by step, I understood that SQL Injection can potentially involve:

Manipulating query logic
Triggering database errors
Discovering database structure
Identifying tables
Identifying columns
Extracting application data

This made me appreciate the importance of prepared statements and parameterized queries.

3. XSS Is About Browser Interpretation

The XSS practice helped me understand that browsers are powerful execution environments.

If user input is inserted into a webpage without proper protection, the browser may interpret that input as code or markup instead of ordinary text.

The security context matters.

A value that is safe in one context may be dangerous in another.

4. Blacklisting Is Not Enough

One of my biggest takeaways from reviewing the DVWA source code was the weakness of simple blacklist filtering.

Trying to remove only specific keywords or tags is risky because there can be multiple ways to represent potentially dangerous browser behavior.

A stronger approach includes:

Context-aware output encoding
Proper input validation
Parameterized database queries
Secure frameworks and APIs
Content Security Policy (CSP)
HttpOnly and Secure cookie attributes

### 🛡️ Recommended Defensive Practices
#### Preventing SQL Injection
Developers should:
Use prepared statements.
Use parameterized queries.
Avoid building SQL queries through string concatenation.
Apply least-privilege permissions to database accounts.
Validate input where appropriate.
Avoid exposing detailed database errors to users.

Example of a safer approach:

cursor.execute(
    "SELECT first_name, last_name FROM users WHERE user_id = ?",
    (user_id,)
)

The exact syntax depends on the programming language and database library.

#### Preventing XSS
Developers should:
Encode output based on its context.
Treat all user-controlled data as untrusted.
Use modern templating frameworks safely.
Avoid unsafe HTML insertion methods.
Implement Content Security Policy where appropriate.
Use HttpOnly cookies for sensitive session data.
Validate input based on expected formats.

### 📊 Skills Practiced
During this hands-on exercise, I practiced:

Web Application Security<br>
SQL Injection <br>
-Query Manipulation <br>
-Error Observation<br>
-ORDER BY Testing<br>
-Database Enumeration<br>
-Table Discovery<br>
-Column Discovery<br>
-Data Exposure Analysis<br>

Cross-Site Scripting
-Reflected XSS<br>
-Input Reflection<br>
-Browser Behavior<br>
-Security Filter Testing<br>
-Source Code Review<br>
-Security Level Comparison<br>

### 🚀 Conclusion

This was an important step in my cybersecurity learning journey.

Moving from network scanning and vulnerability assessment into web application security gave me a different perspective. Network security often focuses on hosts, ports, services, and protocols. Web application security goes deeper into how an application processes data and how trust boundaries can be broken.

The most valuable part of this exercise was not memorizing payloads. It was understanding the logic behind the vulnerabilities.

For SQL Injection, I learned how insecure database queries can allow untrusted input to influence database operations.

For XSS, I learned how insecure handling of reflected input can cause a browser to interpret user-controlled data as active content.

I also learned the importance of reviewing source code and understanding defensive mechanisms. Seeing the difference between low, medium, and higher security configurations helped me understand why some protections work and why others can still have weaknesses.

This is only the beginning of my web application security journey.
I will continue documenting my hands-on cybersecurity learning journey, one lab at a time. 🚀

### ⚠️ Disclaimer
This repository documents security testing performed exclusively in an intentionally vulnerable and authorized training environment using DVWA. The techniques were practiced for educational purposes only. Never perform security testing against systems, applications, or networks without explicit authorization.
