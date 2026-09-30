
# PART 1: Shell Spelunking

you list hidden files by  
```bash
ls -a
```

the secret in `.secret` file is `hunter2`

---

the message that is split across the `nonsense/` directory can be found by  
```bash
cat *
```

and boom:  
```
s
t
a
n
f
o
r
d

>

b
e
r
k
e
l
e
y
```

---

deleting everything in the `nonsense` directory with one command:  
```bash
rm -rf nonsense
```

---

The `big_data.txt` is 77M in size, the hint we have is that we are looking for a URL (`http`) so  
```bash
grep "http" big_data.txt
```

This will show:  
```
;=:P0viNjebvs<+^Ae.SZYG'F}\> https://xkcd.com/705 e[a3]vF;Ny,*rpyC?3OA$Nm<.iH8M
```

We found the link to `https://xkcd.com/705`

---

The secret solution 2 lines above the URL can be found by adding `-B 2` flag to `grep`:  
```bash
grep -B 2 "https" big_data.txt
```

And  
```
=================== THE SOLUTION IS MORE COFFEE ===============================
```

---

Changing the permission of the `./a_script` by  
```bash
chmod u+x ./a_script
```

Run it by  
```bash
./a_script
```

And you will get the classic:  
```
Hello World!
```

---

You can write your name using `echo` (it does what you think… echo!) by assigning the standard output stream (it's normally the screen) to the `hello_world` file:  
```bash
echo "Hassan Mahmoud" >> hello_world
```

---

# PART 2: General Questions

**1. What differentiates Linux/OSX from operating systems like Windows?**  
Linux/OSX are Unix-based, open-source, and highly customizable, with a command-line interface (CLI) as a core feature. Windows is more user-friendly with a GUI-centric design, closed-source, and less flexible for advanced system manipulation.

---

**2. What are some differences between the command line and normal (graphical) usage of an OS?**  
The command line is text-based, offers precise control, and is often faster for advanced tasks. It requires knowledge of commands and syntax. Graphical usage (GUI) is user-friendly, with visual elements like windows and icons, making it easier for general tasks but less efficient for advanced or repetitive work.

---

**3. What is the root directory in Linux filesystems?**  
The root directory (`/`) in Linux is the top-level directory in the filesystem hierarchy. It is the starting point from which all other directories branch out. In concept, it's the "base" or "root" of the entire filesystem tree. Everything on a Linux system is organized under this directory, from system files to user data.

**Essential Directories:**
- `/bin` → System binaries (e.g., essential commands like `ls`, `cp`)
- `/home` → User home directories
- `/etc` → Configuration files
- `/lib` → Shared libraries for programs
- `/dev` → Device files (e.g., hard drives, terminals)
- `/mnt` → Mount point for temporarily mounted filesystems (e.g., USB drives)
- `/tmp` → Temporary files
- `/var` → Variable data (e.g., logs, databases)

**Everything is a File:**  
In Linux, almost everything (including devices, sockets, and processes) is treated as a file, and all these "files" are organized under the root directory.

---

**4. How would I use `ls` to see size, file permissions, owner name, owner group, and have the files ordered by last date edited with the oldest on top?**  
```bash
ls -lhtr
```

**Breakdown:**
- `-l` → Long listing format
- `-h` → Human-readable file sizes (e.g., 1K, 10M)
- `-t` → Sort by modification time
- `-r` → Reverse order (oldest first)

**Sample Output:**  
```
total 77M
-rw-r--r-- 1 hshs-dev hshs-dev 77M Sep 12  2018 big_data.txt
-rwxr--r-- 1 hshs-dev hshs-dev  20 Sep 11  2019 a_script
-rw-r--r-- 1 hshs-dev hshs-dev  15 Apr 18 14:08 hello_world
```

---

**5. Instead of showing the first 10 lines of the file `big_data.txt`, I want to use the head command to show the first 4.**  
```bash
head -n 4 big_data.txt
```

---

**6. What’s the difference between `cat foo > out.txt` and `cat foo >> out.txt`?**

- `>` overwrites the contents of `out.txt` with the contents of `foo`
- `>>` appends the contents of `foo` to the end of `out.txt`  

```bash
cat foo > out.txt
cat foo >> out.txt
```

---

**7. Briefly, what is the difference between permissive and copyleft licenses?**

- **Permissive licenses** (like MIT or BSD) allow you to use, modify, and redistribute the code with minimal restrictions: even in proprietary software.
- **Copyleft licenses** (like GPL) require that any modified versions of the code must also be open-source and distributed under the same license.

**In short:**
- **Permissive** = freedom to do almost anything
- **Copyleft** = freedom, but must stay open-source

---

**8. Give an example of a permissive license.**  
A common example is the **MIT License**: allows anyone to use, modify, and distribute the software, even in proprietary projects, as long as the original license is included.

---

**9. Give an example of (a) open-source software and (b) free, but closed-source software that you use.**

- (a) Open-source software: **Visual Studio Code**
- (b) Free, but closed-source software: **Steam**