---
type: resource-note
status: done
created: 2026-02-21
updated: 2026-03-12
tags: [security-writeup, tryhackme, hardware, systems]
source: TryHackMe: Inside a Computer System
platform: tryhackme
room: Inside a Computer System
slug: inside-a-computer-system
path: TryHackMe/00-foundations/inside-a-computer-system.md
topic: 00-foundations
domain: [foundations, hardware]
skills: [hardware-basics, memory-hierarchy, boot-process, firmware]
artifacts: [concept-notes, pattern-card]
sanitized: true
---

# Inside a Computer System

## Summary

* A computer system is a set of cooperating components (CPU, RAM, storage, I/O, networking, power) connected by the motherboard’s interconnect fabric.
* The CPU executes instructions, RAM holds “working set” data temporarily (volatile), and storage keeps data persistently (non-volatile).
* Firmware (UEFI/BIOS) performs early hardware initialization, runs POST, selects a boot target, and starts a bootloader.
* The bootloader loads the OS into RAM and hands off control; the OS then owns device drivers, scheduling, and user-facing services.
* Security implication: the boot chain is a trust boundary; firmware/boot stages are high-impact attack surfaces.

## Key Concepts

### 1.1 Core components and what they do

* Motherboard (mainboard / “the backplane”)

  * Role: mechanical + electrical “hub.” Provides sockets/slots/ports and the buses that let components talk.
  * Interfaces you’ll see: CPU socket, DIMM (RAM) slots, PCI Express (PCIe) expansion slots, SATA ports, M.2 slots, USB headers/ports, Ethernet, audio.

* CPU (Central Processing Unit)

  * Role: instruction execution engine. Runs the fetch: decode: execute cycle.
  * Practical idea: more cores/threads help parallel workloads; clock, cache, and memory latency matter for real performance.

* RAM (Random Access Memory)

  * Role: short-term “working memory.” Holds the data/code the CPU needs right now.
  * Property: volatile (power-off = data loss).
  * Typical tech today: DDR4/DDR5 are mainstream; newer generations exist as industry roadmaps and may not be common on consumer machines yet.

* Storage (SSD/HDD)

  * Role: long-term persistence for OS, apps, files.
  * HDD: moving parts → slower random access but large capacity/low cost.
  * SSD: flash memory → fast random access, better latency, usually lower power.

* PSU (Power Supply Unit)

  * Role: converts AC wall power to regulated DC rails and distributes via connectors.
  * Failure mode: inadequate wattage/poor quality can cause instability under load.

* GPU (Graphics Processing Unit)

  * Role: high-throughput parallel processor for graphics and (often) compute.
  * Connection: typically PCIe; outputs via HDMI/DisplayPort.

* Network Adapter (NIC)

  * Role: communication interface (wired Ethernet / Wi‑Fi). May be onboard or an add-in card.

* Input/Output (I/O) devices

  * Input examples: keyboard, mouse, microphone, camera.
  * Output examples: monitor, speakers, printer.
  * Common connectors: USB, HDMI, DisplayPort, audio.

### 1.2 Memory hierarchy: why RAM vs storage matters

Think “speed vs size vs persistence.”

* Registers/cache (inside/near CPU): smallest, fastest, volatile.
* RAM: larger, fast-ish, volatile.
* SSD/HDD: much larger, slower, persistent.

This hierarchy shapes both performance tuning (bottlenecks) and security work (what evidence exists where).

### 1.3 Firmware and boot: from power-on to OS

A practical mental model:

* Firmware (UEFI/BIOS) is the system’s pre-OS control plane.
* POST is a diagnostic/initialization stage.
* Boot order decides where to look for a boot program.
* Bootloader bridges firmware and OS.

Mermaid overview:

```mermaid
flowchart LR
  A[Power Button] --> B[PSU enables power rails]
  B --> C[Firmware (UEFI/BIOS) starts]
  C --> D[POST: basic hardware checks/init]
  D --> E[Select boot device (boot order)]
  E --> F[Start bootloader]
  F --> G[Load OS kernel + initramfs into RAM]
  G --> H[Hand off control to OS]
  H --> I[OS loads drivers/services, login/UI]
```

## Pattern Cards

### 2.1 “Component ↔ Interface” mapping card

* CPU ↔ CPU socket (motherboard)
* RAM ↔ DIMM slots
* GPU/NIC/other expansion ↔ PCIe slots
* SSD/HDD ↔ SATA ports or M.2 (PCIe/NVMe)
* I/O ↔ USB/HDMI/DP/audio ports
* Power ↔ ATX 24-pin + CPU EPS + PCIe power (as needed)

Use case: when diagnosing a system or threat scenario, always tie a component to the physical/logical interface it depends on.

### 2.2 Volatile vs non-volatile evidence card

* Volatile (RAM): running processes, in-memory secrets, ephemeral network states.
* Non-volatile (SSD/HDD/NVRAM): files, logs, configs, boot entries, firmware variables.

Use case (DFIR mindset): “live response” targets RAM; “post-mortem forensics” targets disks and firmware state.

### 2.3 Boot chain trust boundary card

* Firmware stage controls the earliest code execution.
* Bootloader decides what OS kernel gets loaded.
* OS enforces userland security only after it gains control.

Security note: attacks before the OS (firmware/bootkits) can persist and evade many endpoint defenses.

### 2.4 Common failure symptoms card (ops-oriented)

* No power / no fans: PSU/cabling/front-panel switch.
* Powers on then shuts off: PSU overload, short, CPU cooler, RAM seating.
* Beep codes / no display: RAM/GPU/firmware issues.
* Slow boot / high disk activity: storage bottleneck, failing HDD, OS startup load.

## Command Cookbook

### 3.1 Linux quick inventory

```bash
# CPU
lscpu

# Memory
free -h

# Storage
lsblk -o NAME,SIZE,TYPE,FSTYPE,MOUNTPOINT

# PCI/USB devices
lspci -nn
lsusb

# Firmware / boot mode (UEFI vs legacy)
[ -d /sys/firmware/efi ] && echo "UEFI mode" || echo "Legacy/CSM mode"

# BIOS/UEFI info (may require root)
sudo dmidecode -t bios

# Boot logs
journalctl -b --no-pager | head
```

### 3.2 Windows quick inventory (PowerShell)

```powershell
# System overview
Get-ComputerInfo | Select-Object OSName,OSVersion,WindowsProductName,CsSystemType

# CPU
Get-CimInstance Win32_Processor | Select-Object Name,NumberOfCores,NumberOfLogicalProcessors,MaxClockSpeed

# RAM
Get-CimInstance Win32_PhysicalMemory | Select-Object Manufacturer,Capacity,Speed

# Disks
Get-Disk | Select-Object Number,FriendlyName,Size,BusType,HealthStatus

# Network adapters
Get-NetAdapter | Select-Object Name,Status,LinkSpeed,MacAddress

# Boot configuration (advanced)
bcdedit
```

### 3.3 Operational tip

If you need to check boot order or Secure Boot state, use the OS tools first (Windows “System Information”, Linux `mokutil --sb-state` where available) before changing firmware settings. Avoid random toggling in firmware menus.

## Evidence

* `assets/inside-computer-components.png`

  * Human-body analogy diagram mapping motherboard/CPU/RAM/PSU/GPU/storage.
* `assets/boot-sequence.png`

  * Boot sequence flow: Power → Firmware → POST → Boot device → Bootloader.

(If you publish this note publicly, ensure images contain no personal identifiers and are either self-made or permitted for reuse.)

## Takeaways

* Systems thinking: always reason in layers (power → firmware → hardware init → bootloader → OS → userland).
* Performance thinking: the memory hierarchy explains why “more RAM” can fix thrashing and why SSDs improve responsiveness.
* Security thinking: earlier layers have higher leverage. Firmware and boot are where “root of trust” concepts start.

## References

* UEFI Specification (UEFI Forum): Boot Manager and general firmware/OS interface.
* POST (Power‑On Self Test) definitions: firmware pre-boot diagnostics.
* Vendor platform documentation (OEM manuals/whitepapers) for boot device behavior.
* TryHackMe: Pre Security / Computer Fundamentals learning path context.

## CN: EN Glossary (mini)

* Motherboard: 主板
* CPU (Central Processing Unit): 中央处理器
* RAM (Random Access Memory): 随机存取存储器 / 内存
* SSD (Solid-State Drive): 固态硬盘
* HDD (Hard Disk Drive): 机械硬盘
* PSU (Power Supply Unit): 电源供应器
* GPU (Graphics Processing Unit): 图形处理器
* NIC (Network Interface Card): 网卡
* Firmware: 固件
* UEFI (Unified Extensible Firmware Interface): 统一可扩展固件接口
* BIOS (Basic Input/Output System): 基本输入输出系统
* POST (Power-On Self Test): 上电自检
* Boot order: 启动顺序
* Bootloader: 引导加载程序
* Volatile memory: 易失性存储
* Non-volatile memory: 非易失性存储
* NVRAM: 非易失性随机存取存储器
* Secure Boot: 安全启动
