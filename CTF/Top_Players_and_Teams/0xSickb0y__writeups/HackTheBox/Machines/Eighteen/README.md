# Eighteen 
 
> http://app.hackthebox.com/machines/Eighteen
 
<img width="1006" height="362" alt="capa" src="https://github.com/user-attachments/assets/3858943e-1bac-421e-ba1b-44248649fd12" />

## Table of Contents
 
* [About](#about)
* [References](#references)
* [Reconnaissance](#reconnaissance)
* [MS-SQL Service](#ms-sql-service)
* [Initial Access](#initial-access)
* [BadSuccessor](#badsuccessor)
* [Privilege Escalation](#privilege-escalation)
* [Conclusion](#conclusion)
 
## About
 
As is common in real life Windows penetration tests, you will start the Eighteen box with credentials for the following account: kevin / iNa2we6haRj2gaw!
 
## References
 
- [PowerMad: Github](https://github.com/Kevin-Robertson/Powermad)
- [HackViser MS-SQL guide](https://hackviser.com/tactics/pentesting/services/mssql)
- [SharpSuccessor: GitHub](https://github.com/logangoins/SharpSuccessor)
- [ibaiC: BadSuccessor PoC](https://github.com/ibaiC/BadSuccessor)
- [System Functions for T-SQL](https://learn.microsoft.com/en-us/sql/relational-databases/system-functions/system-functions-category-transact-sql?view=sql-server-ver17)
- [Security Functions for T-SQL](https://learn.microsoft.com/en-us/sql/t-sql/functions/security-functions-transact-sql?view=sql-server-ver17)
- [NetExec module: BadSucessor](https://github.com/Pennyw0rth/NetExec/blob/main/nxc/modules/badsuccessor.py)
- [Akamai Research: BadSuccessor](https://www.akamai.com/blog/security-research/abusing-dmsa-for-privilege-escalation-in-active-directory)
- [0xAs1F: BadSuccessor Manual Steps](https://github.com/0xAs1F/BadSuccessorScript/blob/main/ManualSteps.md)
- [BadSuccessor Deep Dive: The Weekly Purple Team](https://www.youtube.com/watch?v=IWP-8IMzQU8)
- [forestall.io: Abusing dMSA: The BadSuccessor Vulnerability](https://forestall.io/blog/en/active-directory/privilege-escalation-by-abusing-dmsa-the-badsuccessor-vulnerability)
 
## Reconnaissance
 
Nmap port scanning revealed 3 open TCP ports: 80 (__HTTP IIS server 10.0__), 1433 (__MS-SQL Server 2022__), and 5985 (__WinRM: HTTPAPI__). The scan also showed that the target is a Domain Controller, even though the common ports associated with Domain Controllers were not publicly exposed.
 
- NetBIOS domain name: __EIGHTEEN__
- NetBIOS computer name: __DC01__
- DNS domain name: __eighteen.htb__
- DNS computer name: __DC01.eighteen.htb__
 
The clock skew was reported as 6h58m05s. To avoid issues caused by time desynchronization, the system clock was adjusted to match the target’s time.
 
<img width="1894" height="966" alt="0" src="https://github.com/user-attachments/assets/37dc4de1-9832-4753-8647-1494cad7ca6c" />

<br>
 
The website hosted on the machine presented itself as a _financial planner_: a dashboard where users can manage their finances and calculate spending and income. Analyzing the website with BurpSuite, I could see its routes and functionality, but since it revealed nothing useful, I assumed it was just the front-end for the service I needed to exploit. 

<img width="1920" height="938" alt="1" src="https://github.com/user-attachments/assets/c20d1f98-1a3f-4af2-a2f1-abb615e0bb5d" />
<img width="1920" height="1059" alt="2" src="https://github.com/user-attachments/assets/c12ada64-b794-4cca-b1e6-67c13ad5f4a5" />

## MS-SQL Service
 
The box description provided credentials, which were used with __impacket-mssqlclient__ to connect to the MS-SQL service.
 
<img width="1900" height="566" alt="3" src="https://github.com/user-attachments/assets/b4d3eac9-7592-49e1-bcbf-09e490af8cde" />
 
`enum_impersonate` (from __impacket-mssqlclient__) is a function that queries the database to identify which logins the current user can impersonate. The `IMPERSONATE` permission allows a user to execute commands as another user, using their privileges for a short time.
 
The `EXECUTE AS LOGIN` statement is a T-SQL command that allows a user to switch their security context to another login. After executing this command:
 
- All subsequent queries will run with the permissions of __appdev__
- We inherit any database access, roles, and permissions that __appdev__ has
 
Now with __appdev__'s permissions I could access the financial planner database and list its tables and data structure:
 
```sql
SQL (kevin  guest@master)> EXECUTE AS LOGIN = 'appdev';
SQL (appdev  appdev@financial_planner)> USE financial_planner;
SQL (appdev  appdev@financial_planner)> SELECT name FROM sys.tables ORDER BY name;
 
name          
-----------   
allocations   
analytics     
expenses      
incomes       
users         
visits
 
SQL (appdev  appdev@financial_planner)> SELECT COLUMN_NAME, DATA_TYPE FROM financial_planner.information_schema.columns WHERE table_name = 'users';
 
column_name     DATA_TYPE   
-------------   ---------   
id              int         
full_name       nvarchar    
username        nvarchar    
email           nvarchar    
password_hash   nvarchar    
is_admin        bit         
created_at      datetime 
```
 
Listing the `users` table reveals a single entry for the __admin__ user, with information that could potentially be leveraged to gain access to the website or other services in case of password reuse.
 
<img width="1892" height="390" alt="4" src="https://github.com/user-attachments/assets/b4cf8365-f2f5-4dd5-8c4d-75887264f9ac" />
 
## Initial Access
 
The admin hash has to be in either of the two formats to work with hashcat:
 
```
pbkdf2_sha256$600000$AMtzteQIG7yAbZIa$BnOtkKC0r7GdZiM28Pzjqe3Qt7GRk3F74ozk1myIcTM=
pbkdf2_sha256:600000:AMtzteQIG7yAbZIa:0673ad90a0b4afb19d662336f0fce3a9edd0b7b19193717be28ce4d66c887133
```
Using hashcat with module 10000 (Django (PBKDF2-SHA256) | Framework) and rockyou.txt, the hash was cracked, revealing the password to be `iloveyou1`.
 
<img width="1001" height="203" alt="5" src="https://github.com/user-attachments/assets/f957c71e-d038-4be3-95eb-8c9d1cbfadfb" />
 
With the obtained credentials, I could log in to the financial planner dashboard and access the admin panel.
 
<img width="1918" height="915" alt="6" src="https://github.com/user-attachments/assets/995a997f-2151-465d-9647-4c184fad0739" />
 
There was no useful information there, so the next step was to enumerate users via RID brute forcing for a password spray attack.
 
<img width="1899" height="882" alt="7" src="https://github.com/user-attachments/assets/bdc89876-6841-4b19-8224-e164e9cda643" />
 
## BadSuccessor
 
From the NXC output we can see that the OS version of the Domain Controller is __Windows 11 / Server 2025 Build 26100__, which is one of the conditions for the intended privilege escalation for this machine: the _BadSuccessor_ attack.
 
From the [Akamai Research](https://www.akamai.com/blog/security-research/abusing-dmsa-for-privilege-escalation-in-active-directory):
 
_"In Windows Server 2025, Microsoft introduced delegated Managed Service Accounts (dMSAs). A dMSA is a new type of service account in Active Directory (AD) that expands on the capabilities of [group Managed Service Accounts](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/group-managed-service-accounts/group-managed-service-accounts/group-managed-service-accounts-overview) (gMSAs). One key feature of dMSAs is the ability to migrate existing nonmanaged service accounts by seamlessly converting them into dMSAs._
 
_By abusing dMSAs, __attackers can take over any principal in the domain.__ All an attacker needs to perform this attack is a benign permission on any organizational unit (OU) in the domain_
 
_A dMSA is typically created to replace an existing legacy service account. To enable a seamless transition, a dMSA can “inherit” the permissions of the legacy account by performing a migration process. This migration flow tightly couples the dMSA to the superseded account; that is, the original account they’re meant to replace._
 
_An interesting aspect of dMSA Kerberos authentication involves its Privilege Attribute Certificate (PAC). When authenticating, Kerberos embeds a PAC into tickets: a structure that services use to determine a client’s access level. In a standard Ticket Granting Ticket (TGT), the PAC includes the SIDs of the users and of all the groups they are a part of._
 
_However, when logging in with a dMSA, we observed something unexpected. The PAC included not only the dMSAs SID, but also the SIDs of the superseded service account and of all its associated groups._
 
_After migration, the KDC grants the dMSA all the permissions of the original (superseded) account. [...] This interesting behavior of PAC inheritance seems to be controlled by a single attribute: msDS-ManagedAccountPrecededByLink._
 
_The KDC relies on this attribute to determine who the dMSA is “replacing”: when a dMSA authenticates, the PAC is built based solely on this link._
 
The second condition for exploiting the vulnerability is that at least one of the following requirements must be met:
 
- If an unprivileged user has “CreateAny” (permission to create any object), “CreateDMSA” (permission to create DMSA object) or “GenericAll”, “WriteDACL”, “WriteOwner” or “Owner” permissions that allow direct or indirect modification of the object on “Container” and “Organizational Unit” objects.
    
- If an unprivileged user has write access to the “msDS-ManagedAccountPrecededByLink” and “msDS-DelegatedMSAState” attributes of a previously created dMSA object, or holds broader privileges that include such access, such as “GenericWrite,” “GenericAll,” “WriteDACL,” “WriteOwner,” or “Owner”.
 
We can use the [Akamai Github Repository](https://github.com/akamai/BadSuccessor) PowerShell Script or the [NetExec Module](https://github.com/Pennyw0rth/NetExec/blob/main/nxc/modules/badsuccessor.py) to identify if those conditions are met on the system.
 
> __Get-BadSuccessorOUPermissions.ps1__: This PowerShell script helps defenders identify which identities have permissions to create dMSAs in their domain, and which OUs are affected: highlighting where the BadSuccessor attack could be executed.
 
<img width="1679" height="489" alt="8" src="https://github.com/user-attachments/assets/8e9e5d8c-8f7c-4bd4-8045-9d224001d6d1" />
 
From the script output we can see that the group `EIGHTEEN\IT` has permissions to create __dMSA__ objects in the domain (affects: __OU=Staff,DC=eighteen,DC=htb__), and `adam.scott` is part of that group.
 
We can list the organizational unit's ACLs in the domain and verify that `adam.scott` has rights to __Create all child objects__ under the `STAFF` OU.
 
```powershell
Import-Module ActiveDirectory
set-location AD:
$OUAcl = (Get-Acl 'OU=STAFF,DC=eighteen,DC=htb').Access
$OUAcl
```

<img width="953" height="221" alt="9" src="https://github.com/user-attachments/assets/190d360c-ac62-40dd-8d7f-0497b9025c5a" />
 
## Privilege Escalation
 
First, I needed to establish a _tunnel_ between the attacking machine and the target. To do this, I used _[chisel](https://github.com/jpillora/chisel): (A Fast TCP/UDP tunnel over HTTP)_ and set proxychains to use `socks5 127.0.0.1:1080` (while commenting out the TOR setting).
 
<img width="1891" height="548" alt="10" src="https://github.com/user-attachments/assets/0e51ff3f-398d-4029-9d5d-08894428e73b" />
 
I then used [this PoC](https://github.com/ibaiC/BadSuccessor) to exploit the BadSuccessor vulnerability. The program creates a malicious dMSA object in the Staff OU and sets the `msDS-ManagedAccountPrecededByLink` attribute to point to the `Administrator` account:
 
```powershell
.\BadSuccessor.exe escalate `
    -targetOU "OU=Staff,DC=eighteen,DC=htb" `
    -dmsa "sickb0y" `
    -targetUser "CN=Administrator,CN=Users,DC=eighteen,DC=htb" `
    -dnshostname "sickb0y" `
    -user "adam.scott"
```
 
> __NOTE:__ The same can be achieved with _[manual steps](https://github.com/0xAs1F/BadSuccessorScript/blob/main/ManualSteps.md)_ and [Rubeus](https://github.com/GhostPack/Rubeus).
 
The exploit works by abusing how the KDC builds PACs for dMSA authentication. When the dMSA authenticates, the KDC checks the `msDS-ManagedAccountPrecededByLink` attribute and includes the SIDs from the linked account (Administrator) in the dMSA's PAC. This means when authenticating as the dMSA, I inherited all of Administrator's group memberships and privileges.
 
After creating the dMSA object with the manipulated attribute, I used _impacket-getST_ to authenticate as the dMSA and request a service ticket. Because the PAC now contained the Administrator's SID, the resulting ticket had full Administrator privileges. This also returned the __NTLM hash__ for the `Administrator` account. With that hash, I was able to log in to the machine and retrieve the root flag, completing the challenge.
 
<img width="1901" height="941" alt="11" src="https://github.com/user-attachments/assets/1c7c13f9-04c2-4207-bf38-f46a54da67f3" />
<img width="1349" height="286" alt="12" src="https://github.com/user-attachments/assets/3d502662-1799-4a09-b899-0f42766a01c0" />

 
## Conclusion

The Eighteen machine demonstrated a complex Active Directory attack path leveraging a novel vulnerability in Windows Server 2025. The key lessons learned from this machine included:
 
- **MS-SQL impersonation enabled database access**: The ____IMPERSONATE____ permission on the MS-SQL service allowed escalation to the `appdev` login, exposing sensitive user credentials
 
- **Weak password hashing remained exploitable**: Django's PBKDF2-SHA256 hashes, while stronger than MD5, can still be cracked using standard wordlists when passwords are weak
 
- **BadSuccessor vulnerability provided domain takeover**: The newly introduced dMSA feature in Windows Server 2025 contained a critical flaw allowing privilege escalation to Domain Administrator through PAC inheritance manipulation
 
- **Organizational unit permissions were overly permissive**: The `EIGHTEEN\IT` group having CreateChild permissions on the Staff OU enabled the creation of malicious dMSA objects that could impersonate any domain principal
