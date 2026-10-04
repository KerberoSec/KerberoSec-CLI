# Sweeeeeet
Landing page:
```
Hey You, yes you!
are you looking for a flag, well it's not here bruh!
Try someplace else
```
We are given the hint that the flag is `someplace else`.
I wasn't sure about the difficulty of this CTF since I was solving problems from left to right, so I tried `/someplace/else` and `/someplaceelse` and `/someplace`, but obviously none worked.

So I tried another vector.
I noticed there is a cookie called `UID`, with a bunch of alphanumerical characters.          
I changed UID to 1 and got flag encoded in 1337speak: `You cant use this`, which was not the answer.

Then I realised that the UID is hashed in MD5.    
So I tried "1" hashed in MD5, but no luck. I was certain that this was the right path though, so I then tried again with "0". which is `cfcd208495d565ef66e7dff9f98764da` in MD5.

And we've gotten the flag!
<details>
  <summary>FLAG</summary>   
   
`encryptCTF%7B4lwa4y5_Ch3ck_7h3_c00ki3s%7D%0A` 

URL Decode gives `encryptCTF{4lwa4y5_Ch3ck_7h3_c00ki3s}`
</details>

