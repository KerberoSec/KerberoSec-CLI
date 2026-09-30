# Active Directory Home Lab 

Hello!

Here, you will find documentation of the Active Directory environment home lab that I built in VirtualBox. It simulates a small office domain with 2 machines. 

To build this lab, I followed a 3 phase plan. 

1) *[Phase 0: Planning](00-Plan-and-Structure.md):* The first step was planning out the network, structure, and domain.
2) *[Phase 1: The Build](01-Build.md):* The second step was actually building and standing that environment up while troubleshooting any issues that arose.
3) *[Phase 2: IT Support Tickets](02-IT-Support-Tickets.md):* Finally I acted as a Help Desk Technician, working tickets that I created and resolved in ServiceNow. 

## Phase 0: Planning
This is where I planned out the build and resource allocations for the two machines while leaving room for any adjustments that may need to occur once I got into building it. 

**Two Machines:**

* DC running Windows Server 2022.
* Client Machine running Windows 10 Pro.

**Planned Network Layout:**
* Dual-NIC DC (NAT for internet, internal LAN at `10.10.10.10`)
* Client on internal network only, obtaining an IP from the DC via DHCP(DHCP Scope of `10.10.10.50`-`10.10.10.200`)
* DC running RRAS so the client can have access to the internet through the DC
* Standard Subnet Mask for 1 network
* DNS Forwarder of `8.8.8.8`
  
**AD Domain structure:**
* `circle.lab` as the planned domain name.
* 2 security groups(Staff and Admins).
* 2 Staff accounts and 1 IT-Admin account.
* 2 file shares(Public and Staff) with proper share rights and NTFS permission levels. 
* Mapped drive GPO + altered default GPO to have a lockout policy

## Phase 1: The Build

Since most of the hard work was done in phase 0, phase 1 went smoothly and according to plan as described above.

On top of the plan in phase 1, I also enabled the recycle bin for potential tickets in phase 2 and installed 2 RSAT utilities on the client machine so that the IT-Admin account could work on the workstation instead of the DC.

I also encountered an issue where I was not able to login to the DC using the IT-Admin account. I realized it was because although I created an Admin group and added the IT-Admin user into it, I never actually added that account into the built-in domain admins group.

After doing so, I fixed the issue and was able to login.

## Phase 2: IT Support Tickets

In this phase, I worked through tickets using a ServiceNow PDI as the ticketing system.

The tickets are as follows:

1) **Account Locked Out:** User has been locked out of their account after inputting too many invalid passwords.
2) **Onboard a New Staff Member:** A new hire has entered the office. They require an account setup as well as access to the shared drives.
3) **Can't Access Shared Drives:** A staff member is getting a message that he does not have permission to access the shared drives.
4) **Restore a Deleted User:** A user's account was deleted and needs to have their account restored so they return to work. 

You can find all the final ServiceNow tickets in the markdown file [here](02-IT-Support-Tickets.md).
