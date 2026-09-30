source : [here](https://youtu.be/ZysmaEbw2wE?si=o8ZTFnQADI10Ckdz)

## What is SUID?

The special permission for the user.  
A file with SUID set always executes as the user who owns the file, regardless of the user executing the command.  

show as 's' or 'S'  

## How to set/unset SUID?

- ```chmod u+s file_name```  
- ```chmod u-s file_name```

## What is SGID?

If set on a file, it allows the file to be executed asroup that owns the file.  
If set on a directory, any files created in the directory will have their __group ownership set to that of the directory owner__  

It is also especially useful for directories that are often used in collaborative efforts between members of a group. Any member of the group can access any file.  

## How to set/unset GUID

- ```chmod g+s file_name```
- ```chmod g-s file_name```

