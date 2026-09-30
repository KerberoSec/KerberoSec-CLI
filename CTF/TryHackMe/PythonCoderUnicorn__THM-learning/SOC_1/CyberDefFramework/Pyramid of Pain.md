
https://tryhackme.com/r/room/pyramidofpainax

## hash values 

- md5 
- sha-1
- sha-2
- A hash is not considered to be cryptographically secure if two files have the same hash value or digest.
- https://www.virustotal.com/gui/
- https://metadefender.opswat.com/?lang=en

```
# get file hash 
Get-FileHash .\OpenVPN_2.5.1_I601_amd64.msi -Algorithm MD5 

MD5 D1A008E3A606F24590A02B853E955CF7

# append echo to a file hash 
echo "AppendTheHash" >> .\OpenVPN_2.5.1_I601_amd64.msi

MD5 9D52B46F5DE41B73418F8E0DACEC5E9F

```

## IP address 

`app.any.run` to check IP addresses of malicious actors
Because Any.run is a sandboxing service that executes the sample, we can review any connections such as HTTP requests, DNS requests or processes communicating with an IP address.

## Doman Names 

doman name system (DNS) 

```
Not secure | addidas.de
```

```
🔒 addidas.de

 adıdas.de which has the Punycode of http://xn--addas-o4a.de/
```

What is Punycode? As per [Wandera](https://www.wandera.com/punycode-attacks/), "Punycode is a way of converting words that cannot be written in ASCII, into a Unicode ASCII encoding."

Attackers usually hide the malicious domains under URL shorteners. A URL Shortener is a tool that creates a short and unique URL that will redirect to the specific website specified during the initial step of setting up the URL Shortener link. The attackers normally use the following URL-shortening services to generate malicious links: 

- bit.ly
- goo.gl
- ow.ly
- s.id
- smarturl.it
- tiny.pl
- tinyurl.com
- x.co

<span style="color:#a0f958">You can see the actual website the shortened link is redirecting you to by appending "+"</span> to it
```
http://tinyurl.com/cn6xznu+
http://bit.ly/vhle3si+
http://goo.gl/sXloW2+
```

## host artifacts 

Host artifacts are the traces or observables that attackers leave on the system, such as registry values, suspicious process execution, attack patterns or IOCs (Indicators of Compromise), files dropped by malicious applications, or anything exclusive to the current threat.

## network artifacts 

This means if you can detect and respond to the threat, the attacker would need more time to go back and change his tactics or modify the tools, which gives you more time to respond and detect the upcoming threats or remediate the existing ones.

A network artifact can be a user-agent string, C2 information, or URI patterns followed by the HTTP POST requests.

Network artifacts can be detected in Wireshark PCAPs (file that contains the packet data of a network) by using a network protocol analyzer such as [TShark](https://www.wireshark.org/docs/wsug_html_chunked/AppToolstshark.html) or exploring IDS (Intrusion Detection System) logging from a source such as [Snort](https://www.snort.org/).

Let's use TShark to filter out the User-Agent strings by using the following command: `tshark --Y http.request -T fields -e http.host -e http.user_agent -r analysis_file.pcap`

These are the most common User-Agent strings found for the [Emotet Downloader Trojan](https://www.mcafee.com/blogs/other-blogs/mcafee-labs/emotet-downloader-trojan-returns-in-force/) 

## tools

Attackers would use the utilities to create malicious macro documents (maldocs) for spearphishing attempts, a backdoor that can be used to establish [C2 (Command and Control Infrastructure)](https://www.varonis.com/blog/what-is-c2/), any custom .EXE, and .DLL files, payloads, or password crackers.

Antivirus signatures, detection rules, and YARA rules can be great weapons for you to use against attackers at this stage.

[MalwareBazaar](https://bazaar.abuse.ch/) and [Malshare](https://malshare.com/) are good resources to provide you with access to the samples, malicious feeds, and YARA results: these all can be very helpful when it comes to threat hunting and incident response.

For detection rules, [SOC Prime Threat Detection Marketplace](https://tdm.socprime.com/) is a great platform, where security professionals share their detection rules for different kinds of threats including the latest CVE's that are being exploited in the wild by adversaries.

## TTPs

TTPs stands for Tactics, Techniques & Procedures.
https://attack.mitre.org

