# Commitment Issues

## Description

I accidentally wrote the flag down. Good thing I deleted it!
You can download the challenge files here:
[challenge.zip](https://github.com/erfanghorbanee/picoCTF-2024/blob/main/General%20Skills/Commitment%20Issues/challenge.zip)

## Solution

unzip the file and go to the drop-in directory in your terminal. now, run ```git log``` command to view the commits:

```git
git log

commit ef0b7cc6b98367fa168573c931e0f7098ef59182 (HEAD -> master)
Author: picoCTF <ops@picoctf.com>
Date:   Tue Mar 12 00:06:20 2024 +0000

    remove sensitive info

commit ea859bf3b5d94ee74ce5ee1afa3edd7d4d6b35f0
Author: picoCTF <ops@picoctf.com>
Date:   Tue Mar 12 00:06:20 2024 +0000

    create flag
```

now, you can run ```git show``` to view any commit using their hash code.

```git
git show ef0b7cc6b98367fa168573c931e0f7098ef59182

commit ef0b7cc6b98367fa168573c931e0f7098ef59182 (HEAD -> master)
Author: picoCTF <ops@picoctf.com>
Date:   Tue Mar 12 00:06:20 2024 +0000

    remove sensitive info

diff --git a/message.txt b/message.txt
index fca28bb..d552d1e 100644
--- a/message.txt
+++ b/message.txt
@@ -1 +1 @@
-picoCTF{s@n1t1z3_cf09a485}
+TOP SECRET
```

Congrats! you found the flag!
