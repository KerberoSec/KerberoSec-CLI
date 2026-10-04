# Fight
## Challenge details
|       Event        | Challenge | Category | Points  |
|:-------------------|:----------|:---------|:-------:|
|   HarekazeCTF      |   Fight   | Crypto   |   100   |

### Description
> To get a flag, never stop the FIGHT.
### Attachments
> `problem.py`
## Solution
s为4529255040439033800342855653030016000  
观察gen_seed函数，发现其就是求一个数的欧拉函数值  
用简单方法求得s的欧拉函数值为765753154007029226621575888896000000  
设置seed后重新生成key再与enc进行异或即可解密  
HarekazeCTF{3ul3rrrrrrrrr_t0000000t1nt!!!!!}