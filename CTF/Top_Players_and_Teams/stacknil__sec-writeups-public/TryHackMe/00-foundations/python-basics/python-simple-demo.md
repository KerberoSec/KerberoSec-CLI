---
type: resource-note
status: done
created: 2026-03-11
updated: 2026-03-11
tags: [security-writeup, tryhackme, python, demo]
source: "TryHackMe: Python: Simple Demo"
platform: tryhackme
room: "Python: Simple Demo"
slug: python-simple-demo
path: TryHackMe/00-foundations/python-basics/python-simple-demo.md
topic: 00-foundations
domain: [foundations]
skills: [python-basics, variables, control-flow, loops]
artifacts: [concept-notes]
sanitized: true
---

# Python: Simple Demo

## Summary

* This room introduces Python via a small interactive program: **“Guess the Number.”**
* The computer picks a **secret integer in [1, 20]**; the user keeps guessing until correct.
* Core pillars demonstrated: **variables**, **if/elif/else** conditionals, and a **while** loop.

## Key Concepts

* **High-level language (高级语言)**: Python hides many low-level implementation details.
* **General-purpose (通用编程语言)**: usable for web apps, automation, data science, ML.
* **Variable (变量)**: a named container for a value (e.g., `secret`, `guess`, `tries`).
* **Function (函数)**:

  * `print(...)` displays text.
  * `input(...)` reads user input **as text** (a string).
  * `int(...)` converts text to an integer.
* **Conditional statements (条件语句)**: branching based on comparisons (`<`, `>`, `==`) and logic (`or`).
* **Iteration / loop (迭代 / 循环)**: repeat a block of code while a condition holds.

### 2) Workflow (how the program evolves)

#### Step A: Variables + setup (v1)

Goal: pick a secret number and read one guess.

* Choose a random integer with `random.randint(1, 20)`.
* Initialize:

  * `tries = 0` (no attempts yet)
  * `guess = 0` (deliberately out of the valid range, since secret is 1..20)
* Print an info message.
* Prompt the user, convert to integer, and increment tries.

Code sketch (as provided):

```python
import random  # gives us tools for picking random numbers

secret = random.randint(1, 20)  # a <= secret <= b
tries = 0
guess = 0  # start with a value that cannot be the secret (since secret is 1..20)

print("I'm thinking of a number between 1 and 20")

text = input("Take a guess: ")  # input() returns text (a string)
guess = int(text)  # convert the text to a number

tries = tries + 1  # add 1 try (written long-form for clarity)
```

#### Step B: Conditionals (v2)

Goal: compare `guess` vs `secret` and give feedback.

Pseudo-code:

* If guess is out of range → print out-of-range message
* Else if guess < secret → print too low
* Else if guess > secret → print too high
* Else → correct

Python logic (as provided):

```python
# Give a hint using if / elif / else.
if guess < 1 or guess > 20:
    print("That number is out of range. Try again.")
elif guess < secret:
    print("Too low, try again.")
elif guess > secret:
    print("Too high, try again.")
else:
    print("You got it in", tries, "tries!")
```

#### Step C: Loop / Iterations (v3)

Goal: allow unlimited attempts until the guess matches the secret.

* Loop condition: `while guess != secret:`
* Inside the loop:

  * read input
  * convert to integer
  * increment tries
  * apply the same if/elif/else hinting logic

Full program (as provided):

```python
import random  # gives us tools for picking random numbers

# ----------------------------
# Guess the Number (Beginner Demo)
# ----------------------------
# The computer picks a secret number.
# The player keeps guessing until they find it.

secret = random.randint(1, 20)  # a <= secret <= b
tries = 0
guess = 0  # start with a value that cannot be the secret (since secret is 1..20)

print("I'm thinking of a number between 1 and 20")

# Repeat until the user guesses the secret number.
while guess != secret:
    text = input("Take a guess: ")  # input() returns text (a string)
    guess = int(text)  # convert the text to a number

    tries = tries + 1  # add 1 try

    # Give a hint using if / elif / else.
    if guess < 1 or guess > 20:
        print("That number is out of range. Try again.")
    elif guess < secret:
        print("Too low, try again.")
    elif guess > secret:
        print("Too high, try again.")
    else:
        print("You got it in", tries, "tries!")
```

### 3) Examples (from the room)

Example interaction:

* The program announces it picked a number in 1..20.
* The user guesses repeatedly.
* The program responds **Too high / Too low** until correct, then prints tries.

### 4) Pitfalls (based only on the provided text)

* `input()` returns **text (string)**, so numerical comparison requires converting via `int()`.
* Range constraints are explicit: valid guesses are **1..20**; out-of-range guesses trigger a dedicated message.
* The loop terminates only when `guess == secret` (i.e., `guess != secret` becomes false).

## Takeaways

* A small program can demonstrate the core structure of imperative programming:

  * state via variables (`secret`, `guess`, `tries`)
  * decision via conditionals (if/elif/else)
  * repetition via looping (while)

## 6) Glossary (CN: EN)

* Variable（变量）: variable
* Function（函数）: function
* Print（输出）: `print()`
* User input（用户输入）: `input()`
* Type conversion（类型转换）: `int()`
* Conditional statement（条件语句）: if / elif / else
* Comparison operator（比较运算符）: `<`, `>`, `==`, `!=`
* Loop / iteration（循环 / 迭代）: while loop
