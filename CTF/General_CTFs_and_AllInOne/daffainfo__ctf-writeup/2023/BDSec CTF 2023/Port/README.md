# Port

> What was the LPORT?

Download the pcap file here

# How to Solve

We need look the pcap file and see the http request with filter string `terminal.php`

*[Image: POC 1]*

Seems the set port is `1337`

Because the format is `BDSEC{port}`

Then flag is

```
BDSEC{1337}
```