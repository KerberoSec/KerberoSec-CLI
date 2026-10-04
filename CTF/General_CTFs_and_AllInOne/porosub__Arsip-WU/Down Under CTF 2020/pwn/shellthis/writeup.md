# Binary Exploitation

| Binary Exploitation  |
| ------------- |
| [Shell this (100 pts)](#shell-this-100-pts)|

## Shell this! (100 pts)

### Soal:
Somebody told me that this program is vulnerable to something called remote code execution?
I'm not entirely sure what that is, but could you please figure it out for me?
nc chal.duc.tf 30002

### Pembahasan:
diberikan file. pertama kami cek terlebih dahulu. didapatkan file ELF 64-bit, dan not stripped. informasi lebih lanjut:
```
shellthis: ELF 64-bit LSB executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, for GNU/Linux 3.2.0, BuildID[sha1]=ea93e2cb9c3a5f24ceeb30507a30155e04758666, with debug_info, not stripped
```
karena judul soal ada kata kunci shell, jadi kami berasumsi kalau flag didapatkan kalau kita berhasil eksploitasi shell. langkah berikut kami mencoba untuk cek security pada file, didapatkan kalau NX diaktifkan :( informasi lebih lanjut:
```
	Arch:     amd64-64-little
    RELRO:    Partial RELRO
    Stack:    No canary found
    NX:       NX enabled
    PIE:      No PIE (0x400000)
```
kita lihat source code. ternyata ada fungsi `gets` itu adalah bug dimana tidak ada pengecekan ukuran. lalu didalam program tidak ada pemanggilan shell sama sekali :( 
 
kami mencoba eksploitasi dengan cara mengisi buffer lalu overwrite ebp dan menambahkan return address `/bin/sh` pada program.
```
RAX: 0x7fffffffdff0 ("AAA%AAsAABAA$AAnAACAA-AA(AADAA;AA)AAEAAaAA0AAFAAbAA1AAGAAcAA")
RBX: 0x0 
RCX: 0x7ffff7f9b980 --> 0xfbad208b 
RDX: 0x0 
RSI: 0x7ffff7f9ba03 --> 0xf9e680000000000a 
RDI: 0x7ffff7f9e680 --> 0x0 
RBP: 0x4147414131414162 ('bAA1AAGA')
RSP: 0x7fffffffe030 --> 0x400750 (<__libc_csu_init>:	push   r15)
RIP: 0x41416341 ('AcAA')
R8 : 0x7fffffffdff0 ("AAA%AAsAABAA$AAnAACAA-AA(AADAA;AA)AAEAAaAA0AAFAAbAA1AAGAAcAA")
R9 : 0x0 
R10: 0xfffffffffffff24c 
R11: 0x246 
R12: 0x4005a0 (<_start>:	xor    ebp,ebp)
R13: 0x0 
R14: 0x0 
R15: 0x0
```
terlihat bahwa RIP teroverwrite. kita cari offset didapatkan 56. jadi kita bisa mengontrol RIP.
berikut penyelesaian dari kami [klik disini](https://github.com/ahm4ddm/Arsip-WU/tree/binary/Down%20Under%20CTF%202020/pwn/shellthis/solver.py)
<details>
<summary>Flagnya</summary>
DUCTF{h0w_d1d_you_c4LL_That_funCT10n?!?!?}
</details>
