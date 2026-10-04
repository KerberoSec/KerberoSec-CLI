# HostName

> What is the host name of the web server?

Download the pcap file here

# How to Solve

We need look the pcap file and see the http stream like this

*[Image: POC 1]*

Because the format is `BDSEC{hostname}`

Then flag is

```
BDSEC{nanomate-solutions.com}
```