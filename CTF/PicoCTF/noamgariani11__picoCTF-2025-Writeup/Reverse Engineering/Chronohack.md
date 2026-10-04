# Description

Can you guess the exact token and unlock the hidden flag?
Our school relies on tokens to authenticate students. 
Unfortunately, someone leaked an important file for token generation. Guess the token to get the flag.
The access is granted through nc verbal-sleep.picoctf.net 64704.

# Solution

`wget https://challenge-files.picoctf.net/c_verbal_sleep/7ae3cdbcc5ac8f841a488d91465c1255ff0538f9061a2bb222293ec840af981c/token_generator.py`

Once you look at the token_generator.py script you can see some key information:

```
def get_random(length):
    alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
    random.seed(int(time.time() * 1000))  # seeding with current time 
    s = ""
    for i in range(length):
        s += random.choice(alphabet)
    return s
```

and

```
def main():
    print("Welcome to the token generation challenge!")
    print("Can you guess the token?")
    token_length = 20  # the token length
    token = get_random(token_length) 
    print(token)

    try:
        n=0
        while n < 50:
            user_guess = input("\nEnter your guess for the token (or exit):").strip()
            n+=1
```

These snippets of the code show the token_length used to generate `s` from the get_random() function and that it only lets you enter your guess 50 times. To further look at get_random() you can see that it uses int(time.time() * 1000) as the seed that will be used to get the random token.

Now conceptually what you want to do is get the current time at the same time that you run the program itself. You can even test it with the `token_generation.py` file provided. For instance, by running `date +%s.%N && python3 token_generator.py` and putting a `print(time.time())` statement right before it seeds the value in the `get_random()` function you can see the difference in time. It varies each time you run it but it's around a 0.15 second delay when ran locally between the `date +%s.%N` which also gives decimal points to the one in the script.

From here you could try to use a similar method and brute force it manually with a command like `date +%s.%N && nc verbal-sleep.picoctf.net 64704` and generate tokens ascending by 0.001 seconds. However, the time delay in the server connection is much larger and this method doesn't work well. Writing a pwntools python script makes it far easier, so here are some commands you can run if you don't have pip installed before installing pwn:

`sudo apt install python3-pip -y`
`sudo apt install python3.12-venv -y`
`source venv/bin/activate`
`pip install pwn`

Here is `script.py` which was used to get the flag:
```
from pwn import *
import random
import time

def get_random(length, time):
    alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
    random.seed(int(time * 1000))
    s = ""          
    for i in range(length):
        s += random.choice(alphabet)
    return s

token_length = 20

p = remote("verbal-sleep.picoctf.net", 64704)
time = int(time.time())
time += 0.01

for i in range(50):
    time += 0.001
    token = get_random(token_length, time)
    p.recvuntil(b"):")
    p.sendline(token.encode())
    response = p.recvline()
    if b"Sorry" in response:
         p.recvline()
    else:
        print(response)
        response = p.recvline()
        print(response)
        break
```

You can now run `python3 script.py` to get the flag, but keep in note it may take a few runs for it to give the flag because the timing changes each time. You can tweak the script to make it better and return it more reliably.

To explain the script it first takes the same `get_random()` function from the provided code but adds in a time parameter to be used later. The token length is set to the static number in the provided script (token_generator.py) and then the connection is established. Right after it's established is where you take the time with `time.time()` to be as close to the one used as possible. Right after that 0.01 seconds were added because even if you get really close you still will have some time delay which is around there. Then there is the for loop that iterates the maximum amount of times (50) and adds in 0.001 seconds each iteration. If you try to look yourself in the token_generator code the token will change based on a 0.001 second difference. From here, the time is taken to generate the token and then a recvuntil is used to receive as much as needed before inputting the guess. This is the full line the script is receiving before sending the line `"\nEnter your guess for the token (or exit):"`. You can see this either from running netcat youself and trying to put in a guess or the token_generator script. Then the token is sent as a guess and put in the next line into response which will either say "Sorry, your token does not match. Try again!" and give you another chance or "Congratulations! You found the correct token." and then print out the flag. If it doesn't say "Sorry" in the response then it goes into the else get's another line which is the flag being printed and prints that response to give the flag. Then it breaks out of the loop and the process stops. If it doesn't get the flag then it loops and tries everything again with 0.001 increase in time.

Note that if you don't have a system to run this code or are having consistent problems you can always run the picoCTF webshell which runs quickly and should not give problems with this challenge.

Flag: `picoCTF{UseSecure#$_Random@j3n3r@T0rsd...}`