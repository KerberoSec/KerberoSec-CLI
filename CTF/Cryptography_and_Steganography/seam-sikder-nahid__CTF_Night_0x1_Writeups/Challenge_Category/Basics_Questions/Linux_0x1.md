# Linux 0x1

**Category:** Basics Questions 

**Author:** Pran0x

---

### Question:
What does the command `chmod +x script.sh` do?

A) Deletes the script  
B) Makes the script executable  
C) Compresses the script  
D) Moves the script to /bin  

**Enter the Ans only (i.e. A):** 

---

### Answer: B

---

### Explanation:

The `chmod` command in Linux is used to change the file permissions of a file or directory. The `+x` option specifically adds the execute permission to the file.

- `chmod +x script.sh` means making the file `script.sh` executable.  
- After this command, you can run the script directly from the terminal by typing `./script.sh`, assuming it has a proper shebang (`#!`) at the top.  
- Without the execute permission, the script cannot be run as a program directly.

---

### Additional notes:

- To verify the permissions, use `ls -l script.sh`. You will see an `x` in the permission bits if the file is executable.  
- To remove execute permission, you can use `chmod -x script.sh`.  
