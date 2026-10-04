# GoodBoy

We download the `.gb` file and we don't even need to use `file` to understand
what we have to do: download a GameBoy emulator.

## Finding out what we are supposed to do

The difficulty in this challenge was mainly about understanding what the
organizers wanted us to do.
The GameBoy game itself is pretty lame and there's not much one can do.

Anyway, let's use [BGB](http://bgb.bircd.org/) as our emulator, because I know
it works well with Wine and has a decent debugging interface
(shout out to
[TheZZAZZGlitch](https://www.youtube.com/channel/UCKlA7qF9XKwu79ULYmVu28w),
who created
[one of the best GB challenges ever created by a human mind](https://www.youtube.com/watch?v=66cw8NiSxR4)).

The first idea we had was to use the cheat engine to find regions of the RAM
that increased when a point was scored.

Nope. Didn't work.
We still managed to find some interesting addresses in memory, like the bullet
offsets on screen.

Time for the second approach: Z80/GameBoy reference manual and IDA Pro.

## Messing around in IDA

Unfortunately, IDA's support for Z80 is far from ideal so you have to do
some things manually.

Protip: `Options > General > Disassembly > Auto comments` for some help if your
Z80 asm is rusty.

We now needed to find the game's main loop.
This took some trial and errors using breakpoints in BGB, so the we can't
document the process properly.

Still, the main ideas are two:

1. When we shoot the ball on the screen, the text `REPLY` is showed for
   some seconds. We find that string in BGB's memory and setup a breakpoint on
   memory access. This will let us break in the middle of the routine used to
   show text on the screen.
2. Look for code that reads the joystick and buttons' state.
   This information is memory mapped at address `0xFF00`.

By using the first idea and then stepping out of functions for some time, we
reached the main loop at offset `0x091C` in the ROM.
It should be noted that we manually created code regions in IDA using the "c"
shortcut on stuff that looked like code.

The second idea was a bit more difficult to execute since IDA didn't set up
cross references correctly.
With some manual "o" pressing and using textual search (slow!) we managed to
find the input reading routine, which is actually called from the main loop.

At this point we wasted several hours thinking what could possibly hide a flag
in this huge mess of Z80 asm code.

## Seeing the light

After "investing" some time to understand the code by using a mix of BGB and
IDA, we figured out which basic blocks in the main CFG were responsible of
the different parts of the game logic.

Still no clue as to where to find a flag.

Some time around 5am CEST, the Magnificent Steiner took possession of my
flu-ridden body.
Ok, sorry for this obscure reference, I just read Monster by Naoki Urasawa...
Not too bad, but far from the overly positive comments you read online
if you ask me.

Anyway, my tired eyes started staring at the basic block at `0x09F3`.
I already inspected it earlier and I didn't think much of it, but then I
remembered something weird about it.

In fact, it calls a function located at `0x052A` which reads the input state
again.
And that sounded a bit suspicious: why check for the input again if the code
already took care of the game logic?

The first 4 basic blocks at `0x052A` check for particular key presses.

Now, I can't give you the real keypresses as they would need to be done on a
real GameBoy.
I can't because I was brainless at that point and so I just mapped the emulator
keys to input values.

But basically:

```
0x052A checks for "S" (BGB's mappings)
0x0536 checks for the left arrow
0x0549 checks for the down arrow
0x0553 checks for "A" (BGB's mappings)
```

If you press all those button together, stand on a single foot, turn around and
listen to Aphex Twin while praying the Lord, you should see the flag:
`{FLG:W3iRd_M@ch7n3_URL}`.

## Some final remarks

I, `babush`, am sorry for this really bad writeup.
I hope you understand that my sanity level was very low when I solved this.
Documenting the process properly is quite difficult.

I think that this challenge turned out to be more difficult than it was meant to
be, given that after many hours we were just the second team to solve it.
My opinion is that the size of the code to analyze, together with having no clue
as to what we were supposed to do, proved overkill.
A disassembler with proper Z80 support would have helped a lot.
My Binary Ninja license has expired and I wouldn't touch radare even if I was
paid to do it, so...

Curious to read other writeups about this challenge.

