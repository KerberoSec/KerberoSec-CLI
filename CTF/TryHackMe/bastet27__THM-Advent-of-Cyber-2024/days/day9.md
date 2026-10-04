# 🎄 TryHackMe Advent of Cyber 2024: Day 9: Risk Assessment Challenge

## Objectives 🎯

Day 9 focuses on **Governance, Risk, and Compliance (GRC)** and how organizations manage security, risk, and compliance effectively. In this challenge, McSkidy and Glitch need to:
- Conduct a **risk assessment** of three third-party eDiscovery companies.
- Use vendor responses to calculate risk scores based on impact and likelihood.
- Select the vendor with the lowest risk score.
- Understand the importance of **internal and third-party risk assessments** in reducing overall organizational risk.

## Steps 🚀

### **Step 1: Understanding GRC and Risk Assessments**
1. **Governance:**  
   Governance establishes an organization’s security strategy, policies, and roles to align security practices with business goals.

2. **Risk:**  
   Risk involves identifying and mitigating vulnerabilities to reduce the likelihood and impact of cyber threats.

3. **Compliance:**  
   Compliance ensures adherence to external regulatory, legal, and industry standards (e.g., GDPR, ISO 27001).

### **Step 2: Reviewing Vendor Responses**
Three vendors submitted responses regarding:
- **Encryption practices** for data in transit and at rest.
- **Access controls** for securing sensitive data.
- **Data retention periods** post-project completion.

Using their responses, I assessed the risks associated with each vendor.

### **Step 3: Assessing Risks and Calculating Scores**
For each vendor:
1. Identified risks based on their responses.
2. Assigned **Impact** and **Likelihood** levels:
   - **Impact:** Low (1), Medium (2), High (3), or Critical (4).
   - **Likelihood:** Unlikely (1), Possible (2), Likely (3), or Very Likely (4).
3. Calculated **Risk Score:** Impact × Likelihood.

## Key Findings 🔑

### **Vendor Risk Breakdown**

#### **Vendor 1: Sapphire Raven**
1. **Encryption for data at rest:**  
   Risk: Lack of encryption.  
   Impact = High (3), Likelihood = Possible (2) → **Score: 6**  
2. **Access controls:**  
   Risk: Excessive access for global administrators.  
   Impact = Critical (4), Likelihood = Very Likely (4) → **Score: 16**  
3. **Data retention:**  
   Risk: Retention of data for 1-2 weeks.  
   Impact = Critical (4), Likelihood = Possible (2) → **Score: 8**  

**Total Risk Score:** **30**

#### **Vendor 2: Azure Manticore**
1. **Encryption for data at rest:**  
   Risk: Proper encryption but potential misconfigurations.  
   Impact = High (3), Likelihood = Unlikely (1) → **Score: 3**  
2. **Access controls:**  
   Risk: Excessive access for global administrators.  
   Impact = Critical (4), Likelihood = Very Likely (4) → **Score: 16**  
3. **Data retention:**  
   Risk: Retention of data for 2 weeks: 1 month.  
   Impact = Critical (4), Likelihood = High (3) → **Score: 12**  

**Total Risk Score:** **31**

#### **Vendor 3: Lavender Hydra**
1. **Encryption for data at rest:**  
   Risk: Proper encryption but potential misconfigurations.  
   Impact = High (3), Likelihood = Unlikely (1) → **Score: 3**  
2. **Access controls:**  
   Risk: Excessive access for global administrators.  
   Impact = Critical (4), Likelihood = Very Likely (4) → **Score: 16**  
3. **Data retention:**  
   Risk: Retention of data for less than 1 week.  
   Impact = Critical (4), Likelihood = Low (1) → **Score: 4**  

**Total Risk Score:** **23**

### **Step 4: Select the Vendor with the Lowest Risk**

After reviewing all risk scores:
- Lavender Hydra emerged as the safest vendor with the lowest total risk score (**23**).
- Selecting Lavender Hydra revealed the flag: **`THM{R15K_M4N4G3D}`**

## Lessons Learned 🌟

### Takeaways on GRC and Risk Assessments
1. **GRC Frameworks Are Essential:**  
   Governance, Risk, and Compliance frameworks help organizations align security practices with business goals and regulatory requirements.

2. **Risk Assessment Is Key to Decision-Making:**  
   Quantifying risks using impact and likelihood ensures informed decisions that balance security and operational efficiency.

3. **Third-Party Risk Management:**  
   Evaluating third-party risks is vital for mitigating supply chain vulnerabilities.

### Tools and Techniques 🛠️
1. **Static Risk Assessment Tool:** Evaluated vendor responses and calculated risk scores.  
2. **Risk Register:** Documented and tracked risks, assigned impact/likelihood, and calculated scores.  
3. **GRC Frameworks:** Applied concepts to ensure comprehensive risk evaluations.

## Final Thoughts 🎁

Day 9 was a fantastic exercise in **GRC principles** and practical risk management. By systematically assessing vendor risks, I gained insights into balancing security and operational needs. Lavender Hydra's strong encryption practices, restrictive data retention policy, and lower likelihood of incidents made them the best choice for McSkidy and Glitch's investigation.

### Answers ✅
1. **What does GRC stand for?**  
   **Answer:** Governance, Risk, and Compliance  

2. **What is the flag you receive after performing the risk assessment?**  
   **Answer:** `THM{R15K_M4N4G3D}`

## Table of Contents 📚

| Day  | Challenge                              | Day  | Challenge                               | Day  | Challenge                               |
|------|----------------------------------------|------|-----------------------------------------|------|-----------------------------------------|
| 📖  | [README](../README.md)                 | 9    | **Risk Assessment**                      | 17   | [Log Analysis](days/day_17.md)          |
| 1    | [OPSEC Challenge](days/day1.md)        | 10   | [Phishing](days/day_10.md)              | 18   | [Prompt Injection](days/day_18.md)      |
| 2    | [Log Analysis](days/day2.md)           | 11   | [Wi-Fi Attacks](days/day_11.md)         | 19   | [Game Hacking](days/day_19.md)          |
| 3    | [Log Analysis](days/day3.md)           | 12   | [Web Timing Attacks](days/day_12.md)    | 20   | [Traffic Analysis](days/day_20.md)      |
| 4    | [Atomic Red Team](days/day4.md)        | 13   | [WebSockets](days/day_13.md)            | 21   | [Reverse Engineering](days/day_21.md)   |
| 5    | [XXE](days/day5.md)                    | 14   | [Certificate Mismanagement](days/day_14.md)| 22 | [Kubernetes DFIR](days/day_22.md)       |
| 6    | [Sandboxes](days/day6.md)              | 15   | [Active Directory](days/day_15.md)      | 23   | [Hash Cracking](days/day_23.md)         |
| 7    | [AWS Sandboxes](days/day7.md)          | 16   | [Azure Exploitation](days/day_16.md)    | 24   | [Communication Protocols](days/day_24.md)|
| 8    | [Shellcodes](days/day8.md)             |      | **Merry SOC-mas!** 🎁✨☃️              |      | 🎄✨🎅                                |
