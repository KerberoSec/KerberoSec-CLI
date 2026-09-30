# level 12 

```
ssh bandit12@bandit.labs.overthewire.org -p 2220
```

> ### The password for the next level is stored in the file data.txt, which is a hexdump of a file that has been repeatedly compressed. For this level it may be useful to create a directory under /tmp in which you can work. Use mkdir with a hard to guess directory name. Or better, use the command “mktemp -d”. Then copy the datafile using cp, and rename it using mv (read the manpages!)

```
mktemp -d
mv data.txt /tmp/tmp.L3D46KjqMV
```

> The data.txt file is a hex dump, so we want to return it to binary.

```
xxd -r data.txt > data.gz
```

<img width="637" height="162" alt="image" src="https://github.com/user-attachments/assets/d21200ab-33e4-41a8-a6b3-27168f565d40" />

```
file data.gz
gunzip data.gz
```

<img width="1308" height="139" alt="image" src="https://github.com/user-attachments/assets/8a2dd9bb-7b06-45aa-bdea-b339b5d7dc9e" />

The steps are combined to solve the challenge

------------------------

1\.  **Create a temporary working folder:**

`mktemp -d`

1\.  **Copy the file `data.txt` to the temporary folder:**

`cp data.txt /tmp/your_temp_dir/ cd /tmp/your_temp_dir/ `

1\.  **Convert hexdump to binary:**

`xxd -r data.txt > data.gz`

1\.  **Decompress gzip:**

`gunzip data.gz`

1\.  **Decompress bzip2:**

`bunzip2 data`

1\.  **Check the new file type (tar archive):**

`file data.out`

1\.  **Unpack tar archive:**

`tar -xf data.out`

1\.  **Check the resulting files:**

`ls -l

file *`

1\.  **Repeat decompression depending on the file type:**

-   To unpack tar:

`tar -xf filename`

- To unpack bzip2:

`bunzip2 filename`

-   To unpack gzip with rename if necessary:

`mv filename filename.gz

gunzip filename.gz`

1\.  **When you reach a text file, read it:**

`cat filename`

* * * * *

A brief explanation of each command

-----------------

| The command | Explanation |

| --- | --- |

| `mktemp -d` | Creates a random temporary folder for work |

| `cp` and `cd` | Copy the file and go to the temporary folder |

| `xxd -r` | Converts hexdump to binary file |

| `gunzip` | Decompress gzip files |

| `bunzip2` | Decompress bzip2 |

| `file` | Specifies the file type (text, archive, compressed...) |

| `tar -xf` | Unzip the tar archive |

| `mv` | Renames file |

| `cat` | Displays the content of a text file |

<img width="1277" height="756" alt="image" src="https://github.com/user-attachments/assets/d1cc5369-c4ec-42d7-83e9-1aac1a85f5a2" />

<img width="1276" height="751" alt="image" src="https://github.com/user-attachments/assets/97173859-9891-4f71-b03a-0d01bb99691f" />

<img width="1284" height="388" alt="image" src="https://github.com/user-attachments/assets/ac66b2c2-613f-4f37-a9dc-b8bce299a194" />

```
FO5dwFsc0cbaIiH0h8J2eUks2vdTDwAn
```

