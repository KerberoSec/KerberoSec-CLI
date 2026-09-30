#  PicoCTF-2023: Python Wringling

## Problem Statement

Python scripts are invoked kind of like programs in the Terminal... Can you run this Python script using this password to get the flag?

## Information

**Point Value**: 10 points

**Category**: General Skills

## Hints

1. Get the Python script accessible in your shell by entering the following command in the Terminal prompt: $ wget https://mercury.picoctf.net/static/5c4c0cbfbc149f3b0fc55c26f36ee707/ende.py
2. $ man python

## Tags

picoCTF2021 
General Skills

## Solution

Copy and paste the terminal prompt : 
```
$ wget 
https://mercury.picoctf.net/static/5c4c0cbfbc149f3b0fc55c26f36ee707/ende.py
https://mercury.picoctf.net/static/5c4c0cbfbc149f3b0fc55c26f36ee707/pw.txt
https://mercury.picoctf.net/static/5c4c0cbfbc149f3b0fc55c26f36ee707/flag.txt.en
```

Place the command `ls` to view the files
View the contents on the file `pw.txt` with the command: `cat pw.txt`
Copy the password on the file `pw.txt`
Place the command “python ende.py -d flag.txt.en” to run the Python script and decrypt the file `flag.txt.en`
Paste the password required by `ende.py`
Retrieve the flag and paste it.

## Flag

picoCTF{4p0110_1n_7h3_h0us3_192ee2db}
