```ls -ltr```

__Each permission set can contain four basic representations:__
- r means that the file is readable.
- w means that the file is writable.
- x means that the file is executable (you can run it as a program)
- ```-``` means "nothing" (more specifically, the permission for that slot in the set has not been granted).

__How to modify permissions of a file?__

```chmod a+rwx file.txt```  
```u``` means user.  
```g``` means group.
```o``` means other.
```a``` means all.  

