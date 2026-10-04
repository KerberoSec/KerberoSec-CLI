
---

## 1. IS Audit Process Overview

The IS audit process consists of three main phases:

**Planning → Fieldwork & Documentation → Reporting & Follow Up**

![[procedures1.png]]

| Phase | Step | Description |
| --- | --- | --- |
| **Planning** | 1. Understanding of the audit areas/subjects | Identify what will be audited |
| | 2. Risk assessment & general audit plan | Assess risks and create high-level plan |
| | 3. Detailed audit planning | Develop detailed procedures and timelines |
| **Fieldwork & Documentation** | 4. Verifying & evaluating controls | Verify that controls exist and work properly |
| | 5. Compliance Tests & Substantive Testing | Test adherence to policies and verify accuracy of data |
| **Reporting & Follow Up** | 6. Reporting (communicating results) | Communicate findings to management |
| | 7. Follow up | Ensure corrective actions are taken |

---

## 2. Compliance Testing vs Substantive Testing

### Compliance Testing

Compliance testing checks whether controls are **operating in accordance with policy**. It uses a **sampling** approach.

**Example: Change Management Policy:**

- Programmer makes code changes
- Supervisor approves the changes
- Auditor selects a sample from the change log (Change 101, 102, ... 108) and checks whether each was properly approved

![[procedures2.png]]

### What if Compliance Testing Fails?

If a sampled change (e.g., Change 104) was **not approved**, then **substantive testing** must be performed on that change.

![[procedures3.png]]

### Substantive Testing

Substantive testing is a **detailed analysis** triggered when compliance testing fails. The auditor dives into the failed record and performs a **line-by-line review**.

**Example:**

- Compliance testing found Change 104 was not approved → "Not Approved"
- Substantive testing: Examine each line of code within Change 104 (Code 1, Code 2, Code 3, Code 4, Code 5)
- Issue identified in Code 3

![[procedures4.png]]

> **Summary:** Compliance test → "Does the control exist?" | Substantive test → "Is the data actually correct?"

---

## 3. Audit Procedures

### 3.1 Re-performance

Re-performance means the auditor **independently re-executes a calculation or process** to verify its accuracy.

![[procedures5.png]]

**Example Scenario:**

1. A Clerk in the Finance Department prepares payroll → pays Staff $10,000/month
2. Staff bribes the Clerk: "Add more hours and I'll give you $5,000"
3. Clerk inflates total overtime from 10 hours to 60 hours (10 + 50)
4. Result: Basic Salary $10,000 + 60 hrs × $200/hr = Total Payment $22,000

![[procedures6.png]]

5. **Compliance officer manually recalculates** → Correct payment should be $12,000, not $22,000!

![[procedures7.png]]

> **Key Point:** Re-performance = The auditor performs the calculation from scratch and compares the results.

### 3.2 Confirmation

Confirmation means verifying information through **independent third-party sources**.

**Example Scenario:**

1. Company A (IT Officer) sends a system development request to Company B (Outsource IT Developer)
2. Company B develops and delivers the system
3. Company B invoices $2M
4. Compliance officer contacts Company B directly: "Did it really cost $2M to develop this system?": obtaining third-party verification

![[procedures8.png]]

> **Key Point:** Confirmation = 3rd party verification. The auditor verifies information directly from its source.

---

## 4. Risk in Information Systems

### 4.1 What is Risk?

Risk is the possibility of having a negative impact.

![[controls2.png]]

> Risk = Fire (threat) | Control = Fire extinguisher (countermeasure)

### 4.2 Elements of Risk

| Element | Description |
| --- | --- |
| **Threats** | Natural disaster, Man-made threats (internal: fraud, external: hacking), Technical (hardware failure) |
| **Impact** | Measure of damage |
| **Probabilities** | Likelihood of the risk occurring |

> **Key Point:** Internal threats are more dangerous than external ones because insiders know the organization's business processes and can cause greater damage.

### 4.3 Examples of Risk in IS

| Example | Description |
| --- | --- |
| Gmail Outage | Worldwide Gmail service disruption |
| Capital One Data Breach | Major data breach exposing customer data |
| Cathay Pacific Ticket Error | First class ticket pricing error |

### 4.4 Recent News of Risks Related to IS

| # | Incident | Date | Description |
| --- | --- | --- | --- |
| 1 | Google Outage | Jun 2019 | YouTube, Gmail, Snapchat went down |
| 2 | Facebook Data Leak | Sep 2019 | 419 million users' data exposed |
| 3 | AWS DDoS Attack | Oct 2019 | Sustained DDoS attack on AWS servers |
| 4 | Insider Threats Report | Oct 2019 | Workers identified as biggest data security threat |

---

## 5. Risk Assessment

### Step 1: Define Risk: Impact Scale (Measure of Damage)

![[impact.png]]

![[risk.png]]

| Level | Rating | People | Asset | Operation | Environment |
| --- | --- | --- | --- | --- | --- |
| **5** | **Major** | Multiple fatalities or permanent total disability | Extensive damage | Critical failure preventing core activities | Massive and long-term impact |
| **4** | **Serious** | Single fatality or permanent total disability | Serious & major damage | Breakdown of key activities leading to reduction in performance | Major and mid-term impact |
| **3** | **Moderate** | Major injury / health effects | Local damage | Targets not met, reduction in performance | Moderate and controllable impact |
| **2** | **Minor** | Minor injury | Minor damage | Minor delays in operation | Minor impact and easy restorable |
| **1** | **Negligible** | Negligible injury | Negligible damage | Negligible interruption | Negligible impact |

### Step 2: Define the Probability (Likelihood of Having Risk)

![[likelihood.png]]

![[risk2.png]]

| Level | Rating | Definition |
| --- | --- | --- |
| **5** | Probable | The event is expected to occur |
| **4** | Likely | The event will probably occur |
| **3** | Possible | The event might occur at some time |
| **2** | Unlikely | The event could occur but is improbable |
| **1** | Very Unlikely | The event could have little or no chance of occurrence |

### Step 3 & 4: Risk Matrix (Probability × Impact)

![[risk3.png]]

![[risk4.png]]

| | 1. Negligible | 2. Minor | 3. Moderate | 4. Serious | 5. Major |
| --- | --- | --- | --- | --- | --- |
| **1. Very Unlikely** | 1 | 2 | 3 | 4 | 5 |
| **2. Unlikely** | 2 | 4 | 6 | 8 | 10 |
| **3. Possible** | 3 | 6 | 9 | 12 | 15 |
| **4. Likely** | 4 | 8 | 12 | 16 | 20 |
| **5. Probable** | 5 | 10 | 15 | 20 | 25 |

**Risk Levels:**

- **1-6: Low** → Minor issue of little concern with some small disruptions
- **7-14: Medium** → Requires attention, inconvenience and risk occur
- **15-25: High** → Requires urgent attention, introduce control to reduce risk

### Risk Assessment Example: Cyber Hacking to Online Server

![[risk5.png]]

| Question | Answer |
| --- | --- |
| What is the threat? | Cyber hacking to online server |
| What is the impact? | **4. Serious** → Breakdown of key activities leading to reduction in performance |
| What is the probability? | **4. Likely** → The event will probably occur |
| **Risk Score** | **4 × 4 = 16 HIGH** |

---

## 6. Risk Mitigation

Risk mitigation means reducing risks using **controls**.

### Risk Reduction Through Controls

![[risk6.png]]

![[risk7.png]]

![[risk8.png]]

| Risk % | Control | Description |
| --- | --- | --- |
| 100% |: | No controls in place |
| 80% | Username + Password | Basic authentication |
| 60% | Username + Password + Firewall | Network security added |
| 50% | Username + Password + Firewall + Encryption | Data encryption added |
| 40% | Username + Password + Firewall + Encryption + Biometrics | Biometric authentication added |
| 0% | Eliminate risk impossible | Complete risk elimination is not possible! |

> **Cost Effective Decision:** Senior management typically accepts **60% risk level** (Username + Password + Firewall). As controls increase, so does cost. Management balances control strength against cost.

![[risk9.png]]

### Control Example

![[controls1.png]]

> IT staff notifies general staff to change their username and password every 3 months. This is a simple **preventive control** example.

### Risk Mitigation Options

| # | Option | Description |
| --- | --- | --- |
| 1 | **Reduce** | Use controls to lower risk to a level acceptable by senior management |
| 2 | **Transfer** | Transfer remaining risk to a third party (e.g., insurance policy) |
| 3 | **Avoid** | Avoid the risky activity entirely (e.g., not offering e-banking) |

> **Eliminate ≠ Avoid:**
>: **Eliminate:** Continue with e-banking, add many controls, and claim "no risk" → **Not possible!**
>: **Avoid:** Don't do e-banking at all, stick to traditional banking only → Leads to customer loss, **not preferred**

---

## 7. Risk Re-evaluation

Risk management is a **cyclical process**:

**1. Risk Assessment → 2. Risk Mitigation → 3. Risk Re-evaluation → (back to step 1)**

![[risk10.png]]

### When Do We Perform Risk Re-evaluation?

| Trigger Type | Description | Example |
| --- | --- | --- |
| **Time Driven** | Periodically: every six months or once a year | Scheduled assessment |
| **Event Driven** | Environmental change, government regulation, natural disaster | Japan earthquake (nuclear plant meltdown) → environmental change |

---

## 8. Internal Controls: System Development Life Cycle (SDLC)

### 8.1 Why Develop a New Application?

- New opportunity to new/existing business process
- Problem found in business process
- New opportunity to take advantage of technology (e.g. FinTech)
- Problem with current technology

### 8.2 SDLC Phases Overview

![[sdlc.png]]

**Phase 1: Feasibility** → **Phase 2: Requirements** → **Phase 3A: Design** → **Phase 3B: Selection** → **Phase 4A: Development** → **Phase 4B: Configuration** → **Phase 5: Implementation** → **Phase 6: Post Implementation**

![[sdlc2.png]]

| Phase | Name | Description |
| --- | --- | --- |
| Phase 1 | **Feasibility** | Feasibility study |
| Phase 2 | **Requirements** | Requirements analysis (**most important phase**) |
| Phase 3A | **Design** | System design for in-house development |
| Phase 3B | **Selection** | Vendor/package selection for outsourcing |
| Phase 4A | **Development** | In-house coding and development |
| Phase 4B | **Configuration** | Configuration of outsourced system |
| Phase 5 | **Implementation** | System go-live |
| Phase 6 | **Post Implementation** | Post go-live review and evaluation |

> **Note:** If Phase 2 (Requirements) is not done well, the entire system development will be a failure. The most important stakeholders are the **end users**: if they aren't happy with the system, it will be retired quickly regardless of how good the development team thinks it is.

### 8.3 Phase 1: Feasibility

| Feasibility Type | Description |
| --- | --- |
| **Operational Feasibility** | Whether the system can operate within the organization: do we have the hardware/software to run it? |
| **Technical Feasibility** | Whether we have the expertise to develop and maintain the system ourselves |
| **Economic Feasibility** | Whether the system provides an economic benefit |

### 8.4 Phase 2: Requirements

- Identify & specify business requirements during feasibility study
- Description, user interaction, operation conditions & information criteria
- Focus on **what users need**: the people who use the system day in and day out are the most critical stakeholders

### 8.5 Phase 3A (Design) vs Phase 3B (Selection)

![[sdlc3.png]]

![[design.png]]

> **3A vs 3B Difference:** 3A (Design) is the in-house development path, 3B (Selection) is the outsourcing path. Similarly, 4A (Development) and 4B (Configuration) correspond to these two paths.

### 8.6 System Acquisition Methods

| Method | Description |
| --- | --- |
| **In-house Development** | Develop the system internally (Phase 3A → 4A) |
| **Outsourcing: Package (as-is)** | Buy a ready-made package and use it as-is |
| **Outsourcing: Modified Package** | Buy a package and have it customized to fit your needs |
| **Outsourcing: Custom Development** | Have a vendor build a fully custom system (e.g. unique FinTech system) |

> **Warning:** If you outsource the system development, future maintenance (fixing bugs, adding features) cannot be done internally: you won't get the source codes.

### 8.7 Key Considerations for Outsourcing

| Consideration | Description |
| --- | --- |
| **Software Escrow Agreement** | Protects source code if the developer goes bankrupt |
| **Reliability** | Vendor reliability (not just cost) |
| **Installation Support** | Whether the vendor helps with system installation |
| **User Manuals** | Whether the vendor helps develop user documentation |
| **Training** | User training: "train the trainers" approach so internal staff can train others |

---

## 9. Development Phase: Testing

![[development.png]]

Testing is the **most important part** of the development phase. Bugs and errors must be found and fixed before implementation.

### 9.1 Testing Levels

| Test Type | Scope | Focus | Performed By |
| --- | --- | --- | --- |
| **Unit Testing** | Single module | Input/Output correctness | Developers |
| **Integration Testing** | Multiple modules together | Inter-module communication and interfaces | Developers |
| **System Testing** | Entire system | End-to-end behavior | IT Team |
| **Final Acceptance Test (UAT)** | Business requirements | User satisfaction | **End Users** |

### 9.2 Unit Testing vs Integration Testing

![[testvs.png]]

- **Unit Testing:** Tests a single module in isolation. Give input, observe output. No dependency on other modules.
- **Integration Testing:** Tests how two or more modules work together. Module 1's output may be Module 2's input: this interface is what gets tested.

### 9.3 System Testing Types

| Test Type | Description | Key Question |
| --- | --- | --- |
| **Recovery Testing** | Deliberately crash the system and measure how fast it can be recovered | Can the system recover after failure? |
| **Security Testing** | Test security features using penetration testing and ethical hacking | Is the system protected from attacks? |
| **Volume Testing** | Input large amounts of data to see if the system malfunctions | Can the system handle large data volumes? |
| **Stress Testing** | Many concurrent users access the system at the same time | How does the system behave under extreme load? |
| **Performance Testing** | Speed and efficiency testing (benchmarking: compare two similar systems) | How fast and efficient is the system? |

> **Most Important Test:** **Final Acceptance Test (UAT)**: All other tests are performed by IT staff, but UAT is done by **end users**. If users are not satisfied, the system will retire quickly.

### 9.4 Phase 4B: Configuration (Outsourcing)

When a system is built by an external vendor or purchased as a package, the configuration phase ensures it is **properly configured** to meet the organization's needs and the auditor's required controls.

---

## 10. Input Controls & Data Validation

Input controls ensure that **valid and authorized information** is input to the system, and that each transaction is **processed only once**.

### 10.1 Data Validation & Editing Procedures

The purpose of data validation is to ensure correct information is input into the system through preprogrammed input formats.

**Salary Scenario: Preventive Control:**

A finance department clerk inputs salary information into the payroll system. The system has a limit: the maximum salary for an assistant professor is $75,000.

![[procedures9.png]]

**What happens if a staff member attempts fraud?**

If a staff member asks the clerk to input $50,000 more than the allowed amount (offering to split the extra money), the system will **reject** the input because it exceeds the $75,000 limit.

![[procedures10.png]]

**What if the staff legitimately works overtime?**

If a professor teaches extra courses and their legitimate salary exceeds $75,000, the clerk communicates this to the supervisor. The supervisor reviews the information and performs a **supervisor override**: entering their username and password to allow the system to accept the amount.

![[procedures11.png]]

**What if the employee, clerk, and supervisor collude?**

If all three parties collaborate to commit fraud, the preventive control no longer works. At this point, we need a **detective control**: an **audit trail** with **automatic logging**. Every time a supervisor override occurs (an abnormal situation), the system automatically creates a log entry for later review.

![[procedures13.png]]

### 10.2 Six Data Validation & Editing Controls

![[procedures14.png]]

#### 1. Sequence Check

Input should follow sequentially. For example, invoice numbers must be sequential: after invoice 101 comes 102. If 102 is missing, the system flags it.

![[procedures15.png]]

#### 2. Limit Check

The system does not accept data exceeding a predetermined amount. Example: the salary limit of $75,000: any input above this is rejected.

![[procedures16.png]]

#### 3. Range Check

The system allows only a specific range of values. Example: undergraduate students can register for course levels 1000-4000. If they try to register for 5000 or 6000 level courses (postgraduate), the system gives an error. A supervisor override is needed if an exception is warranted.

![[procedures17.png]]

#### 4. Validity Check

The system only accepts predetermined valid values. Example: only values like Male/Female, UG/PG, Full-time/Part-time are accepted.

![[procedures18.png]]

#### 5. Completeness Check

Mandatory fields must contain data before submission. Example: submitting an online form without entering the required email field triggers an error message.

![[procedures19.png]]

#### 6. Duplicate Check

The system ensures the same transaction is not entered more than once. Example: a discount voucher can only be used once: if the same voucher number (or a photocopy) is entered again, the system rejects it.

![[procedures20.png]]

---

## 11. Output Controls

Output controls provide assurance that the data delivered to users will be presented, formatted, and delivered in a **consistent and secure manner**.

![[procedures21.png]]

| Output Type | Control Measure |
| --- | --- |
| **Soft Copy** | Encryption to secure digital outputs |
| **Hard Copy** | Lock and key security; confidential documents may need to be printed at a supervisor's printer and collected in person with justification |
| **Remote Access** | Certain critical information cannot be accessed remotely (via VPN): must be accessed from the office computer only |

---
