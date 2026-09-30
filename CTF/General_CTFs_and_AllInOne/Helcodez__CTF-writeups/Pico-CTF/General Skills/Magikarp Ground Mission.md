# Magikarp Ground Mission

**Points:** 30

**Description:** Do you know how to move between directories and read files in the shell? Start the container, `ssh` to it, and then `ls` once connected to begin. Login via `ssh` as `ctf-player` with the password, `abcba9f7`
Additional details will be available after launching your challenge instance.

## Solution 

### Step 1

First, let's start the instance and then connect to the server via SSH `ssh ctf-player@venus.picoctf.net -p 60909` with the password `abcba9f7`.

### Step 2

 Using the `ls` command we get two files 

![Screenshot from 2023-07-06 13-45-13](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/89f3a590-7dda-4610-9242-144e64a89c27)

The  `Iof1.flag.txt` file gives us the first part of the file

![Screenshot from 2023-07-06 13-46-56](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/d740f314-08fb-414b-8f16-e551e82a349e)

And `instruction-to-2of3.txt` tells us to mode in the root directory 

![Screenshot from 2023-07-06 13-51-39](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/b367419a-90c1-47ab-82ce-b43fba6b31a5)

### Step 3
Use the `cd/` command to move into the root directory. 

![Screenshot from 2023-07-06 14-01-38](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/4bfa8a30-de06-48e1-b617-4996c88f3f0b)

The `2of3.flag.txt` contains the second part of the flag. 

![Screenshot from 2023-07-06 14-03-42](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/a6968101-3c7d-4e90-9bae-b77c93030177)

The `instructions-to-3of3.txt` file contains the instruction for the next step.

![Screenshot from 2023-07-06 14-07-17](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/3afa5890-6891-4df5-9af2-974a4428a12c)

Type `cd~`. You can find the last part of the flag in the `3of3.flag.txt`

![Screenshot from 2023-07-06 14-10-44](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/f0413e4e-ad1e-4f24-906e-84a2237b27de)
