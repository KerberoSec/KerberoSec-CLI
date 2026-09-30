
---

## Level 2: Fallout

 
# Ethernaut Level 2: Fallout

## Challenge
Claim ownership of the contract.

[Level 2](https://ethernaut.openzeppelin.com/level/0x9CE80F8aCc10C2410b8272e174Be150F358bEFCC)

## Vulnerability: Misspelled Constructor

The function `Fal1out()` uses the number `1` instead of the letter `l`. In Solidity versions before 0.5, constructors were identified by matching the contract name exactly. Since `Fal1out` != `Fallout`, this function is a regular public payable function anyone can call.

## Our Research Process
Used our custom contract analyzer tool which identified `Fal1out()` as a payable function. The function appeared as:

```$ Fal1out()  [payable] ```

```await contract.Fal1out({value: toWei("0.001")})```

The `$` icon (payable) on what should be a constructor was the red flag. Cross-referencing with the contract name `Fallout` revealed the typo.

## Solution

```js
// Call the misspelled constructor to become owner
await contract.Fal1out({value: toWei("0.0001")})

// Verify ownership
await contract.owner()

// Submit Instance
```
## Key Takeaways

In Solidity < 0.5, constructors were named functions matching the contract name
A typo in the constructor name makes it a regular public function
Always verify constructor name matches contract name exactly
Modern Solidity uses the constructor keyword to prevent this vulnerability