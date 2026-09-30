# Credential

## Account Database

An account database maintains the [security principals](overview.md#security-principal) and necessary information for authentication and other purposes.

* an [Active Directory](https://learn.microsoft.com/en-us/openspecs/windows\_protocols/ms-authsod/64781df1-ee20-413e-b8c5-6511c90dbc30#gt\_e467d927-17bf-49c9-98d1-96ddf61ddd90) database maintains the domain security principals, whereas
* the [security account manager (SAM) built-in database](https://learn.microsoft.com/en-us/openspecs/windows\_protocols/ms-authsod/64781df1-ee20-413e-b8c5-6511c90dbc30#gt\_6bb6ffcf-2a22-4989-89ef-6c9937f91b8b) maintains local security principals

### NTDS.dit

File `C:\Windows\NTDS\ntds.dit` is used by AD DS to store [directory data](../ad/adds/#data-store).

{% embed url="https://wiki.wireshark.org/Kerberos" %}
