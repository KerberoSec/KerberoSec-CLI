### Permission Detective: CTF Writeup
>**Category:** Linux

**Flag Format:** ```CSC{XXXX_XXX_XXXX}```

---

### Description:

A file named flag.tar exists in /home/user/ but you can't read it. The flag is the octal permission needed to make the file readable by everyone.

**Download File:** `flag.tar`

---

### Approach:

I began by reading the challenge description carefully. The task involved a file named ``flag.tar`` located in /home/user/, which could not be read directly. The goal was to determine the octal permission needed to make the file readable by everyone and retrieve the flag.

I downloaded the **flag.tar** file and opened a terminal. Out of curiosity, I attempted to read the contents directly using:

    cat flag.tar
    

*[Image: Image]*

To my surprise, the command revealed a line containing the flag:

    flag.txt0000000000175000017500000000002715046125723013010 0ustar  revolverrevolverCSC{Sudoers_G0ne_W1ld}

From this, I could extract the flag clearly.

This was a straightforward task: simply accessing the archive revealed the required information.

---

### **Flag:** ```CSC{Sudoers_G0ne_W1ld}```
