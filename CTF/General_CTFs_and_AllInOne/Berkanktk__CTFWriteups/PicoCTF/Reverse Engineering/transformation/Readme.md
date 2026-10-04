# Transformation
## Description
I wonder what this really is... enc `''.join([chr((ord(flag[i]) << 8) + ord(flag[i + 1])) for i in range(0, len(flag), 2)])
`
## Solution
The task provides us with a string of seemingly gibberish characters, represented by the variable flag. The challenge is to decode the string and obtain the original message.

The code snippet provided by the challenge decodes the string by first separating each character of the string into two parts, each part represented by a single character. The first part is obtained by taking the 8 most significant bits of the original character, while the second part is obtained by taking the 8 least significant bits of the original character.

To decode the string, we need to perform the reverse transformation of the given code snippet. We start by concatenating the two parts of each character, with the 8 most significant bits on the left and the 8 least significant bits on the right. We can then convert each pair of characters back into their original ASCII representation using the ord() function, and concatenate them to obtain the original message.

The following Python code performs the reverse transformation:

```python
flag = "灩捯䍔䙻ㄶ形楴獟楮獴㌴摟潦弸強㕤㐸㤸扽"

def main():
    for i in range(len(flag)):
        print(chr(ord(flag[i]) >> 8), end="")
        print(chr((ord(flag[i])) - ((ord(flag[i]) >> 8) << 8)), end="")

main()
```

Which also gives us the flag!
