- https://tryhackme.com/room/snort

#NetworkSecurity 

SNORT is an open-source, rule-based Network Intrusion Detection and Prevention System (NIDS/NIPS).

- Config-Sample: Sample configuration and rule files. These files are provided to show what the configuration files look like. Installed Snort instance doesn't use them, so feel free to practice and modify them. Snort's original base files are located under /etc/snort folder.
- Exercise-Files: There are separate folders for each task. Each folder contains pcap, log and rule files ready to play with.
- traffic-generator.sh

There are two main types of IDS systems;

- Network Intrusion Detection System (NIDS): NIDS monitors the traffic flow from various areas of the network. The aim is to investigate the traffic on the entire subnet. If a signature is identified, an alert is created. Passive monitoring
- Host-based Intrusion Detection System (HIDS): HIDS monitors the traffic flow from a single endpoint device. The aim is to investigate the traffic on a particular device. If a signature is identified, an alert is created.

```
cd Task-Exercises
sudo ./traffic-generator.sh

./.easy.sh  = Too Easy!

```

## Detection / Prevention techniques 

Signature based = ID specific patterns of known malicious behaviour, detect known threats

Behaviour based = ID new patterns via signatures, compares what is known|normal vs abnormal, detects new threats

policy based = compares activities with system config and security policies, detect policy violations

- IDS can identify threats but require user assistance to stop them.
- IPS can identify and block the threats with less user assistance at the detection time.

Capabilities of Snort:
- packet sniffer `tcdump`
- packet logger 
- network intrusion prevention system
- Live traffic analysis
- Attack and probe detection
- Packet logging
- Protocol analysis
- Real-time alerting
- Modules & plugins
- Pre-processors
- Cross-platform support! (Linux & Windows)

three main use models;  

- Sniffer Mode: Read IP packets and prompt them in the console application.
- Packet Logger Mode: Log all IP packets (inbound and outbound) that visit the network.
- NIDS (Network Intrusion Detection System)  and NIPS (Network Intrusion Prevention System) Modes: Log/drop the packets that are deemed as malicious according to the user-defined rules.
- Wireless Intrusion Prevention System (WIPS): WIPS monitors the traffic flow from of wireless network. The aim is to protect the wireless traffic and stop possible attacks launched from there. If a signature is identified, the connection is terminated.
- Host-based Intrusion Prevention System (HIPS): HIPS actively protects the traffic flow from a single endpoint device. The aim is to investigate the traffic on a particular device. If a signature is identified, the connection is terminated.

HIPS working mechanism is similar to HIDS. The difference between them is that while HIDS creates alerts for threats, HIPS stops the threats by terminating the connection.

- Network Intrusion Prevention System (NIPS): NIPS monitors the traffic flow from various areas of the network. The aim is to protect the traffic on the entire subnet. If a signature is identified, the connection is terminated.
- Behaviour-based Intrusion Prevention System (Network Behaviour Analysis: NBA): Behaviour-based systems monitor the traffic flow from various areas of the network. The aim is to protect the traffic on the entire subnet. If a signature is identified, the connection is terminated.

```
  
Which snort mode can help you stop the threats on a local machine?

HIPS

Which snort mode can help you detect threats on a local network?

NIDS

Which snort mode can help you detect the threats on a local machine?

HIDS

Which snort mode can help you stop the threats on a local network?

NIPS

  
Which snort mode works similar to NIPS mode?

NBA

According to the official description of the snort, what kind of NIPS is it?

full-blown

NBA training period is known as 

baselining

```

## Snort

```
snort -V
149

sudo snort -c /etc/snort/snort.conf -T   # tests config file

4152 Snort rules read

sudo snort -c /etc/snort/snortv2.conf -T 

1 Snort rules read
```

## Sniffer mode

flags for viewing packet
```
-v  verbose
-d  display payload packet data
-e  display link layer TCP/IP/UDP/ ICMP headers
-X  display full packet in hex
-i  specific network interface to listen
```

need traffic for Snort to analyze

```
# interface  verbose mode
sudo snort -v -i eth0

# dumping packet data mode
sudo snort -d

# dump (-d) and link layer header grab (-e)
sudo snort -de

# full packet dump mode (-X)
sudo snort -X

```

## Packet logger mode

sniff traffic then log it

```
-l        logger mode, target log tcpdump default: /var/log/snort
-K ASCII  log packets in ascii format
-r        reading option, read the dumped logs in snort
-n        specify the number of packets to process
```

Log files need root privileges `sudo | sudo su | sudo chown username file` 

```
# make log in current directory
sudo snort -dev -l .

# make logs in current directory packet logger mode
sudo snort -dev -K ASCII -l .

```

read dumped logs
```
sudo snort -r snort.log.<number>
sudo snort -r snort.log icmp
sudo snort -r snort.log tcp
sudo snort -r snort.log 'udp and port 53'

snort -dvr snort.log -n 10
```

- [https://en.wikipedia.org/wiki/Berkeley_Packet_Filter](https://en.wikipedia.org/wiki/Berkeley_Packet_Filter)
- [https://biot.com/capstats/bpf.html](https://biot.com/capstats/bpf.html)
- [https://www.tcpdump.org/manpages/tcpdump.1.html](https://www.tcpdump.org/manpages/tcpdump.1.html)

```
# task 6 folder, ran ./trafic-generator.sh
sudo snort -r snort.log.1640048004

05/13-10:17:10.225414 145.253.2.203:53 -> 145.254.160.237:3009
= 3009

Read the snort.log file with Snort; what is the IP ID of the 10th packet?

sudo snort -r snort.log.1640048004 -n 10 -de >> snort.txt
Find-> ID:
49313

  
Read the "snort.log.1640048004" file with Snort; what is the referer of the 4th packet?

sudo snort -r snort.log.1640048004 -n 4 -X >> snort2.txt

http://www.ethereal.com/development.html

  
Read the "snort.log.1640048004" file with Snort; what is the Ack number of the 8th packet?

Ack: 0x38AFFFF3

  
Read the "snort.log.1640048004" file with Snort; what is the number of the "TCP port 80" packets?

sudo snort -r snort.log.1640048004 'TCP and port 80'

the answer is in the Breakdown by protocol
TCP: 41 (100%)

```

## IDS/IPS

IDS/IPS mode helps you manage the traffic according to user-defined rules.

- This rule is located in "/etc/snort/rules/local.rules". 

```
-c     define config file
-T     testing config file
-N     disable logging
-D     background mode
-A     alert mode
       full (all info, default) | fast | console | cmg | none
```

```
# check your configuration file and prompt if misconfig
sudo snort -c /etc/snort/snort.conf -T

# disable logging
sudo snort -c /etc/snort/snort.conf -N

# background mode (not recommended)
sudo snort -c /etc/snort/snort.conf -D
- check process           ps -ef | grep snort    
- shut down process       sudo kill -9 <PID>

# alert mode console
sudo snort -c /etc/snort/snort.conf -A console

# alert mode - basic header details in hex
sudo snort -c /etc/snort/snort.conf -A cmg

# alert messages, timestamps, and source and destination IP 
sudo snort -c /etc/snort/snort.conf -A fast

# alert all possible information
sudo snort -c /etc/snort/snort.conf -A full

# no alert file: logs traffic file in binary dump format
sudo snort -c /etc/snort/snort.conf -A none

```

### dropping packets 

- edit `snort.conf` 
```
# advanced snort configuration:
# DAQ = data acquisition
-Q --daq afpacket -i eth0:eth1

sudo snort -c /etc/snort/snort.conf -q -Q --daq afpacket -i eth0:eth1 -A console

```

```
cd TASK-7
sudo snort -c /etc/snort/snort.conf -A full -l .

What is the number of the detected HTTP GET methods?

2 (dont know why or how to get answer)
```

## PCAP 

PCAP read/investigate mode helps you work with pcap files. Once you have a pcap file and process it with Snort, you will receive default traffic statistics with alerts depending on your ruleset.

```
-r  / --pcap-single=     read a single pcap
--pcap-list=""           read pcaps in command
--pcap-show              show pcap name on console during processing
```

```
#  default reading option
snort -r icmp-test.pcap

# investigate pcap with config file
sudo snort -c /etc/snort/snort.conf -q -r icmp-test.pcap -A console -n 10

# multiple pcaps (separate pcap process: ID source of the alerts)
sudo snort -c /etc/snort/snort.conf -q --pcap-list="icmp-test.pcap http2.pcap" -A console -n 10

# pcap show
sudo snort -c /etc/snort/snort.conf -q --pcap-list="icmp-test.pcap http2.pcap" -A console --pcap-show

```

```
Investigate the mx-1.pcap file with the default configuration file.
sudo snort -c /etc/snort/snort.conf -A full -l . -r mx-1.pcap
What is the number of the generated alerts?

Action Stats: Alerts: 170

Keep reading the output. How many TCP Segments are Queued?

Stream statistics: TCP Segmenta Queued: 18

  
Keep reading the output.How many "HTTP response headers" were extracted?

HTTP Inspect - encodings: HTTP response Headers extracted: 3

  
Investigate the mx-1.pcap file with the second configuration file.
sudo snort -c /etc/snort/snortv2.conf -A full -l . -r mx-1.pcap
What is the number of the generated alerts?

ICMP: 68

  
Investigate the mx-2.pcap file with the default configuration file.
sudo snort -c /etc/snort/snort.conf -A full -l . -r mx-2.pcap
What is the number of the generated alerts?

340 ??? how, why?

Keep reading the output. What is the number of the detected TCP packets?

breakdown by protocol: TCP: 82

  
Investigate the mx-2.pcap and mx-3.pcap files with the default configuration file.
sudo snort -c /etc/snort/snort.conf -A full -l . --pcap-list="mx-2.pcap mx-3.pcap"
What is the number of the generated alerts?

1020 ??? how, why?

```

## snort rules

primary structure of snort rule

```
# rule header

Action
	alert IDS | reject IPS
	log/ drop (block & log) / reject (block, log & terminate)
Protocol
	TCP / UDP / ICMP
Source IP
	any
Source Port 
	any
Direction
	<>
Destination IP
	any
Destination Port
	any
Options
	Msg/ reference/ sid (rule id) / rev (revision info)
```

```
alert icmp sourceIP sourcePort <> destIP destPort (msg:"ICMP packet found"; reference: CVE-xxxx; sid:100001; rev:1)
```

4 protocol filters = IP, TCP, UDP, ICMP
- if filter for ftp, filter TCP traffic on port 21 (no ftp keyword)

Each rule should have a type of action, protocol, source and destination IP, source and destination port and an option. Remember, Snort is in passive mode by default. So most of the time, you will use Snort as an IDS. You will need to start "inline mode" to turn on IPS mode. But before you start playing with inline mode, you should be familiar with Snort features and rules.

The Snort rule structure is easy to understand but difficult to produce. You should be familiar with rule options and related details to create efficient rules. It is recommended to practice Snort rules and option details for different use cases.

We will cover the basic rule structure in this room and help you take a step into snort rules. You can always advance your rule creation skills with different rule options by practising different use cases and studying rule option details in depth. We will focus on two actions; "alert" for IDS mode and "reject" for IPS mode.

Rules cannot be processed without a header. Rule options are "optional" parts. However, it is almost impossible to detect sophisticated attacks without using the rule options.

### IP and port filtering

```shell
# IP filtering: alert each ICMP packet from the 192.168.1.56
alert icmp 192.168.1.56 any <> any any  (msg: "ICMP Packet From "; sid: 100001; rev:1;)

# Filter an IP range: alert ICMP packet from 192.168.1.0/24 subnet
alert icmp 192.168.1.0/24 any <> any any  (msg: "ICMP Packet Found"; sid: 100001; rev:1;)

# Filter multiple IP ranges: alert from IP subnets
alert icmp [192.168.1.0/24, 10.1.1.0/24] any <> any any  (msg: "ICMP Packet Found"; sid: 100001; rev:1;)

# Exclude IP addresses/ranges: alert for packets NOT from IP subnet
alert icmp !192.168.1.0/24 any <> any any  (msg: "ICMP Packet Found"; sid: 100001; rev:1;)

# Port Filtering: alert for TCP packet sent to Port 21
alert tcp any any <> any !21  (msg: "Traffic Activity Without FTP Port 21 Command Channel"; sid: 100001; rev:1;)

# Filter a port range (Type 1): alert for ports 1-1024
alert tcp any any <> any 1:1024   (msg: "TCP 1-1024 System Port Activity"; sid: 100001; rev:1;)

# Filter a port range (Type 2): alert for ports <= 1024
alert tcp any any <> any :1024   (msg: "TCP 0-1024 System Port Activity"; sid: 100001; rev:1;)

# Filter a port range (Type 3): alert for ports >= 1024
alert tcp any any <> any 1025: (msg: "TCP Non-System Port Activity"; sid: 100001; rev:1;)

# Filter a port range (Type 4): alert for port 21 and 23
alert tcp any any <> any [21,23] (msg: "FTP and Telnet Port 21-23 Activity Detected"; sid: 100001; rev:1;)

```

3 main rules:
- general rule = fundamental rule options for snort
- payload rule = options to help investigate payload data (detect patterns)
- non-payload = helps create specific patterns and id network issues

### General rule options

```
# msg 

quick prompt summary of event. Once the rule is triggered, the message filed will appear in the console or log. Usually, the message part is a one-liner that summarises the event.

# sid 

Snort rule IDs (SID) come with a pre-defined scope, and each rule must have a SID in a proper format.
scopes: 
	<100 = reserved 
	100-999e3 = build rules
	> 1e6 = user created rules

# reference 

CVE or other external info. Having references for the rules will always help analysts during the alert and incident investigation.

# rev

Snort rules can be modified and updated for performance and efficiency issues. Rev option help analysts to have the revision information of each rule. Therefore, it will be easy to understand rule improvements. Each rule has its unique rev number, and there is no auto-backup feature on the rule history. Analysts should keep the rule history themselves. Rev option is only an indicator of how many times the rule had revisions.
```

### payload detection rule options

```
# content

Payload data. It matches specific payload data by ASCII, HEX or both

ASCII mode:
	alert tcp any any <> any 80  (msg: "GET Request
	Found"; content:"GET"; sid: 100001; rev:1;)

HEX mode: 
	alert tcp any any <> any 80  (msg: "GET Request
	Found"; content:"|47 45 54|"; sid: 100001; rev:1;)

# nocase

Disabling case sensitivity. Used for enhancing the content searches.

alert tcp any any <> any 80  (msg: "GET Request Found"; content:"GET"; nocase; sid: 100001; rev:1;)

# Fast_pattern

Prioritise content search to speed up the payload search operation.
option helps you select the initial packet match with the specific value for further investigation.

alert tcp any any <> any 80  (msg: "GET Request Found"; content:"GET"; fast_pattern; content:"www";  sid:100001; rev:1;)

```

### non-payload detection rule options

```
# ID  filter the IP id field

alert tcp any any <> any any (msg: "ID TEST"; id:123456; sid: 100001; rev:1;)

# flags for TCP

F = FIN
S = SYN
R = RST
P = PSH
A = ACK
U = URG

alert tcp any any <> any any (msg: "FLAG TEST"; flags:S;  sid: 100001; rev:1;)

# Dsize   filter packet payload size

dsize:min <> max
dsize:>100
dsize:<100

alert ip any any <> any any (msg: "SEQ TEST"; dsize:100<>300;  sid: 100001; rev:1;)

# sameip   filter source & destination IP for duplication

alert ip any any <> any any (msg: "SAME-IP TEST";  sameip; sid: 100001; rev:1;)

```

```shell
# create a rule in the  /etc/snort/rules/local.rules file
sudo nano /etc/snort/rules/local.rules
```

```
Use "task9.pcap". Write a rule to filter IP ID "35369" and run it against the given pcap file. What is the request name of the detected packet? You may use this command: "snort -c local.rules -A full -l . -r task9.pcap"

TIMESTAMP REQUEST

Clear the previous alert file and comment out the old rules. Create a rule to filter packets with Syn flag and run it against the given pcap file. What is the number of detected packets?

1

Clear the previous alert file and comment out the old rules. Write a rule to filter packets with Push-Ack flags and run it against the given pcap file. What is the number of detected packets?

216

Clear the previous alert file and comment out the old rules. Create a rule to filter UDP packets with the same source and destination IP and run it against the given pcap file. What is the number of packets that show the same source and destination address?

7

Case Example - An analyst modified an existing rule successfully. Which rule option must the analyst change after the implementation?

rev

```

- https://nehrunayak.medium.com/snort-tryhackme-56bd99492b58

## Points to Remember

Main Components of Snort

- Packet Decoder: Packet collector component of Snort. It collects and prepares the packets for pre-processing. 
- Pre-processors: A component that arranges and modifies the packets for the detection engine.
- Detection Engine: The primary component that process, dissect and analyze the packets by applying the rules. 
- Logging and Alerting: Log and alert generation component.
- Outputs and Plugins: Output integration modules (i.e. alerts to syslog/mysql) and additional plugin (rule management detection plugins) support is done with this component. 

There are three types of rules available for snort

- Community Rules: Free ruleset under the GPLv2. Publicly accessible, no need for registration.
- Registered Rules: Free ruleset (requires registration). This ruleset contains subscriber rules with 30 days delay.
- Subscriber Rules (Paid): Paid ruleset (requires subscription). This ruleset is the main ruleset and is updated twice a week (Tuesdays and Thursdays).

You can download and read more on the rules [here](https://www.snort.org/downloads).

Note: Once you install Snort2, it automatically creates the required directories and files. However, if you want to use the community or the paid rules, you need to indicate each rule in the` snort.conf` file.

Since it is a long, all-in-one configuration file, editing it without causing misconfiguration is troublesome for some users. That is why Snort has several rule updating modules and integration tools. To sum up, never replace your configured Snort configuration files; you must edit your configuration files manually or update your rules with additional tools and modules to not face any fail/crash or lack of feature.

-   `snort.conf` : _Main configuration file._
- local.rules: _User-generated rules file._ 

```shell
# overview the main configuration file 
sudo gedit /etc/snort/snort.conf

# step 1: set network variables
HOME_NET  'any' OR '192.x.x.x/24'    # protect
EXTERNAL_NET 'any' OR '!$HOME_NET'   # external network
RULE_PATH  /etc/snort/rules

#SO_RULE_PATH $RULE_PATH/so_rules     # registered subscribers
#PREPROC_RULE_PATH $RULE_PATH/plugin_rules

# step 2: configure the decoder -- IPS model, afpacket mode
config daq: afpacket
config daq_mode: inline
config logdir: /var/logs/snort

# go to step 6: configure output plugins
site specific rules include $RULE_PATH/local.rules
include $RULE_PATH/ include $RULE_PATH/rulename

```

```
# DAQ modes

Pcap: Default mode, known as Sniffer mode.
Afpacket: Inline mode, known as IPS mode.
Ipq: Inline mode on Linux by using Netfilter. It replaces the snort_inline patch.  
Nfq: Inline mode on Linux.
Ipfw: Inline on OpenBSD and FreeBSD by using divert sockets, with the pf and ipfw firewalls.  
Dump: Testing mode of inline and normalisation.

The most popular modes are the default (pcap) and inline/IPS (Afpacket).
```

