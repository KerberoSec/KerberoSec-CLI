# Wave

| 📁 Category   | 👨‍💻 Creator  |
|---------------|-------------|
 Forensics      | Eth007

**Description:**
> not a steg challenge i promise

**Attachment:** [🔗 wave.wav](https://2025.imaginaryctf.org/files/wave/wave.wav)

## My solution
As the description hints, this challenge is fairly simple and does not require complicated techniques of getting the secret flag from the audio file.

You can simply use the `strings` tool (preinstalled on Linux/macOS, can be installed from Sysinternals for Windows) to find the flag in the file's metadata:

<img width="289" height="189" alt="image" src="https://github.com/user-attachments/assets/427d5165-8537-4cec-abe7-b1b079cb6ea2" />

And that's it! We have found the flag 🎉
