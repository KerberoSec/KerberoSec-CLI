
## Introduction

## Scenario

For this scenario, we are going to be using a PCAP file. Analyzing large files tends to use quite a bit of system resources, and the given browser-based AttackBox tends to be limited. Let's instead transfer the PCAP file to our own virtual machine.

*Important Note: pcap files on their own are relatively benign; however, the exportable objects that can be contained with them may **not be**. In this example specifically, we are going to be exporting malicious scripts that should not be stored on your host operating system; So I strongly recommend transferring the PCAP file to a virtual machine and not your host OS if you are going to be working along.

**PCAP File Transfer:**

On the browser-based machine **terminal**, move to the directory that contains the pcap file. It should be present at **/Desktop/Analysis**

Next, start an HTTP server with Python; this can be very easily done via this one-liner: **python3 -m http.server**

Now move to your VM machine, which should already be connected to the THM VPN, and use this command: **wget http://<ATTACK_BOX_IP>:8000/carnage.pcap**  *Note: change 'Attack Box IP' to be the IP of the machine hosting the Python server, you can find this by using ifconfig on that machine, example:

**<img width="750" height="372" alt="image" src="https://github.com/user-attachments/assets/127fd919-8142-41b1-b976-2b0ad902de3c" />

The file should begin transferring, and we can now do analysis more efficiently on just our VM machine alone.

## Traffic Analysis

When we open the PCAP file in Wireshark, we are immediately introduced to 70k packets: <img width="585" height="464" alt="image" src="https://github.com/user-attachments/assets/7a651868-a27a-48eb-a2b6-93e615a83f56" />

Meaning, for this exercise, being intelligent with using Wireshark filters is a must.

First question is:

**What was the date and time for the first HTTP connection to the malicious IP?**

**(answer format: yyyy-mm-dd hh:mm:ss)**

This seems like a bit of a strange first question. Let's check all of the IP addresses that are present in this file and see if we need more information or not:

To do this in Wireshark, select Statistics -> IPV4 Statistics -> and then All Addresses.

<img width="696" height="915" alt="image" src="https://github.com/user-attachments/assets/731712cf-6869-4702-9877-5aed00af7df2" />

We can quickly see that there is no easy lead here: <img width="1071" height="560" alt="image" src="https://github.com/user-attachments/assets/8ae0c407-98eb-48bf-90cd-d007f000c18b" />

Let's move to the next question and gather more info on what behavior we should be expecting for the first question.

**What is the name of the zip file that was downloaded?**

We now have a lead on what the malicious IP should be providing. We can use this information to make a Wireshark filter or use other methods to identify the malicious IP and what zip file is being provided.

Let's first filter for HTTP; HTTP requests can be the first sign of compromise:

<img width="1389" height="77" alt="image" src="https://github.com/user-attachments/assets/a8b58461-897b-45a0-a221-a9b872b6ad12" />

The first packet has our answer **documents.zip**, a malicious IP **85.187.128.24**, and the victim IP we should be looking for **10.9.23.102**. We should provide **documents.zip** as the answer for our current question and look for all communication to this IP to answer the first question. 

We can easily set a filter for all communication to this **Destination IP** by right-clicking the IP, highlighting prepare as filter, and choosing Selected:

<img width="983" height="461" alt="image" src="https://github.com/user-attachments/assets/1593d790-33e7-4868-ac4b-0002af7992e5" />

We can also add another filter for only HTTP requests by adding **and http** to the added **ip.dest** filter:

<img width="958" height="930" alt="image" src="https://github.com/user-attachments/assets/0d7b4272-82fd-4bf5-91ac-83b5490b94d8" />

To view the time of the connection, expand the **Frame** pane on the bottom left.

We can now see the exact time of the only HTTP-GET request to this IP.

Our answer should be this (They are looking for UTC time.):

Sep 24, 2021 16:44:38.990412000 -> **Sep 24, 2021 16:44:38**

**What was the domain hosting the malicious zip file?**

To check this, we can stay on our current highlighted packet; we merely just need to open the HTTP section of the packet, which is found at the bottom:

<img width="957" height="769" alt="image" src="https://github.com/user-attachments/assets/f52bbfcf-84af-46bb-b3ea-11d6ba360a62" />

And take the domain found in the **Full Request URI**: hxxp[:]//attirenepal[.]com/incidunt-consequatur/documents[.]zip

The answer is attirenepal[.]com (Defanged).

**Without downloading the file, what is the name of the file in the zip file?**

Here we are going to be interacting with the sample itself. We are going to export the downloaded malicious zip artifact and then unzip it to see what it contains. It goes without saying that this should be done in a safe environment.

To do this in Wireshark, go to **File** -> **Export Objects** -> and Select **HTTP**

<img width="586" height="576" alt="image" src="https://github.com/user-attachments/assets/26bcc09c-4adc-4274-bdc3-d59e0e37f179" />

<img width="765" height="545" alt="image" src="https://github.com/user-attachments/assets/52a93934-8eba-4416-aa71-64d0034ec7ac" />

Here we can see that the first object is the Malicious Zip file, but if this wasn't the case, we could search for the .zip file extension and filter the results, select the file, and choose save.

Now let's see what this .zip file contains:

<img width="600" height="498" alt="image" src="https://github.com/user-attachments/assets/0ab8cf67-5bcd-424f-8c81-fb1a668d488a" />

We can see that it is an Excel spreadsheet, meaning this spreadsheet likely had a malicious macro that initiated the infection once run. This is a very common tactic bundled with Phishing attempts. If we so desired, we could also analyze the spreadsheet for malicious macros via some static analysis tools.

For this question, however, our answer is **chart-1530076591.xls**

**What is the name of the webserver of the malicious IP from which the zip file was downloaded?**

Now we are getting a bit deeper into forensics and analyzing the tracks of the threat actor, we should now look at the full stream of communication with this IP and see what we can get in the request headers:

To follow the full conversation that occurred with a specific IP/packet, right-click on that packet, click follow, and choose HTTP or TCP stream, respectively. We are doing HTTP in this case: 

<img width="777" height="446" alt="image" src="https://github.com/user-attachments/assets/ea67ac99-5433-4acb-96f7-c2ac623465d0" />

<img width="1269" height="877" alt="image" src="https://github.com/user-attachments/assets/15ca1c40-541d-435f-8bd2-1bf39f33abfa" />

Now we can see the entire conversation in a nice and readable format, and we can also see the web server that was used for the transfer in the headers:

<img width="683" height="327" alt="image" src="https://github.com/user-attachments/assets/2333e488-fee8-49f6-9aca-2d8c2da26297" />

Our answer for this question is **LiteSpeed.**

**What is the version of the webserver from the previous question?**

We can quickly grab the PHP version too while we are still on this stream's info pane:

<img width="646" height="336" alt="image" src="https://github.com/user-attachments/assets/dce83064-425e-4829-a13d-adb9e3e22a08" />

Our answer to that question should be: **PHP/7.2.34**

## Initial and Following Compromise

**Malicious files were downloaded to the victim host from multiple domains. What were the three domains involved with this activity?**

_*Sidetrack Note for the following questions: In the following questions, we are asked extensively about the domain names. You can add a custom column similarly to the one I did in my walkthrough to display the domain/server names: Choose a column you don't want, in my case, it was size:

Right click and select edit Column, then make the column title as server name and set the fields as:

**tls.handshake.extensions_server_name**

It should look like this_:

<img width="1900" height="51" alt="image" src="https://github.com/user-attachments/assets/dc97f4d6-357e-464e-a859-64cf1268c40e" />

_Then press Ok and you should be set 👍_ 

**Malicious files were downloaded to the victim host from multiple domains. What were the three domains involved with this activity?**

This question took a lot of trial and error without checking the hint. I believe they should have included the fact that these requests are SSL (HTTPS) in the question itself rather than the hint. Let's check the hint quickly to save time:

<img width="366" height="265" alt="image" src="https://github.com/user-attachments/assets/1eba4c5c-ecb5-43a4-a7af-d3c580af91fc" />

Ok, so now we know we are specifically only supposed to be looking for HTTPS traffic. We can set that filter on Wireshark:

*Note that the filter for this is not _HTTPS_ on Wireshark but _TLS_ for some reason.

<img width="1567" height="478" alt="image" src="https://github.com/user-attachments/assets/333033e2-7c1f-4bc9-9801-663f6e1f8504" />

There is a total of over 10k packets, even when filtering for TLS; this is due to numerous reasons, such as Microsoft telemetry being sent via the HTTPS protocol. 

Looking back at the hint, we find that they also provided a time frame. Let's set up a filter for this time frame:

((tls) && (ip.src == 10.9.23.102) )&& (frame.time_utc >= "2021-09-24 16:45:11.00Z") && (frame.time_utc <= "2021-09-24 16:45:31.0Z") 

Now let's see what is present when we apply this filter:

<img width="1845" height="549" alt="image" src="https://github.com/user-attachments/assets/ec978f63-2025-459a-a4a6-2669d0c8c464" />

26 packets, since these are encrypted, we have no clear way of telling what is going on in the conversation. However, the wording of the question lets us know that they are indeed doing a download of some sort during this time period. Filtering out that which is coming from trusted domains such as **windows.com** and **microsoft**, we find that there are 3 suspicious domains that our victim is communicating with:

<img width="1821" height="214" alt="image" src="https://github.com/user-attachments/assets/4a62dc01-aefe-4054-bfa0-075860447ab7" />

So our answers for this question are:

**finejewels[.]com[.]au, thietbiagt[.]com, new[.]americold[.]com**. The answer is expected to be in that order **Defanged**

**Which certificate authority issued the SSL certificate to the first domain from the previous question?**

We can sort communication to the domains according to packet number by selecting **No.** where we can see our first domain is the **finejewels[.]com[.]au** domain let's follow the stream to get some more information:

<img width="1286" height="766" alt="image" src="https://github.com/user-attachments/assets/e487360f-5d50-47f0-9878-771929e78eb8" />

Let's click **TCP** and see where it takes us:

<img width="1264" height="899" alt="image" src="https://github.com/user-attachments/assets/73788b77-c4fd-4a59-a311-151cd41d1c0e" />

We can see clearly that the certificate authority is **GoDaddy**. We should provide this as our answer.

## C2 Information

**What are the two IP addresses of the Cobalt Strike servers? Use VirusTotal (the Community tab) to confirm if IPs are identified as Cobalt Strike C2 servers. (answer format: enter the IP addresses in sequential order)**

If we remember from before, we were witnessing constant **HTTP** communications with a server right after initial compromise. The infected host was frequently sending undecipherable POST requests to that IP address. This type of behavior can be indicative of a C2.

Let's go back to our clear-text **HTTP** filter:

<img width="1819" height="477" alt="image" src="https://github.com/user-attachments/assets/282827b5-d6ae-4643-bf57-0c16a5a76da6" />

There are two IPs here that are suspicious: **208[.]91[.]128[.]6** and **185[.]106[.]96[.]158**, we don't exactly know for sure if they are Cobalt Strike servers, but we should check them in VirusTotal anyway, since they are obviously connected to the compromise of the system. 

Our first IP does not return anything for VT:

<img width="1617" height="854" alt="image" src="https://github.com/user-attachments/assets/df44645e-0a2a-40aa-aa44-2f1809aa866e" />

Our second IP does however turn up results on VT:

<img width="1574" height="421" alt="image" src="https://github.com/user-attachments/assets/0a24703c-dd03-47a3-b8d0-7b8b32db523b" />

We can check the community tab for more information on the server:

<img width="728" height="309" alt="image" src="https://github.com/user-attachments/assets/036e864b-643f-4bbe-80a1-3903a93d5f73" />

It seems to be under suspicion for being a **C2 Server**, let's take note of that.

Despite the second one turning positive, it would be necessary in a real-world scenario to investigate; however, due to the wording of the question, we know for sure there should be a mention of the IP being used as a C2 server in VT. As a result, we should continue our search.

There are not many other long conversations that we see our victim have with other IPs that we would suspect are from a **C2** under the HTTP protocol. Let's check HTTPS via the TLS filter, as we know this threat actor does make use of HTTPS.

<img width="1848" height="471" alt="image" src="https://github.com/user-attachments/assets/47719e59-39cd-41ff-a391-4f313c615d9c" />

When checking this, we should ignore whatever is either most likely to be benign or is not relevant to the question. Any server names that contain Microsoft, SMTP, Outlook, or known popular domains, we should ignore:

<img width="1506" height="409" alt="image" src="https://github.com/user-attachments/assets/2cebf954-ccbd-4a96-a398-712a0811d905" />

**"Securitybusinpuff[.]com"** stands out as a suspicious domain; we should check its respective IP on VT for more information: **185[.]125[.]204[.]174**.

<img width="1614" height="715" alt="image" src="https://github.com/user-attachments/assets/120409bd-1d97-4587-bb28-cff7c23eec70" />

The IP does not get many hits on AVs; however, let's check the community tab for more info from vendors and others:

<img width="1570" height="263" alt="image" src="https://github.com/user-attachments/assets/9cf81514-e0ef-484a-9000-5042cb7b5e35" />

It is noted to be a C2 server. Since the question is worded the way it is, we can be fairly confident of this and submit our answer as this:

**185[.]106[.]96[.]158**, **185[.]125[.]204[.]174**  *They expect the Answer Defanged

**What is the Host header for the first Cobalt Strike IP address from the previous question?**

We can do this by highlighting the packet with the IP **185[.]106[.]96[.]158** and going to follow -> HTTP stream like earlier:

<img width="1250" height="447" alt="image" src="https://github.com/user-attachments/assets/014c0526-db9e-46d7-ab13-44fede8f9497" />

We find the host is **ocsp[.]verisign[.]com**

**What is the domain name for the first IP address of the Cobalt Strike server? You may use VirusTotal to confirm if it's the Cobalt Strike server (check the Community tab).**

We can recheck the community tab entry for this IP:

<img width="1434" height="267" alt="image" src="https://github.com/user-attachments/assets/008a9d2a-79f7-4bee-ab07-43782c135b9c" />

Our answer is **survmeter[.]live**

**What is the domain name of the second Cobalt Strike server IP?  You may use VirusTotal to confirm if it's the Cobalt Strike server (check the Community tab).**

We already grabbed this earlier from Wireshark, the answer was **securitybusinpuff[.]com**

**What is the domain name of the post-infection traffic?**

We can find this via looking at the packets after the request for the zip file (Filter as HTTP), we can check those packets and then choose follow HTTP stream for one of them:

<img width="1257" height="524" alt="image" src="https://github.com/user-attachments/assets/3fd19757-9025-4423-a7ae-cec09b2b1b36" />

We can quickly identify the domain name as **maldive[.]host**

**What are the first eleven characters that the victim host sends out to the malicious domain involved in the post-infection traffic?** 

We can go back to the **HTTP** filter and look for the first **POST** request:

<img width="1729" height="86" alt="image" src="https://github.com/user-attachments/assets/4b9ca796-de1b-480c-8527-7c63f6cf105e" />

Our answer is: **zLIisQRWZI9**

**What was the length for the first packet sent out to the C2 server?**

My columns are currently changed, so we cannot see the size in the main view, but we can find it in the lower left-hand pane:

<img width="973" height="839" alt="image" src="https://github.com/user-attachments/assets/e5eca7eb-c561-478c-a831-4a199b480838" />

Our answer is **281** bytes.

**What was the Server header for the malicious domain from the previous question?**

We can find this in the same follow **HTTP** stream panel from earlier:

<img width="1255" height="545" alt="image" src="https://github.com/user-attachments/assets/0473dc40-534b-43bc-bf51-fbdbc16b0659" />

Answer: **Apache/2.4.49 (cPanel) OpenSSL/1.1.1l mod_bwlimited/1.4**

**The malware used an API to check for the IP address of the victim’s machine. What was the date and time when the DNS query for the IP check domain occurred? (answer format: yyyy-mm-dd hh:mm:ss UTC)**

When we were looking at the TLS/HTTPS requests, we noticed that there were multiple calls to **"api.ipify.org"**

Let's set the old filter and check for that:

<img width="1797" height="493" alt="image" src="https://github.com/user-attachments/assets/a9c05fb5-a410-4118-9e84-5d3542fc67d8" />

We can also research what this domain actually is:

<img width="800" height="447" alt="image" src="https://github.com/user-attachments/assets/3403f4ef-54de-4be4-91d2-ae8248219c8c" />

This seems to be exactly what we are looking for. Now let's switch gears and look for DNS protocol calls that are linked to this domain.

We can set the filter to **dns** and click the number panel to place all packets in order. Now we use Control-F and select the string and enter **ipify** to find DNS requests that match this:

<img width="1890" height="532" alt="image" src="https://github.com/user-attachments/assets/ac6d0d0b-f5f8-493f-8113-2c6845f7a0c5" />

We have found the first DNS request attempting to resolve the domain to an IP address. We can find the UTC timestamp in the left-hand panel:

<img width="1331" height="925" alt="image" src="https://github.com/user-attachments/assets/b6d62691-90da-44f2-861f-4883c4ee62a9" />

**2021-09-24 17:00:04** Is our answer**.

**What was the domain in the DNS query from the previous question?**

We already know this: **api.ipify.org** (non-malicous)

**Looks like there was some malicious spam (malspam) activity going on. What was the first MAIL FROM address observed in the traffic?**

We saw a lot of mail and SMTP-related requests we needed to filter out earlier. Let's check for all logged events using the SMTP protocol:

Set the filter to SMTP and let's look for the first MAIL FROM address:

<img width="1864" height="463" alt="image" src="https://github.com/user-attachments/assets/c949ffbc-b8f4-4549-8fe5-7398dfa045a4" />

And we have found it: **farshin@mailfa[.]com**

**How many packets were observed for the SMTP traffic?**

We can keep our current filter and check the lower right pane:

<img width="292" height="41" alt="image" src="https://github.com/user-attachments/assets/3d3e60c1-0abe-46f8-a893-10fb965ab706" />

Answer is **1439** Packets

## Summary

