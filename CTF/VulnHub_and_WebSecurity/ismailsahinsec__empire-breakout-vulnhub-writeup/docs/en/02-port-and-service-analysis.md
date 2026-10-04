# 02: Port and Service Analysis

## Purpose

Confirm reachable services and prioritize enumeration.

## Command

```bash
curl -I http://10.158.174.179
curl -I http://10.158.174.179:10000
curl -I http://10.158.174.179:20000
```

## Parameters

`-I` requests headers only and quickly confirms service availability.

## Finding

The local drafts verify HTTP, SMB and panel checks on `10000` / `20000`. Full nmap output was not found.

## Analysis

HTTP alone did not provide access; management panels became important for credential validation.

## Defense

Firewall logs, web access logs and panel logs may show these requests.