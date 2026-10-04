```
 __  __  __  _ __  _ _____   _   ___ _   _  ___ _     __ __   
|  \/  \|  \| | _\| |_   _| | | | __| \ / || __| |   /  |__`. 
| -< /\ | | ' | v | | | |   | |_| _|`\ V /'| _|| |_  `7 ||_ | 
|__/_||_|_|\__|__/|_| |_|   |___|___| \_/  |___|___|  |_|__.'
```
The password for the next level is stored in the file `data.txt`, which is a hexdump of
a file that has been repeatedly compressed. For this level it may be useful to create a
directory under `/tmp` in which you can work. Use `mkdir` with a hard to guess directory
name or use the command `mktemp -d`. Copy the datafile using `cp`, and rename it using
`mv`. [^1]

Solution
----------------------------------------------------------------------------------------
First, we create a temporary directionary with a name of our choice in `/tmp/` and then
copy the `data.txt` file into it.

```bash
# 0. Create a temporary directory and copy the file into it; rename it to hexdump because that's what it is
mkdir /tmp/test-dir; cp data.txt /tmp/test-dir; cd /tmp/test-dir; mv data.txt hexdump

# 1. Revert the hex dump into binary, i.e. xxd -reverse hexdump > compressed
xxd -r hexdump compressed

# 2. The compressed file is gzip compressed data, it needs to be renamed accordingly and then decompressed
file compressed; gzip -d compressed
mv compressed compressed.gz; gzip -d compressed.gz

# 3. The resulting file is called compressed again but this time it's file type is bzip2 compressed data
file compressed; bzip2 -d compressed

# 4. Since the original for the compression is not known, bzip2 assumes compressed.out which is gzip itself
file compressed.out; mv compressed.out data4.gz; gzip -d data4.gz

# 5. The data is a POSIX tar archive which in turn contains another POSIX tar archive data5.bin
file data4; tar -xvf data4; file data5.bin; tar -xvf data5.bin

# 6. The data6.bin bzip2 file can be decompressed and then contains a POSIX tar archive data6.bin.out
file data6.bin; bzip2 -d data6.bin;

# 7. We can decompress the POSIX tar archive and get the data8.bin containing gzip compressed data
file data6.bin.out; tar -xvf data6.bin.out; file data8.bin

# 8. After renaming to the file ending for gzip, we get data8.bin, with ASCII text containing the password
mv data8.bin data8.bin.gz; gzip -d data8.bin.gz; file data8.bin; cat data8.bin
```

[^1]: https://overthewire.org/wargames/bandit/bandit13.html
