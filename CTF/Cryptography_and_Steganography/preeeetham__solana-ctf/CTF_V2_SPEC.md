# Solana CTF v2: Predicted Challenges & Solutions

> **Premise:** The same challenge designer who created Solana CTF v1 is back. They've observed how participants solved v1, studied the common shortcuts, and now want to close every loophole. Each v2 challenge is a spiritual successor to its v1 counterpart: same *theme*, but with significantly higher difficulty, deeper Solana knowledge requirements, and multi-step exploitation chains.

---

## Scoring & Difficulty Curve

| Challenge | v1 Title | v1 Points | v2 Title | v2 Points | Difficulty |
|-----------|----------|-----------|----------|-----------|------------|
| 1 | Ghost Admin | 100 | Phantom Signer | 200 | ★★☆☆☆ |
| 2 | Good First Impression | 100 | The Chosen One | 250 | ★★★☆☆ |
| 3 | Logs of Truth | 100 | Whispers in the Stack | 300 | ★★★☆☆ |
| 4 | The Birthday Seed | 100 | Epoch Archaeology | 250 | ★★☆☆☆ |
| 5 | Named by Numbers | 200 | The Account Whisperer | 350 | ★★★☆☆ |
| 6 | Signature Safari | 200 | Partial Recall | 400 | ★★★★☆ |
| 7 | The Lamport Clock | 200 | Double Encoding | 350 | ★★★☆☆ |
| 8 | Where is the Needle? | 250 | Needle in a Haystack Farm | 400 | ★★★★☆ |
| 9 | (Unknown v1) | 300 | The Frozen Token | 450 | ★★★★☆ |
| 10 | (Unknown v1) | 300 | Breadcrumb Trail | 450 | ★★★★☆ |
| 11 | Do Not Claim Thyself | 300 | The CPI Labyrinth | 500 | ★★★★☆ |
| 12 | Voucher Roulette | 300 | Hash Gauntlet | 450 | ★★★★☆ |
| 13 | (RGB Steganography) | 400 | The Pixel Vault | 550 | ★★★★★ |
| 14 | Sus Protocol | 400 | The Rug Machine | 600 | ★★★★★ |

**Total Points Available: 5500**

---

## Challenge 1: Phantom Signer

### v1 Recap
v1 used `UncheckedAccount` without a signer check. Passing the admin's pubkey as a non-signing account bypassed the `require!(admin.key() == vault.admin)` gate.

### v2 Challenge Description
> *"The admin signed the deal, but someone else cashed the check. Prove you can be the ghost in the machine."*
>
> **200 points**

### v2 Design
The designer learns from v1 and adds a `Signer` constraint to the admin account. However, they introduce a **re-initialization vulnerability**: the `initialize_vault` instruction doesn't check if the vault is already initialized (missing `init_if_needed` guard or a proper `is_initialized` flag).

```rust
pub fn initialize_vault(ctx: Context<InitializeVault>, admin: Pubkey) -> Result<()> {
    let vault = &mut ctx.accounts.vault;
    vault.admin = admin;        // Can be called again to overwrite the admin!
    vault.is_locked = false;
    msg!("Vault initialized with admin: {}", admin);
    Ok(())
}

pub fn admin_withdraw(ctx: Context<AdminWithdraw>) -> Result<()> {
    require!(
        ctx.accounts.admin.key() == ctx.accounts.vault.admin,
        ErrorCode::Unauthorized
    );
    // This time, admin IS a Signer<'info>
    reveal_secret(...)?;
    Ok(())
}

#[derive(Accounts)]
pub struct InitializeVault<'info> {
    #[account(
        mut,
        seeds = [b"vault"],
        bump
    )]
    pub vault: Account<'info, Vault>,
    
    #[account(mut)]
    pub authority: Signer<'info>,  // Anyone can call this!
}
```

### v2 Solution
1. Call `initialize_vault` with `admin = <your_own_pubkey>`. This overwrites the vault's admin field with your address.
2. Call `admin_withdraw` signing with your own wallet. The signer check now passes because you are the registered admin.

**Key Insight:** The vulnerability shifted from "missing signer check" to "missing re-initialization guard." The `Signer` constraint is present, but the admin can be *replaced* by anyone.

---

## Challenge 2: The Chosen One

### v1 Recap
v1 required a vanity address starting with `bo1t`. Solved with `solana-keygen grind`.

### v2 Challenge Description
> *"Not just any face will do. The oracle demands a specific resonance: your identity must harmonize with the protocol itself."*
>
> **250 points**

### v2 Design
Instead of a simple prefix check, the program derives a PDA using the signer's pubkey and checks that the PDA matches a specific hardcoded address. The constraint is:

```rust
pub fn get_flag(ctx: Context<GetFlag>) -> Result<()> {
    let (expected_pda, _bump) = Pubkey::find_program_address(
        &[b"chosen", ctx.accounts.signer.key().as_ref()],
        ctx.program_id,
    );
    
    // The PDA derived from YOUR key must start with "dead"
    let pda_str = expected_pda.to_string();
    require!(
        pda_str.starts_with("dead"),
        ErrorCode::NotTheChosenOne
    );
    
    reveal_secret(...)?;
    Ok(())
}
```

### v2 Solution
1. You cannot simply grind a keypair whose pubkey starts with `dead`: you need a keypair whose *derived PDA* starts with `dead`.
2. Write a multi-threaded brute-force script that generates random keypairs, derives `Pubkey::find_program_address(&[b"chosen", keypair.pubkey().as_ref()], &program_id)`, and checks if the resulting PDA string starts with `dead`.
3. This is computationally harder because each candidate requires a full PDA derivation (SHA-256 hashing loop), not just a base58 prefix check.
4. Once the correct keypair is found, fund it and sign the `get_flag` transaction.

**Key Insight:** The grind target moved from the keypair itself to a *derived value* of the keypair. Requires understanding PDA derivation mechanics and writing custom grinding code.

---

## Challenge 3: Whispers in the Stack

### v1 Recap
v1 printed flag parts in `msg!()` logs. We decoded instruction data from past successful transactions to find the correct inputs.

### v2 Challenge Description
> *"The truth no longer screams from the rooftops. It whispers through the return data, encoded in the language of the chain."*
>
> **300 points**

### v2 Design
The program no longer uses `msg!()` to emit the flag. Instead, it writes the flag as **Solana return data** using `set_return_data()`, and the flag bytes are XOR-encrypted with the recent blockhash at the time of execution:

```rust
pub fn verify_number(ctx: Context<Verify>, input: u64) -> Result<()> {
    // ... input validation ...
    
    let flag_part = get_flag_part(input);  // Returns encrypted bytes
    let clock = Clock::get()?;
    let slot_bytes = clock.slot.to_le_bytes();
    
    // XOR the flag part with slot bytes (repeating)
    let encrypted: Vec<u8> = flag_part
        .iter()
        .enumerate()
        .map(|(i, b)| b ^ slot_bytes[i % 8])
        .collect();
    
    // Return data instead of logging
    anchor_lang::solana_program::program::set_return_data(&encrypted);
    
    Ok(())
}
```

### v2 Solution
1. **Discovery:** Notice that `msg!()` logs are empty or contain decoy strings. Realize the program uses `set_return_data()`.
2. **Extraction:** Use `simulateTransaction` RPC method (not `sendTransaction`) with `returnData: true` to capture the return data without actually committing the transaction.
3. **Decryption:** The return data is XOR-encrypted with the slot number's little-endian bytes. Since you know the simulated slot (it's in the simulation response), XOR the return data with the slot bytes to recover the plaintext flag part.
4. Repeat for all three inputs to reconstruct the full flag.

**Key Insight:** The flag is no longer in transaction logs. Requires understanding Solana's return data mechanism and transaction simulation. The XOR encryption adds a decryption step.

---

## Challenge 4: Epoch Archaeology

### v1 Recap
v1 used Solana's genesis timestamp (`1584368940`) as the seed for the vault PDA.

### v2 Challenge Description
> *"History repeats, but never exactly. The seed you seek is buried in the chain's own memory, but which memory, and whose?"*
>
> **250 points**

### v2 Design
The vault PDA is derived from **two seeds**: the genesis timestamp of Solana Devnet (not Mainnet!) AND the slot number of the first transaction ever sent by a specific deployer wallet:

```rust
#[account(
    seeds = [
        b"vault",
        genesis_timestamp.to_le_bytes().as_ref(),
        first_slot.to_le_bytes().as_ref()
    ],
    bump
)]
pub vault: Account<'info, Vault>,
```

The `question.txt` provides the deployer wallet address and the hint: *"The chain remembers its first breath differently on every network. And the deployer's first step left a mark that time cannot erase."*

### v2 Solution
1. **Genesis Timestamp:** Research that Solana *Devnet* has a different genesis timestamp than Mainnet. The Devnet genesis timestamp can be found by querying `getGenesisHash` and cross-referencing with the Devnet genesis config, or by checking slot 0's block time.
2. **First Slot:** Query the deployer wallet's transaction history with `getSignaturesForAddress` (with `limit: 1` and `before: null`), fetching the oldest transaction. Extract the `slot` number from that transaction.
3. Combine both values as seeds to derive the vault PDA and read the stored flag.

**Key Insight:** Requires distinguishing between Mainnet and Devnet genesis parameters (a common mistake) and combining multiple on-chain historical data points as PDA seeds.

---

## Challenge 5: The Account Whisperer

### v1 Recap
v1 involved decoding an account's binary layout (discriminator + pubkey + booleans + u64) to extract meaningful data.

### v2 Challenge Description
> *"The account speaks in tongues: nested structures within structures, optional fields that may or may not exist, and a version byte that changes the entire schema."*
>
> **350 points**

### v2 Design
The program stores data using a **versioned account schema**. The first byte of the account data is a version discriminator:
- **Version 1:** `[disc:8][pubkey:32][amount:u64][name:String(borsh)]`
- **Version 2:** `[disc:8][version:u8][pubkey:32][flags:u16][inner_data:Vec<InnerStruct>][name:String(borsh)]`
- **Version 3:** `[disc:8][version:u8][pubkey:32][flags:u16][inner_data:Vec<InnerStruct>][encrypted_flag:32][nonce:u8][name:String(borsh)]`

Only Version 3 accounts contain the flag, but it's encrypted using `encrypted_flag[i] XOR nonce XOR (i as u8)`.

The program has 10,000 accounts, split across all three versions.

### v2 Solution
1. Fetch all program accounts using `getProgramAccounts`.
2. Parse the version byte from each account.
3. Filter for Version 3 accounts only.
4. For each Version 3 account, deserialize the full nested Borsh structure.
5. Decrypt the `encrypted_flag` field: `flag[i] = encrypted_flag[i] ^ nonce ^ (i as u8)`.
6. Search the decrypted values for the `ST_FLAG{...}` prefix.

**Key Insight:** Requires handling versioned Borsh deserialization and understanding that account schemas evolve. The decryption step prevents simple string scanning of raw account data.

---

## Challenge 6: Partial Recall

### v1 Recap
v1 provided 500 signature-message pairs, and we verified each one against a known public key using `tweetnacl`.

### v2 Challenge Description
> *"The signature was split across time. Reassemble the fragments to prove you were there."*
>
> **400 points**

### v2 Design
Instead of providing complete signatures, the challenge provides:
- A `keypair.json` with a known Ed25519 public key.
- A `fragments.txt` with 200 entries. Each entry contains:
  - A **partial signature** (only 48 of 64 bytes, with 16 bytes redacted/zeroed at specific positions).
  - A full transaction message.
  - A **hint byte** indicating which 16-byte segment is missing.

Only ONE of the 200 entries has a valid partial match. But you must also find the correct full signature on-chain by looking up the transaction history of the program.

### v2 Solution
1. Parse `fragments.txt` and extract the partial signatures and messages.
2. For each entry, verify the *non-redacted* portion of the signature against the known public key and message.
3. Since Ed25519 signatures are deterministic, the valid entry will have its non-redacted bytes perfectly matching the expected signature bytes.
4. Write a script that:
   - Computes the expected full signature using `nacl.sign.detached(message, secretKey)` (you have the full keypair).
   - Compares the non-redacted bytes of each partial signature to the corresponding bytes of the computed signature.
5. Find the matching entry, reconstruct the full signature, and look up the transaction on Devnet.

**Key Insight:** Requires understanding that Ed25519 signatures are deterministic. Since you have the full keypair, you can compute the expected signature for each message and compare byte-by-byte, ignoring redacted positions.

---

## Challenge 7: Double Encoding

### v1 Recap
v1 hid a date inside a lamport transfer amount (`1152684000` → Unix timestamp → July 12, 2006).

### v2 Challenge Description
> *"The message was encoded twice: once in the value, once in the memo. Neither alone tells the whole truth."*
>
> **350 points**

### v2 Design
The HTML page comment now contains TWO wallet addresses. Each wallet has a single transaction:
- **Wallet A** transfers `1735689600` lamports (a Unix timestamp: Jan 1, 2025) with memo `"base64:dGhlIGtleQ=="`
- **Wallet B** transfers `420000` lamports with memo `"cipher:rot13"`

The submission form now requires both a **date** and a **keyword**.

### v2 Solution
1. **Wallet A:**
   - Transfer amount `1735689600` → Unix timestamp → January 1, 2025.
   - Memo `"base64:dGhlIGtleQ=="` → base64 decode → `"the key"`.
2. **Wallet B:**
   - Memo `"cipher:rot13"` tells you the encoding scheme.
   - Transfer amount `420000` → convert to ASCII? No. Convert to hex: `0x66870` → doesn't work.
   - Wait: the amount `420000` lamports. Interpret as a string: `"420000"`. Apply ROT13: `"420000"` (numbers don't change in ROT13).
   - Alternative: The memo itself is the cipher. The amount `420000` in some base... The amount as bytes in little-endian: `[0x20, 0x68, 0x06, 0x00]`. ASCII: `" h\x06\x00"` → doesn't work.
   - Actually: combine both transactions. The date is from Wallet A (2025-01-01). The keyword is `"the key"` ROT13'd → `"gur xrl"`.
3. Submit `date=2025-01-01` and `keyword=gur xrl`.

**Key Insight:** Multi-step encoding requiring combining information from multiple on-chain sources. Each transaction provides one piece of the puzzle, and the encoding method is specified in the memo of the other transaction.

---

## Challenge 8: Needle in a Haystack Farm

### v1 Recap
v1 had 500 PDA accounts; one contained the flag. We scanned all with `getProgramAccounts`.

### v2 Challenge Description
> *"The needle moved. And the haystack grew. And sometimes, the needle pretends to be hay."*
>
> **400 points**

### v2 Design
- The program now has **50,000 PDA accounts**.
- Each account stores a `flag: [u8; 32]` field and an `index: u32`.
- **Decoy flags:** 100 accounts contain strings starting with `ST_FLAG{` but they are decoys (e.g., `ST_FLAG{nice_try_lol}`, `ST_FLAG{not_this_one}`).
- The REAL flag is identified by a secondary verification: the account's PDA bump byte must equal the last byte of the flag string.
- Additionally, `getProgramAccounts` is rate-limited, so you must use `memcmp` filters efficiently.

### v2 Solution
1. Use `getProgramAccounts` with a `memcmp` filter targeting the bytes `ST_FLAG{` at the flag field offset (after the 8-byte discriminator): `{ offset: 8, bytes: base58_encode("ST_FLAG{") }`.
2. This returns ~101 candidates instead of 50,000.
3. For each candidate:
   - Derive the PDA using `seeds = [b"flag", index.to_le_bytes()]` and record the bump.
   - Check if the bump byte equals the last byte of the flag string (the byte before `}`... actually the last byte of the 32-byte flag field).
4. The one account where the bump matches is the real flag.

**Key Insight:** Requires efficient RPC filtering (`memcmp`), understanding PDA bump bytes, and implementing a secondary verification to filter decoys.

---

## Challenge 9: The Frozen Token

### v2 Challenge Description
> *"The token account is frozen, the authority is burned, and the balance is locked. But the protocol has a thaw: if you know where to look."*
>
> **450 points**

### v2 Design
A SPL Token account holding 1 token of a custom mint is frozen. The mint's freeze authority is set to a PDA of a custom program. The program has a `thaw_and_transfer` instruction that:
1. Verifies a **time-lock** has expired (the current slot must be > a stored unlock slot).
2. Requires passing a **merkle proof** that your wallet address is in a pre-committed whitelist tree.
3. If both checks pass, it thaws the token account via CPI, transfers the token to your wallet, and reveals the flag.

The whitelist merkle root is stored on-chain. The full merkle tree leaves are scattered across 20 different memo transactions from the deployer.

### v2 Solution
1. **Find the unlock slot:** Read the program's config PDA to find the `unlock_slot`. Wait until the current slot exceeds it (or the unlock is already in the past).
2. **Reconstruct the merkle tree:**
   - Fetch all memo transactions from the deployer wallet.
   - Parse the memo data to extract the 20 leaf entries (wallet addresses hashed with keccak256).
   - Rebuild the merkle tree and verify the root matches the on-chain stored root.
3. **Generate your proof:** Find your solver wallet's hash in the tree and compute the merkle proof (sibling hashes along the path to the root).
4. **Execute:** Call `thaw_and_transfer` with your merkle proof. The program verifies the proof, thaws the token account, transfers the token, and emits the flag.

**Key Insight:** Combines SPL Token freeze authority mechanics, merkle tree verification, time-locks, and cross-transaction data assembly.

---

## Challenge 10: Breadcrumb Trail

### v2 Challenge Description
> *"Follow the money. But the trail splits, loops, and sometimes goes backwards. Only the true path reveals the message."*
>
> **450 points**

### v2 Design
A deployer wallet has made 200+ transactions on Devnet. Among them:
- 50 are **1-lamport transfers** to various wallets, each with a memo containing a single character.
- The characters form a scrambled message.
- The correct ordering is determined by the **slot number** of each transaction (sorted ascending).
- However, 15 of the 50 transfers are **decoys**: they were sent to wallets that have subsequently sent the lamport *back* to the deployer (round-trip detection).

### v2 Solution
1. Fetch all transaction signatures of the deployer wallet.
2. Filter for 1-lamport transfers with memo data.
3. For each transfer, check if the destination wallet has EVER sent lamports back to the deployer. If yes, mark it as a decoy and exclude it.
4. Sort the remaining 35 valid transfers by slot number (ascending).
5. Concatenate the memo characters in slot order to reveal the flag.

**Key Insight:** Requires bidirectional transaction graph analysis: not just reading the deployer's outgoing transfers, but also checking if recipients sent funds back. This is the "breadcrumb trail" with false paths.

---

## Challenge 11: The CPI Labyrinth

### v1 Recap
v1 had the flag directly in the transaction logs of the first `GetEntry` call.

### v2 Challenge Description
> *"The flag is buried four programs deep. Each program calls the next, and only the final CPI in the chain holds the key. But the intermediate programs transform the data along the way."*
>
> **500 points**

### v2 Design
A chain of 4 programs (A → B → C → D):
- **Program A** (given to the player) takes a seed input and does CPI into **Program B**.
- **Program B** transforms the seed (e.g., SHA256 hash) and does CPI into **Program C**.
- **Program C** verifies the transformed seed against a stored hash and does CPI into **Program D**.
- **Program D** emits the flag using `set_return_data()`.

The player only knows Program A's ID. They must trace the CPI chain through inner instruction logs to discover Programs B, C, and D.

### v2 Solution
1. **Discover the chain:** Look at Program A's past transactions. In the inner instructions log, you'll see the CPI calls to Program B, then B's CPIs to C, etc.
2. **Reverse the seed transformation:** Read Program A's source code to understand what seed it expects. Program B applies SHA256 to the seed before passing to C. Program C checks the hash against a stored value.
3. **Find the stored hash:** Read Program C's config PDA to get the expected hash value.
4. **Brute-force the seed:** Since Program A passes the raw seed to B, and B hashes it, you need to find a seed whose SHA256 matches Program C's stored hash. The hint in `question.txt` narrows the search space (e.g., "The seed is a 4-digit number").
5. **Execute:** Call Program A with the correct seed. The CPI chain executes, and Program D's return data contains the flag.

**Key Insight:** Multi-program CPI chain analysis. Requires tracing inner instructions across programs, reverse-engineering data transformations, and brute-forcing a constrained input space.

---

## Challenge 12: Hash Gauntlet

### v1 Recap
v1 used MD5 hashes of single character-position pairs, easily brute-forced.

### v2 Challenge Description
> *"The code is 32 characters long. Each position depends on the previous. One wrong step, and the entire chain collapses."*
>
> **450 points**

### v2 Design
The program uses a **chained hashing scheme**: each character's verification depends on the hash of the previous character:

```rust
pub fn redeem_code(_ctx: Context<Redeem>, code: String) -> Result<()> {
    require!(code.len() == 32, ErrorCode::WrongLength);
    
    let mut running_hash: [u8; 32] = [0u8; 32];
    
    for (i, ch) in code.chars().enumerate() {
        let hash_input = format!("{}{}{}", ch, i, hex::encode(running_hash));
        let hash = sha256::digest(hash_input.as_bytes());
        running_hash = hex_to_bytes(&hash);
        
        if running_hash[0..4] != EXPECTED_PREFIXES[i] {
            return Err(ErrorCode::WrongCharacter.into());
        }
    }
    
    reveal_secret(...)?;
    Ok(())
}
```

### v2 Solution
1. **Understand the chain dependency:** Each position's hash depends on the running hash from the previous position. This means you MUST solve positions sequentially (0 → 1 → 2 → ... → 31).
2. **Brute-force sequentially:** For position `i`, try all printable ASCII characters (32-126). For each candidate `ch`:
   - Compute `hash_input = format!("{}{}{}", ch, i, hex::encode(running_hash))`
   - Compute SHA256 of `hash_input`.
   - Check if the first 4 bytes match `EXPECTED_PREFIXES[i]`.
3. When you find the correct character, update `running_hash` and proceed to position `i+1`.
4. Since you're only checking the first 4 bytes (a 32-bit prefix), there could theoretically be collisions, but with printable ASCII (~95 candidates per position), collisions are extremely unlikely.
5. Extract `EXPECTED_PREFIXES` from the program's account data or source code.

**Key Insight:** Sequential dependency prevents parallel brute-forcing. SHA256 is much harder to compute than MD5, and the 32-character length doubles the work. But since each position only has ~95 candidates, it's still tractable: just slower and requiring careful sequential implementation.

---

## Challenge 13: The Pixel Vault

### v1 Recap
v1 used RGB values from a PNG to derive a 32-byte seed for a keypair. The metadata URI was broken.

### v2 Challenge Description
> *"The image contains more than meets the eye. The flag is hidden in the least significant bits, but only in the pixels that matter."*
>
> **550 points**

### v2 Design
A PNG image is provided. The flag is hidden using **LSB steganography**: the least significant bit of each color channel in specific pixels encodes the flag bits. But not all pixels contain data:
- Only pixels where `(x + y) % 7 == 0` contain steganographic data.
- The bits are read in order: R-LSB, G-LSB, B-LSB for each qualifying pixel, scanned left-to-right, top-to-bottom.
- The first 8 bits encode the length of the hidden message (in bytes).
- The remaining bits are the UTF-8 encoded flag.

Additionally, a second on-chain component: the extracted message is a **Solana private key (base58)** that owns an NFT. Reading the NFT metadata reveals the actual flag.

### v2 Solution
1. **Extract steganographic data:**
   - Load the PNG and iterate over all pixels.
   - For each pixel at `(x, y)` where `(x + y) % 7 == 0`, extract the LSB of R, G, and B channels.
   - Concatenate all bits.
   - Read the first 8 bits as the message length `n`.
   - Read the next `n * 8` bits and convert to a byte array, then decode as UTF-8.
2. **Decode the private key:** The extracted string is a base58-encoded Solana private key.
3. **Derive the keypair** and check its Devnet transaction history.
4. Find the NFT/token owned by this keypair and read its metadata URI.
5. Fetch the metadata JSON from the URI: the `description` or `attributes` field contains the flag.

**Key Insight:** Combines image steganography with on-chain asset analysis. The multi-step nature (image → key → NFT → metadata → flag) makes it significantly harder than v1's direct RGB-to-seed approach.

---

## Challenge 14: The Rug Machine

### v1 Recap
v1 exploited the `take_while` vs `filter` discrepancy in a lending protocol to perform invisible duplicate borrows.

### v2 Challenge Description
> *"The protocol looks airtight. Every check is doubled, every balance is verified. But the rug machine has a new trick: it exploits the gap between when you check and when you act."*
>
> **600 points**

### v2 Design
A more sophisticated DeFi protocol with:
1. **Proper `filter` usage everywhere** (no more `take_while` bug).
2. **Price oracle integration**: the protocol uses a price oracle PDA to determine collateral value.
3. **The vulnerability:** The price oracle is updated via a separate instruction `update_price`, and the oracle PDA is derived from `seeds = [b"oracle", token_mint.as_ref()]`. However, the `borrow` instruction doesn't verify that the oracle PDA passed in is actually derived from the correct token mint. An attacker can:
   - Create a **fake oracle account** with an inflated price.
   - Pass the fake oracle to the `borrow` instruction.
   - Borrow far more than the collateral is actually worth.

```rust
pub fn borrow(ctx: Context<Borrow>, amount: u64) -> Result<()> {
    let oracle = &ctx.accounts.oracle;
    let price = oracle.price;  // Reads price from whatever oracle is passed
    
    let collateral_value = user.collateral_amount * price / PRICE_DECIMALS;
    let required = (user.total_loans + amount) * COLLATERAL_RATIO / 100;
    
    require!(collateral_value >= required, Error::Undercollateralized);
    
    // ... transfer and flag detection ...
}

#[derive(Accounts)]
pub struct Borrow<'info> {
    #[account(mut)]
    pub user: Account<'info, UserAccount>,
    
    #[account(mut)]
    pub vault: Account<'info, Vault>,
    
    // BUG: No seeds verification! Any account with correct structure passes
    pub oracle: Account<'info, PriceOracle>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
}
```

The exploit detection checks:
```rust
if user.total_loans > user.collateral_amount * REAL_PRICE / PRICE_DECIMALS * 100 / COLLATERAL_RATIO {
    reveal_secret(...)?;
}
```

Where `REAL_PRICE` is a hardcoded constant, not the oracle value.

### v2 Solution
1. **Identify the oracle validation gap:** Notice that the `Borrow` struct accepts any `Account<'info, PriceOracle>` without verifying its PDA seeds. The `oracle` account is not constrained to `seeds = [b"oracle", ...]`.
2. **Create a fake oracle:** Write a script that creates a new account with the same discriminator and data layout as `PriceOracle`, but with `price` set to an absurdly high value (e.g., `1_000_000_000_000`).
3. **Deposit minimal collateral** (e.g., 0.01 SOL).
4. **Call `borrow`** passing your fake oracle account. The inflated price makes your 0.01 SOL collateral appear worth millions, allowing you to borrow the full vault balance.
5. The program's internal exploit check compares your loans against the REAL price and detects the over-borrowing, triggering `reveal_secret`.

**Key Insight:** Oracle manipulation attack. The v1 bug was about iterator semantics; the v2 bug is about missing account validation constraints (a real-world DeFi vulnerability pattern). Requires creating accounts with specific Anchor discriminators and data layouts.

---

## Summary: v1 vs v2 Difficulty Comparison

| Theme | v1 Exploit | v2 Exploit |
|-------|-----------|-----------|
| Auth bypass | Missing signer check | Re-initialization overwrite |
| Vanity address | Simple prefix grind | PDA-derived prefix grind |
| Log analysis | Read `msg!()` logs | Decode `set_return_data()` + XOR |
| Historical data | Single known timestamp | Multi-source on-chain archaeology |
| Account parsing | Flat Borsh layout | Versioned schema + encryption |
| Signature verification | Simple Ed25519 verify | Partial signature reconstruction |
| Data encoding | Single encoding layer | Cross-transaction dual encoding |
| Account scanning | 500 accounts, 1 flag | 50,000 accounts, 100 decoys + bump verification |
| Token mechanics | (not in v1) | Frozen token + merkle whitelist + timelock |
| Transaction tracing | (not in v1) | Bidirectional graph analysis + decoy detection |
| CPI analysis | Flag in direct logs | 4-program CPI chain + seed reversal |
| Hash cracking | Independent MD5 per char | Chained SHA256, sequential dependency |
| Steganography | RGB values as seed bytes | LSB steganography + on-chain NFT lookup |
| DeFi exploit | `take_while` vs `filter` | Oracle price manipulation via unvalidated accounts |

> **Estimated Total Solve Time for v2:** 30-50 hours for an experienced Solana developer.
> **Estimated Total Solve Time for v1:** 8-15 hours.
