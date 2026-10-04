Let's connect to the remote-machine using over simple script to make our workflow-easy!
Let's name our BASHing script as `connect.sh` and open it using the nano command-line editor as;

```
$ nano connect.sh
```

>> Let's write some script...
```
#!/bin/bash

# `connect.sh` connect to the remote machine to complete a certain level of overthewire/bandit
ssh bandit${1}@bandit.labs.overthewire.org -p 2220
```

DAMN! It's cool right? </br>
We don't have to type this whole thing again and again like<br/>
...while logging into bandit0: `ssh bandit0@bandit.labs.overthewire.org -p 2220`<br/>
>> or
for bandit1 as `ssh bandit1@bandit.labs.overthewire.org -p 2220` <br/>
. <br/>
. <br/>
. <br/>
until for bandit33 as `ssh bandit33@bandit.labs.overthewire.org -p 2220`.

Everytime we just have to simply execute our script as: `./connect.sh <number-at-the-end-of-username>`. <br/>
Isn't this COOL! Of course it is...<br/>

Let's start working, now.
