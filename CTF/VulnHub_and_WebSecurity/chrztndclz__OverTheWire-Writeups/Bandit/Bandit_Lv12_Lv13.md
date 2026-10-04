
##  Level 12: Level 13

Tags:
#Bandit 

---

## Level Goal

The password for the next level is stored in the file data.txt, which is a hexdump of a file that has been repeatedly compressed. For this level it may be useful to create a directory under /tmp in which you can work. Use mkdir with a hard to guess directory name. Or better, use the command “mktemp -d”. Then copy the datafile using cp, and rename it using mv (read the manpages!)

---

## Commands

Commands you may need to solve this level

grep, sort, uniq, strings, base64, tr, tar, gzip, bzip2, xxd, mkdir, cp, mv, file

---

## Tips

Helpful Reading Material

[Hex dump on Wikipedia](https://en.wikipedia.org/wiki/Hex_dump)

---

## Analysis

This challenge required recognizing different file encodings and compression formats. By repeatedly using the file command and the appropriate extraction tools, the hidden data gradually became accessible. The key skill involved was identifying the correct sequence of decompression steps to reveal the final password.

---

## Methodology
**Step 1:** Create a working directory in /tmp

mktemp -d
cd /tmp/<generated_folder>

**Step 2:** Copy the data file

cp ~/data.txt .

**Step 3:** Reverse the hexdump

xxd -r data.txt > data.bin

<img width="641" height="143" alt="image" src="https://github.com/user-attachments/assets/43ff129f-d204-4a35-b06f-6a73b2e4bf6e" />

Step 4: Identify the file type

file data.bin

This will tell you whether it is:

- gzip (`.gz`)
- bzip2 (`.bz2`)
- tar archive
- ASCII text

Rename accordingly, e.g.:

`mv data.bin data.gz`

Step 5: Decompress based on the file type

- gzip:
	`gunzip data.gz`
- bzip2:
	`bunzip2 data.bz2`
- tar:
	`tar -xf data.tar`
- ASCII text:
	`cat or strings command`

Step 6: First Decompress
file data.bin
data.bin: gzip compressed data, was "data2.bin", last modified: Tue Oct 14 09:26:00 2025, max compression, from Unix, original size modulo 2^32 572

mv data.bin data.gz
gunzip data.gz

<img width="610" height="163" alt="image" src="https://github.com/user-attachments/assets/ca9be44c-2f68-4700-9137-09a7f007672a" />

Step 7: Second Decompress
file data
data: bzip2 compressed data, block size = 900k

mv data data.bz2
bunzip2 data.bz2

<img width="549" height="168" alt="image" src="https://github.com/user-attachments/assets/7669e1fe-7c60-448e-8ff8-70eb6ac2d1ae" />

Step 8: Third Decompress
file data
data: gzip compressed data, was "data4.bin", last modified: Tue Oct 14 09:26:00 2025, max compression, from Unix, original size modulo 2^32 20480

mv data data.gz
gunzip data.gz

<img width="550" height="168" alt="image" src="https://github.com/user-attachments/assets/28aea45d-967a-4f28-a682-12d8ecf76032" />

Step 9: Fourth Decompress
file data
data: POSIX tar archive (GNU)

mv data data.tar
tar -xf data.tar

<img width="540" height="126" alt="image" src="https://github.com/user-attachments/assets/e985abea-f7b8-4b50-b457-204b9f38812c" />

Step 10: Fifth Decompress
file data5.bin 
data5.bin: POSIX tar archive (GNU)

mv data5.bin data5.tar
tar -xf data5.tar

<img width="600" height="130" alt="image" src="https://github.com/user-attachments/assets/e43415ae-0ec7-40b6-8e8f-9a34e09f8443" />

Step 11: Sixth Decompress
file data6.bin 
data6.bin: bzip2 compressed data, block size = 900k

mv data6.bin data6.bz2
bunzip2 data6.bz2

<img width="598" height="124" alt="image" src="https://github.com/user-attachments/assets/423bc478-51f3-4a0a-b480-c43d99e8669e" />

Step 12: Seventh Decompress
file data6
data6: POSIX tar archive (GNU)

mv data6 data6.tar
tar -xf data6.tar

<img width="561" height="126" alt="image" src="https://github.com/user-attachments/assets/b06a67fc-c80d-4b41-8374-3253d6a30611" />

Step 13: Eigth Decompress
file data8.bin
data8.bin: gzip compressed data, was "data9.bin", last modified: Tue Oct 14 09:26:00 2025, max compression, from Unix, original size modulo 2^32 49

mv data8.bin data8.gz
gunzip data8.gz

<img width="590" height="127" alt="image" src="https://github.com/user-attachments/assets/2ce4c5d4-b68a-467f-8b72-a1045bdee24c" />

Step 14: Ninth Decompress
file data8
data8: ASCII text

It's already an ASCII text we can now use 'cat command' to retrieve the password

cat data8

Step 15: Copy the password and log in to the next level

Use SSH again, replacing the username with the next level:

ssh bandit13@bandit.labs.overthewire.org -p 2220

When asked, paste the password you found.

---

## Password

FO5---------wAn

---

## Reflection

This level emphasizes the importance of working methodically instead of rushing or relying on guesswork. Each stage reinforces that identifying the file type first is the safest and most efficient approach, especially when handling unknown or corrupted-looking data. It also highlights how useful Linux tools like file, xxd, tar, gzip, and bzip2 are when analyzing layered or obfuscated files. Completing this challenge improves practical troubleshooting skills, strengthens familiarity with compression formats, and deepens confidence in navigating complex file extraction processes: skills that are highly valuable in real-world cybersecurity and forensic analysis.

---

