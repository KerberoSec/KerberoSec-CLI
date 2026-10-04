#Subscribers #Phishing 

https://tryhackme.com/room/mrphisher

I received a suspicious email with a very weird-looking attachment. It keeps on asking me to "enable macros". What are those?

Access this challenge by deploying the machine attached to this task by pressing the green "Start Machine" button. The files you need are located in `/home/ubuntu/mrphisher` on the VM.

```
MrPhisher.docm
open in LibreOffice 

This document contains macros.
Macros may contain viruses. Execution of macros is disabled due to the current macro security setting in Tools-Options-LibreOffice-Security.

meme picture of Futurama Fry 
right click > view properties
Alt text: Get Rich Quick or Reboot Trying: The State of CyberCrime ...

Tools > Macros > edit macros 
nothing to see

unzip mr-phisher.zip
MrPhisher.docm(2) > open in LibreOffice > warning about macros

Tools > Macros > edit macros

top left drop down menu > [MrPhisher.docm (2)].Project
MrPhiser.docm(2)
L Project
  L Document Objects
    L ThisDocument

Rem Attribute VBA_ModuleType=VBAModule
Option VBASupport 1
Sub Format()
Dim a()
Dim b As String
a = Array(102, 109, 99, 100, 127, 100, 53, 62, 105, 57, 61, 106, 62, 62, 55, 110, 113, 114, 118, 39, 36, 118, 47, 35, 32, 125, 34, 46, 46, 124, 43, 124, 25, 71, 26, 71, 21, 88)
For i = 0 To UBound(a)
b = b & Chr(a(i) Xor i)
Next
End Sub

Uncover the flag in the email attachment!

flag{a39a07a239aacd40c948d852a5c9f8d1}
```

https://github.com/KyootyBella/THM-Writeups/blob/main/Mr.%20Phisher/README.md

