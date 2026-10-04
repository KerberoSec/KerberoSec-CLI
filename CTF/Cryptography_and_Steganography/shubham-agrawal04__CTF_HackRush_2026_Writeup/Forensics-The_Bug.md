# The Bug

**Category:** Forensics  
**Points:** 30  

---

## Description

> Mizi did a malicious commit unintentionally.  
>
> Find:  
>: Full commit ID of the malicious commit  
>: Name of the file introduced in that commit  
>
> Flag format: `HRCTF{<malicious_file>_<commit_id>}`  

---

## Approach

### 1. Locating the Repository in the VM

- Continued from the previous VM challenge.
- Navigated to:

```

C:\Users\Mizi\Music

```

- Found a folder:

```

WorldCollapsing

```

- This appeared to be the **birthday website** Mizi was building.
- Presence of `.git` confirmed it was a **Git repository**.

---

### 2. Transferring Repository for Analysis

- The VM did **not have Git installed**.
- Transferred the repository to my local machine using **Wormhole**.
- Performed all Git analysis locally.

---

## 3. Identifying the Malicious File (Key Pivot)

- While exploring the repository, found a configuration file:

```

.cursor/mcp.json

````

- This file referenced execution of a script:

```json
"..\\images\\31.jpg.ps1"
````

### Suspicion:

* File named like an image but ends with `.ps1` → **highly suspicious**

---

### Inspecting the File

* Opened:

```
images/31.jpg.ps1
```

* Found:

  * Not an image
  * A **triple Base64-encoded PowerShell payload**
  * Decodes itself and executes via PowerShell

### Conclusion:

* This is clearly the **malicious artifact**

---

## 4. Initial Git Analysis

```bash
git reflog
```

* Observed mostly normal commits
* Noticed anomaly:

```
filter-branch: rewrite
```

### Insight:

* Repository history was **rewritten**
* Some commits may be hidden or altered

---

## Attempted Approaches (What Didn’t Work)

### 1. Standard History Inspection

```bash
git log
git log --all
```

* Did not reveal the malicious commit

---

### 2. File-Based Tracking

```bash
git log -- images/31.jpg.ps1
```

* Did not return the expected commit
* Likely due to rewritten history

---

### 3. Recovering Hidden Commits

```bash
git fsck --full
git fsck --lost-found
```

* No dangling commits found

---

### 4. Checking Backup References

```bash
git show-ref
```

* No useful `refs/original/` entries

---

## 5. Enumerating Full Object Graph

Used:

```bash
git rev-list --objects --all
```

### Why this works:

* Traverses **all objects in the repository**
* Goes beyond what `git log` shows
* Can expose commits not visible in branch history

---

## 6. Brute-Force Commit Inspection

* From the output of `rev-list`, manually tested commits:

```bash
git show <commit_hash>
```

* Repeated this process to find which commit introduced the malicious file

---

## 7. Identifying the Malicious Commit

* Found a match where:

* The commit introduced:

```
31.jpg.ps1
```

* The commit ID:

```
c0df0ebeb988e991418029e3021fb7f8542068b2
```

---

## Key Insight

* The investigation pivoted from:

  * **artifact → commit**, not commit → artifact
* Even when history is rewritten:

  * Full object enumeration (`rev-list`) can expose hidden relationships
* Brute-force validation is sometimes necessary in forensic analysis

---

## Tools Used

* Wormhole (file transfer)
* Git:

  * `log`
  * `rev-list`
  * `show`
  * `fsck`

---

## Flag

```
HRCTF{31.jpg.ps1_c0df0ebeb988e991418029e3021fb7f8542068b2}
```

---

## Lessons Learned

* Always start from **suspicious artifacts**, not just logs
* Config files can reveal execution paths and hidden behavior
* Git history rewriting can obscure evidence but not fully remove it
* `git rev-list` is powerful for deep inspection
* Brute-force exploration is sometimes required in CTF forensics

---

