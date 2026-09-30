## Challenge 🧩

How about some hide and seek?

Author: MUBARAK MIKAIL</br>
Points: 100

Hints:

1. How can you view the information about the picture?
2. If something isn't in the expected form, maybe it deserves attention?

## Solution 🕵️‍♂️

Lets view the metadata of the file using `exiftool`

```bash
┌──(user㉿shell)-[~]
└─$ exiftool ukn_reality.jpg
ExifTool Version Number         : 12.80
File Name                       : ukn_reality.jpg
Directory                       : .
File Size                       : 2.3 MB
Zone Identifier                 : Exists
File Modification Date/Time     : 2024:03:20 12:57:57+05:30
File Access Date/Time           : 2024:03:20 12:58:22+05:30
File Creation Date/Time         : 2024:02:15 22:40:22+05:30
File Permissions                : -rw-rw-rw-
File Type                       : JPEG
File Type Extension             : jpg
MIME Type                       : image/jpeg
JFIF Version                    : 1.01
Resolution Unit                 : inches
X Resolution                    : 72
Y Resolution                    : 72
XMP Toolkit                     : Image::ExifTool 11.88
Attribution URL                 : cGljb0NURntNRTc0RDQ3QV9ISUREM05feHh4eHh4eHh9Cg==
Image Width                     : 4308
Image Height                    : 2875
Encoding Process                : Baseline DCT, Huffman coding
Bits Per Sample                 : 8
Color Components                : 3
Y Cb Cr Sub Sampling            : YCbCr4:2:0 (2 2)
Image Size                      : 4308x2875
Megapixels                      : 12.4
```

`Attribution URL` contains base64 encoded string lets decode it.

```bash
┌──(user㉿shell)-[~]
└─$ echo "cGljb0NURntNRTc0RDQ3QV9ISUREM05feHh4eHh4eHh9Cg==" | base64 -d
```

## Flag 🚩

`picoCTF{ME74D47A_HIDD3N_xxxxxxxx}`
