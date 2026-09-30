# Challenge: Baby Reversing
**Category:** Reverse Engineering  
**Points:** 250  

**Challenge statement:**  
> "Guess the key get the flag! Easy hn yar."

---

## Files provided
- `Babyreversing`: ELF binary (x86_64)

---

## Reproduction (what players see)
Run the binary and enter any key:

$ ./Babyreversing  
Enter the secret key: test  
Wrong key!  

When the correct key is entered:

$ ./Babyreversing  
Enter the secret key: stealthworm  
Correct! The flag is: SW{3334rev3032}  

---

## Quick solution (one-line)
The correct key (`stealthworm`) appears as readable text inside the binary. Using `strings` reveals the key, which yields the flag `SW{3334rev3032}` when provided to the program.

---

## Step-by-step analysis & solution

### 1. Basic file info
Check the binary type:

$ file Babyreversing  
Babyreversing: ELF 64-bit LSB executable, x86-64, ...  

Run it to observe behavior:

$ ./Babyreversing  
Enter the secret key: abc  
Wrong key!  

### 2. Quick static check with `strings`
`strings` is a fast way to look for human-readable text inside a binary. It often reveals prompts, hardcoded keys, or flags in beginner challenges:

$ strings Babyreversing | grep -i "Enter\|Correct\|Wrong\|stealth"  
Enter the secret key:  
stealthworm  
Correct! The flag is: SW{  
Wrong key!  

The presence of `stealthworm` in the `strings` output strongly suggests that it is the expected key.

### 3. Verify by running the binary with the discovered key
Use the discovered key:

$ ./Babyreversing  
Enter the secret key: stealthworm  
Correct! The flag is: SW{3334rev3032}  

This confirms the key and reveals the flag.

---

## Notes
- This is a beginner-friendly challenge; the key is hardcoded in the binary (visible with `strings`).  
- Consider removing raw flags from public repositories if you want participants to solve without spoilers, or keep a separate `solutions/` branch or private repo for full solutions.
