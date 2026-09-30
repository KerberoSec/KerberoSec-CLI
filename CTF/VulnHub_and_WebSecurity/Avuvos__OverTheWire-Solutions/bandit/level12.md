# Bandit Level 12 -> 13

## Goal

Extract the password from a file that has been repeatedly compressed.

## Key Concept

Hexdump reversal and multiple compression formats (gzip, bzip2, tar).

## Solution

First, create a working directory and copy the file:

```bash
mkdir /tmp/mywork
cp data.txt /tmp/mywork/
cd /tmp/mywork
```

Reverse the hexdump:

```bash
xxd -r data.txt > data.bin
```

Then repeatedly identify and decompress:

```bash
file data.bin          # Check compression type
mv data.bin data.gz    # Rename appropriately
gunzip data.gz         # For gzip
bunzip2 data.bz2       # For bzip2
tar xf data.tar        # For tar archives
```

Repeat until you get a text file with the password.

## Why This Works

- `xxd -r`: reverses a hexdump back to binary
- `file`: identifies compression format
- Different tools handle different formats

The file is nested in multiple compression layers as a teaching exercise.
