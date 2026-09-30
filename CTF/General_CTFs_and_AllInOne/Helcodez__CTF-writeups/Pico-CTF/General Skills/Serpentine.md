# Serpentine

**Points:** 100

**Description:** Find the flag in the Python script!

## Solution 

### Step 1

Download and run the Python script. 

![Screenshot from 2023-07-16 21-56-21](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/2558a8f2-c2e8-4ef9-8bb6-c4c64fe27d1d)

When chossing the second choice (b) to print the flag, we get this message. 

![Screenshot from 2023-07-16 22-02-49](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/ba4becce-fa14-4459-81b8-349e51e9851d)

In the source code, we can observe that within the `elif` statement, instead of printing the `print_flag` function, it displays the message.

![Screenshot from 2023-07-16 22-06-11](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/13ac5ed4-cd7f-4be4-8c35-1a0c54e3b45f)

To retrieve the flag just repalce the message with the `print_flag` function.
![Screenshot from 2023-07-16 22-12-33](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/8325b6d2-ed5a-4334-ac09-681359c22042)

Run the script again and choose `b`.
