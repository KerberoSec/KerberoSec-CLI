Another simple challenge, right!
![Bandit4](https://github.com/sreekesari-vangeepuram/overthewire/blob/master/overthewire/bandit/bandit4/level4-%3Elevel5.png)

By following the `Level Goal` of Bandit Level 4 → Level 5;
we got the password of user[bandit5] as shown below.

```
bandit4@bandit:~$ ls
inhere
bandit4@bandit:~$ cd inhere/
bandit4@bandit:~/inhere$ ls
-file00  -file01  -file02  -file03  -file04  -file05  -file06  -file07  -file08  -file09
bandit4@bandit:~/inhere$ cat ./*
�/`2ғ�%��rL~5�g��� �������p,k�;��r*��	�.!��C��J	�dx,�e�)�#��5��
                                                                       ��p��V�_���ׯ�mm������h!TQO�`�4"aל�߂phT��,�Ai�4�ו$����I&������c���?��r�l$�?h�9('���!y�e�#�x�O��=��ly���~��A�f����-E�{���m�����ܗMkoReBOKuIDDepwhWk7jZC0RTdopnAYKh
�T�?�i��j��îP�F�l�n��J����{��@�e�0$�in=��_b�5FA�P7sz��gNbandit4@bandit:~/inhere$ 
bandit4@bandit:~/inhere$ strings ./*
!TQO
koReBOKuIDDepwhWk7jZC0RTdopnAYKh
bandit4@bandit:~/inhere$
```

New command `strings` is used here to solve this challenge. Let's see where it's used and how it's used;
```
$ strings --help
Usage: strings [option(s)] [file(s)]
 Display printable strings in [file(s)] (stdin by default)
 The options are:
  -a - --all                Scan the entire file, not just the data section [default]
  -d --data                 Only scan the data sections in the file
  -f --print-file-name      Print the name of the file before each string
  -n --bytes=[number]       Locate & print any NUL-terminated sequence of at
  -<number>                   least [number] characters (default 4).
  -t --radix={o,d,x}        Print the location of the string in base 8, 10 or 16
  -w --include-all-whitespace Include all whitespace as valid string characters
  -o                        An alias for --radix=o
  -T --target=<BFDNAME>     Specify the binary file format
  -e --encoding={s,S,b,l,B,L} Select character size and endianness:
                            s = 7-bit, S = 8-bit, {b,l} = 16-bit, {B,L} = 32-bit
  -s --output-separator=<string> String used to separate strings in output.
  @<file>                   Read options from <file>
  -h --help                 Display this information
  -v -V --version           Print the program's version number
strings: supported targets: elf64-x86-64 elf32-i386 elf32-iamcu elf32-x86-64 pei-i386 pei-x86-64 elf64-l1om elf64-k1om elf64-little elf64-big elf32-little elf32-big pe-x86-64 pe-bigobj-x86-64 pe-i386 srec symbolsrec verilog tekhex binary ihex plugin
Report bugs to <https://bugs.archlinux.org/>
```

From the challenge statement: `The password for the next level is stored in the only human-readable file in the inhere directory`!

So, generally `strings` command is used when we deal with files which are not in human-readable format such as binary.

COOL, right!

Hope you've learnt something new from this [if you don't know this before/didn't strike for to during the start].

Now, let's use the password `koReBOKuIDDepwhWk7jZC0RTdopnAYKh` to log into the remote-machine as `bandit5`.

**Warning: Please, first try Level 5 -> Level 6! Otherwise it's useless to simply cpy-pst the command[s]/password[s].
