#SecurityOperations  #FreeRoom 

https://tryhackme.com/r/room/introtosiem

SIEM stands for **Security Information and Event Management system**.
- collects data from various endpoints/networking devices across the network
- stores data in centralized place and does correlation

![[Pasted image 20231005145045.png]]

each network component can have one or more log sources generating different logs.
divide our network log sources into 2 logical parts

HOST CENTRIC LOG SOURCES
- A user accessing a file
- A user attempting to authenticate.
- A process Execution Activity
- A process adding/editing/deleting a registry key or value.
- Powershell execution

NETWORK CENTRIC LOG SOURCES
network logs are generated when the hosts communicate with each other or visit a website
- protocols = SSH VPN HTTP/S FTP
- SSH connection
- a file being accessed via FTP
- company resources accessed via VPN
- network file sharing activity

Importance of SIEM

takes logs from various sources in real-time but also provides the ability to correlate between events, search through the logs, investigate incidents and respond promptly
- Real-time log Ingestion
- Alerting against abnormal activities  
- 24/7 Monitoring and visibility
- Protection against the latest threats through early detection
- Data Insights and visualization
- Ability to investigate past incidents.

![[Pasted image 20231006091840.png]]

## Log sources & Log ingestion

Every device in the network generates some kind of log whenever an activity is performed on it

Windows machine
Windows records every event that can be viewed through the `Event Viewer` utility. It assigns a unique ID to each type of log activity, making it easy for the analyst to examine and keep track of.

Linux machine
Linux OS stores all the related logs, such as events, errors, warnings, etc
-  `/var/log/httpd` : Contains HTTP Request  / Response and error logs.
- ` /var/log/cron`   : Events related to cron jobs are stored in this location.
- `/var/log/auth.log` and `/var/log/secure` : Stores authentication related logs.  
- `/var/log/kern` : This file stores kernel related events.

Web server
It is important to keep an eye on all the requests/responses coming in and out of the webserver for any potential web attack attempt. 
- Apache logs `/var/log/apache/` or `/var/log/httpd/`

Log ingestion
All these logs provide a wealth of information and can help in identifying security issues.

- Agent /Forwarder (SIEMS solutions tool: Splunk) captures all important logs and sends them to the SIEM server
- Syslog , protocol to collect data from various systems (web servers, databases)
- manual upload, users ingest offline data for quick analysis 
- port forwarding 

Some of the common capabilities of SIEM are:

- Correlation between events from different log sources.
- Provide visibility on both Host-centric and Network-centric activities.
- Allow analysts to investigate the latest threats and timely responses.
- Hunt for threats that are not detected by the rules in place

SOC Analysts utilize SIEM solutions in order to have better visibility of what is happening within the network. Some of their responsibilities include:

- Monitoring and Investigating.
- Identifying False positives.
- Tuning Rules which are causing the noise or False positives.
- Reporting and Compliance.
- Identifying blind spots in the network visibility and covering them.

Dashboards are the most important components of any SIEM. SIEM presents the data for analysis after being normalized and ingested.
- Alert Highlights
- System Notification
- Health Alert
- List of Failed Login Attempts
- Events Ingested Count
- Rules triggered
- Top Domains Visited

Correlation rules play an important role in the timely detection of threats allowing analysts to take action on time. Correlation rules are pretty much logical expressions set to be triggered. A few examples of correlation rules are:

- If a User gets 5 failed Login Attempts in 10 seconds: Raise an alert for `Multiple Failed Login Attempts`
- If login is successful after multiple failed login attempts: Raise an alert for `Successful Login After multiple Login Attempts`
- A rule is set to alert every time a user plugs in a USB (Useful if USB is restricted as per the company policy)
- If outbound traffic is > 25 MB: Raise an alert to potential Data exfiltration Attempt (Usually, it depends on the company policy)

## Create Correlation rule:

scenario 1
Adversaries tend to remove the logs during the post-exploitation phase to remove their tracks. A unique Event ID **104** is logged every time a user tries to remove or clear event logs. To create a rule based on this activity, we can set the condition as follows:

**Rule:** If the Log source is WinEventLog **AND** EventID is **104**: Trigger an alert `Event Log Cleared`

scenario 2
Adversaries use commands like **whoami** after the exploitation/privilege escalation phase. The following Fields will be helpful to include in the rule.

- Log source: Identify the log source capturing the event logs  
- Event ID: which Event ID is associated with Process Execution activity? In this case, event id 4688 will be helpful.  
- NewProcessName: which process name will be helpful to include in the rule?  

**Rule:** If Log Source is WinEventLog **AND** EventCode is **4688,** and NewProcessName contains **whoami,** then Trigger an ALERT `WHOAMI command Execution DETECTED`

In the previous task, the importance of field-value pairs was discussed. Correlation rules keep an eye on the values of certain fields to get triggered. That is the reason why it is important to have normalized logs ingested.

Alert investigation

analysts spend most of their time on dashboards as it displays various key details about the network in a very summarized way. Once an alert is triggered, the events/flows associated with the alert are examined, and the rule is checked to see which conditions are met.

- Alert is False Alarm. It may require tuning the rule to avoid similar False positives from occurring again.  
- Alert is True Positive. Perform further investigation.  
- Contact the asset owner to inquire about the activity.
- Suspicious activity is confirmed. Isolate the infected host.
- Block the suspicious IP.

---

  
Click on Start Suspicious Activity, which process caused the alert?
- hint= This process is a well-known mining software (https://www.cudominer.com/)
- ` cudominer.exe `

- `chris.fort`
- `HR_02`
- `miner`
- `true-positive` 
- ` THM{000_SIEM_INTRO} `

---
- [Jr. SOC Analyst](https://tryhackme.com/room/jrsecanalystintrouxo)
- [Splunk101](https://tryhackme.com/room/splunk101)
- [Splunk201](https://tryhackme.com/room/splunk201)
- [Benign](https://tryhackme.com/room/benign)
- [InvestigatingwithSplunk](https://tryhackme.com/room/investigatingwithsplunk)
- [InvestgatingwithELK](https://tryhackme.com/room/investigatingwithelk101)
- [ItsyBitsy](https://tryhackme.com/room/itsybitsy)

