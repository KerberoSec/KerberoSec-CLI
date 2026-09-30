# Golden Ticket Attack

## Overview

The Golden Ticket Attack abuses the `krbtgt` account's password hash to issue the Kerberos tickets as the KDC to access the resources.

After the adversary gets the account `krbtgt`'s password hash, it can

* create a valid Kerberos TGT for any user in the domain and
* _manipulate that user’s_ [_PAC_](../../auth/kerberos.md#privilege-attribute-certificate-pac) _to gain additional privileges._

## Tools

* Mimikatz
* Rubues
* Impacket
