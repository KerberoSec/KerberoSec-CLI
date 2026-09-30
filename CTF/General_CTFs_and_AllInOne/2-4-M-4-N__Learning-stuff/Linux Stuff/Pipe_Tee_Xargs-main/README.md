source : [here](https://youtu.be/uF7hFCThf4g?si=TP8mwo0Lg8isPQ5r)

<h1><i>Pipe Command basic explain and example.</i></h1>
<b>Pipes are used to redirect a stream from one program to another program.</b><br>

<b>- Use ```|``` symbol to separate two commands.</b><br>
<b>- example is like open a terminal screen then type ```ps -ef | grep httpd``` </b> 

1) Find NO. of files present in a directory.  
    ```cd /etc```  
    ```ls -l | wc -l```

2) There are two files like name.txt and country.txt. Combine both files content using cat and sort it.  
    ```cat names.txt country.txt | sort```

3) Find unique records from a file names.txt  
    ```cat names.txt | sort | uniq```

4) How to see only 30-37th line in a file of 100 lines?  
    ```cat data.txt | head -38 | tail -7```

5) How o show a output as more?  
```netstat | more```

6) How to show a output as less?
```netstat | less```

<h1><i> TEE commands </i></h1>

<b>Tee reads standard input and copies it both to stdOutput and to a file. We can see the information going through pipeline. </b>  

Example: ```ls | tee file.txt```  

<h1><i> XARGS </i></h1>

<b> It converts the stdinput into command line argument </b>

example: ```ls | xargs echo "hello"```  

<h1><i> To do: </i></h1>

file1, file2, file3, file4, file5  

Now take/read the name from FileNames.txt and create those number of files in the present directory.  

```cat FileNames.txt | xargs touch```

