# Blockchain: Shooting 101

- Date: 19.03.2023
- Link: <https://ctf.hackthebox.com/event/821>

## Environment

```
IP1=165.232.108.200:31458
IP2=165.232.108.200:30222
```

Connect to `IP2` to get the connect information:

``` shell-session
$ nc 165.232.108.200
1 - Connection information
2 - Restart Instance
3 - Get flag
action? 1

Private key     :  0x6a8d29bba6c63d19a1175a87bcfa28bafceea960f9b8e039dcd050d80544f220
Address         :  0x053876807631f7a388CEF42779f1Fbf43363fD2A
Target contract :  0x08cC89b36e9Af712f4b2B65ED4Bf201bE48F85c4
Setup contract  :  0x6c9f9D726f1AF2Bcbae7e524981A2e5CC49ff359
```

## Win Condition (Study the Smart Contract)

In the `Setup.sol` contract we see that we need to *shoot three shots*
to solve this challenge.

``` solidity
function isSolved() public view returns (bool) {
  return TARGET.firstShot() && TARGET.secondShot() && TARGET.thirdShot();
}
```

The target smart contract ensures, that we shoot these shots in order (first, second,
third). [Info modifier](https://www.tutorialspoint.com/solidity/solidity_function_modifiers.htm)

``` solidity
pragma solidity ^0.8.18;

contract ShootingArea {
    bool public firstShot;
    bool public secondShot;
    bool public thirdShot;

    modifier firstTarget() {
        require(!firstShot && !secondShot && !thirdShot);
        _;
    }

    modifier secondTarget() {
        require(firstShot && !secondShot && !thirdShot);
        _;
    }

    modifier thirdTarget() {
        require(firstShot && secondShot && !thirdShot);
        _;
    }

    receive() external payable secondTarget {
        secondShot = true;
    }

    fallback() external payable firstTarget {
        firstShot = true;
    }

    function third() public thirdTarget {
        thirdShot = true;
    }
}
```

This means that in order to solve the challenge we need to:

1. Trigger the `fallback` function.
2. Send the contract some ETH to trigger the `receive` function.
3. Call a function called `third()`.

## Execute the Plan

We use the foundry cast CLI to interact with the smart contract.

??? info "Installation of Foundry"

    ``` sh
    # Install
    curl -L https://foundry.paradigm.xyz | bash

    # In a new terminal
    foundryup
    ```

The `fallback` function is a special function that is automatically
called for all messages sent to a contract, except plain Ether transfers. So we
can simply call a dummy function that does not exist, like `bla()`.  

I used the examples here to learn about fallback functions: <https://docs.soliditylang.org/en/latest/contracts.html#fallback-function>.

``` sh
# Configure our rpc endpoint
export ETH_RPC_URL="http://165.232.108.200:31458"

cast send --private-key 0x6a8d29bba6c63d19a1175a87bcfa28bafceea960f9b8e039dcd050d80544f220 \
0x08cC89b36e9Af712f4b2B65ED4Bf201bE48F85c4 "bla()"

blockHash               0x0857f23c494049f7025c82de31c3c08870bdbdefcd874287be7d2e385173ca64
blockNumber             2
contractAddress         
cumulativeGasUsed       43764
effectiveGasPrice       3000000000
gasUsed                 43764
logs                    []
logsBloom               0x0000000000000000...
root                    
status                  1
transactionHash         0x8145e5b92bb8f9ae4226c656372de9dc84083117396f45c3a737e9dc4521ce10
transactionIndex        0
type                    2
```

Next, we need to send some ETH to the contract to trigger `receive()`.

``` sh
cast send --private-key 0x6a8d29bba6c63d19a1175a87bcfa28bafceea960f9b8e039dcd050d80544f220 \
0x08cC89b36e9Af712f4b2B65ED4Bf201bE48F85c4 --value 10gwei

blockHash               0x91ca43691e5402c08951a6ad6307638dc829aeb1f9ac84a815f930a3f5110a98
blockNumber             3
contractAddress         
cumulativeGasUsed       26492
effectiveGasPrice       3000000000
gasUsed                 26492
logs                    []
logsBloom               0x00000000000000000000000...
root                    
status                  1
transactionHash         0xc39fa3d75d1adeb9f33b048b59d8a487984a1f569c20ff6bb2eed41f09ac502a
transactionIndex        0
type                    2
```

Hurray!, our payment went through :tada:.  
Finally, we can call the `third()` function on the contract:

``` sh
cast send --private-key 0x6a8d29bba6c63d19a1175a87bcfa28bafceea960f9b8e039dcd050d80544f220 \
0x08cC89b36e9Af712f4b2B65ED4Bf201bE48F85c4 "third()" 

blockHash               0x809a3509e4147b962a23b428871d76e535a63e4c0bf97160f913a07a39d42986
blockNumber             4
contractAddress         
cumulativeGasUsed       26620
effectiveGasPrice       3000000000
gasUsed                 26620
logs                    []
logsBloom               0x000000000000000000000000000000...
root                    
status                  1
transactionHash         0x2e2b226792282c0acc12f2204b9f9d35d35b8e9e4bc1a3e188837a7bd25a6ae8
transactionIndex        0
type                    2
```

With this we can now retrieve our flag:

``` shell-session
nc 165.232.108.200 30222
1 - Connection information
2 - Restart Instance
3 - Get flag
action? 3
HTB{...}
```
