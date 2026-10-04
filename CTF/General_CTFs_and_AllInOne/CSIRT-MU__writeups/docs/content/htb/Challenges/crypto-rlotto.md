---
authors:
    - Lukas Daubner
date: 16-01-2024
---

# Crypto: RLotto

After accessing the app using browser, you can see a lot of gibberish. So, let's try it in telnet. `telnet 167.99.82.136 30363` And it's way better.

Apparently, the goal is to gues the next 5 random numbers, given the 5 previous random numbers. OK, let's check the code. I am specifically looking how the random works and how it is seeded.

* The random is simple `import random`
* It is initialised with seed `random.seed(seed)`
* The seed is time `seed = int(time.time())`

## Experiments

According to the docs the used time function is just seconds from epoch https://docs.python.org/3/library/time.html#time.time So, let's run the following few times and see how it is changing.

```
python3 -c "import time; print(int(time.time()))"
```

And it is really seconds.

For the second experiment, let's run the app in localhost. When started, it creates a new seed, and prints the expected solution. Like this:

```
[+] EXTRACTION: 12 90 31 79 20 
[+] SOLUTION: 35 58 89 51 38
```

But the important part that a **new seed** is generated. According to the time.

Thus, if we could know the seed, we can simulate the pseudorandom generation on localhost. It would give us the solution we need. Only if we could...

## Matching the seed

We actually can. By running

```
python3 -c "import time; print(int(time.time()))"; telnet 167.99.82.136 30363
```

We get the time (the seed), -/+ off-by-one miss, if the timing is bad.

Anyway, we run the command. Supplement the seed to the code and run it on localhost. Compare the first 5 numbers. If they do not match, we run it again. If they match, we write the solution and get the flag.

```
# Seed: 1705075719
# Localhost
[+] EXTRACTION: 12 90 31 79 20 
[+] SOLUTION: 35 58 89 51 38
# Remote
[+] EXTRACTION: 12 90 31 79 20 
[?] Guess the next extraction!!!
[?] Put here the next 5 numbers: 35 58 89 51 38
Good Job!
HTB{........}
```