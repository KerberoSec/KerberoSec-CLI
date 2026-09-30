---
title: "AASTU CSC CTF | Hidden in Plain Sight 01"
date: 2025-04-13 00:00:00 +0800
category: [Cyber Blog, AASTU-CSC-CTF]
tags: [CTF, My ctf, Steganography]
image: Images/WriteUp-Image/aastu-logo.webp
alt: "aastu-ctf"
---

# Cyber Night CTF Day 01 Walkthrough Challenge 1

**Level**: Easy 🟢 <br>
**Challenge Link**: [Hidden in plain sight](https://t.me/AASTU_CyberClub/150) <br>
**Technique**:  EXIF-based Steganography <br>
**Tool**: [Exiftool](https://github.com/exiftool/exiftool) <br>
**Point: 100** <br>

**Description:**

What if your eyes are missing more than just pixels? Within an ordinary file lies an extraordinary secret. Steganography hides messages in plain sight: can you spot the hidden truth?

### Concept Behind the Challenge

#### 💡 What Is EXIF-based Steganography?

EXIF (Exchangeable Image File Format) is a standard for storing metadata in image files, such as camera details, GPS coordinates, date, and other properties. **EXIF-based steganography** involves hiding information, such as a flag, within this metadata, which is invisible in the image itself but can be extracted with tools like **ExifTool**.

In this challenge, the **flag** is hidden inside the **metadata of an image** file. The key to discovering it lies in extracting and analyzing the **EXIF metadata** of the image file.

#### 🌐 OSINT Relevance:

EXIF metadata is often **overlooked in publicly posted files** on social media, blogs, or websites. Attackers may use EXIF-based steganography to embed covert messages in **images** shared online, making it harder to detect at first glance. For **OSINT (Open-Source Intelligence)** gathering, analyzing metadata from publicly available images can provide critical information: from hidden messages to **location data** or even **timestamps** that reveal more about a target.

*[Image: flag1]*

This string looks like it is encrypted using base64 from the structure at the end "=". taking it and decoding it gives us our first flag.

*[Image: flag]*

You can also take the encrypted string and go to [cyberchef](https://gchq.github.io/CyberChef/) web which is basically a decryption and encryption tools repo.

{% include embed/youtube.html id='jhtFMqbp0bg' %}

✅ **Flag captured successfully!**

```sh
flag{h3110_fr0m_th3_0th3r_1ay3r}
```
