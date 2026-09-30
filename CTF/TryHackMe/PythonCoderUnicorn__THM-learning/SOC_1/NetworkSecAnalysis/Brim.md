#Subscribers 
https://tryhackme.com/room/brim

[BRIM](https://www.brimdata.io/) is an open-source desktop application that processes pcap files and logs files. Its primary focus is providing search and analytics. In this room, you will learn how to use Brim, process pcap files and investigate log files to find the needle in the haystack! This room expects you to be familiar with basic security concepts and processing Zeek log files. We suggest completing the "[Network Fundamentals](https://tryhackme.com/module/network-fundamentals)" path and the "[**Zeek room**](https://tryhackme.com/room/zeekbro)" before starting working in this room.

## what is brim

Brim is an open-source desktop application that processes pcap files and logs files, with a primary focus on providing search and analytics. It uses the Zeek log processing format. It also supports Zeek signatures and Suricata Rules for detection.

It can handle two types of data as an input;
- Packet Capture Files: Pcap files created with tcpdump, tshark and Wireshark like applications.
- Log Files: Structured log files like Zeek logs.

Brim is built on open-source platforms:
- **Zeek:** Log generating engine.
- **Zed Language:** Log querying language that allows performing keywoırd searches with filters and pipelines.
- **ZNG Data Format:** Data storage format that supports saving data streams.
- **Electron and React:** Cross-platform UI.

Ever had to investigate a big pcap file? Pcap files bigger than one gigabyte are cumbersome for Wireshark. Processing big pcaps with tcpdump and Zeek is efficient but requires time and effort. Brim reduces the time and effort spent processing pcap files and investigating the log files by providing a simple and powerful GUI application.

![[Screen Shot 2025-03-11 at 9.18.25 AM.png]]

## basics

Once you open the application, the landing page loads up. The landing page has three sections and a file importing window. It also provides quick info on supported file formats.
- **Pools:** Data resources, investigated pcap and log files.
- **Queries:** List of available queries.
- **History:** List of launched queries.

### Pools and Log Details

Pools represent the imported files. Once you load a pcap, Brim processes the file and creates Zeek logs, correlates them, and displays all available findings in a timeline, as shown in the image below.
The timeline provides information about capture start and end dates. Brim also provides information fields. You can hover over fields to have more details on the field.

You can correlate each log entry by reviewing the correlation section at the log details pane (shown on the left image). This section provides information on the source and destination addresses, duration and associated log files. This quick information helps you answer the "Where to look next?" question and find the event of interest and linked evidence.

you can also right-click on each field to filter and accomplish a list of tasks.
- Filtering values
- Counting fields
- Sorting (A-Z and Z-A)
- Viewing details 
- Performing whois lookup on IP address
- Viewing the associated packets in Wireshark

### Queries and History

Queries help us to correlate finding and find the event of the interest. History stores executed queries.

Queries can have names, tags and descriptions. Query library lists the query names, and once you double-click, it passes the actual query to the search bar.
You can double-click on the query and execute it with ease. Once you double-click on the query, the actual query appears on the search bar and is listed under the history tab.
The results are shown under the search bar. In this case, we listed all available log sources created by Brim. In this example, we only insert a pcap file, and it automatically creates nine types of Zeek log files. 

Brim has 12 premade queries listed under the "Brim" folder. These queries help us discover the Brim query structure and accomplish quick searches from templates.  You can add new queries by clicking on the "+" button near the "Queries" menu.

```
Process the "sample.pcap" file and look at the details of the first DNS log that appear on the dashboard. What is the "qclass_name"? (right click open details)

C_INTERNET

Look at the details of the first NTP log that appear on the dashboard. What is the "duration" value? (The correlation section provides the duration value.)

0.005

Look at the details of the STATS packet log that is visible on the dashboard. What is the "reassem_tcp_size"?

540

```

## default queries 

Reviewing Overall Activity

This query provides general information on the pcap file. The provided information is valuable for accomplishing further investigation and creating custom queries. It is impossible to create advanced or case-specific queries without knowing the available log files.

**Windows Specific Networking Activity**

This query focuses on Windows networking activity and details the source and destination addresses and named pipe, endpoint and operation detection. The provided information helps investigate and understand specific Windows events like SMB enumeration, logins and service exploiting.

Unique Network Connections and Transferred Data

These two queries provide information on unique connections and connection-data correlation. The provided info helps analysts detect weird and malicious connections and suspicious and beaconing activities. The uniq list provides a clear list of unique connections that help identify anomalies. The data list summarizes the data transfer rate that supports the anomaly investigation hypothesis.

DNS and HTTP Methods

These queries provide the list of the DNS queries and HTTP methods. The provided information helps analysts to detect anomalous DNS and HTTP traffic. You can also narrow the search by viewing the "HTTP POST" requests with the available query and modifying it to view the "HTTP GET" methods.

File Activity

This query provides the list of the available files. It helps analysts to detect possible data leakage attempts and suspicious file activity. The query provides info on the detected file MIME and file name and hash values (MD5, SHA1).

IP Subnet Statistics

This query provides the list of the available IP subnets. It helps analysts detect possible communications outside the scope and identify out of ordinary IP addresses.

Suricata Alerts

These queries provide information based on Suricata rule results. Three different queries are available to view the available logs in different formats (category-based, source and destination-based, and subnet based).

> [!info] **Note:** 
> Suricata is an open-source threat detection engine that can act as a rule-based Intrusion Detection and Prevention System. It is developed by the Open Information Security Foundation (OISF). Suricata works and detects anomalies in a similar way to [**Snort**](https://tryhackme.com/room/snort) and can use the same signatures.

```
Use task4 pcap file.
Investigate the files. What is the name of the detected GIF file?

cat01_with_hidden_text.gif

You can filter the conn logfile and then view the available sections by scrolling the horizontal bar. _path=="conn" | cut geo.resp.country_code, geo.resp.region, geo.resp.city

Investigate the conn logfile. What is the number of the identified city names?

Eppelborn, Frankfurt am Main
2

Investigate the Suricata alerts. What is the Signature id of the alert category "Potential Corporate Privacy Violation"?

event_type=="alert" | sort alert.signature_id
details on 1st row

2,012,887

```

## use cases 

There are a variety of use case examples in traffic analysis. For a security analyst, it is vital to know the common patterns and indicators of anomaly or malicious traffic. In this task, we will cover some of them. Let's review the basics of the Brim queries before focusing on the custom and advanced ones.

```shell
# brim query 

search IP        10.0.0.1
logical          192 and NTP 
filter           "id.orig_h" =="10.10.10.10"
list log file    _path=="conn"
count values     count() by _path
sort             count() by _path | sort -r
cut field        _path=="conn" | cut id.orig_h, id.resp_p, id.resp_h
list unique      _path=="conn" | cut id.orig_h | sort | uniq

# always to use the field filters to search for the event of interest.

# communication hosts   (detect any suspicious and abnormal activity)
_path=="conn" | cut id.orig_h, id.resp_h | sort | uniq

# freq comm hosts       ( detect possible data exfiltration etc)
_path=="conn" | cut id.orig_h, id.resp_h | sort | uniq -c | sort -r

# most active ports     (detect anomalies)
_path=="conn" | cut id.resp_p, service | sort | uniq -c | sort -r count

_path=="conn" | cut id.orig_h, id.resp_h, id.resp_p, service | sort id.resp_p | uniq -c | sort -r
 
# log connections    (first anomaly indicator: IP conn duration)
_path=="conn" | cut id.orig_h, id.resp_p, id.resp_h, duration | sort -r duration

# transferred data   (data exfil, malware download etc)
_path=="conn" | put total_bytes := orig_bytes + resp_bytes | sort -r total_bytes | cut uid, id, orig_bytes, resp_bytes, total_bytes

# DNS HTTP query    (abnormal conns: C2 server)
_path=="dns" | count () by query | sort -r
_path=="http" | count () by uri | sort -r

# suspicious hostnames   (abnormal hostnames)
_path=="dhcp" | cut host_name, domain

# suspicious IP    (abnormal IP addresses)
_path=="conn" | put classnet := network_of(id.resp_h) | cut classnet | count() by classnet | sort -r

# detect files    (detect transfer of malware /infected files)
filename!=null

# SMB activity {Server Msg Block} (detect possible malicious activities)
_path=="dce_rpc" OR _path=="smb_mapping" OR _path=="smb_files"

# known patterns  (alerts generated: security solutions)
event_type=="alert" or _path=="notice" or _path=="signatures"

```

## exercise: threat hunting malware C2

It is just another malware campaign spread with CobaltStrike. We know an employee clicks on a link, downloads a file, and then network speed issues and anomalous traffic activity arises. Now, open Brim, import the sample pcap and go through the walkthrough.

Let's look at the available logfiles first to see what kind of data artefact we could have. The image on the left shows that we have many alternative log files we could rely on. Let's review the frequently communicated hosts before starting to investigate individual logs.

```shell
cut id.orig_h, id.resp_p, id.resp_h | sort  | uniq -c | sort -r count

_path=="conn" | cut id.resp_p, service | sort | uniq -c | sort -r count

# find a sus website > VirusTotal
_path=="dns" | count() by query | sort -r

# check for downloads > VirusTotal
_path=="http" | cut id.orig_h, id.resp_h, id.resp_p, method, host, uri | uniq -c | sort value.uri

event_type=="alert" | count() by alert.severity,alert.category | sort count

```

>[!info] note: 
>Adversaries using CobaltStrike are usually skilled threats and don't rely on a single C2 channel. Common experience and use cases recommend digging and keeping the investigation by looking at additional C2 channels.

```
What is the name of the file downloaded from the CobaltStrike C2 connection?

search .exe
4564.exe

What is the number of CobaltStrike connections using port 443? The IP starting with "104" is CobaltStrike.

104.168.44.45
328

event_type=="alert" | cut alert.signature | sort -r | uniq -c | sort -r count
There is an additional C2 channel in used the given case. What is the name of the secondary C2 channel?

IcedID

```

https://www.youtube.com/watch?v=BT4c0UKMYhg

## exercise : crypto mining

Cryptocurrencies are frequently on the agenda with their constantly rising value and legal aspect. The ability to obtain cryptocurrencies by mining other than purchasing is becoming one of the biggest problems in today's corporate environments. Attackers not only compromise the systems and ask for a ransom, but sometimes they also install mining tools (cryptojacking). Other than the attackers and threat actors, sometimes internal threats and misuse of trust and privileges end up installing coin miners in the corporate environment.

Usually, mining cases are slightly different from traditional compromising activities. Internal attacks don't typically contain major malware samples. However, this doesn't mean they aren't malicious as they are exploiting essential corporate resources like computing power, internet, and electricity. Also, crypto mining activities require third party applications and tool installations which could be vulnerable or create backdoors. Lastly, mining activities are causing network performance and stability problems. Due to these known facts, coin mining is becoming one of the common use cases of threat hunters.

  
Let's look at the available logfiles first to see what kind of data artefact we could have. The image on the left shows that we don't have many alternative log files we could rely on. Let's review the frequently communicated hosts to see if there is an anomaly indicator.
```shell
cut id.orig_h, id.resp_p, id.resp_h | sort  | uniq -c | sort -r

_path=="conn" | cut id.resp_p, service | sort | uniq -c | sort -r count

_path=="conn" | put total_bytes := orig_bytes + resp_bytes | sort -r total_bytes | cut uid, id, orig_bytes, resp_bytes, total_bytes

event_type=="alert" | count() by alert.severity,alert.category | sort count

_path=="conn" | 192.168.1.100

event_type=="alert" | cut alert.category, alert.metadata.mitre_technique_name, alert.metadata.mitre_technique_id, alert.metadata.mitre_tactic_name | sort | uniq -c

Crypto Currency Mining
MITRE Technique: Resource_Hijacking
MITRE Technique ID: T1496
```

```
How many connections used port 19999?

_path=="conn" | cut id.resp_p | sort | uniq -c | sort -r
22

What is the name of the service used by port 6666?

cut id.resp_p, service | sort | uniq -c
irc

What is the amount of transferred total bytes to "101.201.172.235:8888"?

connection received data
3729

What is the detected MITRE tactic id?

TA0040
```

