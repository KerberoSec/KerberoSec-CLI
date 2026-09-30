```
      ___                         ___           ___           ___     
     /  /\          ___          /  /\         /  /\         /  /\    
    /  /::\        /  /\        /  /::\       /  /::\       /  /:/    
   /  /:/\:\      /  /::\      /  /:/\:\     /  /:/\:\     /  /:/     
  /  /::\ \:\    /  /:/\:\    /  /:/  \:\   /  /:/  \:\   /  /::\ ___ 
 /__/:/\:\ \:\  /  /::\ \:\  /__/:/ \__\:\ /__/:/ \  \:\ /__/:/\:\  /\
 \  \:\ \:\_\/ /__/:/\:\_\:\ \  \:\ /  /:/ \  \:\  \__\/ \__\/  \:\/:/
  \  \:\ \:\   \__\/  \:\/:/  \  \:\  /:/   \  \:\            \__\::/ 
   \  \:\_\/        \  \::/    \  \:\/:/     \  \:\           /  /:/  
    \  \:\           \__\/      \  \::/       \  \:\         /__/:/   
     \__\/                       \__\/         \__\/         \__\/    
```
Be honest, you have always wanted an online tool that could help you convert UNIX dates 
and timestamps! Wait... it doesn't need to be online, you say? Are you telling me there 
is a command-line Linux program that can already do the same thing? Well, of course, we 
already knew that! Our website actually just passes your input right along to that 
command-line program! [^1]

Find the flag in this vulnerable web application!
-----------------------------------------------------------------------------------------
Upon reading this introduction text and providing some sample input into the web 
application, we immediately suspect a command injection vulnerability. Therefore, if we 
are to enter *12*, we get the result `Thu Jan  1 00:00:12 UTC 1970`, but if we are to
enter `; echo 'TEST'` we get the result `date: invalid date '@'"` followed by the result
of our command *TEST*. So, we are able to trick the web application into executing 
commands of our liking, and so we try the `ls`, `pwd` and `cat` commands to find out more
about the system. This does however, not lead us to any interesting findings and with the
help of the hint, we print the environment variables with `1; env` and get the environment
variables, containing the flag and more.
```
Thu Jan  1 00:00:01 UTC 1970
HOSTNAME=e7c1352e71ec
PWD=/home/challenge
HOME=/home/challenge
GOLANG_VERSION=1.15.7
FLAG=<REDACTED>
SHLVL=1
PATH=/usr/local/go/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
_=/usr/bin/env
```

[^1]: https://tryhackme.com/room/epoch
