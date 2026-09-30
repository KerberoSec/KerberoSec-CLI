# Mob psycho

## Description

Can you handle APKs?
Download the android apk [here](https://artifacts.picoctf.net/c_titan/141/mobpsycho.apk).

## Hints

- Did you know you can unzip APK files?
- Now you have the whole host of shell tools for searching these files.

## Solution

First I unzipped the file:

```shell
binwalk --extract mobpsycho.apk
```

then I looked for flag inside the extracted directory:

```shell
cd _mobpsycho.apk.extracted
```

```shell
find . -name 'flag*'
./res/color/flag.txt
```

inside the flag.txt was this encoded string:
7069636f4354467b6178386d433052553676655f4e5838356c346178386d436c5f62313132616535377d

looked like Hexadecimal to me, so I decided to convert it to ASCII using [this](https://www.dcode.fr/ascii-code) site.

flag: **picoCTF{ax8mC0RU6ve_NX85l4ax8mCl_b112ae57}**
