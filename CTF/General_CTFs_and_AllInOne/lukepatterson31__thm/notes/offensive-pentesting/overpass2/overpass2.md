# Overpass2

### Forensics: Analyse the PCAP

Open the pcap file with wireshark

**What was the URL of the page they used to upload a reverse shell?**

Filter packets by protocol and look for HTTP, then look for POST methods.

`tshark -r overpass2.pcapng -Y http`

**What payload did the attacker use to gain access?**

Look at the data of the POST request's file.

`tshark -r overpass2.pcapng -Y "(http.request.method==POST)" -T fields -e http.file_data`

**What password did the attacker use to privesc?**

Find TCP packets containing requests from the reverse shell

`tshark -r overpass2.pcapng -Y "(tcp[13]==0x18)&&(data.len>3)" -T fields -e tcp.payload -w <OUTFILE>`

`tcp[13]==0x18` is the 14th byte of the tcp header (flags) and set to 0x18 which is the psh 
and ack flags indicating data was sent, received and acknowledged.

Open the outfile with a hexeditor to read the payload contents and find any passswords.

**How did the attacker establish persistence?**

Look at the tcp payloads again.

**Using the fasttrack wordlist, how many of the system passwords were crackable?**

Look for the contents of /etc/shadow in the tcp payloads, download the fasttrack wordlist 
and crack the hashes with john or hashcat.

### Research: Analyse the code

**What's the default hash for the backdoor?**

Check the backdoor source code.

**What's the hardcoded salt for the backdoor?**

Check the backdoor source code.

**What was the hash that the attacker used?: go back to the PCAP for this!**

Look for the backdoor execution in the tcp payloads.

**Crack the hash using rockyou and a cracking tool of your choice. What's the password?**

Check the source code for the salt and password hash combination order, combine the salt 
and password hash from the tcp payload and crack with john or hashcat.

### Attack: Get back in!

**The attacker defaced the website. What message did they leave as a heading?**

Navigate to the web page or check the HTTP requests.

**Using the information you've found previously, hack your way back in!**

Use the backdoor to gain initial access.

**What's the user flag?**

Use cat to view the user.txt file

**What's the root flag?**

Look for a privilege escalation method and elevate privileges, use cat to view root.txt
