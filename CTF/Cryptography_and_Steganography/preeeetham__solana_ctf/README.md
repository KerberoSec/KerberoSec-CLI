# Solana CTF Competition Preparation

This repository contains 30 advanced Solana security challenges designed to prepare you for Capture The Flag competitions. The challenges are based on real-world vulnerabilities and attack patterns found in Solana protocols.

## 🎯 Challenge Categories

### 1. Cryptographic Puzzles (10 challenges)
Focus on breaking cryptographic implementations, finding mathematical vulnerabilities, and exploiting weak randomness.

### 2. DApp Exploitation (10 challenges)
Target vulnerabilities in decentralized applications including DEXs, lending protocols, and governance systems.

### 3. Blockchain Security Scenarios (10 challenges)
Exploit blockchain-specific vulnerabilities like integer overflows, reentrancy, and authority escalation.

## 🚀 Getting Started

### Prerequisites
- Rust 1.75+ with Solana toolchain
- Node.js 18+ with TypeScript
- Anchor Framework 0.29+
- Solana CLI tools

### Installation

```bash
# Install Solana tools
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Install Anchor
npm install -g @coral-xyz/anchor-cli

# Install dependencies
npm install

# Build all Rust programs
for dir in rust/*/; do
  cd "$dir" && anchor build && cd ../..
done
```

## 📋 Complete Challenge List

### TypeScript Challenges

#### Cryptographic Puzzles
1. **Weak Randomness Oracle**: Exploit predictable on-chain randomness in lottery
2. **Ed25519 Signature Malleability**: Double-spend using signature malleability  
3. **PDA Seed Collision**: Find colliding seeds for Program Derived Addresses
4. **Merkle Proof Forgery**: Exploit weak Merkle tree implementation
5. **BLS Signature Aggregation Attack**: Break threshold signature scheme

#### DApp Exploitation  
11. **Flash Loan Attack**: Drain liquidity pool using flash loans and oracle manipulation
12. **AMM Price Manipulation**: Exploit constant product formula weakness
13. **Governance Takeover**: Gain control of DAO governance through vote manipulation
14. **NFT Metadata Injection**: Inject malicious data into NFT metadata
15. **Cross-Program Invocation Exploit**: Chain CPIs for unauthorized access

#### Blockchain Security
21. **Account Substitution Attack**: Substitute malicious accounts in transactions
22. **Sysvar Spoofing**: Spoof system variables for exploitation
23. **Rent Exemption Bypass**: Avoid rent payments through account manipulation
24. **Transaction Reordering**: Exploit transaction ordering for profit
25. **State Corruption**: Corrupt program state for unauthorized access

### Rust Challenges

#### Cryptographic Puzzles
6. **Elliptic Curve Backdoor**: Find hidden backdoor in custom curve implementation
7. **Zero-Knowledge Proof Bypass**: Break a ZK-SNARK verifier
8. **Hash Collision Mining**: Find practical collisions in weak hash function
9. **Commitment Scheme Break**: Open commitments to different values
10. **Ring Signature Deanonymization**: Trace anonymous transactions

#### DApp Exploitation
16. **Oracle Manipulation**: Manipulate price feeds for profit
17. **Staking Reward Calculation Bug**: Claim excessive staking rewards
18. **Token Mint Authority Hijack**: Take control of token mint
19. **Escrow Double Claim**: Claim funds twice from escrow
20. **DEX Sandwich Attack**: Front-run and back-run DEX trades

#### Blockchain Security
26. **Integer Overflow Treasury Drain**: Exploit arithmetic bugs to drain treasury
27. **Reentrancy in Token Program**: Classic reentrancy attack
28. **Authority Escalation**: Escalate privileges in multi-sig
29. **Seed Canonicalization Bug**: Exploit PDA generation flaw
30. **Cross-Chain Bridge Exploit**: Attack bridge protocol

## 🏃 Running Challenges

### TypeScript Challenges
```bash
cd typescript/<category>/<challenge-number>
npm install
npm test  # Run tests
npm run exploit  # Run exploit
```

### Rust Challenges
```bash
cd rust/<category>/<challenge-number>
anchor build
anchor test
```

## 📚 Learning Resources

Each challenge includes:
- **README.md**: Challenge description and objectives
- **Vulnerable code**: The target contract/program
- **Exploit template**: Starter code for your solution
- **Solution**: Complete working exploit (study after attempting!)

## 🛡️ Security Best Practices

These challenges teach you to identify and exploit:
- Arithmetic overflows/underflows
- Reentrancy vulnerabilities  
- Access control flaws
- Oracle manipulation
- Flash loan attacks
- Signature malleability
- And many more...

## ⚠️ Disclaimer

These challenges are for educational purposes only. Never attempt these exploits on mainnet or without explicit permission. Always practice responsible disclosure when finding real vulnerabilities.

## 🤝 Contributing

Found a bug or have a challenge idea? Please open an issue or submit a PR!

## 📄 License

MIT License: See LICENSE file for details

---

Happy hacking and good luck in your CTF competitions! 🚀 