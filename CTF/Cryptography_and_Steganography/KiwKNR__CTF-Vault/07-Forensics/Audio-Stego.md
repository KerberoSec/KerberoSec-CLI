---
tags: [ctf, stego, audio, spectrogram]
created: 2026-05-01
---

# 🎵 Audio Steganography

> ซ่อน data ใน audio file (MP3, WAV, FLAC, OGG): มัก spectrogram, LSB ของ samples, DTMF, Morse code

---

## 🛠 Tools มาตรฐาน

| Tool | ใช้กับ |
|------|--------|
| **Audacity** ⭐ | Free audio editor + spectrogram view |
| **sonic-visualiser** ⭐ | Spectrogram + analysis |
| **Spek** | Quick spectrogram view |
| **DeepSound** (Windows) | LSB stego in audio |
| **SilentEye** | Multi-format stego |
| **steghide** | WAV, AU |

---

## 🎨 Spectrogram Analysis

### Concept
Audio file มี:
- **Time domain**: waveform (amplitude over time)
- **Frequency domain**: FFT จะเห็น frequency at each time

Spectrogram = visualize frequency over time → ถ้ามี hidden message มัก "draw" เป็นรูป/text ใน frequency domain

### Audacity
1. File → Open → audio.wav
2. คลิก track name → "Spectrogram" view
3. Click track menu → "Spectrogram Settings" → adjust frequency range/scale

หรือ:
3. Analyze → Plot Spectrum → ดู FFT

### sonic-visualiser
1. File → Open audio
2. Pane → Add Pane → "Add Spectrogram"
3. Adjust color scale, frequency range

### Spek (quick)
```bash
spek audio.wav
```
→ เปิดมา → spectrogram view ทันที

### CTF Pattern
ส่วนใหญ่ flag = text ที่เขียนใน high frequency band: ดู spectrogram ที่ frequency 5-15 kHz

ตัวอย่าง:
```
Frequency
   ↑
15kHz │  ▓▓▓ ▓▓▓ ▓ ▓  ▓▓▓     ← "FLAG"
12kHz │
 8kHz │  ████ ████ ███ ███ █
 4kHz │  ████ ████ ███ ███ ████ ████
   └────────────────────────→ Time
```

high frequency = ตัวอักษร, low frequency = noise/music

---

## 🔢 LSB ของ Audio Samples

### Concept
WAV samples = 16-bit (or 8-bit, 24-bit) integers
- เปลี่ยน LSB ของ sample → ไม่ได้ยินต่าง
- ใช้ technique เดียวกับ image LSB

### Extract LSB จาก WAV
```python
import wave

with wave.open('audio.wav', 'rb') as f:
    frames = f.readframes(f.getnframes())
    sample_width = f.getsampwidth()    # bytes per sample

# 16-bit samples = 2 bytes each (little-endian)
import struct
samples = struct.unpack('<' + 'h' * (len(frames) // 2), frames)

# Extract LSB
bits = ''
for s in samples:
    bits += str(s & 1)

# Convert to bytes
data = bytearray()
for i in range(0, len(bits) - 8, 8):
    byte = bits[i:i+8]
    data.append(int(byte, 2))

print(bytes(data[:200]))
```

### Variants
- LSB ของ left channel only / right channel only
- LSB ของ specific samples (every Nth)
- Multiple bits at end (last 2 bits, etc.)

---

## 📞 DTMF (Dual-Tone Multi-Frequency)

โทรศัพท์ tones: แต่ละปุ่ม = 2 frequencies ผสมกัน

| Key | Low (Hz) | High (Hz) |
|-----|----------|-----------|
| 1 | 697 | 1209 |
| 2 | 697 | 1336 |
| 3 | 697 | 1477 |
| 4 | 770 | 1209 |
| 5 | 770 | 1336 |
| 6 | 770 | 1477 |
| 7 | 852 | 1209 |
| 8 | 852 | 1336 |
| 9 | 852 | 1477 |
| * | 941 | 1209 |
| 0 | 941 | 1336 |
| # | 941 | 1477 |

### Detection
- เปิดใน Audacity → Spectrogram → เห็น tones ที่ frequencies เหล่านี้
- ฟัง: beep tones

### Decoder
- **DTMF Decoder** (online): dtmf.netlify.app
- **multimon-ng**:
  ```bash
  multimon-ng -t wav -a DTMF audio.wav
  ```
- **Python**: scipy/numpy + FFT
- บางตัวต้อง convert WAV เป็น mono 8000Hz ก่อน

---

## ⏱ Morse Code in Audio

### Detection
- ฟัง: short/long beeps (dot/dash)
- Spectrogram: เห็น single tone with patterns

### Decode
- **Online Morse decoder**
- **multimon-ng**:
  ```bash
  multimon-ng -t wav -a MORSE_CW audio.wav
  ```
- ใน Audacity: measure dot/dash duration → manually translate

### Morse cheat sheet
```
A .-      B -...    C -.-.    D -..     E .       F ..-.
G --.     H ....    I ..      J .---    K -.-     L .-..
M --      N -.      O ---     P .--.    Q --.-    R .-.
S ...     T -       U ..-     V ...-    W .--     X -..-
Y -.--    Z --..

0 -----   1 .----   2 ..---   3 ...--   4 ....-
5 .....   6 -....   7 --...   8 ---..   9 ----.
```

---

## 🎙 Reversed Audio

บางครั้ง flag อยู่ในเสียงที่ played reversed
- เปิดใน Audacity
- Effect → Reverse
- ฟัง / ดู spectrogram อีกครั้ง

---

## 🎚 Speed/Pitch Manipulation

ฟังเพลงปกติ → ไม่ได้ยินอะไร: แต่ slow down / speed up:
- Effect → Change Speed (Audacity)
- Effect → Change Pitch
- Effect → Change Tempo

อาจเปิดเผย hidden voice/Morse

---

## 📻 SSTV (Slow-Scan TV)

Audio ที่ encode รูปภาพ: ใช้ในวิทยุสมัครเล่น

### Detection
- เสียง "data tone" คล้าย dial-up modem

### Decode
- **RX-SSTV** (Windows)
- **QSSTV** (Linux)
- **MultiPSK**

→ ได้ภาพเป็นผลลัพธ์ → flag อยู่ในรูป

---

## 📡 Other RF/Audio modes

multimon-ng decode หลาย mode:
```bash
multimon-ng -a POCSAG512 -a POCSAG1200 -a POCSAG2400 -a EAS -a UFSK1200 -a CLIPFSK -a AFSK1200 -a AFSK2400 -a DTMF -a EEA -a EIA -a CCIR -a MORSE_CW -t wav audio.wav
```

ลองทุก mode: บางตัว detect

---

## 💾 DeepSound

Windows tool ที่ embed file ใน WAV/MP3
- **Decode**: install DeepSound → load file → "Extract"
- บางครั้งต้อง password
- File extension `.dswav` ทาง output

### Brute force DeepSound (ไม่มี tool ดี: ลอง manual common passwords)
- ลอง empty password
- common: "password", "deepsound", challenge name
- บาง challenge มี password leak ใน metadata หรือ context

---

## 🎵 MP3 Specific

### MP3 Frame structure
- header + side info + main data
- บาง stego embedded in frame slots

### MP3 metadata (ID3)
```bash
exiftool song.mp3
# ID3v1, ID3v2 tags: Title, Artist, Comment, etc.
```

ดู Comment / Lyrics field: มัก hide ตรงนั้น

### Tools
- **MP3Stego** (Windows)
- **ffmpeg**: extract data, convert format

---

## 🔊 WAV Specific

### Format
```
RIFF header + fmt chunk + data chunk
```

### Hidden data
- Custom chunks (non-standard)
- Data after RIFF declares size (oversize file)

```bash
xxd audio.wav | head -3
# RIFF .... WAVEfmt ...
# Compare declared size vs actual size
```

---

## 🎯 CTF Workflow

```
1. file audio.wav
2. exiftool audio.wav → metadata
3. strings audio.wav | grep -i flag
4. xxd audio.wav | head/tail → magic + extra data
5. binwalk audio.wav → embedded files

6. Open ใน Audacity:
   - View as Waveform
   - View as Spectrogram (most common!)
   - ลอง Reverse
   - ลอง Change Speed/Pitch

7. ฟัง:
   - DTMF? → multimon-ng -a DTMF
   - Morse? → multimon-ng -a MORSE_CW
   - Modem-like? → SSTV / RTTY / multimon-ng

8. LSB extract: ใช้ Python (sample width)

9. Steghide / DeepSound (with passwords)

10. หาก challenge ระบุ "tone" / "frequency": focus spectrogram
```

---

## 🎯 ตัวอย่าง CTF

### Example 1: Spectrogram flag
1. file → WAV
2. Open Audacity → Spectrogram view
3. → เห็น text "flag{spectro_w0w}" written in frequency
4. Done!

### Example 2: DTMF
1. ฟัง → beeps as on phone keypad
2. `multimon-ng -t wav -a DTMF audio.wav`
3. Output: `1 2 3 4 5 6 7 8 9 0`
4. ความหมาย: convert phone keypad letters → "ABC..." (T9-style)

### Example 3: Steghide WAV
1. file → WAV
2. exiftool → "passphrase: hint"
3. `steghide extract -sf audio.wav -p hint`
4. Get flag.txt

### Example 4: LSB WAV
1. file → WAV (mono, 16-bit)
2. `zsteg` ไม่ work
3. Python LSB extract → flag

---

## 🔗 ที่เกี่ยวข้อง

- [Stego-Intro](Stego-Intro.md)
- [Image-Stego](Image-Stego.md)
- [../07-Forensics/Forensics-Intro](../07-Forensics/Forensics-Intro.md)

## 📚 References

- audacityteam.org
- sonicvisualiser.org
- multimon-ng GitHub
- DeepSound (jpinsoft.net)

---

#ctf #stego #audio
