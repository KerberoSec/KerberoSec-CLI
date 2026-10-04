```
╺┳╸┏━┓╻ ╻┏━┓┏━┓╻┏    ┏━╸╻ ╻┏━┓╻  ╻  ┏━╸┏┓╻┏━╸┏━╸   ╻╻    ╺┳┓╻┏━┓┏━╸┏━╸╺┳╸┏━┓┏━┓╻ ╻
 ┃ ┗━┓┣━┫┣━┫┣┳┛┣┻┓   ┃  ┣━┫┣━┫┃  ┃  ┣╸ ┃┗┫┃╺┓┣╸    ┃┃╹    ┃┃┃┣┳┛┣╸ ┃   ┃ ┃ ┃┣┳┛┗┳┛
 ╹ ┗━┛╹ ╹╹ ╹╹┗╸╹ ╹   ┗━╸╹ ╹╹ ╹┗━╸┗━╸┗━╸╹ ╹┗━┛┗━╸   ╹╹╹   ╺┻┛╹╹┗╸┗━╸┗━╸ ╹ ┗━┛╹┗╸ ╹
```
In this THM room, we want to put our TShark skills into practice and analyse some network 
traffic. [^1]

What is the name of the malicious/suspicious domain?
-----------------------------------------------------------------------------------------
We can find out all the domains in the packet capture file with the following query.

```
$ tshark -r directory-curiosity.pcap -T fields -e dns.qry.name | awk NF | sort -r | uniq -c | sort -r
 8 isatap
 4 www.bing.com
 2 r20swj13mr.microsoft.com
 2 ocsp.digicert.com
 2 jx2-bavuong.com
 2 iecvlist.microsoft.com
 2 api.bing.com
```
Since multiple domains strike us to be suspicious, we investigate all the listed domains
with *VirusTotal* and find out that only the `jx2-bavuong[.]com` domain is listed as 
malicious/suspicious.

What is the total number of HTTP requests sent to this domain?
-----------------------------------------------------------------------------------------
First, we want to select the HTTP requests so we can look at the destination IP addresses
and thus notice the `141[.]164[.]41[.]174` which can be confirmed is a resolution of the
malicious domain (from VirusTotal), so we filter it.

```
$ tshark -r directory-curiosity.pcap \
    -Y 'http.request.full_uri && (ip.dst == 141[.]164[.]41[.]174)' | nl
```

What is the IP address associated with the malicious domain?
-----------------------------------------------------------------------------------------
From the previous task we already found out that it is `141[.]164[.]41[.]174`.

What is the server info of the suspicious domain?
-----------------------------------------------------------------------------------------
We filter for the malicious IP address and select the server information field.
```
$ tshark -r directory-curiosity.pcap -Y 'ip.addr == 141[.]164[.]41[.]174' -T fields -e http.server | awk NF
Apache/2.2.11 (Win32) DAV/2 mod_ssl/2.2.11 OpenSSL/0.9.8i PHP/5.2.9
```

What is the number of listed files?
-----------------------------------------------------------------------------------------
Now, we are advised to follow the "first TCP stream in ASCII", so we do that. \
`tshark -r directory-curiosity.pcap -z follow,tcp,ascii,0 -q` \
Upon closer inspection, we discover the three files `123[.]php`, `vlauto[.]exe` and 
`vlauto[.]php` which all appear to be malicious at first sight.

What is the filename of the first file?
-----------------------------------------------------------------------------------------
From the previous task solution, we already know that the file is `123[.]php`.

What is the name of the downloaded executable file?
-----------------------------------------------------------------------------------------
From the previous task, we already know that the executable is `vlauto[.]exe`.

What is the SHA256 value of the malicious file?
-----------------------------------------------------------------------------------------
First, we can export the HTTP traffic objects and then run `sha256sum` on it. \
`tshark -r directory-curiosity.pcap --export-objects http,/home/ubuntu/Desktop/extracted-by-tshark -q`
```
$ sha256sum vlauto.exe
b4851333efaf399889456f78eac0fd532e9d8791b23a86a19402c1164aed20de
```

What is the "PEiD packer" value?
-----------------------------------------------------------------------------------------
Now, we can paste this *SHA256* value of the malicious file to VirusTotal and get the 
PEiD packer *.NET executable* under the details section.

What does the "Lastline Sandbox" flag this as?
-----------------------------------------------------------------------------------------
Under the behavior section of VirusTotal, we retrieve the flag *Malware Trojan*.

[^1]: https://tryhackme.com/room/tsharkchallengestwo
