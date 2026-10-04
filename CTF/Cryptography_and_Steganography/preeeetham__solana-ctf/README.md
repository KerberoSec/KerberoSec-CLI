# 🏴 Solana CTF: Capture The Flag Challenges & Solutions

A curated collection of **14 Solana-based Capture The Flag (CTF)** challenges, complete with solutions, exploit scripts, and a comprehensive agent guide. The challenges cover real-world Solana vulnerability patterns: from missing signer checks to DeFi oracle manipulation: all deployed on Solana **Devnet**.

---

## 📂 Repository Structure

```
solana-ctf/
├── challenge-1/          # Ghost Admin           (100 pts): Missing signer check
├── challenge-2/          # Good First Impression (100 pts): Vanity address grind
├── challenge-3/          # Logs of Truth         (100 pts): Input-dependent log emission
├── challenge-4/          # The Birthday Seed     (100 pts): Genesis timestamp PDA
├── challenge-5/          # Named by Numbers      (200 pts): Account data parsing
├── challenge-6/          # Signature Safari      (200 pts): Ed25519 verification
├── challenge-7/          # The Lamport Clock     (200 pts): Lamport value as timestamp
├── challenge-8/          # Where is the Needle?  (250 pts): Mass PDA account scanning
├── challenge-9/          # (Integer Overflow)    (300 pts): Arithmetic overflow
├── challenge-10/         # Monkeys and Bananas   (250 pts): NFT metadata tracing
├── challenge-11/         # Do Not Claim Thyself  (300 pts): Creator vs caller exploit
├── challenge-12/         # Voucher Roulette      (300 pts): MD5 hash brute-force
├── challenge-13/         # (Steganography)       (400 pts): RGB steganography
├── challenge-14/         # Sus Protocol          (400 pts): DeFi take_while vs filter bug
│
├── SOLUTIONS.md                  # Detailed write-ups for all solved challenges
├── CTF_V2_SPEC.md                # Predicted v2 challenges (harder successors)
├── SOLANA_CTF_AGENT_GUIDE.md     # Full agent knowledge base for solving CTFs
├── solutions_dashboard.html      # Visual dashboard of all challenge scores
├── package.json                  # Node.js dependencies
├── tsconfig.json                 # TypeScript configuration
└── ctf_wallet.json               # CTF solver wallet (DO NOT COMMIT REAL FUNDS)
```

Each `challenge-N/` directory typically contains:
- `question.txt`: Challenge prompt and hints
- `public_source.rs`: The deployed Solana program's Rust source (when provided)
- `solve.ts`: The exploit/solution TypeScript script
- `explore*.ts`: Reconnaissance scripts for on-chain investigation

---

## 🏆 Scoreboard

| # | Title | Points | Vulnerability | Flag |
|---|-------|--------|---------------|------|
| 1 | Ghost Admin | 100 | Missing signer check (`UncheckedAccount`) | `ST_FLAG{trust_n0_pubk3y}` |
| 2 | Good First Impression | 100 | Vanity address prefix check | `ST_FLAG{k3yp41r_gr1nd1ng_ch4mp}` |
| 3 | Logs of Truth | 100 | Input-dependent flag emission via `msg!()` | `ST_FLAG{1sol_2sol_3sol_truth}` |
| 4 | The Birthday Seed | 100 | PDA seeded with Solana genesis timestamp | `ST_FLAG{ep0ch_0}` |
| 6 | Signature Safari | 200 | Ed25519 verification across 500 pairs | `ST_FLAG{s1g_ch4mp_d1d_th3_d1ff}` |
| 7 | The Lamport Clock | 200 | Lamport transfer amount as Unix timestamp | `ST_FLAG{a_ba1ance_b0rn_in_2006}` |
| 8 | Where is the Needle? | 250 | Scanning 500 PDAs with `getProgramAccounts` | `ST_FLAG{pda_hunt1ng_m4st3r}` |
| 10 | Monkeys and Bananas | 250 | NFT transaction chain tracing | `ST_FLAG{ca11ern0tc4eat0r}` |
| 11 | Do Not Claim Thyself | 300 | Caller ≠ Creator program distinction | `ST_FLAG{ca11er_n0t_creat0r}` |
| 12 | Voucher Roulette | 300 | Per-position MD5 hash brute-force | `ST_FLAG{g00d_on3}` |
| 14 | Sus Protocol | 400 | `take_while` vs `filter` DeFi lending bug | `ST_FLAG{t00k_y0u_a_wh1le}` |

**Total Solved: 2300+ points**

---

## ⚡ Quick Start

### Prerequisites

- **Node.js** ≥ 18
- **Solana CLI** (for wallet generation and CLI interactions)
- **TypeScript** / `ts-node`

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up a Solver Wallet

```bash
# Generate a new keypair
solana-keygen new --outfile ctf_wallet.json --no-bip39-passphrase

# Point Solana CLI to Devnet
solana config set --url devnet --keypair ctf_wallet.json

# Airdrop test SOL
solana airdrop 5
# Or visit https://faucet.solana.com
```

### 3. Run a Solution

Each challenge has its own `solve.ts`. For example:

```bash
# Solve Challenge 1 (Ghost Admin)
npx ts-node challenge-1/solve.ts

# Solve Challenge 14 (Sus Protocol)
npx ts-node challenge-14/solve.ts
```

---

## 🔍 Challenge Summaries

### Challenge 1: Ghost Admin ★☆☆☆☆
**Vulnerability:** The `admin` account uses `UncheckedAccount<'info>` instead of `Signer<'info>`. The program checks `admin.key() == vault.admin` but never verifies the account actually signed the transaction.  
**Exploit:** Pass the admin's public key as the `admin` account without signing with it.

### Challenge 2: Good First Impression ★☆☆☆☆
**Vulnerability:** Program requires the transaction signer's public key to start with `bo1t`.  
**Exploit:** Run `solana-keygen grind --starts-with bo1t:1`, fund the resulting wallet, and sign with it.

### Challenge 3: Logs of Truth ★☆☆☆☆
**Vulnerability:** The `verifyNumber` instruction emits partial flag strings via `msg!()` for specific lamport input values (1 SOL, 2 SOL, 3 SOL).  
**Exploit:** Call the instruction with `1_000_000_000`, `2_000_000_000`, and `3_000_000_000` and concatenate the log fragments.

### Challenge 4: The Birthday Seed ★☆☆☆☆
**Vulnerability:** Vault PDA is derived using Solana's genesis block timestamp (`1584368940`) as the seed.  
**Exploit:** Derive the PDA with `seeds = [b"vault", 1584368940_u64.to_le_bytes()]` and read the stored flag.

### Challenge 6: Signature Safari ★★☆☆☆
**Vulnerability:** 500 `signature: message` pairs are provided; only one is a valid Ed25519 signature for the given public key.  
**Exploit:** Iterate all pairs using `tweetnacl`'s `sign.detached.verify()` to find the valid one, then look up that transaction on Devnet.

### Challenge 7: The Lamport Clock ★★☆☆☆
**Vulnerability:** A specific wallet transfers `1152684000` lamports, which is a Unix timestamp encoding the date July 12, 2006.  
**Exploit:** Decode the lamport amount as a Unix timestamp, derive the date, and POST it to the CTF submission endpoint.

### Challenge 8: Where is the Needle? ★★☆☆☆
**Vulnerability:** One of 500 PDA accounts owned by the program contains the flag.  
**Exploit:** Use `getProgramAccounts` to fetch all accounts, deserialize each (8-byte discriminator + 32-byte flag + 4-byte index), and search for `ST_FLAG`.

### Challenge 10: Monkeys and Bananas ★★★☆☆
**Vulnerability:** The flag is buried inside the transaction history of the NFT's creation chain: not in the NFT itself.  
**Exploit:** Trace NFT → update authority → funding wallet → program interaction → `ClaimFlag` instruction logs.

### Challenge 11: Do Not Claim Thyself ★★★☆☆
**Vulnerability:** Program rewards callers who are NOT the token creator. The flag is emitted in the very first `GetEntry` transaction log.  
**Exploit:** Read the transaction logs from the program's first-ever transaction signature.

### Challenge 12: Voucher Roulette ★★★☆☆
**Vulnerability:** Program validates a 17-character code by computing `MD5(char + position_index)` for each position independently. Each position can be brute-forced separately.  
**Exploit:** For each position (0-16), try all 256 byte values, compute MD5, and compare against `EXPECTED_HASHES[i]`.

### Challenge 14: Sus Protocol ★★★★☆
**Vulnerability:** A DeFi lending protocol calculates visible positions using `.take_while()` (stops at a `Pubkey: default()` gap) but validates exploit conditions using `.filter()` (checks all positions). Withdrawing from a middle position creates a blind spot.  
**Exploit:** Deposit → close middle position → deposit again past the gap → borrow multiple times against the "invisible" real collateral until `real_loans > max_allowed * 2`.

---

## 📚 Key Documents

| File | Description |
|------|-------------|
| [`SOLUTIONS.md`](./SOLUTIONS.md) | Step-by-step write-ups for all 11 solved challenges, including terminal output and obtained flags |
| [`CTF_V2_SPEC.md`](./CTF_V2_SPEC.md) | Predicted v2 challenges (harder successors to each v1 challenge, 5,500 total points) |
| [`SOLANA_CTF_AGENT_GUIDE.md`](./SOLANA_CTF_AGENT_GUIDE.md) | Complete knowledge base: Solana fundamentals, recon playbook, vulnerability catalog, exploit templates |
| [`solutions_dashboard.html`](./solutions_dashboard.html) | Interactive HTML dashboard visualizing all challenge scores and solutions |

---

## 🛠️ Tech Stack

| Tool | Purpose |
|------|---------|
| **TypeScript** + `ts-node` | Exploit scripting and on-chain interaction |
| **`@coral-xyz/anchor`** | Anchor framework client for program interactions |
| **`@solana/web3.js`** | Low-level Solana RPC calls |
| **`tweetnacl`** | Ed25519 signature verification |
| **`pngjs`** | PNG image parsing (steganography challenges) |
| **Solana CLI** | Wallet management, airdrop, transaction inspection |

---

## 🔑 Vulnerability Pattern Reference

| Pattern | Challenge(s) | Key Concept |
|---------|-------------|-------------|
| Missing signer check | Ch. 1 | `UncheckedAccount` vs `Signer` |
| Vanity address grind | Ch. 2 | `solana-keygen grind` |
| Input-dependent log emission | Ch. 3 | `msg!()` with specific inputs |
| Historical on-chain data as PDA seed | Ch. 4 | Solana genesis timestamp `1584368940` |
| Ed25519 signature verification | Ch. 6 | `tweetnacl.sign.detached.verify()` |
| Lamport value encoding | Ch. 7 | Lamports as Unix timestamp |
| Mass PDA account scanning | Ch. 8 | `getProgramAccounts` + `memcmp` filter |
| NFT/transaction chain tracing | Ch. 10 | Multi-hop account relationship graph |
| Creator vs caller distinction | Ch. 11 | Program CPI identity checks |
| Hash brute-force (per position) | Ch. 12 | MD5 of `(char + index)` |
| DeFi iterator mismatch | Ch. 14 | `take_while` creates a blind spot vs `filter` |

---

## 🔮 v2 Challenges (Predicted)

[`CTF_V2_SPEC.md`](./CTF_V2_SPEC.md) documents predicted **v2** versions of each challenge: designed to close the loopholes exploited in v1. Total: **5,500 points** across 14 harder challenges (~30-50 hours for an experienced Solana developer).

| v1 Exploit | v2 Exploit |
|-----------|-----------|
| Missing signer check | Re-initialization overwrite |
| Simple prefix grind | PDA-derived prefix grind |
| Read `msg!()` logs | Decode `set_return_data()` + XOR decrypt |
| Single genesis timestamp | Multi-source on-chain archaeology |
| Flat Borsh layout | Versioned schema + encryption |
| Simple Ed25519 verify | Partial signature reconstruction |
| 500 accounts, 1 flag | 50,000 accounts, 100 decoys + bump verification |
| `take_while` vs `filter` | Oracle price manipulation via unvalidated accounts |

---

## ⚠️ Disclaimer

This repository is for **educational purposes only**. All challenges run on Solana **Devnet** (test network) with no real value. The exploit techniques demonstrated here are common vulnerability patterns used in CTF competitions and security research. Do not apply these techniques to mainnet programs or real assets.

---

## 📄 License

MIT
