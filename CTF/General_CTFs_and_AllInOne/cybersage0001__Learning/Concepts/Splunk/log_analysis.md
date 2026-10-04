# Splunk Firewall Log Analysis: Hands-On Practice
### Overview

As part of my cybersecurity and Security Operations Center (SOC) learning journey, I practiced analyzing firewall logs using Splunk Enterprise.

The goal of this exercise was to understand how raw firewall events can be searched, filtered, parsed, and summarized using Splunk Search Processing Language (SPL).

In this practice, I worked with firewall logs containing information such as:

Source IP address
Destination IP address
Protocol
Firewall action
Network interface
MAC address
Timestamp

The main focus was to identify accepted and denied network traffic and determine which source IP addresses were generating the highest number of denied events.

### 🎯 Objectives

The objectives of this hands-on practice were:

Search firewall logs in Splunk.
Understand the structure of raw firewall events.
Extract the source IP address from _raw events.
Extract the firewall action from _raw events.
Count ACCEPT and DENY events.
Filter only denied traffic.
Identify source IPs generating the highest number of denied events.
Understand how SPL commands can be combined for security monitoring.

### 🛠️ Tools Used
Tool	Purpose
Splunk Enterprise	Log collection, searching and analysis
Splunk SPL	Querying and processing firewall events
Firewall Logs	Network security event data

### 1. Understanding the Firewall Logs

The firewall events used in this exercise followed a format similar to:

Nov 25 11:35:44 fw01 kernel: IN=eth0 OUT= MAC=00:1a:2b:3c:4d:5e SRC=192.168.1.7 DST=192.168.1.239 PROTO=ICMP ACTION=DENY

Let's break this event down:

IN=eth0

The incoming network interface is eth0.

SRC=192.168.1.7

The source IP address is 192.168.1.7.

DST=192.168.1.239

The destination IP address is 192.168.1.239.

PROTO=ICMP

The network protocol is ICMP.

ACTION=DENY

The firewall denied the traffic.

This type of information is extremely useful for a SOC analyst because firewall logs can help identify:

Blocked connections
Suspicious source IP addresses
Network scanning
Unauthorized communication
Repeated connection attempts
Potential reconnaissance activity

### 2. Search Firewall Logs in Splunk

The first step was to search for events from the firewall log source.

SPL Query
index=main sourcetype="firewall_new"
Explanation

Here:

index=main tells Splunk to search the main index.
sourcetype="firewall_new" limits the search to events identified with the firewall_new sourcetype.

This returned thousands of firewall events.

Why this matters

Before performing analysis, it is important to understand what data is available.

A SOC analyst normally starts broad and then progressively narrows the search.

Workflow
Firewall Logs->Splunk Index->Search by Sourcetype->Raw Firewall Events->Field Extraction->Statistical Analysis->Security Investigation

<img width="1346" height="600" alt="7" src="https://github.com/user-attachments/assets/b127a470-e458-4b08-a5b8-0066352850d4" />

### 3. Extract the Source IP Address Using rex

Firewall logs are often stored as raw text.

For example:

SRC=192.168.1.7

Splunk may not automatically extract every field from a custom log format.

The rex command can be used to extract information from _raw data using regular expressions.

SPL Query
index=main
| rex field=_raw "SRC=(?<src_ip>\d{1,3}(?:\.\d{1,3}){3})"
Explanation

The important part is:

rex field=_raw

This tells Splunk to perform a regular-expression extraction against the raw event.

The pattern:

SRC=(?<src_ip>\d{1,3}(?:\.\d{1,3}){3})

looks for:

SRC=

followed by an IPv4 address.

The extracted value is stored in a new field:

src_ip

For example:

SRC=192.168.1.7

becomes:

src_ip=192.168.1.7
Why rex is useful

rex is especially useful when:

Data is not automatically parsed.
Logs are custom formatted.
You need to extract a field temporarily.
You want to investigate a specific pattern.

<img width="1354" height="616" alt="8" src="https://github.com/user-attachments/assets/05094b10-5ca3-4bac-b3d9-dc497ab9d361" />

### 4. Count Firewall Actions

Next, I wanted to understand the overall distribution of firewall actions.

SPL Query
index=main sourcetype="firewall_new"
| stats count by ACTION
Result

The search returned:

ACTION	Count
ACCEPT	4,997
DENY	5,003

This means the dataset contained approximately equal numbers of accepted and denied firewall events.

Understanding stats

The command:

stats count by ACTION

groups the events according to the value of ACTION and counts how many events belong to each category.

Conceptually:

All Firewall Events
        |
        +---- ACCEPT → 4,997
        |
        +---- DENY   → 5,003

This is a simple but useful SOC technique because it provides a quick overview of network activity.

<img width="1351" height="489" alt="9" src="https://github.com/user-attachments/assets/febf191c-40c9-431c-b05d-61da923e71f5" />

### 5. Filter Only Denied Traffic

After identifying the total number of denied events, I narrowed the search to DENY actions.

SPL Query
index=main sourcetype="firewall_new"
| stats count by ACTION
| where ACTION="DENY"
Result
ACTION    count
DENY      5003

There were:

5,003 denied firewall events.

Why this is useful

Denied traffic deserves attention because repeated denied connections may indicate:

Port scanning
Unauthorized access attempts
Misconfigured applications
Blocked services
Host discovery
Suspicious network activity

However, a DENY event by itself does not automatically mean an attack occurred.

The analyst needs to examine the source, destination, protocol, frequency, timing, and other context.

<img width="1346" height="591" alt="10" src="https://github.com/user-attachments/assets/d39812ee-9649-46c6-b695-04551a42e686" />

### 6. Extract Source IP and Action

For deeper analysis, I extracted both the source IP address and firewall action.

SPL Query
index=main sourcetype="firewall_new"
| rex field=_raw "SRC=(?<src_ip>\S+)"
| rex field=_raw "ACTION=(?<action>\S+)"

This creates two fields:

src_ip
action

For example:

SRC=192.168.1.168
ACTION=DENY

becomes:

src_ip = 192.168.1.168
action = DENY

### 7. Calculate Total, Denied and Allowed Events by Source IP

The next step was to determine how much traffic each source IP generated and how much of that traffic was denied.

SPL Query
index=main sourcetype="firewall_new"
| rex field=_raw "SRC=(?<src_ip>\S+)"
| rex field=_raw "ACTION=(?<action>\S+)"
| stats count as total_events,
    count(eval(action="DENY")) as denied_events,
    count(eval(action="ACCEPT")) as allowed_events
    by src_ip
| sort: denied_events
Important correction

In the original screenshot, the query used:

count(eval(action="ALLOW")) as allowed_events

But the firewall logs contain:

ACTION=ACCEPT

Therefore, ALLOW does not match the actual data.

The corrected expression is:

count(eval(action="ACCEPT")) as allowed_events

This is an important lesson when working with SIEM data:

Always make sure your query values match the values actually present in the logs.

<img width="1339" height="601" alt="11" src="https://github.com/user-attachments/assets/91a6c0c9-36f5-480f-bf47-15a6a256545a" />

### 8. Understanding the stats Command

This section is particularly important for beginners.

The query uses:

stats count as total_events

This counts the total number of events for each source IP.

Then:

count(eval(action="DENY")) as denied_events

counts only events where:

action = DENY

Similarly:

count(eval(action="ACCEPT")) as allowed_events

counts events where:

action = ACCEPT

Finally:

by src_ip

tells Splunk to perform these calculations separately for every source IP.

The result looks conceptually like:

Source IP	Total Events	Denied Events	Accepted Events
192.168.1.168	592	285	307
192.168.1.67	417	224	193
192.168.1.157	423	209	214
192.168.1.57	397	206	191
192.168.1.175	403	200	203

The exact values depend on the complete dataset, but the important point is how the query produces the analysis.

### 9. Sort Sources by Denied Events

The final part of the query is:

| sort: denied_events

The minus sign means descending order.

Therefore, the source IP with the highest number of denied events appears first.

For example:

192.168.1.168 → 285 denied
192.168.1.67  → 224 denied
192.168.1.157 → 209 denied
192.168.1.57  → 206 denied
192.168.1.175 → 200 denied

This gives the analyst a useful starting point for investigation.

10. Investigating a Suspicious Source IP

Once an IP address has a high number of denied events, we can investigate it further.

For example:

index=main sourcetype="firewall_new"
| rex field=_raw "SRC=(?<src_ip>\S+)"
| search src_ip="192.168.1.168"

We can then investigate:

Which destinations it contacted
Which protocols were used
Which actions were denied
When the activity occurred
Whether the traffic was repeated
Whether the behavior appears normal for that host

We could also examine protocols:

index=main sourcetype="firewall_new"
| rex field=_raw "SRC=(?<src_ip>\S+)"
| rex field=_raw "PROTO=(?<protocol>\S+)"
| stats count by src_ip protocol
| sort: count

This can help identify unusual communication patterns.

### 11. What I Learned

This hands-on exercise helped me understand several important Splunk concepts.

1. Searching logs

I learned how to start with:

index=main sourcetype="firewall_new"

and progressively narrow the dataset.

2. Regular-expression extraction

I learned how to use:

rex

to extract values from raw logs.

3. Statistical analysis

I practiced:

stats count by ACTION

to summarize firewall activity.

4. Conditional counting

I learned how:

count(eval(...))

can be used to count specific types of events.

5. Sorting results

I used:

sort: denied_events

to prioritize source IP addresses with the highest number of denied connections.

6. Investigative thinking

Most importantly, I learned that SIEM analysis is not just about finding numbers.

The analyst needs to ask:

What happened?<br>
      ↓<br>
Which host generated it?<br>
      ↓<br>
What was the destination?<br>
      ↓<br>
What protocol was used?<br>
      ↓<br>
Was it allowed or denied?<br>
      ↓<br>
How frequently did it happen?<br>
      ↓<br>
Is the behavior expected?<br>
      ↓<br>
Does it require investigation?<br>

### 12. Security Analysis

From the analysis, the dataset contained:

ACCEPT = 4,997
DENY   = 5,003

The number of denied events was slightly higher than accepted events.

The source-IP analysis also showed that some IP addresses generated significantly more denied events than others.

For example, the top result shown in the analysis was:

192.168.1.168

with a high number of denied events.

This does not automatically mean that the host is malicious.

A SOC analyst should correlate the firewall activity with other sources such as:

Authentication logs
Endpoint logs
DNS logs
Web proxy logs
IDS/IPS alerts
VPN logs
Windows/Linux security logs

This provides better context before classifying an event as malicious.

### 13. Useful SPL Queries
View all firewall events<br>
index=main sourcetype="firewall_new"<br>

Count actions<br>
index=main sourcetype="firewall_new"| stats count by ACTION<br>

Show only denied events<br>
index=main sourcetype="firewall_new"| search ACTION="DENY"<br>

Extract source IP<br>
index=main sourcetype="firewall_new" | rex field=_raw "SRC=(?<src_ip>\d{1,3}(?:\.\d{1,3}){3})"<br>

Count denied events<br>
index=main sourcetype="firewall_new" ACTION="DENY"| stats count<br>

Find top source IPs by denied traffic<br>
index=main sourcetype="firewall_new"| rex field=_raw "SRC=(?<src_ip>\S+)" | search ACTION="DENY"| stats count as denied_events by src_ip| sort: denied_events<br>

Compare accepted and denied traffic by source<br>
index=main sourcetype="firewall_new"| rex field=_raw "SRC=(?<src_ip>\S+)"| rex field=_raw "ACTION=(?<action>\S+)"
| stats count as total_events, count(eval(action="DENY")) as denied_events, count(eval(action="ACCEPT")) as accepted_events by src_ip | sort: denied_events<br>

### 14. Defensive Recommendations

From a defensive monitoring perspective, organizations should:

Monitor repeated denied connections from the same source.<br>
Investigate unusual source-to-destination communication.<br>
Correlate firewall logs with endpoint and authentication logs.<br>
Create alerts for abnormal spikes in denied traffic.<br>
Use meaningful field extraction and consistent field names.<br>
Maintain accurate firewall rules and regularly review them.<br>
Investigate internal hosts generating unexpected network traffic.<br>
Use dashboards to visualize firewall activity over time.<br>

### 15. Key Takeaways

This practice demonstrated how Splunk can transform raw firewall logs into useful security information.

The overall workflow was:<br>

Raw Firewall Logs<br>
       ↓<br>
Search in Splunk<br>
       ↓<br>
Extract SRC and ACTION<br>
       ↓<br>
Count ACCEPT / DENY<br>
       ↓<br>
Filter DENY Events<br>
       ↓<br>
Group by Source IP<br>
       ↓<br>
Sort by Denied Events<br>
       ↓<br>
Identify Candidates for Investigation<br>

The biggest takeaway for me was that SPL becomes much more powerful when multiple commands are combined.

Instead of simply searching for an event, I can extract information, calculate statistics, filter results, and prioritize potentially interesting activity.

### 16. Skills Practiced<br>
Splunk Enterprise<br>
Splunk SPL<br>
Firewall Log Analysis<br>
SIEM Fundamentals<br>
Log Searching<br>
Regular Expressions<br>
rex<br>
stats<br>
count<br>
eval<br>
search<br>
where<br>
sort<br>
Source IP Analysis<br>
Security Event Investigation<br>
SOC Monitoring Fundamentals<br>

### 17. Conclusion

This hands-on exercise gave me practical experience with analyzing firewall logs using Splunk Enterprise.

I started by searching raw firewall events and then moved toward more structured analysis by extracting source IP addresses and firewall actions.

I also learned an important real-world lesson: queries must match the actual values in the logs. In this case, the logs used ACTION=ACCEPT, while using ALLOW in the conditional count resulted in zero accepted events.

This exercise strengthened my understanding of how a SOC analyst can use Splunk to move from raw log data → meaningful information → investigation priorities.

### ⚠️ Disclaimer

This project was performed in a controlled lab/learning environment for educational and cybersecurity training purposes. The techniques demonstrated here should only be used on systems, networks, and data that you own or have explicit authorization to analyze.
