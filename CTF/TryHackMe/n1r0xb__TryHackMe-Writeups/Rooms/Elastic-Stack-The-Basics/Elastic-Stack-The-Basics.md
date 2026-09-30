# <div align="center">[`Elastic Stack: The Basics`](https://tryhackme.com/room/investigatingwithelk101)</div>
<div align="center">
 <img src="https://github.com/user-attachments/assets/d37c79b5-ecc4-40dc-a36c-645ca3866dc2" height="250"></img>
</div>

---
|Terminology|Definition|
|:---------:|----------|
|`API`           |API, which stands for Application Programming Interface, is a set of rules and protocols for building software and applications. An API allows different software programs to communicate with each other. It defines methods of communication between various components, including the kinds of requests that can be made, how they're made, the data formats that should be used, and conventions to follow.|
|`Elasticsearch` |Elasticsearch is a distributed, scalable, and highly available search engine. It is used to store and index data so that it can be quickly searched and analysed.|
|`ELK`           |ELK stands for Elasticsearch, Logstash, and Kibana. These are three open-source tools that are commonly used together to collect, store, analyse, and visualise data.|
|`JSON`          |JavaScript Object Notation is an open standard file and data interchange format that uses human-readable text to store and transmit data objects consisting of attribute: value pairs and arrays.|
|`Kibana`        |Kibana is a web-based visualisation tool for exploring data stored in Elasticsearch. It can be used to create interactive dashboards and charts that help users to understand data.|
|`Logstash`      |Logstash is a tool for collecting and processing data from a variety of sources. It can be used to collect logs from applications, servers, and other systems. It can also be used to parse and transform data before it is stored in Elasticsearch.|
|`SIEM`          |Security Information and Event Management system that is used to aggregate security information in the form of logs, alerts, artifacts and events into a centralized platform that would allow security analysts to perform near real-time analysis during security monitoring.|
|`SOC`           |Security Operations Center (SOC) is a team of IT security professionals tasked with monitoring, preventing , detecting , investigating, and responding to threats within a company’s network and systems.|
|`VPN`           |A Virtual Private Network is a way to create a secure "tunnel" between two networks. For example, you use a VPN on TryHackMe to access the private network on which the machines operate. VPNs are also commonly used for an employee to log into their workplace when they are not on site (such as working from home or travelling for business matters). VPNs are also used where networks (such as coffee shops) do not provide encryption, and are a great way of preventing others from reading your network traffic.|
---
## `Elastic Stack Overview`

**Elastic Stack** is a collection of different open-source components that work together to collect data from any source, store and search it, and visualize it in real time. 

**Core Components:**
* **Elasticsearch**  is a full-text search and analytics engine for JSON-formatted documents.
* **Logstash** is a data processing engine that takes data from different sources, filters it, or normalizes it, and then sends it to the destination. A Logstash configuration file is divided into three parts, as shown below:

  <img width="151" height="234" alt="Elastic-Stack-Overview(EStB)-THM" src="https://github.com/user-attachments/assets/e8fd0fd5-c51f-497e-bea8-f0d5316d933f"></img>

* **Beats** are host-based agents known as data-shippers that ship/transfer data from the endpoints to Elasticsearch.

  <img width="685" height="293" alt="Elastic-Stack-Overview-2(EStB)-THM" src="https://github.com/user-attachments/assets/a08722cb-a7b2-4d86-912c-2f2e0584a221" />

* **Kibana** is a web-based data visualization tool that works with Elasticsearch to analyze, investigate, and visualize data streams in real time.

---

<b>*Q1: Logstash is used to visualize the data. (yay / nay)*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>Nay</code>
</details>

<b>*Q2: Elasticstash supports all data formats apart from JSON. (yay / nay)*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>Nay</code>
</details>

---
## `Discover Tab`

The **Discover tab** is where the SOC analysts spend most of their time. This tab shows the ingested logs, the search bar, normalized fields, and more.

---

**Logs:** Each row shows a single log containing information about the event, along with the fields and values found in that log.

**Fields Pane:** The left panel of the interface shows the list of fields parsed from the logs. We can click on any field to add it to the filter or remove it from the search.

**Index Pattern:** Each type of log is stored in a different index pattern. We can select the index pattern from which we need the logs. For example, for VPN logs, we would need to select the index pattern in which VPN logs are stored.

**Search Bar:** It is a place where the user adds search queries and applies filters to narrow down the results. In the next task, we will learn how to perform searches through queries.

**Time Filter:** We can narrow down results based on any specific time duration.

**Time Interval:** This chart shows the event counts over time.

**TOP Bar:** This bar contains various options to save the search, open the saved searches, share or save the search, etc.

**Discover Tab:** This is the main workspace in Kibana for exploring, searching, and analyzing raw data.

**Add Filter:** We can apply filters to specific fields to narrow down results, rather than manually typing entire queries.

---

<b>*Q1: Select the index vpn_connections and filter from 31st December 2021 to 2nd Feb 2022. How many hits are returned?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>2861</code>
</details>

<b>*Q2: Which IP address has the maximum number of connections?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>238.163.231.224</code>
</details>

<b>*Q3: Which user is responsible for the overall maximum traffic?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>James</code>
</details>

<b>*Q4: Apply Filter on UserName Emanda; which SourceIP has max hits?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>107.14.1.247</code>
</details>

<b>*Q5: On 11th Jan, which IP caused the spike observed in the time chart?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>172.201.60.191</code>
</details>

<b>*Q6: How many connections were observed from IP 238.163.231.224, excluding the New York state?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>48</code>
</details>

---
## `KQL Overview`

There is a special language that we can use inside this search bar to perform our searches. KQL (**Kibana Query Language**) is a search query language used to search the ingested logs/documents in Elasticsearch.

**Free Text Search** allows users to search for logs based on text only.
 
_KQL also allows users to utilize logical operators in the search query:_ `AND` `OR` `NOT`

**Field-Based Search** we will provide the field name and the value we are looking for in the logs, and uses the syntax `Field: Value`.

---

<b>*Q1: Create a search query to filter the logs where Source_Country is the United States and show logs from User James or Albert. How many records were returned?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>161</code>
</details>

<b>*Q2: A user Johny Brown was terminated on the 1st of January, 2022. Create a search query to determine how many times a VPN connection was observed after his termination.*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>1</code>
</details>

---
## `Creating Visualizations`

The **visualization tab** allows us to visualize the data in different forms such as tables, pie charts, bar charts, etc.

* Create a visualization and click the Save button at the top right corner.
* Add the title and description to the visualization.
* Click Save and add to the library when it's done.

---

<b>*Q1: Which user was observed with the greatest number of failed attempts?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>Simon</code>
</details>

<b>*Q2: How many wrong VPN connection attempts were observed in January?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>274</code>
</details>

---
## `Creating Dashboards`

Dashboards provide good visibility into log collection. A user can create multiple dashboards to fulfill a specific need.

**Creating a Custom Dashboard:**
* Go to the Dashboard tab and click on the Create dashboard.
* Click on Add from Library.
* Click on the visualizations and saved searches. It will be added to the dashboard.
* Once the items are added, adjust them accordingly, as shown below.
* Don't forget to save the dashboard after completing it.
