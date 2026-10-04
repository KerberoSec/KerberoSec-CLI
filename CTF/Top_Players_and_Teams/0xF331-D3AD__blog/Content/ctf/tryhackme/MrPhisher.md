# Mr. Phisher

We'll analyze VBA macros in this room. First things first: download these tools:

1. [pcodedmp](https://github.com/bontchev/pcodedmp):

> `git clone https://github.com/bontchev/pcodedmp.git`
>
> `cd pcodedmp`
> 
> `pip3 install .`

2. [pcode2code](https://github.com/Big5-sec/pcode2code/)

> `git clone https://github.com/Big5-sec/pcode2code.git`
>
> `cd pcode2code`
> 
> `pip3 install .`

OK. Let's extract the macros:

> `python3 ~/CyberSecurity/pcodedmp/pcodedmp/pcodedmp.py MrPhisher.docm -d | tee code`

```Processing file: MrPhisher.docm
===============================================================================
Module streams:
VBA/ThisDocument - 938 bytes
VBA/NewMacros - 1602 bytes
Line #0:
	FuncDefn (Sub Format())
Line #1:
	Dim 
	VarDefn a
Line #2:
	Dim 
	VarDefn B (As String)
Line #3:
	LitDI2 0x0066 
	LitDI2 0x006D 
	LitDI2 0x0063 
	LitDI2 0x0064 
	LitDI2 0x007F 
	LitDI2 0x0064 
	LitDI2 0x0035 
	LitDI2 0x003E 
	LitDI2 0x0069 
	LitDI2 0x0039 
	LitDI2 0x003D 
	LitDI2 0x006A 
	LitDI2 0x003E 
	LitDI2 0x003E 
	LitDI2 0x0037 
	LitDI2 0x006E 
	LitDI2 0x0071 
	LitDI2 0x0072 
	LitDI2 0x0076 
	LitDI2 0x0027 
	LitDI2 0x0024 
	LitDI2 0x0076 
	LitDI2 0x002F 
	LitDI2 0x0023 
	LitDI2 0x0020 
	LitDI2 0x007D 
	LitDI2 0x0022 
	LitDI2 0x002E 
	LitDI2 0x002E 
	LitDI2 0x007C 
	LitDI2 0x002B 
	LitDI2 0x007C 
	LitDI2 0x0019 
	LitDI2 0x0047 
	LitDI2 0x001A 
	LitDI2 0x0047 
	LitDI2 0x0015 
	LitDI2 0x0058 
	ArgsArray Array 0x0026 
	St a 
Line #4:
	StartForVariable 
	Ld i 
	EndForVariable 
	LitDI2 0x0000 
	Ld a 
	FnUBound 0x0000 
	For 
Line #5:
	Ld B 
	Ld i 
	ArgsLd a 0x0001 
	Ld i 
	Xor 
	ArgsLd Chr 0x0001 
	Concat 
	St B 
Line #6:
	StartForVariable 
	Next 
Line #7:
	EndSub
```

But that's not really readable. That's why we need the 2nd tool:

> `python3 ~/CyberSecurity/pcode2code/pcode2code/pcode2code.py -p code`

```
stream : VBA/ThisDocument - 938 bytes
########################################

stream : VBA/NewMacros - 1602 bytes
########################################

Sub Format()
  Dim a
  Dim B As String
  a = Array(102, 109, 99, 100, 127, 100, 53, 62, 105, 57, 61, 106, 62, 62, 55, 110, 113, 114, 118, 39, 36, 118, 47, 35, 32, 125, 34, 46, 46, 124, 43, 124, 25, 71, 26, 71, 21, 88)
  For i = 0 To UBound(a)
    B = B & Chr(a(i) Xor i)
  Next
End Sub
```

Cool! it is obvious that in the loop we're creating a string that consists of
elements of array "a", ciphered with XOR, where each letter is XOR-ed with its index.
Here's a code snippet, if you're stuck with decrypting the flag:

```python
def main():
    a = [102, 109, 99, 100, 127, 100, 53, 62, 105, 57, 61, 106, 62, 62, 55, 110, 113, 114, 118, 39, 36, 118, 47, 35, 32, 125, 34, 46, 46, 124, 43, 124, 25, 71, 26, 71, 21, 88]
    decrypted = ""
    for i in range(0, len(a), 1):
        decrypted += chr(a[i] ^ i)

    print(decrypted)

if __name__ == "__main__":
    main()
```
