# skyblock: SEKAI 2026 CTF

| | |
|---|---|
| **Category** | Miscellaneous (Minecraft) |
| **Difficulty** | Easy |
| **Points** | 50 |
| **Authors** | es3n1n, Pindos |
| **Build help** | SKVLLZ, rainedot, whiteydark |

> Sekai craft got a spinoff, which is... a very cheap version of skyblock!
> We even implemented the automated liquidity offers in `/tradebook` for both buying and selling! I wonder if we priced everything correctly though...
>
> Minecraft version: 26.1.2
> Connection: `skyblock.chals.sekai.team:25565`

## TL;DR

The `/tradebook` liquidity bots will buy a plain **fishing rod** for up to **500,000 coins**. The Fishing Merchant sells that same fishing rod for **100 coins**. Buy two rods (200 coins), dump them on the bot for ~1,000,000 coins, and spend it at the Flag Merchant.

```
fishing rod:  buy @ 100  →  sell @ 500,000   (5000x markup)
2 rods × 100 = 200 coins in  →  ~1,000,000 coins out  →  flag
```

## Reading the challenge

Before touching the server it's worth sitting with the wording, because Misc challenges usually telegraph the intended path in the description. Two phrases stood out:

- **"automated liquidity offers"**: *liquidity* describes how quickly an asset can be converted to cash without moving its market price. So the `/tradebook` has automation (bots) standing by to buy and sell at fixed quotes.
- **"I wonder if we priced everything correctly though..."**: a near-explicit hint that something in that pricing table is wrong.

Put those together and it screams **arbitrage**: if a bot will buy an item for more than you can acquire it for, you have an infinite money glitch. The classic CTF version of this is simply *buy price > sell price* on the same item.

## Recon

Logging in drops you into a small economy world: merchants you can buy from and sell to, a player-facing marketplace, and the `/tradebook` with its liquidity bots. The currency is tradebook coins.

A meaningful chunk of early time went into two things:

1. **Bootstrapping coins.** You need a starting balance to experiment at all. I gathered wheat and seeds and sold them to the **Farm Merchant** to build up an initial stash for trial and error.
2. **Mapping the world.** While exploring I noticed a shop with a **Flag Merchant** selling the flag for **1,000,000 coins**. That set the target: find a way to a million.

### Dead ends

My first instinct was the tiered/custom gear: cactus tools and similar items with bonus stats like extra harvest yield. I burned some time trying to flip those through the tradebook with little success. The challenge framing ("priced everything correctly") pointed away from a grind-the-stats path anyway, so I dropped it.

I also briefly assumed there was a "runner" bot sweeping the top marketplace offers, since some items showed a bid/ask spread. That turned out to be a distraction: the real prize was the bot quotes themselves, not the spread.

## Finding the mispricing

Rather than theorize, I just **listed a wide variety of items** and watched what the bots would pay. Within a bit I had ~15 different items on the marketplace and started recording which ones the automation actually bought and at what ceiling.

That's when it landed. The humble **fishing rod**: purchasable from the **Fishing Merchant for 100 coins**: gets bought by the tradebook automation for as much as **500,000 coins**.

That's a 5000x markup on a trivially restockable item. Exactly the kind of "did we price this correctly?" hole the description was pointing at.

## Exploitation

The loop is dead simple once the mispriced item is known:

1. Earn ~200 coins selling wheat/seeds to the Farm Merchant.
2. Buy **2 fishing rods** from the Fishing Merchant @ 100 each → 200 coins spent.
3. Sell both rods to the `/tradebook` liquidity bot @ ~500,000 each → ~1,000,000 coins.
4. Walk to the Flag Merchant and buy the flag for 1,000,000.

The minimum viable capital really is just **200 coins**: enough for the two rods that convert into the full million. Everything else I'd accumulated was scaffolding for the investigation, not strictly required.

## Flag

Buying the flag from the Flag Merchant prints it straight into the chatbox:

```
SEKAI{sekai-craft-is-back-in-business-:sunglasses:}
```

## Takeaways

A fun one. There's no packet manipulation or memory corruption here: the whole challenge is reading the financial framing of the description (*liquidity*, *priced correctly*), forming the arbitrage hypothesis, and then doing the legwork of probing bot quotes until an item's buy price blows past its acquisition cost. The lesson translates cleanly to real systems: an automated market maker that quotes a price above the cost of producing the underlying asset is a money printer for anyone who notices.
