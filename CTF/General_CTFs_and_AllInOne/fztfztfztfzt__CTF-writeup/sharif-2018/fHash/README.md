# fHash
## Challenge details
|       Event        | Challenge | Category | Points  |
|:-------------------|:----------|:---------|:-------:|
| Sharif CTF 8       |fHash      |Crypto    |200      |

### Description
> We designed a hash function called "fHash". fHash takes a message (M), as well as two initialization values, designated as left (hl) and right (hr). You can find the implementation of fHash here.  
> Let M1 = '7368617269666374'. Notice that fHash('7575', 'A8A8', M1) = '260c01da'.  
> Find M2 ≠ M1, as well as two initialization values hl and h2, such that fHash(hl, hr, M2) = '260c01da'. That is, find a second-preimage for M1.  
> Each of hl and hr must be two bytes, while M2 must be 8 bytes.  
> http://ctf.sharif.edu:8087/  
> http://8087.ctf.certcc.ir/

### Attachments
> `fHash.py`

## Solution
这题是希望能找到一个碰撞，阅读`fHash.py`可以看到这个哈希函数需要三个参数，两个2 bytes的IV，一个8 bytes的字符串，将字符串分成四份，每份2 bytes，每次取一份，与两个IV一起计算出下一组IV，最后将最后生成的一组IV连起来作为结果。  
因为生成的位数都很小，所以暴力搜索即可。在每一轮中，字符串的2 bytes分别与两个IV生成下一组的IV，所以我们可以先暴力出一组字符串和IV，再计算另一个IV。  
最后的解题脚本为`solver.py`。  
得到一组解message: 72f08a801c4edbc6, hl: 0000, hr: 3fca  
得到flag:SharifCTF{561a6a6e11ad3a61d83c29a49146d62b}  
```python
from hashlib import md5

def foo(h, m):
    return md5(h.encode('utf-8') + m.encode('utf-8')).hexdigest()[:4]

def solve(hl,hr):
    for i in xrange(2**16):
        for j in xrange(2**16):
            l = '{:04x}'.format(i)
            m = '{:04x}'.format(j)
            if foo(l, m)==hl:
                for k in xrange(2**16):
                    r = '{:04x}'.format(k)
                    if foo(r, m) == hr:
                        return m,l,r

left = '260c'
right = '01da'
message = ""
for _ in range(4):
    m,left,right = solve(left,right)
    message = m+message
                    
print('message: {}, hl: {}, hr: {}'.format(message, left, right))
```