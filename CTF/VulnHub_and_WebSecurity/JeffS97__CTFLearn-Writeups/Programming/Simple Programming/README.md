## Simple Programming

The idea of this challenge is to find the flag through counting in a file. 

**Step 1:**
Download the attached file "data.dat" and see that it is essentially a text file with over 10,000 lines of binary information

**Step 2:**
Create a script to parse the lines according to the criteria specified in the challenge (number of 1s divisible by 2, number of 0s divisible by 3)
```python
file = 'chal.txt'
count = 0
count1 = 0
count0 = 0

with open(file) as file1:
    lines = file1.readlines()
    for line in lines:
        count1 = line.count('1')
        count0 = line.count('0')
        if (count0%3 == 0 or count1%2 == 0):
            count+=1

print(count)
file1.close()
```

**Step 3:**
Execute the script to get the flag output: ``6662``

Thus the flag is simply ``6662`` OR ``CTFlearn{6662}``
