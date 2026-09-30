# Chrono

**Points:** 100

**Description:** How to automate tasks to run at intervals on linux servers?
Use ssh to connect to this server

## Solution 

### Step 1

First, let's start the instance and then connect to the server via SSH. `picoplayer@picoctf.net -p <port>` then enter the given password. 

![Screenshot from 2023-08-15 10-30-55](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/dcf120d7-101f-4122-a67e-86bbbedd79b5)

### Step 2

The only clue we have is the description. After doing some research I learned that for automating tasks on Linux, we use `corn Jobs`. 

Let's check if `cron jobs` is enabled on the server by using `crontab -e`

![Screenshot from 2023-08-15 11-31-03](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/e264860b-4a8f-4796-b337-f5badc5d84b3)

I encountered these errors.

### Step 3

Since we are not allowed to use crontab, let's check the `/etc/crontab` file. `cat /etc/crontab`
![Screenshot from 2023-08-15 11-32-22](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/e6e4da00-305e-4fbe-b510-d2f06f1a19bb)
 
 There I found the flag. 
