## Dancing Hackthebox
### Room Description:
This room is focused on network enumeration. Core skills are:
- Nmap
- SMB
- SMBClient
- Python (optional)
- winrm (optional)
----

#### Step 0x01: `Network Scan`
as usual, we will run a nmap scan to find open ports and services.
```bash
# nmap command:
nmap -A -sV --privileged -T4 <ip> -p- -O -sC -v
```
|PORT|STATE|SERVICE|VERSION|
|----|----|----|----|
|135/tcp|open|msrpc|Microsoft Windows RPC|
|135/tcp|open|msrpc|Microsoft Windows RPC|
|445/tcp|open|microsoft-ds?| |
|5985/tcp|open|http|Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)|
|47001/tcp|open|http|Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)|
|49664/tcp|open|msrpc|Microsoft Windows RPC|

**Script Result**
```terminal
Host script results:
| smb2-time: 
|   date: 2024-06-28T10:59:42
|_  start_date: N/A
|_clock-skew: 3h59m59s
| smb2-security-mode: 
|   3:1:1: 
|_    Message signing enabled but not required
```
#### Step 0x02: `Getting In`
Now as we have some info about the server, we will try to get into it. First thing first is we have **`SMB`** running in the servre. so we will try to see if there is any file or directory there.

For that we will use `smbclient`
```bash
# SmbClient command
smbclient -L <ip>

# Result
        Sharename       Type      Comment
        ---------       ----      -------
        ADMIN$          Disk      Remote Admin
        C$              Disk      Default share
        IPC$            IPC       Remote IPC
        WorkShares      Disk
```
Now we want to check each and every one of the `disk` if possible. **First** we will start with `ADMIN$`.
```bash
# smbclient command
smbclient ///<ip>//FileName
# don't forget to use '$' at the end. Only for the disks that contains $
```
Except for ***WorkShares*** other `Disk` don't allow non cred login

***WorkShares*** has 2 other directories:
```terminal
  Amy.J        D   0  Mon Mar 29 15:08:24 2021
  James.P      D   0  Thu Jun  3 14:38:03 2021
```
both directories contains contents. You have to get them.
just use the command:
```
get filename.txt
```
it will be downloaded to your local directory.

We get flag and a note form these directories. the note says:
>- start apache server on the linux machine
>- secure the ftp server
>- setup winrm on dancing 

Hmmmmmmmm. that's interesting. we have winrm and an FTP server.
I immidiately searched on google and found a page:
[large link](https://docs.vmware.com/en/VMware-Aria-Automation/8.17/Using-Automation-Orchestrator-Plugins/GUID-79518969-9B73-48E3-8B05-72C78179F555.html)

it says:
```
Authentication method	Details
Basic ==== Non-secure authentication mechanism that requires a user name and a password.
Kerberos ==== Secure authentication protocol that uses tickets to verify the identity of the client and the server.
```
Also:
```
Run the following command to set the default WinRM configuration values.
- c:\> winrm quickconfig
(Optional) Run the following command to check whether a listener is running, and verify the default ports.
- c:\> winrm e winrm/config/listener
The default ports are 5985 for HTTP, and 5986 for HTTPS.

```
Look at the port. We have that port open. Let's try to get into this thing.

Too bad. Can't get into it. I tried Python library called `pywinrm` (`pip install pywinrm`).<br> As I don't know the creds, I couldn't login. Use the following code:
```python
import winrm
session = winrm.Session('10.129.244.22', auth=('administrator', 'password_001'))
result = session.run_ps("hostname") # if login successful, this will execute the command "hostname".
#then try:
print(result.std_out)
```
