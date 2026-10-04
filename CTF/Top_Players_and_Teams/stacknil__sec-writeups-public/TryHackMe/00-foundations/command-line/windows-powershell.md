---
type: resource-note
status: done
created: 2026-03-11
updated: 2026-03-11
tags: [security-writeup, tryhackme, windows, powershell]
source: TryHackMe: Windows PowerShell
platform: tryhackme
room: Windows PowerShell
slug: windows-powershell
path: TryHackMe/00-foundations/command-line/windows-powershell.md
topic: 00-foundations
domain: [foundations, windows]
skills: [powershell, services, accounts]
artifacts: [concept-notes, cookbook]
sanitized: true
---

# Windows PowerShell

## Summary

* **PowerShell** is a cross-platform automation stack: **shell + scripting language + configuration management**.
* Core design idea: **object-based pipeline** (objects flow through `|`, not raw text).
* Typical security value: fast **enumeration**, **triage**, and **automation** on Windows fleets.

## Key Concepts

### Object-Oriented Approach（面向对象）

* In PowerShell, many commands return **objects** that expose:

  * **Properties** (data fields): e.g., `Name`, `Length`, `DisplayName`, `OwningProcess`.
  * **Methods** (actions): callable functions on objects.
* Practical consequence: filtering/sorting is usually about **properties**, not text parsing.

### Cmdlets: `Verb-Noun` Naming Convention

* Cmdlets follow a consistent **Verb-Noun** format:

  * `Get-Content` (read file content)
  * `Set-Location` (change directory)
* This convention makes guessing commands feasible once verbs/nouns are learned.

### Discoverability & Help

#### Inventory

* `Get-Command`: list available cmdlets/functions/aliases.

  * Filter by name prefix:

    ```powershell
    Get-Command -Name Remove-*
    ```

#### Documentation

* `Get-Help <Cmdlet>`: synopsis, syntax, parameters.

  * Examples:

    ```powershell
    Get-Help New-LocalUser -Examples
    ```

#### Aliases（别名）

* `Get-Alias` lists shortcuts for cmdlets.
* Example: `echo` is an alias of:

  * `Write-Output`

#### Modules (Online Repos)

* `Find-Module` / `Install-Module` can extend functionality.
* Lab limitation: many training VMs have **no Internet**, so these may fail.

### File System Operations

#### Navigation

* List directory:

  ```powershell
  Get-ChildItem
  Get-ChildItem -Path C:\Users
  ```

* Change directory:

  ```powershell
  Set-Location -Path .\Documents
  ```

#### Create / Delete

* Create file or directory with a single cmdlet:

  ```powershell
  New-Item -Path .\captain-cabin\captain-wardrobe -ItemType Directory
  New-Item -Path .\captain-cabin\captain-wardrobe\captain-boots.txt -ItemType File
  ```

* Remove file or directory:

  ```powershell
  Remove-Item -Path .\captain-cabin\captain-wardrobe\captain-boots.txt
  Remove-Item -Path .\captain-cabin\captain-wardrobe
  ```

#### Copy / Move

```powershell
Copy-Item -Path .\captain-cabin\captain-hat.txt -Destination .\captain-cabin\captain-hat2.txt
Move-Item -Path .\a.txt -Destination .\archive\a.txt
```

#### Read File Content

* Equivalent of `type` (Windows) / `cat` (Unix):

  ```powershell
  Get-Content -Path .\captain-hat.txt
  ```

### Pipelines, Filtering, Sorting

#### Pipeline (`|`) = object stream

* `|` passes **objects** downstream.
* Example: sort by file length:

  ```powershell
  Get-ChildItem | Sort-Object Length
  ```

#### Filtering: `Where-Object`

* Filter by property and comparison operator:

  ```powershell
  Get-ChildItem | Where-Object -Property Length -gt 100
  Get-ChildItem | Where-Object -Property Extension -eq .txt
  Get-ChildItem | Where-Object -Property Name -like ship*
  ```

#### Sorting: `Sort-Object`

* Descending + pick largest:

  ```powershell
  Get-ChildItem | Sort-Object Length -Descending | Select-Object -First 1
  ```

#### Projection / Limiting: `Select-Object`

```powershell
Get-ChildItem | Select-Object Name,Length
```

#### Searching Text: `Select-String`

* `grep`-like search inside files:

  ```powershell
  Select-String -Path .\captain-hat.txt -Pattern hat
  ```

#### Common Operators

* Equality: `-eq`, `-ne`
* Numeric: `-gt`, `-ge`, `-lt`, `-le`
* Wildcards: `-like` with `*`

### System & Network Enumeration

#### System snapshot

```powershell
Get-ComputerInfo
```

#### Local users

```powershell
Get-LocalUser
```

#### Network configuration

```powershell
Get-NetIPConfiguration
Get-NetIPAddress
```

### Real-Time System Analysis

#### Processes / Services

```powershell
Get-Process
Get-Service
```

#### TCP connections

```powershell
Get-NetTCPConnection
```

* Default output includes the property that identifies the initiating process:

  * `OwningProcess`

#### File hash (integrity / IOC pivot)

```powershell
Get-FileHash -Path .\somefile.txt
```

#### Alternate Data Streams (ADS) on NTFS

```powershell
Get-Item -Path C:\House\house_log.txt -Stream *
```

### Remoting & Scripting

#### Scripting basics

* A script is a `.ps1` file: sequential commands for automation.
* Security use-cases (high-level):

  * Blue team: evidence collection, IOC extraction, anomaly checks.
  * Admin: configuration drift checks, fleet hygiene.

#### Remote execution: `Invoke-Command`

* Execute `Get-Service` on remote host `RoyalFortune`:

  ```powershell
  Invoke-Command -ComputerName RoyalFortune -ScriptBlock { Get-Service }
  ```

### Room Q&A (Quick Answers)

* Advanced approach behind PowerShell: **Object-Oriented**.
* List commands starting with `Remove`: `Get-Command -Name Remove-*`
* Cmdlet behind alias `echo`: `Write-Output`
* Examples for `New-LocalUser`: `Get-Help New-LocalUser -Examples`
* PowerShell alternative to `type`: `Get-Content`
* List `C:\Users`: `Get-ChildItem -Path C:\Users`
* Current directory items with size > 100: `Get-ChildItem | Where-Object -Property Length -gt 100`

### Pitfalls & Practical Notes

* **Property names matter**: file size is typically `Length` (not `Size`).
* `Get-Service` has **Name** (service identifier) and **DisplayName** (human label). Filtering by motto often targets `DisplayName`.
* Prefer pipelines over manual parsing; when stuck, inspect properties:

  ```powershell
  Get-ChildItem | Select-Object -First 1 *
  ```

## Related Tools

* Windows Terminal, PowerShell ISE (legacy), VS Code + PowerShell extension
* Sysinternals Suite (Process Explorer, Autoruns) as GUI complements

## Further reading (titles)

* Microsoft Learn: `about_Objects`, `about_Pipelines`, `about_Aliases`
* Cmdlet docs: `Get-Command`, `Get-Help`, `Get-ChildItem`, `Where-Object`, `Invoke-Command`

## Mini Glossary (中英对照)

* cmdlet（命令小组件/命令单元）
* pipeline（管道）
* object（对象）
* property（属性/字段）
* method（方法）
* alias（别名）
* module（模块）
* wildcard（通配符）
* regex / regular expression（正则表达式）
* ADS / Alternate Data Stream（NTFS 备用数据流）
