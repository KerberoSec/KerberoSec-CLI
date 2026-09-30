# Mouse

We're given a binary file `mouse`.

I tried opening it with IDA and discovered strings like `Intel`, `Wireshark` and `Windows`, so I decided to open it in Wireshark instead.

We soon find out that it is a USB pcap file, with inputs `b` and `c` only.

However, the hex shown vary with many various digits, so we thought of using a USB translator, which you can also find at Microsoft's official page: 

[USB HID to PS/2 Scan Code Translation Table: Microsoft](https://download.microsoft.com/download/1/6/1/161ba512-40e2-4cc9-843a-923143f3456c/translate.pdf)

Hence we wrote a python script to translate the hex into their alphanumeric counterparts:

[Placeholder]

which gives us a string with all the direction characters (Left, Right and Enter) at the bottom.

[Placeholder]

So, starting at the end of the string, we follow the directions and press the keyboard accordingly to get:

```
AAAAAAAAA
ISSSSSSSSSXVX
SBCBB
IQWERD
TFD
DCXZ
TVB
U{
{{{SDFUCV{KKK
IOZCT
-
L
0CVB1111111--MKC
VLLONG
3CV
-
KCXI
3Z2X1CKI
YPPO
BBN
OMMM
AQWER}}AAA
R
D
}
```

The flag is in the first column of the code: `ISITDTU{I_L0V3_K3yB0ARD}`
