# PW Crack 2

**Points:** 100

**Description:** Can you crack the password to get the flag?
Download the password checker here and you'll need the encrypted flag in the same directory too.

## Solution 

### Step 1

After downloading the two files, run the `cat level2.py` command to read the Python script. 

![Screenshot from 2023-07-09 19-49-01](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/51e0ff47-232c-4581-8227-0cc249105810)

If the `user_pw` is equal to the password given in the code, the flag is decrypted. The password is represented in hexadecimal format and needs to be converted to ASCII.

`password = 4ec9`
