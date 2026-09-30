# Rosetta Gauntlet

**Category:** Misc | **Difficulty:** Medium-Hard (350 pts) | **Flag:** `IIITL{N0_M0R3_S3CR3T5!!!}`

## TL;DR

An automated trivia gauntlet that cycles through 4 encoding schemes (Base64, Hex, Atbash, Morse) over 18 rounds with a 3-second time limit per answer. You can't beat it by hand: you script the whole thing. After winning, the server gives you a cryptic riddle whose solution is: take the last character of each answer, uppercase it, ROT13 it, wrap it in `IIITL{}`.

## What We're Given

No files. Just a netcat address: `nc 34.131.41.57 1337`.

Connecting by hand reveals a game show from hell: the server asks trivia questions, but every question arrives encoded. You have to decode it, figure out the answer, re-encode the answer in the same scheme, and send it back: all within 3 seconds. Do this 18 times in a row without a single mistake or you get dropped back to round 1.

The challenge is called "Rosetta Gauntlet," which is a pretty solid hint that multiple encoding/translation schemes are involved.

## Initial Recon

First thing we did was just connect manually and watch what happened:

```
$ nc 34.131.41.57 1337
Welcome to the Rosetta Gauntlet!
Press Enter to begin...

Question 1/18
Message: V2hhdCBpcyB0aGUgbGFyZ2VzdCBjb250aW5lbnQ/
Answer >
```

That `V2hhdCBp...` ending with `=` is a dead giveaway: that's Base64. Decoding it gives us `What is the largest continent?`, and the answer is `Asia`. But we have to send `Asia` back as Base64: `QXNpYQ==`.

We did this manually for a few rounds to map out the pattern:

- **Round 1**: Base64 (geography trivia)
- **Round 2**: Hex (math/conversions)
- **Round 3**: Atbash (programming questions about Python underscores)
- **Round 4**: Morse (G-themed trivia: Gonzalez, GHz, etc.)
- **Round 5**: Back to Base64...

The encoding scheme cycles every 4 questions, repeating for all 18 rounds. The question topics are also somewhat predictable by position. This screamed "automate me."

Three seconds per question means no human can possibly win this by hand: certainly not decoding Morse, looking up an answer, and re-encoding it in that time window. The challenge is really asking you to write a bot.

## The Vulnerability / Trick

There's no "vulnerability" here in the traditional sense: this is a programming challenge. The trick is:

1. **Recognize the encoding cycle** and automate decode/encode for all 4 schemes
2. **Build a knowledge base** for each question position, since the question *topics* also repeat (with randomized wording each run)
3. **Handle dynamic math questions** with regex, since some questions compute something different each time
4. **Survive 50+ runs** to discover all question variants across all 18 positions

The four encoding schemes we need:
- **Base64**: Python's `base64.b64decode` / `base64.b64encode`: the standard encoding that maps binary data to printable ASCII
- **Hex**: `bytes.fromhex` / `.encode().hex()`: converts bytes to their hexadecimal representation
- **Atbash**: A simple substitution cipher where A↔Z, B↔Y, C↔X, etc. It's its own inverse, so encoding and decoding use the same function
- **Morse code**: The classic dots-and-dashes system; we need lookup tables for both directions

The harder part is actually the flag construction at the end. The server doesn't just hand you `IIITL{...}`: instead it gives you a riddle.

## Building the Exploit

### Step 1: The Four Codecs

We implemented all four in `solve.py`. Atbash is elegant because it's its own inverse:

```python
def atbash(s):
    result = []
    for c in s:
        if c.isupper():
            result.append(chr(ord('Z') - (ord(c) - ord('A'))))
        elif c.islower():
            result.append(chr(ord('z') - (ord(c) - ord('a'))))
        else:
            result.append(c)
    return ''.join(result)
```

Encode and decode are the same call. Letters flip across the alphabet, non-letters pass through unchanged.

Morse needed bidirectional lookup tables and handling for the `/` word separator:

```python
def decode_morse(s):
    words = s.strip().split(' / ')
    result = []
    for word in words:
        letters = word.strip().split(' ')
        decoded = ''.join(MORSE_MAP.get(l, '') for l in letters if l)
        result.append(decoded)
    return ' '.join(result)
```

### Step 2: Knowledge Bases by Question Number

Each question position has consistent themes but randomized wording. We built dictionaries keyed by distinctive substrings:

```python
Q1_ANSWERS = {
    'continent at the south pole': 'Antarctica',
    'sahara': 'Africa',
    'sydney opera house': 'Australia',
    'largest continent': 'Asia',
    'egyptian city': 'Alexandria',
    'llama': 'Alpaca',   # this one caught us off guard
    'nh3': 'Ammonia',
    'main artery': 'Aorta',
}
```

Lookup works by checking if any dictionary key appears as a substring in the decoded question:

```python
def lookup_answer(question, answer_map):
    q_lower = question.lower()
    for key, answer in answer_map.items():
        if key in q_lower:
            return answer
    return None
```

### Step 3: Dynamic Math Questions

Some positions always ask math questions but with different numbers each run. Q2 (hex-encoded) had the most variety: octal conversions, currency subtraction, hex representations, binary, division. We handled these with regex:

```python
def compute_q2(decoded):
    q = decoded.lower().strip().rstrip('.?!')

    m = re.search(r'(\d+)\s+divided by\s+(\d+)', q)
    if m:
        a, b = int(m.group(1)), int(m.group(2))
        res = a / b
        if res == int(res):
            return str(int(res))
        return str(res)

    m = re.search(r'what is (\d+) in hex(?:adecimal)?', q)
    if m:
        return hex(int(m.group(1)))[2:].upper()

    # ... and so on for 8 more patterns
```

Q9 through Q18 each needed their own handler as we discovered them across multiple runs. Q13 was the sneakiest: questions like `7 multiplied by 0 plus 4033 equals?`: the `7` is flavor text, the `0` multiplier makes the first term zero, and the answer is just the constant `4033`. When we tried full arithmetic for non-zero multipliers, it failed. The server apparently just wants the constant term `K` for the "N times M plus K" format.

### Step 4: The Main Loop

We used pwntools (a library built for CTF automation that handles network connections cleanly) to connect, parse each question, dispatch to the right handler, and send the encoded answer:

```python
def solve_once():
    r = remote('34.131.41.57', 1337)
    r.recvuntil(b'begin...')
    r.sendline(b'')

    for i in range(30):
        data = r.recvuntil(b'Answer > ', timeout=10)
        m_round = re.search(r'Question (\d+)', data_str)
        m_msg = re.search(r'Message: (.+?)(?:\r?\n|$)', data_str)

        raw_message = m_msg.group(1).strip()
        qnum = int(m_round.group(1))

        decoded, answer, encoded_answer = handle_question(qnum, raw_message)

        if answer is None:
            r.close()
            return False   # unknown question variant, retry

        r.sendline(encoded_answer.encode())
```

If we hit an unknown question variant, we bail and retry immediately. Each run that fails teaches us something new to add to the knowledge base.

### Step 5: Cracking the Riddle

After surviving all 18 rounds, the server delivers a theatrical riddle instead of just the flag:

```
"Before you lie the answers… or are they questions?
For what you seek may dwell at the beginning… or at the end.
Of the question… or the answer.
Not all paths lead astray, but only one leads true.
Gather your chosen whispers, in their pure form,
And raise them:  let them stand tall, unyielding...
Then set them upon the turning path once more,
Where forms shift and meanings blur,
Where only some will change, and others remain untouched by fate.
When the final shape reveals itself:  enclose it within the mark of triumph."
```

We broke this down line by line:

- **"at the beginning… or at the end"** + **"of the question… or the answer"**: take first or last character of each question/answer. Trying last character of each answer worked.
- **"Gather your chosen whispers, in their pure form"**: collect those characters as-is (the raw answers, not encoded versions).
- **"raise them: let them stand tall"**: uppercase them.
- **"set them upon the turning path"**: ROT13. "Turning path" = rotation cipher. ROT13 is the classic rotation by 13, where A↔N, B↔O, etc. It's its own inverse, just like Atbash.

Let's walk through it with our winning run's answers:

| Q# | Answer | Last char |
|----|--------|-----------|
| 1 | Africa | a |
| 2 | 060 | 0 |
| 3 | _init_ | _ |
| 4 | GHz | z |
| 5 | U+0030 | 0 |
| 6 | 1Megabyte | e |
| 7 | F3 | 3 |
| 8 | _ | _ |
| 9 | 1DF | F |
| 10 | F3 | 3 |
| 11 | _pop | p |
| 12 | Snake | e |
| 13 | 4033 | 3 |
| 14 | Xinjiang | g |
| 15 | 305 | 5 |
| 16 | ! | ! |
| 17 | ! | ! |
| 18 | !! | ! |

Concatenated: `a0_z0e3_F3pe3g5!!!`

Uppercased: `A0_Z0E3_F3PE3G5!!!`

ROT13 applied (only letters rotate, digits and symbols stay): `N0_M0R3_S3CR3T5!!!`

That reads "NO MORE SECRETS." Wrap it: `IIITL{N0_M0R3_S3CR3T5!!!}`

## Running It

After ~50 iterations of the solver (each run discovering new question variants and adding them to the knowledge base), a successful run looks like this:

```
[*] Attempt 47/50
[*] Opening connection to 34.131.41.57 on port 1337
[*] Q1: 'What continent surrounds the Sahara desert?' -> 'Africa'
[*] Q2: '7 bytes minus 7 bytes = ?' -> '0.00'
[*] Q3: 'In Python, what convention is used for initialization? (dunder)' -> '_init_'
[*] Q4: 'POP SINGER SELENAS LAST NAME IS,' -> 'Gomez'
...
[*] Q18: '! IS USED IN BASH. WHAT TWO-CHARACTER COMMAND REPEATS THE PREVIOUS COMMAND?' -> '!!'
[*] Riddle received, flag construction starts
[+] FLAG: IIITL{N0_M0R3_S3CR3T5!!!}
```

## Key Takeaways

**The technique:** Automated gauntlet solving: when a challenge is "too fast for humans," the answer is always scripted automation. Build a state machine that handles each round type, and iteratively add knowledge base entries as you discover new question variants.

**Tools worth remembering:**
- `pwntools` for socket automation: `remote()`, `recvuntil()`, `sendline()` make this kind of challenge trivial to wire up
- Python's `base64` and `binascii` modules for the common CTF encodings
- `re` (regex) for parsing dynamic question text

**The flag format gotcha:** The default flag format for this CTF is `ictf{}`, but this challenge uses `IIITL{}` (IIIT Lucknow, the hosting institution). We burned 3 submission attempts trying `ictf{N0_M0R3_S3CR3T5!!!}` before the penny dropped. Always read the full challenge description: flag format exceptions are usually noted there.

**Dead ends:**
- Q11 bird sound variant: we tried `_chirp`, `_cheep`, `_peep`, `_tweet`, `_pip`, `_chirrup`, `_whoop`, `_beep`, `_chip`, `_swoop`, and even all-caps versions. None of them were accepted. We eventually got lucky with the music variant (`_pop`) appearing in round 11 instead, which let us complete the run without ever needing the bird answer.
- Q2 octal for n≥64: the server seems to have a bug where it generates a question expecting a 2-digit octal answer but the spec says 3 digits. We just bail and retry whenever this variant appears.
- Q13 arithmetic: trying to compute `N * M + K` fully gives wrong answers. The server only wants `K`. We never figured out why: probably just a quirky challenge design.

**ROT13 recognition tip:** When a riddle mentions "turning," "rotating," "shifting," or cipher-like language, and the answer is text that should be readable, ROT13 is almost always the first thing to try. It's the most common "light obfuscation" in CTFs because it's reversible and produces readable output for English words.
