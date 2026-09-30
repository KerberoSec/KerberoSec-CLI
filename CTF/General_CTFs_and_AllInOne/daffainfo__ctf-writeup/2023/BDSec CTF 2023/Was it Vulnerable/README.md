# Was it Vulnerable?

> Was Process Task Details page vulnerable? If yes, what was the vulnerability?

Download the pcap file here

# How to Solve

We need look the pcap file and see the http request with filter string `profile.php`

*[Image: POC 1]*

After check the request is likely the attacker can view the other task, which is this vulnerability called `IDOR`

And then filter string with `UNION`

*[Image: POC 2]*

This surely `SQLI` request

Because the format is `BDSEC{VULN_VULN}`

Then flag is

```
BDSEC{IDOR_SQLI}
```