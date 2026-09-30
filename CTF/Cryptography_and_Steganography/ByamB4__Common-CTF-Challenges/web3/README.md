# Web3

Smart contract and blockchain challenge helpers.

## Quick wins
- Use explorers/analyzers to understand contract flows before manual calls
- Look for mis-set ownership, insecure delegatecalls, or unchecked external calls
- Check for integer overflow in Solidity < 0.8.0
- Always verify msg.sender vs tx.origin usage

## Common Vulnerabilities

### Reentrancy
```solidity
// VULNERABLE
function withdraw() public {
    uint amount = balances[msg.sender];
    (bool success, ) = msg.sender.call{value: amount}("");  // External call BEFORE state update
    balances[msg.sender] = 0;  // State change after external call!
}

// FIXED - Checks-Effects-Interactions pattern
function withdraw() public {
    uint amount = balances[msg.sender];
    balances[msg.sender] = 0;  // State change BEFORE external call
    (bool success, ) = msg.sender.call{value: amount}("");
}
```

### Integer Overflow/Underflow (pre-0.8.0)
```solidity
// Solidity < 0.8.0 - vulnerable
uint8 balance = 255;
balance += 1;  // Now 0!

uint8 balance = 0;
balance -= 1;  // Now 255!
```

### tx.origin vs msg.sender
```solidity
// VULNERABLE - can be exploited via phishing
function transfer(address to, uint amount) public {
    require(tx.origin == owner);  // Bad!
    // ...
}

// FIXED
function transfer(address to, uint amount) public {
    require(msg.sender == owner);  // Good
    // ...
}
```

### Access Control Issues
- Missing `onlyOwner` modifiers
- Unprotected `selfdestruct`
- Improper visibility (public vs private)
- Constructor typos (Solidity < 0.5.0)

### Delegatecall
```solidity
// DANGEROUS - context preservation
// Caller's storage is modified, not callee's
(bool success, ) = targetContract.delegatecall(data);
```

## Tools

### Local Development
```bash
# Foundry (recommended)
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Create project
forge init myproject
forge build
forge test -vvv

# Deploy
forge create --rpc-url $RPC_URL --private-key $PRIVATE_KEY src/Contract.sol:Contract
```

### Hardhat
```bash
npx hardhat init
npx hardhat compile
npx hardhat test
npx hardhat run scripts/deploy.js
```

## Interaction

### Web3.py
```python
from web3 import Web3

# Connect
w3 = Web3(Web3.HTTPProvider('http://localhost:8545'))

# Load contract
contract = w3.eth.contract(address=addr, abi=abi)

# Read
result = contract.functions.someFunction().call()

# Write
tx = contract.functions.someFunction().transact({'from': account})
```

### Cast (Foundry)
```bash
# Call function
cast call $CONTRACT "balanceOf(address)" $ADDR --rpc-url $RPC

# Send transaction
cast send $CONTRACT "transfer(address,uint256)" $TO 1000 --rpc-url $RPC --private-key $KEY

# Decode calldata
cast calldata-decode "transfer(address,uint256)" $DATA
```

### ethers.js
```javascript
const { ethers } = require("ethers");

const provider = new ethers.JsonRpcProvider("http://localhost:8545");
const contract = new ethers.Contract(address, abi, provider);

// Read
const result = await contract.someFunction();

// Write (needs signer)
const signer = new ethers.Wallet(privateKey, provider);
const tx = await contract.connect(signer).someFunction();
```

## Block Explorers

- [Etherscan](https://etherscan.io/): Ethereum mainnet
- [Polygonscan](https://polygonscan.com/): Polygon
- [BscScan](https://bscscan.com/): Binance Smart Chain
- [Arbiscan](https://arbiscan.io/): Arbitrum

## Analysis Tools

- [Dedaub](https://app.dedaub.com/): Contract decompiler
- [Etherscan Decompiler](https://etherscan.io/bytecode-decompiler)
- [Remix IDE](https://remix.ethereum.org/): Browser IDE
- [Slither](https://github.com/crytic/slither): Static analyzer
- [Mythril](https://github.com/ConsenSys/mythril): Security analysis

## CTF Setup

### Local node
```bash
# Anvil (Foundry)
anvil

# Hardhat
npx hardhat node

# Ganache
ganache-cli
```

### Get test ETH
```bash
# Anvil provides funded accounts
# Use first account private key for testing
cast send --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 $TARGET 1ether
```
