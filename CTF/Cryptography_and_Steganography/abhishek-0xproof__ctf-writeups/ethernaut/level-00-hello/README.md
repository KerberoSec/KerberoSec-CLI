# Ethernaut Level 0: Hello Eternaut

## Challenge
Introduction to interacting with smart contracts through the browser console. [Hello Ethernaut](https://ethernaut.openzeppelin.com/level/0x7E0f53981657345B31C59aC44e9c21631Ce710c7)
## Must Haves Before starting level
- [X] Sepolia ETH on MetaMask Wallet to be used.
- [X] ETH > 0.25
    - [X] [Google Seplia](https://cloud.google.com/application/web3/faucet/ethereum/sepolia)
    - [X] [PoW Based Sepolia](https://sepolia-faucet.pk910.de/)
- [X] Basic Smart Contract Knowledge and JS

## Solution

```js
// start with player call variable, you get your wallet address
player
// proceed with 
getBalance(player)
//check ethernaut contract abi and owner
await ethernaut
//look for .owner()
await ethernaut.owner()
// Connect wallet and get instance , use the UI to interact

//Proceed by checking the contract
await contract

// Follow hints in sequence, keep following the trail
await contract.info()
await contract.info1()
await contract.info2("hello")
(await contract.infoNum()).toString()
await contract.info42()
await contract.theMethodName()
await contract.method7123949()

// Get password and authenticate
await contract.password()
await contract.authenticate("ethernaut0")
```
## Submit and Win LVL 0
- Click on the submit instance.
- Approve the transaction

### Personal Experience and tips

##### proceed always with   Chrome Browser , as firefox will fail likely on instance and transaction await calls on submission and instance allocation due to incorrect configuration with metamask sepolia network and rejects at usage.
##### Keep Plenty of Sepolia Eth, use second website shared for more tokens.

<div align="left" style="display: flex; align-items: center; gap: 10px;">
  <img src="https://github.com/abhishek-0xproof.png" width="12" style="border-radius: 50%;">
  <a href="https://github.com/abhishek-0xproof"><b>abhishek-0xproof</b></a>
</div>

