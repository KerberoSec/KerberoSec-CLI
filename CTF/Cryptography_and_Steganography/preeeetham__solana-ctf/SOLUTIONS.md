# Solana CTF Solutions

This document tracks the solutions, approaches, and flags obtained for each Solana CTF challenge.

---

## Challenge 1: Ghost Admin

### 1. Challenge Description
* **Title:** Ghost Admin
* **Value:** 100 points
* **Hint/Prompt:** *In many situations you don't need signatures, the person's appearance is enough.*

---

### 2. Analysis & Approach
1. **Source Code Inspection:** We examined `challenge-1/public_source.rs` and found the validation struct and instruction:
   ```rust
   pub fn admin_withdraw(ctx: Context<AdminWithdraw>) -> Result<()> {
       require!(
           ctx.accounts.admin.key() == ctx.accounts.vault.admin,
           ErrorCode::Unauthorized
       );
               
       msg!("Withdrawal successful! ST_FLAG{$$$$$$$$$$$$$$$}");
       Ok(())
   }

   #[derive(Accounts)]
   pub struct AdminWithdraw<'info> {
       pub admin: UncheckedAccount<'info>,

       #[account(
           seeds = [b"vault"],
           bump
       )]
       pub vault: Account<'info, Vault>,
   }
   ```
2. **Vulnerability Identification:** The `admin` account in `AdminWithdraw` is defined as `UncheckedAccount<'info>`, which is a raw wrapper for `AccountInfo`. Although the instruction checks that `admin.key()` matches `vault.admin`, it **does not require the account to sign** (there is no `Signer<'info>` type or `signer` attribute check, nor any manual `.is_signer` check).
3. **Exploit Vector:** An attacker can invoke `admin_withdraw` by passing the target vault admin's public key (fetched from the public `vault` account) as the `admin` account. The transaction is signed only by the attacker's wallet, yet the program will authorize the withdraw because the keys match and signature validation was omitted.
4. **Exploit Implementation:** We created [solve.ts](file:///Users/preet/Developer/solana-ctf/challenge-1/solve.ts) to:
   * Derive the `vault` PDA using seed `[b"vault"]`.
   * Fetch the `Vault` account state to read the `admin` public key.
   * Call `adminWithdraw` using the fetched `admin` public key as the `admin` account parameter, signing the transaction with our solver wallet (`ctf_wallet.json`).

---

### 3. Execution & Flag Retrieval
We ran the script via `npx ts-node challenge-1/solve.ts` and obtained the flag from the transaction logs on Devnet.

#### Terminal Output:
```bash
Using solver wallet: cshNEa1e9jupYHodbvNCGZEns9KorxwzSu9QS7Qc94s
Vault PDA: 4rmRKRkvc63ASpfg3hQtJytPGd5kwbdvmRhUTiEMRVgM
Vault Admin Address: EBuKVB7kA54P1cJdenVDPsWaVuwA3W4mfRTzGbCivep1
Sending exploit transaction...
Transaction Signature: zTbuyubsKtEEMKd5mUSeaFxwF1dzPbZAyLU4NgpMtRWxaFfinfPAPkzKGVaZVy7r6DxjxL3wmT562D7KjyfHxuf
--- Transaction Logs ---
Program As9phEyQ89EecwUXtcVuJcwsvF2vspa7Je8qha7cDS25 invoke [1]
Program log: Instruction: AdminWithdraw
Program log: Withdrawal successful! ST_FLAG{trust_n0_pubk3y}
Program As9phEyQ89EecwUXtcVuJcwsvF2vspa7Je8qha7cDS25 consumed 8655 of 200000 compute units
Program As9phEyQ89EecwUXtcVuJcwsvF2vspa7Je8qha7cDS25 success
```

### 4. Obtained Flag
**`ST_FLAG{trust_n0_pubk3y}`**

---

## Challenge 2: Good First Impression

### 1. Challenge Description
* **Title:** Good First Impression
* **Value:** 100 points
* **Hint/Prompt:** *Access is reserved for agents who make the correct first impression.*

---

### 2. Analysis & Approach
1. **Transaction Log Inspection:** We queried the program `4tzADDiVAKviEf1Yi7GDiKG21MmLPgwkjVtaGvtheVCy` on Devnet using a custom history scanner script. We observed failed attempts with errors like:
   ```
   Program log: Identities starting with bo1t may proceed only.
   Program log: AnchorError occurred. Error Code: UnauthorizedFlag. Error Number: 6000. Error Message: Can't get flag..
   ```
   and successful attempts with transaction signers starting with the prefix `bo1t` (e.g. `bo1tUTw79LXURHMBsgFSxAJcEMperSG95WitXctnA6R`).
2. **Vulnerability / Constraint:** The program implements a vanity-address check, requiring the transaction signer's public key to start with the characters `bo1t`.
3. **Exploit Implementation:** 
   * We used `solana-keygen grind --starts-with bo1t:1` to generate a keypair whose public key begins with `bo1t`.
   * We funded the generated vanity address `bo1tK1o19JqSDUotT3xFuTDtUt45sGvNZXKnP3eexMF` with 1 SOL from our main funded wallet.
   * We created [solve.ts](file:///Users/preet/Developer/solana-ctf/challenge-2/solve.ts) and executed the `getFlag` instruction, signing with the newly generated `bo1t` keypair.

---

### 3. Execution & Flag Retrieval
We ran the script via `npx ts-node challenge-2/solve.ts` and obtained the flag from the transaction logs on Devnet.

#### Terminal Output:
```bash
Using solver wallet: bo1tK1o19JqSDUotT3xFuTDtUt45sGvNZXKnP3eexMF
Sending getFlag transaction...
Transaction Signature: 2WJ7RdHUQzFZDKnPhEtyE2MYcgJhR1HYyBDfynxt8vLzkKSa8sRCEr7m5oTPPuxYnV5pxYrquz7oFRj59Utnawyo
--- Transaction Logs ---
Program 4tzADDiVAKviEf1Yi7GDiKG21MmLPgwkjVtaGvtheVCy invoke [1]
Program log: Instruction: GetFlag
Program log: Flag revealed!
Program log: ST_FLAG{k3yp41r_gr1nd1ng_ch4mp}
Program 4tzADDiVAKviEf1Yi7GDiKG21MmLPgwkjVtaGvtheVCy consumed 5812 of 200000 compute units
Program 4tzADDiVAKviEf1Yi7GDiKG21MmLPgwkjVtaGvtheVCy success
```

### 4. Obtained Flag
**`ST_FLAG{k3yp41r_gr1nd1ng_ch4mp}`**

---

## Challenge 3: Logs of Truth

### 1. Challenge Description
* **Title:** Logs of Truth
* **Value:** 100 points
* **Hint/Prompt:** *The truth is hidden in numbers, from SOL to lamport, but only the right ones unlock the secrets.*
* **Program Address:** `5zzgo53dmRCCwrxX3q7UDmssW26Gh4f7Y8J2mEE7Rvds`

---

### 2. Analysis & Approach
1. **Transaction Log Inspection:** We fetched past transaction logs for the program `5zzgo53dmRCCwrxX3q7UDmssW26Gh4f7Y8J2mEE7Rvds`. We noticed that some successful transactions emitted partial flag strings:
   * Emitted `"ST_FLAG{1sol_"`
   * Emitted `"2sol_3sol_"`
   * Emitted `"truth}"`
   We also observed errors indicating input constraints:
   * `Error Code: TooSmall` -> `Number must be at least 1,000,000`
   * `Error Code: TooLarge` -> `Number must be at most 10,000,000,000`
   * `Error Code: NotCleanAmount` -> `Number must end with 0s`
2. **Reversing Inputs:** We wrote a script `decode_tx.ts` to retrieve and decode the instruction data for the transactions that emitted those three successful logs. The decoded argument values were:
   * Part 1 (`ST_FLAG{1sol_`): `1000000000` (`10^9` lamports, or `1 SOL`)
   * Part 2 (`2sol_3sol_`): `2000000000` (`2 * 10^9` lamports, or `2 SOL`)
   * Part 3 (`truth}`): `3000000000` (`3 * 10^9` lamports, or `3 SOL`)
3. **Exploit Implementation:**
   * We fetched the program IDL using `anchor idl fetch`.
   * We created [solve.ts](file:///Users/preet/Developer/solana-ctf/challenge-3/solve.ts) to execute `verifyNumber` three times, passing `1,000,000,000`, `2,000,000,000`, and `3,000,000,000` respectively. We then concatenated the logs to print the full flag.

---

### 3. Execution & Flag Retrieval
We ran the script via `npx ts-node challenge-3/solve.ts` and successfully output the flag.

#### Terminal Output:
```bash
Using solver wallet: cshNEa1e9jupYHodbvNCGZEns9KorxwzSu9QS7Qc94s

Sending verifyNumber transaction for input: 1000000000...
Transaction Signature: 5SDMSDZGYGcyFaFKgebHhz3gohvqve3okLhFqYTaQGnuXYvZwYX6LNrP9ubQg2K84RzrZPFHxSrXz9r5YdFmQSz9
  Program 5zzgo53dmRCCwrxX3q7UDmssW26Gh4f7Y8J2mEE7Rvds invoke [1]
  Program log: Instruction: VerifyNumber
  Program log: ST_FLAG{1sol_
  Program 5zzgo53dmRCCwrxX3q7UDmssW26Gh4f7Y8J2mEE7Rvds consumed 975 of 200000 compute units
  Program 5zzgo53dmRCCwrxX3q7UDmssW26Gh4f7Y8J2mEE7Rvds success

Sending verifyNumber transaction for input: 2000000000...
Transaction Signature: 3FDJBmioP1bBangRPSZn6acSszLuq2VjY7HdTLeoERx8F3T1hZJNoD3YEAmXeuaSgjxMH7eJ7eXdURBfwoW5bpn5
  Program 5zzgo53dmRCCwrxX3q7UDmssW26Gh4f7Y8J2mEE7Rvds invoke [1]
  Program log: Instruction: VerifyNumber
  Program log: 2sol_3sol_
  Program 5zzgo53dmRCCwrxX3q7UDmssW26Gh4f7Y8J2mEE7Rvds consumed 977 of 200000 compute units
  Program 5zzgo53dmRCCwrxX3q7UDmssW26Gh4f7Y8J2mEE7Rvds success

Sending verifyNumber transaction for input: 3000000000...
Transaction Signature: 3e62xPw6CHukVHpjumR4hjKAzhBCkn2Xvx1yjQtEZgAPRQdfQWhUEigihGe5xxrWKjwvUBBTQ4tJutt8iiPCzEvY
  Program 5zzgo53dmRCCwrxX3q7UDmssW26Gh4f7Y8J2mEE7Rvds invoke [1]
  Program log: Instruction: VerifyNumber
  Program log: truth}
  Program 5zzgo53dmRCCwrxX3q7UDmssW26Gh4f7Y8J2mEE7Rvds consumed 977 of 200000 compute units
  Program 5zzgo53dmRCCwrxX3q7UDmssW26Gh4f7Y8J2mEE7Rvds success

====================================
Reconstructed Flag: ST_FLAG{1sol_2sol_3sol_truth}
====================================
```

### 4. Obtained Flag
**`ST_FLAG{1sol_2sol_3sol_truth}`**

---

## Challenge 4: The Birthday Seed

### 1. Challenge Description
* **Title:** The Birthday Seed
* **Value:** 100 points
* **Hint/Prompt:** *When did it all began? Certainly sometime later than 13.8 billion years ago.*
* **Program Address:** `6V3rGaqVZakNJtvCFAHpz77LWgyBVf4uPSESDnh7dwsn`

---

### 2. Analysis & Approach
1. **Understanding the Clue:** The clue references the start/beginning of something later than 13.8 billion years ago (the cosmological age of the universe). Since this is a Solana-specific CTF named "The Birthday Seed", the "birthday" refers to Solana's genesis block time.
2. **Identifying the Value:** Solana Mainnet Beta's genesis block timestamp is **`1584368940`** (which corresponds to March 16, 2020, 14:29:00 UTC).
3. **Exploit Implementation:**
   * The program has a `reveal` instruction taking `seed_hint: u64` to derive the `vault` PDA: `seeds = [b"vault", seed_hint.to_le_bytes()]`.
   * We created [solve.ts](file:///Users/preet/Developer/solana-ctf/challenge-4/solve.ts) to call `reveal` with `seedHint = 1584368940`.
   * After the transaction succeeded, we fetched the `vault` account data using the derived PDA to extract the stored flag.

---

### 3. Execution & Flag Retrieval
We executed the script via `npx ts-node challenge-4/solve.ts`.

#### Terminal Output:
```bash
Using solver wallet: cshNEa1e9jupYHodbvNCGZEns9KorxwzSu9QS7Qc94s
Using seedHint: 1584368940
Derived Vault PDA: EzMSFuTL3LtqhhHpxq2oPUuCPB8zigpZsp6L1AsKt85C

Fetching vault account data...
Available accounts on program.account: [ 'vault' ]
Vault Data: {
  "flag": "ST_FLAG{ep0ch_0}",
  "discoverer": "cshNEa1e9jupYHodbvNCGZEns9KorxwzSu9QS7Qc94s",
  "discoveredAt": "6a4a8e71"
}
```

### 4. Obtained Flag
**`ST_FLAG{ep0ch_0}`**

---

## Challenge 6: Signature Safari

### 1. Challenge Description
* **Title:** Signature Safari
* **Value:** 200 points
* **Hint/Prompt:** *A thousand tracks in the sand, but only one leads home.*
* **Files provided:** `sigdump.txt` (containing 500 lines of `signature::message` pairs) and `keypair.json`.

---

### 2. Analysis & Approach
1. **Keypair Public Key Extraction:** We decoded the keypair in `keypair.json` to get the public key: `BzUry6FjNZ8YCsxWbJoLtkrFSLKGAr3iaoa1xiEj7ASd`.
2. **Cryptographic Validation:**
   * Each line in `sigdump.txt` consists of a base58 encoded signature (64 bytes) and a base64 encoded transaction message (107 bytes).
   * The hint indicates that only one of these signatures is valid for our public key.
   * We wrote [solve.ts](file:///Users/preet/Developer/solana-ctf/challenge-6/solve.ts) to read `sigdump.txt` and cryptographically verify each signature against the corresponding message and our extracted public key using `tweetnacl`.
3. **Valid Transaction Found:** The script successfully validated a single signature at line 418:
   * **Signature (base58):** `26qoV2aABTyEu9HF4hATCkE69SedMkwtGYBJMYr3xFgVYxV3ZALPYEh9N39NHe7qw4i2UJaefZvQdphbPmftUqEs`
   * **Message (base64):** `AQABAqNOen24K1nctIH1X0fK/7zszUUao4PJlZNHYjQTMSKCspJEr5JczUZPFQkUDpUbwYKIaM7JI68XpIYVlmUSxv90H6WndwCATxqVbU0Vg0i86HCBFLl8Bj/guUeIofGeAwEBAAivr20fDZib7Q==`
4. **Flag Retrieval:** We queried this transaction on Devnet via the Solana CLI:
   `solana confirm -v 26qoV2aABTyEu9HF4hATCkE69SedMkwtGYBJMYr3xFgVYxV3ZALPYEh9N39NHe7qw4i2UJaefZvQdphbPmftUqEs --url devnet`
   The execution logs for this transaction contained the flag.

---

### 3. Execution & Flag Retrieval
Below is the output log from the Devnet transaction:
```yaml
Transaction executed in slot 389350124:
  Recent Blockhash: 8pJHLvTXnjhCdGpQUXDu73jC45tSQdxJ97JbLeGVnJ4A
  Signature 0: 26qoV2aABTyEu9HF4hATCkE69SedMkwtGYBJMYr3xFgVYxV3ZALPYEh9N39NHe7qw4i2UJaefZvQdphbPmftUqEs
  Account 0: srw- BzUry6FjNZ8YCsxWbJoLtkrFSLKGAr3iaoa1xiEj7ASd (fee payer)
  Account 1: -r-x D24vyeHfitKgBXSLPyUgknpQwunTTCDyABhTnjYRT9Nn
  Instruction 0
    Program:   D24vyeHfitKgBXSLPyUgknpQwunTTCDyABhTnjYRT9Nn (1)
    Data: [175, 175, 109, 31, 13, 152, 155, 237]
  Status: Ok
  Log Messages:
    Program D24vyeHfitKgBXSLPyUgknpQwunTTCDyABhTnjYRT9Nn invoke [1]
    Program log: Instruction: Initialize
    Program log: ST_FLAG{s1g_ch4mp_d1d_th3_d1ff}
    Program D24vyeHfitKgBXSLPyUgknpQwunTTCDyABhTnjYRT9Nn consumed 302 of 200000 compute units
    Program D24vyeHfitKgBXSLPyUgknpQwunTTCDyABhTnjYRT9Nn success
```

### 4. Obtained Flag
**`ST_FLAG{s1g_ch4mp_d1d_th3_d1ff}`**

---

## Challenge 7: The Lamport Clock

### 1. Challenge Description
* **Title:** The Lamport Clock
* **Value:** 200 points
* **Hint/Prompt:** *Only one calendar matters, and it's not on your desk.*
* **Objective:** Find the correct date/month/year to submit on the CTF website `https://solana-ctf.onrender.com`.

---

### 2. Analysis & Approach
1. **Comment Discovery:** The webpage source HTML contained a commented public address: `<!-- FuuoGANyKxN5x9hVaCunqNYK2Qoe51rkouFdGfmBH3d3 -->`.
2. **Transaction Analysis:**
   * We wrote [explore_devnet.ts](file:///Users/preet/Developer/solana-ctf/challenge-7/explore_devnet.ts) to examine the transaction history of `FuuoGANyKxN5x9hVaCunqNYK2Qoe51rkouFdGfmBH3d3`.
   * We found two transactions on Devnet:
     * Transaction 1: Sent on `2025-07-26` with a memo `2025-07-23` and a system transfer of `1000` lamports.
     * Transaction 2: Sent on `2025-07-23` with a memo `What specific detail does this transaction hold?` and a system transfer of exactly `1152684000` lamports.
3. **The "Lamport Clock" Pun:**
   * "Lamports" is the smallest unit of SOL.
   * Treating the transferred lamports from Transaction 2 (`1152684000`) as a Unix epoch timestamp:
     * `1152684000` Unix timestamp = `Wednesday, July 12, 2006 6:00:00 AM UTC`
   * Therefore, the "correct date" is July 12, 2006.
4. **Form Submission:**
   * We wrote [solve.ts](file:///Users/preet/Developer/solana-ctf/challenge-7/solve.ts) to send a POST request with `date=2006-07-12` to `https://solana-ctf.onrender.com/`. The server validated the date and returned the flag in the response body.

---

### 3. Execution & Flag Retrieval
Running [solve.ts](file:///Users/preet/Developer/solana-ctf/challenge-7/solve.ts):
```bash
npx ts-node challenge-7/solve.ts
Submitting POST request with date: 2006-07-12...

Response HTML Status: 200
Flag found in response!
Found Flag: ST_FLAG{a_ba1ance_b0rn_in_2006}
```

### 4. Obtained Flag
**`ST_FLAG{a_ba1ance_b0rn_in_2006}`**

---

## Challenge 8: Where is the Needle?

### 1. Challenge Description
* **Title:** Where is the Needle?
* **Value:** 250 points
* **Hint/Prompt:** *The needle is there, you really just need to filter out the noise.*
* **Program Address:** `FAccpSFtsnc1Msmc5TokmK55dokxTjUsbQjckxmZ7JZJ`

---

### 2. Analysis & Approach
1. **Program Code Review:**
   * Reviewing `lib.rs`, we saw that the program creates PDA accounts derived using:
     `seeds = [b"flag", index.to_le_bytes().as_ref()]`
   * The program stores a 32-byte `flag` and a `u32` `index`.
2. **Account Scanning:**
   * Rather than sending transactions or brute-forcing accounts, we can retrieve all active accounts owned by the program `FAccpSFtsnc1Msmc5TokmK55dokxTjUsbQjckxmZ7JZJ` using the RPC method `getProgramAccounts`.
   * We wrote [explore.ts](file:///Users/preet/Developer/solana-ctf/challenge-8/explore.ts) to query all 500 program accounts on Devnet, deserialize the Anchor layout (`8 bytes discriminator + 32 bytes flag + 4 bytes index`), and search for the flag containing the prefix `ST_FLAG`.
3. **Finding the Needle:**
   * The scan successfully identified account number 411:
     * **Index:** `411`
     * **PDA Address:** `3qbq1wt6oqMTF8E77wfH7Cjze8vjVkNRUJNWy1oqtWZq`
     * **Flag Value:** `ST_FLAG{pda_hunt1ng_m4st3r}`

---

### 3. Execution & Flag Retrieval
Running [explore.ts](file:///Users/preet/Developer/solana-ctf/challenge-8/explore.ts):
```bash
npx ts-node challenge-8/explore.ts
Fetching program accounts for: FAccpSFtsnc1Msmc5TokmK55dokxTjUsbQjckxmZ7JZJ
Found 500 accounts.

[FOUND NEEDLE] Index: 411 | PDA: 3qbq1wt6oqMTF8E77wfH7Cjze8vjVkNRUJNWy1oqtWZq | Flag: "ST_FLAG{pda_hunt1ng_m4st3r}"
```

### 4. Obtained Flag
**`ST_FLAG{pda_hunt1ng_m4st3r}`**

---

## Challenge 10: Monkeys and Bananas

### 1. Challenge Description
* **Title:** Monkeys and Bananas
* **Value:** 250 points
* **Hint/Prompt:** *The monkeys are hiding a secret, we have to look into their peculiar history after doing some negotiations.*
* **NFT Address:** `4aokPkCmeLAFuQxtJ3UgGd9LUMSn5JdDoXS2gii9RZRE`

---

### 2. Analysis & Approach
1. **Target Identification:**
   * The target address `4aokPkCmeLAFuQxtJ3UgGd9LUMSn5JdDoXS2gii9RZRE` is a Metaplex Core Asset named `"Import Requirement"`.
   * The update authority/creator of the NFT is `4moNQJuEdybXWTnq2X4u6zHjP6bgx2AV2iCZV35XbFLy`.
2. **Transaction & History Investigation:**
   * We checked the signatures of the NFT account and found a negotiation transaction where `Df8zYgoPJMWqLo9mTmR3BJLHfegKq8jQRpjcypxk3Ygm` sent `1 SOL` to the NFT.
   * Investigating the creator `4moNQJu...`'s funding transactions revealed it received `3 SOL` from `5isFPCiT6yhZV2VP3BtQMpEt6YCWzmwwZQ7wnFBgSnSs`.
3. **Finding the Secret Program:**
   * Checking `5isFPC...`'s transaction history revealed an interaction with a custom program `3V8H9mT3PBgaBbGe7KJkL4cGqAnUJrEhyPuWUVnrm3BB`.
   * Specifically, in transaction `3iq4BcQc7BnHPaFLVnNMGBw4LxFoyFEkAVgJxJEXdpnsd9CvmNtZWnhq2McMW56RUR4P6HAPTjks7mMANdA8tZE8` (slot `388086821`), a successful execution of `ClaimFlag` printed the flag directly.

---

### 3. Execution & Flag Retrieval
From the Devnet transaction logs for the `ClaimFlag` instruction:
```
Program 3V8H9mT3PBgaBbGe7KJkL4cGqAnUJrEhyPuWUVnrm3BB invoke [1]
Program log: Instruction: ClaimFlag
Program log: 🎉 FLAG: ca11ern0tc4eat0r
Program 3V8H9mT3PBgaBbGe7KJkL4cGqAnUJrEhyPuWUVnrm3BB consumed 8251 of 200000 compute units
Program 3V8H9mT3PBgaBbGe7KJkL4cGqAnUJrEhyPuWUVnrm3BB success
```

### 4. Obtained Flag
**`ST_FLAG{ca11ern0tc4eat0r}`**

---

## Challenge 11: Do Not Claim Thyself

### 1. Challenge Description
* **Title:** Do Not Claim Thyself
* **Value:** 300 points
* **Hint/Prompt:** *The vault rewards only those who never took anything. And yet, only the one who holds the entry key may enter.*
* **Program ID:** `ALefWctARN3zs79zVQe3vPNi1qMv49G2WHAk6r7LRfAT`

---

### 2. Analysis & Approach
1. **Transaction Log Inspection:** We retrieved the transaction history for the program ID `ALefWctARN3zs79zVQe3vPNi1qMv49G2WHAk6r7LRfAT` on Devnet.
2. **Flag Recovery:** In the very first transaction signature `2AX9rP1AKLfmS9H7czMVnPxCtseWYZo2YGg2ZwJfZzw6fo27dY1PoWR9heqC9LsMuv6neZMsNBa1UotL3Aoaijxk` (calling instruction `GetEntry`), the program log directly contained the printed flag string.

---

### 3. Execution & Flag Retrieval
Looking at the execution logs on Devnet for Tx #0:
```
Program ALefWctARN3zs79zVQe3vPNi1qMv49G2WHAk6r7LRfAT invoke [1]
Program log: Instruction: GetEntry
Program 11111111111111111111111111111111 invoke [2]
Program 11111111111111111111111111111111 success
Program log: ST_FLAG{ca11er_n0t_creat0r}
Program ALefWctARN3zs79zVQe3vPNi1qMv49G2WHAk6r7LRfAT consumed 15141 of 200000 compute units
Program ALefWctARN3zs79zVQe3vPNi1qMv49G2WHAk6r7LRfAT success
```

### 4. Obtained Flag
**`ST_FLAG{ca11er_n0t_creat0r}`**

---

## Challenge 12: Voucher Roulette

### 1. Challenge Description
* **Title:** Voucher Roulette
* **Value:** 300 points
* **Hint/Prompt:** *One cannot win without failures.*
* **Program ID:** `Adom7b6AmcmaPPLsB5bz8KZYN5NfuqYWeHLQ9jYeWBbY`

---

### 2. Analysis & Approach
1. **Source Code Inspection:** We examined `public_lib.rs` and found the validation logic inside `redeem_code`:
   ```rust
   pub fn redeem_code(_ctx: Context<Redeem>, code: String) -> Result<()> {
       require!(code.len() == 17, ErrorCode::WrongLength);

       // Check each character position individually
       for (i, ch) in code.chars().enumerate() {
           // Create a string with the character and its position for hashing
           let hash_input = format!("{}{}", ch, i);
           let hash = md5::compute(hash_input.as_bytes());
           let hash_u32s = hash_to_u32_array(hash.0);

           // Compare against expected hash for this position
           if hash_u32s != EXPECTED_HASHES[i] {
               return Err(get_flag_error(i).into());
           }
       }
       // ...
   }
   ```
2. **Vulnerability/Logic:** Since it checks each position independently with a small input string (`format!("{}{}", ch, i)`), we can easily brute-force the single character `ch` at each position `i` (0 to 16) by comparing the MD5 hash against `EXPECTED_HASHES[i]`.
3. **Cracking Implementation:** We wrote a Node.js script to brute-force all 256 byte values for each position and successfully cracked the entire 17-character voucher code, which is the flag.

---

### 3. Execution & Flag Retrieval
Running the cracking script returned:
```
Position 0: Found 'S'
Position 1: Found 'T'
...
Position 16: Found '}'

Full Cracked Code (Flag): ST_FLAG{g00d_on3}
```

### 4. Obtained Flag
**`ST_FLAG{g00d_on3}`**

---

## Challenge 14: Sus Protocol

### 1. Challenge Description
* **Title:** Sus Protocol
* **Value:** 400 points
* **Hint/Prompt:** *While the setup is important, cleaning up properly is too.*
* **Program ID:** `A7w5Zz1aycLmCNJ2qWsYg8scL4DD4wvFWcCbwhPjCLCg`

---

### 2. Analysis & Approach
1. **Source Code Inspection:** We examined `lib.rs` and found a lending/borrowing program where users can deposit collateral and borrow SOL.
2. **Double-Spend / Take-While Vulnerability:**
   * The program calculates visible collateral and loans using `.take_while(|p| p.account != Pubkey::default())`:
     ```rust
     let total_collateral: u64 = user_account
         .positions
         .iter()
         .take_while(|p| p.account != Pubkey::default())
         .filter(|p| matches!(p.position_type, PositionType::Collateral))
         .map(|p| p.amount)
         .sum();
     ```
   * However, the validation check for triggering the secret uses a regular `.filter` query without `take_while` for real positions:
     ```rust
     let real_total_collateral: u64 = user_account
         .positions
         .iter()
         .filter(|p| p.account != Pubkey::default())
         .filter(|p| matches!(p.position_type, PositionType::Collateral))
         .map(|p| p.amount)
         .sum();
     ```
   * When a position is closed using `close_position`, its account key is marked as `Pubkey::default()`. 
   * This causes `take_while` to terminate prematurely at the closed position, completely hiding any positions stored *after* the closed index. As a result, subsequent loan checks ignore older loans, allowing infinite/duplicate borrows against the same visible collateral.
3. **State Variable Mismatch Bug:**
   * `withdraw_collateral` reduces a position's amount but does *not* decrement the global `user_account.total_deposited` variable.
   * To bypass `total_deposited` exceeding `MAX_DEPOSIT_PER_USER` (0.5 SOL), we must keep all deposits under 0.5 SOL.
4. **Exploit Design:**
   * **Deposit 1:** 0.2 SOL (Index 0: Collateral)
   * **Deposit 2:** 0.2 SOL (Index 1: Collateral)
   * **Withdraw:** 0.2 SOL from Position index 1.
   * **Close Position:** Index 1 (sets account to `Pubkey::default()`).
   * **Deposit 3:** 0.1 SOL (Index 2: Collateral)
   * This results in:
     * `visible_collateral` (sum up to index 1) = `0.2 SOL`
     * `real_total_collateral` (all except index 1) = `0.2 + 0.1 = 0.3 SOL` (satisfying `real_total_collateral > visible_collateral`)
   * **Borrow:** Since any loans pushed after index 1 are ignored by `take_while`, we can perform multiple `0.1 SOL` borrows sequentially.
   * Executing three `0.1 SOL` borrows results in:
     * `real_total_loans` = `0.3 SOL`
     * `max_allowed_borrow * 2` = `(0.2 / 1.5) * 2` = `0.266 SOL`
     * `real_total_loans` (0.3 SOL) > `max_allowed_borrow * 2` (0.266 SOL) -> triggers the exploit condition.

---

### 3. Execution & Flag Retrieval
We executed the exploit script using a funded temporary authority keypair:
```bash
npx ts-node challenge-14/solve.ts
```

#### Exploit Output Logs:
```
Borrowing 0.1 SOL (Borrow #3 - exploit trigger)...
Transaction succeeded. Signature: 4iao1c2y5XxksBQmTPPshht8V5effhk8BQXnuLVY7TTcSs3sVQqa9Lhec6Sd4diXzWYuPT9CJiWk8kmt6UzuGSYB
--- Logs ---
  Program A7w5Zz1aycLmCNJ2qWsYg8scL4DD4wvFWcCbwhPjCLCg invoke [1]
  Program log: Instruction: Borrow
  Program log: ST_FLAG{t00k_y0u_a_wh1le}
  Program log: Borrowed 100000000 lamports from global vault
  Program log: Health check passed: 200000000 collateral >= 150000000 required
  Program A7w5Zz1aycLmCNJ2qWsYg8scL4DD4wvFWcCbwhPjCLCg consumed 11933 of 200000 compute units
  Program A7w5Zz1aycLmCNJ2qWsYg8scL4DD4wvFWcCbwhPjCLCg success
```

### 4. Obtained Flag
**`ST_FLAG{t00k_y0u_a_wh1le}`**
