#  PicoCTF2023: Wave a Flag

## Problem Statement

Can you invoke help flags for a tool or binary? This program has extraordinarily helpful information...

## Information

**Point Value**: 10 points

**Category**: General Skills

## Hints

1. This program will only work in the webshell or another Linux computer.
2. To get the file accessible in your shell, enter the following in the Terminal prompt: $ wget https://mercury.picoctf.net/static/beec4f433e5ee5bfcd71bba8d5863faf/warm
3. Run this program by entering the following in the Terminal prompt: $ ./warm, but you'll first have to make it executable with $ chmod +x warm
4. -h and --help are the most common arguments to give to programs to get more information from them!
5. Not every program implements help features like -h and --help.

## Tags

picoCTF2021 
General Skills

## Solution

Copy and paste the terminal prompt : $ wget 
https://mercury.picoctf.net/static/beec4f433e5ee5bfcd71bba8d5863faf/warm.
Place the command: "cat warm" to view content.
Search the flag within the content.
Retrieve the flag and paste it.

## Flag

picoCTF{b1scu1ts_4nd_gr4vy_616f7182}
