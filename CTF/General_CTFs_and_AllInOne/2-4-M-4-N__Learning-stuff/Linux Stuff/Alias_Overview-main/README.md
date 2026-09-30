source : [here](https://youtu.be/YdXxYxeMuos?si=E_D6Oj6GI5_j5ste)

## What is Alias?  
A custom shortcut that represents  
- A longer command or
- Series of commands

__Syntax :__  
```alias short_name="your command"```  
__Example:__  
```alias l="ls"```

To find exisiting Alias type ```alias -p```  

__Use-Case of Alias__
- Customizing Commands
- Shortening Lengthy Commands
- Navigating Directories
- Personalizing Commands  

__Example:__  
Let's backup to the Downloads folder.  
```tar -czvf backup1.tar.gz Downloads/```
ls user will found a ```tar.gz``` file which is backup file  
```alias backup="tar -cvzf"```  
```backup backup2.tar.gz Downloads/```  
After writing this command user will found two backup file like one is ```backup1.tar.gz``` and another is by alias command ```backup2.tar.gz```

Suppose a user have a directory which he use that frequently. User can create a shortcut for directory entering using ```alias``` command. Like normally user write like ```cd /home/Desktop``` but after ```alias``` command it will look like ```alias mydirectory="cd /home/Desktop"```. User can now go to that directory as a single command by writing ```mydirectory```.  

But one thing is this ```alias``` are temporary . To need as a permanent ```alias``` user should need to write ```.bashrc```  
```ls -la```  
```vi .bashrc```  
```press i for INSERT```  
```alias rm="rm -i"```  
```press ESC then shift+:wq```  
```source .bashrc```  

If this alias user want to make globally then user should have to define this alias in ```/etc``` folder  

__Benefits of Alias:__
- Saves time and efforts
- Increase productivity
- Reduce risk of errors
- Improved readability

