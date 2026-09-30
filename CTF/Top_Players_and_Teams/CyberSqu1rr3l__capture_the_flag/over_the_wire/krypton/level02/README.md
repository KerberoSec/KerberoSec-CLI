```
  ____   _                   _                _                 __  _ 
 / ___| | |_____   _____    | |   __ _  ___ _| | __ _ _   _ __ _\ \| |
| (__   | / _ \ \ / / _ \   | |  / _` |/ _ \__ |/ _` | | | |__` |\ ` |
 \__ \  | \__  \ V /\__  |__| | | | | | (_) || | (_| | |_| |  | |/ . |
|_____| |_|___/ \_/ |___/_____| |_| |_|\___/__/ \__, | .__/   |_/_/|_|
                                                   |_|\___|
```
ROT13 is a simple *substitution cipher*, which is a simple replacement algorithm. In
this example of a substitution cipher, we will explore a *monoalphebetic cipher* which
means, literally, *one alphabet* and we will see why. This level contains an old form of
cipher called a *Caesar Cipher*. A Caesar cipher shifts the alphabet by a set number,
like in the following example.
```
plain:  a b c d e f g h i j k ...
cipher: G H I J K L M N O P Q ...
```
In this example, the letter *a* in plaintext is replaced by a *G* in the ciphertext so,
for example, the plaintext *bad* becomes *HGJ* in ciphertext. The password for level 3
is in the file *krypton3*. It is in five letter group ciphertext. It is encrypted with a
Caesar Cipher. Without any further information, this cipher text may be difficult to
break. You do not have direct access to the key, however you do have access to a program
that will encrypt anything you wish to give it using the key. If you think logically,
this is completely easy. Note, that one shot can solve it. The encrypt binary will look
for the keyfile in our current working directory. Therefore, it might be best to create
a working direcory in `/tmp/` and in there a link to the keyfile. As the encrypt binary
runs *setuid krypton3*, we might also need to give krypton3 access to our working
directory. [^1]

```
krypton2@melinda:~$ mktemp -d
/tmp/tmp.Wf2OnCpCDQ
krypton2@melinda:~$ cd /tmp/tmp.Wf2OnCpCDQ
krypton2@melinda:/tmp/tmp.Wf2OnCpCDQ$ ln -s /krypton/krypton2/keyfile.dat
krypton2@melinda:/tmp/tmp.Wf2OnCpCDQ$ ls
keyfile.dat
krypton2@melinda:/tmp/tmp.Wf2OnCpCDQ$ chmod 777 .
krypton2@melinda:/tmp/tmp.Wf2OnCpCDQ$ /krypton/krypton2/encrypt /etc/issue
krypton2@melinda:/tmp/tmp.Wf2OnCpCDQ$ ls
ciphertext  keyfile.dat
```

Solution
----------------------------------------------------------------------------------------
Once again, a substitution cipher is presented, but this time it can be shifted by any
set number. For that, we can either use the `caesar` utility on our host machine or the
provided `encrypt` binary on the server. Since, the `encrypt` binary looks for a keyfile
in the current directory, we create a link to the keyfile in a temporary folder and give
it access to this working directory as in the task description example. Finally, we can
run the `encrypt` binary on any file, for example the alphabet. This, way the resulting
ciphertext will be the shifted alphabet which can be directly passed into `tr` to obtain
the next level's password.
```bash
mktemp -d; cd /tmp/tmp.VNvKpOuuIx; ln -s /krypton/krypton2/keyfile.dat; chmod 777 .
echo 'abcdefghijklmnopqrstuvwxyz' > plaintext
/krypton/krypton2/encrypt plaintext
cat /krypton/krypton2/krypton3 | tr $(cat ciphertext) 'A-Z' # equals tr 'M-ZA-L' 'A-Z'
```

[^1]: https://overthewire.org/wargames/krypton/krypton2.html
