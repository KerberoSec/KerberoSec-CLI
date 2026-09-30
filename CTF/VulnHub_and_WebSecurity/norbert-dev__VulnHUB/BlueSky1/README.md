<img src="https://github.com/norbert-dev/VulnHUB/blob/main/BlueSky1/images/vhlogo.png" height="300px" width="500px">
<br>
<hr>

<h1> Vulhub solutions by Norbert-dev </h1>

<hr>

## Table of contents
- [General info >>](#general-info)
- [Technologies used >>](#technologies-used)
- [Walkthru >>](#walkthru)
  * [Initial startup](#initial-startup)
    + [General login attempt](#general-login-attempt)
    + [Move on then!](#move-on-then!)
  * [Popping the SHELL](#popping-the-shell) 
    + [Lets see the HOW first?](#lets-see-the-how-first) 
  * [Lets see the HOW Second edition?](#lets-see-the-how-second-edition)
    + [Now comes the good part](#now-comes-the-good-part)
- [Finding the Flags >>](#finding-the-flags)
- [Summary](#summary)
<br>
<hr>

## General info
This machine is a beginner friendly and simple Linux machine.
The goal of this machine is to gain a root shell i.e. (root@loclahost:~#)
Then obtain a flag under /root.

The entire walkthru will be very personal languaged so dont be afraid to read it. THX.
<br>	

## Technologies used
Machine got pwned by no usage of softwares:
* basic linux GRUB cmds
* init script mod
* basic UNIX cmds to gain root access
* and some critical but logical thinking 
<br>	

## Walkthru
For beginning I wanted something challenging also since I just started ethical hacking going medium would have been insaine :)

Now for the first time go download the `OVA` from VulnHub and import it to your VM_Box.
<br>

<hr>

### Initial startup
At the very first startup I have met with this image.

<img src="https://github.com/norbert-dev/VulnHUB/blob/main/BlueSky1/images/01.png">

This is basically the fresh boot up of the image made by the author.

So now we need to gain root access and find the flag. Since this is my first VulnHub machine I have no idea of what I need to find and/or how that looks BUT I know I need $root access.

My theory is to gain root and then find some sort of info what I need.
<br>

#### General login attempt
I did try some general Lunix usr and psw combos just to be sure but you can guess it did not work.

I tried
``` 
usr:        psw:
root      password
admin     admin
linux     ubuntu
admin     root
```
<br>

#### Move on then!
Ok all of these did not work I started to think how can I gain root also how can I bypass the login :) cheeky hah?

For some reason I did not think of Nmap, dirb, etc.. 
I did not see any reason to need those and make my life complicated.
And oh boy I was SOOO right. Bear with me you will see.
<br>

<hr>

### Popping the SHELL
So how do I get a root access without any major complication?

I just started to work with `LINUX` a while ago so I knew a few things about it.
<br>

#### Lets see the HOW first?

Ok now you have the chance to `drop a root shell` in linux boot.

If you hold `Shift` while the initial boot sequence is on then you will be enterd to the `GNU GRUB Menu`

<img src="https://github.com/norbert-dev/VulnHUB/blob/main/BlueSky1/images/02.png">

Here you can choose `Advanced options for Ubuntu`
Then select the second option from the top. This is the `recovery mode`
for the generic ubuntu Linux boot-up image.
Just like BIOS for Windows.
Then select `root` - `Drop to root shell prompt`

You can find all the steps documented by images down below.
If needed feel free to follow them.

<img src="https://github.com/norbert-dev/VulnHUB/blob/main/BlueSky1/images/02.1.png">

<img src="https://github.com/norbert-dev/VulnHUB/blob/main/BlueSky1/images/02.2.png">

And now we get to some dead end. 
As you can see here on the following picture
the `root` drop shell option is `psw` locked.

<img src="https://github.com/norbert-dev/VulnHUB/blob/main/BlueSky1/images/02.3.png">

<strong>FAILED! We gonna need a new plan.</strong> 
<br>

<hr>

### Lets see the HOW Second edition?
If you hold `Shift` while the initial boot sequence is on 
then you will be enterd to the `GNU GRUB Menu` but you already know this right?

<img src="https://github.com/norbert-dev/VulnHUB/blob/main/BlueSky1/images/02.png">

Let's see something new.
Here you have the option to edit commands before booting by pressing `e`.

Once pressed you will be entered into the editor screen. 
Now if you paid attention earlier the file system currently is in a `read-only` state.

Let's change this so we can work with it also lets try to gain `$root`.

Steps to accomplish that.

* Enter GNU GRUB
* Gain access to boot script editor
* Change file system state to `read-write`
* Try to init bash while boot up so we can gain early terminal access
* Change `root psw` so we gain control over the system

First as I said press `e` at the `GNU GRUB` menu. So the editor can come up with the following.
Here find the higlighted fields. This is the very first image that boots in.

Sofar we entered GNU GRUB: `CHECK`
and gainded access to the script editor: `CHECK`

<img src="https://github.com/norbert-dev/VulnHUB/blob/main/BlueSky1/images/03.png">

Now as highlighted we need to locate the first line which says `linux`.

Then with the arrows on your keyboard go and select the `ro` state. This stands for read-only. 
Change this to `rw` read-write state.

Now move along at the end of this line one space after the `quiet` statement
and lets initiate the bash. So hopefully we can use it to `$root`. 
As you can see on the following picture enter `init=/bin/bash`

Once done here lets hit `F10` to boot up again. 
If prompted just choose the very first possible Ubuntu in the list. 

So now we changed file system state to `read-write` - `CHECKED`

<img src="https://github.com/norbert-dev/VulnHUB/blob/main/BlueSky1/images/04.png">
<br>

#### Now comes the good part

So once we rebooted we will be prompted into guess where?

`BASH` Baby.

As you can see in the image following we have 
basicaly full access since there is no job controll in this session.

<img src="https://github.com/norbert-dev/VulnHUB/blob/main/BlueSky1/images/05.png">

Easy enough from here. 
First enter `passwd root`
This will allowe you to change `$root` user password.
Change it to whatever you like. I typed `hacked` as you can see in my comment line on the following pic.

<img src="https://github.com/norbert-dev/VulnHUB/blob/main/BlueSky1/images/06.png">

Now once we are done here lets restart the entire boot sequence and test our theory out.

Type in the bash command line the following `exec /sbin/init`
This will restart the boot sequence.
This time let it run thru.

<img src="https://github.com/norbert-dev/VulnHUB/blob/main/BlueSky1/images/07.png">

As you can see just enter `root` for login and the `psw` you enterd during the UNIX mod.

Now once we loged in ets check with the `whoami` command who we are inside the system.

Lets open up the terminal and enter `whoami` now <strong>SUCCESS</strong> we are `root`.

<img src="https://github.com/norbert-dev/VulnHUB/blob/main/BlueSky1/images/08.png">
<br>

<hr>

## Finding the Flags

So now that we basicaly only have to dig around the files we have to do two things.

* Find the original user of the machine.
* Lets get the final `$root` flag.

So FIRST. The original user.
Since we have GUI navi just open up `HOME` on desktop.
Here we will find a folder named `minhtuan`.
Inside this folder is a `user.txt` text file.

In terminal `ls` the folder then `cat user.txt` and you will see this message.

" Try your best, you have passed the first challange, and the last one is for you, root me!"

<img src="https://github.com/norbert-dev/VulnHUB/blob/main/BlueSky1/images/09.png">

Honestly! We are already root :) Kaching. So lets finish this easy.

Back to desktop. Open up File manager this will take us to the `root` folder.
Here I have found a nice and literaly the only one file which shouted at me that `HEY BRO OPEN ME UP`.

Yes its called `root.txt` funny enough.

<img src="https://github.com/norbert-dev/VulnHUB/blob/main/BlueSky1/images/10.png">

Once it has been opend we are pleased to be greated by the `SunCSR Team`

The flag is the following text:

"Amazing, goodjob you! Thank you for going here SunSCR Team"

<br>
<hr>

## Summary

At last some words about this vulnHub machine. 

It was a fairly fun challange and a great one to actually warm up for the upcoming once. I know there are many other solutions but why would I complicate? right?.

So if you are a beginner like me and new to these challenges just like me then this is one of those machines which will make you satisfied. And yes dont be afraid to use google for simetime. 

ps.: obviously not for the solution. You will not learn from that.
<hr>
