
# Osquery

## *Interacting with the Osquery Shell*

- What is the Osquery version?

```cmd
> osqueryi --version
```

> 4.6.0.2

- What is the SQLite version?

```cmd
osquery> SELECT sqlite_version(); 
```

> 3.34.0

- What is the default output mode?

```cmd
osquery> .help

# and look at "mode"
```

> pretty

- What is the meta-command to set the output to show one value per line?

> .mode line

- What are the 2 meta-commands to exit osqueryi?

> .exit,.quit

---

## *Schema Documentation*

To answer all this, just poke around the documentation UI.

- What table would you query to get the version of Osquery installed on the Windows endpoint?

> osquery_info

- How many tables are there for this version of Osquery?

> 266

- How many of the tables for this version are compatible with Windows?

> 96

- How many tables are compatible with Linux?

> 155

- What is the first table listed that is compatible with both Linux and Windows?

> arp_cache

---

## *Creating queries*

- What is the query to show the username field from the users table where the username is 3 characters long and ends with 'en'? (use single quotes in your answer)

> SELECT username FROM users WHERE username LIKE '_en';

---

## *Using Kolide Fleet*

Just follow the instructions. Osquery Enroll Secret can be obtained at https://127.0.0.1:8080/hosts/manage
at the "Add new host" section

- What is the Osquery Enroll Secret?

> k3hFh30bUrU7nAC3DmsCCyb1mT8HoDkt

- What is the Osquery version?

Execute the following query on connected Windows machine:

```sql
SELECT * FROM osquery_info;
```

> 4.2.0

- What is the path for the running osqueryd.exe process?

Execute the following query on connected Windows machine:

```sql
SELECT path FROM processes WHERE name = 'osqueryd.exe';
```

> C:\Users\Administrator\Desktop\launcher\windows\osqueryd.exe

---

## *Osquery extensions*

- According to the polylogyx readme, how many 'features' does the plug-in add to the Osquery core?

> 25

---

## *Linux and Osquery*

- What is the 'current_value' for kernel.osrelease?

```sql
SELECT * FROM kernel_info;
```

> 4.4.0-17763-Microsoft

- What is the uid for the bravo user?

```sql
SELECT uid FROM users WHERE username = 'bravo';
```

> 1002

- One of the users performed a 'Binary Padding' attack. What was the target file in the attack?

```sql
select * from shell_history;
```

> notsus

- What is the hash value for this file?

```bash
$ md5sum /home/tryhackme/notsus
```

> 3df6a21c6d0c554719cffa6ee2ae0df7

- Check all file hashes in the home directory for each user. One file will not show any hashes. Which file is that?

```sql
SELECT md5,directory FROM hash WHERE path = '/home/tryhackme/fleet.zip';
```

> fleet.zip

- There is a file that is categorized as malicious in one of the home directories. Query the Yara table to find this file. Use the sigfile which is saved in '/var/osquery/yara/scanner.yara'. Which file is it?

I just run yara directly:

```bash
$ yara /var/osquery/yara/scanner.yara charlie/
```

> notes

- What were the 'matches'?

> eicar_av_test, eicar_substring_test

- Scan the file from Q#3 with the same Yara file. What is the entry for 'strings'?

```sql
SELECT * FROM yara WHERE path="/home/tryhackme/notsus" and sigfile="/var/osquery/yara/scanner.yara";
```

> $eicar_substring:1b

---

## *Windows and Osquery*

- What is the description for the Windows Defender Service?

```sql
SELECT name,description FROM services WHERE name LIKE "%fend%";
```

> Helps protect users from malware and other potentially unwanted software

- There is another security agent on the Windows endpoint. What is the name of this agent?

```sql
SELECT name,publisher FROM programs;
```

> AlienVault Agent

- What is required with win_event_log_data?

> source

- How many sources are returned for win_event_log_channels?

```sql
SELECT COUNT(*) FROM win_event_log_channels;
```

> 1076

- What is the schema for win_event_log_data?

```sql
.schema win_event_log_data;
```

> CREATE TABLE win_event_log_data(`time` BIGINT, `datetime` TEXT, `source` TEXT, `provider_name` TEXT, `provider_guid` TEXT, `eventid` INTEGER, `task` INTEGER, `level` INTEGER, `keywords` BIGINT, `data` TEXT, `eid` TEXT HIDDEN);

- The previous file scanned on the Linux endpoint with Yara is on the Windows endpoint.  What date/time was this file first detected? (Answer format: YYYY-MM-DD HH:MM:SS)

```sql
SELECT eventid,datetime FROM win_event_log_data where source="Microsoft-Windows-Windows Defender/Operational" AND eventid = '1116';
```

> 2021-04-01 00:50:44

- What is the query to find the first Sysmon event? Select only the event id, order by date/time, and limit the output to only 1 entry.

```sql
-- Find sysmon channel
SELECT * FROM win_event_log_channels WHERE source like '%sysmon%';

-- Microsoft-Windows-Sysmon/Operational
SELECT eventid FROM win_event_log_data WHERE source="Microsoft-Windows-Sysmon/Operational" ORDER BY datetime LIMIT 1;
```

> SELECT eventid FROM win_event_log_data WHERE source="Microsoft-Windows-Sysmon/Operational" ORDER BY datetime LIMIT 1;

- What is the Sysmon event id?

> 16

