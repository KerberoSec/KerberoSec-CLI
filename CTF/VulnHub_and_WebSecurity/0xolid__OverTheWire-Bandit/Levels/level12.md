# Bandit Level 12

> The password for the next level is stored in the file **data.txt**, which is a hexdump of a file that has been repeatedly compressed. For this level it may be useful to create a directory under /tmp in which you can work. Use mkdir with a hard to guess directory name. Or better, use the command “mktemp -d”. Then copy the datafile using cp, and rename it using mv (read the manpages!)

## Login

```shell
ssh bandit12@bandit.labs.overthewire.org -p 2220

7x16WNeHIi5YkIhWsfFIqoognUTyj9Q4
```

## Solution

```shell
mktemp -d
```

```shell
cd /tmp/tmp.Jw3XQ1hx0S
```

```shell
cp ~/data.txt .
```

```shell
xxd -r data.txt > data2.txt
```

We need to use the command `file` to know what is the tipe of the file then change his extension.

```shell
file data2.txt
mv data2.txt data2.gz
gunzip data2.gz
```

```shell
file data3
mv data3 data3.bz
bunzip2 data3.bz
```

```shell
file data4
mv data4 data4.gz
gunzip data4.gz
```

```shell
file data5
mv data5 data5.tar
tar -xvf data5.tar
```

```shell
file data6.bin
mv data6.bin data6.tar
tar -xvf data6.tar
```

```shell
file data7.bin
mv data7.bin data7.bz
bunzip2 data7.bz
```

```shell
file data8
mv data8 data8.tar
tar -xvf data8.tar
```

```shell
file data9.bin
mv data9.bin data9.gz
gunzip data9.gz 
```

```shell
file data10
cat data10
```

Finally...

```text
FO5dwFsc0cbaIiH0h8J2eUks2vdTDwAn
```

