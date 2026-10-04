# Matryoshka doll

**Points:** 30

**Description:** Matryoshka dolls are a set of wooden dolls of decreasing size placed one inside another. What's the final one? Image: this

## Solution 

### Approach

There's a method that involves hidding a file within an image. To uncover the hidden file, you can use the `unzip` command in the terminal. In this instance, executing the command
will produce a new folder. When you navigate to this folder using the `cd` command, you'll encounter another image. 

![Screenshot from 2023-09-03 19-02-14](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/d7fe0536-fa29-43e2-af68-9a1af6ec9e08)

Repeat these steps iteratively until you eventually locate a file named "flag.txt."

![Screenshot from 2023-09-03 20-41-50](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/09c471b0-3b64-4380-8df3-8e5272ededf7)
