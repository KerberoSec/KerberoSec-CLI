# Post Practice

This was really an easy challenge, I don't know why they put it in Medium difficulty. link: http://165.227.106.113/post.php

## Solution

When you inpect the site's source... It will give you the following comment:

```<!-- username: admin | password: 71urlkufpsdnlkadsf -->```

And the description says that you need to make a POST request. So I used ```curl``` here, to make that POST request providing the data given in the comment of the site.

```curl -X POST --data "username=admin&password=71urlkufpsdnlkadsf" http://165.227.106.113/post.php```

![Image 1](https://github.com/belikeParamjot/WriteUps/blob/master/CTFlearn/Post%20Practice/1.png)

__Flag__: flag{p0st_d4t4_4ll_d4y}
