
# Cyber Threat Intelligence

Cyber Threat Intelligence (CTI), threat hunting, and incident response exercises.
Understanding the Pyramid of Pain concept as a Threat Hunter, Incident Responder, or SOC Analyst is important.

## Hash values

the hash value is a numeric value of a fixed length that uniquely identifies data.
- md5 (deprecated)
- SHA-1 (deprecated)
- SHA-2 , SHA-256
- A hash is not considered to be cryptographically secure if two files have the same hash value or digest.
- if you have a hash you paste in `virustotal` to see how malicious it is

With so many variations and instances of known malware or ransomware, threat hunting using file hashes as the IOC (Indicators of Compromise) can become difficult.

## IP address

An IP address is used to identify any device connected to a network.
In the Pyramid of Pain, IP addresses are indicated with the color green

A common defence tactic is to block, drop, or deny inbound requests from IP addresses on your parameter or external firewall.

## Domain names

Domain Names can be thought as simply mapping an IP address to a string of text.

Domain Names can be a little more of a pain for the attacker to change as they would most likely need to purchase the domain, register it and modify DNS records. Unfortunately for defenders, many DNS providers have loose standards and provide APIs to make it even easier for the attacker to change the domain.

URL Shortening services to generate malicious links:

```
# url shortener websites

bit.ly
goo.gl
ow.ly
s.id
smarturl.it
tiny.pl
tinyurl.com
x.co

```

You can see the actual website the shortened link is redirecting you to by appending "+" to it
- ` http:/tinyurl.com/2we2www+ `

## Host artefacts

The attacker would need to circle back at this detection level and change his attack tools and methodologies.

Host artifacts are the traces or observables that attackers leave on the system, such as registry values, suspicious process execution, attack patterns or IOCs (Indicators of Compromise), files dropped by malicious applications, or anything exclusive to the current threat.

## network artefacts

if you can detect and respond to the threat, the attacker would need more time to go back and change his tactics or modify the tools, which gives you more time to respond and detect the upcoming threats or remediate the existing ones.

network_artifacts
- user-agent
- C2 info
- URI patterns
- HTTP POST requests

Wireshark can detect network artefacts by using protocol analyzer `TShark` or use `Snort`

```
# suspicious HTTP POST strings:

192.168.100.140 194.187.133.160 936 HTTP POST /hsajkhsbaskjaskh/aakshaksh23saj121j/ HTTP/1.1

# use TShark to filter out the user-agent strings

tshark --Y http.request -T fields -e http.host -e http.user_agent -r analysis_file.pcap

```

  
```
Using UrlScan.io to scan for malicious URLs.

Using Abuse.ch to track malware and botnet indicators.

Investigate phishing emails using PhishTool

Using Cisco's Talos Intelligence platform for intel gathering.
```

## reference

- https://medium.com/@tr1n1ty8/tryhackme-pyramid-of-pain-writeup-568ac526b028

