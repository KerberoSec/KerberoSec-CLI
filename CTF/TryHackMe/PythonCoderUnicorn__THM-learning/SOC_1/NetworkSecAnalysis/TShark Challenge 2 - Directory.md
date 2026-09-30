#Subscribers 
https://tryhackme.com/room/tsharkchallengestwo

This room presents you with a challenge to investigate some traffic data as a part of the SOC team. Let's start working with TShark to analyse the captured traffic. We recommend completing the [TShark: The Basics](https://tryhackme.com/room/tsharkthebasics) and [TShark: CLI Wireshark Features](https://tryhackme.com/room/tsharkcliwiresharkfeatures) rooms first, which will teach you how to use the tool in depth. 

Start the VM by pressing the green **Start Machine** button in this task. The machine will start in split view, so you don't need SSH or RDP. In case the machine does not appear, you can click the blue **Show Split View** button located at the top of this room.

>[!warning] **NOTE:** 
>Exercise files contain real examples. **DO NOT** interact with them outside of the given VM. Direct interaction with samples and their contents (files, domains, and IP addresses) outside the given VM can pose security threats to your machine.

**An alert has been triggered:** "A user came across a poor file index, and their curiosity led to problems".

The case was assigned to you. Inspect the provided **directory-curiosity.pcap** located in `~/Desktop/exercise-files` and retrieve the artefacts to confirm that this alert is a true positive.

**Your tools:** TShark, [VirusTotal](https://www.virustotal.com/).

```
Investigate the DNS queries.  
Investigate the domains by using VirusTotal.  
According to VirusTotal, there is a domain marked as malicious/suspicious.

What is the name of the malicious/suspicious domain?
Enter your answer in a defanged format.

tshark -r directory-curiosity.pcap | grep dns | grep www
tshark -r directory-curiosity.pcap -T fields -e dns.qry.name | sort | uniq

jx2-bavuong[.]com

The "http.request.full_uri" filter can help.
What is the total number of HTTP requests sent to the malicious domain?

tshark -r directory-curiosity.pcap -T fields -e http.host | grep jx2 | wc -l

14

What is the IP address associated with the malicious domain?
Enter your answer in a defanged format.

tshark -r directory-curiosity.pcap -z ip_srcdst,tree -q
tshark -r directory-curiosity.pcap -Y "dns.a" -T fields -e dns.qry.name -e dns.a

141[.]164[.]41[.]174 

What is the server info of the suspicious domain?

tshark -r directory-curiosity.pcap -Y "http.response" -T fields -e http.host -e http.server | uniq

Apache/2.2.11 (Win32) DAV/2 mod_ssl/2.2.11 OpenSSL/0.9.8i PHP/5.2.9

Follow the "first TCP stream" in "ASCII".  
Investigate the output carefully.
What is the number of listed files?

tshark -r directory-curiosity.pcap -q -z follow,tcp,ascii,0 | grep 

3

What is the filename of the first file?
Enter your answer in a defanged format.

123[.]php

Export all HTTP traffic objects.  
What is the name of the downloaded executable file?
Enter your answer in a defanged format.

tshark -r directory-curiosity.pcap --export-objects http,export
ls export/ | grep .exe

vlauto[.]exe

What is the SHA256 value of the malicious file?

b4851333efaf399889456f78eac0fd532e9d8791b23a86a19402c1164aed20de  export/vlauto.exe

Search the SHA256 value of the file on VirtusTotal.  
What is the "PEiD packer" value?

PEiD packer  .NET executable

Search the SHA256 value of the file on VirtusTotal.  
What does the "Lastline Sandbox" flag this as?

virustotal > behaviour > sandbox detections

malware trojan

```

300 points

