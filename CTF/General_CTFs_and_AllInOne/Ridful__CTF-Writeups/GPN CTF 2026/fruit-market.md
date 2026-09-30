# Fruit Market

## Challenge info

- **Name:** fruit-market
- **Event:** GPNCTF 2026
- **Category:** Misc / Blockchain
- **Author:** tamedfox

The challenge presents itself as a fruit-trading job.

We are hired as a transaction coordinator for a blockchain marketplace and are responsible for submitting customer trades before they expire.

The important part is that we are not just observing the transaction flow. We control which transactions reach the chain and in what order.

That makes the coordinator role a perfect setup for a sandwich attack.

## First look

The provided files contain three main components:

- `eth/MiniDex.sol` and `eth/ERCFixed.sol`
- `python/main.py`, `python/trader.py`, and `python/utils.py`
- a small HTML operator panel using Bootstrap and Socket.IO

The blockchain setup contains three ERC-20 tokens:

```text
APL  apples
BAN  bananas
CHY  cherries
```

Each token has a total supply of 1000 base units.

There is no decimal scaling involved, so every balance and swap amount is a small integer. That becomes useful later because we can brute-force the best trade size very cheaply.

The three liquidity pools begin with:

```text
APL-BAN: 100 APL / 200 BAN
BAN-CHY: 100 BAN / 200 CHY
APL-CHY: 100 APL / 400 CHY
```

The application also launches three automated traders.

## Bot behavior

The trading strategy is defined in `trader.py`:

```python
# Ultimate Trading Strategy:
# Take what you have most of, and swap it with something else!
balance = self.balance()
trade_token = max(balance, key=balance.get)
trade_amount = max(int(balance[trade_token] * 0.5), 1)
```

Each bot finds the token it currently owns the most of and sells half of that balance.

One bot begins with 400 APL, which means it will repeatedly submit large apple sales.

That is especially useful because the win condition requires us to accumulate apples.

## Win condition

The `/flag` endpoint checks the manager's APL balance:

```python
@app.get("/flag")
def flag():
    if balance_erc(ETH_SETUP["ercs"]["APL"], MANAGER) >= 500:
        return "Wow! Here is your flag:\n" + os.environ.get("FLAG", ...)
```

We need at least:

```text
500 APL
```

There are only 1000 apples in total.

The initial distribution leaves the manager with 10 APL after claiming the fruit basket, so the goal is to turn those 10 apples into at least 500.

## Application endpoints

The important endpoints are:

```text
GET  /setup
POST /fruit-basket
GET  /open
POST /submit
POST /
```

Their roles are:

- `/setup` returns the deployed contract addresses.
- `/fruit-basket` registers our address as the manager and transfers 10 APL plus ETH.
- `/open` starts the customer bot worker.
- `/submit` accepts a signed raw transaction and broadcasts it.
- `/` acts as a restricted JSON-RPC proxy for read-only methods.

The RPC proxy allows methods such as `eth_call`, balance queries, nonce queries, and gas price lookups.

It does not allow:

```text
eth_sendRawTransaction
```

All state-changing transactions must be sent through `/submit`.

## The critical design flaw

The bot worker creates signed transactions and emits them over Socket.IO:

```python
txs = t.next()
if txs is not None:
    socketio.emit(
        "new_trade",
        {
            "approve": ...,
            "swap": ...,
            "swap_hash": ...,
        },
    )
```

The worker does not submit those transactions itself.

It only sends the signed bytes to every connected client.

The coordinator is expected to relay them through `/submit`.

That means we have:

- the customer's fully signed transaction before execution
- full control over whether it is included
- full control over its position relative to our own transactions
- the ability to inject our own trades before and after it

The coordinator effectively controls the mempool and block ordering.

The challenge description mentions that our neutrality makes the marketplace safe. Nothing in the application actually enforces that neutrality.

## Dead ends

Before recognizing the transaction-ordering attack, I tested several other ideas.

### Reentrancy

`MiniDex` inherits from `ReentrancyGuard`, and the swap function is marked `nonReentrant`.

The tokens are normal OpenZeppelin ERC-20 implementations without transfer hooks or callbacks.

There was no useful reentrancy surface.

### Replaying customer transactions

The application broadcasts each customer's signed approval and swap transactions.

Replaying them does not redirect any assets to us.

The transactions are tied to the customer's address and nonce, and the DEX transfers assets on behalf of that same customer.

Resubmitting them only performs the customer's intended trade.

### Abusing the RPC proxy

The setup uses Anvil internally, so methods such as `anvil_setBalance` would have been useful.

However, the JSON-RPC proxy has a strict read-only allowlist.

Both `anvil_setBalance` and `eth_sendRawTransaction` are blocked.

### AMM rounding

The DEX output formula is:

```solidity
uint256 newOutputReserve =
    (inputReserve * outputReserve) / newInputReserve;

outputAmount =
    outputReserve - newOutputReserve;
```

Because the division is rounded down before subtraction, the final output is effectively rounded upward in the trader's favor.

For example, in the APL-CHY pool:

```text
10 APL -> 37 CHY
37 CHY -> 11 APL
```

A round trip gains one apple.

This is a real flaw, especially because the DEX charges no fee, but it is not enough to reach 500 APL efficiently. The pool only begins with 100 apples, and the gain becomes less useful as the reserves change.

The rounding issue was a good clue that the AMM lacked several normal protections, but it was not the main exploit.

## The actual vulnerability

The DEX swap function checks a deadline and requires a nonzero output.

It does not accept a minimum output amount.

There is no equivalent of:

```solidity
require(outputAmount >= minAmountOut);
```

So customer trades have no slippage protection.

This becomes exploitable because we know every trade in advance and control the ordering.

Whenever a customer sells APL, we can perform a sandwich:

1. Sell our APL into the same pool first.
2. Submit the customer's APL sale.
3. Sell the token received in step one back into the pool.

The first trade changes the reserves and pushes down the price of APL.

The customer's transaction then executes at a much worse rate, but it cannot revert because it does not specify a minimum acceptable output.

The customer's sale adds a large amount of cheap APL to the pool.

Our final trade buys those apples back.

The customer's slippage becomes our profit.

## Example sandwich

Suppose the APL-CHY pool begins at:

```text
100 APL / 400 CHY
```

We hold 10 APL, and the customer is about to sell 200 APL.

### Front-run

We sell 10 APL:

```text
10 APL -> 37 CHY
```

The reserves become approximately:

```text
110 APL / 363 CHY
```

### Customer trade

The customer sells 200 APL:

```text
200 APL -> 235 CHY
```

The pool becomes:

```text
310 APL / 128 CHY
```

### Back-run

We sell our 37 CHY back:

```text
37 CHY -> 70 APL
```

Our balance changes from:

```text
10 APL
```

to:

```text
70 APL
```

That is a 60-apple profit from a single customer trade.

The attack compounds because the next sandwich can use the larger APL balance.

## Choosing the front-run amount

Since all balances are small integers, I reproduced the DEX formula in Python.

For each customer APL sale, I tested every possible front-run size from zero through my current APL balance.

For each candidate, the simulation performed:

1. my APL sale
2. the customer's APL sale
3. my reverse trade

The candidate that left me with the most APL was selected.

This is fast enough to do live because the search range is tiny.

It also prevents accidentally taking an unprofitable sandwich when a pool becomes too shallow.

## Decoding customer transactions

The Socket.IO event includes the customer's signed approval and swap transactions.

To identify which trades should be sandwiched, I decoded the raw swap transaction.

The target function is:

```solidity
swap(uint256,address,uint256)
```

with selector:

```text
0x43264349
```

The calldata layout is:

```text
4 bytes   function selector
32 bytes  input amount
32 bytes  input token address
32 bytes  deadline
```

For typed Ethereum transactions, I RLP-decoded the envelope and extracted:

```text
to   = fields[5]
data = fields[7]
```

Then I parsed the amount and input token from the calldata.

If the input token was not APL, I simply relayed the customer's approval and swap.

If the input token was APL, I performed the sandwich.

## Transaction flow

The core handler looked roughly like this:

```python
def handle_trade(payload):
    to, data = decode_to_data(payload["swap"])

    if data[:4] != SWAP_SELECTOR:
        return

    input_amount = int.from_bytes(data[4:36], "big")
    input_token = Web3.to_checksum_address(
        data[36:68][-20:]
    )

    if input_token != APL:
        submit(payload["approve"])
        submit(payload["swap"])
        return

    reserve_a, reserve_b = (
        dex.functions.getReserves().call()
    )

    apl_reserve, target_reserve = (
        (reserve_a, reserve_b)
        if token_a == APL
        else (reserve_b, reserve_a)
    )

    front_amount, _ = best_frontrun(
        apl_reserve,
        target_reserve,
        input_amount,
        apl_balance(),
    )

    if front_amount:
        send_my_call(
            dex,
            "swap",
            [front_amount, APL, FAR],
            200_000,
        )

    submit(payload["approve"])
    submit(payload["swap"])

    target_balance = balance(target_token)

    if target_balance:
        send_my_call(
            dex,
            "swap",
            [target_balance, target_token, FAR],
            200_000,
        )

    try_flag()
```

A lock around the Socket.IO handler was also important so that two incoming trades could not interleave and break our nonce ordering.

## Practical details

Several implementation details mattered:

- Read-only Web3 calls went through the JSON-RPC proxy.
- Signed write transactions were sent through `/submit`.
- I pre-approved every DEX to spend both relevant tokens.
- Bot transaction hex strings needed normalization because they did not always include a `0x` prefix.
- The customer approval had to be submitted before the customer's swap.
- My own transaction nonces had to remain strictly ordered.

## Result

The APL balance grew quickly:

```text
Starting balance: 10 APL

200 APL customer sale -> 70 APL
150 APL customer sale -> 206 APL
160 APL customer sale -> 362 APL
 75 APL customer sale -> 436 APL
 80 APL customer sale -> 518 APL
```

After five sandwiches, the manager held more than the required 500 apples.

The `/flag` endpoint returned:

```text
Wow! Here is your flag:
GPNCTF{l0ok_M4m4_1_GO7_s0m3_fruI75_At_My_joB}
```

## Flag

```text
GPNCTF{l0ok_M4m4_1_GO7_s0m3_fruI75_At_My_joB}
```

## Final thoughts

This was a very nice MEV challenge disguised as a miscellaneous task.

The Solidity contract does not contain one dramatic bug. The real weakness comes from combining three design choices:

- customers reveal signed trades before execution
- the coordinator controls inclusion and ordering
- swaps have no minimum output protection

Any one of those might be acceptable in a different trust model. Together, they give the coordinator complete control over customer slippage.

The challenge description even points directly at the broken assumption by emphasizing the coordinator's neutrality.

In a real DEX, a customer would provide a `minAmountOut` based on their acceptable slippage. A front-run that moved the price too far would then cause the customer's swap to revert instead of handing the attacker a guaranteed profit.
