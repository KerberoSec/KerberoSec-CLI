# Do Stars Spin? 1

##### Category: osint, misc

```
PMP was walking by earlier, muttering something about "stars". I think he's said something about it before. I also want to know: do stars spin? I'd search for it, but I'm too busy. I think he's mentioned something about stars somewhere…help me out?

Author: JC01010
```

With something as vague as this and the Discord button standing out from the usual CTFd interface, I decided to join the Discord.

The oldest message in the `#general` channel was this:

```
PMP05/24/2019
does anyone actually use this server

Hello, HSCTF 7!
I'm sure we've all asked the age-old question: Do stars even spin? (No, we haven't. JC put me up to this.)
Hm, I wonder… dostarsevenspin? Time to ask reddit!
cuz it sure looks like no one does
```

From here, we got 2 keywords: `dostarsevenspin` and `reddit`.

Searching reddit quickly brings us to a post by user `dostarsevenspin` claiming that his account has been hacked and posts deleted.

Searching more on google again, we get a [deleted post that references the BEE SCRIPT](https://www.reddit.com/user/dostarsevenspin/)

Since using the usual `ceddit` and `removeddit` didn't work: probably because the post was deleted in 10 min and was not on a subreddit but on a user page, I had to resort to the Wayback Machine, which returns a page with all the deleted posts from the user.

This is the [page](https://web.archive.org/web/20200527041338/https://www.reddit.com/user/dostarsevenspin/)

The flag is printed twice on the page, which gives us the solve! 

<details>
    <summary>FLAG</summary>
    
    flag{7t3rE_i5_n0_wAy_a_be3_sh0u1d_BEE_ab13_t0_f1Y_89a89fe1}
</details>
