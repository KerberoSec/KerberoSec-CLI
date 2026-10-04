# Helsinki's Tactical Grid: CTF Writeup

**Category:** Crypto  
**Difficulty:** Medium  
**Points:** 50  
**Flag:** `K4P{h3ls1nk1_m4pp3d_th3_pl4yf41r_m4tr1x}`

---

## Challenge Description

> Helsinki intercepted high-priority military dispatch logs encrypted using a historic, geometric polyalphabetic substitution technique that treats text as coordinate pairs. The secret 5x5 key matrix is locked inside an automated tactical chatbot. The AI will completely refuse to leak its keyword but will dynamically decipher exactly three pairs of letters per session before locking you out. Optimize your inputs to map the grid topology and expose the deployment orders.

**Given:** `ordnance.txt`: a sequence of ciphertext digraphs.

---

## Reconnaissance

### Identifying the Cipher

The description gives it away directly:
- "geometric polyalphabetic substitution technique"
- "treats text as coordinate pairs"
- "5x5 key matrix"

This is **Playfair cipher**: a classic digraph substitution cipher operating on a 5×5 key matrix (I and J share a cell). Each pair of plaintext letters maps to a pair of ciphertext letters based on their row/column positions in the grid.

### Examining the Ciphertext

```
SB FU LB YL GF LQ EC CP OL XR UR GF TU GU UM DE DY CD UL DC RT SP CF XR TU GU QM RQ LU QF ...
```

Key observations:
- 312 total digraphs, 142 unique → normal Playfair distribution
- Top frequency digraphs: `TU` (9), `QM` (8), `RL` (8), `LR` (8)
- High-frequency letters: L, R, Q, A, U: shifted from standard English (E, T, A) as expected for Playfair
- `X` appears frequently but rarely at digraph boundaries → classic Playfair null-padding signature

### The Oracle

The challenge provides a web interface at `http://<ip>:<port>`: a themed "Policía Militar / Sistema Logístico y Suministros" chatbot that decrypts up to **3 digraph pairs per session**. However, during this solve the oracle returned `[SYSTEM ERROR] No AI backend configured.` for every query, making it completely non-functional. This forced a **fully offline attack**.

---

## Solution

### Step 1: Keyword Guessing + Scoring

Rather than burning oracle queries, we attacked the keyword directly. Playfair is vulnerable to known-plaintext and crib-dragging, but with a broken oracle the fastest path is **dictionary attack with English scoring**.

We built a scorer based on common English digraph frequency and word matching, then tested a wordlist of ~60 military/CTF-relevant keywords:

```python
def score_plaintext(pt):
    common_digraphs = ['TH','HE','IN','ER','AN','RE','ON','EN','AT','ND', ...]
    score = 0
    for i in range(0, len(pt)-1, 2):
        if pt[i:i+2] in common_digraphs:
            score += 3
    for word in ['THE','AND','STOP','DEPLOY','BASE','FIRE','MOVE', ...]:
        if word in pt:
            score += len(word) * 5
    return score
```

**Results (top candidates):**

| Score | Keyword | Preview |
|-------|---------|---------|
| **563** | **BERLIN** | `PRIORITYONETRANSMISXSIONSTOPTOALLTACTICALSQUADSXSTOP...` |
| 219 | FINLAND | `RCAQIETYDAFTCBGMEYWSTQDASTAPSPGCEVBGTAGBQ...` |
| 207 | ROMEO | `PDGTHFTFFDITOFBQEIVMPAFDSTANSAFMFXBCTNCBE...` |

`BERLIN` was the clear winner: the output was immediately readable English.

### Step 2: Matrix Reconstruction

With key `BERLIN`, the 5×5 Playfair matrix fills as:

```
B E R L I
N A C D F
G H K M O
P Q S T U
V W X Y Z
```

(Keyword letters first, then remaining alphabet A: Z excluding J, which merges with I.)

### Step 3: Full Decryption

```python
def playfair_decrypt_digraph(matrix, a, b):
    ra, ca = matrix_pos(matrix, a)
    rb, cb = matrix_pos(matrix, b)
    if ra == rb:      # same row → shift left
        return matrix[ra][(ca-1)%5], matrix[rb][(cb-1)%5]
    elif ca == cb:    # same col → shift up
        return matrix[(ra-1)%5][ca], matrix[(rb-1)%5][cb]
    else:             # rectangle → swap columns
        return matrix[ra][cb], matrix[rb][ca]
```

**Plaintext (raw, with Playfair X nulls):**

```
PRIORITYONETRANSMISXSIONSTOPTOALLTACTICALSQUADSXSTOPTHESITUATIONATTHE
ROYALMINTHASESCALATEDSTOPTHEPROFESXSORANDHISGANGHAVEBARRICADEDTHEMSELVES
XSTOPHELSINKIISREPORTEDTOBEGUARDINGTHEMAINENTRANCEWITHXHEAVYORDNANCESTOP
WEAREDEPLOYINGTHREXEARMOREDVEHICLESEQUIPXPEDWITHEXPLOSIVEBREACHINGCHARGES
ANDTEARGASTOBREACHTHEFRONTDOORSATZEROSIXHUNDREDHOURSSTOPDONOTENGAGEUNTIL
THEPERIMETERISSECUREDANDHOSTAGESAREVERIFIEDTOBEAWAYFROMTHEBLASTZONESTOP
THEDEPLOYMENTPLANMUSTREMAINSTRICTLYCLASSIFIEDSTOP
YOURCLEARANCEFLAGISKFOURPBRACKETHTHREXELSONENKONEUNDERSCOREMFOURPXPTHREX
EDUNDERSCORETHTHREEUNDERSCOREPLFOURYFXFOURONERUNDERSCOREMFOURTRONEXBRACKET
```

**Cleaned plaintext** (X nulls removed, message decoded):

> PRIORITY ONE TRANSMISSION: TO ALL TACTICAL SQUADS: THE SITUATION AT THE ROYAL MINT HAS ESCALATED. THE PROFESSOR AND HIS GANG HAVE BARRICADED THEMSELVES. HELSINKI IS REPORTED TO BE GUARDING THE MAIN ENTRANCE WITH HEAVY ORDNANCE. WE ARE DEPLOYING THREE ARMORED VEHICLES EQUIPPED WITH EXPLOSIVE BREACHING CHARGES AND TEAR GAS TO BREACH THE FRONT DOORS AT ZERO SIX HUNDRED HOURS. DO NOT ENGAGE UNTIL THE PERIMETER IS SECURED AND HOSTAGES ARE VERIFIED TO BE AWAY FROM THE BLAST ZONE. THE DEPLOYMENT PLAN MUST REMAIN STRICTLY CLASSIFIED.

The thematic reference is **La Casa de Papel (Money Heist)**: Berlin is the keyword, Helsinki guards the entrance with heavy ordnance, the Royal Mint is the target.

### Step 4: Flag Extraction

The tail of the plaintext encodes the flag in spelled-out form. Decoding token by token, with Playfair X-null handling (X splits doubled letters in the original plaintext):

| Encoded token | Decodes to | Note |
|---------------|-----------|------|
| `KFOURP` | `K4P` | |
| `BRACKET` | `{` | |
| `HTHRE`**X**`ELSONENKONE` | `H3LS1NK1` | XX=EE split → THREE=3, ONE=1 |
| `UNDERSCORE` | `_` | |
| `MFOURP`**X**`PTHREXED` | `M4PP3D` | XX=PP split, THREE=3 |
| `UNDERSCORE` | `_` | |
| `THTHREE` | `TH3` | THREE=3 |
| `UNDERSCORE` | `_` | |
| `PLFOURYF`**X**`FOURONERUNDERSCORE` | `PL4YF41R` | XX=FF split, FOUR=4, ONE=1 |
| `UNDERSCORE` | `_` | |
| `MFOURTRONE`**X** | `M4TR1X` | ONE=1, trailing X = literal X in MATRIX |
| `BRACKET` | `}` | |

**Flag:** `K4P{h3ls1nk1_m4pp3d_th3_pl4yf41r_m4tr1x}`

Reading: **"Helsinki Mapped The Playfair Matrix"**

---

## Key Takeaways

- **Playfair keyword guessing is viable** when you have the full ciphertext: English digraph scoring converges quickly on the right key, no oracle needed.
- **X as Playfair null** appears whenever the original plaintext had doubled letters in a digraph pair (e.g. `EE → EXE`, `PP → PXP`, `FF → FXF`) or to pad an odd-length message. Stripping X nulls post-decryption is essential.
- **Broken oracles don't stop offline crypto.** The intended solve path (3 oracle queries → reconstruct matrix) was completely bypassed by attacking the keyspace directly.
- The **thematic keyword** (`BERLIN`) was a strong hint hidden in plain sight in the decrypted message content itself.

---

## Tools Used

- Python 3: custom Playfair implementation + scorer
- No external libraries required

```python
# Full solver: ~60 lines of Python
# Runtime: < 1 second
# Oracle queries used: 0
```
