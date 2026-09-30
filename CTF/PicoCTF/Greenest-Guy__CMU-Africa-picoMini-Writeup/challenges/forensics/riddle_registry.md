## 🔍 Riddle Registry
**Category:** Forensics

**Files/Links Provided:** ```Hidden Confidential Document```

**Description:**  

```
Hi, intrepid investigator! 📄🔍 You've stumbled upon a peculiar
PDF filled with what seems like nothing more than garbled nonsense.
But beware! Not everything is as it appears. Amidst the chaos lies
a hidden treasure-an elusive flag waiting to be uncovered.
Find the PDF file here Hidden Confidential Document and
uncover the flag within the metadata.
```

**Steps to Solve:**  
1. Open the link to the ```Hidden Confidential Document```
2. Download the file as a PDF
3. Use Exiftool to read the metadata of ```confidential.pdf``` and store it in a txt file.
4. Copy the author information into another txt file.
5. Decode the author from Base64 into plaintext to get the flag.

**Code / Commands / Images**
```bash
exiftool confidential.pdf > metadata.txt
base64 -d "author.txt"
```
[🏠 Back to Main Page](https://github.com/Greenest-Guy/CMU-Africa-picoMini-Writeup)