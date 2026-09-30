# Secret of the Polyglot

## Description

The Network Operations Center (NOC) of your local institution picked up a suspicious file, they're getting conflicting information on what type of file it is. They've brought you in as an external expert to examine the file. Can you extract all the information from this strange file?
Download the suspicious file [here](https://artifacts.picoctf.net/c_titan/97/flag2of2-final.pdf).

## Hints

- This problem can be solved by just opening the file in different ways

## Solution

First, open the file with its current format(pdf). you'll get this.

1n_pn9_&_pdf_724b1287}

so we have second part of the flag. now let's check the file a bit more using ```file``` command.

```shell
file flag2of2-final.pdf
flag2of2-final.pdf: PNG image data, 50 x 50, 8-bit/color RGBA, non-interlaced
```

As you can see, it's actually a PNG image. so open it as a picture this time.

Congrats! you found the flag.
