# 🧪 Forensics: Registry Forensics

---

## **Task 1: Introduction**

### 📖 The Story

TBFC is under attack. Systems are showing strange behavior, and the organization is missing its lead defender, **McSkidy**. However, McSkidy ensured her legacy continues through a well-trained and determined team.

With **SOCMAS** approaching, TBFC’s defenders must regain control quickly. One of the most critical systems, **dispatch-srv01**, responsible for drone-based gift delivery, has been compromised by **King Malhare’s bandits of bunnies**.

To investigate the incident effectively, the team has split into specialized forensic units:

- Logs
- Memory dumps
- File systems
- Other artefacts

👉 **Your role**: Perform **Windows Registry Forensics** on the compromised system.

---

## 🎯 Learning Objectives

By the end of this room, you will be able to:

- Understand what the **Windows Registry** is and what it stores
- Identify **Registry Hives** and **Root Keys**
- Analyze registry data using:

  - **Registry Editor** (live system)
  - **Registry Explorer** (offline forensic analysis)

- Perform **Registry Forensics** to extract evidence

---

## **Task 2: Investigate the Gifts Delivery Malfunctioning**

---

## 🧠 Windows Registry: Core Concept

Think of the **Windows Registry** as the **brain of the Windows OS**.

Just like the human brain stores:

- Behavior
- Habits
- Past actions
- Preferences

The Windows Registry stores:

- System configuration
- User activity
- Installed software
- Hardware details
- Startup programs

⚠️ Unlike a human brain, the Windows Registry is **not stored in one place**.
It is divided into multiple files called **Registry Hives**.

---

## 🗂️ Registry Hives Overview

| Hive Name        | Contains                                 | Location                                                         |
| ---------------- | ---------------------------------------- | ---------------------------------------------------------------- |
| **SYSTEM**       | Services, Drivers, Boot config, Hardware | `C:\Windows\System32\config\SYSTEM`                              |
| **SECURITY**     | Local security policies, Audit policies  | `C:\Windows\System32\config\SECURITY`                            |
| **SOFTWARE**     | Installed programs, OS info, Autostarts  | `C:\Windows\System32\config\SOFTWARE`                            |
| **SAM**          | Users, Password hashes, Groups           | `C:\Windows\System32\config\SAM`                                 |
| **NTUSER.DAT**   | User activity, Preferences, Run history  | `C:\Users\username\NTUSER.DAT`                                   |
| **USRCLASS.DAT** | Shellbags, Jump lists                    | `C:\Users\username\AppData\Local\Microsoft\Windows\USRCLASS.DAT` |

📝 **Note:** Each hive contains much more data than listed above.

---

## 🧩 Registry Editor vs Registry Hives

- Registry hives are **binary files**
- Cannot be opened directly by double-clicking
- Windows provides **Registry Editor** to view registry data

### 🔑 Root Keys Mapping

| Hive on Disk | Registry Editor Path         |
| ------------ | ---------------------------- |
| SYSTEM       | `HKLM\SYSTEM`                |
| SECURITY     | `HKLM\SECURITY`              |
| SOFTWARE     | `HKLM\SOFTWARE`              |
| SAM          | `HKLM\SAM`                   |
| NTUSER.DAT   | `HKU\<SID>` & `HKCU`         |
| USRCLASS.DAT | `HKU\<SID>\Software\Classes` |

📌 **Important Notes**

- `HKCR` and `HKCC` are **dynamic**, not backed by separate hive files
- Most system-wide artefacts are under **HKLM**
- User activity is mainly under **HKCU / HKU**

---

## 🔍 Extracting Information from the Registry

### Example 1: Connected USB Devices

**Path:**

```
HKLM\SYSTEM\CurrentControlSet\Enum\USBSTOR
```

Evidence includes:

- USB make & model
- Device ID
- Unique instances per device

---

### Example 2: Programs Run via Win + R

**Path:**

```
HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\RunMRU
```

Evidence includes:

- Commands typed in Run dialog
- Order of execution

---

## 🕵️ Registry Forensics

**Registry Forensics** = Extracting and analyzing registry artefacts to reconstruct user/system activity.

Used alongside:

- Event logs
- File system artefacts
- Memory analysis

---

## 🧾 High-Value Registry Keys for Investigations (Full Paths)

| **Full Registry Path**                                                                | **What It Reveals**                                       |
| ------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Explorer\UserAssist`     | Applications launched via GUI (decoded execution history) |
| `HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Explorer\TypedPaths`     | Paths typed into File Explorer address bar                |
| `HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Explorer\WordWheelQuery` | Search terms typed in File Explorer search                |
| `HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Explorer\RecentDocs`     | Recently accessed files by the user                       |
| `HKEY_LOCAL_MACHINE\Software\Microsoft\Windows\CurrentVersion\Run`                    | Programs configured for persistence at user login         |
| `HKEY_LOCAL_MACHINE\Software\Microsoft\Windows\CurrentVersion\App Paths`              | Executable locations of installed applications            |
| `HKEY_LOCAL_MACHINE\Software\Microsoft\Windows\CurrentVersion\Uninstall`              | Installed applications and installation metadata          |
| `HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\ComputerName\ComputerName`       | System hostname                                           |

### 🔎 Forensic Tip

* **HKCU** = User activity & behavior
* **HKLM** = System-wide configuration & persistence
* Always correlate **LastWrite timestamps** with incident timelines

📌 **Why Registry Editor is NOT enough**

- Cannot open **offline hives**
- Binary values not human-readable
- Risk of evidence modification

---

## 🛠️ Tool Used: **Registry Explorer**

- Open-source
- Supports **offline hive analysis**
- Parses binary data
- Safe for forensic investigations

---

## 🧪 Practical: Registry Explorer Walkthrough

### Step 1: Launch Registry Explorer

- Open from taskbar

---

### Step 2: Load Registry Hives

```
File → Load Hive
```

---

### Step 3: Handle Dirty Hives (IMPORTANT)

- Navigate to:

```
C:\Users\Administrator\Desktop\Registry Hives
```

- Select hive (e.g., SYSTEM)
- **Hold SHIFT + Open** to replay transaction logs
- Ensures consistent and clean hive state

Repeat for all required hives.

---

### Step 4: Investigate Registry Keys

**Find Computer Name**

```
ROOT\ControlSet001\Control\ComputerName\ComputerName
```

- Hostname found: **DISPATCH-SRV01**

---

📌 **Incident Timeline Note**

- Abnormal activity started on **21st October, 2025**
- Registry artefacts before this date are critical

---

## ✅ Questions & Answers (Formatted)

### **What application was installed on the dispatch-srv01 before the abnormal activity started?**

<details>
  <summary>Click to reveal the answer</summary>

**DroneManager Updater**

</details>

---

### **What is the full path where the user launched the application from?**

<details>
  <summary>Click to reveal the answer</summary>

**C:\Users\dispatch.admin\Downloads\DroneManager_Setup.exe**

</details>

---

### **Which value was added by the application to maintain persistence on startup?**

<details>
  <summary>Click to reveal the answer</summary>

**"C:\Program Files\DroneManager\dronehelper.exe" --background**

</details>

---

## 🧠 Key Takeaways

- Registry is a **goldmine for forensic evidence**
- Always analyze **offline hives**
- Persistence mechanisms are often found in **Run keys**
- Timeline matters: always correlate dates
- **Registry Explorer > Registry Editor** for investigations

---
