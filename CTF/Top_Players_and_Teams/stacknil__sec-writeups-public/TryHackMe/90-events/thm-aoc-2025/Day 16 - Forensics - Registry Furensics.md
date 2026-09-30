---
type: resource-note
status: done
created: 2026-03-11
updated: 2026-03-12
tags: [security-writeup, tryhackme, aoc2025, registry-forensics]
source: TryHackMe: Advent of Cyber 2025 Day 16
platform: tryhackme
room: Advent of Cyber 2025 Day 16: Forensics: Registry Furensics
slug: aoc-2025-day-16-forensics-registry-furensics
path: TryHackMe/90-events/thm-aoc-2025/Day 16: Forensics: Registry Furensics.md
topic: 90-events
domain: [forensics]
skills: [registry, triage]
artifacts: [lab-notes]
sanitized: true
---

# Advent of Cyber 2025 Day 16: Forensics: Registry Furensics

## Summary

Windows Registry is a hierarchical configuration database (keys/values) backing OS + user settings. In DFIR, registry artifacts help answer **what changed**, **what executed**, **what persisted**, and **who did it**: often when file system traces are partial.

This note focuses on:

* Registry *hives* vs *root keys*
* Offline analysis with **Registry Explorer**
* A practical pivot workflow to identify **install → execution → persistence**

---

## Key Concepts

### 1) Hives vs Root Keys

* **Hive (file on disk)**: binary data store (e.g., `SYSTEM`, `SOFTWARE`, `NTUSER.DAT`).
* **Root key (logical view)**: what Registry Editor shows (e.g., `HKLM`, `HKCU`).

**Mapping (high-signal subset):**

```text
Disk Hive  → Registry View
SYSTEM     → HKLM\SYSTEM
SOFTWARE   → HKLM\SOFTWARE
SECURITY   → HKLM\SECURITY
SAM        → HKLM\SAM
NTUSER.DAT → HKU\<SID>  and HKCU
USRCLASS.DAT → HKU\<SID>\Software\Classes
```

### 2) Control Sets (why `CurrentControlSet` is tricky offline)

* Live Windows often uses `HKLM\SYSTEM\CurrentControlSet` as an alias.
* Offline hive viewers usually expose **`ControlSet00x`** (e.g., `ControlSet001`).
* For hostname, a typical offline path:

```text
ROOT\ControlSet001\Control\ComputerName\ComputerName
```

### 3) “Dirty” hives & transaction logs

Live acquisitions can be **dirty** (incomplete transactions). Use transaction logs (`*.LOG`, `*.LOG1`, `*.LOG2`) to replay and reach a consistent state.

---

### Tools

#### Registry Editor (live)

Good for quick checks on a running host, but **not** ideal for forensic analysis (risk of modification, limited offline handling).

#### Registry Explorer (offline)

* Loads hive files directly.
* Parses binary value data.
* Supports searching, bookmarks, timestamps, and deleted records (depending on artifact/tool).

**Operational tip:** when loading a hive, use the “SHIFT + Open” pattern (or the tool’s equivalent) to replay transaction logs.

---

### Registry Artifacts Cheat Sheet (DFIR)

Think of these as “sensors” for user behavior + system configuration.

| Artifact                    | Typical Path (logical)                                           | What it answers                                         |
| --------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------- |
| Hostname                    | `HKLM\SYSTEM\...\ComputerName\ComputerName`                      | Which machine is this?                                  |
| USB history                 | `HKLM\SYSTEM\CurrentControlSet\Enum\USBSTOR`                     | What removable devices were attached?                   |
| Run dialog MRU              | `HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\RunMRU` | What commands were typed in Win+R?                      |
| UserAssist                  | `HKCU\...\Explorer\UserAssist`                                   | GUI-launched apps (weak execution evidence, but useful) |
| TypedPaths                  | `HKCU\...\Explorer\TypedPaths`                                   | Paths typed in Explorer address bar                     |
| WordWheelQuery              | `HKCU\...\Explorer\WordWheelQuery`                               | Explorer search terms                                   |
| Installed programs          | `HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall`       | What was installed (and when)?                          |
| Startup persistence         | `HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Run`             | What auto-starts at logon?                              |
| AppCompat execution (paths) | `HKCU\...\AppCompatFlags\Compatibility Assistant\Store`          | Full executable paths the user ran                      |

---

### Practical Workflow: Install → Execute → Persist

Use this as a repeatable playbook (Te/Te-style: deterministic pivots).

#### Step 0: Establish the incident boundary

* Record the **known abnormal start time** (here: **2025-10-21**).
* Anything before that is “pre-positioning” candidate.

#### Step 1: Identify the host (sanity check)

* Load **SYSTEM** hive.
* Navigate to:

```text
ROOT\ControlSet001\Control\ComputerName\ComputerName
```

Confirm the hostname matches your case target.

#### Step 2: Find suspicious install (SOFTWARE hive)

* Load **SOFTWARE** hive.
* Pivot into:

```text
ROOT\Microsoft\Windows\CurrentVersion\Uninstall
```

Sort by LastWrite timestamp and look for entries just before the abnormal window.

#### Step 3: Confirm user execution path (NTUSER.DAT)

Install evidence ≠ executed. Confirm a *user ran it*:

```text
HKCU\Software\Microsoft\Windows NT\CurrentVersion\AppCompatFlags\Compatibility Assistant\Store
```

This often records **full executable paths** that were actually launched.

#### Step 4: Find persistence (SOFTWARE hive)

Attackers (or shady installers) often set logon persistence here:

```text
HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Run
```

Look for new values pointing to unusual binaries (or unusual arguments like `/background`, `-silent`, etc.).

---

### Case Findings (from the lab walkthrough)

> Treat these as the lab’s ground truth for this scenario.

1. **Installed application (pre-abnormal window):**

   * `Drone Manager Updater`

2. **Full path where the user launched it from:**

   * `C:\Users\dispatch.admin\Downloads\DroneManagerSetup.exe`

3. **Persistence value added on startup:**

   * Key: `HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Run`
   * Value name: `DroneHelper`
   * Data (example): `"C:\Program Files\Drone Manager\DroneHelper.exe" /background`

---

### Pitfalls / Common Mistakes

* **ControlSet confusion:** offline views show `ControlSet001/002`, not always `CurrentControlSet`.
* **Per-user artifacts require SID:** `HKU\<SID>` matters; `HKCU` is a convenience alias.
* **Install ≠ execution:** confirm execution via AppCompat/UserAssist/RunMRU, not only Uninstall.
* **Timestamps are not “execution time”:** many LastWrite times reflect configuration writes, not process start.
* **Dirty hive loading:** skipping log replay can hide (or mis-time) critical entries.

---

## Related Tools

* **RECmd / Registry Explorer** (Zimmerman tools ecosystem)
* **KAPE** (artifact collection + triage)
* **RegRipper** (plugin-based parsing)
* **Volatility** (if correlating registry artifacts with memory-resident indicators)

---

## Further Reading

* NIST CFTT: *Windows Registry Forensic Tool Specification* (transaction logs, parsing expectations)
* ForensicArtifacts: *Windows Registry artifacts* reference pages (UserAssist, RunMRU, etc.)
* Belkasoft: *Windows Registry forensics* overview (structure + acquisition pitfalls)
* Zimmerman tool docs: RECmd / KAPE documentation and usage notes

---

## Glossary (EN → 中文)

* Registry → 注册表
* Hive → 配置单元/蜂巢文件（注册表 hive 文件）
* Root Key → 根键（如 HKLM/HKCU）
* Key / Subkey → 键 / 子键
* Value → 值
* LastWrite Timestamp → 最后写入时间戳
* Transaction Log (`.LOG1/.LOG2`) → 事务日志
* Dirty Hive → 脏 hive（未完成事务的采集状态）
* Persistence → 持久化（自启动）
* MRU (Most Recently Used) → 最近使用记录
