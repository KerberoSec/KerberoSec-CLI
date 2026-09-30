# HideToSee Writeup

This one was messing with my head and for some reason no one in my team remembered to do this but here's the (easy) solution.

The hint said to extract it so by using the tool StegHide we get the encrypted flag easily.

```steghide --extract -sf atbash.jpg``` extracts the contents of the image to a separate file that when opened reveals to us:

`krxlXGU{zgyzhs_xizxp_8z0uvwwx}`

Now we pass this mess through any AtBash online decypher and we get `picoCTF{atbash_crack_8a0feddc}`.