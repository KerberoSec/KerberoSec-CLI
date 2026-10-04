# Final Zone

This challenge is basically Doom (the game) compiled using emscripten.

## Getting the interesting data

The level doesn't look that interesting, so let's just dump the level data,
which is downloaded from `$WEBSITE/doom.data`.

We need to unpack it, and by looking at the javascript in the page we find
various file names, offsets and sizes.

Here's the unpack script:

```python
info = [
    {"start": 0, "audio": 0, "end": 0, "filename": "/CWSDPMI.SWP"},
    {"start": 0, "audio": 0, "end": 1736, "filename": "/DEFAULT.CFG"},
    {"start": 1736, "audio": 0, "end": 402244, "filename": "/dosdoom.exe"},
    {"start": 402244, "audio": 0, "end": 405632, "filename": "/MISSION.DDF"},
    {"start": 405632, "audio": 0, "end": 531345, "filename": "/DEFAULT.LDF"},
    {"start": 531345, "audio": 0, "end": 534954, "filename": "/SWITCH.DDF"},
    {"start": 534954, "audio": 0, "end": 548215, "filename": "/ATTACKS.DDF"},
    {"start": 548215, "audio": 0, "end": 553930, "filename": "/WEAPONS.DDF"},
    {"start": 553930, "audio": 0, "end": 560965, "filename": "/SOUNDS.DDF"},
    {"start": 560965, "audio": 0, "end": 1025657, "filename": "/DOSDOOM.WAD"},
    {"start": 1025657, "audio": 0, "end": 1027785, "filename": "/ANIMS.DDF"},
    {"start": 1027785, "audio": 0, "end": 1048258, "filename": "/CWSDPMI.EXE"},
    {"start": 1048258, "audio": 0, "end": 1064600, "filename": "/LEVELS.DDF"},
    {"start": 1064600, "audio": 0, "end": 1298034, "filename": "/MISC500.WAD"},
    {"start": 1298034, "audio": 0, "end": 1298091, "filename": "/launch.bat"},
    {"start": 1298091, "audio": 0, "end": 24876811, "filename": "/FDOOM.WAD"},
    {"start": 24876811, "audio": 0, "end": 24878183, "filename": "/SECTORS.DDF"},
    {"start": 24878183, "audio": 0, "end": 24959091, "filename": "/THINGS.DDF"},
    {"start": 24959091, "audio": 0, "end": 24999107, "filename": "/LINES.DDF"}
]

data = open('./doom.data', 'rb').read()
for f in info:
    with open('./doom' + f['filename'], 'wb') as g:
        g.write(data[f['start']:f['end']])
```

We notice the file named `MISC500.WAD`, which is likely the one we need to
inspect.

## MISC500.WAD

Now the "fun" part is to find an editor/extractor/whatever for Doom's WAD files.
Unfortunately, most stuff is not maintained or is for Windows (and doesn't work
well with Wine).
During CTFs I avoid rebooting so I just tried everything until I found
[wadext](https://github.com/coelckers/wadext).

I'm pretty sure that using a proper Doom level editor this would have been
easier and faster, but I did what I had to given that I already wasted enough
time.

So, download `wadext`, compile it with cmake and then `./wadext MISC500.WAD`.

This gives us a bunch of files and directories.
Now, Doom textures are made out of patches, which are just regular images.
By looking inside `patches/` we see some letters that we guess are gonna be
used when showing the flag in the level.

We now need to find what texture uses those patches.
`wadext` creates a set of decompiled textures with this format:

```
WallTexture [...] {
  Patch <name> <offsetX> <offsetY>,
  [...]
}
```

A quick `ack FF` (or `grep`) shows that in `decompiled\textures.1` there's what
we are looking for:

```
WallTexture FWALL, 256, 128
{
	Patch AQCONC16, 0, 0
	Patch AQCONC16, 128, 0
	Patch PO, 62, 14
	Patch PC, 65, 111
	Patch FF, 69, 30
	Patch LL, 79, 30
	Patch GG, 86, 30
	Patch COLON, 94, 28
	Patch RR, 70, 45
	Patch "3", 77, 46
	Patch "3", 99, 92
	Patch B, 85, 44
	Patch E, 92, 44
	Patch L, 98, 44
	Patch S, 104, 44
	Patch F, 68, 58
	Patch U, 82, 58
	Patch D, 97, 58
	Patch MINUS, 106, 60
	Patch AA, 69, 75
	Patch T, 78, 75
	Patch T, 85, 75
	Patch AT, 94, 75
	Patch C, 102, 75
	Patch C, 87, 91
	Patch K, 108, 75
	Patch K, 92, 91
	Patch B, 70, 91
	Patch L, 76, 91
	Patch "0", 81, 92
	Patch "0", 75, 59
	Patch DD, 105, 92
	Patch NN, 90, 59
	Patch KRP, 46, 6
}
```

We can see "FF LL GG" (which stand for uppercase "FLG").

Now, the proper way to show the flag would have been to create a big image and
blit the patches at the proper coordinates in order to reconstruct the original
texture.
Again, this step is probably avoidable when using a Doom editor.

Being as lazy as I am, I hacked together a script to fake the process above
using only a matrix of characters.
There's a problem though: patches are not really aligned to a matrix, so we
cannot simply print the characters in (y, x) order.
Thus, we just divide the y offset by some value and hope to align the
characters along the vertical axis.

Here's the script:

```python
data = """Patch PO, 62, 14
Patch PC, 65, 111
Patch FF, 69, 30
Patch LL, 79, 30
Patch GG, 86, 30
Patch COLON, 94, 28
Patch RR, 70, 45
Patch "3", 77, 46
Patch "3", 99, 92
Patch B, 85, 44
Patch E, 92, 44
Patch L, 98, 44
Patch S, 104, 44
Patch F, 68, 58
Patch U, 82, 58
Patch D, 97, 58
Patch MINUS, 106, 60
Patch AA, 69, 75
Patch T, 78, 75
Patch T, 85, 75
Patch AT, 94, 75
Patch C, 102, 75
Patch C, 87, 91
Patch K, 108, 75
Patch K, 92, 91
Patch B, 70, 91
Patch L, 76, 91
Patch "0", 81, 92
Patch "0", 75, 59
Patch DD, 105, 92
Patch NN, 90, 59"""

asd = [[''] * 200 for i in range(10)]

for l in data.split('\n'):
    _, char, x, y = l.split(' ')
    char = char[:-1]
    x = x[:-1]
    x = int(x)
    y = int(y)
    asd[y // 16][x] = char + ' '

print ''.join([''.join(a) for a in asd])
```

This prints `PO FF LL GG COLON RR "3" B E L S F "0" U NN D MINUS AA T T AT C K B L "0" C K "3" DD PC`.

One could edit the script to print the final flag, but we were 5 minutes from
the end of the CTF so I just transcribed the flag manually:

1. `PO` = `{`
2. `XX` = uppercase `x`
3. `PC` = `}`

The rest is pretty obvious and gives `{FLG:R3belsf0uNd-Att@ckbl0ck3D}`.

