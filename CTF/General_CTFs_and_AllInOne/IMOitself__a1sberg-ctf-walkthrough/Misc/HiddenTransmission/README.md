Sometimes, higher-point challenges have the simplest solutions.

In this challenge, we are given an audio file named `transmission.wav`. When you listen to it or open it in an audio analyzer, you will immediately notice **Morse code**. It is incredibly tempting to spend time decoding that Morse code, but if you do, you'll realize it's just fake text!. 

The real flag is actually hidden using basic steganography with an empty passphrase.

---

### The Solution
Just extract it using standard steghide. When prompted for a passphrase, simply press Enter to leave it blank.

```bash
steghide extract -sf transmission.wav 
Enter passphrase: 
wrote extracted data to "flag.txt".

cat flag.txt 
A1S{REDACTED}

```

