```
_-_-                          ,  ,,                      _-_-                     ,,        /\  
 /,           ;     '   _    ||  ||      _                /,           ;          ||       (  ) 
 ||      _-_  \\/\ \\  < \, =||= ||/\\  < \, \\/\\        ||      _-_  \\/\  _-_  ||         // 
~||     || \\ || | ||  /-||  ||  || ||  /-|| || ||       ~||     || \\ || | || \\ ||        //  
 ||     ||/   || | || (( ||  ||  || || (( || || ||        ||     ||/   || | ||/   ||       /(   
(  -__, \\,/  \\/  \\  \/\\  \\, \\ |/  \/\\ \\ \\       (  -__, \\,/  \\/  \\,/  \\       {___ 
                                   _/                                                           
```
Find the password for *leviathan2* to log in with via SSH at port *2223* through
`ssh -o PreferredAuthentications=password -o PubkeyAuthentication=no
leviathan2@leviathan.labs.overthewire.org -p 2223`. [^1]

Solution
----------------------------------------------------------------------------------------
Upon logging in to *leviathan1* via SSH, we are prompted with a `check` binary which
asks us for a password and tells us the next level's password only if it matches. It is
our objective now to find out, what it checks against. For that, we try out multiple
tools, such as `strings` and `gdb`, but it is `ltrace` that gives us the clue. By 
running `ltrace ./check` we were able to input a dummy password "test" and then see what
it evaluates it against. In `strcmp("tes", "sex")` we were able to spot the likely clue
to the password, a string comparison to "sex". And indeed, upon entering the password
"sex" to the binary prompt, we are given shell access to the next level's user. Then, we
remember that all passwords are saved under `/etc/leviathan_pass` and can thus print the
*leviathan2* password with `cat /etc/leviathan_pass/leviathan2`.

[^1]: https://overthewire.org/wargames/leviathan/leviathan2.html
