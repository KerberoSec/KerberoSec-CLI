# Solana CTF Agent Guide: Complete Knowledge Base

> **Purpose:** This document is a comprehensive reference for an AI agent tasked with solving Solana-based Capture The Flag (CTF) challenges. It contains everything learned from solving 14 challenges in v1, plus advanced techniques, common vulnerability patterns, and setup instructions to handle harder future versions.

---

## Table of Contents

1. [Environment Setup](#1-environment-setup)
2. [Solana Fundamentals for CTFs](#2-solana-fundamentals-for-ctfs)
3. [Reconnaissance Playbook](#3-reconnaissance-playbook)
4. [Vulnerability Pattern Catalog](#4-vulnerability-pattern-catalog)
5. [Exploit Execution Patterns](#5-exploit-execution-patterns)
6. [Advanced Techniques for Harder CTFs](#6-advanced-techniques-for-harder-ctfs)
7. [Tool Reference](#7-tool-reference)
8. [Lessons Learned from v1](#8-lessons-learned-from-v1)
9. [Anti-Patterns & Pitfalls](#9-anti-patterns--pitfalls)

---

## 1. Environment Setup

### 1.1 Create & Fund a Solver Wallet

**CRITICAL: Do this FIRST before attempting any challenge.**

```bash
# Step 1: Install Solana CLI (if not installed)
sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"

# Step 2: Generate a new keypair for the CTF
solana-keygen new --outfile ctf_wallet.json --no-bip39-passphrase

# Step 3: Set it as the default keypair
solana config set --keypair ctf_wallet.json

# Step 4: Set cluster to Devnet (most CTFs run on Devnet)
solana config set --url devnet

# Step 5: Check the wallet address
solana address

# Step 6: Fund the wallet
solana airdrop 5
# If airdrop fails (rate limited), ask the user to:
#   - Visit https://faucet.solana.com
#   - Paste the wallet address
#   - Request 5 SOL on Devnet
# Or transfer from an existing funded wallet:
#   solana transfer <NEW_WALLET_ADDRESS> 5 --from <FUNDED_WALLET>.json --url devnet

# Step 7: Verify the balance
solana balance
```

> **ASK THE USER:** "I've created a solver wallet at address `<ADDRESS>`. Please deposit at least 5 SOL on Devnet to this address so we have enough to cover transaction fees and any deposits required by the challenges. You can use `solana airdrop 5` or visit https://faucet.solana.com."

### 1.2 Install Node.js Dependencies

Most Solana CTF exploits are written in TypeScript using Anchor:

```bash
npm init -y
npm install @coral-xyz/anchor @solana/web3.js @solana/spl-token bs58 tweetnacl
npm install -D typescript ts-node @types/node
```

Create a `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "es2020",
    "module": "commonjs",
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "strict": false,
    "outDir": "./dist"
  }
}
```

### 1.3 Python Dependencies (for quick scripting)

```bash
pip install base58 cryptography pynacl requests
```

### 1.4 Useful CLI Tools

```bash
# Anchor CLI (for IDL fetching)
cargo install --git https://github.com/coral-xyz/anchor --tag v0.30.1 anchor-cli

# Solana CLI tools
solana --version
solana config get
```

---

## 2. Solana Fundamentals for CTFs

### 2.1 Account Model

Solana uses an **account-based model** (not UTXO). Every piece of state lives in an account:

| Property | Description |
|---|---|
| **Public Key** | 32-byte Ed25519 public key (base58 encoded) |
| **Owner** | The program that owns this account (can modify its data) |
| **Lamports** | Balance in lamports (1 SOL = 1,000,000,000 lamports) |
| **Data** | Arbitrary byte array storing program state |
| **Executable** | Whether this account contains a deployed program |
| **Rent Epoch** | When rent was last collected |

### 2.2 Programs

- Programs are **stateless**. They read/write state from/to accounts passed as instruction arguments.
- Programs are identified by their **Program ID** (a public key).
- The **System Program** (`11111111111111111111111111111111`) handles SOL transfers and account creation.
- The **Token Program** (`TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA`) handles SPL token operations.

### 2.3 Program Derived Addresses (PDAs)

PDAs are deterministic addresses derived from a program ID and seeds. They are **NOT on the Ed25519 curve** (no private key exists).

```rust
// Rust
let (pda, bump) = Pubkey::find_program_address(&[b"seed", user.key().as_ref()], &program_id);

// TypeScript
const [pda, bump] = PublicKey.findProgramAddressSync(
  [Buffer.from("seed"), user.toBuffer()],
  programId
);
```

**CTF Relevance:** Many challenges hide flags in PDA accounts. Knowing how to derive them is essential.

### 2.4 Anchor Framework

Most Solana CTFs use the **Anchor framework**. Key concepts:

- **IDL (Interface Definition Language):** JSON file describing a program's instructions, accounts, and types.
- **Discriminator:** First 8 bytes of an instruction or account, derived from `sha256("instruction_name")[0..8]` or `sha256("account:AccountName")[0..8]`.
- **Account Validation Macros:** `#[account(signer)]`, `#[account(mut)]`, `#[account(seeds = [...], bump)]`.

**Fetching an IDL:**
```bash
anchor idl fetch <PROGRAM_ID> --provider.cluster devnet
```

If `anchor idl fetch` fails, try fetching the IDL account manually:
```typescript
// The IDL account is at a PDA derived from the program ID
const [idlAddr] = PublicKey.findProgramAddressSync(
  [Buffer.from("anchor:idl"), programId.toBuffer()],
  programId
);
```

### 2.5 Transaction Structure

A Solana transaction contains:
1. **Signatures**: Ed25519 signatures from required signers.
2. **Message**: Contains:
   - **Account Keys**: All accounts referenced.
   - **Recent Blockhash**: For replay protection.
   - **Instructions**: Program ID + account indices + data bytes.

### 2.6 Cross-Program Invocation (CPI)

Programs can call other programs via CPI. This is important for:
- Token minting/transferring
- PDA-signed operations
- Multi-program exploits

---

## 3. Reconnaissance Playbook

### 3.0 Decision Tree

When presented with a challenge, follow this order:

```
1. READ the question text carefully (every word matters).
2. CHECK if there are source files (.rs, .ts, .json) in the challenge folder.
3. IDENTIFY the program ID or target public key.
4. FETCH the IDL (if Anchor program).
5. SCAN transaction history of the program and related accounts.
6. DECODE account data of relevant PDAs.
7. TRACE funding sources and deployer wallets.
8. LOOK for flags in transaction logs, account data, and metadata.
```

### 3.1 Reading the Question

**Every word in the question is a hint.** Common patterns:

| Phrase in Question | What It Usually Means |
|---|---|
| "first impression" | Vanity address / public key prefix check |
| "signature" | Ed25519 signature verification |
| "birthday" / "genesis" | Solana genesis timestamp (1584368940) |
| "seed" | PDA derivation with specific seeds |
| "needle" / "filter" | Scan many accounts for a specific one |
| "not claim thyself" / "forger" | Creator/caller distinction exploit |
| "wrap" / "overflow" | Integer overflow/underflow |
| "collateral" / "borrow" / "lending" | DeFi protocol logic bug |
| "monkey" / "NFT" / "history" | NFT metadata and transaction tracing |
| "image" / "colors" / "stripped" | Steganography in images |
| "calendar" / "clock" / "lamport" | Timestamp or lamport value as data |
| "random" / "roulette" | Predictable PRNG exploit |

### 3.2 Checking for Source Files

```bash
ls challenge-N/
```

Look for:
- `*.rs`: Rust source code (the program logic). **READ THIS FIRST.**
- `*.ts`: TypeScript files (test scripts, sometimes contain hints).
- `*.json`: IDL files, keypairs, or configuration.
- `*.txt`: Question text, data dumps.
- `*.png` / `*.jpg`: Images (check for steganography).

### 3.3 Fetching the Program IDL

```bash
# Method 1: Anchor CLI
anchor idl fetch <PROGRAM_ID> --provider.cluster devnet

# Method 2: Via RPC (if anchor CLI fails)
# The IDL is stored in a PDA at seeds ["anchor:idl", program_id]
```

```typescript
// Method 3: In TypeScript
import { Program, AnchorProvider } from "@coral-xyz/anchor";
const idl = await Program.fetchIdl(programId, provider);
console.log(JSON.stringify(idl, null, 2));
```

### 3.4 Scanning Transaction History

```python
import urllib.request, json, time

def get_signatures(address, limit=1000):
    """Get all transaction signatures for an address."""
    all_sigs = []
    before = None
    while True:
        params = [address, {"limit": limit}]
        if before:
            params[1]["before"] = before
        req = urllib.request.Request(
            "https://api.devnet.solana.com",
            data=json.dumps({
                "jsonrpc": "2.0", "id": 1,
                "method": "getSignaturesForAddress",
                "params": params
            }).encode(),
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req) as f:
            result = json.loads(f.read())["result"]
        if not result:
            break
        all_sigs.extend(result)
        if len(result) < limit:
            break
        before = result[-1]["signature"]
        time.sleep(0.5)  # Rate limiting
    return all_sigs

def get_transaction(signature):
    """Get full transaction details."""
    time.sleep(0.5)  # Rate limiting
    req = urllib.request.Request(
        "https://api.devnet.solana.com",
        data=json.dumps({
            "jsonrpc": "2.0", "id": 1,
            "method": "getTransaction",
            "params": [signature, {
                "encoding": "jsonParsed",
                "maxSupportedTransactionVersion": 0
            }]
        }).encode(),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as f:
        return json.loads(f.read())["result"]
```

### 3.5 Decoding Account Data

```python
import base64, base58

def get_account_info(address):
    """Fetch and decode account data."""
    req = urllib.request.Request(
        "https://api.devnet.solana.com",
        data=json.dumps({
            "jsonrpc": "2.0", "id": 1,
            "method": "getAccountInfo",
            "params": [address, {"encoding": "base64"}]
        }).encode(),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as f:
        result = json.loads(f.read())["result"]["value"]
    data = base64.b64decode(result["data"][0])
    return {
        "owner": result["owner"],
        "lamports": result["lamports"],
        "data": data,
        "data_hex": data.hex()
    }
```

### 3.6 Scanning Transaction Logs for Flags

```python
def scan_for_flags(program_id):
    """Scan all transactions of a program for flag strings."""
    sigs = get_signatures(program_id)
    for sig_info in sigs:
        tx = get_transaction(sig_info["signature"])
        if tx:
            logs = tx.get("meta", {}).get("logMessages", [])
            for log in logs:
                if "FLAG" in log or "flag" in log:
                    print(f"FOUND FLAG in {sig_info['signature']}:")
                    print(f"  {log}")
```

### 3.7 Tracing Account Relationships

When you have a target address, trace its connections:

```
Target Address
├── Transaction History → Who interacted with it?
├── Owner → Which program owns it?
├── Data → What state does it hold?
├── Funding Source → Who created/funded it?
│   └── Funding Source's History → More connections
└── Related PDAs → Derived accounts
```

**IMPORTANT:** Stay focused on the challenge. Don't follow traces into other challenges' accounts.

---

## 4. Vulnerability Pattern Catalog

### 4.1 Missing Signer Check (v1 Challenge 1)

**The Bug:**
```rust
// VULNERABLE: No signer check on admin
pub struct AdminWithdraw<'info> {
    pub admin: UncheckedAccount<'info>,  // Should be Signer<'info>
    #[account(seeds = [b"vault"], bump)]
    pub vault: Account<'info, Vault>,
}
```

**The Exploit:** Pass the admin's public key as an account without signing. The program checks `admin.key() == vault.admin` but never verifies `.is_signer`.

**Detection Pattern:** Look for `UncheckedAccount` or `AccountInfo` where `Signer` should be used. Search for missing `.is_signer` checks.

**Exploit Template:**
```typescript
await program.methods
  .adminWithdraw()
  .accounts({
    admin: vaultAdminPubkey,  // Not signing, just passing the key
    vault: vaultPDA,
  })
  .rpc();
```

---

### 4.2 Vanity Address / Public Key Prefix Check (v1 Challenge 2)

**The Bug:** Program requires the signer's public key to start with specific characters.

```rust
let signer_str = ctx.accounts.signer.key().to_string();
require!(signer_str.starts_with("bo1t"), ErrorCode::UnauthorizedFlag);
```

**The Exploit:**
```bash
# Grind a keypair with the required prefix
solana-keygen grind --starts-with bo1t:1

# Fund the vanity address
solana transfer <VANITY_ADDRESS> 1 --url devnet

# Use it to sign the transaction
```

**Detection Pattern:** Look for string comparisons on public keys, `starts_with`, `ends_with`, or character checks.

---

### 4.3 Input-Dependent Flag Emission (v1 Challenge 3)

**The Bug:** Program emits different parts of a flag based on input values.

```rust
if input == 1_000_000_000 { msg!("ST_FLAG{1sol_"); }
if input == 2_000_000_000 { msg!("2sol_3sol_"); }
if input == 3_000_000_000 { msg!("truth}"); }
```

**The Exploit:** Call the instruction with each valid input and concatenate the log outputs.

**Detection Pattern:** Look for conditional `msg!()` calls, range-bounded inputs, or error messages that hint at valid ranges (e.g., "TooSmall", "TooLarge").

---

### 4.4 PDA Seed Derivation from Historical Data (v1 Challenge 4)

**The Bug:** PDA seeds use a known historical value (e.g., Solana genesis timestamp).

**Key Values to Know:**
| Value | Number |
|---|---|
| Solana Mainnet Genesis Timestamp | `1584368940` |
| Solana Devnet Genesis Timestamp | `1583342400` (approx) |
| Lamports per SOL | `1_000_000_000` |

**Detection Pattern:** Look for `seeds = [b"vault", seed_hint.to_le_bytes()]` where `seed_hint` is a `u64`. The question will hint at what the value is.

---

### 4.5 Account Data Layout & Deserialization (v1 Challenge 5)

**The Bug:** You must reverse-engineer the byte layout of an account to extract or manipulate data.

**Anchor Account Layout:**
```
[8 bytes discriminator][field1][field2][...]
```

| Type | Size |
|---|---|
| `bool` | 1 byte |
| `u8` | 1 byte |
| `u16` | 2 bytes (little-endian) |
| `u32` | 4 bytes (little-endian) |
| `u64` | 8 bytes (little-endian) |
| `i64` | 8 bytes (little-endian) |
| `Pubkey` | 32 bytes |
| `String` | 4 bytes length prefix + UTF-8 bytes |
| `Vec<T>` | 4 bytes length prefix + elements |
| `Option<T>` | 1 byte (0=None, 1=Some) + T if Some |

**Discriminator Calculation:**
```python
import hashlib
disc = hashlib.sha256(b"account:VaultState").digest()[:8]
```

---

### 4.6 Ed25519 Signature Verification (v1 Challenge 6)

**The Bug:** Given many signature-message pairs, find the one that validates against a known public key.

**Exploit Template:**
```typescript
import nacl from "tweetnacl";
import bs58 from "bs58";

for (const [sig, msg] of pairs) {
  const sigBytes = bs58.decode(sig);
  const msgBytes = Buffer.from(msg, "base64");
  if (nacl.sign.detached.verify(msgBytes, sigBytes, pubkeyBytes)) {
    console.log("VALID:", sig);
  }
}
```

---

### 4.7 Lamport Value as Encoded Data (v1 Challenge 7)

**The Bug:** The amount of lamports transferred in a transaction encodes meaningful data (e.g., a Unix timestamp).

**Detection Pattern:** Look for unusual transfer amounts that don't correspond to round SOL values. Try interpreting them as:
- Unix timestamps
- ASCII character codes
- Base58/hex encoded data

```python
import datetime
timestamp = 1152684000
date = datetime.datetime.utcfromtimestamp(timestamp)
print(date)  # 2006-07-12 06:00:00
```

---

### 4.8 Mass PDA Scanning (v1 Challenge 8)

**The Bug:** A flag is hidden in one of hundreds/thousands of PDA accounts.

**Exploit Template:**
```typescript
// Use getProgramAccounts with filters
const accounts = await connection.getProgramAccounts(programId, {
  filters: [
    { memcmp: { offset: 0, bytes: bs58.encode(discriminator) } },
  ],
});

for (const { pubkey, account } of accounts) {
  const data = account.data;
  // Parse and check for flag strings
  const text = data.toString("utf-8");
  if (text.includes("FLAG")) {
    console.log(`Found at ${pubkey}: ${text}`);
  }
}
```

---

### 4.9 Integer Overflow / Underflow (v1 Challenge 9)

**The Bug:** Rust's release mode wraps on overflow. A program may check `points == 294` but the arithmetic allows wrapping.

```rust
// If points is u8 (max 255), then 255 + 39 = 294 wraps to 38
// But if unchecked: 250 + 44 = 294 (with overflow)
```

**Detection Pattern:** Look for:
- Arithmetic operations without `checked_add`, `checked_sub`, `checked_mul`.
- Type constraints (u8, u16) with values that could overflow.
- The question mentioning specific numeric targets.

---

### 4.10 NFT Metadata Tracing (v1 Challenge 10)

**The Bug:** The flag is hidden in the transaction history of accounts related to an NFT's creation chain.

**Metaplex Core Asset Layout:**
```
Byte 0: Discriminator (1 = Asset)
Bytes 1-32: Owner (Pubkey)
Byte 33: Authority Type
Bytes 34-65: Update Authority (Pubkey)
Bytes 66-69: Name length (u32 LE)
Bytes 70+: Name string
After name: URI length (u32 LE) + URI string
```

**Tracing Strategy:**
```
NFT Account
├── Owner → Who owns the NFT?
├── Update Authority → Who created it?
│   ├── Funding transactions → Who funded the creator?
│   │   └── Funder's transactions → Look for program interactions
│   └── Other NFTs by same authority
└── URI → Fetch metadata (IPFS/Arweave)
```

---

### 4.11 Creator vs Caller Distinction (v1 Challenge 11)

**The Bug:** The program checks that the caller is NOT the token creator, but allows anyone else who holds the token.

```rust
// Error: "Forgers are forbidden to use their own swords"
require!(signer.key() != mint_authority, ErrorCode::NotAllowed);
```

**The Exploit:** Mint a token with one wallet, transfer it to another wallet, then call the flag instruction from the second wallet.

---

### 4.12 Predictable Pseudo-Randomness (v1 Challenge 12)

**The Bug:** On-chain "randomness" derived from predictable sources (clock, slot, blockhash).

```rust
// VULNERABLE: Predictable random
let clock = Clock::get()?;
let random = clock.slot % 10;  // Completely predictable
```

**The Exploit:** Read the current slot/clock before submitting, calculate the expected "random" value, and submit when conditions are favorable.

---

### 4.13 Image Steganography (v1 Challenge 13)

**The Bug:** A flag or private key is hidden in pixel data of an image.

**Common Steganography Techniques:**
1. **LSB (Least Significant Bit):** Hidden data in the least significant bits of pixel color values.
2. **Color Channel Encoding:** RGB values map to ASCII characters or base58 bytes.
3. **Metadata:** EXIF data or embedded text chunks in PNG.

**Detection & Extraction:**
```python
from PIL import Image
import struct

img = Image.open("challenge.png")
pixels = list(img.getdata())

# Try LSB extraction
bits = ""
for pixel in pixels:
    for channel in pixel[:3]:  # R, G, B
        bits += str(channel & 1)

# Convert bits to bytes
chars = [chr(int(bits[i:i+8], 2)) for i in range(0, len(bits), 8)]
text = "".join(chars)
print(text[:200])  # Check for readable text
```

```bash
# CLI tools for steganography
# Check for embedded text
strings challenge.png | grep -i flag
# Check EXIF metadata
exiftool challenge.png
# Try steghide
steghide extract -sf challenge.png
# Try zsteg (for PNG)
zsteg challenge.png
```

---

### 4.14 DeFi Protocol Logic Bugs (v1 Challenge 14)

**The Bug:** Inconsistency between how state is read vs written in lending/borrowing protocols.

**Common DeFi Vulnerabilities:**
1. **take_while vs filter mismatch:** `take_while` stops at the first false condition, hiding subsequent entries. `filter` checks all entries. If deposit/loan tracking uses `take_while` but validation uses `filter` (or vice versa), state can be hidden.
2. **State variable not updated on withdrawal:** `withdraw_collateral` reduces position amount but doesn't update `total_deposited`.
3. **Missing health check after operations.**
4. **Flash loan attacks:** Borrow → Manipulate → Repay in one transaction.

**Exploit Strategy:**
```
1. Deposit collateral in multiple positions.
2. Close a middle position (creates a "gap").
3. Deposit more after the gap.
4. Borrow against visible collateral (take_while sees less than real total).
5. Repeat borrows until exploit condition triggers.
```

---

## 5. Exploit Execution Patterns

### 5.1 Basic Anchor Program Interaction

```typescript
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import fs from "fs";

// Load wallet
const walletKeypair = Keypair.fromSecretKey(
  Uint8Array.from(JSON.parse(fs.readFileSync("ctf_wallet.json", "utf-8")))
);

// Setup connection
const connection = new Connection("https://api.devnet.solana.com", "confirmed");
const wallet = new anchor.Wallet(walletKeypair);
const provider = new anchor.AnchorProvider(connection, wallet, {
  commitment: "confirmed",
});
anchor.setProvider(provider);

// Load program (with IDL)
const programId = new PublicKey("<PROGRAM_ID>");
const idl = JSON.parse(fs.readFileSync("idl.json", "utf-8"));
const program = new Program(idl, provider);

// Call an instruction
const tx = await program.methods
  .instructionName(arg1, arg2)
  .accounts({
    account1: pubkey1,
    account2: pubkey2,
    systemProgram: anchor.web3.SystemProgram.programId,
  })
  .signers([additionalSigner])
  .rpc();

console.log("TX:", tx);

// Fetch transaction logs
const txDetails = await connection.getTransaction(tx, {
  maxSupportedTransactionVersion: 0,
});
console.log("Logs:", txDetails?.meta?.logMessages);
```

### 5.2 Raw Transaction (Without Anchor)

```typescript
import {
  Connection, Keypair, PublicKey, Transaction,
  TransactionInstruction, sendAndConfirmTransaction
} from "@solana/web3.js";

const ix = new TransactionInstruction({
  keys: [
    { pubkey: account1, isSigner: true, isWritable: true },
    { pubkey: account2, isSigner: false, isWritable: false },
  ],
  programId: programId,
  data: Buffer.from([/* instruction data bytes */]),
});

const tx = new Transaction().add(ix);
const sig = await sendAndConfirmTransaction(connection, tx, [walletKeypair]);
```

### 5.3 Instruction Data Encoding

Anchor uses an 8-byte discriminator prefix:
```python
import hashlib

# Instruction discriminator
disc = hashlib.sha256(b"global:instruction_name").digest()[:8]

# Full instruction data = discriminator + serialized args
```

### 5.4 Reading Transaction Logs After Execution

```typescript
const sig = await program.methods.someInstruction().rpc({ skipPreflight: true });

// Wait for confirmation then fetch logs
const tx = await connection.getTransaction(sig, {
  maxSupportedTransactionVersion: 0,
  commitment: "confirmed",
});

for (const log of tx.meta.logMessages) {
  if (log.includes("FLAG") || log.includes("flag")) {
    console.log("🚩 FLAG FOUND:", log);
  }
}
```

---

## 6. Advanced Techniques for Harder CTFs

### 6.1 Decompiling / Reversing Deployed Programs

When no source code is provided:

```bash
# Dump the program binary
solana program dump <PROGRAM_ID> program.so --url devnet

# Disassemble with solana-rbpf or ghidra
# Look for:
# - String literals (potential flags or error messages)
# - msg! macro outputs
# - Instruction discriminators
```

```bash
# Extract strings from the binary
strings program.so | grep -i "flag\|secret\|key\|password\|ST_FLAG"
```

### 6.2 Simulating Transactions Before Sending

```typescript
// Use simulateTransaction to see logs without spending SOL
const tx = new Transaction().add(instruction);
tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
tx.feePayer = wallet.publicKey;

const simulation = await connection.simulateTransaction(tx);
console.log("Simulation logs:", simulation.value.logs);
console.log("Error:", simulation.value.err);
```

### 6.3 Flash Loan Attack Pattern

```typescript
// In a single transaction:
// 1. Borrow from lending pool
// 2. Manipulate price oracle or pool state
// 3. Execute the exploit
// 4. Repay the loan
// All instructions in ONE transaction

const tx = new Transaction()
  .add(borrowInstruction)
  .add(manipulateInstruction)
  .add(exploitInstruction)
  .add(repayInstruction);
```

### 6.4 CPI (Cross-Program Invocation) Exploits

When a program makes CPI calls, check:
1. **Are the accounts validated before CPI?** The calling program might pass unchecked accounts to a trusted program.
2. **Is the CPI signer correct?** PDA seeds might be guessable.
3. **Can you substitute programs?** If the program ID isn't hardcoded, you might pass your own malicious program.

### 6.5 Reentrancy via CPI

Solana prevents direct reentrancy (a program can't call itself via CPI), but **cross-program reentrancy** is possible:
```
Program A calls Program B → Program B calls Program A
```

### 6.6 Account Confusion / Type Cosplay

When a program deserializes account data, it might not verify the account's owner or discriminator:

```rust
// VULNERABLE: No owner check
let user_data = UserAccount::try_deserialize(&mut &account.data.borrow()[..])?;
// An attacker could pass a crafted account owned by a different program
// with data that matches the expected layout
```

### 6.7 Closing Account Vulnerabilities

When accounts are closed (lamports drained to 0), the Solana runtime may reassign the account. Within the same transaction, a closed account can potentially be "revived" and reused.

### 6.8 Oracle Manipulation

If a program reads prices from an on-chain oracle:
1. **Staleness check:** Does the program verify the oracle was updated recently?
2. **Single-source risk:** Can you manipulate the oracle directly?
3. **TWAP bypass:** Can you sandwich-attack to skew the time-weighted average?

### 6.9 Commit-Reveal Schemes

For challenges that require two-phase execution:
```typescript
// Phase 1: Commit (block N)
const secret = Keypair.generate().publicKey;
const commitment = sha256(secret.toBuffer());
await program.methods.commit(commitment).rpc();

// Phase 2: Wait K blocks
await sleep(K * 400); // ~400ms per slot

// Phase 3: Reveal (block N+K)
await program.methods.reveal(secret).rpc();
```

### 6.10 Lookup Table Exploits

Solana v0 transactions use Address Lookup Tables (ALTs) to reference more accounts. Check if:
- The ALT is mutable and can be modified between transactions.
- Account indices in the lookup table can be swapped.

---

## 7. Tool Reference

### 7.1 Solana CLI Commands

```bash
# Account inspection
solana account <ADDRESS> --url devnet
solana account <ADDRESS> --url devnet --output json

# Transaction inspection
solana confirm -v <SIGNATURE> --url devnet

# Program inspection
solana program show <PROGRAM_ID> --url devnet
solana program dump <PROGRAM_ID> program.so --url devnet

# Token operations
spl-token accounts --url devnet
spl-token balance <MINT_ADDRESS> --url devnet

# Transfer
solana transfer <TO_ADDRESS> <AMOUNT> --url devnet

# Keypair operations
solana-keygen new --outfile keypair.json --no-bip39-passphrase
solana-keygen grind --starts-with <PREFIX>:1
solana-keygen pubkey keypair.json
```

### 7.2 Solana Explorer URLs

```
Devnet Explorer: https://explorer.solana.com/address/<ADDRESS>?cluster=devnet
Devnet TX:       https://explorer.solana.com/tx/<SIGNATURE>?cluster=devnet
SolScan Devnet:  https://solscan.io/account/<ADDRESS>?cluster=devnet
```

### 7.3 Useful RPC Methods

| Method | Use |
|---|---|
| `getAccountInfo` | Fetch account data |
| `getSignaturesForAddress` | List transaction history |
| `getTransaction` | Get full transaction details |
| `getProgramAccounts` | Find all accounts owned by a program |
| `getMultipleAccounts` | Batch fetch account data |
| `simulateTransaction` | Dry-run a transaction |

### 7.4 Metaplex / NFT Tools

```bash
# Metaplex Core program ID
CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d

# Legacy Token Metadata program ID
metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s

# Fetch NFT metadata from URI
curl -s "https://gateway.irys.xyz/<ARWEAVE_ID>"
curl -s "https://arweave.net/<ARWEAVE_ID>"
```

---

## 8. Lessons Learned from v1

### 8.1 Flags Are Often Already On-Chain

Before writing any exploit code, **scan existing transaction logs first**. In many v1 challenges, someone else had already triggered the flag, and it was sitting in public transaction logs.

### 8.2 Don't Cross-Contaminate Challenges

Each challenge is self-contained. When tracing account histories, you WILL encounter accounts from other challenges (they share the same deployer/faucet wallets). **Stay focused on the current challenge's program ID and accounts.**

### 8.3 Rate Limiting

Devnet RPC has aggressive rate limits. Always:
- Add `time.sleep(0.5)` between RPC calls.
- Use batch endpoints when possible.
- Cache results locally.

### 8.4 The Question IS the Hint

Never skip reading the question. For example:
- "After doing some negotiations" → Look for SOL transfer transactions.
- "Peculiar history" → The answer is in transaction history, not in account data.
- "Only those who never took anything" → The signer must NOT be the creator.

### 8.5 Check Pastebin, Arweave, and External Links

Programs sometimes log URLs to external resources (Pastebin, Arweave, IPFS). These often contain IDLs, source code, or hints.

### 8.6 Test with Simulation First

Always simulate before sending real transactions to avoid wasting SOL on failed attempts.

---

## 9. Anti-Patterns & Pitfalls

### 9.1 DON'T Assume the Flag Format

While v1 uses `ST_FLAG{...}`, v2 might use different formats. Search for common patterns:
- `ST_FLAG{`, `FLAG{`, `flag{`, `CTF{`
- Any string that looks like a flag in logs or account data

### 9.2 DON'T Ignore Failed Transactions

Failed transactions often contain valuable error messages that reveal:
- Required account constraints
- Expected input ranges
- Authorization requirements

```python
# Check failed transactions too
for sig_info in sigs:
    if sig_info.get("err"):
        tx = get_transaction(sig_info["signature"])
        logs = tx["meta"]["logMessages"]
        for log in logs:
            if "Error" in log or "error" in log:
                print(f"Error in {sig_info['signature']}: {log}")
```

### 9.3 DON'T Trust Anchor IDL Blindly

The on-chain IDL might be outdated, incomplete, or intentionally misleading. Always cross-reference with:
- Actual account data byte lengths
- Transaction instruction data
- Program binary strings

### 9.4 DON'T Forget About Inner Instructions

Some programs emit flags through CPI calls to other programs. Check `meta.innerInstructions` in transaction data, not just top-level logs.

### 9.5 DON'T Hardcode Devnet URLs

Use configurable cluster URLs:
```typescript
const cluster = process.env.CLUSTER || "devnet";
const rpcUrl = process.env.RPC_URL || `https://api.${cluster}.solana.com`;
```

### 9.6 DON'T Forget to Check Both Clusters

Some CTFs deploy to both Devnet and Testnet. If you can't find something on Devnet, check Testnet.

---

## Quick Start Checklist

When starting a new Solana CTF:

- [ ] Create and fund a solver wallet (ask user to deposit SOL)
- [ ] Install dependencies (`npm install`, `pip install`)
- [ ] Read ALL question files carefully
- [ ] Check for source code files in the challenge folder
- [ ] Identify the program ID or target address
- [ ] Fetch the IDL (if Anchor)
- [ ] Scan transaction history for existing flags in logs
- [ ] Decode account data of target addresses
- [ ] Identify the vulnerability pattern from the catalog above
- [ ] Write and simulate the exploit
- [ ] Execute and capture the flag from logs
- [ ] Document the solution

---

*This guide was compiled from solving 14 Solana CTF v1 challenges. For the latest Solana security patterns, consult the [Solana Security Best Practices](https://github.com/coral-xyz/sealevel-attacks) repository and recent audit reports from firms like Neodyme, OtterSec, and Trail of Bits.*
