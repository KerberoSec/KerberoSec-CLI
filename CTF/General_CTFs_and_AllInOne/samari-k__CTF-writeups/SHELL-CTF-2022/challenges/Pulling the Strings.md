# Pulling The Strings

Category: Reversing

> Can you please feed me something? Flag Format: SHELLCTF{}

---

We got an executable which wanted to be fed with something. The title of this challenge misled me, as I thought I will just have to pull `strings` but that did not come up with anything interesting. So I tried to have a look at it's behaviour in `radare2` This is what the disasseambled main function looked like:

At **(1)** it asks us for food. At **(2)** (actually a bit below) it reads our input and at **(3)** it moves the flag into a register to compare it to our input. So flag would have to be there readable in the memory. I set a breakpoint after the `call sym.imp.fgetws` and another before the `call sym.imp.wcscmp` and continued to the first breakpoint.

I fed it with a bunch of A's and had a look at the register memory.

There were the eight A's from my input. So I continued to the next breakpoint and had another look at the register memory.

And there it was, the flag, almost perfectly readable.
