## MatchTheRegex

[Link to challenge](https://play.picoctf.org/practice/challenge/291)

Write-up:

1. This seems fairly straight-up, just matching the regular expression. There's an input field, 
but the regex pattern isn't immediately visible.

2. By viewing the page source we can find the regex pattern in a JavaScript comment: `^p.....F!?`

3. Breaking down the regex:
   - `^` - Start of string
   - `p` - Literal character 'p'
   - `.....` - Exactly 5 any characters
   - `F` - Literal character 'F'
   - `!?` - Optional '!' character

3. The input `picoCTF` matches this pattern perfectly:
   - `p` matches 'p'
   - `icoCT` matches the 5 dots
   - `F` matches 'F'
   - No `!` needed since it's optional

Flag: picoCTF{succ3ssfully_matchtheregex_2375af79}