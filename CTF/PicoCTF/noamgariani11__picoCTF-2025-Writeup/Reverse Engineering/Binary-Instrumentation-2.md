# Description

I've been learning more Windows API functions to do my bidding. Hmm... I swear this program was supposed to create a file and write the flag directly to the file. Can you try and intercept the file writing function to see what went wrong?
Download the exe here. Unzip the archive with the password picoctf

# Solution

The unintended solution from the previous challenge works here as well.

`wget https://challenge-files.picoctf.net/c_verbal_sleep/4aee1b9778a8e56724d015b027431fb236853a94f53e5dcf32c5ed32aed404da/bininst2.zip`

Then `unzip binist2.zip` with the password `picoctf`. I first tried strings and then using `binwalk -e bininst1.exe` and then `cd _bininst2.exe.extracted/` you can see more strings. You can run `strings 6000` and look through them as you can't grep for flag this time. But when looking through the strings the base64 encoded flag is obviously there:

```
<Insert path here>
cGljb0NURntmcjFkYV9mMHJfYjFuX2luNXRydW0zbnQ0dGlvbiFfYjIxYWVmMzl9
RSDS
C:\Users\kiran\source\repos\BinaryInstrumentation3\x64\Release\BinaryInstrumentation3.pdb
GCTL
```

You can also tell that `cGljb0NUR` is the start of every flag in base64 as it represents picoCTF so you could have just grepped for that knowing how common it is to use base64 encoding on flags and based on the previous challenge. This command gives the base64 encoded flag `strings 6000 | grep cGljb0NUR` so you can then just do `strings 6000 | grep cGljb0NUR | base64 -d` to get the flag.

The intended solution wants you to use [Frida](https://frida.re/) for both challenges.

Flag: `picoCTF{fr1da_f0r_b1n_in5trum3nt4tion!_b21a...}`