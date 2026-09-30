# <a name="Ohshitherewegoagain"></a>Ohshitherewegoagain

This time we made it easy for us and just started doing something. So we mostly were able to solve the easy challenges but heh we had fun and thats the important part. ＠＾▽＾＠

# <a name="amongus"></a>amongus

 <img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/AngstromCTF_2022/img/amongus.png" alt="amongus" width="50%" height="50%">

As the first challenge we got a tar.gz package with 1000 files which seems on the first glance just to differ based on the name of the file. So we first ran
```console
└─$ md5sum *                                             
56f9fc5e1e5e02492fb9d5e7b8dbe13b  actf{look1ng_f0r_answers_in_the_p0uring_r4in_00b82a142fc1}.txt
56f9fc5e1e5e02492fb9d5e7b8dbe13b  actf{look1ng_f0r_answers_in_the_p0uring_r4in_0b3dfaec90a9}.txt
56f9fc5e1e5e02492fb9d5e7b8dbe13b  actf{look1ng_f0r_answers_in_the_p0uring_r4in_0bad8f058410}.txt
56f9fc5e1e5e02492fb9d5e7b8dbe13b  actf{look1ng_f0r_answers_in_the_p0uring_r4in_0c608487aef8}.txt
56f9fc5e1e5e02492fb9d5e7b8dbe13b  actf{look1ng_f0r_answers_in_the_p0uring_r4in_0c24263013ad}.txt
56f9fc5e1e5e02492fb9d5e7b8dbe13b  actf{look1ng_f0r_answers_in_the_p0uring_r4in_0cb13db7de98}.txt
56f9fc5e1e5e02492fb9d5e7b8dbe13b  actf{look1ng_f0r_answers_in_the_p0uring_r4in_0cd4025ea71b}.txt
```
to see if they are really all the same. So since its 1000 files its to tedious to search for the one different file. Therefor we just grep out the ones which are already duplicates, which results in
```console
└─$ md5sum * | grep -v "56f9fc5e1e5e02492fb9d5e7b8dbe13b"
668cb9edd4cd2c7f5f66bee312bd1988  actf{look1ng_f0r_answers_in_the_p0uring_r4in_b21f9732f829}.txt
```
the one we were searching. Voila nice little challenge for the shell and our first points. (((o(*°▽°*)o)))
P.S: The solution commands were executed in the folder out of the unzipped tar file.

# <a name="Shark1"></a>Shark1

 <img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/AngstromCTF_2022/img/shark1.png" alt="shark1" width="50%" height="50%">

Based on the name and the fact that we get a pcap file its time to bring out wireshark or whatever package inspection tool you like. (o^ ^o)
Once uponed up with wireshark we can see that we have a quite short recording with 27 packages. So you could just search for actf as first part of each Flag which gives you:

 <img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/AngstromCTF_2022/img/shark1_wire.png" alt="shark1_wire" width="50%" height="50%">

But this is too easy. We like to understand the conversation happening so we followed the TCP Stream:

 <img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/AngstromCTF_2022/img/shark1_wire2.png" alt="shark1_wire2" width="50%" height="50%">

which gives us a way easier method to copy paste the flag (ｏ・_・)ノ”(ノ_<、).

# <a name="Shark2"></a>Shark2

 <img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/AngstromCTF_2022/img/shark2.png" alt="shark2" width="50%" height="50%">

Followed by Shark1 we thought why not do Shark2 ? So we did. Again we got a pcap file to work with. So we used the follow TCP Stream method to see if something interesting comes up. Once we went trough the different streams we saw in tcp.stream 1 an interesting message.

 <img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/AngstromCTF_2022/img/shark2_wire.png" alt="shark2_wire" width="50%" height="50%">

So we were pretty sure that the flag is hidden within the next TCP Stream. 

 <img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/AngstromCTF_2022/img/shark2_wire2.png" alt="shark2_wire2" width="50%" height="50%">

So based on words like photoshop which is a image editing program we concluded that its probably a picture what was sent here. But when we checked if we can export the content of a HTTP connection wireshark said "no no there is nothing" (＃＞＜).
So we then googled the file header info a knew then that [JFIF](https://en.wikipedia.org/wiki/JPEG_File_Interchange_Format) is actually something like a jpeg. So the easy way people probably used is just to export the TCP stream in raw format and pingo. But not us we are not so clever ヽ༼௵ل͜௵༽ﾉ.
What we did is used the tool foremost on the pcap file which found also this header in the pcap file and extracted for us the jpeg. Not sure why but the exported one is a bit glitchy so we have unique one.

 <img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/AngstromCTF_2022/img/00000009.jpg" alt="shark2_wire3" width="50%" height="50%">

Another one solved, good run !

# <a name="The Flash"></a>The Flash

 <img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/AngstromCTF_2022/img/theflash.png" alt="theflash" width="50%" height="50%">

Next we moved on and tried next a web challenge. For this challenge we got a website which shows us already the flag format with according to the text is not the right one. But we don't fall for such simple tricks and tried it on the angstrom website. Yeah it was wrong but you never know in times like this with all the misinformation's.
After a closer look we could see that a javascript file is responsible for quickly changing the context of the site and the hint in the exercise also suggest to watch a certain DOM object to get notified when it gets changed and you then can just print out the flag. Too easy.
So first lets have a look on this nice javascript:

```js
const _0x15c166 = _0x43fe;
(function (_0x20ab81, _0xdea176) {
  const _0x3bb316 = _0x43fe,
  _0x25fbaf = _0x20ab81();
  while (!![]) {
    try {
      const _0x58137d = - parseInt(_0x3bb316(212, 'H3tY')) / 1 + - parseInt(_0x3bb316(215, 'nwZz')) / 2 + parseInt(_0x3bb316(225, '%[Nl')) / 3 + parseInt(_0x3bb316(214, 'ub7C')) / 4 * ( - parseInt(_0x3bb316(231, '3RP4')) / 5) + parseInt(_0x3bb316(217, '9V4u')) / 6 + parseInt(_0x3bb316(223, 't*r!')) / 7 * (parseInt(_0x3bb316(207, 'SMMO')) / 8) + parseInt(_0x3bb316(226, '6%rI')) / 9 * (parseInt(_0x3bb316(230, '3RP4')) / 10);
      if (_0x58137d === _0xdea176) break;
       else _0x25fbaf['push'](_0x25fbaf['shift']());
    } catch (_0xa016d7) {
      _0x25fbaf['push'](_0x25fbaf['shift']());
    }
  }
}(_0x4733, 708077));
const x = document['getElementById'](_0x15c166(229, 'q!!U'));
setInterval(() =>{
  const _0x24a935 = _0x15c166;
  Math[_0x24a935(209, '&EwH')]() < 0.05 && (x[_0x24a935(220, '1WY2')] = [
    115,
    113,
    128,
    110,
    137,
    129,
    132,
    65,
    65,
    112,
    139,
    101,
    120,
    67,
    121,
    111,
    101,
    128,
    124,
    65,
    101,
    110,
    120,
    64,
    129,
    124,
    135
  ][_0x24a935(219, 'H3tY')](_0x4cabe2=>String[_0x24a935(216, 'Ceiy')](_0x4cabe2 - 13 ^ 7)) [_0x24a935(224, '1WY2')](''), setTimeout(() =>x[_0x24a935(227, '5HF&')] = _0x24a935(222, '($xo'), 10));
}, 100);
function _0x43fe(_0x297222, _0x4c5119) {
  const _0x47338c = _0x4733();
  return _0x43fe = function (_0x43fe0d, _0x2873da) {
    _0x43fe0d = _0x43fe0d - 207;
    let _0x3df1f6 = _0x47338c[_0x43fe0d];
    if (_0x43fe['jYleOi'] === undefined) {
      var _0x484b33 = function (_0x406fee) {
        const _0x292a9c = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';
        let _0x2734de = '',
        _0x46bc7d = '';
        for (let _0x89c327 = 0, _0x3d5185, _0x35bd82, _0x15d96e = 0; _0x35bd82 = _0x406fee['charAt'](_0x15d96e++); ~_0x35bd82 && (_0x3d5185 = _0x89c327 % 4 ? _0x3d5185 * 64 + _0x35bd82 : _0x35bd82, _0x89c327++ % 4) ? _0x2734de += String['fromCharCode'](255 & _0x3d5185 >> ( - 2 * _0x89c327 & 6)) : 0) {
          _0x35bd82 = _0x292a9c['indexOf'](_0x35bd82);
        }
        for (let _0x4f3ab1 = 0, _0x2b4484 = _0x2734de['length']; _0x4f3ab1 < _0x2b4484; _0x4f3ab1++) {
          _0x46bc7d += '%' + ('00' + _0x2734de['charCodeAt'](_0x4f3ab1) ['toString'](16)) ['slice']( - 2);
        }
        return decodeURIComponent(_0x46bc7d);
      };
      const _0x4cabe2 = function (_0x302eb2, _0x32783d) {
        let _0x1fbce8 = [
        ],
        _0x4d57b4 = 0,
        _0x3fd440,
        _0x49491b = '';
        _0x302eb2 = _0x484b33(_0x302eb2);
        let _0x582ee5;
        for (_0x582ee5 = 0; _0x582ee5 < 256; _0x582ee5++) {
          _0x1fbce8[_0x582ee5] = _0x582ee5;
        }
        for (_0x582ee5 = 0; _0x582ee5 < 256; _0x582ee5++) {
          _0x4d57b4 = (_0x4d57b4 + _0x1fbce8[_0x582ee5] + _0x32783d['charCodeAt'](_0x582ee5 % _0x32783d['length'])) % 256,
          _0x3fd440 = _0x1fbce8[_0x582ee5],
          _0x1fbce8[_0x582ee5] = _0x1fbce8[_0x4d57b4],
          _0x1fbce8[_0x4d57b4] = _0x3fd440;
        }
        _0x582ee5 = 0,
        _0x4d57b4 = 0;
        for (let _0xbf0a0b = 0; _0xbf0a0b < _0x302eb2['length']; _0xbf0a0b++) {
          _0x582ee5 = (_0x582ee5 + 1) % 256,
          _0x4d57b4 = (_0x4d57b4 + _0x1fbce8[_0x582ee5]) % 256,
          _0x3fd440 = _0x1fbce8[_0x582ee5],
          _0x1fbce8[_0x582ee5] = _0x1fbce8[_0x4d57b4],
          _0x1fbce8[_0x4d57b4] = _0x3fd440,
          _0x49491b += String['fromCharCode'](_0x302eb2['charCodeAt'](_0xbf0a0b) ^ _0x1fbce8[(_0x1fbce8[_0x582ee5] + _0x1fbce8[_0x4d57b4]) % 256]);
        }
        return _0x49491b;
      };
      _0x43fe['aheYsv'] = _0x4cabe2,
      _0x297222 = arguments,
      _0x43fe['jYleOi'] = !![];
    }
    const _0x2eb7bc = _0x47338c[0],
    _0xc73dee = _0x43fe0d + _0x2eb7bc,
    _0x2f959a = _0x297222[_0xc73dee];
    return !_0x2f959a ? (_0x43fe['nusGzU'] === undefined && (_0x43fe['nusGzU'] = !![]), _0x3df1f6 = _0x43fe['aheYsv'](_0x3df1f6, _0x2873da), _0x297222[_0xc73dee] = _0x3df1f6) : _0x3df1f6 = _0x2f959a,
    _0x3df1f6;
  },
  _0x43fe(_0x297222, _0x4c5119);
}
function _0x4733() {
  const _0x562851 = [
    'j2nrWRvPfbn7',
    'rKDEx8oeW6m',
    'gSk4WQlcVCkOteCxq8kaiCo8',
    'WPDTt8oVWPxcHNHdq8oWW5RcISob',
    'W5z6vfL8Emk2fKyqh0S',
    'ACobWQHmW63cTCksDrldUu7dSbm',
    'ASofW6OnWQddTSoYFq',
    'WPXcixtdT0PpW6fnbKLx',
    'cSoyW41jW7bYWRrkW6BcGmoUWQm',
    'Fe0yy2ZcQqFdHmoNe8oIAHe',
    'W4zFo1iOuZVcMqXmW7Hu',
    'WOOIfW',
    'W63cLSobW5pcUYGnWP/cGW',
    'FGhdPdFcVCk7aCkucmoIewi',
    'FXD/WR0/lCk3WOhdPuuLnZVdOYjEo8k6CderudKhnZHw',
    'lqdcImkwW5JcTCoi',
    'W67cL8ogW5G',
    'tSoTjd1mdSoXyfT7DKDq',
    'WOpcSCo0WOtdJmkngSoPBNdcUfq',
    'WPVcOHtdQ8oHWPaAxta',
    'tttcLCkuWPZcPGxcJmkcWRxdTqZdHq',
    'pSooW7hdGqu',
    'WRxcUmkFgJpdVCoMW7Oo',
    'WRBcVmkzxLtcISkDW6aujqdcUmke',
    'gCktWR3dV8kaW7/dPrHCoCkLqmo9'
  ];
  _0x4733 = function () {
    return _0x562851;
  };
  return _0x4733();
}
```
Yeah way to complex to deobfuscate it for an easy challenge. So based on the fact that i have bad Screen with some delays in the framerate why not just use that to make a video to see what the value would be ♡＾▽＾♡.

https://user-images.githubusercontent.com/87261585/167305971-ffec2fc2-eb18-4455-8d00-22c2f328d910.mp4

<video width="75%" height="75%" controls>
  <source src="https://user-images.githubusercontent.com/87261585/167305971-ffec2fc2-eb18-4455-8d00-22c2f328d910.mp4" type="video/mp4">
  https://user-images.githubusercontent.com/87261585/167305971-ffec2fc2-eb18-4455-8d00-22c2f328d910.mp4
</video>

Just to make it easy for everyone we caught it right at 5 seconds so for mplayer it would be:

 <img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/AngstromCTF_2022/img/theflash2.png" alt="theflash2" width="50%" height="50%">

And for everyone who does not want to type it out: actf{sp33dy_l1ke_th3_fl4sh} . That's not the intended way but way funnier.

# <a name="Baby3"></a>Baby3

 <img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/AngstromCTF_2022/img/baby3.png" alt="baby3" width="50%" height="50%">

So we were given a file that according to the creators does nothing. Instead of real reverse engineering we just started with the strings command to see if the flag is in plain text already present.
```console
└─$ strings chall
/lib64/ld-linux-x86-64.so.2
?;W(
__cxa_finalize
__libc_start_main
__stack_chk_fail
libc.so.6
GLIBC_2.2.5
GLIBC_2.4
GLIBC_2.34
_ITM_deregisterTMCloneTable
__gmon_start__
_ITM_registerTMCloneTable
PTE1
u3UH
actf{emhH <-- whats this hmmm
paidmezeH
rodollarH
stomaketH
hischallH
enge_amoH
gus}
;*3$"
GCC: (GNU) 11.2.0
abi-note.c
__abi_tag
init.c
crtstuff.c
deregister_tm_clones
__do_global_dtors_aux
completed.0
__do_global_dtors_aux_fini_array_entry
frame_dummy
__frame_dummy_init_array_entry
chall.c
__FRAME_END__
_DYNAMIC
__GNU_EH_FRAME_HDR
_GLOBAL_OFFSET_TABLE_
__libc_start_main@GLIBC_2.34
_ITM_deregisterTMCloneTable
_edata
_fini
__stack_chk_fail@GLIBC_2.4
__data_start
__gmon_start__
__dso_handle
_IO_stdin_used
_end
__bss_start
main
__TMC_END__
_ITM_registerTMCloneTable
__cxa_finalize@GLIBC_2.2.5
_init
.symtab
.strtab
.shstrtab
.interp
.note.gnu.property
.note.gnu.build-id
.note.ABI-tag
.gnu.hash
.dynsym
.dynstr
.gnu.version
.gnu.version_r
.rela.dyn
.rela.plt
.init
.text
.fini
.rodata
.eh_frame_hdr
.eh_frame
.init_array
.fini_array
.dynamic
.got
.got.plt
.data
.bss
.comment
```
As you can see we were already lucky. We just needed to put these together and voila we had the flag actf{emhpaidmezerodollarstomakethischallenge_amogus}.
So this way was a bit to easy so we wanted to understand what happens and actually nothing happens. The program just loads the flag into the memory and then exits. As you can see here:

 <img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/AngstromCTF_2022/img/baby31.png" alt="baby31" width="50%" height="50%">

# <a name="Number Game"></a>Number Game

 <img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/AngstromCTF_2022/img/numbergame.png" alt="numbergame" width="50%" height="50%">

Again another little tool for us to challenge and once we have it we can check the solution on the server. So [binary ninja](https://cloud.binary.ninja/) as suggested does a great job but [ghidra](https://ghidra-sre.org/) were already booted:

 <img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/AngstromCTF_2022/img/numbergame1.png" alt="numbergame1" width="50%" height="50%">

The static analysis does a great job and we can see what we need to do in order to get the flag for convenience here is the decompiled code with some comments:

```C
undefined8 main(void)

{
  int iVar1;
  undefined8 uVar2;
  size_t sVar3;
  char local_58 [72];
  int local_10; <- was unassigned as integer but based on the read_int() function call it was quite clear it had to be an int
  int local_c; <- was unassigned as integer but based on the read_int() function call it was quite clear it had to be an int
  
  puts("Welcome to clam\'s number game!");
  printf("Step right up and guess your first number: ");
  fflush(stdout);
  local_c = read_int();
  if (local_c == 314159265) { <- we know that local_c is an int so this is an int check and we can convert the hex value in an int
    printf("That\'s great, but can you follow it up? ");
    fflush(stdout);
    local_10 = read_int();
    if (local_10 + local_c == 513371337) { <- we know that local_10 + local_c is an int so this is an int check and we can convert the hex value in an int
      puts("That was the easy part. Now, what\'s the 42nd number of the Maltese alphabet?");
      getchar();
      fgets(local_58,0x40,stdin); <- takes our input
      sVar3 = strcspn(local_58,"\n"); <- cuts out the \n when we click enter 
      local_58[sVar3] = '\0';
      iVar1 = strcmp(local_58,"the airspeed velocity of an unladen swallow"); <- is the string it compares to as the last solution
      if (iVar1 == 0) {
        puts("How... how did you get that? That reference doesn\'t even make sense...");
        puts("Whatever, you can have your flag I guess.");
        print_flag();
        uVar2 = 0;
      }
      else {
        puts("Ha! I knew I would get you there!");
        uVar2 = 1;
      }
    }
    else {
      puts("Sorry but you didn\'t win :(");
      uVar2 = 1;
    }
  }
  else {
    puts("Sorry but you didn\'t win :(");
    uVar2 = 1;
  }
  return uVar2;
}
```
Based on the comments above we concluded the following entry's in order for the flag:

1. 314159265 first number
2. 314159265 + x = 513371337 -> x = 199212072 second number
3. "the airspeed velocity of an unladen swallow" third number without quotes

Which brings us
```console
└─$ nc challs.actf.co 31334
Welcome to clam's number game!
Step right up and guess your first number: 314159265
That's great, but can you follow it up? 199212072
That was the easy part. Now, what's the 42nd number of the Maltese alphabet?
the airspeed velocity of an unladen swallow
How... how did you get that? That reference doesn't even make sense...
Whatever, you can have your flag I guess.
actf{it_turns_out_you_dont_need_source_huh}
```
You could also create an easy script for that but meh was okay when you copy fast enough the answers o(^▽^)o

# <a name="uninspired"></a>uninspired

 <img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/AngstromCTF_2022/img/uninspired.png" alt="uninspired" width="50%" height="50%">

So for this challenge we actually used binary ninja as a starting point.

 <img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/AngstromCTF_2022/img/uninspired1.png" alt="uninspired1" width="50%" height="50%">

So we can already see that we have a loop and some if clauses here. So for better reading, we put the output here with our comments:

 <img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/AngstromCTF_2022/img/uninspired2.png" alt="uninspired2" width="50%" height="50%">

So the rest of the binary we did not figured out to what the loop is for. Probably we could have but meh we tought why not programm a brute forcer for this ? Maybe not the best idea if you have to guess a 10 digit number. So we did:

```python
#!/usr/bin/python

import sys
from pwn import *

runvar = int(sys.argv[1])
checksolution = ("yay I\'m inspired now, have a flag :)\n").encode('utf-8')
endrunvar = runvar + 1125000000

elf = ELF('./uninspired')

while runvar < endrunvar:

    io = elf.process()

    print(io.recvline(timeout=2))

    sendvar = (str(runvar) + "\n").encode('utf-8')

    io.sendline(sendvar)

    print (runvar)

    if io.recvline(timeout=2) == checksolution:
        print(runvar)
        break
    else:
        print("nope")

    io.close()

    runvar = runvar + 1

print("welcome to the end")
```
So you can see that we made the script in mind to run on multiple cores. Since we let it run for 10 minutes we saw that this will maybe not work out ((┌|o^▽^o|┘))♪ . We also saw that despite we closed the binary all the time we had a memory leakage issue here too. So in the end we did not solved the task.
But after this CTF we found a writeup by TheBadGod [https://github.com/TheBadGod/Angstrom22-Writeups/tree/main/uninspired](https://github.com/TheBadGod/Angstrom22-Writeups/tree/main/uninspired) which brought us the solution 6210001000. So we put that number into our script and it worked ( ・・)つ-●●●.

```console
└─$ ./solution_multirun.py 6210000999
[*] 'uninspired'
    Arch:     amd64-64-little
    RELRO:    Partial RELRO
    Stack:    No canary found
    NX:       NX enabled
    PIE:      PIE enabled
[+] Starting local process 'uninspired': pid 2469
b"there's no more inspiration :(\n"
6210000999
[*] Process 'uninspired' stopped with exit code 1 (pid 2469)
nope
[+] Starting local process 'uninspired': pid 2471
b"there's no more inspiration :(\n"
6210001000
[*] Process 'uninspired' stopped with exit code 0 (pid 2471)
6210001000
welcome to the end
```
So we got the solution number too which brings us the flag:

```console
└─$ ./uninspired                     
there's no more inspiration :(
6210001000
yay I'm inspired now, have a flag :)
actf{ten_digit_numbers_are_very_inspiring}
```

# <a name="Conclusion"></a>Conclusion

We had some solves and we also had some fun. Maybe this helps someone who stucked at the start to get ideas, for us it was a nice CTF. Thank you angstrom team for the nice 2 to 3 hours.
