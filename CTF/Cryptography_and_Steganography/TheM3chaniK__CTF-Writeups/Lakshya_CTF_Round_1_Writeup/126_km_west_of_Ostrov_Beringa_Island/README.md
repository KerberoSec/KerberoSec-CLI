# 🚀 126 km west of Ostrov Beringa Island
**Category** Steganography  
**Difficulty** Easy  
**Points:** 100

## Description
Flag Format : LakshyaCTF{enter your flag here as it is}

## Files / Resources

- `wow.jpg`

## Tools Used

 * steghide
 * cat
 * [CyberChef](https://gchq.github.io/CyberChef/)

## 🧠 Analysis

- Step 1: Extracting Hidden files  
  Since this is stego challenge, we started by Running `steghide`:

- Step 2: Reverse Image Search  
  To find the passphrase, we did a reverse image search using Google.
It led us to this website:  
 👉  https://byjus.com/physics/seismograph/  
We noticed the page title was Seismograph, so we tried that as the passphrase:
    ```bash
    steghide extract -sf wow.jpg -p seismograph
    ```
    ✅ Success! It extracted a file called flag.txt.

- Step 3: Viewing the Flag File
 To inspect the contents of flag.txt, we used:
    ```bash
    $ cat ./flag.txt
    ```
    Which gave us a long encoded string:
    ```swift
    4HE1o6T_Ev8]k#!X5f$HsB+R(@FciA]]-?QEO>a:#1Ez&pZZ5'[_o9T_F!8]AN!X6*$Hjv+EDLH.$naI-?s{O>+1#5i@`
    ```
- Step 4: Decoding the Flag  
  Using CyberChef, we tested various decoding methods.
We eventually found that decoding the string using:  
    1. From `Base92`
    2. Then From `Hex`
## 🏁 Flag

```bash
LakshyaCTF{Stego_is_hard}
```