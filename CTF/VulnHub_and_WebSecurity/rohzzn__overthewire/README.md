
<p>
  <a href="https://github.com/Calatop/OverTheWire/wiki/Bandit" target="_blank">
    <img align="center" src="https://user-images.githubusercontent.com/47408756/132019775-582c5d22-c469-4ab0-b2d4-3ded59807c03.png" alt="Bandit" />
  </a>
</p>

## Level 0

The goal of this level is for you to log into the game using SSH. The host to which you need to connect is bandit.labs.overthewire.org, on port 2220. The username is bandit0 and the password is bandit0. Once logged in, go to the Level 1 page to find out how to beat Level 1.
```
ssh bandit0@bandit.labs.overthewire.org -p 2220
Password: bandit0
```
![image](https://user-images.githubusercontent.com/47408756/129326145-3e736463-2e7f-45e8-8bc6-e532c2a5e2d0.png)

## Level 0: Level 1
The password for the next level is stored in a file called readme located in the home directory. Use this password to log into bandit1 using SSH. Whenever you find a password for a level, use SSH (on port 2220) to log into that level and continue the game.
```
ssh bandit0@bandit.labs.overthewire.org -p 2220
Password: boJ9jbbUNNfktd78OOpsqOltutMc3MY1
```
![image](https://user-images.githubusercontent.com/47408756/129327009-be170199-084b-426d-b77c-b9caf032f2aa.png)

## Level 1: Level 2
The password for the next level is stored in a file called: located in the home directory
```
ssh bandit0@bandit.labs.overthewire.org -p 2220
Password: CV1DtqXWVFXTvM2F0k09SHz0YwRINYA9
```
![image](https://user-images.githubusercontent.com/47408756/129328159-8f3b498d-a2d0-4860-af10-ef801cc0d306.png)

## Level 2: Level 3
The password for the next level is stored in a file called spaces in this filename located in the home directory
```
ssh bandit1@bandit.labs.overthewire.org -p 2220
Password: CV1DtqXWVFXTvM2F0k09SHz0YwRINYA9
```
![image](https://user-images.githubusercontent.com/47408756/129329018-7a4cb1c2-005a-4b89-86d8-7eee931b1d4d.png)

## Level 3: Level 4
The password for the next level is stored in a hidden file in the inhere directory.
```
ssh bandit3@bandit.labs.overthewire.org -p 2220
Password: UmHadQclWmgdLOKQ3YNgjWxGoRMb5luK
```
![image](https://user-images.githubusercontent.com/47408756/129329450-94e02aab-db93-4e4d-ad9f-2ef0a6eabb34.png)

## Level 4: Level 5
The password for the next level is stored in the only human-readable file in the inhere directory. Tip: if your terminal is messed up, try the “reset” command.
```
ssh bandit4@bandit.labs.overthewire.org -p 2220
Password: pIwrPrtPN36QITSp3EQaw936yaFoFgAB
```
![image](https://user-images.githubusercontent.com/47408756/129329758-195cb9a4-12a7-4b79-9b80-ad1ec9f3e8b7.png)

## Level 5: Level 6
The password for the next level is stored in a file somewhere under the inhere directory and has all of the following properties:
<br>
human-readable
<br>
1033 bytes in size
<br>
not executable
```
ssh bandit5@bandit.labs.overthewire.org -p 2220
Password: koReBOKuIDDepwhWk7jZC0RTdopnAYKh
```
![image](https://user-images.githubusercontent.com/47408756/129330082-b16bf928-ed1e-4e6b-992e-3f222cd539dc.png)

## Level 6: Level 7
The password for the next level is stored somewhere on the server and has all of the following properties:
<br>
owned by user bandit7
<br>
owned by group bandit6
<br>
33 bytes in size
```
ssh bandit6@bandit.labs.overthewire.org -p 2220
Password: DXjZPULLxYr17uwoI01bNLQbtFemEgo7
```
![image](https://user-images.githubusercontent.com/47408756/129330543-aab3fe37-64f3-41e1-b294-86268aa256ff.png)
<br>
![image](https://user-images.githubusercontent.com/47408756/129330569-90f0e53a-5cd3-4178-bf37-a57f9a9a146e.png)
<br>
![image](https://user-images.githubusercontent.com/47408756/129330662-b316cbec-b13d-44b3-9a46-e2d905ec6680.png)

## Level 7: Level 8
The password for the next level is stored in the file data.txt next to the word millionth
```
ssh bandit7@bandit.labs.overthewire.org -p 2220
Password: HKBPTKQnIay4Fw76bEy8PVxKEDQRKTzs
```
![image](https://user-images.githubusercontent.com/47408756/129331646-cc5f7467-79f6-473a-952e-cf4720e5eacc.png)
<br>
![image](https://user-images.githubusercontent.com/47408756/129332049-1508ed8f-7e31-433a-bd8f-f5359ea89b49.png)

## Level 8: Level 9
The password for the next level is stored in the file data.txt and is the only line of text that occurs only once
```
ssh bandit8@bandit.labs.overthewire.org -p 2220
Password: cvX2JJa4CFALtqS87jk27qwqGhBM9plV
```
![image](https://user-images.githubusercontent.com/47408756/129332460-a154381c-82d6-4ed8-8bb2-e172d1ca132e.png)

## Level 9: Level 10
The password for the next level is stored in the file data.txt in one of the few human-readable strings, preceded by several ‘=’ characters.
```
ssh bandit9@bandit.labs.overthewire.org -p 2220
Password: UsvVyFSfZZWbi6wgC7dAFyFuR6jQQUhR
```
![image](https://user-images.githubusercontent.com/47408756/129332898-6a8f1dc0-6ec7-47a0-85a4-ebd115304a44.png)

## Level 10: Level 11
The password for the next level is stored in the file data.txt, which contains base64 encoded data
```
ssh bandit10@bandit.labs.overthewire.org -p 2220
Password: truKLdjsbJ5g7yyJ2X2R0o3a5HQJFuLk
```
![image](https://user-images.githubusercontent.com/47408756/129333206-c1b4ec0e-2e53-4918-9005-c8e039272e14.png)

## Level 11: Level 12
The password for the next level is stored in the file data.txt, where all lowercase (a-z) and uppercase (A-Z) letters have been rotated by 13 positions
```
ssh bandit11@bandit.labs.overthewire.org -p 2220
Password: IFukwKGsFW8MOq3IRFqrxE1hxTNEbUPR
```
![image](https://user-images.githubusercontent.com/47408756/129333361-2828230c-8c96-4747-89b6-cc60080d138a.png)

## Level 12: Level 13
The password for the next level is stored in the file data.txt, which is a hexdump of a file that has been repeatedly compressed. For this level it may be useful to create a directory under /tmp in which you can work using mkdir. For example: mkdir /tmp/myname123. Then copy the datafile using cp, and rename it using mv (read the manpages!)

```
ssh bandit12@bandit.labs.overthewire.org -p 2220
Password: 5Te8Y4drgCRfCx8ugdwuEX8KFC6k2EUu
```
![image](https://user-images.githubusercontent.com/47408756/129439976-5a28d58e-e8b7-4d2c-8417-f56931f2857d.png)
![image](https://user-images.githubusercontent.com/47408756/129439979-3b66c234-455f-4049-8840-7adde05a92de.png)
![image](https://user-images.githubusercontent.com/47408756/129439971-8e8a3692-7ec7-4c91-a8e8-4dcf465de647.png)

## Level 13: Level 14
The password for the next level is stored in /etc/bandit_pass/bandit14 and can only be read by user bandit14. For this level, you don’t get the next password, but you get a private SSH key that can be used to log into the next level. Note: localhost is a hostname that refers to the machine you are working on
```
ssh bandit13@bandit.labs.overthewire.org -p 2220
Password: 8ZjyCRiBWFYkneahHwxCv3wb2a1ORpYL
```
![image](https://user-images.githubusercontent.com/47408756/129440086-c9ddc1ad-0f16-4ba5-a3bc-82d239f8bdfc.png)
![image](https://user-images.githubusercontent.com/47408756/129440090-1fbeac7a-feb5-4abc-9569-8b69119512fb.png)

## Level 14: Level 15
The password for the next level can be retrieved by submitting the password of the current level to port 30000 on localhost.
```
ssh bandit14@bandit.labs.overthewire.org -p 2220
Password: 4wcYUJFw0k0XLShlDzztnTBHiqxU3b3e
```
![image](https://user-images.githubusercontent.com/47408756/129440154-04d6204b-0cb3-4d22-ab71-324f735a07d0.png)

## Level 15: Level 16
The password for the next level can be retrieved by submitting the password of the current level to port 30001 on localhost using SSL encryption.

Helpful note: Getting “HEARTBEATING” and “Read R BLOCK”? Use -ign_eof and read the “CONNECTED COMMANDS” section in the manpage. Next to ‘R’ and ‘Q’, the ‘B’ command also works in this version of that command
```
ssh bandit15@bandit.labs.overthewire.org -p 2220
Password: BfMYroe26WYalil77FoDi9qh59eK5xNr
```
![image](https://user-images.githubusercontent.com/47408756/129440260-942ff8d8-656b-40e6-81a2-9c28b05095cc.png)
<br>
![image](https://user-images.githubusercontent.com/47408756/129440264-4b93d0b8-526c-4c5e-9b96-ba1b15441b9e.png)

## Level 16: Level 17
The credentials for the next level can be retrieved by submitting the password of the current level to a port on localhost in the range 31000 to 32000. First find out which of these ports have a server listening on them. Then find out which of those speak SSL and which don’t. There is only 1 server that will give the next credentials, the others will simply send back to you whatever you send to it.
```
ssh bandit16@bandit.labs.overthewire.org -p 2220
Password: cluFn7wTiGryunymYOu4RcffSxQluehd
```
![image](https://user-images.githubusercontent.com/47408756/129440426-8eecf687-16a2-4a0c-a6ae-c2ecd290795a.png)

## Level 17: Level 18
There are 2 files in the homedirectory: passwords.old and passwords.new. The password for the next level is in passwords.new and is the only line that has been changed between passwords.old and passwords.new

NOTE: if you have solved this level and see ‘Byebye!’ when trying to log into bandit18, this is related to the next level, bandit19.
```
ssh bandit17@bandit.labs.overthewire.org -p 2220
Password: xLYVMN9WE5zQ5vHacb0sZEVqbrp7nBTn
```
![image](https://user-images.githubusercontent.com/47408756/129441119-f04c5782-4fef-493d-ba12-21b0256d7fac.png)

## Level 18: Level 19
The password for the next level is stored in a file readme in the homedirectory. Unfortunately, someone has modified .bashrc to log you out when you log in with SSH.
```
ssh bandit18@bandit.labs.overthewire.org -p 2220
Password: kfBf3eYk5BPBRzwjqutbbfE887SVc5Yd
```
![image](https://user-images.githubusercontent.com/47408756/130219878-9a493433-abd3-472a-957e-9dc49f8301c4.png)

## Level 19: Level 20
To gain access to the next level, you should use the setuid binary in the homedirectory. Execute it without arguments to find out how to use it. The password for this level can be found in the usual place (/etc/bandit_pass), after you have used the setuid binary.
```
ssh bandit19@bandit.labs.overthewire.org -p 2220
Password: IueksS7Ubh8G3DCwVzrTd8rAVOwq3M5x
```
![image](https://user-images.githubusercontent.com/47408756/130221219-8f82541c-f139-46a8-b1de-2e789bbc961c.png)

## Level 20: Level 21
There is a setuid binary in the homedirectory that does the following: it makes a connection to localhost on the port you specify as a commandline argument. It then reads a line of text from the connection and compares it to the password in the previous level (bandit20). If the password is correct, it will transmit the password for the next level (bandit21).

```
ssh bandit20@bandit.labs.overthewire.org -p 2220
Password: GbKksEFF4yrVs6il55v6gwY5aVje5f0j
```
![image](https://user-images.githubusercontent.com/47408756/130222235-ef38cf74-a1ef-4bcf-a087-661792478d3b.png)

## Level 21: Level 22
A program is running automatically at regular intervals from cron, the time-based job scheduler. Look in /etc/cron.d/ for the configuration and see what command is being executed.
```
ssh bandit21@bandit.labs.overthewire.org -p 2220
Password: gE269g2h3mw3pwgrj0Ha9Uoqen1c9DGr
```
![image](https://user-images.githubusercontent.com/47408756/130223746-cfbc6782-2f97-4764-8c08-852955e69e37.png)

## Level 22: Level 23
A program is running automatically at regular intervals from cron, the time-based job scheduler. Look in /etc/cron.d/ for the configuration and see what command is being executed.
```
ssh bandit22@bandit.labs.overthewire.org -p 2220
Password: Yk7owGAcWjwMVRwrTesJEwB7WVOiILLI
```
![image](https://user-images.githubusercontent.com/47408756/130224314-609340af-a394-450e-b63d-65ff69027834.png)

## Level 23: Level 24
A program is running automatically at regular intervals from cron, the time-based job scheduler. Look in /etc/cron.d/ for the configuration and see what command is being executed.
```
ssh bandit23@bandit.labs.overthewire.org -p 2220
Password: jc1udXuA1tiHqjIsL8yaapX5XIAI6i0n
```
## Level 24: Level 25
A daemon is listening on port 30002 and will give you the password for bandit25 if given the password for bandit24 and a secret numeric 4-digit pincode. There is no way to retrieve the pincode except by going through all of the 10000 combinations, called brute-forcing.
```
ssh bandit24@bandit.labs.overthewire.org -p 2220
Password: UoMYTrfrBFHyQXmg6gzctqAwOmw1IohZ
```

<br>

<p>
  <a href="https://github.com/Calatop/OverTheWire/wiki/Natas" target="_blank">
    <img align="center" src="https://user-images.githubusercontent.com/47408756/132019926-07592439-3471-4faf-9552-58f1eae9c45a.png" alt="Natas" />
  </a>
</p>

## Level 0

Natas teaches the basics of serverside web security.

Each level of natas consists of its own website located at http://natasX.natas.labs.overthewire.org, where X is the level number. There is no SSH login. To access a level, enter the username for that level (e.g. natas0 for level 0) and its password.

Each level has access to the password of the next level. Your job is to somehow obtain that next password and level up. All passwords are also stored in /etc/natas_webpass/. E.g. the password for natas5 is stored in the file /etc/natas_webpass/natas5 and only readable by natas4 and natas5.

Start here:
URL:      http://natas0.natas.labs.overthewire.org
```
Username: natas0
Password: natas0
```
![image](https://user-images.githubusercontent.com/47408756/130347751-c7feabb4-4255-4a07-91a8-21775ee4d488.png)

## Level 0: Level 1

URL:     http://natas1.natas.labs.overthewire.org
```
Username: natas1
Password: gtVrDuiDfck831PqWsLEZy5gyDz1clto 
```
![image](https://user-images.githubusercontent.com/47408756/130349153-c1d2e687-3cfc-40f0-9241-99ec9c4499f7.png)

## Level 1: Level 2

URL:      http://natas2.natas.labs.overthewire.org
```
Username: natas2
Password: ZluruAthQk7Q2MqmDeTiUij2ZvWy2mBi
```
![image](https://user-images.githubusercontent.com/47408756/131376881-30f8c369-5a01-4bdf-bfb8-b2582e104e6c.png)
![image](https://user-images.githubusercontent.com/47408756/131377033-9bf35e96-cad6-44b6-ad1e-2fb9503e1069.png)

## Level 2: Level 3

URL:      http://natas3.natas.labs.overthewire.org
```
Username: natas3
Password: sJIJNW6ucpu6HPZ1ZAchaDtwd7oGrD14
```
![image](https://user-images.githubusercontent.com/47408756/131377441-0b22ac21-0df6-4e3a-820a-988bdc9d1ac0.png)

<br>

![image](https://user-images.githubusercontent.com/47408756/131377589-9d1b93fd-6d87-4755-b9b9-86b4c69dd61b.png)

<br>

![image](https://user-images.githubusercontent.com/47408756/131377619-bd67f1e5-7b5a-4850-afbe-2e5c1f30e01a.png)

