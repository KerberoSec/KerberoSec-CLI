# convertme.py

## Information about the CTF
Run the Python script and convert the given number from decimal to binary to get the flag.

## How to solve it
We see that when the program is run, it asks for us to convert a decimal base number into binary. Instead of looking that up and giving it to the program, we can simply modify the code to automatically convert, and pass this value to the program when it asks for it. We can do this by adding the following line to the code:

```python 
num_bin = bin(num)[2:]
ans = num_bin

# And then comment out the following line:
# ans = input('Answer: ')
```

Now, when we run the program, it will automatically convert the number to binary, thus giving us the flag.
