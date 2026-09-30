# Wave :ocean:

| Category  | Difficulty |
|:---------:|:----------:|
| Forensics | Easy       |

## Challenge Description
not a steg challenge i promise

## Attachment(s)
[wave.wav](https://github.com/ImaginaryCTF/ImaginaryCTF-2025-Challenges/blob/38ac5e6f7017683f906bcb1d8eb811096ee95b95/Forensics/wave/dist/wave.wav)

***

## Walkthrough
My initial process for forensics challenges is to look at the metadata of the attached file. Different commands for this include file, stat and exiftool. In this instance **exiftool** proved to help obtain the flag.

More on **exiftool** and installation instructions for Kali Linux can be found [here](https://www.kali.org/tools/libimage-exiftool-perl/#exiftool).

Running the command `exiftool wave.wav` on the downloaded file returns file metadata including file type, permissions, etc. Looking closer we can see the flag is in the **Comment** field.

*[Image: Get the flag using exiftool.]*

Challenge solved! :sunglasses:
