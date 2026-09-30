# The USB That Wouldn't Repeat

**Category:** Forensics **Flag:** `grodno{09817bced4213360c1cb2749aa375523_2bdab2c08b5b507876bf2f2d7e548cc5}`

## TL;DR

Don't overthink it. The hashes were sitting in plain text the whole time: FTK Imager writes them into its own log file every time it acquires an image. No hex-diffing, no SCSI-command archaeology required (even though the challenge really wants you to think you need it).

## The setup

The zip drops you into a genuinely interesting piece of digital forensics folklore: a cheap Transcend USB flash drive that returns _non-deterministic_ garbage for any sector that's never been written to, instead of the null bytes everyone expects. Turns out the drive is lazy: when it gets a SCSI `READ(10)` for an unwritten sector, it just echoes back the bytes of the read _command itself_ as if they were the sector's data. Read the same sector twice without writing to it, and Linux (which randomizes the command tag per request) will give you different bytes every time. Windows reuses the same tag until you unplug the drive, which is why the two Windows runs needed a physical disconnect/reconnect between them to actually produce different hashes.

Cool story. Cute rabbit hole. Not actually needed to solve the challenge.

## What's in the archive

```
digitalcorpora/
├── linux-dc3dd/
│   ├── flash-firstrun.dd
│   ├── flash-firstrun.log
│   ├── flash-secondrun.dd
│   └── flash-secondrun.log
└── windows7-ftkimager/
    ├── flash-firstrun.001
    ├── flash-firstrun.001.txt      <-- this
    ├── flash-secondrun.001
    ├── flash-secondrun.001.txt     <-- and this
    ├── ftk-imager-screenshot.png
    ├── usb-1
    └── usb-2
```

The challenge asks specifically for the two **FTK Imager** acquisitions (not the Linux `dc3dd` ones), so `windows7-ftkimager/` is the folder that matters.

## Finding the hashes

FTK Imager, like most acquisition tools, writes a companion `.txt` report next to every image it creates: case info, drive geometry, acquisition timestamps, and critically, a `[Computed Hashes]` section with the MD5/SHA1 it calculated during acquisition.

```bash
cat flash-firstrun.001.txt
```

```
[Computed Hashes]
 MD5 checksum:    09817bced4213360c1cb2749aa375523
 SHA1 checksum:   879b25099a3179f8e9dcdf4a8384a3b5b75c92f7
```

```bash
cat flash-secondrun.001.txt
```

```
[Computed Hashes]
 MD5 checksum:    2bdab2c08b5b507876bf2f2d7e548cc5
 SHA1 checksum:   9ecf9934d17f1d3953d43d59b0d237a8b560916e
```

That's it. That's the whole challenge.

## Double-checking

Since the `.001` files are also just sitting in the archive, it costs nothing to sanity-check the log against reality:

```bash
$ md5sum flash-firstrun.001 flash-secondrun.001
09817bced4213360c1cb2749aa375523  flash-firstrun.001
2bdab2c08b5b507876bf2f2d7e548cc5  flash-secondrun.001
```

Matches perfectly. Good: the "non-deterministic sectors" story explains why the _two runs_ differ from each other, not why a log file would ever lie about the image it just wrote.

## Flag

```
grodno{md5_first_md5_second}
grodno{09817bced4213360c1cb2749aa375523_2bdab2c08b5b507876bf2f2d7e548cc5}
```

## Lesson learned

Cool background reading (seriously, the SCSI `READ(10)` echo behavior is a fun bit of USB mass storage trivia: worth a look if you're into that), but as an "easy" challenge the actual ask was just: _go read the tool's own log file before you reach for a hex editor._
