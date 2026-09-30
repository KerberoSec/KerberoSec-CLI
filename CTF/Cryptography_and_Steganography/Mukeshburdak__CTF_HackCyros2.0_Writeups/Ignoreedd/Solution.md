🚫 Ignoreedd: CTF Writeup
-
🏷 Platform

Web Challenge

📂 Category

Web Exploitation

🎯 Difficulty

Easy

📌 Challenge Overview
-
The application appears to process user input through a POST request.

At first glance, nothing special is visible in the browser.

However, the challenge name “Ignoreedd” hints that:

Something is being ignored

Possibly hidden in comments

Or encoded inside the response

🔎 Step 1: Send POST Request
-
Using Postman:

Method: POST

URL:

https://xyzdhwauihujhdwqubguidwgq.lovable.app

Body → x-www-form-urlencoded

Key	Value
expression	;ls

Click Send

📸 Screenshot
-
<img width="1910" height="983" alt="Screenshot 2026-02-28 005245" src="https://github.com/user-attachments/assets/0bae851c-9fad-4362-a6f9-a6d3ae4302c2" />

🧾 Step 2: Analyze Response
-
The response returned:

Y3lyb3N7ZG9udF90cnVzdF9yZWRpcmVjdHN9

The last line looks encoded.

It is clearly:

Base64 encoded string

🔐 Step 3: Decode the String
-
Encoded value:

Y3lyb3N7ZG9udF90cnVzdF9yZWRpcmVjdHN9

Using CyberChef → From Base64

It decodes to:

cyros{dont_trust_redirects}

<img width="1919" height="1022" alt="Screenshot 2026-02-28 005212" src="https://github.com/user-attachments/assets/ae376134-ebe0-4ea9-bb65-fc5c7d996f21" />

🚩 Final Flag
-
cyros{dont_trust_redirects}

🧠 What “Ignoreedd” Means
-
Looking carefully at the HTML response:

There is a redirect meta tag

The encoded flag appears inside an HTML comment

The browser automatically redirects

But the flag is still visible in raw response

This means:

The browser ignored it… but we didn’t.

Hence the name: Ignoreedd

🚨 Vulnerability Type
-
Command Injection

Hidden data in HTML comments

Encoded information exposure

🛠 Tools Used
-
Postman

CyberChef

Browser DevTools
