
**Challenge:** Weird code<br>
**Level 2**<br>
**Score**: 15 <br>
**Category:** Coding<br><br>
**Description**<br>
I've found a weird piece of code in the internet. That looks strange....but there is a flag inside. I belive that! Help me, plz.<br><br>
Link: https://github.com/SecurityValley/PublicCTFChallenges/tree/master/coding/weird_code<br><br>
Following the link we're given a file named `code.txt`. <br>
**Contents of code.txt:**<br>
```
##################################################
 15           0 LOAD_GLOBAL              0 (print)
              2 LOAD_CONST               1 ('loading application')
              4 CALL_FUNCTION            1
              6 POP_TOP

 17           8 LOAD_GLOBAL              1 (magic)
             10 LOAD_CONST               2 ('8934')
             12 LOAD_GLOBAL              2 (get_flag)
             14 CALL_FUNCTION            0
             16 CALL_FUNCTION            2
             18 STORE_FAST               0 (d)

 19          20 LOAD_GLOBAL              0 (print)
             22 LOAD_FAST                0 (d)
             24 CALL_FUNCTION            1
             26 POP_TOP
             28 LOAD_CONST               0 (None)
             30 RETURN_VALUE
None
##################################################
  4           0 LOAD_CONST               1 ('k\\PbYUHDAM[[VJlVAMVk[VWQE')
              2 RETURN_VALUE
None
##################################################
  7           0 LOAD_CONST               1 (b'')
              2 STORE_FAST               2 (out)

  9           4 LOAD_GLOBAL              0 (range)
              6 LOAD_GLOBAL              1 (len)
              8 LOAD_FAST                1 (f)
             10 CALL_FUNCTION            1
             12 CALL_FUNCTION            1
             14 GET_ITER
        >>   16 FOR_ITER                46 (to 64)
             18 STORE_FAST               3 (i)

 10          20 LOAD_FAST                2 (out)
             22 LOAD_GLOBAL              2 (bytes)
             24 LOAD_GLOBAL              3 (ord)
             26 LOAD_FAST                1 (f)
             28 LOAD_FAST                3 (i)
             30 BINARY_SUBSCR
             32 CALL_FUNCTION            1
             34 LOAD_GLOBAL              3 (ord)
             36 LOAD_FAST                0 (k)
             38 LOAD_FAST                3 (i)
             40 LOAD_GLOBAL              1 (len)
             42 LOAD_FAST                0 (k)
             44 CALL_FUNCTION            1
             46 BINARY_MODULO
             48 BINARY_SUBSCR
             50 CALL_FUNCTION            1
             52 BINARY_XOR
             54 BUILD_LIST               1
             56 CALL_FUNCTION            1
             58 INPLACE_ADD
             60 STORE_FAST               2 (out)
             62 JUMP_ABSOLUTE           16

 12     >>   64 LOAD_FAST                2 (out)
             66 RETURN_VALUE
None
```
**Code analysis**<br>
Analysing the contents of the file, we see that this is python bytecode. So what is python bytecode?<br>
As [this](https://opensource.com/article/18/4/introduction-python-bytecode) article states:<br>
> Python, like many interpreted languages, actually compiles source code to a set of instructions for a virtual machine, and the Python interpreter is an implementation of that virtual machine. This intermediate format is called "bytecode."

More specifically, it is part of the output one would get when using the python module 'dis'. We can learn more about what the 'dis module' is and what it does reading the [official documentation](https://docs.python.org/3/library/dis.html).<br><br>
Our goal here is to reassemble the source from the `code.txt` file we were given, so we can understand what it does. At first I learned of tools that automate this process, such as **uncompyle6, pycbc and pyc-xasm**, but I had trouble getting them to work with our file. I only got formatting errors, probably because the tools expect 'header information' that is not present in our file.<br>

**Solution**<br>
After failing to use the mentioned tools, my next bet was to understand how the opcodes work using the [dis documentation](https://docs.python.org/3/library/dis.html), and recreate the python code by following the contents of our file code.txt.
Through trial and error, I created the python file `test.py` which when disassembled with `python -m dis test.py` produces an output similar to our original code.txt file but with some extra information.
<details>
<summary>test.py spoiler </summary>

*test.py:*
```
def bla():
    print("loading app")
    d = magic("8934", get_flag())
    print(d)

def get_flag():
    return "k\\PbYUHDAM[[VJlVAMVk[VWQE"

def magic(k, f):
    out = b''
    for i in range(len(f)):
        out += bytes([ord(f[i]) ^ ord(k[i % len(k)])])
    return out

bla()
```
</details>

After running the file with `python test.py`, we're presented with the flag.
<details>
<summary>Flag: </summary>
SecVal{pythons_byte_code}
</details>
