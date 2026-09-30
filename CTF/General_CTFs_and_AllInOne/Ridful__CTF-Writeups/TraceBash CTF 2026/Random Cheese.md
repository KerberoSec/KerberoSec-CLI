# Random Cheese: Tracebash CTF Writeup

**Category:** Web  
**Flag:** `TBCTF{t0m_4nd_j3rry_l0v3s_ch33s3_4nd_r4nd0mness}`  
**Author:** DeadDroid

---

## Challenge Description

> Jerry's finally opened his dream cheese shop, and Tom is furious! Every customer gets a lucky draw: spin the wheel 10 times and score 85+ to win the grand meal. But Tom rigged the system to make sure nobody ever gets THAT lucky... or did he?

---

## Recon

Visiting the challenge site presents a lucky draw wheel with 10 items valued 1-10. The goal is to spin 10 times and accumulate a total score of **85 or more** to unlock a "Claim Flag" button.

Poking around the app reveals a `/settings` page where users can set a **Lucky Number** between 1 and 1000. A note on the page mentions that changing it resets your draw progress: a hint that this number is tied to the game's randomness.

Watching the network traffic (via HAR log), each spin fires a `POST /spin` request with no body. The server responds with the result:

```json
{ "val": 8, "spins": 3, "score": 21, "image": "cheese-svgrepo-com.svg" }
```

The randomness is entirely server-side: there's nothing to manipulate in the request itself.

---

## Vulnerability

The lucky number is used as a **seed for Python's `random` module** on the server. Since the seed range is only **1-1000**, the full space of possible spin sequences is trivially small and completely predictable once you know the seed.

---

## Exploitation

Brute-force all 1000 possible seeds locally, simulating 10 calls to `random.randint(1, 10)` for each, and find which seed produces a total score ≥ 85:

```python
import random

for seed in range(1, 1001):
    random.seed(seed)
    spins = [random.randint(1, 10) for _ in range(10)]
    if sum(spins) >= 85:
        print(f"Seed: {seed}, Score: {sum(spins)}, Spins: {spins}")
```

**Output:**

```
Seed: 854, Score: 87, Spins: [6, 6, 9, 9, 10, 8, 10, 9, 10, 10]
```

Seed `854` is the **only** value in the entire range that produces a winning sequence.

Set the lucky number to 854 via the settings form (or directly via curl):

```bash
curl 'https://web-random-cheese.tracebash.xyz/update_lucky' \
  -b 'session=<your_session_cookie>' \
  -H 'content-type: application/x-www-form-urlencoded' \
  --data-raw 'lucky_number=854'
```

Then spin the wheel 10 times. The server, now seeded with 854, produces the predicted sequence totalling **87**. The "Claim Flag" button enables and returns the flag.

---

## Key Takeaway

A seeded PRNG is **not random** if the seed space is small and guessable. With only 1000 possible seeds, an attacker can simulate every possible outcome offline in milliseconds and trivially identify the winning configuration. Always use a cryptographically secure RNG (`secrets` module in Python, for example) for anything security-sensitive, and never let users influence the seed.
