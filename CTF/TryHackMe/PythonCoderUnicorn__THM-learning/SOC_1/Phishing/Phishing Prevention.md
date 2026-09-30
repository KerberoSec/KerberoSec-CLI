https://tryhackme.com/room/phishingemails4gkxh

## actions to defend against phishing

actions are listed below:

- Email Security (SPF, DKIM, DMARC)
- SPAM Filters (flags or blocks incoming emails based on reputation)
- Email Labels (alert users that an incoming email is from an outside source)
- Email Address/Domain/URL Blocking (based on reputation or explicit denylist)
- Attachment Blocking (based on the extension of the attachment)
- Attachment Sandboxing (detonating email attachments in a sandbox environment to detect malicious activity)
- Security Awareness Training (internal phishing campaigns)

https://attack.mitre.org/techniques/T1598#mitigations

## (SPF) sender policy framework

_used to authenticate the sender of an email._
with sender authenticated the ISP verifies the mail server is authorized to send email for specific domain

SPF record is a DNS txt that has list of IP addresses which are allowed to send email

`v=spf1 ip4:127.0.0.1 include:_spf.google.com -all`
- spf1 SPF record
- ip4  specifies IP
- include specifies which domain can send email
- `all` is for rejected non-authorized emails

https://dmarcian.com/spf-syntax-table/

## (DKIM) domain keys identified mail

_used for the authentication of an email that’s being sent._

DKIM record exists in the DNS, can survive forwarding (better than SPF) 

```
v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxTQIC7vZAHHZ7WVv/5x/qH1RAgMQI+y6Xtsn73rWOgeBQjHKbmIEIlgrebyWWFCXjmzIP0NYJrGehenmPWK5bF/TRDstbM8uVQCUWpoRAHzuhIxPSYW6k/w2+HdCECF2gnGmmw1cT6nHjfCyKGsM0On0HDvxP8I5YQIIlzNigP32n1hVnQP+UuInj0wLIdOBIWkHdnFewzGK2+qjF2wmEjx+vqHDnxdUTay5DfTGaqgA9AKjgXNjLEbKlEWvy0tj7UzQRHd24a5+2x/R4Pc7PF/y6OxAwYBZnEPO0sJwio4uqL9CYZcvaHGCLOIMwQmNTPMKGC9nt3PSjujfHUBX3wIDAQAB
```

- version DKIM1 (optional)
- key = RSA 
- p = public key 

https://dmarcian.com/dkim-selectors/

## DMARC

domain based message authentication reporting and conformance

uses SPF + DMARC to the content of an email

```
v=DMARC1; p=quarantine; rua=mailto:postmaster@website.com
```

- version DMARC1
- policy
- rua indicates where the data should be sent

reports are in XML
https://dmarcian.com/what-is-a-dmarc-record/

https://margheritaviola.com/2023/01/14/tryhackme-phishing-emails-4-room-phishing-prevention-writeup/