# Description

We invented a new cypher that uses "quantum entanglement" to encode the flag. Do you have what it takes to decode it?
Connect to the program with netcat:
`$ nc verbal-sleep.picoctf.net 53222`
The program's source code can be downloaded here.

# Solution

`wget https://challenge-files.picoctf.net/c_verbal_sleep/27d1d27147deac5835e1ef9633cf1858c89bf32b14e2f4fbac72b6ca093f6d27/quantum_scrambler.py`

After getting quantum_scrambler.py this is a key part to look at:

```
def scramble(L):
  A = L
  i = 2
  while (i < len(A)):
    A[i-2] += A.pop(i-1)
    A[i-1].append(A[:i-2])
    i += 1
    
  return L
```

From this you can see that it is only scrambling or moving around the characters rather than doing any encryption and the code that does that it provided. So all that needs to be done is reverse the process in a Python script. You can also create your own flag and test it out with different values and make sure you understand how it works. Then you can write the code to reverse it. Here is the script:

```
with open("result", "r") as f:
    cypher = f.read()
cypher = eval(cypher) 

flag = []
for i in range(len(cypher)-2):
    flag.append(((cypher[i][0])))
    flag.append(((cypher[i][-1])))

flag.append(((cypher[-2][0])))
flag.append(((cypher[-1][0])))

print(''.join([chr(int(char[2:], 16)) for char in flag]))
```

First, the script just reads in `result` which is the output from `nc verbal-sleep.picoctf.net 53222`. You can either copy out the output into a file name of your choice or just use this command `nc verbal-sleep.picoctf.net 53222 > result` and control-c after copied.

In the scramble function it starts from and i value of 2 and goes up until the length of A which is set to the parameter L. In the reverse script after initializing the flag variable the loop iterates over the length of cypher minus 2. Then in each iteration it appends the first and last element of each sublist. Then outside the loop the first element of the second to last sublist is added then the first element of the last sublist. Lastly, to print out the flag the hex values are converted to characters and then printed to get the flag.

Flag: `picoCTF{python_is_weird9ece...}`