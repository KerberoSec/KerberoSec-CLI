#Windows 

https://tryhackme.com/r/room/windowsfundamentals3xzx

**Tip**: Another way to access Windows Update is from the Run dialog box, or CMD, by running the command `control /name Microsoft.WindowsUpdate`.

**Windows Security** is also available in **Settings**.
**Protection areas**.
- **Virus & threat protection**
- **Firewall & network protection**
- **App & browser control**
- **Device security**

Virus & threat protection is divided into two parts:  
- **Current threats**
- **Virus & threat protection settings**

**Scan options**
- **Quick scan**: Checks folders in your system where threats are commonly found.
- **Full scan**: Checks all files and running programs on your hard disk. This scan could take longer than one hour.
- **Custom scan**: Choose which files and locations you want to check.

- **Last scan**: Windows Defender Antivirus automatically scans your device for viruses and other threats to help keep it safe.
- **Quarantined threats**: Quarantined threats have been isolated and prevented from running on your device. They will be periodically removed.
- **Allowed threats**: Allowed threats are items identified as threats, which you allowed to run on your device.

**Manage settings** 
- **Real-time protection**: Locates and stops malware from installing or running on your device.
- **Cloud-delivered protection**: Provides increased and faster protection with access to the latest protection data in the cloud.
- **Automatic sample submission**: Send sample files to Microsoft to help protect you and others from potential threats. 
- **Controlled folder access**: Protect files, folders, and memory areas on your device from unauthorized changes by unfriendly applications.
- **Exclusions**: Windows Defender Antivirus won't scan items that you've excluded.
- **Notifications**: Windows Defender Antivirus will send notifications with critical information about the health and security of your device.

Firewall
- **Domain**: _The domain profile applies to networks where the host system can authenticate to a domain controller._ 
- **Private**: _The private profile is a user-assigned profile and is used to designate private or home networks._
- **Public**: _The default profile is the public profile, used to designate public networks such as Wi-Fi hotspots at coffee shops, airports, and other locations._

 **Microsoft Defender SmartScreen** App and browser control 

**Trusted Platform Module** (**TPM**)?  
Per Microsoft, "_Trusted Platform Module (TPM) technology is designed to provide hardware-based, security-related functions. A TPM chip is a secure crypto-processor that is designed to carry out cryptographic operations. The chip includes multiple physical security mechanisms to make it tamper-resistant, and malicious software is unable to tamper with the security functions of the TPM_".

What is **BitLocker**?

Per Microsoft, "_BitLocker Drive Encryption is a data protection feature that integrates with the operating system and addresses the threats of data theft or exposure from lost, stolen, or inappropriately decommissioned computers_".

On devices with TPM installed, BitLocker offers the best protection.

```
What must a user insert on computers that **DO NOT** have a TPM version 1.2 or later?

USB startup key
```

 Volume Shadow Copy Service (VSS) coordinates the required actions to create a consistent shadow copy (also known as a snapshot or a point-in-time copy) of the data that is to be backed up. 

Volume Shadow Copies are stored on the System Volume Information folder on each drive that has protection enabled.

If VSS is enabled (**System Protection** turned on), you can perform the following tasks from within **advanced system settings**. 
- **Create a restore point**
- **Perform system restore**
- **Configure restore settings**
- **Delete restore points**

