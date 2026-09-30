# Dream Job-2

## 1 According to MITRE ATT&CK, what previously known malware does DRATzarus share similarities with?

> [DRATzarus on MITRE ATT&CK:](https://attack.mitre.org/software/S0694/)
> DRATzarus shares similarities with Bankshot, which was used by Lazarus Group in 2017 to target the Turkish financial sector.

> **ANSWER:** Bankshot

## 2 Which Windows API function does DRATzarus use to detect the presence of a debugger?

> **ANSWER:** IsDebuggerPresent

## 3 Torisma is another piece of malware used by the Lazarus Group. According to MITRE, it has encrypted its C2 communications using XOR and which other method?

[Torisma on MITRE ATT&CK](https://attack.mitre.org/software/S0678/)

> **ANSWER:** VEST-32

## 4 Which packing method has been used to obfuscate Torisma?

> **ANSWER:** lz4 compression

## 5 Analyze the provided ISO file and identify the executable contained within it?

```sh$ md5sum BAE_HPC_SE.iso
09350e100a4bda4a276fca6a968eb9ea  BAE_HPC_SE.iso
```

We can look up the hash on [VirusTotal](https://www.virustotal.com/gui/file/56dabf1ddd5c9a93a6f35dd7f210367baee545296838d321dfea6ee49575c9af).
In the [behavior](https://www.virustotal.com/gui/file/56dabf1ddd5c9a93a6f35dd7f210367baee545296838d321dfea6ee49575c9af/behavior) tab, under "File system actions", we find `InternalViewer.exe`.

> **ANSWER:** `InternalViewer.exe`

## 6 The executable found in the previous question was renamed. Can you identify its original name?

A hash is provided with the file, so we can [look that hash up](https://www.virustotal.com/gui/file/adce894e3ce69c9822da57196707c7a15acee11319ccc963b84d83c23c3ea802) and find the origial file name.

> **ANSWER:** `SumatraPDF.exe`

## 7 According to VirusTotal, when was the EXE from the previous question First Seen In The Wild?(UTC)

In the [details](https://www.virustotal.com/gui/file/adce894e3ce69c9822da57196707c7a15acee11319ccc963b84d83c23c3ea802/details) tab, we can find the "First Seen In The Wild".

> **ANSWER:** 2020-08-13 08:44:50

## 8 What packer was used to pack the executable from Question 6? (Full name)

In the [details](https://www.virustotal.com/gui/file/adce894e3ce69c9822da57196707c7a15acee11319ccc963b84d83c23c3ea802/details) tab, the TrID shows that it's compressed using [UPX](https://upx.github.io/).

> **ANSWER:** Ultimate Packer for eXecutables

## 9 What is the full URL found within the macro in the document Salary_Lockheed_Martin_job_opportunities_confidential.doc?

```sh
$ olevba Salary_Lockheed_Martin_job_opportunities_confidential.doc;
# snipped
+----------+--------------------+---------------------------------------------+
|Type      |Keyword             |Description                                  |
+----------+--------------------+---------------------------------------------+
|AutoExec  |Frame1_Layout       |Runs when the file is opened and ActiveX     |
|          |                    |objects trigger events                       |
|Suspicious|Open                |May open a file                              |
|Suspicious|Lib                 |May run code from a DLL                      |
|Suspicious|VirtualProtect      |May inject code into another process         |
|Suspicious|.Variables          |May use Word Document Variables to store and |
|          |                    |hide data                                    |
|Suspicious|Hex Strings         |Hex-encoded strings were detected, may be    |
|          |                    |used to obfuscate strings (option --decode to|
|          |                    |see all)                                     |
|Suspicious|Base64 Strings      |Base64-encoded strings were detected, may be |
|          |                    |used to obfuscate strings (option --decode to|
|          |                    |see all)                                     |
|IOC       |https://markettrendi|URL                                          |
|          |ngcenter.com/lk_job_|                                             |
|          |oppor.docx          |                                             |
|IOC       |WMVCORE.DLL         |Executable file name                         |
|Base64    |+35H3CN79fCOR4N7ZzPs|KzM1SDNDTjc5ZkNPUjRON1p6UHNxVFhqYjJEeVZ3M3RlV|
|String    |qTXjb2DyVw3teTGkemQv|EdrZW1Rdk5DWG1FRERGZTFpakwzM2piNGc5eVkrRFRSMl|
|          |NCXmEDDFe1ijL33jb4g9|JlT0NL                                       |
|          |yY+DTR2ReOCK        |                                             |
|Base64    |8iH6aHsy9tkMHUWnk4E*|OGlINmFIc3k5dGtNSFVXbms0RSo0TnphT1JZMG4waHdJb|
|String    |4NzaORY0n0hwIlcSFJWA|GNTRkpXQU13RDIzV3Y0YllYd0psaXA2SlJzT2d1VXdvU1|
|          |MwD23Wv4bYXwJlip6JRs|gwS0ZW                                       |
|          |OguUwoSX0KFV        |                                             |
|Base64    |A5oDSLASdPbQZQYs1YR+|QTVvRFNMQVNkUGJRWlFZczFZUitYb3l0Nm9xakhuRUNuV|
|String    |Xoyt6oqjHnECnT4cFzHN|DRjRnpITmlzaVpPR3JLc012bHZXSGdzcWpOZVVzZE92UW|
|          |isiZOGrKsMvlvWHgsqjN|tPQXV5                                       |
|          |eUsdOvQkOAuy        |                                             |
+----------+--------------------+---------------------------------------------+
```

> **ANSWER:** `https://markettrendingcenter.com/lk_job_oppor.docx`

## 10 Who is the author of the document Salary_Lockheed_Martin_job_opportunities_confidential.doc?

```sh
$ exiftool Salary_Lockheed_Martin_job_opportunities_confidential.doc | grep Author
Author                          : Mickey
```

> **ANSWER:** Mickey

## 11 Who last modified the above document?

```sh
$ exiftool Salary_Lockheed_Martin_job_opportunities_confidential.doc | grep 'Last Modified By'
Last Modified By                : Challenger
```

> **ANSWER:** Challenger

## 12 Analyze the "17.dotm" document. What is the directory where a suspicious folder was created? (Format: Give the path starting immediately after <USER>. Please pay attention to placeholder.)

```sh
$ olevba 17.dotm
```

```vba
Function GetDllName() As String
    On Error Resume Next
    Dim dllPath As String

    workDir = Environ("UserProfile") & "\AppData\Local\Microsoft\Notice"
    If Not FolderExist(workDir) Then
        MkDir (workDir)
    End If
    binName = "wsuser.db"
    binDir = "ws"

    dllPath = workDir & "\" & binName

    nIdx = 0
    Do While FileExist(dllPath)
        workDir = workDir & "\" & binDir
        If Not FolderExist(workDir) Then
            MkDir (workDir)
        End If
        dllPath = workDir & "\" & binName
    Loop

    GetDllName = dllPath
End Function
```

> **ANSWER:** `\AppData\Local\Microsoft\Notice`

## 13 Which suspicious file was checked for existence in that directory?

> **ANSWER:** `wsuser.db`
