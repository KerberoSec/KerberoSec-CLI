

# JEMBE: Writeup (Misc)

## Description
The challenge provided a text file named `rhythm.txt` with the following hint: 
> *"You can either hear a BOOM or a tak. Maybe it's a byte."*

## Analysis
Looking at the content of `rhythm.txt`, we see a sequence of two words, `tak` and `BOOM`, separated by a pipe `|` character.

```bash
$ cat rhythm.txt
tak BOOM tak tak tak BOOM tak BOOM | tak BOOM BOOM tak tak tak BOOM BOOM | ...
```

By counting the elements between each pipe, we find exactly **8 words per block**. Given the "byte" hint in the description, it is clear that this is a **Binary Substitution** cipher where:
* `tak` = **0**
* `BOOM` = **1**

## Solution
To solve this, we need to convert each 8-word block into a binary string and then translate it from binary to ASCII. 

### Manual Verification
Let's take the first block: `tak BOOM tak tak tak BOOM tak BOOM`
1.  Replace: `0 1 0 0 0 1 0 1`
2.  Binary: `01000101`
3.  ASCII: **E** (Matches the first letter of the flag format `EcowasCTF{...}`)

### Automation
I wrote a Python script to automate the extraction for the entire file:

```python
# Open the rhythm file
with open("rhythm.txt", "r") as f:
    data = f.read().strip()

# Split into bytes and decode
bytes_list = data.split(' | ')
flag = ""

for b in bytes_list:
    # Convert 'tak' to 0 and 'BOOM' to 1
    binary_str = b.replace("tak", "0").replace("BOOM", "1").replace(" ", "")
    # Convert binary to ASCII character
    flag += chr(int(binary_str, 2))

print("Flag: " + flag)
```

## Flag
Running the script yields the following flag:
**`EcowasCTF{dj3mb3_r1se_f4ll_b1n}`**

---
