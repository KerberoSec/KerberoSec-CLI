# Root Permission

> What binary had the root permission?

Download the pcap file here

# How to Solve

We need look the pcap file and see the http request with filter string `Linux` like this

*[Image: POC 1]*

Seem the binary for the privilege escalation to root is `vim`

Because the format is `BDSEC{Flag}`

Then flag is

```
BDSEC{vim}
```