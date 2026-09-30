#  PicoCTF-2023: Magikarp Ground Mission

## Problem Statement

Do you know how to move between directories and read files in the shell? Start the container, `ssh` to it, and then `ls` once connected to begin. Login via `ssh` as `ctf-player` with the password, `ee388b88`
Additional details will be available after launching your challenge instance.

## Information

**Point Value**: 30 points

**Category**: General Skills

## Hints

1. Finding a cheat sheet for bash would be really helpful!

## Tags

`picoCTF2021` 
`General Skills`

## Solution

Copy and paste the terminal prompt : “ssh ctf-player@venus.picoctf.net -p 54021”
Input the password provided
Place the command "ls" to view the files
View the contents on the file "1of3.flag.txt" with the command: "cat 1of3.flag.txt"
Retrieve the first part of the flag
View the contents on the file "instructions-to-2of3.txt" with the command: "cat instructions-to-2of3.txt"
Place the command “cd /” to back to root directory 

Place the command "ls" to view the files
View the contents on the file "2of3.flag.txt" with the command: "cat 2of3.flag.txt"
Retrieve the second part of the flag
View the contents on the file "instructions-to-3of3.txt" with the command: "cat instructions-to-3of3.txt"
Place the command “cd ~” to back to home directory

Place the command "ls" to view the files
View the contents on the file "3of3.flag.txt" with the command: "cat 3of3.flag.txt"
Retrieve the last part of flag
Combine the parts of the flag and paste it.

## Flag

`picoCTF{xxsh_0ut_0f_\/\/4t3r_3ca613a1}`
