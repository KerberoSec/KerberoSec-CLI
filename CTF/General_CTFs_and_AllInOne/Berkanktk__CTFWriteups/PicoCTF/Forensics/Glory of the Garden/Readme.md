# Glory of the Garden

## Information about the CTF
This garden contains more than it seems.

## How to solve it
First i tried to see if i could get anything from the metadata using `exiftool`, but sadly nothing interesting showed up.

Next i tried looking at the image in a hex editor, using hexedit in linux. Everything looked file for a JFIF file, so i decided searching for the flag in the file by hitting CTRL + W and choosing `search for text string`. Here i tried for the word `pico`, and luckily a flag showed up between the `00230560` `00230590` offsets.

This probably also meant that i simply could have used the strings command to find the flag, so i also tried that. And indeed, the flag was there.

```bash	
$ strings garden.jpg | grep pico
Here is a flag "picoCTF{flag_is_shown_here}"
```

