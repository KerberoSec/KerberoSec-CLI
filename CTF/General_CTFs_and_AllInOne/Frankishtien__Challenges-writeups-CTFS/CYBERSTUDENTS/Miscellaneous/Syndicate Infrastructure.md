# Syndicate Infrastructure

```
krampus.csd.lol
```

<img width="1042" height="694" alt="image" src="https://github.com/user-attachments/assets/1bbe6bc8-efcf-4416-b55e-8b2f1fd9923d" />

1\. Understanding the Task
--------------------------

We were given:

-   Domain: `krampus.csd.lol`

-   Task: Perform DNS reconnaissance without brute-forcing

-   Goal: Find hidden flag in DNS records

-   Key constraint: "All information is in DNS records"

Why: In real-world threat intelligence, attackers often hide infrastructure details in DNS records (SPF, DKIM, SRV, etc.). The challenge mimics this by embedding clues across different DNS record types.

2\. Step-by-Step Investigation
------------------------------

### Step 1: Initial A Record Check

```bash

dig krampus.csd.lol A

```

<img width="1215" height="451" alt="image" src="https://github.com/user-attachments/assets/5392ff04-f875-49e3-9413-3f229a92c84e" />

Result: No A record (only SOA)\
Why: This told us the main domain doesn't resolve to an IP, suggesting it's not a web server but used for other DNS purposes.

### Step 2: Check TXT Records

```bash

dig krampus.csd.lol TXT

```

<img width="1184" height="484" alt="image" src="https://github.com/user-attachments/assets/c257f461-7e5e-4c50-b55c-acce45ef9641" />

Result: SPF record: `"v=spf1 include:_spf.krampus.csd.lol -all"`\
Why: SPF records control email sending authorization. The `include:` mechanism pointed to another subdomain we needed to check.

### Step 3: Follow SPF Include

```bash

dig _spf.krampus.csd.lol TXT

```

<img width="1095" height="482" alt="image" src="https://github.com/user-attachments/assets/3605c9f1-d96d-453a-a50b-50bc8ac60915" />

Result: `"v=spf1 ip4:203.0.113.0/24 ~all"`\
Why: This IP range (203.0.113.0/24) is RFC 5737 documentation space: not real. This was a dead end but confirmed we're on the right track checking TXT records.

### Step 4: Check MX Records

```bash

dig krampus.csd.lol MX

```

<img width="882" height="484" alt="image" src="https://github.com/user-attachments/assets/e144aba2-5d1c-4bcf-9b1a-06c8acb7ff47" />

Result: `mail.krampus.csd.lol`\
Why: MX records show mail servers. Following mail infrastructure often reveals more subdomains.

### Step 5: Check Mail Server

```bash

dig mail.krampus.csd.lol A

```

<img width="845" height="452" alt="image" src="https://github.com/user-attachments/assets/d37cbea0-cc5c-472e-9dab-498b889f23cd" />

Result: `127.0.0.1` (loopback)\
Why: Loopback suggests this isn't a real public mail server, maybe a hint to look elsewhere.

### Step 6: Check DMARC Record

```bash

dig _dmarc.krampus.csd.lol TXT

```

<img width="1208" height="519" alt="image" src="https://github.com/user-attachments/assets/ec749a10-c469-448f-8e3d-adcf8503f91a" />

Result: DMARC policy with `ruf=mailto:forensics@ops.krampus.csd.lol`\
Why: DMARC specifies where to send forensic/aggregate reports. The email address revealed a new subdomain: `ops.krampus.csd.lol`

### Step 7: Investigate Ops Subdomain

```bash

dig ops.krampus.csd.lol TXT

```

<img width="1203" height="518" alt="image" src="https://github.com/user-attachments/assets/c84f3538-f245-400a-af86-d03a79c989df" />

Result: Listed internal services as SRV records:

-   `_ldap._tcp.krampus.csd.lol`

-   `_kerberos._tcp.krampus.csd.lol`

-   `_metrics._tcp.krampus.csd.lol`

Why: SRV records define locations of specific services. This was a critical pivot point.

### Step 8: Query SRV Records

```bash

dig SRV _ldap._tcp.krampus.csd.lol
dig SRV _kerberos._tcp.krampus.csd.lol
dig SRV _metrics._tcp.krampus.csd.lol

```

<img width="881" height="783" alt="image" src="https://github.com/user-attachments/assets/22a4ebf0-e19b-48e2-8659-7f98cf20e432" />

Results:

-   LDAP & Kerberos → `dc01.krampus.csd.lol`

-   Metrics → `beacon.krampus.csd.lol`

Why: These are the actual server hostnames providing those services.

### Step 9: Check Beacon TXT Record

```bash

dig TXT beacon.krampus.csd.lol

```

<img width="1033" height="560" alt="image" src="https://github.com/user-attachments/assets/90bd4e23-0074-4914-9df7-7faffe672fa7" />

Result: `config=ZXhmaWwua3JhbXB1cy5jc2QubG9s==`\
Why: The `config` parameter with base64 looked immediately suspicious.

```
echo "ZXhmaWwua3JhbXB1cy5jc2QubG9s" | base64 -d
exfil.krampus.csd.lol
```

### Step 11: Check Exfil Subdomain

```bash

dig TXT exfil.krampus.csd.lol

```

<img width="1076" height="501" alt="image" src="https://github.com/user-attachments/assets/74950951-a350-4598-ae1d-c4c49c21c485" />

Result: `status=active; auth=dkim; selector=syndicate`\
Why: This pointed to DKIM authentication with a specific selector named "syndicate".

### Step 12: Check DKIM Record

```bash

dig TXT syndicate._domainkey.krampus.csd.lol

```

Result: DKIM key with `p=Y3Nke2RuN*************MU5ENF9XME5LeX0=`\
Why: DKIM public keys are stored in DNS. The `p=` parameter contains the public key, but here it was base64-encoded flag material.

----

```bash

echo "Y3Nke2RuNV9t************NF9XME5LeX0=" | base64 -d

```

<img width="880" height="155" alt="image" src="https://github.com/user-attachments/assets/d7532329-089a-4380-bde1-4fe3612436eb" />

```
csd{dn5_*******************}  
```

![DespicableMeMinionsGIF](https://github.com/user-attachments/assets/e076d927-d68b-4710-a938-1c680a3e8e5a)

---

### DNS Record Chaining

The challenge designer created a logical chain:

1.  SPF → points to infrastructure subdomain

2.  MX → mail infrastructure

3.  DMARC → points to forensic/ops

4.  TXT on ops → reveals SRV records

5.  SRV records → reveal specific service hosts

6.  TXT on beacon → base64 encoded pointer

7.  TXT on exfil → reveals DKIM selector

8.  DKIM TXT → contains base64 encoded flag

### Real-World Mimicry

This mimics how real attackers might:

-   Use SPF includes to obscure infrastructure

-   Bury clues in email authentication records (DMARC, DKIM)

-   Use SRV records to advertise internal services

-   Hide data in TXT records (common for C2 beacon configs)

-   Encode data in base64 within DNS to avoid parsing issues

