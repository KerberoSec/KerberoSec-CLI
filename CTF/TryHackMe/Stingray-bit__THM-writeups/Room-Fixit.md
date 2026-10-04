
# [TryHackMe: Fixit Room](https://tryhackme.com/r/room/fixit)

## Details

### Level 1: Fix Event Boundaries
In Splunk, correctly determine event boundaries, which may involve events originating from unknown devices. This step requires configuring Splunk to recognize new event patterns, potentially by modifying event boundary settings.

### Level 2: Extract Custom Fields
With defined event boundaries, the next step involves extracting key fields from the events to enable searchable attributes. Fields include:
- Username
- Country
- Source_IP
- Department
- Domain

Develop regular expressions to parse these fields from network logs. The creation of regex patterns is critical for this step and can be developed using tools like regex101 to ensure accuracy.

### Level 3: Perform Analysis on the FIXED Events
Using the newly parsed fields, perform detailed analysis on the event logs. This involves querying the parsed data in Splunk to extract insights and answer predefined questions.

## Tasks and Questions

- **Full path of the FIXIT app directory:** `/opt/Splunk/etc/apps/fixit`
- **Stanza for defining Event Boundary in multi-line events:** Ensure to complete the Data Manipulation prerequisite room.
  - `BREAK_ONLY_BEFORE`
- **Full path of the network-logs script in inputs.conf:** `opt/Splunk/etc/apps/fixit/bin/network-logs`
- **Regex pattern for defining the Event’s start:** `[Network-log]`
- **Captured domain after parsing:** `cybertees.thm`
- **Additional Statistics:**
  - Countries captured: 12
  - Departments captured: 6
  - Usernames captured: 28
  - Source IPs captured: 52
- **Configuration files used to fix the issue:**
  - `fields.conf, props.conf, transforms.conf`
- **User who accessed the secret-document.pdf:** Sarah Hall

## Methods Used

- **Event Boundary Configuration:** Adjustments in Splunk to recognize starting points of events using `BREAK_ONLY_BEFORE`.
- **Regex Pattern Creation:** Utilizing regular expressions to extract necessary fields from log data, crucial for transforming raw data into structured data.
- **Splunk Queries:** Analyzing structured data by running specific queries in Splunk to draw actionable insights.
