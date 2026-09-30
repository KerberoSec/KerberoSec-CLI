### CTF Discription:
```txt
A Junior Developer just switched to a new source control platform.
Can you find the secret token?
```

---

Unzipping the given file:
```zsh
$ unzip Illumination.zip
```

_Pass in `hackthebox` as the password when prompted._

<br>

When we have a look at the contents of `Illumination.JS/config.json`, one can quickly see that the `"username"` field has a base64 encoded string. This can be decoded like so:

```zsh
$ echo "UmVkIEhlcnJpbmcsIHJlYWQgdGhlIEpTIGNhcmVmdWxseQ==" | base64 -d
Red Herring, read the JS carefully
```

Following the instructions, we need to go through the `bot.js` file.

Nothing special there, however, there's a `.git` directory as well, so we can use the `git log` command to see the logs from previous commits:

```zsh
$ git log

commit edc5aabf933f6bb161ceca6cf7d0d2160ce333ec (HEAD -> master)
Author: SherlockSec <dan@lights.htb>
Date:   Fri May 31 14:16:43 2019 +0100

    Added some whitespace for readability!

commit 47241a47f62ada864ec74bd6dedc4d33f4374699
Author: SherlockSec <dan@lights.htb>
Date:   Fri May 31 12:00:54 2019 +0100

    Thanks to contributors, I removed the unique token as it was a security risk. Thanks for reporting responsibly!

commit ddc606f8fa05c363ea4de20f31834e97dd527381
Author: SherlockSec <dan@lights.htb>
Date:   Fri May 31 09:14:04 2019 +0100

    Added some more comments for the lovely contributors! Thanks for helping out!

commit 335d6cfe3cdc25b89cae81c50ffb957b86bf5a4a
Author: SherlockSec <dan@lights.htb>
Date:   Thu May 30 22:16:02 2019 +0100

    Moving to Git, first time using it. First Commit!
```

For shorter message:

```zsh
$ git log --oneline

edc5aab (HEAD -> master) Added some whitespace for readability!
47241a4 Thanks to contributors, I removed the unique token as it was a security risk. Thanks for reporting responsibly!
ddc606f Added some more comments for the lovely contributors! Thanks for helping out!
335d6cf Moving to Git, first time using it. First Commit!
```

<br>
<br>

Now, as we can see, in the commit: `335d6cfe3cdc25b89cae81c50ffb957b86bf5a4a` or `335d6cf`, the message says that a security token was removed, so we can try and revert to the mentioned commit:

```zsh
$ git reset --hard 335d6cf
HEAD is now at 335d6cf Moving to Git, first time using it. First Commit!

$ cat config.json

{

        "token": "SFRCe3YzcnNpMG5fYzBudHIwbF9hbV9JX3JpZ2h0P30=",
        "prefix": "~",
        "lightNum": "1337",
        "username": "UmVkIEhlcnJpbmcsIHJlYWQgdGhlIEpTIGNhcmVmdWxseQ==",
        "host": "127.0.0.1"

}
```

As we can see, the `"token"` field now has the token mentioned previously. It's encoded in base64 as well, so let's see what it says after decoding.

```zsh
$ echo "SFRCe3YzcnNpMG5fYzBudHIwbF9hbV9JX3JpZ2h0P30=" | base64 -d
HTB{v3rsi0n_c0ntr0l_am_I_right?}
```

Well, there's the flag! :)

---

### The Flag:
    HTB{v3rsi0n_c0ntr0l_am_I_right?}

Link to the challenge: [Illumination](https://app.hackthebox.eu/challenges/illumination)
