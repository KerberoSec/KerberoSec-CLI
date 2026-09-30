# Shaken, Not Stirred

```
Difficulty: Beginner
Author: Nissen

After all that cake, I think it's time to sit back, relax, and have a drink 🍸 One vodka martini, please - shaken, not stirred of course!

...Aw man, I just saw the bartender add something strange, I just wanted a good old classic. Wonder if I can demix it and get it out 🤔
```

Attachment:

```python
import random
import sys
import time

### HELPER FUNCTIONS - IGNORE ###
def shake():
    time.sleep(0.5)
    for i in range(15):
        sys.stdout.write(f"    {' ' * (i % 3)}🪇 Shaking 🪇")
        sys.stdout.flush()
        time.sleep(0.1)
        sys.stdout.write("\b" * 20)
        sys.stdout.write(" " * 20)
        sys.stdout.write("\b" * 20)

def printer(s):
    time.sleep(0.5)
    print(s)

### PROGRAM ###
printer("🍸 Welcome to the Martini MiXOR 3000! 🍸\n")

ingredients = [
    "🫗 Vodka",
    "🍾 Dry Vermouth",
    "🫙 Olive Brine",
    "🫒 Olive",
    "🥢 Toothpick",
]

printer("Adding ingredients to the shaker...")
shaker = 0
for ingredient in ingredients:
    # Mix ingredients together
    shaker ^= len(ingredient) * random.randrange(18)
    printer(f"  {ingredient}")

printer("  🏺 Secret ingredient\n")
with open("flag.txt", "rb") as f:
    secret = f.read().strip()
drink = bytes([b ^ shaker for b in secret])

# Shake well!
shake()
shake()
shake()

if all(32 < d < 127 for d in drink):
    printer("Drink's ready! Shaken, not stirred:")
    printer(f"🍸 {drink.decode()} 🍸")
else:
    printer("🫗 Oops! Shook your drink too hard and spilled it 🫗")
```

```
🍸 Welcome to the Martini MiXOR 3000! 🍸

Adding ingredients to the shaker...
  🫗 Vodka
  🍾 Dry Vermouth
  🫙 Olive Brine
  🫒 Olive
  🥢 Toothpick
  🏺 Secret ingredient

Drink's ready! Shaken, not stirred:
🍸 wg`{{pgna}&J{!x&2fJWg`{{&g;;;_!x&fJWg`{{&gh 🍸
```

All bytes are xor-ed using the same key. Brute force:

```python
text = b"wg`{{pgna}&J{!x&2fJWg`{{&g;;;_!x&fJWg`{{&gh"
for ch in range(0, 256):
    s = []
    for byte in text:
        s.append(byte ^ ch)
    if all(32 < d < 127 for d in s):
        print(bytes(s))
```

Get flag: `brunner{th3_n4m3's_Brunn3r...J4m3s_Brunn3r}`
