# 🚀 Crakk It
**Category** Digital Forensic
**Difficulty** Medium  
**Points:** 150

## Description
In this challenge, your task is to crack multiple layers of encryption to retrieve the hidden flag. The challenge consists of a password-protected ZIP file and a locked PDF document, requiring a combination of brute-force techniques and strategic decryption methods. Can you break through the layers and reveal the secret?

Flag Format: LakshyaCTF{Enter the flag as it is here}

## Files / Resources

- [file1.txt](./file1.txt)
- [file2.txt](./file2.txt)
- `flag.zip`

## Tools Used

 * unzip
 * John the Ripper

## 🧠 Analysis

- Step 1: Understanding the given files  
  Three files were given file1.txt, file2.txt, flag.zip.
  * `flag.zip` : By looking at the name it was sure that the flag was in flag.zip.
  * `file1.txt`: there are lot of random words separated with new line. Maybe a wordlist?
  * `file2.txt`: In this file **'noobmaster'** is repeated with several times but every time with different pattern and also separated with new line. It also looking like a word list.
- Step 2: Trying to open  the `flag.zip`

  ```bash
  $ unzip flag.zip
  Archive:  flag.zip
  [flag.zip] flag.pdf password:
  ```
  So the flag.zip was password protected but we have two wordlist lets try those.

- Step 3:  Cracking flag.zip  
  * Using `zip2john` (comes under John The Ripper package) extracting the password hash:
    ```bash
    $ zip2john flag.zip > hash.txt
    ver 2.0 efh 5455 efh 7875 flag.zip/flag.pdf PKZIP Encr: TS_chk, cmplen=159862, decmplen=161498, crc=D6F5CD0F ts=16BC cs=16bc type=8
  
    ```
  * Using john decrypting the hash with help of `file1.txt`
    ```bash
    $ john --wordlist=./file1.txt hash.txt
      Using default input encoding: UTF-8
      Loaded 1 password hash (PKZIP [32/64])
      Will run 12 OpenMP threads
      Press 'q' or Ctrl-C to abort, almost any other key for status
      1337h4x0r        (flag.zip/flag.pdf)     
      1g 0:00:00:00 DONE (2025-04-21 10:56) 50.00g/s 50000p/s 50000c/s 50000C/s r73h4130x..x330r147h
      Use the "--show" option to display all of the cracked passwords reliably
      Session completed. 
    ```
    so by reading the output we can say the pass is `1337h4x0r` 
- Step 4: unzipping flag.zip
  ```bash
  $ unzip flag.zip
  Archive:  flag.zip
  [flag.zip] flag.pdf password: 
  inflating: flag.pdf 
  ```
  So it extract a flag.pdf which is also **password** protected
- Step 5: Cracking flag.pdf
  * Using `pdf2john` (comes under John The Ripper Package) extracting the password hash:
    ```bash
    $ pdf2john flag.pdf > hash1.txt
    ```
  * Using john decrypting the hash with help of file2.txt
    ```bash
    $ john --format=PDF --wordlist=./file2.txt hash1.txt
    Using default input encoding: UTF-8
    Loaded 1 password hash (PDF [MD5 SHA2 RC4/AES 32/64])
    Cost 1 (revision) is 4 for all loaded hashes
    Will run 12 OpenMP threads
    Press 'q' or Ctrl-C to abort, almost any other key for status
    noobmaster       (flag.pdf)     
    1g 0:00:00:00 DONE (2025-04-21 11:05) 50.00g/s 38400p/s 38400c/s 38400C/s aobnemrtos..enormsatob
    Use the "--show --format=PDF" options to display all of the cracked passwords reliably
    Session completed. 
    ```
    So by reading the output we can say the password is `noobmaster`

- Step 6: Opening the flag.pdf  
  After opening the pdf we got the flag `n00bz{CR4CK3D_4ND_CR4CK3D_1a4d2e5f}`
## 🏁 Flag

```bash
LakshyaCTF{n00bz{CR4CK3D_4ND_CR4CK3D_1a4d2e5f}}
```