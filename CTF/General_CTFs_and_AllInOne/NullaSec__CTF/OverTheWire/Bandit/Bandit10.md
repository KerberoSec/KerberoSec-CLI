### Bandit 8 → 9

**Level Goal:**  

The password for the next level is stored in the file data.txt, which contains base64 encoded data.

**Commands Used:**  
- `ls` → list directory contents
- `base64` → base64 encode/decode data and print to standard output

**Steps:**
```bash
ls # to check the existence of the file
cat data.txt # to observe the Base64 string
base64 -d data.txt
```
**Explanation:**

Base64 is a method of encoding files, fortunately Linux gives us the `base64` command which we can use to encode/decode those. A regular Base64 string is often identified by the characteristic "==" at the end, though it's not mandatory to have that. In our case the encoded string is:

```
VGhlIHBhc3N3b3JkIGlzIGR0UjE3M2ZaS2IwUlJzREZTR3NnMlJXbnBOVmozcVJyCg==
```

So by using the decode flag `-d` and the path to our file we get our answer:

```bash
base64 -d data.txt

The password is dtR173fZKb0RRsDFSGsg2RWnpNVj3qRr
```

**Solution:**
```
dtR173fZKb0RRsDFSGsg2RWnpNVj3qRr
```

