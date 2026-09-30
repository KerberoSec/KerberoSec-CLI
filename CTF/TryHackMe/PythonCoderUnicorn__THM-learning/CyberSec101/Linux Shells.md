
#Linux 

https://tryhackme.com/r/room/linuxshells

https://medium.com/@Z3pH7/tryhackme-linux-shells-cyber-security-101-thm-091f6c0c1a20

You may have seen hacking scenes in movies that show cool terminals with many commands getting executed. This is because most Linux users prefer to perform operations by writing commands on the CLI using shells instead of using the GUI. This room will teach us how to interact with a Linux shell. We will also explore different shells available in Linux and write some shell scripts in the end.

```
Who is the facilitator between the user and the OS?

shell

pwd
cd ~
ls
cat 
grep
```

## types of shells

Like the Command Prompt and PowerShell in Windows OS, Linux has different types of shells available, each with its own features and characteristics.

Multiple shells are installed in different Linux distributions. To see which shell you are using, type the following command:

```
echo $SHELL
cat /etc/shells
zsh 

# to permanently change default shell
chsh -s /usr/bin/zsh

history

```

### Friendly Interactive Shell

Friendly Interactive Shell (Fish) is also not default in most Linux distributions. As its name suggests, it focuses more on user-friendliness than other shells. Some of the key features provided by fish are listed below:

- It offers a very simple syntax, which is feasible for beginner users.
- Unlike bash, it has auto spell correction for the commands you write.
- You can customize the command prompt with some cool themes using fish.
- The syntax highlighting feature of fish colors different parts of a command based on their roles, which can improve the readability of commands. It also helps us to spot errors with their unique colors.
- Fish also provides scripting, tab completion, and command history functionality like the shells mentioned in this task.

### Z Shell

Z Shell (Zsh) is not installed by default in most Linux distributions. It is considered a modern shell that combines the functionalities of some previous shells. Some of the key features provided by zsh are listed below:

- Zsh provides advanced tab completion and is also capable of writing scripts.
- Just like fish, it also provides auto spell correction for the commands.
- It offers extensive customization that may make it slower than other shells.
- It also provides tab completion, command history functionality, and several other features.

```
Which shell comes with syntax highlighting as an out-of-the-box feature?
fish

Which shell does not have auto spell correction?
bash

Which command displays all the previously executed commands of the current session?
history

```

## shell scripting and components 

`nano mybash.sh`

```shell
#!/bin/bash
echo "hey, what is your name?"
read name
echo "welcom $name"
```

`chmod +x mybash.sh`
`./mybash.sh`

```shell
#!/bin/bash
for i in {1..10};
do
echo $i 
done

```

conditional statements

```shell
#!/bin/bash
echo "Enter username: "
read username
if [ "$username" = "ninja" ]; then
     echo "Welcome Ninja!"
else
     echo "Not authorized"
fi
```

## locker script 

```
username: John
company: TryHackMe
PIN: 7385
```

```shell
# Defining the Interpreter 
#!/bin/bash 

# Defining the variables
username=""
companyname=""
pin=""

# Defining the loop
for i in {1..3}; do
# Defining the conditional statements
        if [ "$i" -eq 1 ]; then
                echo "Enter your Username:"
                read username
        elif [ "$i" -eq 2 ]; then
                echo "Enter your Company name:"
                read companyname
        else
                echo "Enter your PIN:"
                read pin
        fi
done

# Checking if the user entered the correct details
if [ "$username" = "John" ] && [ "$companyname" = "Tryhackme" ] && [ "$pin" = "7385" ]; then
        echo "Authentication Successful. You can now access your locker, John."
else
        echo "Authentication Denied!!"
fi
```

## exercise 

We have placed a script on the default user directory `/home/user` of the attached Ubuntu machine. This script searches for a specific keyword in all the files (with .log extension) in a specific directory.

```
directory="/var/log"
flag="thm-flag01-script"
"$directory"/*.log;

grep "cat" /var/log/authentication.log
```

