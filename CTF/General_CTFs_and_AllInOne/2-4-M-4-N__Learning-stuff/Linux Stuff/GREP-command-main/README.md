
# GREP command overview_

__- <i>"Global Regular Expression Print"</i>__

__<i>Grep command search for a particular string/keyword from a file and print lines matching a pattern.__

__It check line by line and print lines matching given pattern.
It can use anywhere like with files, searching for file, directories etc.__

__Grep Command Syntax :__ ``` grep [OPTION] Pattern [File]. ```

__Example:__ ```grep User file.csv```

__1) To ignore the upper and lower case while searching.__<br>
```grep -i "keyword" file.```

__2) To search everything except given pattern/keyword.__<br>
```grep -v "keyword" file```

__3) To print how many times (count) given keyword present in file.__<br>
```grep -c "keyword" file```

__4) To search for exact match of given keyword in a file.__<br>
```grep -w "keyword" file```

__5)  To print the line NO. of matches of given keyword in a file.__<br>
```grep -n "keyword" file```

__6) To search a given keyword in multiple files.__<br>
```grep "keyword" file1 file2```<br>
     __NOTE: by default result of multiple files shows file name in output.__<br>

__7) To supress file names while search a given keyword in multiple files.__<br>
```grep -h "keyword" file1 file2```

__8) To search multiple keywords in a file.__<br>
```grep -e "keyword1" -e "keyword2" file```<br>
```egrep "keyword|keyword|keyword" file```

__9) To search multiple keywords in multiple files__<br>
```grep -e "keyword1" -e "keyword2" file1 file2 file3```

__10) To only print file names which matched given keyword.__<br>
```grep -l "keyword" file1 file2```

__11) To get the keywords/pattern from a file and match with a another file.__<br>
```grep -f keyword.txt file```<br>
```grep -f keyword.txt *```

__12) To print the matching line which start with given keyword.__<br>
```grep "^keyword" file```<br>

__13) To print the matching line which end with given keyword.__<br>
```grep "keyword$" file```<br>

__14) Suppose we have 100 files in a directory (dirA) and we need to search a keyword in all the files.__<br>
```grep -R "keyword" dirA/```<br>
```grep "keyword" dirA/*```<br>

To chcek previous command seccess or not then type:```echo $?```<br>
If output is ```0``` then it was succeed but output is ```1``` then not succeed.

__15) If just wanna search but don't want to print on terminal.__<br>
```grep -q "keyword" file```

__16) If you want to suppress error message.__<br>
```grep -s "keyword" file```</i>

