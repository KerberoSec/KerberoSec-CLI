source : [here](https://youtu.be/DKPhqK2K2VQ?si=4-pPe53MhcKk0p-D)

## Here are some Wildcards and Regex overview ##
~ __Wildcards are special character that represents one or more character in filenames or commands, allowing users to select multiple files at once.__
1) Asterisk ```*```: Matches any number of character, including none.  
 Example: ```*.txt``` matches all files ending with '.txt'.
2) Question Mark ```?```: Matches exactly one character or single character.  
Example: ```file?.txt``` matches ```file1.txt```, ```file2.txt```, etc.
3) Square Brackets ```[]```: Matches any one of the enclosed characters.  
Example: ```file[12].txt``` matches ```file1.txt``` and ```file2.txt```.
4) Curly Braces ```{}```:Matches a group of patterns.  
Example: ```file{1,2}.txt``` matches ```file1.txt``` and ```file2.txt```  
5) Caret ```^```: Matches the start of a line  
Example: ```^Hello``` matches any line starting with "Hello"
6) Dollar Sign  ```$```: Matches the end of a line.  
Example: ```world$``` matches any line ending with "world"

---
__How to find all the XML files in a directory__  

- ```ls *.xml```  

__Create 100 files like file1 file2...file100 and show only files__

- ```touch file{1..100}```
- ```ls file*```

__Delete 100 files like file1 file2...file100__

- ```rm file{1..100}```

__Find all the files with name ```_123``` (where ```_``` can be any character)__

- ```ls ?123```

__Find all the files whose name is exactly 4 character ex a123, test...__

- ```ls ????```

__Find files whose name start with a,b, or c/b,c or d__

- ```ls [abc]*```
- ```ls [bcd]*```

__Find files whose name include numeric__

- ```ls *[1-9]*```

__Find files whose name include alphabetic lower case/uppercase__

- ```ls *[a-z]*```
- ```ls *[A-Z]*```

__Find all files that start with "test" and have exactly 6 character in their name (e.g., test01, test99)

- ```ls test??```

__Find all files that have atleast one underscore in their name__

- ```ls *_*```

__List all files that do not contain the letter "e" in their name__

- ```ls | grep -v 'e'```

__Find all files that start with a capital letter [A-Z]__

- ```ls [A-Z]*```

---

### Questions:

__1) How would you list all files that start with the letter "a" amd emd with.sh in the current directory?__

- ```ls a*sh```

__2) What command would you use to move all files with a .jpg extension to the images directory?__

- ```ls *.jpg```
- ```mv *.jpg images/```

__3) How can you delete all files that have "backup" somewhere in their filename?__

- ```ls  *backup*```
- ```rm *backup*```

__4)  Write a grep command to find lines that contain a date in the format YYYY-MM-DD in a file.__

- grep -E '/b[0-9]{4}-[0-9]{2}-[0-9]{2}\b` dates.txt
