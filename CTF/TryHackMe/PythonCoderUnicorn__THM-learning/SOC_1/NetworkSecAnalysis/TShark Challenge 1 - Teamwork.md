
#Subscribers 
https://tryhackme.com/room/tsharkchallengesone

This room presents you with a challenge to investigate some traffic data as a part of the SOC team. Let's start working with TShark to analyse the captured traffic. We recommend completing the [TShark: The Basics](https://tryhackme.com/room/tsharkthebasics) and [TShark: CLI Wireshark Features](https://tryhackme.com/room/tsharkcliwiresharkfeatures) rooms first, which will teach you how to use the tool in depth. 

Start the VM by pressing the green **Start Machine** button attached to this task. The machine will start in split view, so you don't need SSH or RDP. In case the machine does not appear, you can click the blue **Show Split View** button located at the top of this room.  

>[!warning] **NOTE:** 
>Exercise files contain real examples. **DO NOT** interact with them outside of the given VM. Direct interaction with samples and their contents (files, domains, and IP addresses) outside the given VM can pose security threats to your machine.

An alert has been triggered: "The threat research team discovered a suspicious domain that could be a potential threat to the organization."

The case was assigned to you. Inspect the provided **teamwork.pcap** located in `~/Desktop/exercise-files` and create artefacts for detection tooling.

**Your tools:** TShark, [VirusTotal](https://www.virustotal.com/gui/home/upload).

```
Investigate the contacted domains.  
Investigate the domains by using VirusTotal.  
According to VirusTotal, there is a domain marked as malicious/suspicious.  
  
What is the full URL of the malicious/suspicious domain address?

Enter your answer in defanged format.

tshark -r teamwork.pcap | grep dns | grep www

 www[.]paypal[.]com4uswebappsresetaccountrecovery[.]timeseaways[.]com 

When was the URL of the malicious/suspicious domain address first submitted to VirusTotal?

2017-04-17 22:52:53 UTC

Which known service was the domain trying to impersonate?

paypal

What is the IP address of the malicious domain?
Enter your answer in defanged format.

tshark -r teamwork.pcap -z ip_srcdst,tree -q
184[.]154[.]127[.]226

What is the email address that was used?
Enter your answer in defanged format. (format: aaa[at]bbb[.]ccc)

tshark -r teamwork.pcap -Y "http.request.method == POST" -T fields -e http.file_data | grep .com

user=johnny5alive%40gmail.com
johnny5alive[at]gmail[.]com

```

![[Pasted image 20250314105831.png]]
150 points

