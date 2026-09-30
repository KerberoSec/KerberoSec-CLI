## Challenge 🧩

RED, RED, RED, RED

Author: Shuailin Pan (LeConjuror)</br>
Points: 100

Hints:

1. The picture seems pure, but is it though?
2. Red?Ged?Bed?Aed?
3. Check whatever Facebook is called now.

## Solution 🕵️‍♂️

Ran `exiftool` to find anything valuable

```bash
┌──(user㉿shell)-[~]
└─$ exiftool red.png
ExifTool Version Number         : 13.10
File Name                       : red.png
Directory                       : .
File Size                       : 796 bytes
File Modification Date/Time     : 2025:03:09 06:34:12-04:00
File Access Date/Time           : 2025:05:22 08:28:39-04:00
File Inode Change Date/Time     : 2025:03:09 06:34:12-04:00
File Permissions                : -rw-rw-rw-
File Type                       : PNG
File Type Extension             : png
MIME Type                       : image/png
Image Width                     : 128
Image Height                    : 128
Bit Depth                       : 8
Color Type                      : RGB with Alpha
Compression                     : Deflate/Inflate
Filter                          : Adaptive
Interlace                       : Noninterlaced
Poem                            : Crimson heart, vibrant and bold,.Hearts flutter at your sight..Evenings glow softly red,.Cherries burst with sweet life..Kisses linger with your warmth..Love deep as merlot..Scarlet leaves falling softly,.Bold in every stroke.
Image Size                      : 128x128
Megapixels                      : 0.016
```

Ran `zsteg` on the image to scan through different bit layers and color channels.

```bash
┌──(user㉿shell)-[~]
└─$ ./zsteg -a red.png                             
meta Poem           .. text: "Crimson heart, vibrant and bold,\nHearts flutter at your sight.\nEvenings glow softly red,\nCherries burst with sweet life.\nKisses linger with your warmth.\nLove deep as merlot.\nScarlet leaves falling softly,\nBold in every stroke."
b1,rgba,lsb,xy      .. text: "cGljb0NURntyM2RfMXNfdGgzX3VsdDFtNHQzX2N1cjNfZjByX3h4eHh4eHhffQ==cGljb0NURntyM2RfMXNfdGgzX3VsdDFtNHQzX2N1cjNfZjByX3h4eHh4eHhffQ==cGljb0NURntyM2RfMXNfdGgzX3VsdDFtNHQzX2N1cjNfZjByX3h4eHh4eHhffQ==cGljb0NURntyM2RfMXNfdGgzX3VsdDFtNHQzX2N1cjNfZjByX3h4eHh4eHhffQ=="
b1,rgba,msb,xy      .. file: OpenPGP Public Key
...
```

```bash
┌──(user㉿shell)-[~]
└─$ echo "cGljb0NURntyM2RfMXNfdGgzX3VsdDFtNHQzX2N1cjNfZjByX3h4eHh4eHhffQ==" | base64 --decode
picoCTF{r3d_1s_th3_ult1m4t3_cur3_f0r_xxxxxxx_}
```

### Tools Used

> `exiftool` </br>
> `zsteg`

## Flag 🚩

`picoCTF{r3d_1s_th3_ult1m4t3_cur3_f0r_xxxxxxx_}`
