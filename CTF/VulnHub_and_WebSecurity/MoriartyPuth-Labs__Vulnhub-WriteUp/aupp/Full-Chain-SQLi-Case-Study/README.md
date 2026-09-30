# 🛡️ Exploitation Showcase: SQLi to Full Database Takeover
**A comprehensive technical walk-through of a successful vulnerability chain discovery and data exfiltration.**

![Status](https://img.shields.io/badge/Audit-Successful-success?style=for-the-badge)
![Type](https://img.shields.io/badge/Vulnerability-SQL_Injection-red?style=for-the-badge)
![Target](https://img.shields.io/badge/Platform-Linux_Ubuntu-orange?style=for-the-badge)

## 📋 Executive Summary
This repository documents a complete end-to-end security audit. Using proprietary automation, I identified a critical SQL injection (SQLi) vulnerability in a web application running on **Nginx 1.19.0** and **PHP 5.6.40**. The vulnerability allowed for unauthorized access to the backend database, leading to the successful exfiltration of the entire `users` table, including plaintext credentials and sensitive PII.

---

## 🔬 Phase 1: Automated Discovery with Bubble-Bash
The exploitation lifecycle began with a scan using **[Bubble-Scanner](https://github.com/MoriartyPuth/bubble-scanner)**. The scanner's event-driven engine identified a hidden endpoint and immediately flagged a potential SQLi vulnerability by detecting backend syntax errors upon injecting an escape character (`'`).

### **Initial Reconnaissance Log:**
<img width="718" height="281" alt="Screenshot 2026-02-18 013405" src="https://github.com/user-attachments/assets/1663fc66-6589-4a4c-a86d-0dc83ae602e4" />

* **Scan Start**: Tue Feb 17 01:14:11 PM EST 2026
* **Target**: [http://testphp.vulnweb.com](http://testphp.vulnweb.com/)
* **Finding**: `└─ [!!!] SQLi VULNERABILITY DETECTED`

---

## 🔓 Phase 2: Vulnerability Confirmation & Mapping
Following discovery, `sqlmap` was utilized to validate the injection point on the `cat` parameter of the `listproducts.php` endpoint.

<img width="682" height="58" alt="Screenshot 2026-02-18 013631" src="https://github.com/user-attachments/assets/f4b5cd6d-50ae-4670-85f0-d248145135d1" /><img width="1059" height="539" alt="Screenshot 2026-02-18 013658" src="https://github.com/user-attachments/assets/2760158b-21e5-4ca2-8077-31bab0701fca" />

### **Technical Findings:**
* **Back-end DBMS**: MySQL >= 5.6
* **Operating System**: Linux Ubuntu
* **Injection Types Identified**:
    * **Boolean-based blind**: `AND boolean-based blind - WHERE or HAVING clause`
    * **Error-based**: `MySQL >= 5.6 AND error-based`
    * **Time-based blind**: `MySQL >= 5.0.12 AND time-based blind (query SLEEP)`
    * **UNION query**: `Generic UNION query (NULL) - 11 columns`

---

## 🗄️ Phase 3: Database & Schema Enumeration
The vulnerability provided deep access to the database architecture, allowing for the mapping of the `acuart` database and the extraction of sensitive tables.

<img width="843" height="65" alt="Screenshot 2026-02-18 014138" src="https://github.com/user-attachments/assets/77f04be5-6fb2-4946-bf6e-8d176142bf3d" /><img width="975" height="415" alt="Screenshot 2026-02-18 014201" src="https://github.com/user-attachments/assets/05b4073d-f111-41cd-9960-6e0815681b3e" />

### **Database Inventory:**
1. `acuart`
2. `information_schema`

### **Target Table: `users`**
The `acuart.users` table was found to contain 8 critical columns, including `uname` (Username), `pass` (Password), `email`, and `cc` (Credit Card / Sensitive Data).

---

## 💾 Phase 4: Data Exfiltration (Proof of Concept)
Final exfiltration demonstrated a complete breach of confidentiality. I successfully dumped records from the `users` table, revealing insecure data storage practices.

<img width="816" height="62" alt="Screenshot 2026-02-18 014217" src="https://github.com/user-attachments/assets/263b5179-ea9e-4a8b-b07e-0563b9fcad05" /><img width="1394" height="547" alt="Screenshot 2026-02-18 014237" src="https://github.com/user-attachments/assets/a2056801-4506-40ed-94d9-8aed20336442" />

### **Extracted Entry Preview:**
* **Username**: `test`
* **Password**: `test`
* **Email**: `you`
* **Notes**: Includes stored XSS vectors such as `<script>window.location=...</script>`

---

## 🛡️ Technical Conclusion & Risk Assessment
The successful exploitation of this vulnerability represents a **Critical Risk** to organizational data integrity and citizen privacy.

* **Mass Data Exfiltration**: Unauthorized access to PII and credentials constitutes a major security breach.
* **Account Takeover (ATO)**: Access to plaintext passwords allows for immediate account compromise.
* **Persistent Threat Vector**: Stored XSS vectors identified in the database dump suggest a secondary attack surface for session hijacking.
* **Legacy Risk**: The use of end-of-life software (**PHP 5.6.40**) significantly increases the attack surface.

---

## ⚖️ Ethics & Disclaimer
This documentation is for **Educational and Ethical Security Testing** only. All screenshots and data were gathered from a legally authorized vulnerability testing environment (`testphp.vulnweb.com`).

