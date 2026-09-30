source : [here](https://youtu.be/Et2cvQvIyUY?si=opbTShHwZ9VB8YUA)

## What is ACL?  
It allows you to give more specific set of permissions to a file or directory without changing the base ownership and permissions.  

__Commands:__ ```setfacl``` & ```getfacl```  
__Example:__ ```setfacl file.txt```  

### Commands for ACL

- For addin permission for user
```setfacl -m u:user:rwx file.txt```  
- For adding permission for group
```setfacl -m g:group:rwx file.txt```  
- To remove a specific entry
```setfacl -x u:user:rwx file.txt```
- To remove all entires
```setfacl -b file.txt```
- For adding permission for all user in all the files inside a folder
```set -Rm "entry" file.txt/TxtFolder```

