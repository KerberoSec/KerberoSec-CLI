#Subscribers 
https://tryhackme.com/room/zeekbro

Zeek (formerly Bro) is an open-source and commercial passive Network Monitoring tool (traffic analysis framework)

[The official description;](https://docs.zeek.org/en/master/about.html) "Zeek (formerly Bro) is the world's leading platform for network security monitoring. Flexible, open-source, and powered by defenders." "Zeek is a passive, open-source network traffic analyser. Many operators use Zeek as a network security monitor (NSM) to support suspicious or malicious activity investigations. Zeek also supports a wide range of traffic analysis tasks beyond the security domain, including performance measurement and troubleshooting."

## network security monitoring 

Network monitoring is a set of management actions to watch/continuously overview and optionally save the network traffic for further investigation. This action aims to detect and reduce network problems, improve performance, and in some cases, increase overall productivity. It is a main part of the daily IT/SOC operations and differs from Network Security Monitoring (NSM) in its purpose.

Network Monitoring

Network monitoring is highly focused on IT assets like uptime (availability), device health and connection quality (performance), and network traffic balance and management (configuration). Monitoring and visualizing the network traffic, troubleshooting, and root cause analysis are also part of the Network Monitoring process. This model is helpful for network administrators and usually doesn't cover identifying non-asset in-depth vulnerabilities and significant security concerns like internal threats and zero-day vulnerabilities. Usually, Network Monitoring is not within the SOC scope. It is linked to the enterprise IT/Network management team.

Network Security Monitoring

Network Security Monitoring is focused on network anomalies like rogue hosts, encrypted traffic, suspicious service and port usage, and malicious/suspicious traffic patterns in an intrusion/anomaly detection and response approach. Monitoring and visualizing the network traffic and investigating suspicious events is a core part of Network Security Monitoring. This model is helpful for security analysts/incident responders, security engineers and threat hunters and covers identifying threats, vulnerabilities and security issues with a set of rules, signatures and patterns. Network Security Monitoring is part of the SOC, and the actions are separated between tier 1-2-3 analyst levels.

### zeek

Zeek (formerly Bro) is an open-source and commercial passive Network Monitoring tool (traffic analysis framework) developed by Lawrence Berkeley Labs. Today, Zeek is supported by several developers, and Corelight provides an Enterprise-ready fork of Zeek. Therefore this tool is called both open source and commercial. The differences between the open-source version and the commercial version are detailed [here](https://corelight.com/products/compare-to-open-source-zeek?hsLang=en).

Zeek differs from known monitoring and IDS/IPS tools by providing a wide range of detailed logs ready to investigate both for forensics and data analysis actions. Currently, Zeek provides 50+ logs in 7 categories.

```
# zeek

- network security monitoring and intrusion detection system
- network analysis
- hard to use, analysis is manual / automation
- visible traffic, threat hunting, detect complex threats, scripting language, easy to read logs
- intrusion detecting chained events

# snort

- network security monitoring and intrusion detection system
- detect vulnerabilities , patterns and packets
- hard to detect complex threats
- easy to write rules, Cisco suppported
- stop known attacks/threats

```

Zeek has two primary layers; "Event Engine" and "Policy Script Interpreter". The Event Engine layer is where the packets are processed; it is called the event core and is responsible for describing the event without focusing on event details. It is where the packages are divided into parts such as source and destination addresses, protocol identification, session analysis and file extraction. The Policy Script Interpreter layer is where the semantic analysis is conducted. It is responsible for describing the event correlations by using Zeek scripts.
```
network packets
L event engine
  L policy script (output)
     L logs
     L notifications
```

zeek frameworks
```
logging      notice   input       config        intelligence
-----------|--------|-----------|------------|----------
cluster     broker   supervisor  geolocation   file analysis
signature   summary  netcontrol  packet anal.  TLS decryption
```

Once you run Zeek, it will automatically start investigating the traffic or the given pcap file and generate logs automatically. Once you process a pcap with Zeek, it will create the logs in the working directory. If you run the Zeek as a service, your logs will be located in the default log path. `/opt/zeek/logs/`

There are two operation options for Zeek. 
- The first one is running it as a service
- second option is running the Zeek against a pcap. 

Before starting working with Zeek, let's check the version of the Zeek instance with the following command: `zeek -v`

Now we are sure that we have Zeek installed. 
Let's start the Zeek as a service! To do this, we need to use the "ZeekControl" module, as shown below. The "ZeekControl" module requires superuser permissions to use. You can elevate the session privileges and switch to the superuser account to examine the generated log files with the following command: `sudo su`

```shell
zeek -v
zeekctl status | start | stop
```

The only way to listen to the live network traffic is using Zeek as a service. Apart from using the Zeek as a network monitoring tool, we can also use it as a packet investigator. To do so, we need to process the pcap files with Zeek, as shown below. Once you process a pcap file, Zeek automatically creates log files according to the traffic.

```
zeek -C -r sample.pcap

-r       read/process
-C       ignore checksum errors
-v       version info
zeekctl  zeek control module
```

Each exercise has a folder. Ensure you are in the right directory to find the pcap file and accompanying files. **Desktop/Exercise-Files/TASK-2**

```
What is the installed Zeek instance version number?
zeek -v
4.2.1

What is the version of the ZeekControl module?
2.4.0

Investigate the "sample.pcap" file. What is the number of generated alert files?

zeek -C -r sample.pcap
8
```

## zeek logs

Zeek generates log files according to the traffic data. You will have logs for every connection in the wire, including the application level protocols and fields. Zeek is capable of identifying 50+ logs and categorizing them into seven categories. Zeek logs are well structured and tab-separated ASCII files, so reading and processing them is easy but requires effort. You should be familiar with networking and protocols to correlate the logs in an investigation, know where to focus, and find a specific piece of evidence.

Each log output consists of multiple fields, and each field holds a different part of the traffic data. Correlation is done through a unique value called "UID". The "UID" represents the unique identifier assigned to each session.

```
# network protocol logs

conn.log, dce_rpc.log, dhcp.log, dnp3.log, dns.log, ftp.log, http.log, irc.log, kerberos.log, modbus.log, modbus_register_change.log, mysql.log, ntlm.log, ntp.log, radius.log, rdp.log, rfb.log, sip.log, smb_cmd.log, smb_files.log, smb_mapping.log, smtp.log, snmp.log, socks.log, ssh.log, ssl.log, syslog.log, tunnel.log

# file analysis result logs

files.log, ocsp.log, pe.log, x509.log.

# Network control and flow logs

netcontrol.log, netcontrol_drop.log, netcontrol_shunt.log, netcontrol_catch_release.log, openflow.log.

# Detection and possible indicator logs

intel.log, notice.log, notice_alarm.log, signatures.log, traceroute.log.

# Network flow logs

known_certs.log, known_hosts.log, known_modbus.log, known_services.log, software.log.

# Additional logs cover external alerts, inputs and failures

barnyard2.log, dpd.log, unified2.log, unknown_protocols.log, weird.log, weird_stats.log.

# Zeek diagnostic logs cover system messages, actions and statistics.

broker.log, capture_loss.log, cluster.log, config.log, loaded_scripts.log, packet_filter.log, print.log, prof.log, reporter.log, stats.log, stderr.log, stdout.log.

```

Please refer to [Zeek's official documentation](https://docs.zeek.org/en/current/script-reference/log-files.html) and [Corelight log cheat sheet](https://corelight.com/about-zeek/zeek-data) for more information. Although there are multiple log files, some log files are updated daily, and some are updated in each session. Some of the most commonly used logs are explained in the given table.

|                      |                      |                                                 |
| -------------------- | -------------------- | ----------------------------------------------- |
| **Update Frequency** | **Log Name  <br>**   | **Description**                                 |
| **Daily**            | _known_hosts.log_    | List of hosts that completed TCP handshakes.    |
| **Daily**            | _known_services.log_ | List of services used by hosts.                 |
| **Daily**            | _known_certs.log_    | List of SSL certificates.                       |
| **Daily**            | _software.log_       | List of software used on the network.           |
| **Per Session**      | _notice.log_         | Anomalies detected by Zeek.                     |
| **Per Session**      | _intel.log_          | Traffic contains malicious patterns/indicators. |
| Per Session          | _signatures.log_     | List of triggered signatures.                   |
|                      |                      |                                                 |

**Brief log usage primer table;**

|                      |                    |                  |                      |
| -------------------- | ------------------ | ---------------- | -------------------- |
| **Overall Info**     | **Protocol Based** | **Detection**    | **Observation**      |
| _conn.log_           | _http.log_         | _notice.log_     | _known_host.log_     |
| _files.log_          | _dns.log_          | _signatures.log_ | _known_services.log_ |
| _intel.log_          | _ftp.log_          | _pe.log_         | _software.log_       |
| _loaded_scripts.log_ | _ssh.log_          | _traceroute.log_ | _weird.log_          |

You can categorize the logs before starting an investigation. Thus, finding the evidence/anomaly you are looking for will be easier. The given table is a brief example of using multiple log files. You can create your working model or customise the given one. Make sure you read each log description and understand the purpose to know what to expect from the corresponding log file. Note that these are not the only ones to focus on. Investigated logs are highly associated with the investigation case type and hypothesis, so do not just rely only on the logs given in the example table!

The table shows us how to use multiple logs to identify anomalies and run an investigation by correlating across the available logs.

- **Overall Info:** The aim is to review the overall connections, shared files, loaded scripts and indicators at once. This is the first step of the investigation.
- **Protocol Based:** Once you review the overall traffic and find suspicious indicators or want to conduct a more in-depth investigation, you focus on a specific protocol.
- **Detection:** Use the prebuild or custom scripts and signature outcomes to support your findings by having additional indicators or linked actions. 
- **Observation:** The summary of the hosts, services, software, and unexpected activity statistics will help you discover possible missing points and conclude the investigation.

**Recall 1:** Zeek logs are well structured and tab-separated ASCII files, so reading and processing them is easy but requires effort.

**Recall 2:** Investigating the generated logs will require command-line tools (cat, cut, grep sort, and uniq) and additional tools (zeek-cut).

In addition to Linux command-line tools, one auxiliary program called `zeek-cut` reduces the effort of extracting specific columns from log files. 
Each log file provides "field names" in the beginning. This information will help you while using `zeek-cut`. <span style="color:#a0f958">Make sure that you use the "fields" and not the "types"</span>.

```
zeek -C -r sample.pcap
ls
cat conn.log
cat conn.log | zeek-cut uid proto id.orig_h
```

Each exercise has a folder. Ensure you are in the right directory to find the pcap file and accompanying files. **Desktop/Exercise-Files/TASK-3**

```
Investigate the sample.pcap file. Investigate the dhcp.log file. What is the available hostname?

cat dhcp.log | zeek-cut host_name
Microknoppix

Investigate the dns.log file. What is the number of unique DNS queries?

DNS query
cat dns.log | zeek-cut query | uniq
2

Investigate the conn.log file. What is the longest connection duration?

cat conn.log
duration

cat conn.log | zeek-cut duration | sort -rg
d
332.319364

```

## CLI zeek logs 

Graphical User Interfaces (GUI) are handy and good for accomplishing tasks and processing information quickly. There are multiple advantages of GUIs, especially when processing the information visually. However, when processing massive amounts of data, GUIs are not stable and as effective as the CLI (Command Line Interface) tools.

The critical point is: What if there is no "function/button/feature" for what you want to find/view/extract?

Having the power to manipulate the data at the command line is a crucial skill for analysts. Not only in this room but each time you deal with packets, you will need to use command-line tools, <span style="color:#a0f958">Berkeley Packet Filters (BPF) </span>and regular expressions to find/view/extract the data you are looking for. This task provides quick cheat-sheet like information to help you write CLI queries for your event of interest.

```
# basics 
history
!10  # run 10th command in history
!!   # run last command in history

# read
cat sample.txt
head sample.txt
tail sample.txt

# filter
cat test.txt | cut -f 1          # cut 1st field
cat test.txt | cut -c 1          # cut 1st column

cat test.txt | grep 'keywords'
cat test.txt | sort 
cat test.txt | sort -n           # numerically
cat test.txt | uniq
cat test.txt | wc -l
cat test.txt | nl

cat test.txt | sed -n '11p'         # print line 11
cat test.txt | sed -n '10,15p'      # print lines 10-15

cat test.txt | awk 'NR < 11 {print $0}'    # print lines < 11
cat test.txt | awk 'NR == 11 {print $0}'

# Filter specific fields of Zeek logs:

cat signatures.log | zeek-cut uid src_addr dst_addr

```

## zeek signatures

Zeek supports signatures to have rules and event correlations to find noteworthy activities on the network. Zeek signatures use low-level pattern matching and cover conditions similar to Snort rules. 

Unlike Snort rules, Zeek rules are not the primary event detection point. Zeek has a scripting language and can chain multiple events to find an event of interest. We focus on the signatures in this task, and then we will focus on Zeek scripting in the following tasks.

Zeek signatures are composed of three logical paths:
- signature id
- conditions
- action

The signature breakdown is shown in the table below;

```
# signature id 
- unique name 
- Header: Filtering the packet headers for specific source and destination addresses, protocol and port numbers
- conditions: filter packet payload for specific pattern/value

# condition 

header 
- source IP         src-ip   
- source port       src-port
- destination IP    dst-ip
- destination port  dst-port
- target protocol   ip-proto      TCP, UDP, ICMP, ICMP6, IP, IP6

content packet payload
- http-request: Decoded HTTP requests.  
- http-request-header: Client-side HTTP headers.  
- http-request-body: Client-side HTTP request bodys.  
- http-reply-header: Server-side HTTP headers.  
- http-reply-body: Server-side HTTP request bodys.  
- ftp: Command line input of FTP sessions.

context:   same-ip     filtering src & dst for duplicates
action:    event       signature match message

zeek signatures
-C  ignore checksum errors
-r  read pcap file
-s  use signature file

zeek -C -r sample.pcap -s sample.sig

```

### example zeek signature

 simple signature to detect HTTP cleartext passwords.
```shell
signature http-password { 
	ip-proto == tcp 
	dst-port == 80 
	payload /.*password.*/ 
	event "Cleartext Password Found!" 
} 
# signature: Signature name. 
# ip-proto: Filtering TCP connection. 
# dst-port: Filtering destination port 80. 
# payload: Filtering the "password" phrase. 
# event: Signature match message.
```

Once the match occurs, Zeek will generate an alert and create additional log files (signatures.log and notice.log).

```
zeek -C -r http.pcap -s http-password.sig
cat notice.log | zeek-cut id.orig_h id.resp_h msg
cat signatures.log | zeek-cut src_addr dest_addr sig_id event_msg

cat signatures.log | zeek-cut sub_msg
cat notice.log | zeek-cut sub
```

You can practice discovering the event of interest by analyzing notice.log  and signatures.log.

### example FTP brute force 

Let's create another rule to filter FTP traffic. This time, we will use the FTP content filter to investigate command-line inputs of the FTP traffic. The aim is to detect FTP "admin" login attempts. This basic signature will help us identify the admin login attempts and have an idea of possible admin account abuse or compromise events.

```shell
signature ftp-admin { 
	ip-proto == tcp 
	ftp /.*USER.*dmin.*/ 
	event "FTP Admin Login Attempt!" 
}
```

```shell
zeek -C -r ftp.pcap -s ftp-admin.sig

cat signatures.log | zeek-cut src_addr dst_addr event_msg sub_msg | sort -r| uniq
```

Let's optimize our rule and make it detect all possible FTP brute-force attempts.

```shell
# FTP 530 response =  login failure events regardless of username.
signature ftp-brute { 
	ip-proto == tcp 
	payload /.*530.*Login.*incorrect.*/ 
	event "FTP Brute-force Attempt" 
}

signature ftp-username { 
	ip-proto == tcp 
	ftp /.*USER.*/ 
	event "FTP Username Input Found!" 
}
```

```
zeek -C -r ftp.pcap -s ftp-admin.sig

cat notice.log | zeek-cut uid id.orig_h id.resp_h msg sub | sort -r| nl | uniq | sed -n '1001,1004p'
```

Each exercise has a folder. Ensure you are in the right directory to find the pcap file and accompanying files. **Desktop/Exercise-Files/TASK-5** 
```
Investigate the http.pcap file. Create the  HTTP signature shown in the task and investigate the pcap. What is the source IP of the first event?

zeek -C -r http.pcap
nano sample.sig
zeek -C -r http.pcap -s sample.sig
cat conn.log | zeek-cut id.orig_h
10.10.57.178

What is the source port of the second event? You can use signatures.log or notice.log.

cat signatures.log | zeek-cut src_port
38712

Investigate the conn.log.  
Sent packets (orig_pkts), received packets (resp_pkts) source port (id.orig_p).
What is the total number of the sent and received packets from source port 38706?

cat conn.log | zeek-cut id.orig_h id.orig_p  orig_pkts resp_pkts  
10.10.57.178	38706	11	9
20

Create the global rule shown in the task and investigate the ftp.pcap file.  uid, sort and uniq will help
Investigate the notice.log. What is the number of unique events?

cd ftp/
nano sample.sig
zeek -C -r ftp.pcap -s sample.sig
cat notice.log | zeek-cut uid | sort | uniq | wc -l
1413

What is the number of ftp-brute signature matches?

cat notice.log | zeek-cut msg | grep "FTP Brute" | wc -l
1410

```

## zeek scripts 

Zeek has its own event-driven scripting language, which is as powerful as high-level languages and allows us to investigate and correlate the detected events. Since it is as capable as high-level programming languages, you will need to spend time on Zeek scripting language in order to become proficient. In this room, we will cover the basics of Zeek scripting to help you understand, modify and create basic scripts. 

> [!info] Note 
> that scripts can be used to apply a policy and in this case, they are called policy scripts.

```
# installed by default, and these are not intended to be modified.
/opt/zeek/share/zeek/base

# User-modified scripts should be located in a specific path.
/opt/zeek/share/zeek/site

# Policy scripts are located in a specific path.
/opt/zeek/share/zeek/policy

# automatically load/use a script in live sniffing mode, you must identify the script in the Zeek configuration file.

/opt/zeek/share/zeek/site/local.zeek

zeek -C -r sample.pcap -s sample.sig
```

### GUI vs scripts 

Have you ever thought about automating tasks in Wireshark, tshark or tcpdump? Zeek provides that chance to us with its scripting power. Let's say we need to extract all available DHCP hostnames from a pcap file. In that case, we have several options like using tcpdump, Wireshark, tshark or Zeek. 

Let's see Wireshark on the stage first. You can have the same information with Wireshark. However, while this information can be extracted using Wireshark is not easy to transfer the data to another tool for processing. Tcpdump and tshark are command-line tools, and it is easy to extract and transfer the data to another tool for processing and correlating.

```shell
sudo tcpdump -ntr smallFlows.pcap port 67 or port 68 -e -vv | grep 'Hostname Option' | awk -F: '{print $2}' | sort -nr | uniq | nl

tshark -V -r smallFlows.pcap -Y "udp.port==67 or udp.port==68" -T fields -e dhcp.option.hostname | nl | awk NF
```

```
# .zeek file
event dhcp_message (c: connection, is_orig: bool, msg: DHCP::Msg, options: DHCP::Options) { print options$host_name; }
```

The provided outputs show that our script works fine and can extract the requested information. This should show why Zeek is helpful in data extraction and correlation. Note that Zeek scripting is a programming language itself, and we are not covering the fundamentals of Zeek scripting. In this room, we will cover the logic of Zeek scripting and how to use Zeek scripts. You can learn and practice the Zeek scripting language by using [Zeek's official training platform](https://try.bro.org/#/?example=hello) for free.

Each exercise has a folder. Ensure you are in the right directory to find the pcap file and accompanying files. **Desktop/Exercise-Files/TASK-6**
```
Investigate the smallFlows.pcap file. Investigate the dhcp.log file. What is the domain value of the "vinlap01" host?

zeek -C -r smallFlows.pcap
cat dhcp.log | zeek-cut domain
astaro_vineyard

Investigate the bigFlows.pcap file. Investigate the dhcp.log file. What is the number of identified unique hostnames ? sort -nr | uniq

17

Investigate the dhcp.log file. What is the identified domain value?

cat dhcp.log | zeek-cut domain | uniq
jaalam.net
```

## zeek scripts 

Scripts contain operators, types, attributes, declarations and statements, and directives. Let's look at a simple example event called "zeek_init" and "zeek_done". These events work once the Zeek process starts and stops. Note that these events don't have parameters, and some events will require parameters.

```shell
event zeek_init() { 
	print ("Started Zeek!"); 
} 
event zeek_done() { 
	print ("Stopped Zeek!"); 
} 
# zeek_init: Do actions once Zeek starts its process. 
# zeek_done: Do activities once Zeek finishes its process. 
# print: Prompt a message on the terminal.

zeek -C -r sample.pcap 101.zeek
```

Let's print the packet data to the terminal and see the raw data. In this script, we are requesting details of a connection and extracting them without any filtering or sorting of the data. To accomplish this, we are using the "new_connection" event. This event is automatically generated for each new connection. This script provides bulk information on the terminal. We need to get familiar with Zeek's data structure to reduce the amount of information and focus on the event of interest. To do so, we need to investigate the bulk data.

```
event new_connection(c: connection) { print c; }

zeek -C -r sample.pcap 102.zeek
```

```shell
event new_connection(c: connection) { 
	print (""); 
	print ("New Connection Found!"); 
	print (""); 
	print fmt ("Source Host: %s # %s --->", c$id$orig_h, c$id$orig_p); 
	print fmt ("Destination Host: resp: %s # %s <---", c$id$resp_h, c$id$resp_p); 
	print (""); } 
# %s: Identifies string output for the source. 
# c$id: Source reference field for the identifier.
```

Scripts 201 | Use Scripts and Signatures Together  

Up to here, we covered the basics of Zeek scripts. Now it is time to use scripts collaboratively with other scripts and signatures to get one step closer to event correlation. Zeek scripts can refer to signatures and other Zeek scripts as well. This flexibility provides a massive advantage in event correlation.

Let's demonstrate this concept with an example. We will create a script that detects if our previously created "ftp-admin" rule has a hit.

```
event signature_match (state: signature_state, msg: string, data: string) { if (state$sig_id == "ftp-admin") { print ("Signature hit! --> #FTP-Admin "); } }
```

This basic script quickly checks if there is a signature hit and provides terminal output to notify us. We are using the "signature_match" event to accomplish this. You can read more about events [here](https://docs.zeek.org/en/master/scripts/base/bif/event.bif.zeek.html?highlight=signature_match). Note that we are looking only for "ftp-admin" signature hits. The signature is shown below.

```
signature ftp-admin { ip-proto == tcp ftp /.*USER.*admin.*/ event "FTP Username Input Found!" }

zeek -C -r ftp.pcap -s ftp-admin.sig 201.zeek
```

Scripts 202 | Load Local Scripts  

**Load all local scripts**

We mentioned that Zeek has base scripts located in "/opt/zeek/share/zeek/base". You can load all local scripts identified in your "local.zeek" file. Note that base scripts cover multiple framework functionalities. You can load all base scripts by easily running the `local` command.

```
zeek -C -r ftp.pcap local

zeek -C -r ftp.pcap /opt/zeek/share/zeek/policy/protocols/ftp/detect-bruteforcing.zeek
```

The above output demonstrates how to run all base scripts using the "local" command. Look at the above terminal output; Zeek provided additional log files this time. Loaded scripts generated loaded_scripts.log, capture_loss.log, notice.log, stats.log files. Note that, in our instance, 465 scripts loaded and used by using the "local" command. However, Zeek doesn't provide log files for the scripts doesn't have hits or results.

Another way to load scripts is by identifying the script path. In that case, you have the opportunity of loading a specific script or framework. Let's go back to FTP brute-forcing case. We created a script that detects multiple admin login failures in previous steps. Zeek has an FTP brute-force detection script as well. Now let's use the default script and identify the differences.

Each exercise has a folder. Ensure you are in the right directory to find the pcap file and accompanying files. **Desktop/Exercise-Files/TASK-7**
```
Go to folder TASK-7/101.  
Investigate the sample.pcap file with 103.zeek script. Investigate the terminal output. What is the number of the detected new connections?

zeek -C -r sample.pcap 103.zeek | grep "New" | wc -l
87

Go to folder TASK-7/201.  
Investigate the ftp.pcap file with ftp-admin.sig signature and  201.zeek script. Investigate the signatures.log file. What is the number of signature hits?

zeek -C -r ftp.pcap -s ftp-admin.sig 201.zeek | wc -l
1401

Investigate the signatures.log file. What is the total number of "administrator" username detections?

cat signatures.log | grep -i "administrator" | wc -l
731

Investigate the ftp.pcap file with all local scripts, and investigate the loaded_scripts.log file. What is the total number of loaded scripts?

zeek -C -r ftp.pcap 201.zeek local 
cat loaded_scripts.log | zeek-cut name | wc -l
498

Go to folder TASK-7/202.  
Investigate the ftp-brute.pcap file with "/opt/zeek/share/zeek/policy/protocols/ftp/detect-bruteforcing.zeek" script. Investigate the notice.log file. What is the total number of brute-force detections?

2

860

```

## zeek frameworks

Scripts 203 | Load Frameworks  

Zeek has 15+ frameworks that help analysts to discover the different events of interest. In this task, we will cover the common frameworks and functions. You can find and read more on the prebuilt scripts and frameworks by visiting Zeek's online book [here](https://docs.zeek.org/en/master/frameworks/index.html).

**File Framework | Hashes**

Not all framework functionalities are intended to be used in CLI mode. The majority of them are used in scripting. You can easily see the usage of frameworks in scripts by calling a specific framework as `load @ $PATH/base/frameworks/framework-name`. Now, let's use a prebuilt function of the file framework and have MD5, SHA1 and SHA256 hashes of the detected files. We will call the "File Analysis" framework's "hash-all-files" script to accomplish this. Before loading the scripts, let's look at how it works.

```
cat hash-demo.zeek
cat /opt/zeek/share/zeek/policy/frameworks/files/hash-all-files.zeek
zeek -C -r case1.pcap hash-demo.zeek

zeek -C -r case1.pcap /opt/zeek/share/zeek/policy/frameworks/files/hash-all-files.zeek

# The file framework can extract the files transferred
zeek -C -r case1.pcap /opt/zeek/share/zeek/policy/frameworks/files/extract-all-files.zeek

# We successfully extracted files from the pcap. A new folder called 
# "extract_files" is automatically created, and all detected files are 
# located in it

ls extract_files | nl
cd extract_files
file *| nl

```

Zeek extracted three files. The "file" command shows us one .txt file, one .doc/.docx file and one .exe file. Zeek renames extracted files. The name format consists of four values that come from conn.log and files.log files; default "extract" keyword, timestamp value (ts), protocol (source), and connection id (conn_uids). Let's look at the files.log to understand possible anomalies better and verify the findings. Look at the below output; files.log provides the same results with additional details. Let's focus on the .exe and correlate this finding by searching its connection id (conn_uids).

The given terminal output shows us that there are three files extracted from the traffic capture. Let's look at the file.log and correlate the findings with the rest of the log files.
```
cat files.log | zeek-cut fuid conn_uids tx_hosts rx_hosts mime_type extracted | nl

grep -rin CZruIO2cqspVhLuAO9 * | column -t | nl | less -S
```

The "grep" tool helps us investigate the particular value across all available logs. The above terminal output shows us that the connection id linked with .exe appears in conn.log, files.log, and http.log files. Given example demonstrates how to filter some fields and correlate the findings with the rest of the logs. We've listed the source and destination addresses, file and connection id numbers, MIME types, and file names. Up to now, provided outputs and findings show us that record number three is a .exe file, and other log files provide additional information.   

Notice Framework | Intelligence  

The intelligence framework can work with data feeds to process and correlate events and identify anomalies. The intelligence framework requires a feed to match and create alerts from the network traffic. Let's demonstrate a single user-generated threat intel file and let Zeek use it as the primary intelligence source. 

Intelligence source location: `/opt/zeek/intel/zeek_intel.txt`

There are two critical points you should never forget. First, the source file has to be tab-delimited. Second, you can manually update the source and adding extra lines doesn't require any re-deployment. However, if you delete a line from the file, you will need to re-deploy the Zeek instance. 

Let's add the suspicious URL gathered from the case1.pcap file as a source intel and see this feature in action! Before executing the script, let's look at the intelligence file and the script contents.
```
cat /opt/zeek/intel/zeek_intel.txt
cat intelligence-demo.zeek
zeek -C -r case1.pcap intelligence-demo.zeek
cat intel.log | zeek-cut uid id.orig_h id.resp_h seen.indicator matched
```
The above output shows the contents of the intel file and script contents. There is one intelligence input, and it is focused on a domain name, so when this domain name appears in the network traffic, Zeek will create the "intel.log" file and provide the available details.

The above output shows that Zeek detected the listed domain and created the intel.log file. This is one of the easiest ways of using the intelligence framework. You can read more on the intelligence framework [here](https://docs.zeek.org/en/master/frameworks/intel.html) and [here](https://docs.zeek.org/en/current/scripts/base/frameworks/intel/main.zeek.html#type-Intel: Type).

Each exercise has a folder. Ensure you are in the right directory to find the pcap file and accompanying files. **Desktop/Exercise-Files/TASK-8** 
```
Investigate the case1.pcap file with intelligence-demo.zeek script. Investigate the intel.log file. Look at the second finding, where was the intel info found?

IN_HOST_HEADER

Investigate the http.log file. What is the name of the downloaded .exe file?

knr.exe

Investigate the case1.pcap file with hash-demo.zeek script. Investigate the files.log file. What is the MD5 hash of the downloaded .exe file?

 cc28e40b46237ab6d5282199ef78c464

Investigate the case1.pcap file with file-extract-demo.zeek script. Investigate the "extract_files" folder. Review the contents of the text file. What is written in the file?

cat files.log | zeek-cut fuid conn_uids tx_hosts rx_hosts mime_type extracted | nl

grep -rin CVsnuagu2ZhLnXy91 * | column -t | nl | less -S

zeek -C -r case1.pcap file-extract-demo.zeek  
file * | nl  
cat extract-1561667874.743959-HTTP-Fpgan59p6uvNzLFja

Microsoft NCSI

```

## zeek script packages 

Zeek Package Manager helps users install third-party scripts and plugins to extend Zeek functionalities with ease. The package manager is installed with Zeek and available with the `zkg` command. Users can install, load, remove, update and create packages with the "zkg" tool. You can read more on and view available packages [here](https://packages.zeek.org/) and [here](https://github.com/zeek/packages). Please note that you need root privileges to use the "zkg" tool.  

**Basic usage of zkg;**

```
zkg install package_path
zkg install git_url
zkg list
zkg remove
zkg refresh
zkg upgrade
```

There are multiple ways of using packages. The first approach is using them as frameworks and calling specific package path/directory per usage. The second and most common approach is calling packages from a script with the "@load" method. The third and final approach to using packages is calling their package names; note that this method works only for packages installed with the "zkg" install method.   

Packages | **Cleartext Submission of Password**  

Let's install a package first and then demonstrate the usage in different approaches.

```
zkg install zeek/cybera/zeek-sniffpass
zkg list
```

The above output shows how to install and list the installed packages. Now we successfully installed a package. As the description mentions on the above terminal, this package creates alerts for cleartext passwords found in HTTP traffic. Let's use this package in three different ways!

```

### Calling with script 
zeek -Cr http.pcap sniff-demo.zeek 

### View script contents 
cat sniff-demo.zeek @load /opt/zeek/share/zeek/site/zeek-sniffpass 

### Calling from path 
zeek -Cr http.pcap /opt/zeek/share/zeek/site/zeek-sniffpass 

### Calling with package name 
zeek -Cr http.pcap zeek-sniffpass
```

The above output demonstrates how to execute/load packages against a pcap. You can use the best one for your case. The "zeek-sniffpass" package provides additional information in the notice.log file. Now let's review the logs and discover the obtained data using the specific package.

```
cat notice.log | zeek-cut id.orig_h id.resp_h proto note msg
```

The above output shows that the package found cleartext password submissions, provided notice, and grabbed the usernames. Remember, in **TASK-5** we created a signature to do the same action. Now we can do the same activity without using a signature file. This is a simple demonstration of the benefit and flexibility of the Zeek scripts.

Packages | Geolocation Data  

Let's use another helpful package called "geoip-conn". This package provides geolocation information for the IP addresses in the conn.log file. It depends on "GeoLite2-City.mmdb" database created by MaxMind. This package provides location information for only matched IP addresses from the internal database.

```
zeek -Cr case1.pcap geoip-conn
```

Up to now, we've covered what the Zeek packages are and how to use them. There are much more packages and scripts available for Zeek in the wild. You can try ready or third party packages and scripts or learn Zeek scripting language and create new ones.

Each exercise has a folder. Ensure you are in the right directory to find the pcap file and accompanying files. **Desktop/Exercise-Files/TASK-9**

```
Investigate the http.pcap file with the zeek-sniffpass module. Investigate the notice.log file. Which username has more module hits?

zeek -C -r http.pcap zeek-sniffpass  
cat notice.log | head  
cat notice.log | zeek-cut msg | uniq -c

BroZeek

Investigate the case2.pcap file with geoip-conn module. Investigate the conn.log file. What is the name of the identified City?

zeek -C -r case2.pcap geoip-conn  
cat conn.log |head  
cat conn.log |zeek-cut id.resp_h geo.resp.city | grep -v -e "-" | uniq -c
chicago

Which IP address is associated with the identified City?

cat conn.log | zeek-cut id.resp_h geo.resp.city | grep -v -e "-" | uniq -c
23.77.86.54

Investigate the case2.pcap file with sumstats-counttable.zeek script. How many types of status codes are there in the given traffic capture?

zeek -C -r case2.pcap sumstats-counttable.zeek
4

```

- https://medium.com/@huglertomgaw/tryhackme-zeek-495038b8d5ec
- 

