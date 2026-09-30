# #30: OsQuery: Challenge ⚔️

# Challenge and Conclusion

Now that I’ve explored various Osquery tables and practiced writing SQL queries to extract system data, I used my knowledge to solve a few real-world style challenges. The goal here was to use Osquery to examine the host system and find specific evidence.

---

## Step 1: Identify Which Table Stores Process Execution Evidence in Windows

To start, I needed to find which table stores evidence of process execution in Windows OS.

I used the `.tables` command to view all available tables:

```bash
.tables
```

However, to be sure, I checked the official Osquery documentation for Windows:

👉 [https://osquery.io/schema/5.5.1](https://osquery.io/schema/5.5.1)

After some exploration and testing, I found that the correct table is **userassist**.

**About userassist table:**

- It tracks when a user executes an application from Windows Explorer.
- It logs execution path, timestamp, execution count, and user SID.

**Schema columns:**

- `path` → Application file path
- `last_execution_time` → Timestamp of last execution
- `count` → Number of times executed
- `sid` → Security Identifier (User SID)

---

## Step 2: Find the Program Executed to Remove Disk Traces

I used the **userassist** table found in the previous step.

To view all entries and check for any suspicious programs, I ran:

```sql
SELECT * FROM userassist;
```

After carefully examining the results, I noticed one entry for **DiskWipe.exe**: a program known to remove or wipe disk traces.

---

## Step 3: Identify VPN Installed on the Host

Next, I had to identify which VPN software is installed.

For this, I used the **programs** table, which lists all installed programs.

I filtered for names containing “VPN” using the `LIKE` operator:

```sql
SELECT * FROM programs WHERE name LIKE '%VPN%';
```

From the results, I found an entry for **ProtonVPN**.

---

## Step 4: Count Running Services

To determine how many services were currently running on the host, I queried the **services** table.

I used the `COUNT(*)` function to count the number of entries:

```sql
SELECT COUNT(*) FROM services;

```

The total count returned was **215**.

---

## Step 5: Identify Batch File That Runs Automatically

The next step was to find which batch file (`.bat`) runs automatically when the machine starts.

The **autoexec** table stores executables configured to auto-run.

I searched for entries ending with `.bat` using:

```sql
SELECT * FROM autoexec WHERE name LIKE '%.bat';
```

This revealed one batch file named **batstartup.bat**.

---

## Step 6: Find the Full Path of the Batch File

Finally, I needed to find the full path of that same `.bat` file from the **autoexec** table.

I found the complete path by checking the path column of the previous query:

**Answer:**

`C:\Users\James\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup\batstartup.bat`

---

## Summary

Through this challenge, I learned how to:

- Locate and interpret key system tables in Osquery.
- Use SQL filters and wildcards effectively (`LIKE`, `COUNT(*)`, etc.).
- Investigate process execution and startup artifacts.
- Query real forensic evidence such as registry data, program installations, and user activity.

---