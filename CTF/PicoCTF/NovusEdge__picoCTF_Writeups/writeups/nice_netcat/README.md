### Problem Statement
```txt
There is a nice program that you can talk to by using this command in a shell:

$ nc mercury.picoctf.net 43239, but it doesn't speak English...
```

---

The command given is invoking the `netcat` tool.

When this is executed in the shell, we get an output:

```txt
112
105
99
111
67
84
70
123
103
48
48
100
95
107
49
116
116
121
33
95
110
49
99
51
95
107
49
116
116
121
33
95
55
99
48
56
50
49
102
53
125
10
```

One can clearly guess that these may be a the numerical representations of ascii characters.

To decode the flag from these, we may use a script similar to `decode_nums.py`.

First, let's get the output into a readable text file:

```shell
$ nc mercury.picoctf.net 43239 > output.txt
```

Now, we can run the python script to decode the data from `output.txt`

##### Output
```shell
$ python3 decode_nums.py output.txt

The flag is: picoCTF{g00d_k1tty!_n1c3_k1tty!_7c0821f5}
Time Taken: 5.793571472167969e-05
```

---

#### Flag
    picoCTF{g00d_k1tty!_n1c3_k1tty!_7c0821f5}

Link to the challenge: [Nice Netcat](https://play.picoctf.org/practice/challenge/156)
