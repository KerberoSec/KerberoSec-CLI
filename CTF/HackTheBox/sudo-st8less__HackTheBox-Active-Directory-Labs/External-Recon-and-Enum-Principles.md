### CPTS / HTB Penetration Tester Path <br>
### Active Directory Enumeration & Attacks: External Recon & Enum Principles <br>
<mark>hook it up with a &#x2B50; if this helps.</mark> <br>
🐦: @<a href="https://x.com/st8less">**st8less**</a>

<br>
<br>

---

### External Recon and Enumeration Principles

Goal: validate scope, find publicly accessible info / breach data that aids the internal test.

What to look for:

| Data Point | Description |
|---|---|
| `IP Space` | ASN, netblocks, cloud presence, DNS records |
| `Domain Information` | Registrar, subdomains, public services (mail/DNS/VPN/web), SIEM/AV/IDS hints |
| `Schema Format` | Email scheme → AD username scheme + password policy |
| `Data Disclosures` | Public PDFs/PPT/DOCX with intranet links, metadata, leaked GitHub creds |
| `Breach Data` | Public username/password leaks tied to corp emails |

Resources:
- ASN/IP: [IANA](https://www.iana.org/), [ARIN](https://www.arin.net/), [RIPE](https://www.ripe.net/), [BGP Toolkit](https://bgp.he.net/)
- DNS/Domain: [Domaintools](https://www.domaintools.com/), [PTRArchive](http://ptrarchive.com/), [ICANN](https://lookup.icann.org/lookup), [viewdns.info](https://viewdns.info/)
- Cloud/Dev: [GitHub](https://github.com/), [GrayHatWarfare](https://grayhatwarfare.com/), Google dorks
- Breach: [HaveIBeenPwned](https://haveibeenpwned.com/), [Dehashed](https://www.dehashed.com/)

Smaller orgs often share infra (Cloudflare/AWS/GCP): don't pivot off-target. AWS pentest [policy](https://aws.amazon.com/security/penetration-testing/), Oracle [notification](https://docs.oracle.com/en-us/iaas/Content/Security/Concepts/security_testing-policy_notification.htm).

DNS validation:

```diff
+ $ nslookup ns1.inlanefreight.com
+ $ nslookup ns2.inlanefreight.com
```

<br>

Google dorks for files / emails:

```diff
+ filetype:pdf inurl:inlanefreight.com
+ intext:"@inlanefreight.com" inurl:inlanefreight.com
```

<br>

Username harvesting via [linkedin2username](https://github.com/initstring/linkedin2username): produces `flast`/`first.last`/`f.last` mashups for spraying.

Credential hunting via Dehashed (API or web). Use the [dehashed.py](https://github.com/mrb3n813/Pentest-stuff/blob/master/dehashed.py) script:

```diff
+ $ sudo python3 dehashed.py -q inlanefreight.local -p
```

<br>

Other useful tools:

```diff
+ $ trufflehog <repo or url>
```

<br>

---

<br>

### Exercise

IP: target = inlanefreight.com (passive only)

---

### Question 1:
While looking at inlanefreights public records, a flag can be seen. Find the flag and submit it. (format == HTB{******})

#### Lookup the domain on the BGP toolkit: flag is in the DNS records.

```diff
+ # browse https://bgp.he.net/ → search inlanefreight.com → DNS tab
```

&#x1F6A9; found **HTB{5Fz6UPN--edit--zqjdg0AzXyxCjMZ}**.
