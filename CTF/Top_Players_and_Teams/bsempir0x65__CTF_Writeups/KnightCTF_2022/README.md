# <a name="Introduction"></a>Introduction

A new Year a new CTF to challenge. This time we went to Bangladesh <img class="emoji" alt="bangladesh" src="https://github.githubassets.com/images/icons/emoji/unicode/1f1e7-1f1e9.png" width="20" height="20"> and found a neat little ctf with some easy tasks which gave us a nice exercise. Hope you could enjoy it too despite the issues in the beginning.

# <a name="Canada_Server"></a>Canada Server

 <img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/KnightCTF_2022/img/KnightCTF_Canada_Server.png" alt="Canada Server" width="50%" height="50%">

As with most of the OSINT we started with a little search. Based on the given informations from the task we tried *NS TechValley Canada* and without further search we already had our first hit, literally.

 <img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/KnightCTF_2022/img/KnightCTF_Canada_Server_1.png" alt="Google Search" width="50%" height="50%">

So the flag based on the format is KCTF{192.99.167.83}. Wuhhu nice first 5 minutes of the event <img class="emoji" alt="robot" src="https://github.githubassets.com/images/icons/emoji/unicode/1f916.png" width="20" height="20">.

# <a name="How's_the_Shark"></a>How's the Shark

 <img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/KnightCTF_2022/img/KnightCTF_Hows_the_Shark.png" alt="Hows the Shark" width="50%" height="50%">

This time we got an pcap file to look into. When we first checked the TCP stream we found out that this was a capture of a client server connection to a webside. The first thing we checked was the easy one by searching for the flag via the flagformat *KCTF*. Funny enough the creators put a fake flag into the capture.

 <img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/KnightCTF_2022/img/KnightCTF_Hows_the_Shark_1.png" alt="Fake_FLAG_LOL" width="75%" height="75%">

You never know what chall creator think so we tried *KCTF{Fake_FLAG_LOL}, with no success. Next step was that nothing was in String format we checked the files transfered during the connection by exporting all of them to our local drive. Lots of garbage in it but one which got our attention. Not sure why but something special was about it, something (⋆._.)⊃▁⛥⌒*ﾟ.❉・゜・。.

 <img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/KnightCTF_2022/img/KnightCTF_Hows_the_Shark_2.png" alt="something" width="75%" height="75%">

With that we had our flag *KCTF{A_ShaRk_iN_tHe_WirE}*

# <a name="Keep_Calculating"></a>Keep Calculating

 <img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/KnightCTF_2022/img/KnightCTF_Keep_Calculating.png" alt="Keep Calculating" width="50%" height="50%">

With the Programming tasks we had some issues cause it was not quite clear how the functions needs to be implemented. So for example when you take the task here based on the math x would never change so how do you reach 666 ? Regardless of this issue our Math Magicians <img class="emoji" alt="magic_wand" src="https://github.githubassets.com/images/icons/emoji/unicode/1fa84.png" width="20" height="20"> solved the task with no issues. Hope this little neat code can also help you.

```python
def f(x, y):
    if y != 0:
        a = math.floor(math.log10(y))
    else:
        a = -1

    return int(x*10**(1+a)+y)

def calc(a, x, y):
    a += (x * y) + f(x, y)
    print("X: ", x, " A: ", a)
    if x > 666:
        print("Doooooop")
        return "wrong"
    if x != 666:
        x += 1
        calc(a, x, y)
        return
    if x == 666:
        print("X: ", x, " A: ", a)
        print("correct")
    return "finished"

x = 1
y = 2
a = 0
print(f(1,2))
calc(a, x, y)
```

P.S: Yes the import is missing and the flag is *KCTF{2666664}* 

# <a name="Square_Sum"></a>Square Sum

 <img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/KnightCTF_2022/img/KnightCTF_Square_Sum.png" alt="Square Sum" width="50%" height="50%">

Here we had kind of the same issue but it was more or less clear what we were searching. So our magician swang his wand and we have this time R code:
```r
myfunction <- function(n) {
  out <- NULL
  for(a in 1:floor(sqrt(n))) {
    b <- floor(sqrt(n - a^2))
    if(a^2 + b^2 == n) {
      out <- rbind(out, c(a, b))
    }
  }
  return(out)
}
```
So the flag was *KCTF{90,130}*  

# <a name="The_Flag_Vault"></a>The Flag Vault

 <img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/KnightCTF_2022/img/KnightCTF_The_Flag_Vault.png" alt="The Flag Vault" width="50%" height="50%">

This one was a tricky one. So after checking the event other solutions out it seems that the cool kids just us IDA and that's it. But we were clever enough to try it differently. Gimme the power Hydra <img class="emoji" alt="snake" src="https://github.githubassets.com/images/icons/emoji/unicode/1f40d.png" width="20" height="20">.

  <img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/KnightCTF_2022/img/KnightCTF_The_Flag_Vault_1.png" alt="Ghidra" width="75%" height="75%">

We saw in the decompiler view that it seemed to be an easy check wether you have the password or not. The password is stored in local_28 we thought at least. So ghidra said that in local_28 *adacarba* is saved. Silly us is that it was meant to be read from the end to the beginning. So it should be *abracada* read. We figured that afterwards out by checking the hexview of the file. But we could not figure out why local_20 was also part of the searched string. We guessed it after the event we went back to the hexview. So we have a new entry in our bucket list

 - [ ] Figure out how assembler works

So what we did was going over all the variables in the Congratulation part of the Programm and ended up with the flag *KCTF{welc0me_t0_reverse_3ngineering}*. So yeah we did not had the password but the patiences to go over each variable and check the value in it. Lucky us each variable was only one character so it did not matter which way you read out the Hex value.

# <a name="The_Hungry_Dragon"></a>The Hungry Dragon

 <img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/KnightCTF_2022/img/KnightCTF_The_Hungry_Dragon.png" alt="The Hungry Dragon" width="50%" height="50%">

For this one we got an .3mf file, which we had no clue for what it is. After a quick search it turned out that .3mf files are used for 3D printers to print what ever you want [3mf](https://en.wikipedia.org/wiki/3D_Manufacturing_Format). According to our search its xml based but not readable with a text editor. 
Again a quick search and we tool the first online 3mf viewer:

 <img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/KnightCTF_2022/img/KnightCTF_The_Hungry_Dragon_1.png" alt="The Hungry Dragon" width="50%" height="50%">

Whatever that was, was not helpful. So we tried the next Tool and found something really helpful [3mf viewer](https://3dviewer.net/):

https://user-images.githubusercontent.com/87261585/151245913-7f715f6f-abbc-4824-8a34-82d22da59510.mp4

<video width="75%" height="75%" controls>
  <source src="https://user-images.githubusercontent.com/87261585/151245913-7f715f6f-abbc-4824-8a34-82d22da59510.mp4" type="video/mp4">
  https://user-images.githubusercontent.com/87261585/151245913-7f715f6f-abbc-4824-8a34-82d22da59510.mp4
</video>

As you could see we just needed to count the doughnut and sweets we found here which was pretty easy now. Based on the Flag format the flag was *KCTF{3_doughnut_and_11_sweet}*. We never did something with 3D prints but now we now how to read time, <img class="emoji" alt="stars" src="https://github.githubassets.com/images/icons/emoji/unicode/1f320.png" width="20" height="20"> Now you know <img class="emoji" alt="stars" src="https://github.githubassets.com/images/icons/emoji/unicode/1f320.png" width="20" height="20"> .

# <a name="Conclusion"></a>Conclusion

We learned a bit about stuff we never use again probably. You should never say never maybe the next big hack will be with 3D printers printing bitcoins for me on plastic, cause paper kills the planet. Lets see what comes next in this crazy ITSec world.
