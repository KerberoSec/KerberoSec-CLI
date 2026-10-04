Solved by Ethck

> Ogres are like files: they have layers!

Given: file called shrek.jpg

At first I thought it was a Stego problem, but it wasn’t.
After using the binwalk command, I found a 7z file was attached to the file.
Then used dd to extract the file from the jpg. This revealed the following, in order:

> Tar.gz
> Cpio
> Lzma
> Ar
> Bzip2
> Xz
> Flag file

