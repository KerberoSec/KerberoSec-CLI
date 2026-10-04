# r3reach Writeup

## TL;DR

The challenge says “reach the flag from far away,” but the trick is that we do **not** need to actually click the flag with extended reach.

The server gives us a `/magic` command that converts downward falling speed into speed in the direction we are looking. So the solve is:

1. Stand far enough away from the flag to satisfy the challenge check.
2. Silently move ourselves just off the platform so gravity builds a lot of downward velocity.
3. Look toward the flag.
4. Run `/magic`, turning the downward velocity into a big sideways shove.
5. Briefly rush into the villager flag and bump it.
6. Immediately packet-warp ourselves far away again before the server checks distance.

That moves the flag while the server still thinks we stayed far away.

Remote flag:

```text
r3ctf{fuTURe_yoU-ReaCheD-Th3-F1ag_4Nd-rETUrnED_it-TO_pR3SeNt_you0}
```

---

## Challenge Summary

The prompt was:

> We all know the classic Minecraft "Reach" hack. For this challenge, we've locked down the server and disabled any form of Reach modifications. Your objective is to interact with the Flag from a distance that should be impossible.

At first this sounds like a Minecraft reach-bypass challenge: maybe send weird interact packets, fake distance, or attack the entity from too far away.

But after reversing the plugin, it turned out to be more of a server-physics and timing challenge.

---

## Important Plugin Behavior

The challenge plugin spawns a villager named `Flag` at:

```text
(0.5, -59, 0.5)
```

The player starts at roughly:

```text
(3.5, -59, 3.5)
```

The important distance rule is:

```java
player.location.distanceSquared(flag.location) > 9.0
```

In plain English: the player must stay **more than 3 blocks away** from the flag.

The plugin also sets the player's normal interaction range to zero, so ordinary clicking is not useful.

The win condition is effectively:

```java
if (distanceValid && flag moved) {
    give flag;
}
```

So the goal is not really “click the villager from far away.” The real goal is:

> Move the villager while the server's distance check still says we stayed far away.

---

## The Weird `/magic` Command

The challenge gives a custom command called `/magic`.

The command does this:

```java
oldVel = player.getVelocity();
d = -oldVel.getY();
player.setVelocity(player.getLocation().getDirection().multiply(d));
runTaskLater(2, () -> player.setVelocity(oldVel));
```

That is a bit technical, but the simple version is:

- If you are falling downward, your Y velocity is negative.
- `/magic` takes that falling speed.
- Then it applies that speed in whatever direction you are looking.

So if we build up falling speed and look toward the flag, `/magic` turns us into a horizontal projectile.

---

## Failed Ideas

Before finding the working path, I tried several more obvious ideas.

### Direct interaction packets

I tried sending attack/interact packets at the villager from far away.

This failed because the plugin sets interaction range to zero, and the flag villager is invulnerable anyway.

### Moving through the villager normally

I tried moving close to the villager and then far away quickly.

This failed because the plugin keeps a sticky boolean called `distanceValid`. Once the player is observed too close, the attempt is dead until `/reset`.

### Vertical movement from below

I tried using `/magic` vertically from below the platform.

This was awkward because the platform blocks the useful upward path, and it did not reliably bump the villager while preserving the distance check.

### Standing near the platform edge

I tried positions that were still on or barely over the platform.

This failed because the player did not accumulate enough downward velocity. The final trick needed the player to be slightly off the platform so gravity could build speed.

---

## The Working Idea

The useful position was:

```text
(4.35, -58.9, 0.5)
```

This position is important because:

- It is more than 3 blocks away from the flag, so the distance check passes.
- It is just off the side of the platform, so gravity can build downward velocity.
- If we look west, `/magic` shoots us toward the flag.

The plan became:

1. Tell the proxy to drop normal client movement.
2. Inject a fake player movement packet to place us at `(4.35, -58.9, 0.5)`.
3. Wait about `4.8` seconds while gravity builds falling velocity.
4. Teleport the client view to the same fake position so the official client agrees.
5. Run `/magic`.
6. Stop dropping movement.
7. Let the official client send a movement packet that bumps the villager.
8. Immediately append another movement packet putting us far away at `(-4.35, -58.9, 0.5)`.

That last step is the key timing trick. The player becomes close only briefly, just long enough for physics to push the villager, then returns far away before the plugin's next distance check catches it.

---

## Local Exploit Sequence

The proxy had helper commands for injecting movement packets. The core sequence looked like this:

```python
ctl('comp 1')
ctl('dropmove 1')
ctl('appendpos off')
ctl('reset')
time.sleep(1.0)

# Put player far away but off the platform.
ctl('posrotid 31 4.35 -58.9 0.5 90 0 0')
time.sleep(4.8)

# When the client sends close movement, append a far-away packet.
ctl('appendposxlt -4.35 -58.9 0.5 1.3 2')

# Sync the client and trigger the magic shove.
ctl('cteleid 9900000')
ctl('ctele 4.35 -58.9 0.5 90 0', 0.010)
ctl('cmd magic', 0.050)
ctl('dropmove 0', 0.005)
```

The timing was slightly flaky, so I made a retry script that tried several delays between `/magic` and releasing movement. Locally, the clean container eventually printed:

```text
[Verifier] GOTFLAG flag{TEST}
```

---

## Remote Solve

For remote, I pointed the same proxy at:

```text
challenge.ctf2026.r3kapig.com:30402
```

Then I ran the same timing attack. The first remote attempt with a `0.050s` `/magic` release delay worked.

The client received the flag through the title/text packet, and the proxy log captured it:

```text
r3ctf{fuTURe_yoU-ReaCheD-Th3-F1ag_4Nd-rETUrnED_it-TO_pR3SeNt_you0}
```

---

## Why This Works

The challenge is trying to enforce:

> You must be far away when the flag moves.

But Minecraft processes movement, collisions, velocity, commands, and plugin checks in specific tick phases.

The exploit abuses that tiny ordering gap:

1. The player starts far away, so `distanceValid` is true.
2. `/magic` gives the player a burst of sideways speed.
3. The player briefly collides with the villager and moves it.
4. A crafted extra movement packet immediately returns the player far away.
5. The challenge plugin sees the villager moved while the player is far away.

So from the plugin's perspective, the player “reached” the flag from impossible distance.

---

## Final Flag

```text
r3ctf{fuTURe_yoU-ReaCheD-Th3-F1ag_4Nd-rETUrnED_it-TO_pR3SeNt_you0}
```
