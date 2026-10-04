### Problem Statement
```txt
Can you invoke help flags for a tool or binary? This program has extraordinarily helpful information...
```

---

We have been given a file named: `warm`.
Clearly a binary file, when we try and execute it with `./warm`, we get the output: `permission denied: ./warm`

To work around this we use:

```console
$ chmod +x warm
```
*NOTE: You can find more information about the `chmod` command [here](https://linux.die.net/man/1/chmod)*

Once the file has been granted permission, we can use `./warm` to execute the file.

```console
$ ./warm
Hello user! Pass me a -h to learn what I can do!

$ ./warm -h
Oh, help? I actually don't do much, but I do have this flag here: picoCTF{b1scu1ts_4nd_gr4vy_755f3544}
```

And thus, we've got the flag. :)

---

#### Flag
    picoCTF{b1scu1ts_4nd_gr4vy_755f3544}

Link to the challenge: [Wave A Flag](https://play.picoctf.org/practice/challenge/170)
