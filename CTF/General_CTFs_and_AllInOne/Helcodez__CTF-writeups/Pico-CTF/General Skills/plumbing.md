# plumbing

**Points:** 200

**Description:** Sometimes you need to handle process data outside of a file. Can you find a way to keep the output from this program and search for the flag? Connect to jupiter.challenges.picoctf.org 7480.

## Solution 

### Step 1

Connect to the Netcat server then `grep` the flag using this command `nc jupiter.challenges.picoctf.org 7480 | grep 'picoCTF'`

![Screenshot from 2023-08-15 14-06-46](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/2f11c720-e1f6-4782-9b87-4cf08f8472e7)
