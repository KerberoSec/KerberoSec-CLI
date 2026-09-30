# 🟢 Bandit Level 11 → Level 12

## 🎯 Goal

The password for the next level is stored in the file data.txt, where all lowercase (a-z) and uppercase (A-Z) letters have been rotated by 13 positions.

This is a classic **ROT13** encoding challenge. ROT13 shifts each letter 13 places in the alphabet, wrapping around at the end. Numbers and symbols remain unchanged.

---

## 🧪 Steps Taken

1. **List the file**

```bash
bandit11@bandit:~$ ls
data.txt
```

2. **View the contents**

```bash
bandit11@bandit:~$ cat data.txt
Gur cnffjbeq vf 7k16JArUVv5LxVuJfsSVdbbtaHGlw9D4
```

3. **Decode using ROT13**

You can decode this using:

- [CyberChef ROT13 tool](https://gchq.github.io/CyberChef/)
- Or the Linux command line:

  ```bash
  cat data.txt | tr 'A-Za-z' 'N-ZA-Mn-za-m'
  ```

---

## 🔓 Decoded Output

```
The password is 7x16WNeHIi5YkIhWsfFIqoognUTyj9Q4
```
