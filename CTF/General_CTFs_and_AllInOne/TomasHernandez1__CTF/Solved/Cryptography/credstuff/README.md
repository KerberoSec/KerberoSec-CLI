<h1>
  Prompt
</h1>

*[Image: alt text]*

<h1>
  Writeup
</h1>

```
$ tar -xf leak.tar
$ cat usernames.txt | grep cultiris -n
378
$ cat passwords.txt | head -n 378 | tail -1
cvpbPGS{P7e1S_54I35_71Z3}
```

Decypher with ROT13

<h1>
  Flag
</h1>

picoCTF{C7r1F_54V35_71M3}
