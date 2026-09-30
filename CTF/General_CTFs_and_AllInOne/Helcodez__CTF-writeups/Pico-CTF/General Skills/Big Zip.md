# Big Zip

**Points:** 100

**Description:** Unzip this archive and find the flag.

## Solution 

### Step 1

Download the zip file then unzip it. 

```bash
unzip big_zip_files.zip
```

![Screenshot from 2023-07-16 22-45-17](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/cc185f3e-63df-4f4e-a984-f37a8afc730e)

To retrieve the flag we will use the `grep` command. 

```bash
cd big_zip_files
grep -r "picoCTF" * 
```
