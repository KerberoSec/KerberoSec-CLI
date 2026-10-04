# Guatemala
> My friend wanted to install an antivirus for his computer, but the creator of the antivirus was caught!

## About the Challenge
We were given a file without any extension (You can download the file [here](AV))

## How to Solve?
Im using `file` command first to know what is the type of the file

*[Image: file]*

As we can see, that file is a GIF file, so I added the `.gif` extension to the file.

*[Image: extension]*

I tried to check the metadata first using `exiftool` command

*[Image: metadata]*

There is a Base64 msg in the `Comment`. Decode it and you will obtain the flag

*[Image: flag]*

```
vishwaCTF{pr073c7_ur_3X1F}
```