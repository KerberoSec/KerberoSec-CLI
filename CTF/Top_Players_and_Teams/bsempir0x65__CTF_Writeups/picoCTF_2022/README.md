# <a name="Getpicoed"></a>Getpicoed

We have read multiple times that a good start for any beginner would be the picoCTF. We missed the last one and yes there is the gym with all the task which is create but a small challenge is also a nice carrot on a stick. So we made the one or the other challenge and were happy that most of it were not an issue for us. The ones which were interesting enough we also made a small write up to remember what we did.

# <a name="Keygenme"></a>Keygenme

 <img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/picoCTF_2022/img/Keygenme.png" alt="Keygenme" width="50%" height="50%">

In this challenge we were given a binary with the task to get the flag with no further hints. Since we used already several tools in other CTFs we started to try out a new one. Many times people used radare2 for example but this time we tried the gui version Cutter. Luckily we also saw that kali has an package for that. So after a quick apt install we were about to start Cutter.

https://user-images.githubusercontent.com/87261585/161619477-de535f17-2154-4d00-8c62-c74a28fcbe77.mp4

<video width="75%" height="75%" controls>
  <source src="https://user-images.githubusercontent.com/87261585/161619477-de535f17-2154-4d00-8c62-c74a28fcbe77.mp4" type="video/mp4">
  https://user-images.githubusercontent.com/87261585/161619477-de535f17-2154-4d00-8c62-c74a28fcbe77.mp4
</video>

Excuse me ? Seems nothing happens. Is the package broken ? Let's see what the console says:

```console
└─$ Cutter
Cutter: error while loading shared libraries: libr_core.so.5.0.0: cannot open shared object file: No such file or directory
```
After some googleing this seems to be a tuff issue. Probably thats why no one fixed the package. So we then moved to the acutal Cutter webpage [Cutter](https://github.com/rizinorg/cutter/releases/) and lucky enough we found an AppImage which worked out of the box flawlessly.

Luckely also the ghidra plugin works out of the box for us and we got a nice Decompiler view already with the following Code:

```C
undefined8 main(int argc, char **argv)
{
    char cVar1;
    int64_t in_FS_OFFSET;
    char **var_40h;
    int var_34h;
    char *s;
    int64_t canary;
    
    canary = *(int64_t *)(in_FS_OFFSET + 0x28);
    printf("Enter your license key: ");
    fgets(&s, 0x25, _stdin);
    cVar1 = fcn.00001209((char *)&s);
    if (cVar1 == '\0') {
        puts("That key is invalid.");
    } else {
        puts("That key is valid.");
    }
    if (canary != *(int64_t *)(in_FS_OFFSET + 0x28)) {
    // WARNING: Subroutine does not return
        __stack_chk_fail();
    }
    return 0;
}
```
We can see that first "Enter your license key: " gets print and then our input gets catched and sent to fcn.00001209((char *)&s). So lets have a closer look to that function:
```C
undefined8 fcn.00001209(char *arg1)
{
    undefined8 uVar1;
    int64_t iVar2;
    int64_t in_FS_OFFSET;
    char *var_d8h;
    int64_t var_c8h;
    int32_t var_c0h;
    int32_t var_bch;
    int32_t var_b8h;
    char *var_b2h;
    int64_t var_a0h;
    char *s;
    int64_t var_88h;
    int64_t var_80h;
    int64_t var_78h;
    char *var_70h;
    undefined var_64h;
    int64_t var_5eh;
    undefined var_56h;
    char *var_50h;
    int64_t var_30h;
    int64_t var_15h;
    undefined var_dh [5];
    int64_t canary;
    
    canary = *(int64_t *)(in_FS_OFFSET + 0x28);
    s = (char *)0x7b4654436f636970; // a string which translates to picoCTF{
    var_88h = 0x30795f676e317262; // a string which translates to br1ng_y0H
    var_80h = 0x6b5f6e77305f7275; // a string which translates to ur_0wn_kH
    var_78h._0_4_ = 0x5f7933; // a string which translates to 3y_
    var_b2h._0_2_ = 0x7d; // a string which translates to }
    uVar1 = strlen(&s);
    MD5(&s, uVar1, (int64_t)&var_b2h + 2);
    uVar1 = strlen(&var_b2h);
    MD5(&var_b2h, uVar1, &var_a0h); // no clue what the MD5 function is used here
    var_c8h._0_4_ = 0;
    for (var_c8h._4_4_ = 0; var_c8h._4_4_ < 0x10; var_c8h._4_4_ = var_c8h._4_4_ + 1) {
        sprintf((int64_t)&var_70h + (int64_t)(int32_t)var_c8h, "%02x", 
                *(undefined *)((int64_t)&var_b2h + (int64_t)var_c8h._4_4_ + 2)); //var_b2h is known to us
        var_c8h._0_4_ = (int32_t)var_c8h + 2;
    }
    var_c8h._0_4_ = 0;
    for (var_c0h = 0; var_c0h < 0x10; var_c0h = var_c0h + 1) {
        sprintf((int64_t)&var_50h + (int64_t)(int32_t)var_c8h, "%02x", 
                *(undefined *)((int64_t)&var_a0h + (int64_t)var_c0h));
        var_c8h._0_4_ = (int32_t)var_c8h + 2;
    }
    for (var_bch = 0; var_bch < 0x1b; var_bch = var_bch + 1) {
        *(undefined *)((int64_t)&var_30h + (int64_t)var_bch) = *(undefined *)((int64_t)&s + (int64_t)var_bch);
    }
    var_15h._0_1_ = (undefined)var_5eh;
    var_15h._1_1_ = var_56h;
    var_15h._2_1_ = var_5eh._7_1_;
    var_15h._3_1_ = var_70h._0_1_;
    var_15h._4_1_ = var_56h;
    var_15h._5_1_ = (undefined)var_5eh;
    var_15h._6_1_ = var_64h;
    var_15h._7_1_ = var_56h; //so we conducted that based on the format of a flag and the known strings that here must happen the magic for the full key
    var_dh[0] = var_b2h._0_1_;
    iVar2 = strlen(arg1); // arg1 is our input
    if (iVar2 == 0x24) { // iVar2 needs to be 36
        for (var_b8h = 0; var_b8h < 0x24; var_b8h = var_b8h + 1) {
            if (arg1[var_b8h] != *(char *)((int64_t)&var_30h + (int64_t)var_b8h)) {
                uVar1 = 0;
                goto code_r0x00001475;
            }
        }
        uVar1 = 1;
    } else {
        uVar1 = 0;
    }
code_r0x00001475:
    if (canary != *(int64_t *)(in_FS_OFFSET + 0x28)) {
    // WARNING: Subroutine does not return
        __stack_chk_fail();
    }
    return uVar1; // uVar1 needs to be 0 result in main in true
}
```
Okay lots of things are happening here so i put some comments into it for a more clear view what happens. As you can see we found the part where during the runtime the missing values for our flag gets generated. So we now know that we need to make a dynamic analysis to get the missing values for our flag.

 <img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/picoCTF_2022/img/Keygenme_cutter.png" alt="Keygenme" width="50%" height="50%">

Dang today we have some luck with our tools.

 <img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/picoCTF_2022/img/Keygenme_cutter2.png" alt="Keygenme" width="50%" height="50%">

So the direct emulation seems not to work. At least for us we attached cutter to a running process, in this case a shell in which we then could do our input. Also to check the actually value which is used to be checked against our input we set a breakpoint after the value got built.

 <img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/picoCTF_2022/img/Keygenme_cutter3.png" alt="Keygenme" width="50%" height="50%">

Once we had everything set up, we just needed to find the right address where our flag was. Luckily Cutter made a nice hint by pointing us to references where ascii signs were saved.

 <img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/picoCTF_2022/img/Keygenme_cutter4.png" alt="Keygenme" width="50%" height="50%">

In our case it was 0x7ffe5b280f48 and within the heydump view we had our key. Most of the time we had issues with our tools but heh next time we know where to click what and maybe it will be a nice opportunity next time to directly use radare2. Hope this different approach is a nice idea for a solution.
