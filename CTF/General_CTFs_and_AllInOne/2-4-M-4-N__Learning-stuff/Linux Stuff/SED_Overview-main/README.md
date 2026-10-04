source: [here](https://youtu.be/ETF6CapGAvc?si=G-uu6TgdjTk9DtxQ)

## Sed Overview
suppose I have a file like 'Data' so below all to the questions all are based on 'Data' file  
```cat data```  
```
ID Name salary country
1  kakashi 25000 Japan

2  Hinata 45000 Canada
3  Naruto 55000 Poland
4  Itachi 35000 Japan
```

__1) How to show only a given line or range of lines?__
- ```sed -n '1p' file_name```
- ```sed -n '1,5p' file_name```
- ```sed -n '$p' file_name```

__2) How to see all the users from Japan Country?__
- ```sed -n '/Japan/p' file_name```

__3) How to use multiple expression in sed command?__  
Example: If you wanna only see 2 and 5th line  
- ```sed -n -e '2p' -e '4p' file_name```

__4) How to see all the users from Japan and Canada?__
- ```sed -n -e '/Japan/p' -e '/Canada/p' file_name```

__5) How to see next 4 lines from 2nd line?__
- ```sed -n ‘2,+4p’ file_name```

__6) How to see every 2nd line from first line/Only Even Numbers?__
- ```sed -n ‘1~2p’ file_name```

__7) How to read expression from external file?__
- ```sed -f ex_file file_name```

__8) How to replace a word in a file and show?______
- ```sed 's/<string_to_change>/<new_string>/g' file_name```

__9) How to replace a word in a file and show except a given line or only in given line?__
- ```sed '2 s/<string_to_change>/<new_string>/g' file_name```
- ```sed '2! s/<string_to_change>/<new_string>/g' file_name```

__10) How to replace a word and and edit in your file?__
- ```sed -i '2! s/<string_to_change>/<new_string>/g' file_name```

__11) How to change salary or country of a user (Naruto)?__
- ```sed '/Naruto/ s/55000/35000/g' file_name```
- ```sed '/Naruto/ s/Poland/US/g' file_name```

__12) How to delete a line?__
- ```sed '1d' file_name``` (to delete first line)
- ```sed '1,2d' file_name``` (to delete a range)
- ```sed '$d' file_name``` (to delete last line)

__13) How to delete user from Poland country?__
- ```sed ‘/Poland/d’ file_name```

__14) How to delete empty line?__
- ```sed '/^$/d' file_name```

__15) How to Overwrite empty line?__
- ```sed -i '/^$/d' file_name```

__16) How to replace tab with space?__
- ```sed 's/\t/ /g' file_name```

__17) How to copy output of sed command in separate file?__
- ```sed -n ‘/US/ w new_file_name’ file_name```

__18) How to add new line after a given line no.?__
- ```sed '3 a new_text' file_name```

__19) How to add new line to given a specify user?__
- ```sed '/Naruto/ a new_text' file_name```

__20) How to edit existing line instead of adding new line?__
- ```sed '4 c new_text' file_name``` (it will add text at line 4)

__21) How to add new line before a given string, so it will add text before Paul?__
- ```sed '/kakashi/ i new_text' file_name```

__22) How to see the hidden characters?__
- ```sed -n 'l' file_name```

__23) How to wrap your file content with given no. of characters?__
- ```sed -n 'l 10' file_name```

__24) How to read content from a file and use in our command?__
- ```sed '3 r externalfile' file_name```

__26) How to stop execution of sed command as soon as first occurance found?__
- ```sed ‘/US/ q’ file_name``` (stop execution at line US)
- ```sed ‘5 q’ file_name```  (stop execution at line 5)

__27) How to execute external command line date in your expression?``````````__
- ```sed '2 e date' file_name``` (It will add date in second line)

__28) How to see the line number in file?__
- ```sed '=' file_name```

__29) How to provide exit status for your sed command?__
- ```sed ‘/India/ q 100’ file_name```

---

## SED Regular Expressions

```^```  start of line  
```$```   end of line  
```.```  single character  
```[]```  match character set  
```[^]``` exclusive Set  
```*```   zero or more occurance  

Examples:  
- ```sed -n '/^2/p' file_name```
- ```sed -n '/ia$/p' file_name```

__1) How to find a letter name which start with S and end with a?__
- ```sed -n '/^S...a$/p' filename```

__2) How to find names start with V?__
- ```sed -n '/^V/p' filename```
- ```sed -n '/[AC]/p' filename```

__3) How to find names end with a?__
- ```sed -n '/a$/p' names```

__4) How to see names start with only A and C?__
- ```sed -n '/[AC]/p' filename```

__5) How to see names start with only A to D?__
- ```sed -n '/^[A-D]/p' names```

---

## POSIX Classes

Example: ```sed -n ‘/[[:alpha:]]/p’ file_name```

```[:alnum:]```  
```[:alpha:]```  
```[:digit:]```  
```[:blank:]```  
```[:lower:]```  
```[:upper:]```  
```[:punct:]```  
```[:space:]```  

