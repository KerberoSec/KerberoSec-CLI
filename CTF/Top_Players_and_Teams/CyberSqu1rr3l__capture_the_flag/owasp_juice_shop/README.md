```
 _______ ________ _______ _______ ______        _____         __                  _______ __                
|       |  |  |  |   _   |     __|   __ \     _|     |.--.--.|__|.----.-----.    |     __|  |--.-----.-----.
|   -   |  |  |  |       |__     |    __/    |       ||  |  ||  ||  __|  -__|    |__     |     |  _  |  _  |
|_______|________|___|___|_______|___|       |_______||_____||__||____|_____|    |_______|__|__|_____|   __|
                                                                                                     |__|                                                                                               
```
The OWASP Juice Shop is probably the most modern and sophisticated insecure web
application. It can be used in security trainings, awareness demos, CTFs and as a guinea
pig for security tools. It encompasses vulnerabilities from the entire OWASP Top Ten [^5]
along with many other security flaws found in real-world applications. [^1]

Challenge Categories
-----------------------------------------------------------------------------------------
The vulnerabilities found in the OWASP Juice Shop are categorized into several different
classes. Most of them cover different risk or vulnerability types from well-known lists
or documents, such as OWASP Top 10, OWASP ASVS, OWASP Automated Threat Handbook and OWASP
API Security Top 10 or MITRE’s Common Weakness Enumeration. [^7]

| Category |	# |	Challenges |
|----------|---:|------------|
| Broken Access Control |11 | Admin Section, CSRF, Easter Egg, Five-Star Feedback, Forged Feedback, Forged Review, Manipulate Basket, Product Tampering, SSRF, View Basket, Web3 Sandbox |
| Broken Anti Automation | 4 | CAPTCHA Bypass, Extra Language, Multiple Likes, Reset Morty's Password |
| Broken Authentication | 9 | Bjoern's Favorite Pet, Change Bender's Password, GDPR Data Erasure, Login Bjoern, Password Strength, Reset Bender's Password, Reset Bjoern's Password, Reset Jim's Password, Two Factor Authentication |
| Cryptographic Issues | 5 | Forged Coupon, Imaginary Challenge, Nested Easter Egg, Premium Paywall, Weird Crypto |
| Improper Input Validation | 12 | Admin Registration, Deluxe Fraud, Empty User Registration, Expired Coupon, Mint the Honey Pot, Missing Encoding, Payback Time, Poison Null Byte, Repetitive Registration, Upload Size, Upload Type, Zero Stars |
| Injection | 11 | Christmas Special, Database Schema, Ephemeral Accountant, Login Admin, Login Bender, Login Jim, NoSQL DoS, NoSQL Exfiltration, NoSQL Manipulation, SSTi, User Credentials |
| Insecure Deserialization | 3 | Blocked RCE DoS, Memory Bomb, Successful RCE DoS |
| Miscellaneous | 7 | Bully Chatbot, Mass Dispel, Privacy Policy, Score Board, Security Advisory, Security Policy, Wallet Depletion |
| Observability Failures | 4 | Access Log, Exposed Metrics, Leaked Access Logs, Misplaced Signature File |
| Security Misconfiguration | 4 | Cross-Site Imaging, Deprecated Interface, Error Handling, Login Support Team |
| Security through Obscurity | 3 | Blockchain Hype, Privacy Policy Inspection, Steganography |
| Sensitive Data Exposure | 16 | Confidential Document, Email Leak, Exposed credentials, Forgotten Developer Backup, Forgotten Sales Backup, GDPR Data Theft, Leaked API Key, Leaked Unsafe Product, Login Amy, Login MC SafeSearch, Meta Geo Stalking, NFT Takeover, Password Hash Leak, Reset Uvogin's Password, Retrieve Blueprint, Visual Geo Stalking |
| Unvalidated Redirects | 2 | Allowlist Bypass, Outdated Allowlist |
| Vulnerable Components | 9 | Arbitrary File Write, Forged Signed JWT, Frontend Typosquatting, Kill Chatbot, Legacy Typosquatting, Local File Read, Supply Chain Attack, Unsigned JWT, Vulnerable Library |
| XSS | 9 | API-only XSS, Bonus Payload, CSP Bypass, Client-side XSS Protection, DOM XSS, HTTP-Header XSS, Reflected XSS, Server-side XSS Protection, Video XSS |
| XXE | 2 | XXE Data Access, XXE DoS |

Documentation
-----------------------------------------------------------------------------------------
Besides this repository, there is an official companion guide for the OWAS Juice Shop
available online. It will give a complete overview of all vulnerabilities found
in the application including hints how to spot and exploit them. In the appendix, there
is also a complete step-by-step solutions to every challenge. [^2] [^3]

Installation
-----------------------------------------------------------------------------------------
Before deciding to run the OWASP Juice Shop instance locally, e.g. via Node.js or Docker,
we can also have a look at the demo website. [^4] Then, we can move on to the install
instructios on the GitHub [^6] to host on our own instance for full control over the
environment and no interference from other users.

[^1]: https://owasp.org/www-project-juice-shop/
[^2]: https://pwning.owasp-juice.shop/companion-guide/latest/
[^3]: https://leanpub.com/juice-shop
[^4]: https://demo.owasp-juice.shop/
[^5]: https://owasp.org/www-project-top-ten/
[^6]: https://github.com/juice-shop/juice-shop
[^7]: https://juice-shop.github.io/
