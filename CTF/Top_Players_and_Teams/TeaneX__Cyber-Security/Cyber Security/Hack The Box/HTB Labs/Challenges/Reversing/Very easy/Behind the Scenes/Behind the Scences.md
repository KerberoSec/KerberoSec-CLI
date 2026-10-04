# 🕵️‍♂️ HTB Challenge: Behind the Scenes Write-up

- **Category:** Reverse Engineering  
- **Difficulty:**  VERY EASY
- **Platform:**  Hack The Box  
- **Flag:**  `HTB{Itz_0nLy_UD2}`

---

## 🔍 Challenge Description

> You're presented with a mysterious binary that seems to misbehave when run normally... something fishy is going on **behind the scenes**. Can you figure out what it's hiding?

---

### 📦 Unzipping the Archive

**Input:**
```bash
unzip Behind\ the\ Scenes.zip
````

**Output:**

```
Archive:  Behind the Scenes.zip
   creating: rev_behindthescenes/
[Behind the Scenes.zip] rev_behindthescenes/behindthescenes password: 
  inflating: rev_behindthescenes/behindthescenes
```

---

### 📂 Navigating to the Directory

**Input:**

```bash
cd rev_behindthescenes
ls
```

**Output:**

```
behindthescenes
```

---

### 🚀 Running the Binary (No Args)

**Input:**

```bash
./behindthescenes
```

**Output:**

```
./challenge <password>
```

---

### 🔍 Inspecting with `strings`

**Input:**

```bash
strings ./behindthescenes
```

**Output (relevant parts):**

```
./challenge <password>
> HTB{%s}
...
main.c
segill_sigaction
strncmp
```

---

### 🧵 Tracing with `ltrace`

**Input:**

```bash
ltrace ./behindthescenes
```

**Output:**

```
memset(0x7ffe265927f0, '\0', 152)                            = 0x7ffe265927f0
sigemptyset(<>)                                              = 0
sigaction(SIGILL, {0x558f9000a229, <>, 0, nil}, nil)         = 0
--- SIGILL (Illegal instruction) ---
--- SIGILL (Illegal instruction) ---
puts("./challenge <password>"./challenge <password>)         = 23
--- SIGILL (Illegal instruction) ---
+++ exited (status 1) +++
```

---

### 🧠 Optional: Inspecting Binary with Hex Editor

**Input:**

```bash
hexeditor ./behindthescenes
```

![[Behind the Scenes 1 .png|000]]

📍 **Note:**

🔧 Pressed `Ctrl + W` at this screen to **undo the changes I had made** and return to the original binary view.

**Output:**

![[Behind the Scenes 2.png|000]]

📝 Message:  *"Go here to Search for Text string from here."* 

![[Behind the Scenes 3 .png|000]]

📝 Message: *"Then, type Challenge in the Text String."*

![[Behind the Scenes 4.png|000]]

📝 Message: *"You can see the flag on the top right corner."*

---

## 🏁 Flag

```
HTB{Itz_0nLy_UD2}
```

---

## 💡 Takeaways

- **String analysis** can often reveal valuable hints in reverse engineering challenges, especially when dealing with binary files.
- **`ltrace`** is useful for tracing function calls and understanding the behavior of binaries, especially when they interact with system libraries or external resources.
- **Hex editors** are powerful tools for inspecting and modifying binaries directly, revealing hidden strings or code logic that can help uncover flags or other secrets.

---

## 🛠️ Useful Commands

- `unzip <file>.zip`: Unzips the provided archive.
- `cd <directory>`: Navigates to the specified directory.
- `ls`: Lists files in the current directory.
- `./<binary>`: Runs a binary file.
- `strings <binary>`: Extracts printable strings from a binary file.
- `ltrace <binary>`: Traces library calls made by a binary.
- `hexeditor <binary>`: Opens the binary file in a hex editor for inspection.

---
## 🏷️ Tags

#ReverseEngineering #Behindthescences #BinaryExploitation #HackTheBox #CTF  

[[Reverse Engineering]]

