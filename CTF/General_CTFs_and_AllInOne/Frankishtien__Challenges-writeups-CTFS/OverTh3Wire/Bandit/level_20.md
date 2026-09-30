# level 20

```
ssh bandit20@bandit.labs.overthewire.org -p 2220 
```

0qXahG8ZjOVMN9Ghs7iOWsCfZyXOUbYO

-   You have an executable file called `suconnect`

-   The file **setuid**, meaning when you run it, it runs with the privileges of the file owner (bandit21) and not with your normal privileges.

-   The `suconnect` takes **port number as an argument** when you turn it on.

- Then it establishes a connection to `localhost` on the port you specified.

- The program then reads the line of the connection and compares it with the password of `bandit20`.

-   If the password you sent is correct, the program will send you the password for `bandit21`.

<img width="1287" height="114" alt="image" src="https://github.com/user-attachments/assets/b3ad0190-31e5-4cd5-8f49-1ffdfd994608" />

```
echo "0qXahG8ZjOVMN9Ghs7iOWsCfZyXOUbYO" | netcat -lp 1234 &
```

- The `-l` flag is used to setup an listener and the `-p` flag is used to specify the port the the listener should listen on. As we have not specified IP Address the listener is going to run on `localhost`.

The `"&"` at the end of the command is used to specify that we want the command to run in the background. The `jobs` command can be used to view all the processes/ jobs on the system

```
jobs
./suconnect 1234
```

<img width="901" height="197" alt="image" src="https://github.com/user-attachments/assets/dba5d995-6d8a-4e74-a649-e079ee09811d" />

```
EeoULMCra2q0dSkYj561DX7s1CpBuOBt
```

