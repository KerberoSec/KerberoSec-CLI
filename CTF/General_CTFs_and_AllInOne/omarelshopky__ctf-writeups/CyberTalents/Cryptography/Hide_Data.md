# Challenge Name:
 [*Hide Data*](https://cybertalents.com/challenges/cryptography/hide-data)
 
# Challenge Description
I used to hide my data with a classic cypher, can you get the flag hidden inside? gur synt vf 2w68lsudym Vg vf cerggl rnfl gb frr gur synt ohg pna lbh frr vg v gbbx arneyl 1 zvahgr gb rapbqr guvf jvgu EBG13 tbbq yhpx va fbyivat gung

## Answer
* We have an encrypted text want to decrypt it but we don't have the key so we will use brute force to decrypt it
* Write python script to do that
```py
text = input("Encrypted text: ")
text = text.upper()
for i in range(26):
  result=""
  for char in text:
    if char == ' ' or (char >= '0' and char <= '9'):
      result += char
    else: 
      x = ord(char) + i + 1
      if x > 90: 
        x -= 26
      result += chr(x)	
  print(result)	
```
* Run this script with cypher text, there is only one line contain readable text 
* You got the Flag

 ## The Flag
 > 2J68YFHQLZ
