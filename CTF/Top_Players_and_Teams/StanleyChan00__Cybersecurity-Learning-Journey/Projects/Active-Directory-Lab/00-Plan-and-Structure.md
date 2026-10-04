# Phase 0: Architecture 

## Allocations 

In this lab, I will be building a virtual Active Directory environment replicating a small business' office.

I'm currently using a 2016 15-inch Macbook Pro with a 2.6GHz Quad-Core Intel i7 with 16GB RAM. On top of this however, I will be using an external SSD, which will allow me to a bit more free in terms of disk space. 

Overall though, this lab will need to be kept small with my current set up.

Hence why I will be keeping this build limited to two machines. The planned specs for these 2 machines will look like this:

|Role             | OS                |CPUs|RAM|Dynamic Disk Size|
|:----------------|:------------------|:--:|:-:|:----------------:|
|Domain Controller|Windows Server 2022|2   |3GB|50GB              |
|Client Machine   |Windows 10         |2   |3GB|50GB              |

## Networking

### The Domain Controller

I plan to have 2 NICs on the DC. 

**NIC1**(We will name this "Internet"): This will connect to the NAT(Network Address Translation) on the VirtualBox, allowing the machine to have internet access through our host(The Macbook). 

VirtualBox's NAT engine acts like a virtual router for us, handing the DC a private IP through DHCP(See DHCP and other networking concepts I covered [here](../TryHackMe/Pre-Security/Module-2-Networking.md#tryhackme-pre-security---module-2-network-fundamentals)) automatically, and routing internet access with our host IP. 

**NIC2**(We will name this "Internal"): This will connect internally to form a little LAN with the client machine. We will set a static IP address here. There are a few ranges that we can pick from that don't collide with the public internet IPs.

However, for simplicity sake, we will just use `10.10.10.10`. We will use a standard /24 subnet mask for 1 network and the gateway will be left empty as the Gateway is itself, the DC.

After promotion to DC, the DNS server will be `127.0.0.1`, which is an IP that means it is pointing to itself as the DNS server. 

### The Client Machine

The client machine will only have 1 NIC and will connect internally. 

For more possibilities in phase 2, I want this client to have internet access. So it will not have a static IP but instead will use the DC as a sort of router.

To do this, we will have to install RRAS(Routing and Remote Access Service) on the DC which will essentially allow the DC to act as a router to the client machine, giving it access to internet ultimately coming from our Host. 

It will also connect via DHCP and we will define a scope from `10.10.10.50` - `10.10.10.200` for the potential of 150 usable IPs. 

Finally, both the Gateway and DNS will be pointing to the DC(10.10.10.10).

We will also be adding a DNS forwarder pointing to `8.8.8.8` on the DC so that the DC can handle any AD names and hand any external queries off to google to find the proper IP. 

All of this, in theory, should leave us with a fully functioning network. 

*I made a diagram using draw.io to visualize this network structure below. It will look like this:*

<img width="613" height="627" alt="AD-LAB drawio" src="https://github.com/user-attachments/assets/08208877-6f90-4fb7-9852-19065fb92d7c" />

## Active Directory Structure

Much of this will be more intuitive when I build the AD domain itself due to the visual nature of the GUI making it simple. I expect some things to be changed or altered once I get to the actual build and see all the default OUs and containers on screen.

However, I still want a small general framework planned beforehand. 

I will be naming this domain `circle.lab` and this lab will have 4 accounts.

* The built-in Domain Admin account: This will be the "emergency" admin account that is not used often
* The IT-Admin account: This will be the primary administrator account used for operations by the IT "staff" at this small office.
* 2 User/Staff accounts: These will be the regular user accounts operated by the common staff at the business.

In the future, I may practice writing up a PowerShell Script to automate the creation of 100+ users for more potential ticket varieties in phase 2. 

However for now, I will just be keeping it simple with these 2 user accounts.

The DC will just be named `DC` while the workstation will simply be called `WKS01`

We'll also have 2 simple security groups: `Admins` and `staff`. As for OUs, I think that is best to see when we get to the GUI.

(This was not in Phase 0 but during Phase 1, I added 2 file shares(Public and Staff) as well as a GPO that mapped those drives. I also edited the default GPO to have a lockout policy). 

