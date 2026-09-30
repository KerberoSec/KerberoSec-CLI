# Security Descriptors Meaning

Security descriptors for Task Scheduler service:

D:	Discretionary ACL (DACL)
S:	System Access Control List (SACL)

 
| ACE type | Meaning       |
|----------|---------------|
| A	       | AccessAllowed |

  
| ACE flags string | Meaning |
|------------------|---------|
| CC | SERVICE_QUERY_CONFIG Query the SCM for the service configuration |
| LC | SERVICE_QUERY_STATUS	Query the SCM the current status of the service |
| SW | SERVICE_ENUMERATE_DEPENDENTS	List dependent services |
| LO | SERVICE_INTERROGATE Query the service its current status |
| RC | READ_CONTROL Query the security descriptor of the service |
| RP | SERVICE_START Start the service |
| DT | SERVICE_PAUSE_CONTINUE Pause/Resume the service |
| CR | SERVICE_USER_DEFINED_CONTROL	|
| WD | WRITE_DAC Change the permissions of the service |
| WO | WRITE_OWNER Change the owner in the object’s security descriptor. |
| WP | SERVICE_STOP Stop the service |
| DC | SERVICE_CHANGE_CONFIG Change service configuration |
| SD | DELETE The right to delete the service |

For more information, check out ACE Strings and Service Security and Access Rights at Microsoft Docs website.

The last two characters after the ACE strings represent the security principal assigned with these permissions.

| Abbreviation | Security Principal |
|--------------|--------------------|
| AU | Authenticated Users |
| BA | Built-in administrators |
| SY | Local System |
| BU | Built-in users |
| WD | Everyone |

Let’s see what rights the “built-in administrators” group has, as per this SDDL.

D:
(A;;CCLCSWLORC;;;AU)
(A;;CCLCSWRPDTLOCRRCWDWO;;;BA)
(A;;CCDCLCSWRPWPDTLOCRSDRCWDWO;;;SY)
(A;;CCLCSWLORC;;;BU)
S:(AU;FA;CCDCLCSWRPWPDTLOCRSDRCWDWO;;;WD)

The built-in administrators (BA) group has the following rights:

| ACE flags string | Meaning |
|------------------|---------|
| CC | SERVICE_QUERY_CONFIG Query the SCM for the service configuration |
| LC | SERVICE_QUERY_STATUS Query the SCM the current status of the service |
| SW | SERVICE_ENUMERATE_DEPENDENTS List dependent services |
| LO | SERVICE_INTERROGATE Query the service its current status |
| RC | READ_CONTROL Query the security descriptor of the service |
| RP | SERVICE_START Start the service |
| DT | SERVICE_PAUSE_CONTINUE Pause/Resume the service |
| CR | SERVICE_USER_DEFINED_CONTROL  |
| WD | WRITE_DAC Change the permissions of the service |
| WO | WRITE_OWNER Change the ownership of the service |

As you can see, the BA group doesn’t have the permissions to stop (WP), change the service configuration (DC), or delete the service (SD).

Whereas the Local System account (SY) has full permissions:

(A;;CCDCLCSWRPWPDTLOCRSDRCWDWO;;;SY)

| ACE flags string | Meaning |
|------------------|---------|
| CC | SERVICE_QUERY_CONFIG Query the SCM for the service configuration |
| LC | SERVICE_QUERY_STATUS Query the SCM the current status of the service |
| SW | SERVICE_ENUMERATE_DEPENDENTS List dependent services |
| LO | SERVICE_INTERROGATE Query the service its current status |
| RC | READ_CONTROL Query the security descriptor of the service |
| RP | SERVICE_START Start the service |
| DT | SERVICE_PAUSE_CONTINUE Pause/Resume the service |
| CR | SERVICE_USER_DEFINED_CONTROL 
| WD | WRITE_DAC Change the permissions of the service |
| WO | WRITE_OWNER Change the ownership of the service |
| WP | SERVICE_STOP Stop the service |
| DC | SERVICE_CHANGE_CONFIG Change service configuration |
| SD | DELETE The right to delete the service |
