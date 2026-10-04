# <div align="center">[`SOC Workbooks and Lookups`](https://tryhackme.com/room/socworkbookslookups)</div>
<div align="center">
 <img src="https://github.com/user-attachments/assets/847bcbe4-5bfa-4cac-a58c-41232037a43d" height="250"></img>
</div>

---
|Terminology|Definition|
|:---------:|----------|
|`AD`             |Active Directory is a directory service developed by Microsoft for Windows domain networks. It stores information about network objects such as computers, users, and groups. It provides authentication and authorisation services, and allows administrators to manage network resources centrally.|
|`EDR`            |Endpoint detection and response (EDR) is a series of tools that monitor devices for activity that could indicate a threat.|
|`Network Diagram`|A visual schema presenting existing locations, subnets, and their connections.|
|`SIEM`           |Security Information and Event Management system that is used to aggregate security information in the form of logs, alerts, artifacts and events into a centralized platform that would allow security analysts to perform near real-time analysis during security monitoring.|
|`SOAR`           |SOAR stands for Security Orchestration, Automation, and Response. It is a solution that helps organisations to streamline and automate their security operations, including incident management, threat intelligence, and vulnerability response.|
|`SOC`            |Security Operations Center (SOC) is a team of IT security professionals tasked with monitoring, preventing , detecting , investigating, and responding to threats within a company’s network and systems.|

---
## `Assets and Identities`

**Identity Inventory** is a catalogue of corporate employees (user accounts), services (machine accounts), and their details like privileges, contacts, and roles within the company.

**Sources of Identities:**

|**Solution**|**Examples**|**Description**|
|:----------:|:-----------|---------------|
|`Active Directory`|On-prem AD, Entra ID  |AD itself is an identity database, and it is commonly used by SOC|
|`SSO Providers`   |Okta, Google Workspace|Cloud alternative for AD, an easy way to manage and search the users|
|`HR Systems`      |BambooHR, SAP, HiBob  |Limited to employees only, but usually provides full employee data|
|`Custom Solution` |CSV or Excel Sheets   |It is common for IT or security teams to maintain their own solutions|

---

**Asset Inventory**, also called asset lookup, is a list of all computing resources within an organization's IT environment.

|**Solution**|**Examples**|**Description**|
|:----------:|:-----------|---------------|
|`Active Directory`  |On-prem AD, Entra ID  |AD is not only an identity but also a solid asset inventory database|
|`SIEM or EDR`       |Elastic, CrowdStrike  |Some SIEM or EDR agents collect information about the monitored hosts|
|`MDM Solution`      |MS Intune, Jamf MDM   |A dedicated class of solutions created to list and manage assets|
|`Custom Solution`   |CSV or Excel Sheets   |Same as with the identity inventory, custom solutions are common|

---

<b>*Q1: Looking at the identity inventory, what is the role of R.Lund at the company?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>US Financial Adviser</code>
</details>

<b>*Q2: Checking the asset inventory, what data does the HQ-FINFS-02 server store?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>Financial Records</code>
</details>

<b>*Q3: Finally, does the file sharing from the scenario look legitimate and expected? (Yea/Nay)*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>Yea</code>
</details>

---
## `Network Diagrams`

---

<b>*Q1: According to the network diagram, which service is exposed on the TCP/10443 port?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>VPN</code>
</details>

<b>*Q2: Now, which subnet would the server behind 172.16.15.99 IP belong to?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>Database Subnet</code>
</details>

<b>*Q3: Finally, does the scenario look like a True Positive (TP) or False Positive (FP)?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>TP</code>
</details>

---
## `Workbooks Theory`

**SOC Workbooks**, also called playbooks, runbooks, or workflows, are a structured document that defines the steps required to investigate and remediate specific threats efficiently and consistently.

1. **Enrichment:** Use Threat Intelligence and identity inventory to get information about the affected user.
2. **Investigation:** Using the gathered data and SIEM logs, make your verdict if the login is expected.
3. **Escalation:** Escalate the alert to L2 or communicate the login with the user if necessary.

---

<b>*Q1: Which SOC role would use workbooks the most (e.g. SOC Manager)?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>SOC L1 Analyst</code>
</details>

<b>*Q2: What is the process of gathering user, host, or IP context using TI and lookups?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>Enrichment</code>
</details>

<b>*Q3: Looking at the workbook example, what platform is used as an identity inventory source?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>BambooHR</code>
</details>

---
## `Workbooks Practice`

---

<b>*Q1: What flag did you receive after completing the first workbook?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>THM{the_most_common_soc_workbook}</code>
</details>

<b>*Q2: What flag did you receive after completing the second workbook?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>THM{be_vigilant_with_powershell}</code>
</details>

<b>*Q3: What flag did you receive after completing the third workbook?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>THM{asset_inventory_is_essential}</code>
</details>
