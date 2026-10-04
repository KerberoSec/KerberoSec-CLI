# What Lies Within

## Information about the CTF
There's something in the building. Can you retrieve the flag?

## How to solve it
As always i tried running `exiftool` on the file, but nothing interesting showed up. Then i thought about the name of the challenge, and tried to see if i could find anything hidden within the bits, so i used `zsteg` to see if i could find anything. And indeed, i found the flag.

```bash
$ zsteg buildings.png | grep pico
b1,rgb,lsb,xy       .. text: "picoCTF{flag_is_shown_here}"