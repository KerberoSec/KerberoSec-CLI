# Blockchain: Navigating the Unknown

- Date: 18.03.2023
- Link: <https://ctf.hackthebox.com/event/821>

## Environment

```
IP1=46.101.80.159:31592
IP2=46.101.80.159:32200
```

In the README of the challenge we can read that second port (`IP2`) can be used
to receive connection details needed for Blockchain challenges. We can use `netcat`
to do that:

```shell-session
nc 46.101.80.159 32200
1 - Connection information
2 - Restart Instance
3 - Get flag

action? 1

Private key     :  0xf42dfd8f8ff378cfe2a5d6d57bcb5e0210c0446d34e10a540e56e21c8a0f8e4a
Address         :  0x32151046afbb061C4f95fa911DC0eb47f9931De0
Target contract :  0xfedeEBdF866F8227cecc3D6C8de22D187cD0911F
Setup contract  :  0xf285bc9c0c6De4e2f4729B5A2478B1b458F6224F
```

These connection details need to be used to call the target smart contract.

## Finding the Win Condition

By studying the solidity source code provided in the challenge, we find out that
to solve this challenge the `TARGET` needs to have `updated == true`.

``` solidity
// Setup.sol
contract Setup {
    Unknown public immutable TARGET;

    constructor() {
        TARGET = new Unknown();
    }

    function isSolved() public view returns (bool) {
        return TARGET.updated();
    }
}
```

For this to happen, we need to call the `updateSensors()` function of the target
smart contract with `10` as the argument.

``` solidity
contract Unknown {
  bool public updated;

  function updateSensors(uint256 version) external {
      if (version == 10) {
          updated = true;
      }
  }
}
```

In [this write-up](https://infosecwriteups.com/openzeppelin-ethernaut-part-0x00-be38d7113110)
we find a very easy way to call smart contracts using the
[`fundary-rs`](https://book.getfoundry.sh/) cli.

### Setup foundry

First, we need to set it up though :sweat_smile: 

``` sh
# Setup 
curl -L https://foundry.paradigm.xyz | bash

# In a new terminal
$ foundryup
```

## Solution

To call the function we use these two commands:

``` sh
# use the rpc port (IP1 above) for foundary
export ETH_RPC_URL="http://46.101.80.159:31592"

# Call Smart Contract function
cast send --private-key 0xf42dfd8f8ff378cfe2a5d6d57bcb5e0210c0446d34e10a540e56e21c8a0f8e4a \
0xfedeEBdF866F8227cecc3D6C8de22D187cD0911F "updateSensors(uint256)" 10
```

The second command breaks down to this:

- `cast`: command-line tool for performing Ethereum RPC calls
- `call`: call the contract function
- `--private-key 0xf42..`: the private key given to us via the `nc` command
- `0xfed...0911F`: Address where the smart contract
  is deployed. (Received in the `nc` command above)
- `updateSensors(uint256)`: Function name in the deployed contract
    - (`uint256` is the data type of the parameter)
- `10` the argument value for the `updateSensors` function

## Retrieving the flag

It looks like our function call git executed on the Blockchain.

``` sh
cast send --private-key 0xf42dfd8f8ff378cfe2a5d6d57bcb5e0210c0446d34e10a540e56e21c8a0f8e4a \
0xfedeEBdF866F8227cecc3D6C8de22D187cD0911F "updateSensors(uint256)" 10

blockHash               0x3fb32ea4753f2da133ec9718bcbcdccc11e1f183a97307aa3b6269b06da20f76
blockNumber             2
contractAddress         
cumulativeGasUsed       43574
effectiveGasPrice       3000000000
gasUsed                 43574
logs                    []
logsBloom               0x000000000000000000000000000000000000...
root                    
status                  1
transactionHash         0x35d4ab4d112013b6c44f461cf4e25b64215d6d18d059226263c2bfa8da17e9c2
transactionIndex        0
type                    2
```

With this we can request the flag via `netcat`:

``` shell-session
$ nc 46.101.80.159 32200 
1 - Connection information
2 - Restart Instance
3 - Get flag

action? 3

FLAG=HTB{...} 
```
