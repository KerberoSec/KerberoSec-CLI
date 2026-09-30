```
 ____  _____ _     _  _      ____    _____ _     _____   ____  ____ _____ _      _____ ____ 
/  __\/  __// \ /|/ \/ \  /|/  _ \  /__ __Y \ /|/  __/  / ___\/   _Y  __// \  /|/  __// ___\
| | //|  \  | |_||| || |\ ||| | \|    / \ | |_|||  \    |    \|  / |  \  | |\ |||  \  |    \
| |_\\|  /_ | | ||| || | \||| |_/|    | | | | |||  /_   \___ ||  \_|  /_ | | \|||  /_ \___ |
\____/\____\\_/ \|\_/\_/  \|\____/    \_/ \_/ \|\____\  \____/\____|____\\_/  \|\____\\____/
```
After struggling to secure our secret strings for a long time, we finally figured out
the solution to our problem: Make decompilation harder. [^1]

It should now be impossible to figure out how our programs work!
-----------------------------------------------------------------------------------------
First, we verify that the downloaded ZIP file has the correct SHA-256 check sum with the
sha256sum -c command. Then, we extract the ZIP archive with the given password and are
prompted with a *Executable and Linkable Format* (ELF) binary file. First, we apply the
`strings` command and discover the format of the flag "HTB{%s}". Then, we run the binary
in a controlled environment and notice, that we are missing a password. Therefore, we
power up Ghidra [^2] and analyze the file automatically. Next, we search for strings and
click on the string "./challenge <password>" which leads us to machine code listing for
this register followed by a suspicious character allocation. So, we set the data to the
data type *string* and thus see the phrase "Itz\0_0n\0Ly_\0UD2\0> HTB{%s}" that probably
contains the password to print the HTB flag. We suspect the backslash zero delimiter to
be a NULL character, which can be disregarded. Therefore, we can suspect the password
to be "Itz_0nLy_UD2" and indeed, if we run the binary again with this string, we are
given the flag for this challenge.

[^1]: https://app.hackthebox.com/challenges/Behind%2520the%2520Scenes?tab=play_challenge
[^2]: https://ghidra-sre.org/
