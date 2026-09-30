# Log Me Maybe

This repository stores CTF challenge `Log Me Maybe` which was appeared at 2023 [WACON](https://wacon.world/) Finals. You may learn how Ethereum's event log works under the hood.

Category: `Blockchain` + `Crypto`

## Description

🪵

[TEAM-TOKEN]

## Author's Intention

You can theoretically(if you are a block producer) write 2048-bit arbitary data in Ethereum's block header's `logBlooms` field. [ethgoesbloom] attempted to fill in entire bloom bits. By generalizing [ethgoesbloom]'s idea, you can write a 2048-bit RSA public modulus in `logBlooms` field(or anything). By solving this challenge, you will get a strong understanding of how Ethereum logs🪵 work under the hood.

[ethgoesbloom]: https://github.com/smartcontracts/ethgoesbloom/tree/master

To get flag, you must execute `get_flag()`:
```py
def get_flag(self):
    try:
        block_number = int(input("block number: "))
        p = int(input("prime: "))
        assert block_number >= 0 and p >= 1
    except:
        raise Exception(f"Invalid input")
    data = {
        "jsonrpc": "2.0",
        "method": "eth_getBlockByNumber",
        "params": [hex(block_number), False],
        "id": 1,
    }
    try:
        res = RPC(f"{self.endpoint}:{self.port}", data)
        bloom = int(res["result"]["logsBloom"], 16)
        q = bloom // p
        assert p.bit_length() == 1024 and isPrime(p)
        assert q.bit_length() == 1024 and isPrime(q)
        assert p * q == bloom
    except Exception as e:
        raise Exception(f"No flag")
    print(FLAG)
```

## Flag

```
WACON2023{storing_rsa_public_modulus_on_ethereum_block_header_with_blooms}
```

## Solution

Exploit scripts mostly generalized from [ethgoesbloom].

1. Pick RSA primes $p$, $q$ which size is 1024 bits. $N = p q$
2. Mine topics by running [exploit/log-me-maybe/miner.py](https://github.com/pcw109550/log-me-maybe/blob/main/exploit/log-me-maybe/miner.py). 
3. Deploy contract [exploit/log-me-maybe/src/Attack.sol](https://github.com/pcw109550/log-me-maybe/blob/main/exploit/log-me-maybe/src/Attack.sol) which receives calldata and writes topic abusing [`LOG4`](https://ethervm.io/#A4) EVM instruction.
4. Call contract with mined topics.
5. Interact with frontend and get flag.

Ethereum LogsBloom src: [Ref](https://github.com/ethereum/go-ethereum/blob/233db64cc1d083e6251abe768c97e0454e2ca898/core/types/bloom9.go#L119C1-L129C2)

```go
func LogsBloom(logs []*Log) []byte {
	buf := make([]byte, 6)
	var bin Bloom
	for _, log := range logs {
		bin.add(log.Address.Bytes(), buf)
		for _, b := range log.Topics {
			bin.add(b[:], buf)
		}
	}
	return bin[:]
}
```

## Challenge Setup: Users

Deploy [dist](dist) directory as tarball. Online challenge.

Distribute single token(located at `src/hidden.py`) per team.

Distribute netcat endpoint, which serves paradigm CTF style frontend, like
```
1 - launch new instance
2 - kill instance
3 - get flag
```

## Challenge setup: Infra

Go to src directory
```sh
cd src/
```

If docker or docker compose is not installed, install it(only works on linux amd64).
```sh
./install-docker.sh
```

Build docker image.
```sh
./docker-image-build.sh
```

Spawn two terminals(maybe use tmux). Run

```sh
./expose-proxy.sh PORT_EXTERNAL
```
which opens `PORT_EXTERNAL` to users. Default: 12345. For reverse proxying RPC requests, for isolating blockchain for each team. Access via http.

```sh
./expose-server.sh EXTERNAL_IP
```
which opens port 33333 to users. This is the controller. Access via nc.

There can be up to 13 docker container which hosts geth, each of them acquiring ports from 20000 to 20012. These docker container only allow localhost access to inbound traffic.

### geth Database Initialization

This section briefly explains how to create [src/docker/data](src/docker/data) which is a geth database, based on [src/genesis.json](src/genesis.json). You can configure genesis to fund users.

```json
"alloc": {
    "eB2005888B3bCE12686EcA77fb77edb74362f72b": {
    "balance": "0x1b1ae4d6e2ef500000"
    },
    "78f3220F17D095a0a397a1DC621aF4EB4C57aB85": {
    "balance": "0x1b1ae4d6e2ef500000"
    }
},
```

Address `0x78f3220F17D095a0a397a1DC621aF4EB4C57aB85` will be the block sealer on clique.

Address `0xeB2005888B3bCE12686EcA77fb77edb74362f72b` will be the user address.

Each address holds `0x1b1ae4d6e2ef500000 == 500 ETH`.

#### Clique Genesis

Refer [here](https://ethereum.stackexchange.com/questions/51091/clique-genesis-file)

Address: `78f3220F17D095a0a397a1DC621aF4EB4C57aB85`
Password: `waconwacon1234`

#### Genesis DB init

```sh
geth init genesis.json --datadir=./data
geth account new --datadir=./data
geth init --datadir=./data genesis.json
```
