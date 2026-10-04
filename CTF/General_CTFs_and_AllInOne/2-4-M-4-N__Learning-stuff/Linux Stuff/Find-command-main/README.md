source: [here](https://youtu.be/1z17BswGsdw?si=oZB1mt8_TbZnGzbF)

## Find command search for files in a directory  
- __Syntax:__ ```find [opttions] [path] [expression]```   
- __Example:__ ```find /path/ -name <file name>```  

1) How to search a file based on their size?  
```find /path/ -size 50m```
```
m for mb
k for kb
g for gb
c for bytes
```

2) How to find only or only directory in a given path?  
```find /path/ -type f```
```
f for file
d for directory
l for symbolic link
b for block device
s for socket
```

3) How to search a file a file based on their own name?  
```find /path/ -name <file_name>```

4) How to ignore upper and lower case in file name while searching files?  
```find /path/ -iname <file_name>```

5) How to search files for a given user only?  
```find /path/ -user root```

6) How to search a file based on the inode no.?  
```ls -li```  
```find /path/ -inum <inode_no._of_files>```  

7) How to search a file based on the no. of links?  
```find /path/ -links <no._of_links>```  

8) How to search a file based on their permissions?  
```ls -ltr```  
```find /path/ -perm /u=r```  
```find /path/ -perm 777```  

9) How to search all the files which start with letter a?  
```find /path/ -iname a*```  

10) How to search all the files which are modified/created after last.txt file?  
```find /path/ -user last.txt```

11) How to search all the empty files in a given directory?  
```find /path/ -empty```  

12) How to search all the empty files in a given directory and at the same time delete them?  
```find /path/ -empty -exec rm {} \;```  

13) How to search all the files whose size are between 1-50 MB?  
```find /path/ -size +1M -size -50M```

14) How to search 15 days old files?  
```find /path -mtime 15```
