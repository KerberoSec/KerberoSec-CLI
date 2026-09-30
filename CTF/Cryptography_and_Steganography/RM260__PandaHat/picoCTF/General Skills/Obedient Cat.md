#  PicoCTF-2023: Obedient Cat 

## Problem Statement

This file has a flag in plain sight (aka "in-the-clear"). [Download flag](https://mercury.picoctf.net/static/217686fc11d733b80be62dcfcfca6c75/flag).

## Information

**Point Value**: 5 points

**Category**: General Skills

## Hints

1. Any hints about entering a command into the Terminal (such as the next one), will start with a '$'... everything after the dollar sign will be typed (or copy and pasted) into your Terminal.
2. To get the file accessible in your shell, enter the following in the Terminal prompt: $ wget [https://mercury.picoctf.net/static/217686fc11d733b80be62dcfcfca6c75/flag](https://mercury.picoctf.net/static/217686fc11d733b80be62dcfcfca6c75/flag)
3. $ man cat

## Tags

`picoCTF2021`
`General Skills`

## Solution

Copy and paste the terminal prompt : `$ wget https://mercury.picoctf.net/static/2d24d50b4ebed90c704575627f1f57b2/flag`
Place the command "ls" to view the files
View the contents on the file "flag" with the command: `cat flag`
Retrieve the flag and paste it.

## Flag

`picoCTF{s4n1ty_v3r1f13d_f28ac910}`
