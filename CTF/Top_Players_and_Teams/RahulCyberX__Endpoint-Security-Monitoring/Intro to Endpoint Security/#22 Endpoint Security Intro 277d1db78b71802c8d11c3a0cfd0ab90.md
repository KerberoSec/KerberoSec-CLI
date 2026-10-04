# #22: Endpoint Security: Intro

---

# Task 1: Room Introduction

This room introduces the fundamentals of **endpoint security monitoring**, the essential tools, and high-level methodology.

Goal → learn how to determine malicious activity from an endpoint and map its related events.

### Topics covered:

- Endpoint Security Fundamentals
- Endpoint Logging and Monitoring
- Endpoint Log Analysis

At the end → threat simulation to investigate and remediate infected machines.

# Task 2: Endpoint Security Fundamentals

### Core Windows Processes

- **Why it matters**: Understanding core Windows processes is essential for analyzing endpoint logs and identifying anomalies in a Windows system.
- **Tool**: **Task Manager**
    
    
    
- Built-in Windows GUI tool to view running processes and resource usage (CPU, memory).
- Used to terminate unresponsive programs.
- Displays key processes running in the background.
- **Key Core Windows Processes** (Normal Behavior):
    - **System**: Parent process, only has **System Idle Process (0)** as its parent.
    - **System > smss.exe**: Session Manager Subsystem, child of System.
    - **csrss.exe**: Client/Server Runtime Subsystem, no parent under normal conditions.
    - **wininit.exe**: Initialization process, no parent.
        - **wininit.exe > services.exe**: Manages services, child of wininit.exe.
        - **wininit.exe > services.exe > svchost.exe**: Hosts multiple Windows services.
    - **lsass.exe**: Local Security Authority Subsystem, no parent.
    - **winlogon.exe**: Handles user login/logout, no parent.
    - **explorer.exe**: Windows Explorer for user interface, no parent.
    - **Note**: Processes without a parent-child relationship (except System) should not have a parent process under normal circumstances.
- **Resource**: Refer to the *Core Windows Processes Room* for more details.

### Sysinternals Tools

- **Overview**: A collection of 70+ Windows tools for analyzing system activity, categorized into:
    - File and Disk Utilities
    - Networking Utilities
    - Process Utilities
    - Security Utilities
    - System Information
    - Miscellaneous
- **Key Tools for Endpoint Investigation**:
    1. **TCPView** (Networking Utility)
        
        
        
    - Displays detailed listings of all TCP/UDP endpoints on the system.
    - Shows local/remote addresses, TCP connection states, and process names (on Windows Server 2008, Vista, XP).
    - More informative than the built-in **Netstat** tool.
    - Includes **Tcpvcon**, a command-line version.
    - Use: Correlate network events with processes.
    1. **Process Explorer** (Process Utility)
        - Two sub-windows:
            - **Top window**: Lists active processes and their owning accounts.
            - **Bottom window**: Shows either:
                - **Handle mode**: Handles (e.g., files, directories) opened by the selected process.
                - **DLL mode**: DLLs and memory-mapped files loaded by the process.
        - Use: Inspect process details like associated services, network traffic, handles, and loaded DLLs/memory-mapped files.

# Task 3: Endpoint Logging and Monitoring

### Windows Event Logs

- **Purpose**: Audit significant events across endpoints, collect/aggregate logs for searching, and automate anomaly detection.
- **Format**: Stored in proprietary binary format (.evt or .evtx), located in `C:\\Windows\\System32\\winevt\\Logs`. Viewable as XML using Windows API, not plain text.
- **Access Methods**:
    - **Event Viewer**: GUI-based tool to view logs.
        
        
        
    - **Wevtutil.exe**: Command-line tool for log management.
    - **Get-WinEvent**: PowerShell cmdlet for querying logs.
- **Resource**: Refer to the *Windows Event Logs Room* for more details.

### Sysmon

- **Overview**: A Windows Sysinternals tool for detailed monitoring and logging of system events, used in enterprise environments with SIEM or log-parsing solutions.
- **Features**:
    - Provides granular, high-quality logs and event tracing for anomaly detection.
    - Supports 27 Event IDs, configurable via a configuration file (e.g., SwiftOnSecurity’s config).
    - Logs viewable in Event Viewer.
- **Use**: Enhances visibility into system activities, often integrated with SIEM for aggregation, filtering, and visualization.
- **Resource**: Refer to the *Sysmon Room* for more details.

### OSQuery

- **Overview**: Open-source tool by Facebook for querying endpoints (Windows, Linux, macOS, FreeBSD) using SQL-like syntax.
- **Usage**:
    - Run `osqueryi` in CMD/PowerShell to access the interactive shell.
        
        
        
    - Example: Query process details (e.g., `select pid, name, path from processes where name='lsass.exe';` to list lsass.exe process info).
        
        
        
- **Kolide Fleet**: Extends OSQuery to query multiple endpoints via a UI, e.g., listing machines running the lsass process.
- **Limitation**: Local OSQuery queries single endpoints; Kolide Fleet enables multi-endpoint queries.
- **Resource**: Refer to the *OSQuery Room* for more details.

### Wazuh

- **Overview**: Open-source Endpoint Detection and Response (EDR) solution, scalable for all environments.
- **Model**: Uses a manager-agent architecture (manager device controls agents on monitored devices).
- **EDR Features**:
    
    
    
    - Audits devices for vulnerabilities.
    - Monitors for suspicious activities (e.g., unauthorized logins, brute-force attacks, privilege escalations).
    - Visualizes complex data/events in graphs.
    - Records normal device behavior to detect anomalies.
- **Use**: Comprehensive monitoring and threat detection across endpoints.
- **Resource**: Refer to Wazuh documentation for more details.

These tools (Windows Event Logs, Sysmon, OSQuery, Wazuh) enable robust endpoint monitoring, logging, and querying to detect and respond to security threats effectively.

# Task 4: Endpoint Log Analysis

### Event Correlation

- **Definition**: Identifies relationships between artifacts from multiple log sources (e.g., application logs, endpoint logs, network logs) to uncover significant events.
- **Process**: Connects related data points across sources to reconstruct events.
    - **Example**: Combining Sysmon logs (Event ID 3: Network Connection) and Firewall logs.
        - **Firewall Logs**: Provide source/destination IP, ports, protocol, action taken.
        - **Sysmon Logs**: Provide process name, user account, machine name.
- **Key Artifacts**:
    - Source and Destination IP
    - Source and Destination Port
    - Action Taken
    - Protocol
    - Process Name
    - User Account
    - Machine Name
- **Purpose**: Builds a complete picture of an event for investigation by linking puzzle pieces from different logs.

### Baselining

- **Definition**: Establishes "normal" behavior for user activities, network traffic, and processes across an organization’s systems.
- **Process**: Collects extensive data to define standard operations, enabling quick identification of outliers or potential threats.
- **Examples of Baseline vs. Unusual Activity**:
    - **Baseline**: Employees in London work 9 AM: 6 PM.
        - **Unusual**: VPN login from Singapore at 3 AM.
    - **Baseline**: Each employee assigned one workstation.
        - **Unusual**: User attempts authentication on multiple workstations.
    - **Baseline**: Access limited to OneDrive, SharePoint, O365 apps.
        - **Unusual**: User uploads 3GB file to Google Drive.
    - **Baseline**: Only approved apps (e.g., Microsoft Word, Excel, Teams, Chrome) installed.
        - **Unusual**: `firefox.exe` running on multiple workstations.
- **Importance**: Without a baseline, anomalies (needles in a haystack) are harder to detect.

### Investigation Activity

- **Context**: Builds on prior endpoint security knowledge (core processes, Sysinternals, Windows Event Logs, Sysmon, OSQuery, Wazuh).
- **Task**: Investigate suspicious activity on a colleague’s workstation as part of Blue Team activities.
- **Objective**: Apply event correlation and baselining to identify and analyze potential threats.

These concepts enable effective detection and investigation of security incidents by linking log data, establishing normal behavior, and identifying deviations for further analysis.