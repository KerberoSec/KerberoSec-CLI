# FSC: The Compressed Truth
**Forensic Analysis Writeup**

---

## Overview

The artefact provided is a partial disk image from Veylen Marr's workstation, containing the user registry hive at `C:\Users\vmarr\NTUSER.DAT`. The operative CROWQUILL authenticated to the machine using stolen credentials and carried out a full intelligence collection and exfiltration operation against the Shard Reference Registry. No external forensic tooling was available in the analysis environment; a minimal Windows registry (regf) parser was written from scratch in Python to interrogate the hive directly.

The narrative explicitly flags 7-Zip as the source of ground truth: *"7-Zip does not forget which folders were opened, which paths were browsed, and where the staging began."* All answers derive from three 7-Zip registry keys: `Software\7-Zip\Extraction`, `Software\7-Zip\Compression`, and `Software\7-Zip\FM`: plus supporting Explorer artifacts.

---

## Artefact Structure

```
C/
├── Users/
│   ├── vmarr/
│   │   ├── NTUSER.DAT          ← primary analysis target
│   │   └── ntuser.dat.LOG1     ← transaction log
│   └── cyberjunkie/
│       └── NTUSER.DAT          ← investigator's account, no 7-Zip activity
└── Windows/
    └── System32/config/        ← system hives (no relevant 7-Zip entries)
```

---

## Methodology

The hive was parsed by implementing the `regf` cell format in Python: reading `nk` (key) nodes, `vk` (value) nodes, and `lf`/`lh`/`li`/`ri` subkey list structures directly from the raw binary. No third-party libraries were used.

Key registry paths interrogated:

| Path | Purpose |
|---|---|
| `Software\7-Zip\Extraction` | Records extraction destinations (PathHistory) |
| `Software\7-Zip\Compression` | Records archive creation paths (ArcHistory) |
| `Software\7-Zip\FM` | Records folder navigation (FolderHistory, CopyHistory, PanelPath) |
| `Software\Microsoft\Windows\CurrentVersion\Explorer\RecentDocs` | File access recency and MRU ordering |
| `Software\Microsoft\Windows\CurrentVersion\Explorer\UserAssist` | Executed programs (ROT-13 decoded) |

---

## Findings

### Q1: The Credential Extraction Tool

**Answer: `KeeFarce`**

The `Software\7-Zip\Extraction\PathHistory` value records the destination used when CROWQUILL extracted a tool onto the machine:

```
C:\Users\vmarr\AppData\Local\Temp\writ\KeeFarce\
```

KeeFarce is a publicly documented post-exploitation tool that injects into a running KeePass process and exports the decrypted credential database from memory: lifting the key while it is still held, exactly as the brief describes. The presence of `KeePass Password Safe 2\KeePass.exe` in the UserAssist and NotifyIconSettings keys confirms KeePass was installed and had been launched on this machine.

---

### Q2: When the Tool Was Extracted

**Answer: `2026-06-18 13:15:15`**

The `Software\7-Zip\Extraction` registry key carries a LastWrite timestamp of **2026-06-18 13:15:15.280444 UTC**. This timestamp is updated by Windows the moment 7-Zip writes the extraction path to the key: i.e., the moment CROWQUILL extracted KeeFarce onto the machine.

---

### Q3: Deepest Folder Enumerated Inside the Archive

**Answer: `C:\Users\vmarr\Documents\Registry\oath_records_cinderbound_vol2.zip\oath_records_cinderbound_vol2\saltoaths_secretive\`**

The `Software\7-Zip\FM\FolderHistory` value (a REG_MULTI_SZ) records every folder navigated in the 7-Zip File Manager, most-recent first. Three consecutive entries document CROWQUILL opening and descending into `oath_records_cinderbound_vol2.zip`:

```
[13] C:\Users\vmarr\Documents\Registry\oath_records_cinderbound_vol2.zip\
[14] C:\Users\vmarr\Documents\Registry\oath_records_cinderbound_vol2.zip\oath_records_cinderbound_vol2\
[15] C:\Users\vmarr\Documents\Registry\oath_records_cinderbound_vol2.zip\oath_records_cinderbound_vol2\saltoaths_secretive\
```

Entry `[15]` is the deepest point reached inside the archive before the operative moved on.

---

### Q4: Staging Location

**Answer: `c:\users\public\music\saltwork\`**

The `Software\7-Zip\FM\CopyHistory` value records the destination paths supplied to 7-Zip's copy dialog. Both entries point to the same location:

```
c:\users\public\music\saltwork\
c:\users\public\music\saltwork
```

This is where CROWQUILL copied the stolen records: a publicly writable directory chosen to avoid raising suspicion. The `FolderHistory` places `saltwork` as the second-most-recently-visited folder (index `[1]`), immediately before the final `desktop\working` session, consistent with the operative staging files here immediately before compression.

---

### Q5: Name of the Exfiltration Archive

**Answer: `shardchain.tar`**

The `Software\7-Zip\Compression\ArcHistory` value records the full path of the last archive created:

```
C:\Users\Public\Pictures\shardchain.tar
```

This is corroborated by `Explorer\RecentDocs\.tar`, which lists `shardchain.tar` as the only `.tar` file recently accessed (LastWrite: **2026-06-18 13:24:55**), and by the `Compression` key LastWrite of **2026-06-18 13:25:06**: the moment the archive was sealed.

---

### Q6: Location of the Master Secrets Store

**Answer: `C:\Users\vmarr\Documents\Registry\shard_storage\ShardKeepass_FirstMark\`**

The `FolderHistory` records CROWQUILL navigating directly into the KeePass vault folder:

```
[8]  C:\Users\vmarr\Documents\Registry\shard_storage\
[9]  C:\Users\vmarr\Documents\Registry\shard_storage\ShardKeepass_FirstMark\
```

The name `ShardKeepass_FirstMark` identifies this as the KeePass database holding credentials for every shard catalogued in the Registry: the master store that KeeFarce was brought onto the machine to unlock. With it, Cassian holds the authority to reconstruct custody chains for every shard the Registry has ever tracked.

---

### Q7: Where CROWQUILL Concluded Operations

**Answer: `c:\users\vmarr\desktop\working\`**

The `Software\7-Zip\FM\PanelPath0` value records the folder that was active in the 7-Zip left panel at the time of the last registry write:

```
c:\users\vmarr\desktop\working\
```

This is also `FolderHistory[0]`: the most recently visited folder. After sealing `shardchain.tar` and verifying the staging folder, CROWQUILL returned to their desktop working directory. This is where enumeration stopped.

---

## Timeline Reconstruction

| Time (UTC) | Event | Source |
|---|---|---|
| `13:15:15` | KeeFarce extracted to `Temp\writ\KeeFarce\` | `7-Zip\Extraction` LastWrite |
| `13:18:12` | 7-Zip File Manager column state updated (active browsing) | `7-Zip\FM\Columns` LastWrite |
| ~`13:18-13:24` | Registry folders enumerated: `custody_chains`, `shard_references`, `internal_reports`, `shard_storage\ShardKeepass_FirstMark`; `oath_records_cinderbound_vol2.zip` browsed internally; KeePass AppData folder visited | `FolderHistory` order |
| ~`13:20-13:24` | Stolen records copied to `c:\users\public\music\saltwork\` | `CopyHistory` |
| `13:24:55` | `shardchain.tar` accessed (creation confirmed) | `RecentDocs\.tar` LastWrite |
| `13:25:06` | Archive sealed; Compression key updated | `7-Zip\Compression` LastWrite |
| `13:26:47` | 7-Zip FM last active in `desktop\working\` | `7-Zip\FM` LastWrite |

---

## Answer Summary

| # | Question | Answer |
|---|---|---|
| 1 | Credential extraction tool | `KeeFarce` |
| 2 | Tool extraction timestamp | `2026-06-18 13:15:15` |
| 3 | Deepest folder enumerated inside archive | `C:\Users\vmarr\Documents\Registry\oath_records_cinderbound_vol2.zip\oath_records_cinderbound_vol2\saltoaths_secretive\` |
| 4 | Staging location | `c:\users\public\music\saltwork\` |
| 5 | Exfiltration archive name | `shardchain.tar` |
| 6 | Master secrets store path | `C:\Users\vmarr\Documents\Registry\shard_storage\ShardKeepass_FirstMark\` |
| 7 | Final 7-Zip working location | `c:\users\vmarr\desktop\working\` |
