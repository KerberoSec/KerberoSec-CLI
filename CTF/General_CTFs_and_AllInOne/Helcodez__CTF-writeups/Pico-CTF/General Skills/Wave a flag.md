# Wave a flag

**Points:** 10

**Description:** Can you  invoke help flags for a tool or binary? This program has extraordinarily helpful information...

## Solution 

### Initial Analysis

I downloaded the program named warm.

### Step 1: 
I ran the program in the terminal:

`$ ./warm`

It gives us an error. To give the appropriate permissions run:

`$ chmod +x warm`

Now run the program again

![Screenshot from 2023-07-04 22-33-20](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/033d66ca-8709-4eb9-ba3a-acf73c1696b6)

`$ ./warm -h`

![Screenshot from 2023-07-04 22-34-12](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/ca60e1d1-f83c-43ca-a4f0-eff5c9c65bf0)
