# New-VulnhubVM

Port of https://github.com/0xBEN/Proxmox-Lab-Scripts/blob/master/New-VulnhubVM.ps1 to Python

The objective is to spin up a CTF lab quickly by pointing at a URL and providing some ProxMox settings.

# Installation

On the Proxmox node, run the following commands as root.

```
git clone https://github.com/CleverNamesTaken/New-VulnhubVM/
cd New-VulnhubVM
apt install python3-venv unar -y
python3 -m venv venv_newVulnHub
./venv_newVulnHub/bin/pip3 install patool requests argparse
```

# Usage

```
usage: New-VulnhubVM.py [-h] -u URL -s STORAGE [-i ID] -n NETWORK

options:
  -h, --help            show this help message and exit
  -u URL, --url URL     URL to Vulnhub machine to download.
  -s STORAGE, --storage STORAGE
                        Proxmox storage volume. Run 'pvesm status' if you are
                        unsure.
  -i ID, --id ID        VMID to use for newly created VM.
  -n NETWORK, --network NETWORK
                        VM network interface from 'pvesh ls
                        /cluster/sdn/vnets'.
```

`./New-VulnhubVM.py -s external -n vulnhub2 -u 'https://download.vulnhub.com/jangow/jangow-01-1.0.1.ova'`

The URL expects to be pointing at a vmdk, or some sort of archive file.  The script has been successful in building VMs that are contained with ova, rar, zip and tar.gz files.

The storage location is the name of the Proxmox data storage.

The id is the VMID for the machine.  Unless otherwise specified, the script will find available VMIDs starting at 400 and arbitrarily stopped at 654.  This is an artificial constraint, but represents an entire /24 filled with vulnerable VMs.

The network is the VLAN for the network interface.  It should have DHCP enabled.  This is honestly one of the more painful parts of this process.

# Vulnhub URLS that have been tested

`proxmox_compatible.txt` contains a list of urls that worked the first time without additional configuration.

`proxmox_network_problems.txt` contains a list of urls that built correctly, but needed to have the interface name changed by modifying the boot configuration as outlined here https://benheater.com/proxmox-vulnhub-vm-network-interface-issue/

`painful.txt` contains a list of urls that need additional work, and the error message or blocker.

# Preparing your VLAN

Followed this guide: https://pve.proxmox.com/wiki/Setup_Simple_Zone_With_SNAT_and_DHCP

Other VLANs with a DHCP server could also probably work, but they have not yet been tested.
