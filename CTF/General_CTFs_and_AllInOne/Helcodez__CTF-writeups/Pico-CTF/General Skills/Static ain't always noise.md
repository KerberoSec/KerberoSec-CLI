# Static ain't always noise

**Points:** 20

**Description:** Can you look at the data in this binary: static? This BASH script might help.

## Solution 

### Step 1: 

After downloading the two files, static and BASH script. I checked the static file type. 

![Screenshot from 2023-07-05 22-19-28](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/c189d54d-ad07-4cf7-9cd2-a3c0fe2ab7a3)

The static file is an executable file.

![Screenshot from 2023-07-05 22-28-09](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/9a7dc195-d2dc-4cec-be24-b949a83fbfa1)

The second file is a simple bash script that echoes some log information and calls a command, `objectdump`, which is used to disassemble an executable which in our case is the static file.
If we execute the script in the terminal with the static file as an argument, it creates two files; `static.ltdis.strings.txt` and `static.ldis.x86_64.txt`
Finally, we just have to **cat** the file to retrieve the flag.

```bash
cat static.ltdis.strings.txt | grep picoCTF[
```
