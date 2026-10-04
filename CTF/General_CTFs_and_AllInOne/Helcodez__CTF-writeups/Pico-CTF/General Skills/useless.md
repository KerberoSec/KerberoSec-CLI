# useless

**Points:** 100

**Description:** There's an interesting script in the user's home directory
Additional details will be available after launching your challenge instance.

## Solution 

### Step 1

Launch the instance then connect to the SSH server. Once connected run `ls`, we can see that there's a script called `useless`. Here we can see the script inside the file:

![Screenshot from 2023-08-15 13-06-01](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/94d5e933-e022-4a48-8e73-4bb8d55af474)

### Step 2

When examining the "echo" statement within the "else" condition, it becomes apparent that we need to refer to the manual for the specified file. To achieve this, execute the command `man useless`. Towards the end of the manual, we can find the flag.

![Screenshot from 2023-08-15 13-18-10](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/5327e8a6-2467-432b-a7a1-546e2b1b5084)
