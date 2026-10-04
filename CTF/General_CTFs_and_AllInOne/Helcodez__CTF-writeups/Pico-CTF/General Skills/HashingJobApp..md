# Glitch Cat

**Points:** 100

**Description:** If you want to hash with the best, beat this test!
nc saturn.picoctf.net 55823

## Solution 

### Step 1

First, run this command

``` bash
 nc saturn.picoctf.net 50363

```
You get three strings to hash in md5. You can use the `md5sum` command but I decided to write a simple Python script. 

 ```python
import hashlib

# Function to calculate the MD5 hash of a string
def calculate_md5_hash(input_string):
    md5_hash = hashlib.md5()
    md5_hash.update(input_string.encode('utf-8'))
    return md5_hash.hexdigest()

# Get input from the user
user_input = input("Enter a string: ")

# Calculate the MD5 hash of the input
md5_hashed_input = calculate_md5_hash(user_input)

# Print the MD5 hash
print("MD5 Hash: " + md5_hashed_input)

```
![Screenshot from 2023-07-09 14-24-12](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/12322f60-38ab-44e9-891d-4ab85b131639)
