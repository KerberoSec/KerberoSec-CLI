# Bandit Level 22

This time we have another program that runs at regular intervals, and are again told that looking in `/etc/cron.d`.

Looking at the cronjob `cronjob_bandit23`, it runs a script at `/usr/bin/cronjob_bandit22.sh`

Running this script gives us the following debug message:

The shell script that it runs is as follows:

```sh
#!/bin/bash

myname=$(whoami)
mytarget=$(echo I am user $myname | md5sum | cut -d ' ' -f 1)

echo "Copying passwordfile /etc/bandit_pass/$myname to /tmp/$mytarget"

cat /etc/bandit_pass/$myname > /tmp/$mytarget
```

We can see that this script copies the password file to `/tmp` with a special filename. We can re-create this filename ourselves to find the file.
> `cat /tmp/$(echo I am user bandit23 | md5sum | cut -d ' ' -f 1)`

Running this command reveals the password: `QYw0Y2aiA672PsMmh9puTQuhoz8SyR2G`
