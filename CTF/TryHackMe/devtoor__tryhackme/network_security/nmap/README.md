# Nmap

[Nmap Module](https://tryhackme.com/module/nmap)

Learn how to leverage the Nmap network scanner to discover live hosts and open ports using basic and advanced scan options.

[Nmap Room](https://tryhackme.com/room/furthernmap)

An in depth look at scanning with Nmap, a powerful network scanning tool.

---

In this module, we will learn how to utilise the Nmap scanner to discover live hosts and scan them for open ports. You will gain a deep knowledge of the various Nmap port scans, from TCP connect and stealth (SYN) port scans to null, FIN, Xmas and idle host (zombie) port scans. We will explore in detail the advanced options, including packet fragmentation, source address spoofing, and decoys. We will learn to use OS and service detection and how to leverage the power of Nmap scripts. Finally, we demonstrate the different ways to save Nmap scan results for future reference.

1. [Nmap Live Host Discovery](1_nmap_live_host_discovery.md)
2. [Nmap Basic Port Scans](2_nmap_basic_port_scans.md)
3. [Nmap Advanced Port Scans](3_nmap_advanced_port_scans.md)
4. [Nmap Post Port Scans](4_nmap_post_port_scans.md)

## Searching for Scripts

[Nmap NSE doc](https://nmap.org/nsedoc/)

```bash
grep <srv|cat> /usr/share/nmap/scripts/script.db
```

```bash
ls -l /usr/share/nmap/scripts/<srv>*
```

## Installing New Scripts

```bash
sudo apt update && sudo apt install nmap
```

```bash
sudo wget -O /usr/share/nmap/scripts/<script-name>.nse https://svn.nmap.org/nmap/scripts/<script-name>.nse

nmap --script-updatedb
```
