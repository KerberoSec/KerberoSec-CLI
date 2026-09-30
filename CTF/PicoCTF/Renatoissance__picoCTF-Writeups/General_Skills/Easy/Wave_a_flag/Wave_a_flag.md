# Challenge: Wave a flag
**Category:** General Skills | **Difficulty:** Easy | **Author:** syreal

## Challenge Description
*"Can you invoke help flags for a tool or binary? This program has extraordinarily helpful information... binary: warm"*

This challenge focuses on interacting with binaries using CLI arguments and discovery flags to reveal hidden functionality or information.

---

## Analysis
The provided file `warm` is a compiled Linux binary. Executing it without arguments results in a prompt suggesting the use of a help flag:

> *"Hello user! Pass me a -h to learn what I can do!"*

---

## Solution

### Step 1: Execution with the Help Flag
Following the hint provided by the binary, I executed the program with the `-h` flag. This triggered a specific logic branch within the code, revealing the flag.

### Step 2: Advanced Extraction (Piping)
To demonstrate efficient data extraction: a key skill in security automation: I combined the execution with a pipe to `grep`. This isolates the flag string from the surrounding text.

```bash
./warm -h | grep -o "picoCTF{.*}"
```
* **`|` (Pipe)**: Redirects the standard output of the binary to the input of the next command.
* **`grep -o`**: Extracts only the part of the string that matches the pattern `picoCTF{...}`.

<div align="center">
  *[Image: Complete Execution Workflow]*
  <p><i>Figure 1: Terminal workflow showing the initial prompt, the help output, and the final successful piped extraction.</i></p>
</div>

---

## 🚩 Final Flag
<details>
  <summary>Click to reveal the flag</summary>
  
  `picoCTF{b1scu1ts_4nd_gr4vy_ac5832c}`
</details>

---

## Key Takeaways
* **CLI Discovery**: Help flags (`-h`, `--help`) are the primary method of reconnaissance when analyzing unknown binaries.
* **Data Piping**: Using pipes with `grep` allows for rapid, automated extraction of specific data like flags.
* **Execution Flow**: Programs often contain hidden messages or functions accessible only through specific command-line arguments.
