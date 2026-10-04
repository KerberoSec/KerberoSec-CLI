---
title: "AASTU CSC CTF | Echoes of Silence 02"
date: 2025-04-13 00:00:00 +0800
category: [Cyber Blog, AASTU-CSC-CTF]
tags: [CTF, My ctf, Steganography]
image: Images/WriteUp-Image/aastu-logo.webp
alt: "aastu-ctf"
---
# Cyber Night CTF Day 01 Walkthrough Challenge 2

**Level**: Intermediate  🟡 <br>
**Challenge Link**:[Echoes of silence](https://t.me/AASTU_CyberClub/151) <br>
**Technique**: Audio Spectrogram Steganography (Text-based)  <br>
**Tool**: [Sonic Visualizer](https://www.sonicvisualiser.org/) <br>
**Point: 200** <br>

**Description:**

The hidden message lies within the frequencies of the audio. Start by examining the spectral data of the .wav file, and listen closely for any patterns or anomalies that might reveal something hidden in plain sight. Could subtle changes in the waves be the key to unlocking the truth?

### Concept Behind the Challenge

#### 🎵 What Is Spectrogram-Based Steganography?

A **spectrogram** is a visual representation of sound: frequency (vertical) over time (horizontal), with brightness indicating intensity.

In this challenge, a **text flag** (like `flag{text_flag}`) was **rendered as an image**, and that image was **converted into sound waves**. When opened with a spectrogram viewer, the hidden message is revealed visually: **not audibly**.

{% include embed/youtube.html id='HfkLSR_aLFE' %}

Boom we got the flag for challenge two but it is inverted, so we need to take screenshot and flip it Vertically then flip Horizontally. Here we goooo we found our flag.

*[Image: flag1]*

✅ **Flag captured successfully!**

```sh
flag{audio_wav3s_n3v3r_1i3}
```

Steganography in audio files is crucial for both **Red Team** operations, where it hides payloads or C2 data to evade detection, and **Blue Team** defense, where identifying covert channels is vital during DFIR. For **CTF competitors**, it enhances **analytical skills** and **creative problem-solving**. This technique is often used in **APT operations** and **C2 channels** to bypass traditional security measures. The challenge teaches **visual steganography** in audio, **tool-based investigation**, **pattern recognition**, and exposes participants to **real-world adversarial techniques**.
