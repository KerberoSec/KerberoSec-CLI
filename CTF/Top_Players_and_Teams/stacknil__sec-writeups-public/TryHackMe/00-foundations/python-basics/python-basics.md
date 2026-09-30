---
type: resource-note
status: done
created: 2026-03-11
updated: 2026-03-11
tags: [security-writeup, tryhackme, python, scripting]
source: TryHackMe: Python Basics
platform: tryhackme
room: Python Basics
slug: python-basics
path: TryHackMe/00-foundations/python-basics/python-basics.md
topic: 00-foundations
domain: [foundations]
skills: [python-basics, control-flow, file-io, imports]
artifacts: [concept-notes, cookbook]
sanitized: true
---

# Python Basics

> Room: **Python Basics** (TryHackMe)
> Focus: core Python 3 features for later security scripting.

---

## Summary

Python is a **high‑level, interpreted scripting language** that is perfect for
quick automation and security tooling.

Key ideas:

* You edit a `.py` file and run it with `python3 file.py`.
* Python 3 is the default assumption (syntax differs from Python 2).
* Code runs top‑to‑bottom unless control‑flow (if, loops, functions) changes it.

### 1.1 Hello World & comments

```python
# This is a comment: Python ignores everything after "#" on a line
print("Hello World")
```

* `print()` is a **built‑in function** that sends text to standard output.
* Strings (text) must be wrapped in quotes: `'single'` or `"double"`.

---

## Key Concepts

### 2. Operators: doing work on values

#### 2.1 Arithmetic operators

| Operation      | Operator | Example expression | Result |
| -------------- | -------- | ------------------ | ------ |
| Addition       | `+`      | `1 + 1`            | `2`    |
| Subtraction    | `-`      | `5 - 1`            | `4`    |
| Multiplication | `*`      | `10 * 10`          | `100`  |
| Division       | `/`      | `10 / 2`           | `5.0`  |
| Modulus        | `%`      | `10 % 3`           | `1`    |
| Exponent       | `**`     | `5 ** 2`           | `25`   |

Example snippet:

```python
result = 21 + 43
print(result)  # 64
```

#### 2.2 Comparison operators

Used to ask yes/no questions about values, returning a Boolean (`True` / `False`).

| Meaning                  | Operator | Example  | Result |
| ------------------------ | -------- | -------- | ------ |
| Greater than             | `>`      | `5 > 3`  | True   |
| Less than                | `<`      | `3 < 1`  | False  |
| Equal to                 | `==`     | `2 == 2` | True   |
| Not equal to             | `!=`     | `2 != 3` | True   |
| Greater than or equal to | `>=`     | `5 >= 5` | True   |
| Less than or equal to    | `<=`     | `3 <= 2` | False  |

These are heavily used in `if` statements and loops.

#### 2.3 Logical & Boolean operators

Used to **combine conditions**:

| Operation   | Keyword | Example                                           |
| ----------- | ------- | ------------------------------------------------- |
| logical AND | `and`   | `x >= 5 and x <= 100`  → between 5 and 100        |
| logical OR  | `or`    | `x == 1 or x == 10`    → either 1 **or** 10       |
| logical NOT | `not`   | `not hungry`             → True if `hungry` False |

Example:

```python
a = 1
if a == 1 or a > 10:
    print("a is either 1 or above 10")
```

---

### 3. Variables & data types

A **variable** is a named container for a value.

```python
food = "ice cream"       # string
money = 2000             # integer
age   = 30
age = age + 1            # update based on the old value
```

Python is **dynamically typed**: you do not declare the type explicitly; it is inferred from the value.

#### 3.1 Core data types in this room

| Type name | Purpose                      | Example literal    |
| --------- | ---------------------------- | ------------------ |
| `str`     | text / characters            | `"Star Wars"`      |
| `int`     | whole number                 | `42`               |
| `float`   | decimal / fractional number  | `3.14`             |
| `bool`    | Boolean truth value          | `True`, `False`    |
| `list`    | ordered collection of values | `["Alice", "Bob"]` |

These mirror the movie‑table example from the room: title (str), rating (float), times viewed (int), favourite (bool), seen by (list).

---

### 4. Control flow with `if` / `elif` / `else`

`if` statements let the program **branch** based on a condition.

```python
age = 18

if age < 17:
    print("You are NOT old enough to drive")
else:
    print("You are old enough to drive")
```

Key rules:

* `if` starts the decision; optional `elif` and `else` blocks refine it.
* A colon `:` ends the condition header.
* **Indentation defines scope**: all indented lines under the `if` belong to that block.

Simple flowchart (text version):

```text
[START]
   |
   v
[Is driver younger than 17?]
   |yes                      |no
   v                         v
[print "NOT old"]       [print "old enough"]
   |                         |
   v                         v
 [ STOP ]                 [ STOP ]
```

A slightly richer example using booleans:

```python
name = "bob"
hungry = True

if name == "bob" and hungry:
    print("Bob is hungry")
elif name == "bob" and not hungry:
    print("Bob is not hungry")
else:
    print("Unknown person or hunger state")
```

---

### 5. Loops: repeating work

Loops let you repeat actions without copy‑pasting code.

#### 5.1 `while` loops

Repeat **while a condition remains True**.

```python
i = 1
while i <= 10:
    print(i)
    i = i + 1
```

Execution idea:

1. Start with `i = 1`.
2. Check `i <= 10`. If True → enter loop.
3. Print `i`, then increment.
4. Go back to step 2.
5. Stop once the condition becomes False.

#### 5.2 `for` loops

Great for iterating over **sequences** (lists, ranges, etc.).

```python
websites = ["facebook.com", "google.com", "amazon.com"]

for site in websites:
    print(site)
```

Or over a numeric range:

```python
for i in range(5):  # 0, 1, 2, 3, 4
    print(i)
```

`range(n)` yields `0 .. n-1`: 5 numbers when `n = 5`.

---

### 6. Functions: reusing logic

A **function** is a named block of reusable code.

Basic pattern:

```python
def say_hello(name):
    print("Hello " + name + "! Nice to meet you.")

say_hello("ben")
```

Concepts:

* `def` opens the function definition.
* Parameters go in parentheses, e.g. `name`.
* A colon `:` ends the header, indentation defines the body.
* Call the function by name with arguments: `say_hello("ben")`.

#### 6.1 Returning values

Functions can **return** a result with `return`:

```python
def calc_cost(item):
    if item == "sweets":
        return 3.99
    elif item == "oranges":
        return 1.99
    else:
        return 0.99

spent = 10
spent = spent + calc_cost("sweets")
print("You have spent: " + str(spent))  # 13.99
```

`return` sends a value back to the caller; the function then stops executing.

---

### 7. Mini‑project: Bitcoin price alert

Goal: write a small tool that warns you when your Bitcoin holdings drop below **$30,000**.

Core function:

```python
def bitcoin_to_usd(bitcoin_amount, bitcoin_value_usd):
    """Convert BTC → USD."""
    usd_value = bitcoin_amount * bitcoin_value_usd
    return usd_value
```

Use it in a simple script:

```python
investment_in_bitcoin = 1.2
bitcoin_price_usd     = 40000  # later changed to e.g. 24000

investment_in_usd = bitcoin_to_usd(investment_in_bitcoin, bitcoin_price_usd)

if investment_in_usd < 30000:
    print("[!] Investment below $30,000: consider action.")
else:
    print("[*] Investment above $30,000: still within threshold.")
```

This pattern (function + threshold check) appears constantly in security tooling: e.g. alert when **open ports** exceed a limit, when **response time** is too high, or when **failed logins** exceed a threshold.

---

### 8. Files: reading & writing

Python can talk to the filesystem. Basic approach from the room:

```python
# Reading a whole file
f = open("flag.txt", "r")  # "r" = read
content = f.read()
print(content)
f.close()
```

Writing / appending:

```python
# Append to an existing file
f = open("demofile1.txt", "a")  # "a" = append
f.write("The file will include more text..\n")
f.close()

# Create & write a new file (or overwrite existing)
f = open("demofile2.txt", "w")  # "w" = write
f.write("demofile2 file created, with this content in!\n")
f.close()
```

Professional best practice (not in the room, but useful): use `with` so the file closes automatically:

```python
with open("flag.txt", "r") as f:
    for line in f.readlines():
        print(line.strip())
```

---

### 9. Imports: using libraries

Python ships with a large **standard library**, and you can also install third‑party packages.

Example from the room:

```python
import datetime

current_time = datetime.datetime.now()
print(current_time)
```

Pattern:

* `import <module>` brings a module into your script.
* You access objects inside via `module_name.object_name`.

Security‑relevant libraries (installed via `pip install <name>`):

* `requests`: simple HTTP client for web interaction.
* `scapy`: craft, send, and sniff custom network packets.
* `pwntools`: exploit‑development & CTF helper toolkit.

---

### 10. Takeaways for security work

* Python syntax (indentation, `print`, comments) is the **surface**; the real power comes from **control flow + data structures**.
* Arithmetic & comparison operators underpin **every check** you do: from password length checks to threshold‑based alerts.
* Variables & types matter when you parse logs, JSON, network data, etc.
* `if` & loops let you automate repetitive recon / analysis instead of clicking manually.
* Functions let you package techniques (port scan, directory brute‑force, ARP scan) into reusable units.
* Files & imports are how your script **enters and leaves the outside world** (read wordlists, write results, use libraries).

Mastering these basics once pays off across every later TryHackMe / HackTheBox room.

---

### Appendix: Terminology (EN → ZH)

* variable: 变量
* data type: 数据类型
* string: 字符串
* integer (int): 整数
* float: 浮点数
* boolean / bool: 布尔值
* list: 列表
* operator: 运算符
* arithmetic operator: 算术运算符
* comparison operator: 比较运算符
* logical / boolean operator: 逻辑运算符 / 布尔运算符
* condition: 条件
* control flow: 控制流
* `if` statement: if 语句 / 条件语句
* branch: 分支
* loop: 循环
* `while` loop: while 循环
* `for` loop: for 循环
* function: 函数
* parameter / argument: 参数 / 实参
* return value: 返回值
* script: 脚本
* file handle: 文件句柄
* read / write / append: 读 / 写 / 追加
* standard library: 标准库
* third‑party library / package: 第三方库 / 包
* import: 导入
* threshold: 阈值
* alert: 告警
* Bitcoin: 比特币
