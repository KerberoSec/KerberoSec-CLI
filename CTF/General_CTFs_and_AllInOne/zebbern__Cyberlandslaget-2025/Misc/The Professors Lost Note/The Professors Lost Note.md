
# Challenge: The Professor’s Lost Note

**Scenario:**  
A cybersecurity professor, Dr. Niels Andersen, has misplaced an important note (hint.txt) within a folder named `Professor_Notes`. The note is hidden and not immediately visible. Our goal is to locate the hidden file and retrieve the flag contained within it.

---

## Step-by-Step Writeup (Linux Terminal)

1. **Navigate to the Challenge Directory**

   ```bash
   cd /path/to/lost_note/Professor_Notes
   ```
   - Replace `/path/to/lost_note/Professor_Notes` with the actual path where you placed the `Professor_Notes` folder.

2. **List All Files (Including Hidden)**

   ```bash
   ls -la
   ```
   - Using the `-a` flag shows hidden files (those starting with a `.`).  
   - The output might show several files and directories. Among them, you notice something like `-rw-r--r-- 1 user user   ... .hint.txt`.

3. **Inspect the Hidden File**

   ```bash
   cat .hint.txt
   ```
   - The `cat` command will display the contents of the `.hint.txt` file in the terminal.

4. **Retrieve the Flag**

   - Upon viewing `.hint.txt`, you see the flag:
     ```
     DDC{3x4m4n5w3r5}
     ```
   - This is the flag you were searching for.

5. **Conclusion**

   - You have successfully found and retrieved the lost note containing the flag.  
   - **Flag:** `DDC{3x4m4n5w3r5}`

---

## Key Takeaways

- **Hidden Files on Linux**: Files or directories that start with a `.` are considered hidden on Unix-like systems.  
- **Listing Hidden Files**: Use `ls -a` or `ls -la` to display hidden files.  
- **Reading Files**: Use `cat`, `less`, `nano`, or any other text editor/command to view the file contents.

This approach ensures you systematically explore directories on Linux to find and read any hidden files. Once you locate the correct hidden file (`.hint.txt`), you can retrieve the flag inside it.
