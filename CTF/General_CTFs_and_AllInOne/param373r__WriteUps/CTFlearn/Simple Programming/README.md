# Simple Programming
## About

### General Information

__Challenge Description__: Can you help me? I need to know how many lines there are where the number of 0's is a multiple of 3 or the numbers of 1s is a multiple of 2. Please!

__Challege Category__: PROGRAMMING

__Challenge Difficulty__: Easy

__Skills__: (Recommended Python Scripting) Any language you are comfy with; I will be using Python

__Tools__: Any Text Editor you like... I will be using VIM

Download the file [here.](https://mega.nz/#!7aoVEKhK!BAohJ0tfnP7bISIkbADK3qe1yNEkzjHXLKoJoKmqLys)

## Solution

Now this challenge was pretty simple... All you gotta do is to create a script, with this logic:  

- Iterate through all the lines
  - Iterate through the characters on each line
    - Count the number of 0s and 1s
  - If no of 0s are multiple of 3 or no of 1s are a multiple of 2
    - Increase the count by 1
    
Now let's implement this logic in the script;

Starting by, opening the file in read mode and creating alias.  
```with open("data.dat", "r") as file```

Then, let's create a loop to iterate through all the lines.
```python
for line in file:
  count0, count1 = 0,0 # Initializing there values to 0 at start of each new line.
```
Now another loop which will iterate through every character and count the 0s and 1s in that particular line.

```python
for i in line:
  if i=='0':    # If the character = 0
    count0+=1   # Iterate the 0 counter
  elif i=='1':  # If the character = 1
    count1+=1   # Iterate the 1 counter
```

Now, a check for if there occurence is multiple of 3 or 2 respectively before closing the line loop.

```python
if count0%3==0 or count1%2==0:  # Testing the condition to calculate the final result.
  count+=1
```

Now let us combine all of it.

![Image1](https://github.com/iParamjotSingh/WriteUps/blob/master/CTFlearn/Simple%20Programming/1.png)

And when you run the script, it gives us this output...

![Image2](https://github.com/iParamjotSingh/WriteUps/blob/master/CTFlearn/Simple%20Programming/2.png)

__Flag__: 6662
