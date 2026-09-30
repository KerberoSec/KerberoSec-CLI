# RSAbaby
## Challenge details
|       Event        | Challenge | Category | Points  |
|:-------------------|:----------|:---------|:-------:|
|  codegate quals 2018     |     RSAbaby      |    Crypto      |    349     |

### Description
> XD
### Attachments
> `RSAbaby.py`
## Solution
题目中在生成私钥后还给了两个提示g和h，但h好像没什么用  
```
h = (d+p)^(d-p)
g = d*(p-0xdeadbeef)
```
g = d*(p-const)其中const=0xdeadbeef  
m^ed = m mod N  
m^ed(p-const) = m^(p-const) mod N  
m^(p-const) * m^(const-1) = m^(p-1) mod N  
又因为m^(p-1) = 1 mod p  
所以m^(p-1)-1=k*p  
例如我们取m=2  
```
kp = pow(2,e*g,N)*pow(2,0xdeadbeef-1,N)
p = gcd(kp-1,N)
```
这样既可算出p的值  
从而解密  
得到flag：Whatever you do, the Basics are the most important :-D  
`solve.py`