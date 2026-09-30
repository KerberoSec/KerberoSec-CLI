# Python Wrangling Writeup

Don't be scared to try this CTF if you don't have any Python experience! It's made to be simple for begginers to get their feet wet because Python scripts are VERY common in the cybersecurity field to do many different jobs. In fact, many of your favorite tools are probably written with Python!

Ok enough talking, let's start by getting all the files we need for this CTF:

- Python script: `wget https://mercury.picoctf.net/static/325a52d249be0bd3811421eacd2c877a/ende.py`

- Password: `wget https://mercury.picoctf.net/static/325a52d249be0bd3811421eacd2c877a/pw.txt`

- Flag: `wget https://mercury.picoctf.net/static/325a52d249be0bd3811421eacd2c877a/flag.txt.en`

If you were curious enough to try and open `flag.txt.en` you would get this beautiful thing:

`gAAAAABgUAIWIvSiR0W23DAHIK5DX6Y4BvwES94M_XdDcNAquhp-A0D2z8n812YEXaSD9WhoweBh2cm5Wa0cqzuW0Kc7fOct0OJnpOmVF8A91j0Hx4dKtvk3l5ghPT71Y7GxErPRyJUsnull`

Which doesn't make any sense as expected... looks like we need to decode it using the Python script.

But first let's do `cat pw.txt` to get the password: `ac9bd0ffac9bd0ffac9bd0ffac9bd0ff`

To execute the Python script we do `python ende.py` which presents us with the options `-d` and `-e` to decode or encode respectively.

We want to decode so we do `python ende.py -d flag.txt.en` and it asks for the password, after inputting it we'll finally get: `picoCTF{4p0110_1n_7h3_h0us3_ac9bd0ff}`.

And that's our flag!