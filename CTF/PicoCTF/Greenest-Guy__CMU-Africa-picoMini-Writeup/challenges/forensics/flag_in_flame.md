## 🔍 Flag in Flame
**Category:** Forensics

**Files/Links Provided:** ```logs.txt```

**Description:**  

```
The SOC team discovered a suspiciously large log file after a
recent breach. When they opened it, they found an enormous block
of encoded text instead of typical logs. Could there be something
hidden within? Your mission is to inspect the resulting file and
reveal the real purpose of it. The team is relying on your skills
to uncover any concealed information within this unusual log.
Download the encoded data here: Logs Data. Be prepared-the file
is large, and examining it thoroughly is crucial.
```

**Steps to Solve:**  
1. Download ```logs.txt```.
2. Decode the contents of ```logs.txt``` from base64.
3. Convert ```image.txt``` into a png file to generate an image.
4. Transcribe the text depicted within the image.
5. Decode the text from hexadecimal into the flag.

**Code / Commands / Images**
```bash
base64 -d "logs.txt" > image.txt
mv image.txt image.png
```
[🏠 Back to Main Page](https://github.com/Greenest-Guy/CMU-Africa-picoMini-Writeup)