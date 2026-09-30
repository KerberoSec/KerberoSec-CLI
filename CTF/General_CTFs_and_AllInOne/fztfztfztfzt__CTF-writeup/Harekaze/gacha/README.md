# gacha
## Challenge details
|       Event        | Challenge | Category | Points  |
|:-------------------|:----------|:---------|:-------:|
|   HarekazeCTF      |  gacha |   Crypto       |   100     |

### Description
> ガチャの出現確率「3％」、実際は0.333％　スマホゲーム「KOF」運営会社に措置命令: ITmedia NEWS
### Attachments
> `problem.py`
## Solution
查看problem.py，每次需要从三个结果中选择正确的那一个，明文已知，N已知，e已知，那么每次只需要win的明文进行加密，和结果进行比较，相同的即是答案  
`solve.py`