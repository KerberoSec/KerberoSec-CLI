<div align="center">

# 🚩 Bandit Level 2 → Level 3

**OverTheWire Bandit Write-up**

</div>

---

## 🎯 Level Goal

The password for the next level is stored in a file called:

```text
spaces in this filename
```

The file is located in the home directory.

---

## 🔍 Step 1: List the Files

First, check the files available in the current directory.

```bash
ls
```

Output:

```text
spaces in this filename
```

---

## 💡 Step 2: Read the File

Since the filename contains spaces, the shell treats each word as a separate argument. To read the file, escape the spaces with backslashes.

```bash
cat spaces\ in\ this\ filename
```

You can also use double quotes.

```bash
cat "spaces in this filename"
```

Both commands will display the password for the next level.

---

## 🛠 Commands Used

```bash
ls
cat spaces\ in\ this\ filename
```

---

## 📚 What I Learned

- Filenames can contain spaces.
- The shell splits words based on spaces.
- Use **backslashes (`\`)** or **double quotes (`""`)** when working with filenames that contain spaces.

---

## ✅ Summary

| Task | Command |
|------|---------|
| List files | `ls` |
| Read file | `cat spaces\ in\ this\ filename` |
| Alternative | `cat "spaces in this filename"` |

---

<div align="center">

⭐ Thanks for reading!

</div>