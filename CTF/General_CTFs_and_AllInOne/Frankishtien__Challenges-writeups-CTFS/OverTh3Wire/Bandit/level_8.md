# level 8 

```
ssh bandit8@bandit.labs.overthewire.org -p 2220
```

> ## The password for the next level is stored in the file data.txt and is the only line of text that occurs only once

```bash
sort data.txt | uniq -u
```

- sort data.txt → Arranges the lines so that they group repeated lines together

- uniq -u → Prints lines that appear only once

---

Alternative (if you want to see the entire repetition)
----------------------------

```bash
sort data.txt | uniq -c | grep "1"
```

- `uniq -c` prints the iteration along with the line

- `grep "1"` filters lines with repeats of 1

<img width="767" height="455" alt="image" src="https://github.com/user-attachments/assets/361755fb-8e5c-4427-aee5-7696378c948a" />

```
4CKMh1JI91bUIZZPXDqGanal4xvAg0JM
```

