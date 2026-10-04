# mus1c

**Points:** 200

**Description:** I wrote you a song. Put it in the picoCTF{} flag format.

## Solution 

### Step 1

Upon downloading the provided file, we come across the following content:

![Screenshot from 2023-08-15 14-50-27](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/b64c8146-9d88-4095-b889-dbc400cd0cbe)

### Step 2

After reading the hint that said, "Do you think you can master Rockstar?", I did a bit of digging and found out that Rockstar is actually a type of programming language. So, I took the code they gave us, copied and pasted it into a Rockstar interpreter, and ended up with a list of numbers.

![Screenshot from 2023-08-15 15-31-46](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/5a3df65a-764e-4be9-a34e-d04a7bc9ea87)

### Step 3

Convert the list of numbers to strings. 

![Screenshot from 2023-08-15 15-38-51](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/f8797e65-f49c-41e6-b29e-7b97b243c908)
