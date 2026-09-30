```                                                                                             
_-_-                          ,  ,,                      _-_-                     ,,        /|  
 /,           ;     '   _    ||  ||      _                /,           ;          ||       /||  
 ||      _-_  \\/\ \\  < \, =||= ||/\\  < \, \\/\\        ||      _-_  \\/\  _-_  ||        ||  
~||     || \\ || | ||  /-||  ||  || ||  /-|| || ||       ~||     || \\ || | || \\ ||        ||  
 ||     ||/   || | || (( ||  ||  || || (( || || ||        ||     ||/   || | ||/   ||        ||  
(  -__, \\,/  \\/  \\  \/\\  \\, \\ |/  \/\\ \\ \\       (  -__, \\,/  \\/  \\,/  \\       ,/-' 
                                   _/
```
Find the password for *leviathan1* to log in with via SSH at port *2223* through
`ssh -o PreferredAuthentications=password -o PubkeyAuthentication=no
leviathan1@leviathan.labs.overthewire.org -p 2223`. [^1]

Solution
----------------------------------------------------------------------------------------
In the home directory, we enter `ls -la` to determine the group and user ownership for
`.backup` which turns out to have *leviathan1* as the owner and *leviathan0* as the
group. So, we investigate this directory which contains a `bookmarks.html` file with
a long list of bookmarks. On suspicion, we search for the *password* here with the
command `cat bookmarks.html | grep -i "password"` and succeed.

[^1]: https://overthewire.org/wargames/leviathan/leviathan1.html
