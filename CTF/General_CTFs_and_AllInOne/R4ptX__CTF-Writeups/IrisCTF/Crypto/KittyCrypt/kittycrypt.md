# KittyCrypt Challenge Solution

## Challenge Description
The encryption method uses a key (set of numbers between 0 and 59999) to produce output based on given input. By reversing the code, we can obtain the input based on the given output if we know the key.

### Tip:
If you can’t read Golang, you can use a code converter like [CodeConvert.ai](https://www.codeconvert.ai/free-converter) to make it in Python.

---

## Solution Steps

### Step 1: Decode the Output
First, decode the `output` and `encodedflag` using the `Charset` map.

```python
output = 'ECB283ECAB84E19BB0E1BCA8ECAF97EE8380E79CAEEE848DE2828CE6AAB6E1B9A8E6B48DEA9F89E7ACA6E2AEB9DF82EA9092E6ACBBE6B283E2B2BBE7B8A5E785BDE6B990E19797E7A589E480BAEB819BE0A49AE6AABAEA84A8E3B582E594A1E692B2E18D92E18D93EB81A2EC81A2EFBFBDE28289EEA4B0E887B9E29B9FECAAAAEB9BA5E8A5A8E889B9'

input = "You fools! You will never get my catnip!!!!!!!"

res = bytes.fromhex(output).decode()
```

### Step 2: Find the Key
To find the `key`, subtract the `input` from the reversed `output`.

```python
key = []
for i, char in enumerate(res):
    key.append(ord(char) - ord(input[i]))

# Example key output
# key = [52266, 51797, 5755, 7944, 52081, 57425, 30399, 57505, 8217, 27285, 7752, 27828, 42842, 31409, 11161, 1867, 41897, 27343, 27671, 11419, 32183, 28952, 28122, 5490, 30935, 16410, 45044, 2229, 27206, 41224, 15573, 21672, 25746, 4847, 4850, 45038, 49140, 65428, 8217, 59663, 33240, 9918, 51849, 46788, 35143, 33368]
```

### Step 3: Reverse the Encoded Flag
Now that we know the `key`, we can start reversing the `encodedflag`.

```python
encodedflag = 'ECB293ECAB87E19BA4E1BDBBECAF94EE8385E79CA5EE849CE2828CE6AB85E1BAB5E6B3A7EA9E91E7ABA2E2B086DDBEEA909CE6ACAEE6B1B9E2B3B4E7B7AEE7858BE6B88FE19791E7A48BE4828CEB80A7E0A4A3E6A9BDEA85A7E3B58CE59490E69386E18CA6E18D91EB81A7EC80A4EFBFBDE281B8EEA582E88990E29CAEECAABCEB9CA7E8A5BEE88B95'

res = bytes.fromhex(encodedflag).decode()

flag = []
for i, char in enumerate(res):
    flag.append(chr(ord(char) - key[i]))

ans = ''
for i in flag:
    ans = ans + i

print(ans)
```

### Final Output:
```text
flag = irisctf{s0m371m3s_bY735_4r3n7_wh47_y0u_3xp3c7}
```

---

## Note:
If you enjoy cryptography challenges, consider discussing and solving more crypto-based problems together!

@midnightfam on Discord solved **
