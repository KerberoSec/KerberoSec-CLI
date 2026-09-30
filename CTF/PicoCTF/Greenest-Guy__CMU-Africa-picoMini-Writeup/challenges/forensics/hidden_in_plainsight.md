## 🔍 Hidden in plainsight
**Category:** Forensics

**Files/Links Provided:** ```img.jpg```

**Description:**  

```
You’re given a seemingly ordinary JPG image. Something is
tucked away out of sight inside the file. Your task is to
discover the hidden payload and extract the flag. Download
the jpg image here.
```

**Steps to Solve:**  
1. Download ```img.jpg```
2. Use ExifTool to read the metadata of ```img.jpg``` and save it to ```metadata.txt```.
3. Decode the comment ```c3RlZ2hpZGU6Y0VGNmVuZHZjbVE9``` within the metadata using Base64 returning ```steghide:cEF6endvcmQ=```.
4. Decode ```cEF6endvcmQ=``` using Base64 again returning ```pAzzword```.
5. Use steghide along with the password to get the flag.

**Code / Commands / Images**
```bash
base64 -d file.txt
steghide extract -sf img.jpg -p pAzzword
```
[🏠 Back to Main Page](https://github.com/Greenest-Guy/CMU-Africa-picoMini-Writeup)