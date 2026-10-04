# Other

### This file contains writeups for the easier reverse engineering challenges that have fairly short solutions.

## **Contents**

- [file-run1](#file-run1---100-pts)
- [file-run2](#file-run2---100-pts)
- [GDB Test Drive](#gdb-test-drive---100-pts)
- [patchme.py](#patchmepy---100-pts)
- [Safe Opener](#safe-opener---100-pts)
- [unpackme.py](#unpackmepy---100-pts)
- [bloat.py](#bloatpy---200-pts)
- [Fresh Java](#fresh-java---200-pts)

---

# file-run1: 100 pts

> A program has been provided to you, what happens if you try to run it on the command line?

## Solution

Run the file.

```console
$ wget https://artifacts.picoctf.net/c/310/run
$ chmod +x run
$ ./run
The flag is: picoCTF{U51N6_Y0Ur_F1r57_F113_47cf2b7b}
```

## Flag

> `picoCTF{U51N6_Y0Ur_F1r57_F113_47cf2b7b}`

---

# file-run2: 100 pts

> Another program, but this time, it seems to want some input. What happens if you try to run it on the command line with input "Hello!"?

## Solution

Run the file with the argument.

```console
$ wget https://artifacts.picoctf.net/c/353/run
$ chmod +x run
$ ./run Hello!
The flag is: picoCTF{F1r57_4rgum3n7_f65ed63e}
```

## Flag

> `picoCTF{F1r57_4rgum3n7_f65ed63e}`

---

# GDB Test Drive: 100 pts

> Can you get the flag? Download this binary. Here's the test drive instructions:

- `$ chmod +x gdbme`
- `$ gdb gdbme`
- `(gdb) layout asm`
- `(gdb) break *(main+99)`
- `(gdb) run`
- `(gdb) jump *(main+104)`

This challenges teaches the basics of debugging with gdb, including setting breakpoints, running, and jumping to addresses.

## Solution

Follow the instructions. I omitted the `layout asm` command, which just changes the display format. It does not make a difference in the actual debugging. (Note: I am using `gef`, a set of tools on top of `gdb`.)

```console
$ wget https://artifacts.picoctf.net/c/117/gdbme
$ gdb gdbme
gef> break *(main+99)
gef> run
gef> jump *(main+104)
Continuing at 0x55555555532f.
picoCTF{d3bugg3r_dr1v3_7776d758}
gef> q
$
```

## Flag

> `picoCTF{d3bugg3r_dr1v3_7776d758}`

---

# patchme.py: 100 pts

> Can you get the flag? Run this Python program in the same directory as this encrypted flag.

## Solution

Get the files:

```console
$ wget https://artifacts.picoctf.net/c/388/patchme.flag.py
$ wget https://artifacts.picoctf.net/c/388/flag.txt.enc
```

Let's look at the python script:

```py
...
if( user_pw == "ak98" + \
                "-=90" + \
                "adfjhgj321" + \
                "sleuth9000"):
    print("Welcome back... your flag, user:")
    decryption = str_xor(flag_enc.decode(), "utilitarian")
    print(decryption)
...
```

The script checks if our input is equal to the password. We could either copy the password and input that, or as the challenge suggests, patch the script. Let's change it so instead of checking if `user_pw` is _equal_ to the password, check if it is _not equal_ by replacing the `==` with `!=`. Save, and run the script.

```console
$ python3 patchme.flag.py
Please enter correct password for flag: pass
Welcome back... your flag, user:
picoCTF{p47ch1ng_l1f3_h4ck_21d62e33}
```

## Flag

> `picoCTF{p47ch1ng_l1f3_h4ck_21d62e33}`

---

# Safe Opener: 100 pts

> Can you open this safe? I forgot the key to my safe but this program is supposed to help me with retrieving the lost key. Can you help me unlock my safe? Put the password you recover into the picoCTF flag format like:
> `picoCTF{password}`

## Solution

```console
$ wget https://artifacts.picoctf.net/c/463/SafeOpener.java
```

We have a `java` file.

```java
public static void main(String args[]) throws IOException {
    BufferedReader keyboard = new BufferedReader(new InputStreamReader(System.in));
    Base64.Encoder encoder = Base64.getEncoder();
    String encodedkey = "";
    String key = "";
    int i = 0;
    boolean isOpen;

    while (i < 3) {
        System.out.print("Enter password for the safe: ");
        key = keyboard.readLine();

        encodedkey = encoder.encodeToString(key.getBytes());
        System.out.println(encodedkey);

        isOpen = openSafe(encodedkey);
        if (!isOpen) {
            System.out.println("You have  " + (2 - i) + " attempt(s) left");
            i++;
            continue;
        }
        break;
    }
}
```

We have 3 attempts to enter the correct key. Each time, it takes our input an encodes it with base-64, and compares it to the correct encoded key.

```java
public static boolean openSafe(String password) {
    String encodedkey = "cGwzYXMzX2wzdF9tM18xbnQwX3RoM19zYWYz";

    if (password.equals(encodedkey)) {
        System.out.println("Sesame open");
        return true;
    }
    else {
        System.out.println("Password is incorrect\n");
        return false;
    }
}
```

The encoded base-64 key is hardcoded into the `openSafe` method. It decodes into: `pl3as3_l3t_m3_1nt0_th3_saf3`. Let's enter that as the password:

```java
$ java SafeOpener.java
Enter password for the safe: pl3as3_l3t_m3_1nt0_th3_saf3
cGwzYXMzX2wzdF9tM18xbnQwX3RoM19zYWYz
Sesame open
```

It works!

## Flag

> `picoCTF{pl3as3_l3t_m3_1nt0_th3_saf3}`

---

# unpackme.py: 100 pts

## Solution

Download the file, and run it.

```console
$ wget https://artifacts.picoctf.net/c/466/unpackme.flag.py
$ python3 unpackme.flag.py
What's the password? password
That password is incorrect.
```

It asks for a password, which we do not know. Maybe it's in the source code?

```py
import base64
from cryptography.fernet import Fernet

payload = b'gAAAAABiMD09KmaS5E6AQNpRx1_qoXOBFpSny3kyhr8Dk_IEUu61Iu0TaSIf8RCyf1LJhKUFVKmOt2hfZzynRbZ_fSYYN_OLHTTIRZOJ6tedEaK6UlMSkYJhRjAU4PfeETD-8gDOA6DQ8eZrr47HJC-kbyi3Q5o3Ba28mutKCAkwrqt3gYOY9wp3dWYSWzP4Tc3NOYWfu-SJbW997AM8GA-APpGfFrf9f7h0VYcdKOKu4Vq9zjJwmTG2VXWFET-pkF5IxV3ZKhz36L5IvZy1dVZXqaMR96lovw=='

key_str = 'correctstaplecorrectstaplecorrec'
key_base64 = base64.b64encode(key_str.encode())
f = Fernet(key_base64)
plain = f.decrypt(payload)
exec(plain.decode())
```

There's no password checker in here! What's going on?

What's going on is that they have stored a base-64 and Fernet encrypted script, which is the password checker.

This script then _decodes_ the checker and calls `exec()` on it, thus executing the checker. Let's replace `exec(plain.decode())` with `print(plain.decode())` to see what the encrypted script is.

```py
$ python3 unpackme.flag.py

pw = input('What\'s the password? ')

if pw == 'batteryhorse':
  print('picoCTF{175_chr157m45_85f5d0ac}')
else:
  print('That password is incorrect.')
```

## Flag

> `picoCTF{175_chr157m45_85f5d0ac}`

As in "unpack" a gift!

---

# bloat.py: 200 pts

> Can you get the flag? Run this Python program in the same directory as this encrypted flag.

## Solution

Get the files and run the program:

```py
$ wget https://artifacts.picoctf.net/c/430/bloat.flag.py
$ wget https://artifacts.picoctf.net/c/430/flag.txt.enc
$ python3 bloat.flag.py
Please enter correct password for flag: password
That password is incorrect
```

Looks like we have another password checker.

Let's open the source code and...wow, what a mess. The Python code is obfuscated, but we can still make out some hints.

At some point, the program must compare our input with the password. You will find this at the very top of the program:

```py
def arg133(arg432):
    if arg432 == a[71]+a[64]+a[79]+a[79]+a[88]+a[66]+a[71]+a[64]+a[77]+a[66]+a[68]:
        return True
    else:
        print(a[51]+a[71]+a[64]+a[83]+a[94]+a[79]+a[64]+a[82]+a[82]+a[86]+a[78]+\
a[81]+a[67]+a[94]+a[72]+a[82]+a[94]+a[72]+a[77]+a[66]+a[78]+a[81]+\
a[81]+a[68]+a[66]+a[83])
        sys.exit(0)
        return False
```

If our input matches the password, `arg133()` returns `True`. Let's patch it to _always_ return `True`.

```py
def arg133(arg432):
    return True
```

```console
$ python3 bloat.flag.py
Please enter correct password for flag: password
Welcome back... your flag, user:
picoCTF{d30bfu5c4710n_f7w_5e14b257}
```

## Flag

> `picoCTF{d30bfu5c4710n_f7w_5e14b257}`

---

# Fresh Java: 200 pts

> Can you get the flag? Reverse engineer this Java program.

## Solution

We are given a `.class` file, which is Java bytecode, which is sort of like an intermediate level between source code and machine code.

Use a Java [decompiler](http://www.javadecompilers.com/).

Piece the hardcoded flag together.

## Flag

> `picoCTF{700l1ng_r3qu1r3d_2bfe1a0d}`
