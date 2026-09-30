## Programming a Language

The idea of this challenge is to find the flag through reading the "code" from a txt file and converting its data

**Step 1:**
Download the attached file "input.txt" and see that it is essentially a text file with one long line of special characters

**Step 2:**
Create a script to parse the lines according to the criteria specified in the challenge
```python
def split(word):
    return [char for char in word]

file1 = open('input.txt', 'r')
firststack = [0]

line = file1.readline()
wordlist = split(line)
for word in wordlist:  
    if word == '-':
        firststack[len(firststack)-1] -= 1
    elif word == '+':
        firststack[len(firststack)-1] += 1
    elif word == '>':
        tempval = firststack[0]
        del firststack[0]
        firststack.append(tempval)
    elif word == '<':
        tempval = firststack[len(firststack)-1]
        del firststack[len(firststack)-1]
        firststack.insert(0, tempval)
    elif word == '@':
        tempval = firststack[len(firststack)-1]
        firststack[len(firststack)-1] = firststack[len(firststack)-2]
        firststack[len(firststack)-2] = tempval
    elif word == '.':
        firststack.append(firststack[len(firststack)-1])

file1.close()
```

**Step 3:**
Convert the output from ascii to string using ``chr``
```python
for char in firststack:
    print(chr(char), end="")
```

**Step 4:**
Execute the script to get the flag output: ``pr0gr4mm1ng_pr0gr4mm1ng_l4ngu4g3s?``

Thus the flag is simply ``pr0gr4mm1ng_pr0gr4mm1ng_l4ngu4g3s?`` OR ``CTFlearn{pr0gr4mm1ng_pr0gr4mm1ng_l4ngu4g3s?}``
