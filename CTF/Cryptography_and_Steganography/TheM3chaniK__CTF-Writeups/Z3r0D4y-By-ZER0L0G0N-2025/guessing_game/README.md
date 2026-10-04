# 🧩 Challenge: Guessing Game

**Category:** Reverse Engineering
**Points:** 400

---

### 🔖 **Challenge Description**

> Connect via
>
> nc 172.104.207.121 1337
>
> NOTE: Brute force is not allowed

---

### 🧭 **First Impressions**

Ok we have to nc a server. We have to extract the flag from it only.

---

### 🛠 **Environment & Tools**

* OS: I use Arch Btw
* Tools: netcat
* Assumptions: service replies honestly with `Higher` / `Lower` / `Correct` and enforces the 6-attempt limit.

---

### ▶️ **Dynamic Analysis**

I connected to the server

```bash
nc 172.104.207.121 1337
Welcome to NumberMaster CTF!
Guess the secret number between 1 and 100 in 6 attempts.
Type your guess and press Enter.

Attempts left: 6 > 
```

So we have to guess the number between 1 → 100 within 6 attempts. Brute force is not allowed (and honestly: who wants to spam a service like a bot with 100 guesses? that’s rude). The clean way is binary search: read about it [here](https://www.geeksforgeeks.org/dsa/binary-search/).
(Why so boring? Because computers love halving things. Humans like drama; algorithms like efficiency. 🤷‍♂️)

---

### ⚙️ **Patching / Exploitation / Decoding Process**

Lets solve it

```bash
nc 172.104.207.121 1337
Welcome to NumberMaster CTF!
Guess the secret number between 1 and 100 in 6 attempts.
Type your guess and press Enter.

Attempts left: 6 > 50
Lower
Attempts left: 5 > 25
Higher
Attempts left: 4 > 37
Lower
Attempts left: 3 > 31
Lower
Attempts left: 2 > 28
Higher
Attempts left: 1 > 29

Correct! The secret number was 29.
FLAG: zero{lucky_number_mastered}
```

Steps taken:

1. Start with a mid guess (50).
2. Use `Higher` / `Lower` feedback to halve the search range each time.
3. Converge to the secret number within the allowed attempts.

*Assumptions noted:* server returns truthful directional hints and there are no hidden checks or rate-limits that alter responses.

---

### ✅ **Validation**

* Flag was returned directly by the remote service on a `Correct` response.
* Flag format matches expected CTF pattern `zero{...}` and is corroborated by the interactive transcript.

---

### 🏁 **Flag**

```
zero{lucky_number_mastered}
```

---

### 💡 **Takeaways**

* Logical strategies beat brute force: binary search is the elegant scalpel, not the brute hammer.
* Small interactive services are solved by protocol reasoning; think, don’t spam.
* Netcat + a cool head = instant win for simple TCP puzzles.
* When in doubt, halve the problem (and your coffee consumption). ☕️
* Documentation links are your friend: read the theory before guessing wildly. ([GeeksforGeeks][1])

---

**Solved by TheM3chanik: [contact@them3chanik.com](mailto:contact@them3chanik.com)**

[1]: https://www.geeksforgeeks.org/dsa/binary-search/?utm_source=chatgpt.com "Binary Search"

