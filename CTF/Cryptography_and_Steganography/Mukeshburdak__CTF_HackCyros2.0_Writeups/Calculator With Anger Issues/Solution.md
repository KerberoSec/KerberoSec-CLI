🧮 Calculator With Anger Issues: CTF Writeup
-
Platform: CTFlearn

Category: Web Exploitation

Difficulty: Easy

Challenge Link: https://web.ctflearn.com/web7/

📌 Challenge Overview
-
The challenge provides a simple web calculator that appears to only perform:

Addition

Subtraction

Multiplication

However, the description hints that unexpected behavior occurs when the input is manipulated.

“Try not to break it. Actually… break it.”

This suggests improper input handling on the backend.

🎯 Objective
-
Retrieve the flag in the format:

cyros{...}

🔍 Step 1: Analyze the Application
-
Upon visiting the webpage:

The calculator input field is marked as readonly.

The form submits data using the POST method.

The parameter name is:

expression

Even though the input is readonly, this restriction only applies to the browser UI: it does NOT prevent manual POST requests.

🛠 Step 2: Send a Custom POST Request (Using Postman)
-
Instead of interacting with the calculator buttons:

Open Postman

Set method to POST

Enter URL:

https://web.ctflearn.com/web7/

Go to Body

Select x-www-form-urlencoded

Add:

Key	Value
expression	;ls

Click Send

📸 Exploitation Screenshot
-
Below is the actual POST request sent using Postman:

<img width="1905" height="981" alt="Screenshot 2026-02-28 001735" src="https://github.com/user-attachments/assets/d47a6225-6984-4cac-9909-8abbfe6be32e" />

🚨 Step 3: Why This Works
-
Payload used:

;ls

Explanation:

; terminates the expected calculator command.

ls is a Linux command that lists directory contents.

The backend does not sanitize user input.

This allows OS Command Injection.

🧾 Server Response
-
The response returned:

calc.js

ctf{watch_0ut_f0r_th3_m0ng00s3}

index.php

main.css

The flag appears directly in the directory listing.

🚩 Final Flag
-
cyros{watch_0ut_f0r_th3_m0ng00s3}

🧠 Vulnerability Type
-
OS Command Injection

Improper Input Validation

Unsafe use of system commands

Likely vulnerable backend code:

system("calc " . $_POST['expression']);

🔐 How to Prevent This
-
To secure applications against this vulnerability:

Never execute raw user input in system commands

Use strict input validation (allow only numbers and operators)

Escape shell arguments properly

Avoid system() when possible

Implement server-side sanitization

🛠 Tools Used
-
Postman

Browser Developer Tools

📚 Key Takeaways
-
Frontend restrictions ≠ security

readonly fields can be bypassed

Always validate input on the server side

Command injection is a critical vulnerability

---
