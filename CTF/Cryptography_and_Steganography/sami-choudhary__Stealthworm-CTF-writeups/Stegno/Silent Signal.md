# Challenge: Silent Signal
**Category:** Steganography / Audio (Morse Code)  
**Points:** 500  
**Author:** Sami Choudhary  

**Challenge statement:**  
> Something unusual is hidden in the static. The transmission seems meaningless at first: just a series of short and long pulses. But if you listen with the right ears, the silence begins to speak.  
>
> Can you uncover what the signal is trying to tell you?

---

## Files provided
- `SilentSignal.zip`: archive containing:  
  - `decode.wav` (audio file containing encoded message)  
  - `flag.txt` (helper hint file with partial info: `SW{itna_bhi_asan_nahi_ha}` and note about 750 Hz)

---

## Reproduction (what players see)
Extract the archive:

$ unzip SilentSignal.zip -d silent_signal  
$ cd silent_signal  
$ ls  
decode.wav  flag.txt  

The `flag.txt` gives a misleading placeholder (`SW{itna_bhi_asan_nahi_ha}`) but also contains a **hint** about using frequency **750 Hz**.

---

## Quick solution (one-line)
The `.wav` file contains **Morse code** at ~750 Hz. Decoding it yields:

RIPH4HMAH4CKERBNAG4  

So the flag is:

SW{RIPH4HMAH4CKERBNAG4}

---

## Step-by-step analysis & solution

### 1. Inspect the audio file
Check metadata:

$ file decode.wav  
decode.wav: RIFF (little-endian) data, WAVE audio  

Play it and you will hear a sequence of beeps (short and long tones), typical of **Morse code**.

---

### 2. Use frequency hint (750 Hz)
The `flag.txt` mentions **750 Hz**. This matches the beep frequency in the file, confirming Morse encoding.

---

### 3. Decode Morse code
You can decode in multiple ways:

- **Online decoder:** Upload `decode.wav` to a Morse decoder (e.g., Morse Code World). Set tone frequency to ~750 Hz.  
- **Local tool (Linux):** Use `minimodem`:  

$ minimodem --rx morse -f 750 < decode.wav  

---

### 4. Output
The decoded text is:  

RIPH4HMAH4CKERBNAG4  

---

### 5. Final Flag
Wrap the decoded string in the flag format:  

SW{RIPH4HMAH4CKERBNAG4}  

---

## Notes
- The `flag.txt` serves as a **decoy**, but its 750 Hz note is crucial.  
- This is a classic **audio steganography challenge** using Morse code.  
- Tools like `minimodem`, `audacity`, or online Morse decoders are useful for such problems.
