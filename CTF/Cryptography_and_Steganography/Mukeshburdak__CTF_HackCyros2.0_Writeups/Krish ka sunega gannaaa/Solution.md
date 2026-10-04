# 🎵 Krish ka sunega gannaaa: CTF Challenge Writeup

> *"Some songs are not meant to be heard. Some songs are meant to be seen."*

---

## 🏁 Challenge Info

| Field | Details |
|-------|---------|
| **Name** | Krish Ka Ganna |
| **Category** | Steganography / Audio Forensics |
| **Flag Format** | `cyros{}` |
| **Flag** | `cyros{sound_can_be_seen_not_heard}` |

---

## 📜 Description

> Krish said he made a banger track. We listened. We regret listening.  
> It's just noise. Static. Audio that sounds like a fan arguing with a microwave.  
> But Krish keeps saying: *"Bro you're not listening properly..."*  
> Maybe... just maybe... this isn't meant for ears at all.  
> Some songs are not meant to be heard. Some songs are meant to be **seen** 👀

---

## 🔍 Solution

### Step 1: Identify the File

The challenge provides a file `krish_ka_ganna.me`. Despite the unusual extension, running `file` reveals it's a WAV audio file:

```bash
$ file krish_ka_ganna.me
krish_ka_ganna.me: RIFF (little-endian) data, WAVE audio, Microsoft PCM, 16 bit, mono 44100 Hz
```

### Step 2: The Hint: "Seen, Not Heard"

The description drops a big hint: *"Some songs are not meant to be heard. Some songs are meant to be seen."* This immediately points to **spectrogram steganography**: hiding data visually inside an audio file's frequency spectrum.

### Step 3: Generate the Spectrogram

Using Python with `scipy` and `matplotlib`, we generate a high-resolution spectrogram of the audio:

```python
import wave, numpy as np
from scipy import signal
import matplotlib.pyplot as plt

with wave.open('krish_ka_ganna.me', 'rb') as w:
    frames = w.readframes(w.getnframes())
    data = np.frombuffer(frames, dtype=np.int16).astype(float)
    rate = w.getframerate()

f, t, Sxx = signal.spectrogram(data, rate, nperseg=2048, noverlap=1024)

plt.figure(figsize=(20, 10))
plt.pcolormesh(t, f, 10*np.log10(Sxx + 1e-10), shading='gouraud', cmap='inferno')
plt.ylim(0, 22050)
plt.savefig('spectrogram.png', dpi=150)
```

### Step 4: Spot the QR Code

Focusing on the **0-8000 Hz frequency band**, a clear **QR code** becomes visible in the spectrogram:

```python
freq_mask = (f >= 500) & (f <= 8000)
img_data = np.flipud(10 * np.log10(Sxx[freq_mask] + 1e-10))

# Normalize to 0-255
img_norm = ((img_data - img_data.min()) / (img_data.max() - img_data.min()) * 255).astype(np.uint8)
```

<img width="574" height="574" alt="spectrogram_qr" src="https://github.com/user-attachments/assets/c77c6ab9-cc81-4d6e-a2bf-26e9c8c1a7c0" />

### Step 5: Decode the QR Code

Binarizing and decoding the extracted image using OpenCV:

```python
import cv2
import numpy as np

img = <spectrogram image as numpy array>
thresh = img.mean()
binary = np.where(img < thresh, 0, 255).astype(np.uint8)

detector = cv2.QRCodeDetector()
result, _, _ = detector.detectAndDecode(binary)
print(result)  # cyros{sound_can_be_seen_not_heard}
```

---

## 🏆 Flag

```
cyros{sound_can_be_seen_not_heard}
```

---

## 🛠️ Tools Used

- **Python 3**: scripting
- **SciPy** (`scipy.signal.spectrogram`): spectrogram generation
- **NumPy**: array manipulation
- **Pillow (PIL)**: image processing
- **OpenCV** (`cv2.QRCodeDetector`): QR code decoding

---

## 💡 Key Takeaways

- When an audio challenge sounds like pure noise, always visualize it as a spectrogram.
- Data can be hidden at specific frequency bands: look at both low and high frequency regions.
- QR codes, text, and even images can be painted into audio files using tools like [Sonic Visualiser](https://www.sonicvisualiser.org/) or custom scripts.
- The `file` command is your first friend: never trust a file extension.

---

## 📁 Files

```
.
├── krish_ka_ganna.me      # Challenge file (WAV audio)
├── solve.py               # Solution script
├── spectrogram_qr.png     # Extracted QR code from spectrogram
└── README.md              # This file
```

---

*Made with 🎧 and a healthy distrust of "music".*
