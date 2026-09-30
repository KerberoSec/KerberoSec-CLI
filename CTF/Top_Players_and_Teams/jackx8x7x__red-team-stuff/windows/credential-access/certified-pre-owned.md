# Certified Pre-Owned

## Overview

Whitepaper [Certified Pre-Owned: Abusing Active Directory Certificate Services](https://specterops.io/wp-content/uploads/sites/3/2022/06/Certified\_Pre-Owned.pdf) published by Will Schroeder and Lee Christensen from [SpectorOps](https://specterops.io/).

### Certificate Theft

<table><thead><tr><th width="179" align="center">Technique ID</th><th>Description</th></tr></thead><tbody><tr><td align="center">THEFT1</td><td>Exporting certificates and their private keys using Window’s Crypto APIs</td></tr><tr><td align="center">THEFT2</td><td>Extracting user certificates and private keys using DPAPI</td></tr><tr><td align="center">THEFT3</td><td>Extracting machine certificates and private keys using DPAPI</td></tr><tr><td align="center">THEFT4</td><td>Theft of existing certificates via file/directory triage</td></tr><tr><td align="center">THEFT5</td><td>Using the Kerberos PKINIT protocol to retrieve an account’s NTLM hash</td></tr></tbody></table>

### Privilege Escalation

<table><thead><tr><th width="175" align="center">Technique ID</th><th>Description</th></tr></thead><tbody><tr><td align="center">ESC1</td><td>Domain escalation via No Issuance Requirements + Enrollable Client Authentication/Smart Card Logon OID templates + CT_FLAG_ENROLLEE_SUPPLIES_SUBJECT</td></tr><tr><td align="center">ESC2</td><td>Domain escalation via No Issuance Requirements + Enrollable Any Purpose EKU or no EKU</td></tr><tr><td align="center">ESC3</td><td>Domain escalation via No Issuance Requirements + Certificate Request Agent EKU + no enrollment agent restrictions</td></tr><tr><td align="center">ESC4</td><td>Domain escalation via misconfigured certificate template access control</td></tr><tr><td align="center">ESC5</td><td>Domain escalation via vulnerable PKI AD Object Access Control</td></tr><tr><td align="center">ESC6</td><td>Domain escalation via the EDITF_ATTRIBUTESUBJECTALTNAME2 setting on CAs + No Manager Approval + Enrollable Client Authentication/Smart Card Logon OID templates</td></tr><tr><td align="center">ESC7</td><td>Vulnerable Certificate Authority Access Control</td></tr><tr><td align="center">ESC8</td><td>NTLM Relay to AD CS HTTP Endpoints</td></tr></tbody></table>

### Persistence

<table><thead><tr><th width="170" align="center">Technique ID</th><th>Description</th></tr></thead><tbody><tr><td align="center">PERSIST1</td><td>Account persistence via requests for new authentication certificates for a user</td></tr><tr><td align="center">PERSIST2</td><td>Account persistence via requests for new authentication certificates for a computer</td></tr><tr><td align="center">PERSIST3</td><td>Account persistence via renewal of authentication certificates for a user/computer</td></tr><tr><td align="center">DPERSIST1</td><td>Domain persistence via certificate forgery with stolen CA private keys</td></tr><tr><td align="center">DPERSIST2</td><td>Domain persistence via certificate forgery from maliciously added root/intermediate/NTAuth CA certificates</td></tr><tr><td align="center">DPERSIST3</td><td>Domain persistence via malicious misconfigurations that can later cause a domain escalation</td></tr></tbody></table>

## Certificate Theft

A form of credential theft where attackers leverage the stolen user/machine certificates to authenticate to AD.

## Malicious Certificate Enrollments

## Certificate Template Misconfiguration

## Certificate Forging

### Tools

Tool `ForgeCert`.

## Tools

{% tabs %}
{% tab title="Certify" %}
A tool provides a wide range of audit and AD CS functionalities.
{% endtab %}

{% tab title="Second Tab" %}

{% endtab %}
{% endtabs %}

## Labs

### HackTheBox

* [Escape](../../hackthebox/windows/escape.md)

### Red Teaming Experiments

{% embed url="https://www.ired.team/offensive-security-experiments/active-directory-kerberos-abuse/from-misconfigured-certificate-template-to-domain-admin" %}

## Reference
