# **Wizardlike: 500 pts**

### Key points

- Binary Patching

---

## **Contents**

- [Overview](#overview)
- [Decompiling with Ghidra](#decompiling-with-ghidra)
- [Patching in Radare2](#patching-in-radare2)
- [Getting the flag](#getting-the-flag)

---

## Overview

### Description

> Do you seek your destiny in these deplorable dungeons? If so, you may want to look elsewhere. Many have gone before you and honestly, they've cleared out the place of all monsters, ne'erdowells, bandits and every other sort of evil foe. The dungeons themselves have seen better days too. There's a lot of missing floors and key passages blocked off. You'd have to be a real wizard to make any progress in this sorry excuse for a dungeon!

> 'w', 'a', 's', 'd' moves your character and 'Q' quits. You'll need to improvise some wizardly abilities to find the flag in this dungeon crawl. '.' is floor, '#' are walls, '<' are stairs up to previous level, and '>' are stairs down to next level.

Looks like we have a little game here. Upon running the game, we are presented with exactly what the description outlined: several levels with walls, and we play as a "wizard" controlled by the `wasd` keys.

An important thing to note is that there appears to be a line of sight feature. Moving to certain places reveals more of the map. On each floor, it appears that there is a section unaccessible to us, as it is separated by either walls and/or whitespace.

The hints suggest Ghidra and Radare2, and an interesting tip:

> _With the right focus and preparation, you can teleport to anywhere on the map._

---

## Decompiling with Ghidra

`__libc_start_main` calls `FUN_0010185b`, which looks like our main function.

This part checks our key input:

```c
if (iVar5 == 0x51) {        // Q - quit game
    bVar1 = false;
}
else if (iVar5 == 0x77) {   // w - move up
    FUN_0010166b();
}
else if (iVar5 == 0x73) {   // s - move down
    FUN_001016e7();
}
else if (iVar5 == 0x61) {   // a - move left
    FUN_00101763();
}
else if (iVar5 == 100) {    // d - move right
    FUN_001017df();
}
```

Nothing vulnerable here.

Let's go into one of the move functions. When we press `w`, `FUN_0010166b();` is called.

```c
void FUN_001016e7(void)

{
  char cVar1;

  cVar1 = FUN_001015ac(DAT_0011fe70,DAT_0011fe74 + 1);
  if (cVar1 != '\0') {
    if ((DAT_0011fe9c / 2 <= DAT_0011fe74) && (DAT_0011fe74 <= 99 - DAT_0011fe9c / 2)) {
      DAT_0011fe94 = DAT_0011fe94 + 1;
    }
    DAT_0011fe74 = DAT_0011fe74 + 1;
  }
  return;
}
```

Hmm. It looks like `cVar1`, the return value of `FUN_001015ac()` must not be 0 in order for us to move. `FUN_001015ac` checks the character in the direction we are trying to move, and it is in all the move functions. Let's take a closer look at `FUN_001015ac`.

```c
{
  undefined8 uVar1;

  if ((((param_1 < 100) && (param_2 < 100)) && (-1 < param_1)) && (-1 < param_2)) {
    if (((&DAT_0011fea0)[(long)param_2 * 100 + (long)param_1] == '#') ||
       ((&DAT_0011fea0)[(long)param_2 * 100 + (long)param_1] == ' ')) {
      uVar1 = 0;
    }
    else {
      uVar1 = 1;
    }
  }
  else {
    uVar1 = 0;
  }
  return uVar1;
}
```

Aha! The important thing here that it is a simple `if` statement to check if the next tile is `'#'` or `' '`. If that is true, then `0` is returned, and we will not be able to move into that tile. Otherwise, `1` is returned.

Since we want to be able to access the rest of the map, we want to be able to move across gaps and through walls. Time to patch!

---

## Patching in Radare2

Run Radare2 with write privileges:

```console
$ r2 -w ./game
[0x00001140]>
```

Analyze:

```console
> aaaa
[Cannot find function at 0x00001140 sym. and entry0 (aa)
[x] Analyze all flags starting with sym. and entry0 (aa)
[x] Analyze function calls (aac)
[x] Analyze len bytes of instructions for references (aar)
[x] Check for objc references
[x] Check for vtables
[x] Type matching analysis for all functions (aaft)
[x] Propagate noreturn information
[x] Use -AA or aaaa to perform additional experimental analysis.
[x] Finding function preludes
[x] Enable constraint types analysis for variables
```

Show functions:

```console
> afl
0x00001170    4 41   -> 34   fcn.00001170
0x0000122d    7 100          fcn.0000122d
0x00001295    7 157          fcn.00001295
0x00001336   30 630          fcn.00001336
0x000015b0   10 187          fcn.000015b0
0x0000166f    6 120          fcn.0000166f
0x000016eb    6 120          fcn.000016eb
0x00001767    6 120          fcn.00001767
0x000017e3    6 120          fcn.000017e3
0x0000185f   67 1931         fcn.0000185f
```

The function we are looking for is `FUN_001015ac`, which appears to be `fcn.000015b0` here. Let's seek it:

```console
> s fcn.000015b0
[0x000015b0]>
```

Open visual mode:

```console
> V
```

Press `p` to switch over to dissasembly view.

There are two lines we are interested in:

```console
0x00001618      3c23        cmp al, 0x23
```

and...

```console
0x00001652      3c20        cmp al, 0x20
```

These instructions compare the tile we are trying to move into to `0x23` (the Hex code for `'#'`) and `0x20` (the Hex code for `' '`). Let's replace these with some other character, such as `0x3f` (`'?'`).

Scroll down until `0x00001618` is lined up to the top of the screen (the yellow text should say `0x00001618`). Type `A` (shift + a) to enter write mode.

Type:

```console
> cmp al, 0x3f
```

Press enter, and then type `y` to save when r2 asks for confirmation.

Repeat this for the second instruction at `0x00001652`.

Once we have finished, press `q` to exit visual mode, and `q` to exit r2.

We have successfully patched the binary!

---

## Getting the flag

Some have said that reading the ASCII art for the flag is actually harder than the reversing part. Let's see...

Level 1:

```
#########
#.......#  ......#...................................
#.......#  ....................####.#####.#####..###.
#........  .####.#..###..###..#.......#...# .....#...
#.......#  .#  #.#.#....#   #.#.......#...###...#....
#.......#  .####.#.#....#   #.#.......#...#......#...
#.......#  .#....#..###..###...####...#...#......###.
#.......#  .#........................................
#...@...#  ..........................................
#.......#
#.......#
#.......#
#.......#
#.......#
#......>#
#########
```

Flag: `picoCTF{`

Level 2:

```
#####. .............................................................
#.<.#. ...............#..#.............##.......#..#........#.......
#...#. .#..#.###......#..#.......#...#..#.####..#..#.###....#.......
#...#. .#..#.#........####.......#.#.#..#...#...####.#...####.......
#...#. .####.#...####....#.#####..#.#..###.####....#.#...####.#####.
  .    .............................................................
  .    .............................................................
  .    .............................................................
#....
#...#   @
#...#
#...#
#...#
#...#
#.>.#
#####
```

Flag: `picoCTF{ur_4_w1z4rd_`

Level 3:

```
#################   .......
#<..............#.  .#   #.
#...............#.. .#   #.
#........@.....#.....#####.
#...#.......#...#.. .....#.
#..###.....###..#.  .....#.
#...#...#...#...#   .......
#......#>#......#   .......
#...............#
#...#.......#...#
#..###.....###..#
#...#.......#...#
#...............#
#...............#
#...............#
#################
```

Flag: `picoCTF{ur_4_w1z4rd_4`

Level 4:

```
...             ..  .......
.<.          ####.  ..###..
...          ...#.. .#...#.
...          ...#.....###..
             ..>#.. .#...#.
        @    ####.  ..###..
                ..  .......
                    .......
```

Flag: `picoCTF{ur_4_w1z4rd_48`
(The `#`s next to the 8 are not a character, just walls)

Level 5:

```
########################
#<.............#.......#
#..............#.#...#.#
#..............#.#...#.#
#..............#.#####.#
#..............#.....#.#
#..........@...#.....#.#
#..............#.......#
#..............#.......#
########################

################
#..............#
#..............#
#..............#
#..............#
#..............#
#..............#
#..............#
#.............>#
################
```

Flag: `picoCTF{ur_4_w1z4rd_484`

Level 6:

```
.......
.<.....
.......
.......
.......
.......
.......
.......
.......
.......
...@...
.....>.
.......
#######
.......
.#...#.
.#...#.
.#####.
.....#.
.....#.
.......
.......
```

Flag: `picoCTF{ur_4_w1z4rd_4844`

Level 7:

```
...
.<.........
...........
...      ..
         ..
         ..
         ..
         ..
         ..
         ..
   ..............
   ..##########..
   .#          #.
   .#  ....... #.
   .#  ..###.. #.
   .#  .#...#. #.
   .#  .#####. #.
   .#  .#...#. #.
   .#  .#...#. #.
   .#  ....... #.
   .#  ....... #.
   .#          #@
   ..##########..
   .............>
```

Flag: `picoCTF{ur_4_w1z4rd_4844A`

Level 8:

```
#########################
#<#......#.#.......###..#
#.#.###..#.#.......##..##
#.#.#.#..#.#.......#..###
#.#.#.#..#.#.......#...##
#...#....#..#......#....#
#.######.##..###.###....#
#.#.....................#
#.###.#################.#
#.......................#
#########.###.#########.#
#.......#@#.#.#.........#
#.####..#.#...#.#########
#.#...#.#.#.#.#.........#
#.#...#.#.#.#.#########.#
#.#...#.#.#.#.#.........#
#.####..#.#.#.#.#########
#.......#.#.#.#.........#
#.......#.#.#.#########.#
#########.#.#.#...#...#.#
#...........#.#.#.#.#.#.#
#########...#.#.#.#.#.#.#
#.......#...#.#.#.#.#.#.#
####.####...#.#.#.#.#.#.#
##..........#.#.#.#.#.#.#
#.#..####...#.#.#.#.#.#.#
#..#....#####.#.#.#.#.#.#
#...# . #...#.#.#...#...#
#....#........#.#########
#...........#.#........>#
########################.
```

Flag: `picoCTF{ur_4_w1z4rd_4844AD`

(The `D` is in the room on the left)

Level 9:
This level is too big to show, but there is a 6 at the top right.

Flag: `picoCTF{ur_4_w1z4rd_4844AD6`

Level 10:
This level is a giant screen of hidden walls, so you just have to fly around until you find the last characters. They're on the right, around halfway down.

---

## Flag

> `picoCTF{ur_4_w1z4rd_4844AD6F}`
