# TripleDES

**Category:** 3DES: Meet-in-the-Middle Attack

## Vulnerability
Triple DES scheme `C = E_k1(D_k2(E_k1(pt)))` with k1 and k2 as 5-digit numbers (10000-99999). The small keyspace makes a meet-in-the-middle attack feasible.

## Approach
1. Used known plaintext prefix `FLAG{` + one unknown byte
2. Built a forward lookup table: `E_k1(pt) → k1` for all k1 values
3. For each k2, computed the reverse intermediate and checked against the forward table
4. Matched k1 and k2, then decrypted the full ciphertext

## Key Insight
Meet-in-the-middle halves the effective search space by attacking each key independently and matching in the middle: reducing 90000² to 2 × 90000 operations.

## Solve Script
See `solve.py`

## Mitigation
- Use AES-256: 3DES is deprecated
- Never use small numeric keys
