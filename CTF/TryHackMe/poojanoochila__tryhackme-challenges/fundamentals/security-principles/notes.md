# Notes: Security Principles

## CIA Triad

### 1. Confidentiality
Ensures that sensitive information is accessible only to authorized users.

Methods:
- Encryption
- Access control (authentication & authorization)
- Data classification

Example:
- Preventing unauthorized users from accessing login credentials

---

### 2. Integrity
Ensures that data remains accurate and unaltered.

Methods:
- Hashing (e.g., SHA)
- Checksums
- File integrity monitoring

Example:
- Detecting unauthorized modification of system files

---

### 3. Availability
Ensures systems and data are accessible when needed.

Methods:
- Redundancy
- Load balancing
- DDoS protection

Example:
- Ensuring a website remains accessible during high traffic

---

## Core Security Principles

### Least Privilege
Users should only have the minimum access required.

- Reduces risk of misuse or compromise
- Limits attacker movement if account is compromised

---

### Defense in Depth
Multiple layers of security controls.

Examples:
- Firewall + IDS + Endpoint Security
- Even if one layer fails, others provide protection

---

### Zero Trust Model
- Never trust, always verify
- Every access request must be validated

---

### Separation of Duties
- Critical tasks are divided among multiple users
- Prevents abuse and fraud

---

## Importance in Cybersecurity
These principles guide:
- Secure system design
- Threat detection strategies
- Incident response decisions
