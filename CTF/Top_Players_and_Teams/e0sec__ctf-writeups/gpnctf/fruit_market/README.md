# Fruit Market

| Field | Details |
|-------|---------|
| **Challenge** | Fruit Market |
| **CTF** | GPN CTF 2024 |
| **Category** | Web3 / Blockchain |
| **Flag** | `GPNCTF{lOOk_mAm4_1_g0T_S0me_fruITs_a7_MY_J08}` |

---

## Overview

A blockchain fruit DEX (AMM) with three tokens: APL, BAN, and CHY. Playing as a trade transaction coordinator, the goal is to accumulate 500 APL to get the flag, starting with just 10 APL from the fruit basket.

---

## Vulnerability

As coordinator, you see signed swap transactions via Socket-IO **before** they are submitted to the chain. There is no enforcement of neutrality: this is a classic front-running opportunity.

---

## Attack: Sandwich

For each incoming trader transaction:

1. **Front-run:** submit your own swap in the same direction (APL→BAN or APL→CHY only)
2. **Submit trader's tx:** the large trade shifts the AMM price
3. **Back-run:** swap your received tokens back at the shifted price
4. **Net result:** extract the price impact as APL profit

> **Key fix:** only sandwich APL-containing DEX pairs (APL-BAN, APL-CHY). Sandwiching BAN-CHY swaps leaves you stuck with tokens you can't convert back to APL.

---

## Result

```
10 APL → 89 → 163 → 284 → 406 → 493 → 572 APL
```

Flag returned at `balance >= 500`.

---

## Flag

```
GPNCTF{lOOk_mAm4_1_g0T_S0me_fruITs_a7_MY_J08}
```
