# Hidden Path

> Where did the attacker hide the reverse shell in the web server?

Download the pcap file here

# How to Solve

We need look the pcap file and see the http request with filter string `rev.php` like this

*[Image: POC 1]*

Seem the file is renamed to `.backdoor.php`

After that make a new dir named `foo` and move the reverse file path

*[Image: POC 2]*

And rename the directory

*[Image: POC 3]*

Because the format is `BDSEC{/path}`

Then flag is

```
BDSEC{/opt/lampp/htdocs/app/admin_panel/.foo/.backdoor.php}
```