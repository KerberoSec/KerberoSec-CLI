# Case Summary and Report: "Everyone's Favorite Employee"

## Executive Summary

Karen, a junior employee, recently started working for TAAUSAI and began performing off-policy activity. A digital disk image was acquired from her workstation and analyzed using FTK Imager. The investigation found evidence of credential dumping tools, suspicious file masquerading, possible log tampering, malicious traffic simulation, and privilege escalation activity.

Based on the evidence reviewed, Karen's activity appears consistent with a malicious insider threat investigation.

## System Information

The acquired disk image showed that Karen's workstation was using **Kali Linux**.

## Findings

### 1. Credential Dumping Tool Identified

After initial analysis of the files, a file named `mimikatz_trunk.zip` was identified in:

```text
/root/Downloads
```

This file was not recognized as an approved internal tool and was quarantined for further analysis.

### 2. Apache Logs

The Apache log directory appeared empty. This may indicate no Apache activity, or it may suggest log tampering or deletion involving files such as:

```text
/var/log/apache2/access.log
/var/log/apache2/error.log
/var/log/apache2/other_vhosts_access.log
```

The MD5 hash of `access.log` was:

```text
d41d8cd98f00b204e9800998ecf8427e
```

This hash is commonly associated with an empty file.

### 3. Suspicious JPG-Labeled File

A suspicious JPG-labeled file was identified:

```text
didyouthinkwedmakeiteasy.jpg
```

The file did not behave as a valid JPG image and appeared to contain non-image data. Bash history showed the following command:

```bash
binwalk didyouthinkwedmakeiteasy.jpg
```

This indicates the file was likely analyzed or extracted using Binwalk.

### 4. Checklist Suggesting Intent

A checklist was identified on the user's Desktop. The checklist contents included:

```text
Gain Bob's Trust
Learn how to hack
Profit
```

The checklist contents may indicate planning or intent consistent with insider threat activity.

### 5. Evidence of Attack Simulation

The user appeared to branch out toward attacking another machine. In the image file:

```text
irZLAohL.jpeg
```

an application named `flightsim` was observed.

`flightsim` is a tool that can generate malicious network traffic for security teams to evaluate security controls and monitoring detections. Although this can be a legitimate security tool, given the surrounding evidence, its use may indicate intentional simulation or generation of malicious network activity.

### 6. Workplace Disruption

The user also appeared to disrupt workflow involving senior colleagues Castro, Young, and Bob.

### 7. Privilege Escalation Activity

The user attempted to gain root access multiple times at 11:26 on March 20. Subsequent logs indicate successful privilege escalation to the `postgres` account:

```text
Mar 20 11:26:23 KarenHacker su[4114]: Successful su for postgres by root
Mar 20 11:26:23 KarenHacker su[4114]: + /dev/pts/0 root:postgres
```

## Conclusion

The user's workstation was quarantined, and her credentials have been revoked. The activity observed during the investigation was recognized as highly suspicious and potentially malicious. Further investigation is recommended to determine whether additional systems were affected.
