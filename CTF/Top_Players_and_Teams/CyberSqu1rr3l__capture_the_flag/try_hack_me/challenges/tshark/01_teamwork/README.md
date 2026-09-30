```
╺┳╸┏━┓╻ ╻┏━┓┏━┓╻┏    ┏━╸╻ ╻┏━┓╻  ╻  ┏━╸┏┓╻┏━╸┏━╸   ╻    ╺┳╸┏━╸┏━┓┏┳┓╻ ╻┏━┓┏━┓╻┏ 
 ┃ ┗━┓┣━┫┣━┫┣┳┛┣┻┓   ┃  ┣━┫┣━┫┃  ┃  ┣╸ ┃┗┫┃╺┓┣╸    ┃╹    ┃ ┣╸ ┣━┫┃┃┃┃╻┃┃ ┃┣┳┛┣┻┓
 ╹ ┗━┛╹ ╹╹ ╹╹┗╸╹ ╹   ┗━╸╹ ╹╹ ╹┗━╸┗━╸┗━╸╹ ╹┗━┛┗━╸   ╹╹    ╹ ┗━╸╹ ╹╹ ╹┗┻┛┗━┛╹┗╸╹ ╹                                                         |___/                                                     
```
In this THM room, we want to put our *TShark* skills into practice and analyse some
network traffic. [^1]

What is the full URL of the malicious/suspicious domain address?
-----------------------------------------------------------------------------------------
It is our objective to investigate the `~/Desktop/exercise-files/teamwork.pcap` file by
relying mainly on *TShark* and *VirusTotal*. First, we investigate the
contacted domains in `tshark` for requests and then with the `dns.qry.name` field.
```
$ tshark -r teamwork.pcap -Y 'http'
$ tshark -r teamwork.pcap -Y 'http.request.method matches "(GET|POST)"'
28.604818 192.168.1.100 ? 184.154.127.226 HTTP 551 GET /suspecious.php HTTP/1.1
```
```
$ tshark -r teamwork.pcap -T fields -e dns.qry.name | awk NF | sort -r | uniq -c | sort -r

19 www[.]paypal[.]com4uswebappsresetaccountrecovery[.]timeseaways[.]com
 6 toolbarqueries[.]google.com
 4 wittyserver[.]hsd1[.]md[.]comcast[.]net
 4 wittyserver
```
Here, we get immediately suspicious of the PayPal looking domain and indeed, VirusTotal
confirms that this is a malicious criminal IP for phishing. Note, that we want to submit
the domain with the *HTTP* protocol, which is *hxxp* in defanged.

When was the URL of the domain address first submitted to VirusTotal?
-----------------------------------------------------------------------------------------
At first, we find out that the malicious domain address was registered first on 
"2004-11-22 06:50:00 UTC" but then under the date resolved header for the *Passive DNS
Replication*, we find out that it was first resolved on April 17th 2017. And using a 
search engine of our choice, we find out that it was first submitted to VirusTotal on 
"2017-04-17 22:52:53 UTC".

Which known service was the domain trying to impersonate?
-----------------------------------------------------------------------------------------
The domain was obviously trying to impersonate the finance company *PayPal*.

What is the IP address of the malicious domain?
-----------------------------------------------------------------------------------------
Based on the VirusTotal Passive DNS Replication, we find out that the domain has been 
resolved to the `184[.]154[.]127[.]226` IP address.

What is the email address that was used?
-----------------------------------------------------------------------------------------
Using the information at VirusTotal, we would suspect the registrant email
`abuse[at]godaddy[.]com` based off the `whois` search result. But instead we want to use
`tshark` and print all the content of the HTTP submissions.
```
$ tshark -r teamwork.pcap -z http_seq,tree -q
$ tshark -r teamwork.pcap -T fields -e http.file_data -e urlencoded-form.key -e urlencoded-form.value \
  | awk NF | sort -r | uniq -c | sort -r | grep "@"
```
This way, we get the email address `johnny5alive[at]gmail[.]com` in return.

[^1]: https://tryhackme.com/room/tsharkchallengesone
