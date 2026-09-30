# Objetive

- The password for the next level is stored in /etc/bandit_pass/bandit14 and can only be read by user bandit14. For this level, you don’t get the next password, but you get a private SSH key that can be used to log into the next level.>

## Solution
- At first I didn't know how to use the private key to connect to the server, then I discovered that by copying the file to my local PC and using it to connect via SSH as if I had a local password, ssh -i "file" allowed me to access ba>
-You need to give permissions to the file where you copy the key
- MU4VWeTyJk8ROof1qqmcBPaLh7lDCPvS

## Commands used
- ssh -i
- ls
- cd
- pwd
- chmod 600 bandit14
- cat /etc/bandit_pass/bandit14

