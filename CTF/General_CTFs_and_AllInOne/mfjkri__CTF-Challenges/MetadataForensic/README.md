# MetadataForensic | Difficulty: Easy

## Requirements:

- Knowledge of metadata
- Using metadata extraction / display tools such as exif

This challenge is **`Part 1`** to a series of challenges:

1. **MetadataForensic** : flag@179369
2. SteganographyJPG : flag@singaporezoo
3. OSINTGitHistory : flag@notsohiddenanymore

---

## Steps:

1. Using `exif`

```bash
$ exif alamak.jpg
```

Outputs:

```bash
EXIF tags in 'Metadata/Files/alamak.jpg' ('Intel' byte order):
--------------------+----------------------------------------------------------
Tag                 |Value
--------------------+----------------------------------------------------------
Image Description   |flag@179369
X-Resolution        |72
Y-Resolution        |72
Resolution Unit     |Inch
Exif Version        |Exif Version 2.1
FlashPixVersion     |FlashPix Version 1.0
Color Space         |Uncalibrated
GPS Tag Version     |2.2.0.0
North or South Latit|N
Latitude            | 1, 17, 26.14
East or West Longitu|E
Longitude           |103, 50, 53.28
Altitude Reference  |Sea level
Altitude            | 0
--------------------+----------------------------------------------------------
```

Flag is found at:

```bash
Image Description   |flag@179369
```
