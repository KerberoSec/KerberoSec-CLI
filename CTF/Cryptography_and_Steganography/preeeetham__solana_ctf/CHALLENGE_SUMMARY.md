# Solana CTF Challenge Summary

## ✅ All 30 Challenges Created!

Here's the complete list of challenges organized by category:

### 🔐 Cryptographic Puzzles (10 Challenges)

#### TypeScript (5 challenges)
1. **[Weak Randomness Oracle](typescript/cryptographic-puzzles/01-weak-randomness/)**: Intermediate
   - Exploit predictable on-chain randomness
   - ✅ Full implementation with vulnerable code and solution

2. **[Ed25519 Signature Malleability](typescript/cryptographic-puzzles/02-signature-malleability/)**: Advanced
   - Double-spend using signature malleability
   - ✅ Vulnerable DEX implementation

3. **[PDA Seed Collision](typescript/cryptographic-puzzles/03-pda-collision/)**: Intermediate
   - Find colliding seeds for Program Derived Addresses
   - ✅ Vulnerable vault implementation

4. **[Merkle Proof Forgery](typescript/cryptographic-puzzles/04-merkle-proof-forgery/)**: Intermediate
   - Exploit weak Merkle tree implementation

5. **[BLS Signature Aggregation Attack](typescript/cryptographic-puzzles/05-bls-signature-attack/)**: Advanced
   - Break threshold signature scheme

#### Rust (5 challenges)
6. **[Elliptic Curve Backdoor](rust/cryptographic-puzzles/06-elliptic-curve-backdoor/)**: Advanced
   - Find hidden backdoor in custom curve

7. **[Zero-Knowledge Proof Bypass](rust/cryptographic-puzzles/07-zk-proof-bypass/)**: Advanced
   - Break a ZK-SNARK verifier

8. **[Hash Collision Mining](rust/cryptographic-puzzles/08-hash-collision/)**: Intermediate
   - Find practical collisions in weak hash

9. **[Commitment Scheme Break](rust/cryptographic-puzzles/09-commitment-break/)**: Advanced
   - Open commitments to different values

10. **[Ring Signature Deanonymization](rust/cryptographic-puzzles/10-ring-signature/)**: Advanced
    - Trace anonymous transactions

### 💰 DApp Exploitation (10 Challenges)

#### TypeScript (5 challenges)
11. **[Flash Loan Attack](typescript/dapp-exploitation/11-flash-loan-attack/)**: Intermediate
    - Drain liquidity pool using flash loans
    - ✅ Full implementation with oracle manipulation

12. **[AMM Price Manipulation](typescript/dapp-exploitation/12-amm-manipulation/)**: Intermediate
    - Exploit constant product formula

13. **[Governance Takeover](typescript/dapp-exploitation/13-governance-takeover/)**: Intermediate
    - Gain control of DAO governance

14. **[NFT Metadata Injection](typescript/dapp-exploitation/14-nft-injection/)**: Easy
    - Inject malicious data into NFT metadata

15. **[Cross-Program Invocation Exploit](typescript/dapp-exploitation/15-cpi-exploit/)**: Advanced
    - Chain CPIs for unauthorized access

#### Rust (5 challenges)
16. **[Oracle Manipulation](rust/dapp-exploitation/16-oracle-manipulation/)**: Intermediate
    - Manipulate price feeds for profit

17. **[Staking Reward Calculation Bug](rust/dapp-exploitation/17-staking-bug/)**: Intermediate
    - Claim excessive staking rewards

18. **[Token Mint Authority Hijack](rust/dapp-exploitation/18-mint-hijack/)**: Advanced
    - Take control of token mint

19. **[Escrow Double Claim](rust/dapp-exploitation/19-escrow-double-claim/)**: Intermediate
    - Claim funds twice from escrow

20. **[DEX Sandwich Attack](rust/dapp-exploitation/20-dex-sandwich/)**: Intermediate
    - Front-run and back-run DEX trades

### ⚡ Blockchain Security Scenarios (10 Challenges)

#### TypeScript (5 challenges)
21. **[Account Substitution Attack](typescript/blockchain-security/21-account-substitution/)**: Intermediate
    - Substitute malicious accounts

22. **[Sysvar Spoofing](typescript/blockchain-security/22-sysvar-spoofing/)**: Easy
    - Spoof system variables
    - ✅ Vulnerable timelock implementation

23. **[Rent Exemption Bypass](typescript/blockchain-security/23-rent-bypass/)**: Intermediate
    - Avoid rent payments

24. **[Transaction Reordering](typescript/blockchain-security/24-tx-reordering/)**: Intermediate
    - Exploit transaction ordering

25. **[State Corruption](typescript/blockchain-security/25-state-corruption/)**: Advanced
    - Corrupt program state

#### Rust (5 challenges)
26. **[Integer Overflow Treasury Drain](rust/blockchain-security/26-integer-overflow/)**: Advanced
    - Exploit arithmetic bugs
    - ✅ Full implementation with test solution

27. **[Reentrancy in Token Program](rust/blockchain-security/27-reentrancy/)**: Intermediate
    - Classic reentrancy attack

28. **[Authority Escalation](rust/blockchain-security/28-authority-escalation/)**: Advanced
    - Escalate privileges in multi-sig

29. **[Seed Canonicalization Bug](rust/blockchain-security/29-seed-bug/)**: Intermediate
    - Exploit PDA generation flaw

30. **[Cross-Chain Bridge Exploit](rust/blockchain-security/30-bridge-exploit/)**: Advanced
    - Attack bridge protocol

## 📊 Statistics

- **Total Challenges**: 30
- **TypeScript**: 15 challenges
- **Rust**: 15 challenges
- **Easy**: 2 challenges
- **Intermediate**: 17 challenges
- **Advanced**: 11 challenges

## 🚀 Getting Started

Each challenge includes:
- `README.md` - Challenge description
- Vulnerable implementation (in progress)
- Exploit template
- Complete solution

To start:
```bash
./setup.sh
cd <challenge-directory>
# Follow the README instructions
```

Happy hacking! 🎯 