# Description

A company stored a secret message on a server which got breached due to the admin using weakly hashed passwords. Can you gain access to the secret stored within the server?
Access the server using nc verbal-sleep.picoctf.net 52014

# Solution

For this challenge, you can use hashcat or john but it's simpler and faster to just use an online cracker for small and simple hashes like: `https://crackstation.net/`

There are three hashes given when connected. The first one is MD5, then SHA-1, and lastly SHA-256.

```
Welcome!! Looking For the Secret?

We have identified a hash: 482c811da5d5b4bc6d497ffa98491e38
Enter the password for identified hash: passw...
Correct! You've cracked the MD5 hash with no secret found!

Flag is yet to be revealed!! Crack this hash: b7a875fc1ea228b9061041b7cec4bd3c52ab3ce3
Enter the password for the identified hash: let...
Correct! You've cracked the SHA-1 hash with no secret found!

Almost there!! Crack this hash: 916e8c4f79b25028c9e467f1eb8eee6d6bbdff965f9928310ad30a8d88697745
Enter the password for the identified hash: qwe...
Correct! You've cracked the SHA-256 hash with a secret found. 
The flag is: picoCTF{UseStr0nG_h@shEs_&PaSswDs!_7f29...}
```

Once you give all the passwords it gives the flag.

Flag: `picoCTF{UseStr0nG_h@shEs_&PaSswDs!_7f29...}`