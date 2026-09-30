# 🔁 Bandit Level 12 → Level 13

## 🎯 Goal

The password for the next level is stored in the file data.txt, which is a hexdump of a file that has been repeatedly compressed. For this level it may be useful to create a directory under /tmp in which you can work. Use mkdir with a hard to guess directory name. Or better, use the command “mktemp -d”. Then copy the datafile using cp, and rename it using mv (read the manpages!)

---

## 🧪 Steps Taken

1. **Create a temporary working directory**

```bash
mktemp -d
cp data.txt /tmp/tmp.njQTN3XRtr
cd /tmp/tmp.njQTN3XRtr
```

2. **Reverse the hexdump**

```bash
xxd -r data.txt > data.bin
```

3. **Check the file type**

```bash
file data.bin
```

Output:

```
data.bin: gzip compressed data, was "data2.bin", last modified: Tue Oct 14 09:26:00 2025, max compression, from Unix, original size modulo 2^32 572
```

4. **Rename and decompress gzip**

```bash
mv data.bin data.gz
gzip -d data.gz
```

5. **Check the next format**

```bash
file data
```

Output: bzip2

6. **Rename and decompress bzip2**

```bash
mv data data.bz2
bzip2 -d data.bz2
```

7. **Check again**

```bash
file data
```

Output: gzip again → repeat rename and decompress

```bash
mv data data.gz
gzip -d data.gz
```

8. **Eventually get a tar file**

```bash
file data
tar -xf data
```

9. **Repeat the cycle**  
Each extracted file may be another compressed format (tar, gzip, bzip2). Keep renaming and decompressing as needed:

```bash
mv dataX.bin dataX.gz
gzip -d dataX.gz

mv dataY.bin dataY.bz2
bzip2 -d dataY.bz2

tar -xf dataZ
```

10. **Final file reveals the password**

```bash
cat data.txt
```

---

## 🔓 Password

```
FO5dwFsc0cbaIiH0h8J2eUks2vdTDwAn
```
