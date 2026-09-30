## Challenge 🧩

Jacky is not very knowledgable about the best security passwords and used a simple password to encrypt their BitLocker drive. See if you can break through the encryption!

Author: Venax</br>
Points: 200

Hint: Hash cracking

## Solution 🕵️‍♂️

Using `bitlocker2john` to extract the Bitlocker hash from the disk image.

```bash
┌──(user㉿shell)-[~]
└─$ bitlocker2john -i bitlocker-1.dd > bit_hash.txt
```

Using brute-force attack to crack the `User Password` hash

```bash
┌──(user㉿shell)-[~]
└─$ john --wordlist=rockyou.txt bit_hash.txt
```

The password is `jacqueline`</br>
</br>

To access a BitLocker-encrypted volume on Linux, Use `Dislocker`, a tool that allows mounting BitLocker drives outside of Windows.

Create mount points:

```bash
┌──(user㉿shell)-[~]
└─$ sudo mkdir /mnt/bitlocked /mnt/unlocked
```

Run `Dislocker` with cracked password:

```bash
┌──(user㉿shell)-[~]
└─$ sudo dislocker -V bitlocker-1.dd -ujacqueline -- /mnt/bitlocked
```

* `-V` specifies the encrypted volume.
* `-u` provides the user password (use `-r` for recovery key or `-k` for keyfile).
* The decrypted output will be written to `/mnt/bitlocked/dislocker-file`.

Mount the decrypted volume:

```bash
┌──(user㉿shell)-[~]
└─$ sudo mount -o loop /mnt/bitlocked/dislocker-file /mnt/unlocked
```

Access the contents of decrypted volume:

```bash
┌──(user㉿shell)-[~]
└─$ ls /mnt/unlocked
'$RECYCLE.BIN'   flag.txt  'System Volume Information'
```

```bash
┌──(user㉿shell)-[~]
└─$ cat /mnt/unlocked/flag.txt
picoCTF{us3_b3tt3r_p4ssw0rd5_pl5!_xxxxxxxx}
```

### Tools Used

> `john`</br>
> `Dislocker`

## Flag 🚩

`picoCTF{us3_b3tt3r_p4ssw0rd5_pl5!_xxxxxxxx}`
