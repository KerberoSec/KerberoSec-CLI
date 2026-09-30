# gacha2
## Challenge details
|       Event        | Challenge | Category | Points  |
|:-------------------|:----------|:---------|:-------:|
|   HarekazeCTF      |  gacha2   | Crypto   |   350   |
### Description
> なかなか当たらないガチャのイラスト | かわいいフリー素材集 いらすとや 
### Attachments
> `problem.hard.py`

## Solution
与gacha相比，gacha2中对每个明文添加了200个bytes的随机字符，就没法直接像gacha那样进行判断。  
如果想要通过分解N来解密，基本是不可能的，一是位数太长，二是时间不够。  
已知的明文也太少，没法搞什么事情  
我们看到在明文后添加的随机数是使用randrange生成的200个bytes的随机数，而randrange是调用getrandbits函数生成的，python中的getrandbits是使用梅森旋转法生成的，python中的梅森旋转法维护了一个624大小的数组，每次从这个数组中取一个数并进行一定的计算最后生成随机数，当624个数全部用完时，再根据这个数组生成下一次的数组，而最后生成随机数的计算是可逆的，也就是说我们可以读取624个32bits的数就可以构建出这个624大小的数组，从而就可以预测之后的随机数  
能够预测随机数之后我们就可以像gahca一样进行判断了  
梅森旋转法预测的代码在`mt19937predicto.py`  
最后的解法代码为`solve.py`  
得到flag：HarekazeCTF{67c3b35a3189cc056fdcf1cca73da0c315630a60}

## Link
https://jazzy.id.au/2010/09/22/cracking_random_number_generators_part_3.html
http://ddaa.logdown.com/posts/171272-30c3ctf-numbers-100-guess
https://liam0205.me/2018/01/12/Mersenne-twister/
http://hacktracking.blogspot.jp/2013/12/30c3-2k13-numbers-guess-100-points.html
