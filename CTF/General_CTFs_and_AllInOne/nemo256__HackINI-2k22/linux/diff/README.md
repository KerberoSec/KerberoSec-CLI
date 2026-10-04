# Diff

Challenge description:
linux/diff

*[Image: Diff]*

This challenge is easy, especially for linux geeks.

## Steps
- Accessing the provided link and printing the list of files using ls:

*[Image: Step 1]*

- We can see flag.txt but it we only have permission to run diff using ctf-cracked user as it is shown here:

*[Image: Step 2]*

- Now we run the diff command on flag and any file that has read permissions using the ctf-cracked user:

*[Image: Step 3]*

- Now, the flag is printed like this:

```
shellmates{You_ma$tered_th3_t00L}
```
