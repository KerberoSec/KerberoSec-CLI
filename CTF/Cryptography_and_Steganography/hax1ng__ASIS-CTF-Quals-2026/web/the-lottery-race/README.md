# The Lottery Race

**Category:** Web  ·  **Flag:** `ASIS{h4shId5_!5_n0T_5aF3!!!!!}`

## Challenge Description

A wallet starts with `1337` coins. You may play the lottery *once* (win 1-9
coins) and need `31337` coins to buy the golden ticket. Prompt: *"You've got one
shot to win the lottery… unless you can make the system race against itself."*

## Initial Analysis

Visiting `/` returns the app source. Routes:

- `/login`: new user with `1337` coins + a ticket.
- `/lottery`: adds a random 1-9 prize (once).
- `/buy`: needs ≥ `31337`.
- `/flag`: accepts the ticket generated for wallet `31337`.

The lottery has a check-then-sleep race:

```python
if u["lottery_done"]:
    return jsonify(error="you already played the lottery"), 403
time.sleep(RACE_WINDOW)          # <- check happened BEFORE the sleep
with USERS_LOCK:
    u["wallet"] += random.randint(1, 9); u["lottery_done"] = True
```

Concurrent requests all pass the check, then all award prizes, but capped at
`MAX_RACE = 5`, so at best `1337 + 5*9 = 1382`, nowhere near `31337`. The race's
real value is producing several one-time tickets for **known wallet values**.

Sending a bad ticket to `/flag` leaks the digest of the correct one:

```json
{"error":"invalid ticket! sha512(Golden Ticket) = 117067c2...bb2286"}
```

The 110-char alphanumeric tickets are Python **Hashids** with min length 110: an integer obfuscator, not a secure token.

## Vulnerability / Core Concept

Hashids as an auth token, plus a sha512 oracle:

- For one integer Hashids picks a **lottery char** and a shuffled base-44
  alphabet from `wallet % 100`. Since `1337 % 100 == 31337 % 100 == 37`, both
  wallets share the same lottery char (`G`) and alphabet.
- `31337 = 16·44² + 8·44 + 9`, so the golden ticket's variable part is just the
  alphabet chars at positions 16, 8, 9 → brute force is `44·43·42 = 79,464`
  guesses, each checked against the leaked sha512.
- With min length 110, Hashids' oversized **padding leaks whole shuffled
  alphabets** (`P1`, `P2`) at fixed offsets of the 1337 ticket, and `P3` is
  computable. The guard characters/order come from the extra known
  wallet/ticket pairs the **race** produced.

## Exploitation

See `solve.py`. Outline:

1. `login()` → stable ticket for wallet 1337.
2. Race `/lottery` (5 concurrent) to gather `wallet -> ticket` pairs; from each
   inner 5-char token recover the guard alphabet order:
   ```python
   first_guard, lottery, first_digit, _, second_guard = ticket[53:58]
   i1 = (wallet%100 + ord(lottery))     % 4
   i2 = (wallet%100 + ord(first_digit)) % 4
   ```
   Re-login and repeat until all 4 guard slots are known.
3. Extract padding alphabets straight out of the long 1337 ticket:
   ```python
   p1 = start_ticket[58:80] + start_ticket[31:53]
   p2 = start_ticket[80:102] + start_ticket[9:31]
   p3 = reorder(p2, p2)     # public Hashids shuffle
   ```
4. Get `sha512(golden)` from `/flag`, then rebuild candidate tickets over
   `itertools.permutations(p1, 3)`: apply guards + the three leaked padding
   layers exactly as Hashids does: until the sha512 matches.
5. Send the recovered ticket as the `ticket` cookie to `/flag`:

```json
{"flag": "ASIS{h4shId5_!5_n0T_5aF3!!!!!}", "ok": true}
```

## Flag

`ASIS{h4shId5_!5_n0T_5aF3!!!!!}`

## Key Takeaways

- Two bugs combine: the lottery **race** yields known tickets for known wallets,
  and **Hashids-as-auth** leaks its shuffled alphabets in padding while `/flag`
  offers a sha512 verification oracle: reducing the golden ticket to ~80k guesses.
- Check-then-act with a sleep in between is a textbook TOCTOU race.
- Hashids obfuscates integer IDs; it is not encryption, a signature, or a secure
  ticket format.
