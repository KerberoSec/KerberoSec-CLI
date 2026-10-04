# 🚀 QR Chronicles
**Category** Digital Forensic
**Difficulty** Easy  
**Points:** 100

## Description
A simple CSV file? Think again! This file hides a crucial secret within its structured data, but it's not immediately visible to the naked eye. The key to unlocking it lies in understanding the encoded coordinates stored within. Can you decipher the hidden pattern and extract the concealed information?

Flag Format: LakshyaCTF{enter your flag as it is here}

## Files / Resources

- [secret_1_.xlsx](./secret_1_.xlsx)
- [requirements.txt](./requirements.txt)
- `script.py`

## Tools Used

 * python3
 * `script.py`
 

## 🧠 Analysis

- Step 1: Understanding the file  
  Opening the [secret_1_.xlsx](./secret_1_.xlsx) file we saw in the 1st column there (row,col). We thought maybe it was some type of coordinates (x,y)

- Step 2: Plotting graph using the coords
  We made a custom python script to plot the graph
  ```bash
  $ pip3 install -r requirements.txt
  $ python3 script.py
  ```
- Step 3: Understanding the graph  
  Looking at the graph it surely was a qr code.

- Step 4: To make it look more like qr we had to change our py code little bit
- Step 5: Scanning the QR  
  When we scan the qr we found
  ```bash
  n00bz{qr_c0d3_1n_4_t3xt_f1l3_w0w!!!!!!}
  ```

## 🏁 Flag

```bash
LakshyaCTF{n00bz{qr_c0d3_1n_4_t3xt_f1l3_w0w!!!!!!}}
```