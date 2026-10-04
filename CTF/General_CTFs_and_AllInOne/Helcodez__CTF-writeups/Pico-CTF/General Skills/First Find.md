# First Find

**Points:** 100

**Description:** Unzip this archive and find the file named 'uber-secret.txt'

## Solution 

### Step 1

Download the zip file then unzip it. 

```bash
unzip files.zip
```
![Screenshot from 2023-07-16 22-25-58](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/2277d254-aaec-4f0c-a812-6a6142244f8d)

Use `Ctrl` + `Shift` + `f` to find the file named 'uber-secret.txt'. Retrieve the flag by using the `cat` command.

```bash
cat files/adequate_books/more_books/.secret/deeper_secrets/deepest_secrets/uber-secret.txt
```
