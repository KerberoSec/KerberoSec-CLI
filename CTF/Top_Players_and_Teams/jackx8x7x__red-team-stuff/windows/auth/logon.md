---
description: Stuff about logon process.
---

# Logon

## Types of Logon

The Authentication Services protocols provide authentication services for applications like:

* interactive applications, such as Winlogon, or
* distributed client and server applications, such as a web browser, web server, or a file client or a file server, or
* any other type of client and server application

through the following methods:

* Interactive Logon
  * Local Logon
  * Domain Logon/Smart Card Domain Logon
* Network

{% embed url="https://learn.microsoft.com/en-us/windows-server/security/windows-authentication/windows-logon-scenarios" %}

### Interactive Logon

The logon process begins either when a user enters credentials in the credentials entry dialog box, or when the user inserts a smart card into the smart card reader, or when the user interacts with a biometric device.

Users can perform an interactive logon by using _a local user account_ for local logon or _a domain account_ for domain logon by using the security account database on _the user's local computer_ or by using _the domain's directory service_.

* Local logon\
  Logon to a local account grants a user access to Windows resources on the local computer and requires that the user has a user account in the account database maintained by the _Security Account Manager (SAM)_ on the local computer.
* Domain Logon/Smart Card Domain Logon\
  A process that proves the identity of the user to the domain controller, implies eventual user access to local and domain resources, and requires that the user has a user account in an account database, such as Active Directory.

A user can interactively logon to a computer _locally_ or _remotely through_ Terminal Services.

{% embed url="https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-authsod/bfc67803-2c41-4fde-8519-adace79465f6" %}

### Network Logon

Used only after interactive logon authentication _has taken place_. During network logon, the process _does not_ use the credentials entry dialog boxes to collect data

{% embed url="https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-authsod/131b1590-0c21-46e1-96bf-995a7a2cc461" %}
Network Logon
{% endembed %}

## Domain Logon

### Kerberos

The domain logon authentication process first tries the [Kerberos Authentication Protocol](logon.md#kerberos) (\[MS-KILE]). If Kerberos fails, the authentication process falls back to the NTLM pass-through mechanism (\[MS-APDS]).

1. First, the client request the TGT from the KDC.
2. Client then requests the service ticket _for the domain-joined computer_.
3. Finally, Client submits the service ticket to verify the user logon information.

{% embed url="https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-authsod/2e9de599-e791-4b3d-bb0c-2ffbef5ee665" %}

### Packet Tracing

{% embed url="https://medium.com/@robert.broeckelmann/kerberos-wireshark-captures-a-windows-login-example-151fabf3375a" %}

{% embed url="https://wiki.wireshark.org/Kerberos" %}

## References

{% embed url="https://learn.microsoft.com/en-us/windows-server/security/windows-authentication/credentials-processes-in-windows-authentication" %}
Credentials Processes in Windows Authentication
{% endembed %}

{% embed url="https://www.ultimatewindowssecurity.com/securitylog/book/page.aspx?spid=chapter3" %}
www.ultimatewindowssecurity.com: Understanding Authentication and Logon
{% endembed %}
