# CHALLENGE: LOG HUNT

**DIFFICULTY:** EASY

**LINK:** [LOG HUNT](https://play.picoctf.org/practice/challenge/527?category=5&originalEvent=77&page=1)

## DESCRIPTION
Our server seems to be leaking pieces of a secret flag in its logs. The parts are scattered and sometimes repeated. Can you reconstruct the original flag?
Download the [logs](https://challenge-files.picoctf.net/c_amiable_citadel/49cec6157142f24a599f4164d5b63322c2494f801390d6f22eb91b3aa592bc66/server.log) and figure out the full flag from the fragments.

## STEPS/SOLUTION

1. Download the log file in the picoCTF webshell, by using `wget https://challenge-files.picoctf.net/c_amiable_citadel/49cec6157142f24a599f4164d5b63322c2494f801390d6f22eb91b3aa592bc66/server.log`. Those who are using their own machine, or virtual machine, can donwnload the file by directly clicking the logs link.
2. This challenge is pretty easy and is easily solvable by using the cat command, which stands for concatenate.
3. But simply using the cat command won't display the fully constructed flag and it will display the whole file, from which it is a tiresome process to filter out the flag. `grep` command has to be used to show only the required text of the file.
4. grep stands for Global Regular Expression Print. It is used for searching text for lines that match a regular expression.
5. Syntax is `cat <filename> | grep <pattern>`. Here, '|' is called pipe, it takes the output of one comand (left of the pipe), and sends it as the input to another command (right of the pipe).
6. Now that the syntax is learnt, the correct command is, `cat server.log | grep "pico"`. But as the whole flag is broken into several parts and is stored in many lines, this will only return the first part of the flag.
7. If properly noticed, each line is having this particular word, 'FLAGPART'. So the revised command would be, `cat server.log | grep "FLAGPART"`.
8. Running this command prints around 30 lines containing all the flag segments in the correct order. Some fragments may repeat: collect only the unique ones and assemble them in sequence.
9. Combine the unique parts to form the complete flag and submit it to finish the challenge.
