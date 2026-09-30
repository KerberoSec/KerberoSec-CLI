# #2 Threat Intelligence Tools

@threatinteltools

[Abuse.ch](http://abuse.ch/) is a research project hosted by the Institue for Cybersecurity and Engineering at the Bern University of Applied Sciences in Switzerland. It was developed to identify and track malware and botnets through several operational platforms developed under the project. These platforms are:

1. **Malware Bazaar**: A resource for sharing malware samples.

[MalwareBazaar: Malware sample exchange](https://bazaar.abuse.ch/)

1. **Feodo Tracker**: A resource used to track botnet command and control (C2) infrastructure linked with Emotet, Dridex and TrickBot.

[Feodo Tracker](https://feodotracker.abuse.ch/)

1. **SSL Blacklist**: A resource for collecting and providing a blocklist for malicious SSL certificates and JA3/JA3s fingerprints.

[SSLBL | Detecting malicious SSL connections](https://sslbl.abuse.ch/)

1. **URL Haus**: A resource for sharing malware distribution sites.

[URLhaus: Malware URL exchange](https://urlhaus.abuse.ch/)

1. **Threat Fox**: A resource for sharing indicators of compromise (IOCs).

[ThreatFox: Share Indicators Of Compromise (IOCs)](https://threatfox.abuse.ch/)

# Using PhishTool: Email Analysis

I have been tasked with analyzing a suspicious email, **Email1.eml**. To do this, I will open the email in Thunderbird for further inspection.

Let’s open the email with Thunderbird `Email1.eml`.

This is what the email looks like:

We want to identify which social media site it is impersonating. Since the logo is not very clear, I will check the **view source** instead:

- More → View **Source**

In the message source I search for `https://` tag, or occurrences of domain names that look like brand assets (e.g., logos, stylesheets, image URLs).

I found a link / asset that clearly indicates the impersonated site 

Conclusion: I determined the email is impersonating **Linkedin.**

Next, I’ll extract the originating IP address from the source page by searching for **“SENDER IP”**.

1. In the raw message source I searched for header lines containing `SENDER IP` or examined the topmost `Received:` headers.
2. I located the first non-internal `Received:` (the earliest external hop) and extracted the IP address:
    - **Originating IP found:** `204.93.183.11` (example from this mail).
    
    This confirms that the sender IP is `204.93.183.11`. This is most likely the originating IP address because it is the first non-internal IP listed, indicating the server where the email originated or was first processed.
    

## Defang the IP using CyberChef

Now, I’ll open CyberChef [https://gchq.github.io/CyberChef](https://gchq.github.io/CyberChef/)

I need to **defang** the IP address `204.93.183.11`, since it is the originating IP. In CyberChef, I search for the **Defang IP Addresses** operation:

Then I input the sender IP address, which gives me the defanged IP address applied the **Defang** operation (or `Find / Replace` rule) to produce a safe format:

Finally, I can easily determine how many hops the email went through to reach the recipient. By searching for the term **“Received”**, I can see that the email passed through **4 hops**.

**Command-line alternative (if I have the `.eml` file locally):**

```jsx
grep -i '^Received:' Email1.eml | wc -l
```

# Using Cisco Talos Intelligence,

Let’s use the information we gathered from the previous malicious email file to find out more details.

I entered the IP address we defanged earlier using CyberChef:

From here, we can find who the customer is by scrolling down and clicking on **WHOIS**. However, since it was unavailable at that time, I used a random WHOIS lookup from Google for that IP. This was the result:

But what if there’s an attached file that looks suspicious, like in this new example case?

In this situation, I need to open the terminal and use the `sha256sum` command. A hash helps identify malicious files by comparing them against the hashes of known malware.

Next, I searched this hash on Cisco Talos Intelligence, and here’s the result:

On this page, I can also see the detected malware family associated with the attachment.