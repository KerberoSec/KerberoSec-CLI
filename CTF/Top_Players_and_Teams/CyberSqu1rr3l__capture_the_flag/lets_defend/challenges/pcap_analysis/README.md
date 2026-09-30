```                       
,------.  ,-----.  ,---.  ,------.       ,---.                  ,--.               ,--.        
|  .--. ''  .--./ /  O  \ |  .--. '     /  O  \ ,--,--,  ,--,--.|  |,--. ,--.,---. `--' ,---.  
|  '--' ||  |    |  .-.  ||  '--' |    |  .-.  ||      \' ,-.  ||  | \  '  /(  .-' ,--.(  .-'  
|  | --' '  '--'\|  | |  ||  | --'     |  | |  ||  ||  |\ '-'  ||  |  \   ' .-'  `)|  |.-'  `) 
`--'      `-----'`--' `--'`--'         `--' `--'`--''--' `--`--'`--'.-'  /  `----' `--'`----'  
                                                                    `---'    
```
We have captured this traffic from P13's computer. Can you help him? [^1]

Analyze the network traffic. 
-----------------------------------------------------------------------------------------
**In network communication, what are the IP addresses of the sender and receiver?**

We begin, by opening the file `/root/Desktop/ChallengeFile/Pcap_Analysis.pcapng` with the
*Wireshark Network Analyzer* tool. Since there are many entities in the conversations
statistic, we are not sure which one to focus on. Using the hint, we are informed to
find the chat with the sender *P13* and thus query `frame contains "P13"`. This returns
only eleven packets and since we know that the sender's source address has the username
*P13*, we know that the first packet in the list already shows the correct source and
destination IPv4 addresses.

**P13 uploaded a file to the web server. What is the IP address of the server?**

From the previous task, we now know to filter for the source IP address of the *P13*
computer. However, due to the huge amount of packets still filtered with this command
alone, we further apply a *HTTP* filter which commonly indicates file uploads through
`ip.src == <IP_SRC_REDACTED> && http`. This finally shows one *POST* request with the
*PHP* file as it was sent to the server.

**What is the name of the file that was sent through the network?**

For this, we can click on the *POST* request and follow the *HTTP* stream to get
further information. At first, we want to submit the web page `/panel.php` as the 
filename but then we notice, the *WebKitFormBoundary* later with the desired filename.

**What is the name of the web server where the file was uploaded?**

Upon scrolling down in the *HTTP* stream to the server response, we are prompted with the
server name *Win64* and what it runs with, e.g. *OpenSSL/1.1.1p* and *PHP/8.0.25*. The
server classification without the version number is the name of the web server we are 
looking for.

**What directory was the file uploaded to?**

Further, in this server response, we can also see in which directory the file was 
uploaded to, which can be found directly under the *Content-Type* header.

**How long did it take the sender to send the encrypted file?**

At first, we try to compare the two POST request and response times but since they are
expected to be a few microseconds, we instead choose to print the *Statistics > 
Conversations* tab. Here, under *TCP*, we have an option to limit to the display filter
and thus get the total duration for the encrypted file upload in seconds.

[^1]: https://app.letsdefend.io/challenge/pcap-analysis
