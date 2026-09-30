## 🔍 Corrupted file
**Category:** Forensics

**Files/Links Provided:** ```file```

**Description:**  

```
This file seems broken... or is it? Maybe a couple of bytes
could make all the difference. Can you figure out how to bring
it back to life? Download the file here.
```

**Steps to Solve:**  
1. Download ```file```
2. Use xxd to inspect the hexdump of the file.
3. Compare the hex header of the corrupted file to a working jpg.
4. Save the xxd into a hexdump file, opening it in a text editor.
5. Repair the file by changing the first four digit hex to ```ffd8``` which is part of the file signature (header) of a jpg file.
6. Save the changes to the file.
7. Change the file extension to ```.jpg```.

**Code / Commands / Images**

![image](https://github.com/Greenest-Guy/picoMini-CMU-Africa-CTF-Writeup/blob/main/images/compare.png)
```bash
xxd file > filedump
xxd -r filedump > file
mv file file.jpg
```
[🏠 Back to Main Page](https://github.com/Greenest-Guy/CMU-Africa-picoMini-Writeup)
