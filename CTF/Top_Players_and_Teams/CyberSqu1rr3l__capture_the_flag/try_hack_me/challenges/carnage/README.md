```
_________                                            
\_   ___ \_____ _______  ____ _____     ____   ____  
/    \  \/\__  \\_  __ \/    \\__  \   / ___\_/ __ \ 
\     \____/ __ \|  | \/   |  \/ __ \_/ /_/  >  ___/ 
 \______  (____  /__|  |___|  (____  /\___  / \___  >
        \/     \/           \/     \//_____/      \/ 
```
Apply your analytical skills to analyze the malicious network traffic using Wireshark.
[^1]

Analyze the file in Wireshark and more, to answer the questions below.
-----------------------------------------------------------------------------------------

**What was the date and time for the first HTTP connection to the malicious IP?**

After opening the `carnage.pcap` file from the `~/Desktop/Analysis/` folder in Wireshark, 
we filter the HTTP packets with the `http` filter find out, that the first packet is 
already a HTTP GET request to a `documents.zip` archive. Under frame, we can see the
header with the arrival time, which is *Sep 24, 2021 16:44:38 UTC*. Finally, we write the
answer in the specified format for the flag.

**What is the name of the zip file that was downloaded?**

The full path in the GET request is `/incidunt-consequatur/documents.zip` with the
compressed file.

**What was the domain hosting the malicious zip file?**

The name of the host, i.e. domain hosting this (potentially) malicious zip file is 
`attirenepal[.]com` which was found in the HTTP protocol host information tab.

**Without downloading the file, what is the name of the file in the zip file?**

On the bottom of the HTTP GET request packet there is a reference to the packet number 
*2173* linked in which the response can be found. In this frame, we can then view the 
packet bytes for the data and already get suspicious of the clear-text 
`chart-1530076591.xlx` in the ASCII data dump which looks like the file name.

**What is the name of the webserver of the malicious IP from which the zip file was 
downloaded?**

The first idea, was to apply address resolution to get the malicious name with
*Edit > Preferences > Name Resolution > Resolve network (IP) addresses*. But, this only 
resolves the IP address names and not the name of the webserver. Upon browsing the 
information provided by the Hypertext Transfer Protocol in the previous packet *2173*, 
we  further discover the web server name *LiteSpeed*.

**What is the version of the webserver from the previous question?**

In the same packet, *2173*, we can find out the information `x-powered-by: PHP/7.2.34`
in the HTTP section, along with the HTTP OK response message and data.

**Malicious files were downloaded to the victim host from multiple domains.\
What were the three domains involved with this activity?**

On first instance, we try to manually investigate the HTTP GET requests but then read
the hint which advises us to investigate the HTTPS traffic instead and narrow down the 
time frame from *16:45:11* to *16:45:30*. 
So, we apply the filter `tls.handshake.type == 1` to display the TLS client requests.
Then, we manually move to the time frame *16:45:11* and investigate the next five
packets that are in the given time interval and get those domains:

> `finejewels[.]com[.]au`
> `self[.]events[.]data[.]microsoft[.]com`
> `client[.]wns[.]windows[.]com`
> `thietbiagt[.]com`
> `new[.]americold[.]com`

The Microsoft and Windows related URIs do not appear malicious but the other three domain 
names look suspicious and can be used for the flag.

**Which certificate authority issued the SSL certificate to the first domain from
the previous question?**

By following the TCP stream from the packet containing the `finejewels[.]com[.]au` server 
domain name from the previous filtering, we are able to locate the certificate and server 
key exchange for the suspicious domain five packets later.
The packet with the number *2436* has a *Certificate* tab for the Transport Layer 
Security. There, we can find out that the name of the certificate authority that issued 
the SSL certificate for the malicious domain is *GoDaddy*.

**What are the two IP addresses of the Cobalt Strike servers? Use VirusTotal to confirm 
if the IPs are identified as Cobalt Strike C2 servers.**

Under *Statistics > Conversations*, we are able to limit the IPv4 conversations to the
display filter and thus have five IP addresses, that come into closer investigation.
Further, we suspect the traffic to the C2 servers to be frequent, so we order them by 
the amount of packets and start investigating the `185.125.204.174` address in
VirusTotal. [^2] Here, under the *Community* tab, we can discover several comments,
detailing that a *Cobalt Strike* server was found for *Hydra Communications Ltd* just
like in the task description. 
Next, we analyze the `185.106.96.158` URI and discover the same comments in the 
*Community* tab [^3] leading us to choose these two IP addresses.

**What is the Host header for the first Cobalt Strike IP address from the previous 
question?**

For this task, we filter the Wireshark packets with `ip.src == 185.106.96.158 && http`
and then have a closer look ath the first HTTP packet details. Here, the *Request URI*
header indicates, that the host name is included in the full URL
`http://ocsp.verisign.com/spfooh/cacerts.crl`.

**What is the domain name for the first IP address of the Cobalt Strike server?**

Under the *Community* tab in VirusTotal [^3], we already discovered the following user
commentary, which further includes the C2 server domain name for this task.

> Cobalt Strike Server Found \
> C2: HTTPS @ 185[.]106[.]96[.]158:8888 \
> C2 Server: survmeter[.]live,/gscp[.]R/,185[.]106[.]96[.]158,/gscp[.]R/ \
> POST URI: /supprq/sa/ \
> Country: United States \
> ASN: DediPath \
> Host Header: ocsp[.]verisign[.]com

**What is the domain name of the second Cobalt Strike server IP?**

Again, we check the commentary for the second *Cobalt Strike* server and discover the
following comment in the *Community* tab. Again, this comment features the domain name
under *C2 Server* along with more information.

> Cobalt Strike Server Found \
> C2: HTTPS @ 185[.]125[.]204[.]174:4444 \
> C2 Server: securitybusinpuff[.]com,/jquery-3[.]3[.]1[.]min[.]js,185[.]125[.]204[.]174,/jquery-3[.]3[.]1[.]min[.]js \
> POST URI: /jquery-3[.]3[.]2[.]min[.]js \
> Country: N/A \
> ASN: Hydra Communications Ltd

**What is the domain name of the post-infection traffic?**

TBC
-----------------------------------------------------------------------------------------

[^1]: https://tryhackme.com/room/c2carnage
[^2]: https://www.virustotal.com/gui/ip-address/185.125.204.174
[^3]: https://www.virustotal.com/gui/ip-address/185.106.96.158/community
