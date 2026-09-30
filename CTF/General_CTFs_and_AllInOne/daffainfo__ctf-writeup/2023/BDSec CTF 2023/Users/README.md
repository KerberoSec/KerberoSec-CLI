# Users

> How many users had the server access?

Download the pcap file here

# How to Solve

We need look the pcap file and see the http request with filter string `Linux` like this

*[Image: POC 1]*

Seem the all user is only 6, `john, tareq, saif, noman, psiam, and admin`

Because the format is `BDSEC{number}`

Then flag is

```
BDSEC{6}
```