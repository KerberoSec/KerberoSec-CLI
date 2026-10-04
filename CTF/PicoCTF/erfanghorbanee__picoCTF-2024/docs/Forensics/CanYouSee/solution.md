# CanYouSee

## Description

How about some hide and seek?
Download this file [here](https://github.com/erfanghorbanee/picoCTF-2024/blob/main/Forensics/CanYouSee/ukn_reality.jpg).

## Solution

check the metadata of the given picture for clues. I used this command:

```shell
exiftool ukn_reality.jpg
```

this is the output:

```shell
File Name                       : ukn_reality.jpg
Directory                       : .
File Size                       : 2.3 MB
File Modification Date/Time     : 2024:03:12 01:05:53+01:00
File Access Date/Time           : 2024:03:17 20:13:52+01:00
File Inode Change Date/Time     : 2024:03:17 20:13:50+01:00
File Permissions                : -rw-r--r--
File Type                       : JPEG
File Type Extension             : jpg
MIME Type                       : image/jpeg
JFIF Version                    : 1.01
Resolution Unit                 : inches
X Resolution                    : 72
Y Resolution                    : 72
XMP Toolkit                     : Image::ExifTool 11.88
Attribution URL                 : cGljb0NURntNRTc0RDQ3QV9ISUREM05fYjMyMDQwYjh9Cg==
Image Width                     : 4308
Image Height                    : 2875
Encoding Process                : Baseline DCT, Huffman coding
Bits Per Sample                 : 8
Color Components                : 3
Y Cb Cr Sub Sampling            : YCbCr4:2:0 (2 2)
Image Size                      : 4308x2875
Megapixels                      : 12.4
```

Do you notice something interesting as well? yes, the value of the Attribution URL looks like a base64 encoded string.

You can decode it using [this](https://www.base64decode.org/) site.

flag: **picoCTF{ME74D47A_HIDD3N_b32040b8}**
