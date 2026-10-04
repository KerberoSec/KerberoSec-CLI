# Bandit: OVERTHEWIRE

##### This is a basic ctf by overthewire, wargames catagory. This writeup is userfull beginner friendly. Follow the link for extra details.

**Here is the [link](https://overthewire.org/wargames/bandit/) to ctf**

### Note:
>1. My host operating system is debian, so if you are using window install [putty](https://putty.org/) to continue but better to use any linux base os on virtualbox or any vitualization technology if you don't know follow the [link](https://youtu.be/qH8Igk2wF9o).
>2. What i will showing can be done by million other way. So open your eye while following the writeup.
>3. If you what to continue on windows machine then install [pentestbox](https://pentestbox.org/). Pentestbox is hacking tool for windows where you can run most of the command that i will showing.

#### Bandit: Level 0

![bandit level-0](https://i.imgur.com/zJMHSFJ.png)

- Open terminal 
- Read the content of the page.

#### Bandit: Level 0->1

![bandit level-0->1](https://i.imgur.com/LpCDx2S.png)

- Type command `ssh bandit.labs.overthewire.org -p 2220 -l bandit0`
- Type the password `bandit0`
- As mention the password for next level store in readme, use `cat readme`
- Copy the password `boJ9jbbUNNfktd78OOpsqOltutMc3MY1`
- Type `exit`

**SSH more info: [link1](https://youtu.be/qWKK_PNHnnA), [link2](https://youtu.be/hQWRp-FdTpc)**

**cat more info: [link1](https://linuxize.com/post/linux-cat-command/)**

#### Bandit: Level 1->2

![bandit level-1->2](https://i.imgur.com/WXRVSFp.png)

- Type command `ssh bandit.labs.overthewire.org -p 2220 -l bandit1`
- Type the password `boJ9jbbUNNfktd78OOpsqOltutMc3MY1`
- To read: file. Type command `cat ./-`
- Copy the password `CV1DtqXWVFXTvM2F0k09SHz0YwRINYA9`
- Then type `exit`

#### Bandit: Level 2->3

![bandit level-2->3](https://i.imgur.com/f3wlJ5p.png)

- Type command `ssh bandit.labs.overthewire.org -p 2220 -l bandit2`
- Type the password `CV1DtqXWVFXTvM2F0k09SHz0YwRINYA9`
- To read type `cat 'spaces in this filename'`
- Copy the password `UmHadQclWmgdLOKQ3YNgjWxGoRMb5luK`
- Then type `exit`

#### Bandit: Level-3->4

![bandit level-3->4](https://i.imgur.com/g0G20io.png)

- Type command `ssh bandit.labs.overthewire.org -p 2220 -l bandit3`
- Type the password `UmHadQclWmgdLOKQ3YNgjWxGoRMb5luK`
- Type `cd inhere` to enter inhere directory and then type `ls -a` to check for hidden file.
- Type `cat .hidden`
- Copy the password `pIwrPrtPN36QITSp3EQaw936yaFoFgAB`
- Then type `exit`

#### Bandit: Level-4->5

![bandit level4->5](https://i.imgur.com/OkrllKP.png)

- Type command `ssh bandit.labs.overthewire.org -p 2220 -l bandit4`
- Type the password `pIwrPrtPN36QITSp3EQaw936yaFoFgAB`
- Type `cd inhere` to enter inhere directory and then type `ls` to check for files or directorys.
- Type `cat ./*`
- Copy the password `koReBOKuIDDepwhWk7jZC0RTdopnAYKh`
- Then type `exit`

#### Bandit: Level-5->6

![bandit level4->5](https://i.imgur.com/02VHSoW.png)

- Type command `ssh bandit.labs.overthewire.org -p 2220 -l bandit5`
- Type the password `koReBOKuIDDepwhWk7jZC0RTdopnAYKh`
- Type `cd inhere` to enter inhere directory and then type `ls` to check for files or directory.
- So hints are given that file will be 'human-readable,
1033 bytes in size,
not executable'
- Using `find` command we findout the right file
- `find . -type f -size 1033c -exec cat {} \;` is collective command to find it practically.
- Copy the password `DXjZPULLxYr17uwoI01bNLQbtFemEgo7`
- Then type `exit`

**Find more info: [link1](http://man7.org/linux/man-pages/man1/find.1.html)**

#### Bandit : Level-6->7

![bandit level6->7](https://i.imgur.com/c7ls7ro.png)

- Type command `ssh bandit.labs.overthewire.org -p 2220 -l bandit6`
- Type the password `DXjZPULLxYr17uwoI01bNLQbtFemEgo7`
- Type `ls` to check for files or directory.
- So hints are given that file will be 'owned by user bandit7
owned by group bandit6
33 bytes in size'
- Using `find` command we findout the right file
- `find / -user bandit7 -group bandit6 -size 33c -exec cat {} \; 2>/dev/null` is collective command to find it practically.
- Copy the password `HKBPTKQnIay4Fw76bEy8PVxKEDQRKTzs`
- Then type `exit`

**/dev/null more info: [link1](https://youtu.be/pIL5LZQn3W8)**

#### Bandit : Level-7->8

![bandit7->8](https://i.imgur.com/ChMVSZb.png)

- Type command `ssh bandit.labs.overthewire.org -p 2220 -l bandit7`
- Type the password `HKBPTKQnIay4Fw76bEy8PVxKEDQRKTzs`
- As the hint is given that password contain in `data.txt` has in same line as 'millionth'
- `cat data.txt | grep "millionth"` will find out the password
- Copy the password `cvX2JJa4CFALtqS87jk27qwqGhBM9plV`
- Then type `exit`

#### Bandit : Level-8->9

![bandit8->9](https://i.imgur.com/m8lzxwE.png)

- Type command `ssh bandit.labs.overthewire.org -p 2220 -l bandit8`
- Type the password `cvX2JJa4CFALtqS87jk27qwqGhBM9plV`
- Use command `cat data.txt | sort | uniq -c` and find the line which have `1` beginning.
- Copy the password `UsvVyFSfZZWbi6wgC7dAFyFuR6jQQUhR`
- Then type `exit`

#### Bandit : Level-9->10

![bandit9->10](https://i.imgur.com/q3by5mR.png)

- Type command `ssh bandit.labs.overthewire.org -p 2220 -l bandit9`
- Type the password `UsvVyFSfZZWbi6wgC7dAFyFuR6jQQUhR`
- Use `string data.txt` to find the password
- Copy the password `truKLdjsbJ5g7yyJ2X2R0o3a5HQJFuLk`
- Then type `exit`

**strings more info: [link1](https://youtu.be/wBoc0vJTCaM)**

#### Bandit : Level-10->11

![bandit10->11](https://i.imgur.com/syAWMu2.png)

- Type command `ssh bandit.labs.overthewire.org -p 2220 -l bandit10`
- Type the password `truKLdjsbJ5g7yyJ2X2R0o3a5HQJFuLk`
- Use command `cat data.txt | base64 -d`
- Copy the password `IFukwKGsFW8MOq3IRFqrxE1hxTNEbUPR`
- Then type `exit`