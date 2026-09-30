# flag_shop

**Points:** 300

**Description:** There's a flag shop selling stuff, can you buy a flag? Source. Connect with nc jupiter.challenges.picoctf.org 4906.

## Solution 

### Step 1

Download the provided file then run the command to connect to the Netcat server. 

### Step 2

Doing some review of the source code.
- On line 8, `account_balance` is signed integer, initialized to 1100
- On line 42, `account_balance` is updated after a transaction.

Since the variable `account_balance` is signed, there's a chance we can manipulate it to cause an overflow. This might turn it into a negative number. Now, this is interesting because it could help us bypass the check on line 41 that looks for negative numbers. In this way, we could effectively add credit to the `account_balance`.

![Screenshot from 2023-08-15 19-10-03](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/b3e9cf39-16d6-4999-89ff-08e27009a0ec)

### Step 3

Let's give this a shot! To purchase a flag, we'll need to have a balance of at least 100,000.

![Screenshot from 2023-08-15 19-29-52](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/e678b63e-3a94-4e49-ab1a-bcc39b91953f)

It worked! Now we have more than enough credit to buy the flag. 

![Screenshot from 2023-08-15 19-32-26](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/27b121e8-9382-45ad-987e-e2a2fd0aeed8)
