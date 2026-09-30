# The Professor's Blockchain Drop: CTF Writeup

**25 pts | Blockchain / OSINT**

---

## Challenge

> The ledger never lies. Every satoshi that left the Royal Mint's custody passed through addresses that exist forever on a public chain. The Professor was meticulous but meticulous people leave meticulous traces. The crew recovered one address from a compromised terminal. That's enough. The chain will tell the rest.
>
> Starting Address: `0x0B0FaA01C67CDA5c3b0D552D5c2886CAb59A6086`
> Network: Sepolia Testnet
> Flag Format: `K4P{...}`

---

## Recon

Opened the starting address on Sepolia Etherscan. Only 2 transactions: one incoming (funded by `0x6a7b8413...f3E396798`) and one outgoing marked **Transfer*** (asterisk = input data attached).

The outgoing tx called method `0x424d494e` which is raw ASCII for `BMIN`: not a real contract function, just data shoved into the calldata field.

---

## Reading the Input Data

Opened tx `0xa28052c2...`, expanded "More Details", grabbed the input data hex and decoded it as UTF-8 (Etherscan has a "View Input As" dropdown that does this instantly):

```
BMINT-RESERVE-MOVEMENT;workflow=COLDPATH-B;ref=MV-2026-0412;seq=1/5;
amt=0.00412ETH;class=CONTINUITY;frag=4b34507b707230
```

Key fields: `seq=1/5` (this is a 5-part chain), `class=CONTINUITY` (this is the real path), and `frag=4b34507b707230` which hex-decodes to `K4P{pr0`.

Two things stand out: there are **5 fragments** to collect, and there's a `workflow` field: `COLDPATH-B`. I made a note of that because it's going to matter later.

---

## Following the Chain

The tx went to `0xaCE3ad6c...3EB165e29` -> opened that address -> 5 transactions, two of them outgoing Transfer* txs. This is where it gets interesting.

**Both outgoing txs have input data.** Decoded both:

```
workflow=COLDPATH-A;ref=MV-2026-0415;seq=NA;class=ROUTINE;frag=4b34507b6e3074
workflow=COLDPATH-B;ref=MV-2026-0418;seq=2/5;class=CONTINUITY;frag=6633737330725f
```

- COLDPATH-A, `seq=NA`, `class=ROUTINE` -> decoy. Frag decodes to `K4P{n0t` (nice troll).
- COLDPATH-B, `seq=2/5`, `class=CONTINUITY` -> real. Frag decodes to `f3ss0r_`.

The pattern is clear: follow **COLDPATH-B**, ignore everything with `class=ROUTINE` or `seq=NA`.

---

## Fragments 3, 4, 5

Continued hopping through each destination address, always grabbing outgoing Transfer* txs and filtering by `workflow=COLDPATH-B`:

**Address `0x135c3315...Ef0dBF817`** (seq 3/5)
```
workflow=COLDPATH-B;ref=MV-2026-0423;seq=3/5;frag=6c3366745f7468
```
-> `l3ft_th`

There was also an incoming Transfer* from `0xb2f58109...` with `co-auth;ref=NONE;policy=UNLISTED;note=second-signature`: another decoy, no frag field, ignored.

**Address `0x200f237D...F86C81BAb`** (seq 4/5)
```
workflow=COLDPATH-B;ref=MV-2026-0429;seq=4/5;frag=335f63683431
```
-> `3_ch41`

Had two outgoing txs again. The other one was another ATTEST/ROUTINE decoy with `frag=726562616e63652d6f6b` = `rebalance-ok`. Easy to skip.

**Address `0xeAbbfA9C...BA73CAeE2`** (seq 5/5)
```
workflow=COLDPATH-B;ref=MV-2026-0501;seq=5/5;frag=6e7d
```
-> `n}`

---

## Flag Assembly

| Seq | Hex frag | Decoded |
|-----|----------|---------|
| 1/5 | `4b34507b707230` | `K4P{pr0` |
| 2/5 | `6633737330725f` | `f3ss0r_` |
| 3/5 | `6c3366745f7468` | `l3ft_th` |
| 4/5 | `335f63683431` | `3_ch41` |
| 5/5 | `6e7d` | `n}` |

```
K4P{pr0f3ss0r_l3ft_th3_ch41n}
```

---

## Summary

The challenge is a blockchain breadcrumb trail across 5 Sepolia addresses. Each hop has multiple outgoing transactions: one real (COLDPATH-B, class=CONTINUITY, sequential seq field) and one or more decoys (COLDPATH-A, ATTEST, class=ROUTINE, seq=NA). Each real tx carries a hex-encoded flag fragment in the `frag=` field of its calldata, readable as plain UTF-8. Collect all 5, concat in order, done.

The only "trick" is not getting confused by the decoys: once you notice the `workflow` and `class` fields are consistent across the real chain, it's just methodical hopping.
