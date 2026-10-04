# Leviathan Level 0 --> Level 1
There is no information for this level, intentionally. 

## Solution
See files in home directory, there is nothing so lets show all hidden files
```bash
leviathan0@leviathan:~$ ls
leviathan0@leviathan:~$ ls -a
.  ..  .backup  .bash_logout  .bashrc  .profile
```
.backup file seems contain something important lets see
```console
leviathan0@leviathan:~$ cd .backup/
leviathan0@leviathan:~/.backup$ ls
bookmarks.html
```
this file contain many lines, grep command will help alot here
```console
leviathan0@leviathan:~/.backup$ grep pass bookmarks.html 
<DT><A HREF="http://leviathan.labs.overthewire.org/passwordus.html | This will be fixed later, the password for leviathan1 is rioGegei8m" ADD_DATE="1155384634" LAST_CHARSET="ISO-8859-1" ID="rdf:#$2wIU71">password to leviathan1</A>
```

## Password
> rioGegei8m

