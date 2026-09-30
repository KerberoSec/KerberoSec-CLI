# 01: Discovery

## Purpose

Find the target system in the authorized local VulnHub network.

## Command

```bash
ip a
nmap -sn <LOCAL_SUBNET>
netdiscover -r <LOCAL_SUBNET>
```

## Parameters

`-sn` performs host discovery without port scanning. `-r` defines the netdiscover range.

## Finding

Local README drafts verify the target IP as `10.158.174.179`. Raw MAC or home-network details are not published.

*[Image: Target overview]*

## Analysis

After the IP was known, service exposure was reviewed.

## Defense

Firewall and IDS logs may show host discovery behavior in a short time window.