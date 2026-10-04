---
authors:
    - Lukas Daubner
date: 16-01-2024
---

# Misc: Deterministic

The challange is presented with a text file containing 3-tuples, and a note saying some important details.

* State 0: 69420
* State N: 999
* Flag ends at state N
* Each character of the password is XORed with a very super secret key

## 3-tuples

So now you must figure out what does the 3-tuples mean. You can notice form the "fake" flag that it is always a number, followed by a label, followed by another number. Then the next line is the same as the 3rd number from previous line.

So maybe the 3rd number is a reference to the next one.

You can test out the hypothesis using the known numbers (69420 and 999)

* Really, you can follow the numbers
* There is no line with "69420" as 3rd number
* There is no line with "999" as 1st number
* The lines repeat a lot, but it seems that the refrences are deterministic (lol)

So, this all looks like an Automata (which hints towards the "Deterministic" name) Let's name the tuple (state, value, next).

Now about the password...

## Values

Now you know that the 2nd number is a value. But it is XORed somehow, so it is gibberish. However, you know something extra:

* The last value (20) XOR key is "}" (125).
* The key is reused for all characters (one-time pad fail)

That allows to reverse the XOR operation to determine the key https://cyberchef.org/#recipe=XOR(%7B'option':'Binary','string':'01101001'%7D,'Standard',false)To_Decimal('Space',false)&input=fQ

So key is: 01101001 (binary) You can try it out on other values if it produces something that makes sense. Especially, locate "HTB{". And it is there! "H" starts at state "0".

## Putting it all together

```
from dataclasses import dataclass

@dataclass
class StateData:
    value: int
    next : int
    state : int

states = {}
# Fill the sctruct
with open("deterministic.txt") as input:
    # The lines with text
    next(input)
    next(input)
    for line in input:
        split = line.split()
        # Filter out the fake flag
        if split[1].isnumeric():
            state = int(split[0])
            value = int(split[1])
            next = int(split[2])
            # Filter out duplicities
            # I need to go from the end (to avoid cycles)
            if next not in states.keys():
                states[next] = StateData(value, next, state)

result = []
key = 0b01101001
# Traverse states from the back
# State "N-1"
next = 999
# Until state which I know that got value "H"
while next != 0: 
    state = states[next]
    decrypted = chr(state.value ^ key)
    result.append(decrypted)
    next = state.state

result.reverse()
print(*result, sep="")
```

And there is the flag!