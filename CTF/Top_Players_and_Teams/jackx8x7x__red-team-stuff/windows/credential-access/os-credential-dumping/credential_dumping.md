# DCsync Attack

## Overview

Attack uses account with **Replicating Directory Changes All** and **Replicating Directory Changes** privileges with The Directory Replication Service (DRS) Remote Protocol to simulate the behavior of a domain controller (DC) and retrieve password data via [domain replication](../../ad/adds/#replication).

The attacker can conduct a Golden Ticket attack after it gets the [KRBTGT](../../ad/kdc.md#account-krbtgt) hash.

[Netwrix Blog: What Is DCSync Attack?](https://blog.netwrix.com/2021/11/30/what-is-dcsync-an-introduction/)

{% embed url="https://www.netwrix.com/privilege_escalation_using_mimikatz_dcsync.html" %}

## Privileged Accounts

* Members of the Administrators, Domain Admins, Enterprise Admins and Domain Controllers groups have the required privileges by default, and
* it is possible for any user to be granted these privileges.
* In addition, some applications: such as Azure Active Directory Connect: have legitimate need for replication permissions so their service accounts can therefore also be targeted.

## Tools

{% tabs %}
{% tab title="Impacket" %}

{% endtab %}

{% tab title="Rubeus" %}

{% endtab %}

{% tab title="Mimikatz" %}

{% endtab %}
{% endtabs %}

## Detection/Response

Monitor replication activities between a domain controller and a machine _that is not a domain controller_.

Provides blocking policies that can prevent an account or workstation from executing additional replication

## Related HackTheBox machines

* [Forest](../../../hackthebox/windows/forest.md)
