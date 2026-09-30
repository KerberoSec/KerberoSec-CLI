# Mr. Phisher

<img align="right" src="https://github.com/matthernet/Writeups/blob/main/TryHackMe/Room/mrphisher/mrphisher01.png" width="150" height="150">

I received a suspicious email with a very weird looking attachment. It keeps on asking me to "enable macros". What are those?

LINK = [https://tryhackme.com/room/mrphisher](https://tryhackme.com/room/mrphisher)

### FYI
This writeup don't include any passwords/cracked hashes/flags

# Description
I received a suspicious email with a very weird-looking attachment. It keeps on asking me to "enable macros". What are those?

# Steps

1: Join the room, start the virtual machine

2: Open de document with LibreOffice and you will get and alert of "This document contains macros", accept the use of macros

<img src="https://github.com/matthernet/Writeups/blob/main/TryHackMe/Room/mrphisher/mrphisher02.png" width="50%">

3: Go to ```Tools``` > ```Macros``` > ```Edit Macros```
* In the macro editor go to the ```MrPhisher.docm``` > ```Project``` > ```Modules``` > ```NewMacros```

4: You will find the code of the macro
```vb
Option VBASupport 1
Sub Format()
	Dim a()
	Dim b As String
	a = Array(102, 109, 99, 100, 127, 100, 53, 62, 105, 57, 61, 106, 62, 62, 55, 110, 113, 114, 118, 39, 36, 118, 47, 35, 32, 125, 34, 46, 46, 124, 43, 124, 25, 71, 26, 71, 21, 88)
	For i = 0 To UBound(a)
		b = b & Chr(a(i) Xor i)
	Next
End Sub
```
5: Using [VB to Python](https://vb2py.sourceforge.net/online_conversion.html) we can convert Visual Basic To Python, the output will be this:
```vb
from vb2py.vbfunctions import *
from vb2py.vbdebug import *

"""Attribute VBA_ModuleType=VBAModule"""

def Format();
	a = vbObjectInitialize(objtype=Variant)

	b = String()
	a = Array(102, 109, 99, 100, 127, 100, 53, 62, 105, 57, 61, 106, 62, 62, 55, 110, 113, 114, 118, 39, 36, 118, 47, 35, 32, 125, 34, 46, 46, 124, 43, 124, 25, 71, 26, 71, 21, 88)
	for i = vbForRange(0, UBound(a));
	b = b + Chr(a(i) ^ i)

# VB2PY (UntranslatedCode) Option VBASupport 1
```

6: In order to propeli run in python the code needs some modification, it will end like this:
```python
arr = [102, 109, 99, 100, 127, 100, 53, 62, 105, 57, 61, 106, 62, 62, 55, 110, 113, 114, 118, 39, 36, 118, 47, 35, 32, 125, 34, 46, 46, 124, 43, 124, 25, 71, 26, 71, 21, 88]
fl = ""

for i in range(0, len(arr)):
        fl = fl + chr(arr[i] ^ i)
print(fl)
```
7: Execute the python code

<img src="https://github.com/matthernet/Writeups/blob/main/TryHackMe/Room/mrphisher/mrphisher03.png" width="50%">

8: Get the flag!! 😎

## DANGEROUS SECOND WAY TO GET THE FLAG

Only do this if you know 100% the code

1: Go to ```Tools``` -> ```Options``` -> ```Security``` -> ```Macro security``` and set the security to ```Low```

2: Go to the line 10 in the macro code and press ```F9``` to add a breakpoint, go to the line 8 where the b value is and press ```F7``` to enable watch

3: Press ```F5(Run)``` to run the macro in the debugger

<img src="https://github.com/matthernet/Writeups/blob/main/TryHackMe/Room/mrphisher/mrphisher04.png" width="50%">

4: Get the flag!! 😎
