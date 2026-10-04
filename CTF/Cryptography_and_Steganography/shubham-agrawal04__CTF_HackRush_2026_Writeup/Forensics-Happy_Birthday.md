# Happy Birthday (Part 1)

**Category:** Forensics  
**Points:** 30  

---

## Description

> Mizi wants to create a letter for her bestie's birthday. Since she isn’t familiar with programming, she vibecode it using a popular protocol. However, she did not protect it properly.  
>  
> Drive Link: https://drive.google.com/file/d/1xeKvh_MuheEgZBw8Vkcaunb11o3AbKRL/view  
>  
> Password to the VM: 12345678  
>  
> **Part 1:** At what time did the system last shutdown start?  
> Flag format: `HRCTF{EPOCH_TIMESTAMP}`  

---

## Approach

### 1. VM Setup and Exploration

- Downloaded and extracted the provided virtual machine.
- Logged into the VM using the given password.
- Since this was a **forensics challenge**, focused on analyzing **system logs**.

---

### 2. Investigating Windows Event Logs

Checked **Windows Event Viewer** logs, specifically:

- **System Logs**
- Looked for shutdown-related events

Relevant Event IDs considered:

- **Event ID 1074** → Indicates a shutdown/restart initiated by a process/user  
- **Event ID 6006** → Event log service stopped (system shutdown)  
- **Event ID 109** → Shutdown event triggered by the system  

---

### 3. Trial and Error with Event IDs

- Initially examined timestamps from:
  - Event ID **1074**
  - Event ID **6006**
- These did not produce the correct flag.

---

### 4. Identifying the Correct Event

- Found that **Event ID 109** corresponds to the **start of system shutdown**.
- Extracted the timestamp from this event.

---

### 5. Converting to Epoch Time

- The timestamp from Event ID 109 was converted to **Unix Epoch format**.
- This produced the correct value.

---

## Key Insight

- Different shutdown-related Event IDs represent **different stages** of shutdown:
  - Some indicate initiation by user/process
  - Some indicate completion
- The correct answer required identifying the **start of shutdown**, not completion.

---

## Tools Used

- Windows Event Viewer  
- Manual log inspection  

---

## Flag

```bash
HRCTF{1765547079}
```

---

## Lessons Learned

* Understanding **Windows Event IDs** is crucial in forensic investigations.
* Not all related logs give the exact required information: precision matters.
* Always verify which event corresponds to the exact wording of the question.

---

