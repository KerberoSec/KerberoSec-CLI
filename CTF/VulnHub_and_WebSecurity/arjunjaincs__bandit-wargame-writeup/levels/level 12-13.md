# 🧭 Bandit Level 12 → 13

## 🎯 Level Goal
> The password for the next level is stored in the file **data.txt**, which is a hexdump of a file that has been repeatedly compressed. For this level it may be useful to create a directory under /tmp in which you can work. Use mkdir with a hard to guess directory name. Or better, use the command “mktemp -d”. Then copy the datafile using cp, and rename it using mv (read the manpages!)

---
## 📂 Key Commands Used

```
mktemp -d
cp data.txt /tmp/tmp.rXWwPtzVFM
mv data.txt test.txt
xxd -r test.txt binary.txt
file binary.txt
mv binary.txt binary.gz
gunzip binary.gz
mv binary binary.bz2
bzip2 -d binary.bz2
tar --extract --file binary
```

---
## 🧠 Takeaways

- Used `mktempt -d` first to create a temporary folder to do this level since things were about to get messy.
- Started with decoding the hexdump so we have the file that has been repeatedly compressed.
- Found the kind of file using `file` command, renamed the suffix to match with the tool (gz for gunzip and bz2 for bzip2) and uncompressed using the tool that compressed it.
- After about 8-9 layers finally received the ASCII text form and found the password.

---
## 🔐 Password for Level 13
``
```
FO5dwFsc0cbaIiH0h8J2eUks2vdTDwAn
```

---