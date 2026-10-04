# Python Wrangling

## Information about the CTF
Python scripts are invoked kind of like programs in the Terminal... Can you run this Python script using [this password](pw.txt) to get [the flag](flag.txt.en)?

## How to solve it
Run the python script with the -d option and the text file containing the flag. When asked for the password, enter the password from the password file.
```bash
$ python ende.py -d flag.txt.en
Password: 
picoCTF{flag_is_shown_here}
```
