# Host Discovery

## What is Host Discovery?

Host discovery is the process of identifying active devices on a network.

Attackers commonly perform host discovery before attempting enumeration or exploitation.

---

## Objectives

- Identify live hosts
- Map network assets
- Understand network structure

---

## Common Techniques

### ICMP Echo Request

Used to determine whether a host is reachable.

Example:

ping target_ip

---

### ARP Discovery

Used within local networks to identify active systems.

ARP requests are broadcast to discover MAC addresses.

---

## Security Impact

Host discovery provides attackers with a list of potential targets.
