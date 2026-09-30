### CPTS / HTB Penetration Tester Path <br>
### Active Directory Enumeration & Attacks: Enumerating Security Controls <br>
<mark>hook it up with a &#x2B50; if this helps.</mark> <br>
🐦: @<a href="https://x.com/st8less">**st8less**</a>

<br>
<br>

---

### Enumerating Security Controls

Map defenses before launching tools: pick AV-evasive paths, blend in where possible.

<br>

---

<br>

### Windows Defender

Quick status check:

```diff
+ PS> Get-MpComputerStatus
```

<br>

`RealTimeProtectionEnabled : True` = Defender is live. Bypasses out of scope here, but Defender will eat PowerView by default.

<br>

---

<br>

### AppLocker

Microsoft application allowlist. Common config blocks `cmd.exe` + `powershell.exe` from non-admin paths but leaves alt PowerShell binaries alone (`%SystemRoot%\SysWOW64\WindowsPowerShell\v1.0\powershell.exe`, `PowerShell_ISE.exe`).

```diff
+ PS> Get-AppLockerPolicy -Effective | select -ExpandProperty RuleCollections
```

<br>

---

<br>

### PowerShell Constrained Language Mode

Locks COM, .NET types, classes, etc.

```diff
+ PS> $ExecutionContext.SessionState.LanguageMode
```

<br>

Returns `ConstrainedLanguage` if locked down, `FullLanguage` if not.

<br>

---

<br>

### LAPS

Microsoft Local Administrator Password Solution = randomized + rotated local admin passwords. `LAPSToolkit` to audit + abuse:

```diff
+ PS> Find-LAPSDelegatedGroups
+ PS> Find-AdmPwdExtendedRights
+ PS> Get-LAPSComputers
```

<br>

Look for accounts with `All Extended Rights` (often less protected than dedicated LAPS-reader groups). Read access on the `ms-Mcs-AdmPwd` attribute = local admin on the host.
