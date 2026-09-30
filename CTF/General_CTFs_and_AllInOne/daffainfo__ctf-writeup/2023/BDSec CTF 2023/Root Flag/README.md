# Root Flag

> What binary had the root permission?

Download the pcap file here

# How to Solve

We need look the pcap file and see the http request with filter string `Linux` like this

And `flag` filter at the streams

*[Image: POC 1]*

Because the format is `BDSEC{flag}`

Then flag is

```
BDSEC{Y0u_NaILeD_IT_HaCkEr}
```