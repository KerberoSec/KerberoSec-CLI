# <div align="center">[`Splunk: The Basics`](https://tryhackme.com/room/splunk101)</div>
<div align="center">
 <img src="https://github.com/user-attachments/assets/20b35eef-8fbd-41bf-981f-90f6ba810673" height="250"></img>
</div>

---
|Terminology|Definition|
|:---------:|----------|
|`SIEM`     |Security Information and Event Management system that is used to aggregate security information in the form of logs, alerts, artifacts and events into a centralized platform that would allow security analysts to perform near real-time analysis during security monitoring.|
|`SPL`      |Search Processing Language. A processing language used for searching in Splunk.|
|`Splunk`   |Splunk is a platform for collecting, storing, and analysing machine data. It provides various tools for analysing data, including search, correlation, and visualisation. It is a powerful tool that organisations of all sizes can use to improve their IT operations and security posture.|

---
## `Introduction`

**Splunk** is one of the leading SIEM solutions in the market. It allows users to collect, analyze, and correlate network and machine logs in real time.

---
## `Splunk Components`

<img width="632" height="208" alt="Splunk-Components(STB)-THM" src="https://github.com/user-attachments/assets/8fd224e3-0005-42fa-a7f8-20905fde42aa" />

**Splunk Forwarder:** is a lightweight agent installed on the endpoint intended to be monitored, and its main task is to collect the data and send it to the Splunk instance.

**Splunk Indexer:** plays the main role in processing the data it receives from forwarders. It parses and normalizes the data into field-value pairs, categorizes it, and stores the results as events, making the processed data easy to search and analyze.

**Search Head:** is the place within the Search & Reporting App where users can search the indexed logs. Searches are done using SPL (Search Processing Language), a powerful query language for searching indexed data.

---

<b>*Q1: Which component is used to collect and send data over the Splunk instance?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>Forwarder</code>
</details>

---
## `Navigating Splunk`

**Splunk Bar** has the following options available:
* `Messages` - View system-level notifications and messages.
* `Settings` - Configure Splunk instance settings.
* `Activity` - Review the progress of search jobs and processes.
* `Help` - View tutorials and documentation.
* `Find` - Search across the App.

**Apps Panel:** Shows the apps installed for the Splunk instance. The default app for every Splunk installation is Search & Reporting. 

**Explore Splunk:** This panel contains quick links to add data to the Splunk instance, add new Splunk apps, and access the Splunk documentation.

**Splunk Dashboard:** The last section is the Home Dashboard. By default, no dashboards are displayed. You can choose from a range of dashboards readily available within your Splunk instance. You can select a dashboard from the dropdown menu or by visiting the dashboards listing page.

---

<b>*Q1: In the Add Data tab, which option is used to collect data from files and ports?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>Monitor</code>
</details>

---
## `Adding Data`

Splunk can ingest any data. According to the Splunk documentation, when data is added to Splunk, the data is processed and transformed into a series of individual events. The data sources can be event logs, website logs, firewall logs, etc.

---

<b>*Q1: Upload the data attached to this task and create an index "VPN_Logs". How many events are present in the log file?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>2862</code>
</details>

<b>*Q2: How many log events are captured by the user Maleena?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>60</code>
</details>

<b>*Q3: What is the username associated with IP 107.14.182.38?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>Smith</code>
</details>

<b>*Q4: What is the number of events that originated from all countries except France?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>2814</code>
</details>

<b>*Q5: How many VPN events were associated with the IP 107.3.206.58*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>14</code>
</details>
