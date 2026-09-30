---
tags: [ctf, blockchain, forensics, on-chain]
created: 2026-05-02
---

# 🔍 Blockchain Forensics

> ตามรอย transaction บน chain: wallet flow, contract interaction, MEV, DeFi exploits

---

## 🛠 Tools

### Block Explorers
| Tool | Chain |
|------|-------|
| **Etherscan** ⭐ | Ethereum |
| **BscScan** | Binance Smart Chain |
| **Polygonscan** | Polygon |
| **Arbiscan** | Arbitrum |
| **Optimistic.Etherscan** | Optimism |
| **Snowtrace** | Avalanche |
| **Blockchair** | Multi-chain |
| **OXT.me** | Bitcoin |
| **Mempool.space** | Bitcoin |

### Advanced
- **Tenderly**: tx simulation, debugger ⭐
- **Phalcon**: tx debugger (BlockSec)
- **Dune Analytics**: SQL queries on chain data
- **Nansen**: labels wallets (paid)
- **Arkham Intelligence**: entity tracking
- **Chainalysis**: professional (LE/banks)
- **Breadcrumbs**: visualization
- **Bitquery**: GraphQL on-chain data

### Programmatic
- **web3.py / ethers.js**: connect to RPC, query
- **Foundry's cast**: CLI for tx interaction

---

## 📊 Tracing Funds

### Ethereum: Follow ETH
1. Etherscan → address
2. Tab "Internal Txs": ETH from contract calls
3. Tab "Transactions": direct sends
4. Note destinations → repeat

### Bitcoin: UTXO model
- Each tx has inputs + outputs
- "change" output goes back to sender (heuristic)
- Track via **OXT** or **Blockchair**

### ERC-20 token transfers
- Etherscan tab "Token Transfers"
- Note token contract address
- Common: USDT, USDC, WETH

### NFT transfers
- "ERC-721 Token Transfers"
- "ERC-1155"

---

## 🕵️ Address Clustering

### Heuristics
- Multiple addresses sending to same destination → likely same owner
- "Common-input ownership" (Bitcoin): multiple inputs in single tx = same wallet
- Time-of-day patterns
- Reuse of certain protocols (mixer, exchange, bridge)

### Tools
- **Arkham**: labels with entities
- **Etherscan tags**: known addresses (exchanges, contracts)
- **OXT.me**: Bitcoin clustering

---

## 🔄 Mixers / Tumblers

Privacy services that obscure trail:
- **Tornado Cash** (Ethereum): sanctioned 2022
- **Wasabi Wallet**: CoinJoin Bitcoin
- **Samourai Wallet**: Whirlpool

### Tracing through Tornado
- Deposit to Tornado contract
- Withdraw to fresh address
- Without "compliance tool" → hard to link
- BUT: timing analysis, gas amount uniqueness, repeated patterns → can de-anonymize

---

## 🏛 Read Smart Contract State

### Etherscan "Read Contract" tab
ถ้า contract verified → call view functions
- `balanceOf(addr)`
- `owner()`
- Custom getters

### Read storage directly (unverified)
```bash
# Foundry cast
cast storage 0xCONTRACT 0    # slot 0
cast storage 0xCONTRACT 1    # slot 1

# Storage layout (if known)
cast storage 0xCONTRACT --rpc-url $RPC_URL
```

### Mapping slots
```solidity
mapping(address => uint) balances;   // slot 5

// To read balances[user]:
slot = keccak256(abi.encode(user, 5))
```

```bash
slot=$(cast keccak $(cast abi-encode "x(address,uint256)" 0xUSER 5))
cast storage 0xCONTRACT $slot
```

---

## ⏪ Tx Replay / Simulation

### Tenderly
- Visual debugger
- Stack trace per opcode
- State changes
- Free tier OK for most

### Phalcon (BlockSec)
- Transaction explorer with detailed call traces
- Free, very useful for debugging exploits

### Foundry: fork + replay
```bash
forge test --fork-url $RPC --fork-block-number 12345678 -vvvv
```

→ Run code as if at past state

---

## 🌐 MEV (Maximal Extractable Value)

### Front-running detection
- Tx with same params, higher gas, slightly earlier block position
- Tools: **EigenPhi**, **MEV-inspect**

### Sandwich attacks
- Attacker tx before victim
- Attacker tx after victim
- Profit from price movement

### Backrunning / Arbitrage
- Less malicious: exploit imbalance after victim's tx
- Searcher bots run 24/7

### Builder/Block patterns
- Flashbots, BloXroute auctions
- Private mempools

---

## 🔥 DeFi Exploit Forensics

### When project gets hacked:
1. **Get exploit tx hash** (often shared on Twitter/X)
2. Open in **Tenderly** → trace
3. Identify:
   - Attacker EOA
   - Attacker contract
   - Victim contract
   - Drained tokens
4. **Trace funds**:
   - Where did stolen tokens go?
   - Bridges? CEX deposits?
5. **Decompile attacker contract**:
   - Dedaub.com / Heimdall
   - Understand exploit technique

### Famous case studies (rekt.news)
- Ronin Bridge ($625M, 2022)
- Wormhole ($320M)
- Nomad Bridge ($190M)
- BNB Chain Cross-Chain Bridge ($570M)

อ่าน writeups → เรียนเทคนิค

---

## 🪙 Bitcoin Forensics

### Tools
- **Blockchair**: universal explorer
- **OXT.me**: clustering
- **Mempool.space**: mempool view
- **Bitcoin Core**: full node CLI
- **Electrum**: wallet with raw tx view

### Concepts
- UTXO model (each "coin" tracked)
- Common-input ownership
- Change output detection
- Timing analysis

### Workflow
1. Tx hash → Blockchair
2. See inputs (where coins came from)
3. See outputs (where they go)
4. Cluster inputs → likely same wallet
5. Continue tracing

---

## 🎯 CTF Patterns

### Pattern 1: Flag in tx data
- Tx has `input data` field
- Sometimes flag = decoded hex of input
```bash
cast 4byte-decode 0xa9059cbb...
# Or just: hex → ASCII
```

### Pattern 2: Flag in event log
Smart contract emits event with flag:
```bash
# Via Etherscan: tx → Logs tab
# Via web3
```

### Pattern 3: Trace specific tx flow
- Given tx hash → tell what happened
- Use Tenderly → understand sequence

### Pattern 4: Read contract storage
- Flag stored in private variable
- All storage is public on-chain
- Read slot with cast

### Pattern 5: Find specific tx
- Among millions of tx → find one matching criteria
- Use Dune Analytics:
  ```sql
  SELECT * FROM ethereum.transactions 
  WHERE to = '0x...' 
    AND block_time > NOW() - INTERVAL '7 days'
  ```

### Pattern 6: ENS / Wallet linking
- ENS name → resolves to address
- Reverse lookup: address → ENS
- Owner of ENS = identity hint

---

## 🎯 Useful cast Commands

```bash
# Send tx
cast send 0xADDR "func(uint)" 42 --private-key $KEY

# Call (read-only)
cast call 0xADDR "owner()(address)"
cast call 0xADDR "balanceOf(address)(uint)" 0xUSER

# Convert
cast to-hex 12345
cast to-dec 0xabcd
cast --to-bytes32 "string"
cast keccak "Transfer(address,address,uint256)"

# Storage
cast storage 0xADDR 0
cast storage 0xADDR 0 --block 12345678

# Function signatures
cast 4byte 0xa9059cbb
cast sig "transfer(address,uint256)"
```

---

## 🧰 Scripting (Python web3)

```python
from web3 import Web3

w3 = Web3(Web3.HTTPProvider("https://eth.llamarpc.com"))

# Latest block
print(w3.eth.block_number)

# Get balance
balance = w3.eth.get_balance("0x...")
print(w3.from_wei(balance, "ether"))

# Get tx
tx = w3.eth.get_transaction("0x...")
print(tx)

# Get tx receipt + logs
receipt = w3.eth.get_transaction_receipt("0x...")
for log in receipt.logs:
    print(log)

# Call contract function
abi = [...]
contract = w3.eth.contract(address="0x...", abi=abi)
print(contract.functions.balanceOf("0x...").call())
```

---

## 🔗 ที่เกี่ยวข้อง

- [Smart-Contract-Security](Smart-Contract-Security.md)
- [OSINT for blockchain](../09-OSINT-Advanced/OSINT-Advanced.md)

## 📚 References

- rekt.news: DeFi hack writeups ⭐
- ethereum.org/developers
- Tenderly docs
- duneanalytics.com: community queries
- ethereum-blockchain-developer.com (forensics)

---

#ctf #blockchain #forensics
