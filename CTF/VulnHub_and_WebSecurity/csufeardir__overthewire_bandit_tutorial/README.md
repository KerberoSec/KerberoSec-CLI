
# OverTheWire_Bandit_Tutorial
Tutorial for levels 0-34 of OverTheWire's The Bandit Game, with usage of PuTTY SSh client. 

My aim is to explain every single term with details through the whole tutorial, which should create a decent basic knowledge about Linux OS and it's utilities. 

# Level 0
 The goal of first level is to connect the Bandit's game server via SSH. Now, the first question is, what is SSH? 
 
 <h3>SSH</h3>
 <p>
 SSH, in other words, Secure Shell protocol, is a way to securely connect the Shell of a computer, or server, as we're going to mention it with this name. What is this Shell? Shell is a program, that makes the connection between user input, and the OS itself. In Linux systems, this process is usually controlled by "Bash", a short for "Bourne Again Shell". Then what is this "Terminal"? Terminal is another program, that lets you interfere with Shell, and provides you a nice terminal-like GUI. 
  </p>
 
Too many terms, and too complicated? Okay, I will try to put it all simply:

[Our PC]  ----SSH---> [Server] / We create a connection between our computer and the server with SSH <br>
[Terminal] ----Shell----> [OS] / We send commands to Shell program, which is usually Bash, and it sends the commands to OS for us. With SSH, we don't interfere with Terminal, but while we're managing the server we can use it to access Shell. 

Now if everything is clear, we need to make this SSH connection! But how? First, we need an SSH client. A program to help us make this connection. I will be using PuTTY for Windows OS. You may use another client, or you can download it from the link below: <br>
https://www.putty.org/

![PuTTY Client with Bandit Settings](https://imgur.com/peCbPz3.png)

Now let's look at the informations we're given:
The server address we need to connect is: bandit.labs.overthewire.org
The port which will accept our SSH request is: 2220
Username and Password is: bandit0

Now first, I set the address and port number, and click "Open" on PuTTY. This opens up a shell connection to the server, which asks for username and password. After entering "bandit0" in both, I gain the access. 

![PuTTY Shell](https://i.imgur.com/sdjIMkY.png)

Finally, we set the connection, we can roam in the server freely! Now our goal is, to find the password which will give us access to Level 1, and it's somewhere in this server. To see what do we have in hand, I use the "ls" command, ls is a short for List, and it lists the files in the directory I'm in.
```
bandit0@bandit:~$ ls
readme
```
This is my output. There's a file named readme. Well, let's read it then? To read it, I need to use another utility: Cat! Yes, the cat. It's the short for "concatenate" and does many useful things. This time, we will use it to read what's inside this file:
```
bandit0@bandit:~$ cat readme
boJ9jbbUNNfktd78OOpsqOltutMc3MY1
```
Voila! Here's our password for the next level.

Level 0 ---> Level 1 Password : boJ9jbbUNNfktd78OOpsqOltutMc3MY1
# Level 1

Not changing any setting in PuTTY, we establish SSH connection again, but this time, we use bandit1 as username, and the password we obtained from the last level as password.

I run the ls command once again, to see what I have in hand:
```
bandit0@bandit:~$ ls
-
```
Hmm, a file named with "-"? Okay, I know what to do, let me use Cat to read what's inside. 
Whoops.
Why doesn't it work? Well, you guess. Filename has dash in it, and when I give this filename as a parameter to Cat, it thinks I'm giving it a command line option. I must tell it that it's not an option, but a filename. Feeding it the full direction should do the trick:
```
bandit1@bandit:~$ ls
-
bandit1@bandit:~$ cat ./-
CV1DtqXWVFXTvM2F0k09SHz0YwRINYA9
```
And here it is, our password for the next level.
Level 1 ---> Level 2 Password : CV1DtqXWVFXTvM2F0k09SHz0YwRINYA9

# Level 2

Once again, I establish the connection and run ls command in the home directory. 
```
bandit2@bandit:~$ ls
spaces in this filename
```
[SPACES? NOOOOOOOOOOOOOOOOOOOOOOOOOO](https://www.youtube.com/watch?v=rL81kD44C8E)

Now I have to tell Cat, that I don't mean different parameters by spaces, but the filename altogether. To do this, I use the power of quotes. 
```
bandit2@bandit:~$ cat "spaces in this filename"
UmHadQclWmgdLOKQ3YNgjWxGoRMb5luK
```
And here we have it again.
Level 2 ---> Level 3 Password : UmHadQclWmgdLOKQ3YNgjWxGoRMb5luK

# Level 3

I go through the same routine, connection, ls... But this time, something's different. There's a file named "inhere", but it's marked in blue. What's with this strange file, why is it blue? I need more details. And these details, come with the right options. I will use de ls command, with the option "-long" or "-l" in short. This is going to give me more detailed information about this file.

![PuTTY Screenshot](https://imgur.com/OuyPXdO.png)

Now this simple line, contains decent amount of information, if you know how to read it. Let's start from right, and go to left:
inhere: This is our file's name.
Oct 16 14:00 : Last modification time of the file
4096 : File size in Bytes
root : Owner of this file (But why are there two??)
2 : Total number of files (Two??)
drwxr-xr-x : What is this???

Now, let's take it slowly. It all was going well, until we noticed root written twice, and then there's 2. What can these possibly mean? As you've probably guessed so far, this is no single file. This is a Directory file, or what you call a Folder. It's a file, which has files inside, so if you've tried to read it with Cat, you must have seen the error. Now "root root" and number 2 started making sense. But what's with those random letters? Let's go down to the rabbit's hole:

<h3> What is drwxr-xr-x ?</h3>
<p>Let's split this mysterious piece of text into 4 parts, shall we? First, the first letter: 
"D",
And then, the rest as trigrams:
"RWX",
"R-X",
"R-X".</p>

We seperated it into blocks, because that's how it should be read. The first block, first character, gives us the type of the file. "D", stands for Directory, and this is also why it's coded in blue text. We will see other file types in time as well, but let's continue. 

Rest of the characters, represent permissions to handle this file. First part, is the Owner's permissions. It says the owner is permitted to "RWX", which means owner can Read, Write or Execute this file. Second part, is Group permissions. Now, every user in Linux is assigned to a group, and these users' permissions are controlled through this group. "R-X" says the group users can Read, or Execute this file, but can't change it. The third and last part stands for Other, which literally means any other than owner and group users, and their permissions. 

On a side note: We can use "file [filename]" command in Linux, to see it's file type as well.

Now let's go on. Since we've figured that inhere is not a file to read, but a file to move into, we will use a new command:
"cd inhere", which literally means change directory to inhere. As we moved into the new directory, we run ls to see what's inside:
```
bandit3@bandit:~/inhere$ ls
bandit3@bandit:~/inhere$
```
I'm sorry, what? Nothing?

Well, sometimes you should look through your soul too see what your eyes can not, or sometimes.. You just have to add -a option to ls, to see the hidden files.

```
bandit3@bandit:~/inhere$ ls -la
total 12
drwxr-xr-x 2 root    root    4096 Oct 16 14:00 .
drwxr-xr-x 3 root    root    4096 Oct 16 14:00 ..
-rw-r----- 1 bandit4 bandit3   33 Oct 16 14:00 .hidden
bandit3@bandit:~/inhere$
```

Please look carefully to the output, and the permissions line. Let's check the files we've found:
First one, named ".", and since it's permission line starts with "d", I know it's a directory file. More so, it's this file we're in right now.

Second is a directory file as well, with two dots? Guess what, it's a directory to home! You can check where they direct with "cd [filename]" command.

The third, and the one we're looking for: It's filetype is marked with "-" instead of "d". This means, this is not a directory, but a regular file. Also now I know, if a file's name starts with dot, such as ".hidden", this means that file is hidden and can't be seen without such options as we used. Now since it's a regular file, I can read it with Cat:
```
bandit3@bandit:~/inhere$ cat .hidden
pIwrPrtPN36QITSp3EQaw936yaFoFgAB
bandit3@bandit:~/inhere$
```
Here's our password.
Level 3 ---> Level 4 Password : pIwrPrtPN36QITSp3EQaw936yaFoFgAB

# Level 4

According to OverTheWire, the key is in one of the hidden files in /inhere directory. Let's give it a search:
```
bandit4@bandit:~/inhere$ ls -la
total 48
drwxr-xr-x 2 root    root    4096 Oct 16 14:00 .
drwxr-xr-x 3 root    root    4096 Oct 16 14:00 ..
-rw-r----- 1 bandit5 bandit4   33 Oct 16 14:00 -file00
-rw-r----- 1 bandit5 bandit4   33 Oct 16 14:00 -file01
-rw-r----- 1 bandit5 bandit4   33 Oct 16 14:00 -file02
-rw-r----- 1 bandit5 bandit4   33 Oct 16 14:00 -file03
-rw-r----- 1 bandit5 bandit4   33 Oct 16 14:00 -file04
-rw-r----- 1 bandit5 bandit4   33 Oct 16 14:00 -file05
-rw-r----- 1 bandit5 bandit4   33 Oct 16 14:00 -file06
-rw-r----- 1 bandit5 bandit4   33 Oct 16 14:00 -file07
-rw-r----- 1 bandit5 bandit4   33 Oct 16 14:00 -file08
-rw-r----- 1 bandit5 bandit4   33 Oct 16 14:00 -file09
bandit4@bandit:~/inhere$
```

There are 9 files in total, easy enough to bruteforce, but there's an easier way. Remember the sidenote before, the "file" command, that shows you the type of file? Let's run it:
```
bandit4@bandit:~/inhere$ file ./-file*
./-file00: data
./-file01: data
./-file02: data
./-file03: data
./-file04: data
./-file05: data
./-file06: data
./-file07: ASCII text
./-file08: data
./-file09: data
bandit4@bandit:~/inhere$

```
It's rather obvious, isn't it? :) Cat the file07 and get our password. 
Note: The syntax ./-file* means run on all the files, that start with "-file" and end with anything, due to asterisk(*).
Level 4 ---> Level 5 Password : koReBOKuIDDepwhWk7jZC0RTdopnAYKh

# Level 5

This time, we have 20 directories inside the inhere directory, and each one of them have more than one files inside. Now this is harder to bruteforce our way, but we have some extra clues this time, the file we're looking for is:

human-readable
1033 bytes in size
not executable

When we have this many files to search, and some specific properties to look for, I want to present you a tool to literally "bruteforce" it for us: Find! 

find command looks for files in a given directory, for given options. We will now use it for our search for the key.

```
bandit5@bandit:~/inhere$ find ./maybehere* -type f -size 1033c ! -executable
./maybehere07/.file2
bandit5@bandit:~/inhere$ cat ./maybehere07/.file2
DXjZPULLxYr17uwoI01bNLQbtFemEgo7

```

As you see, It's been much easier. Let me explain how we used the find command: I give find command a directory, search all directories that start with name "maybehere", and end with anything. Give me all the files, that has a type f (regular, not directory), with 1033 bytes in size (bytes are symbolized with c) and not executable. I did not include the human readable part for simplicity's sake, but we did not need it either, while we have this many filters already.

Level 5 ---> Level 6 Password : DXjZPULLxYr17uwoI01bNLQbtFemEgo7

# Level 6

File we're looking for has following properties:

owned by user bandit7
owned by group bandit6
33 bytes in size

A bit similar to the previous one.

```
bandit6@bandit:~$ ls -la
total 20
drwxr-xr-x  2 root root 4096 Oct 16 14:00 .
drwxr-xr-x 41 root root 4096 Oct 16 14:00 ..
-rw-r--r--  1 root root  220 May 15  2017 .bash_logout
-rw-r--r--  1 root root 3526 May 15  2017 .bashrc
-rw-r--r--  1 root root  675 May 15  2017 .profile
bandit6@bandit:~$
```
Let's do a similar search with find command, but this time, we will add the following options:
-size 33c // File should be 33 bytes in size
-user bandit7 // Bandit7 should be the owner user
-group bandit6 // Bandit6 should be the owner group

With these options, our command is:
```
find / -size 33c -user bandit7 -group bandit6
```

![PuTTY Screenshot](https://imgur.com/FysGHPd.png)

Eh? What is this output? While I'm searching through the whole directory, I also try to search for files I'm not authorized to access to. I still can read the output, but let's get rid of all those "Permission denied" errors.

I will add this line at the end of my find command:

```
2>/dev/null
```

So what does this line mean? It says redirect 2, to a file called null, which is inside /dev. What are all these?
Well, 2 is our code for error outputs. In an output stream, all system errors are denoted as 2. So what's with /dev/null? Null is a device that "drops" any data sent to it. Think of it as the garbage bin, we take all the system errors (2), and throw them into the bin (/dev/null). This gives us a clear output:
```
bandit6@bandit:~$ find / -size 33c -user bandit7 -group bandit6 2>/dev/null
/var/lib/dpkg/info/bandit7.password
```

The rest is up to you. Just Cat the file and get the password.

Level 6 ---> Level 7 Password : HKBPTKQnIay4Fw76bEy8PVxKEDQRKTzs

# Level 7

"The password for the next level is stored in the file data.txt next to the word millionth"

Hmm, we need to find something, but this time, not a file, but a string inside the file. What a coincidence, I have just the right tool to do this for me! It's called "grep".

Grep analyzes the lines inside a file. Now I will use it to suit my needs, I need to find the line starts with "millionth" 
```
bandit7@bandit:~$ grep "millionth" data.txt
millionth       cvX2JJa4CFALtqS87jk27qwqGhBM9plV
```

Easy as it is.
Level 7 ---> Level 8 Password : cvX2JJa4CFALtqS87jk27qwqGhBM9plV

# Level 8

"The password for the next level is stored in the file data.txt and is the only line of text that occurs only once"

Another task to solve with manipulating lines. I need to remove any pattern that is repeated more than once. For the easiest solution, I need to use 2 different tools with this one:

Sort, and Uniq. Sort, as can be seen in its name, sorts the file line by line. Uniq is the tool that checks for repeating lines, and gives the unique ones, repeating ones, number of repeating ones and vice versa by the options we've given to it. Here's what I think: I will sort the data.txt line by line, and put the sorted lines in another file I created, like "sorted.txt", then I will use Uniq to find the unique line in this file.
```
bandit8@bandit:~$ sort data.txt > sorted.txt
-bash: sorted.txt: Permission denied
```
What is this now? I'm not allowed to create another file! Even more, I'm not even allowed to change data.txt with it's sorted version! Why is this? Let's see why:
```
bandit8@bandit:~$ ls -la
total 56
drwxr-xr-x  2 root    root     4096 Oct 16 14:00 .
drwxr-xr-x 41 root    root     4096 Oct 16 14:00 ..
-rw-r--r--  1 root    root      220 May 15  2017 .bash_logout
-rw-r--r--  1 root    root     3526 May 15  2017 .bashrc
-rw-r-----  1 bandit9 bandit8 33033 Oct 16 14:00 data.txt
-rw-r--r--  1 root    root      675 May 15  2017 .profile
```
Remember the permissions? The first trigram was for owner, and second was for group. Now I'm a user inside this group. Let's check the directories, . is the directory I'm in, and group permissions are "r-x", which means I can only read and execute. I can't write anything in this directory! What if I change to home directory? It will be the same, because I'm not allowed to write in .. either. 

Even more, I'm not even allowed to change data.txt to save it's sorted version! So what will I do?

I will use this magnificent mechanism, called Pipelining. Pipelining, denoted by "|" sends output of one tool, to another tool as input. Let's see how it works:

```
bandit8@bandit:~$ sort data.txt | uniq -u
UsvVyFSfZZWbi6wgC7dAFyFuR6jQQUhR
```

It first sorts the data.txt, and then sends the sorted lines to Uniq tool. Uniq tool takes these lines, and gives me the unique line because of the option -u. This mechanism gives me the same result as the method we first tried. If we were able to write in the directory, we would do it like this:

```
bandit8@bandit:~$ sort data.txt > sorted.txt
bandit8@bandit:~$ uniq sorted.txt -u
UsvVyFSfZZWbi6wgC7dAFyFuR6jQQUhR
```
By pipelining, we do the exact same, but instead of saving the output to another file, we just direct it to Uniq tool and bypass it without writing anything to the server.

Level 8 ---> Level 9 Password : UsvVyFSfZZWbi6wgC7dAFyFuR6jQQUhR

# Level 9

"The password for the next level is stored in the file data.txt in one of the few human-readable strings, beginning with several ‘=’ characters."

Data.txt has bunch of non-readable strings, and among them is a password. I will use the "Strings" tool, to strip the text off any code that isn't in unicode. 
```
bandit9@bandit:~$ strings data.txt
```
Now let's pipeline it to Grep, to find the lines that start with equal marks.

```
bandit9@bandit:~$ strings data.txt | grep "^=="
========== password
========== isa
========== truKLdjsbJ5g7yyJ2X2R0o3a5HQJFuLk
bandit9@bandit:~$
```

^ Indicator is used to look for patterns at the beginning of the lines. With "^==" I say look for lines, that start with two equal marks, since it's said that there are several. The output is 3 different lines, and password can be seen among them easily.

Level 9 ---> Level 10 Password : truKLdjsbJ5g7yyJ2X2R0o3a5HQJFuLk

# Level 10

"The password for the next level is stored in the file data.txt, which contains base64 encoded data

Another similar task, but hey, there's something new to learn: Base64. It's an encoding method, to transfer the binary data in a text format. Remember ASCII? This is the reverse. Instead of taking the letter "A" and converting it to "1010", I take the "1010" and convert it to "QQ==". Of course, it gives a different outcome, because it's a different encoding system. 

Why can't we just send binary data in binary format? Like I can type 0011 here and that would work? Yes it would and we can, but in certain cases sending binary as data can cause complications, such as interpreting error. As an example, a mail server will look for a certain sequence of bits, to determine the end of the mail. This is a sequence that is not in ASCII table, so none of my typings can be converted to this sequence. But what if I start to send binary, and send the same sequence that indicates the mail ending? Boom. Mail, broke. This was the actual problem that caused invention of Base64.

Now, we got what it is, and why is it used for. Here's a characteristic of Base64: It's length, will always be a factor of 4 due to its convertion algorithm, no matter what. If the encoding ended before reaching a factor of four, equal marks will be added to the end. Example: "QQ==", "ZXhhbXBsZQ==", "R2l0aHVi" .

Okay, back to our task. We need to convert this Base64 code to ASCII. 
![PuTTY Screenshot](https://imgur.com/TH8SUWc.png)

We can use the Base64 tool to encode to and decode from, well, Base64 obviously. 
```
bandit10@bandit:~$ base64 -d data.txt
The password is IFukwKGsFW8MOq3IRFqrxE1hxTNEbUPR
```

Level 10 ---> Level 11 Password : IFukwKGsFW8MOq3IRFqrxE1hxTNEbUPR

# Level 11

"The password for the next level is stored in the file data.txt, where all lowercase (a-z) and uppercase (A-Z) letters have been rotated by 13 positions"

Rotated by 13 positions, what does it mean? It means the password is encrypted by Rot13. It's a simple ciphering method, and simply works with replacing a letter, with the 13th. letter after it. If I encrypt "A B C" with Rot13, it's "N O P" as an instance.

Let's try to decode this by using Linux tools. A handy one in this case, would be Tr, which is a short for translate. Tr takes patterns of a string, and convert them to different patterns. Like converting all lowercase characters to uppercase, or shifting letters by 13 characters backwards (What a coincidence right??". 

So, here's our syntax with Tr:
```
bandit11@bandit:~$ cat data.txt | tr '[A-Za-z]' '[N-ZA-Mn-za-m]'
The password is 5Te8Y4drgCRfCx8ugdwuEX8KFC6k2EUu
bandit11@bandit:~$
```

Since Tr doesn't read files as a parameter, I feed it through Cat by pipelining. Firs parameter '[A-Za-z]' takes all the letters between A-Z, and convert them to second parameter, characters between N-Z and A-M. This is 13 letters shifted backwards from starting and ending point. 

Level 11 ---> Level 12 Password : 5Te8Y4drgCRfCx8ugdwuEX8KFC6k2EUu

# Level 12

Here's my favourite. It's a challenging one, but fun. 

"The password for the next level is stored in the file data.txt, which is a hexdump of a file that has been repeatedly compressed."

We have two different terms, Hexdump and Compression. A hexdump, is a hexadecimal view of data, instead of our standart Binary or ASCII. It's the same data, whether it's Binary, ASCII or Hex, but it's just represented differently. 

![Hexdump from Wikipeadia](https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Wikipedia_favicon_hexdump.svg/290px-Wikipedia_favicon_hexdump.svg.png)

" In a hex dump, each byte (8-bits) is represented as a two-digit hexadecimal number. Hex dumps are commonly organized into rows of 8 or 16 bytes, sometimes separated by whitespaces. Some hex dumps have the hexadecimal [memory address](https://en.wikipedia.org/wiki/Memory_address) at the beginning and/or a [checksum](https://en.wikipedia.org/wiki/Checksum) byte at the end of each line. "

The upper paragraph is straight from Wikipeadia, I believe it's a perfectly short and useful description so I just used it here. 

Let's come to compression, compression is as you probably know, reducing a file's size by encoding its contents. If I typed 1 million 0's here, that would be 1 million bits, but If I just say "1 million 0s" that will only take 96 bits. I saved a lot of space, but now you have to type 1 million 0s. It comes with a price called decompressing. There are different compression algorithms for different file types, and each has its own advantages and disadvantages. 

Back to the task, we have the password, it's compressed and compressed and compressed again, and now it's in Hexadecimal form. What do we do? Reverse everything that's done on our Password! Their steps are like this:

Password => Compress => Compress => Compress => .... => Compress => Convert to Hex 

We're at the right most end, now let's go back. They converted it the compressed file to Hex file, so we should get the compressed version back. We will use the Xxd tool for this. Xxd is a tool to create Hex files, or reverse the Hex files back to binary format.

```
bandit12@bandit:~$ xxd -r data.txt | file -
/dev/stdin: gzip compressed data, was "data2.bin", last modified: Tue Oct 16 12:00:23 2018, max compression, from Unix
```

Now here's what we did here: I told xxd to reverse data.txt, and pipelined the output to File tool. Why did I do this? Because File will give me the type of compression. "file -" tells file to take the file from the pipe, instead of a location. Here, it tells me it's compressed by Gzip. Gzip is a compressing tool using it's own algorithm. Okay, so what we need to do next, is to decompress it with Gzip, and check the file again to see what do we have this time. Let's add another step to our pipe:
```
bandit12@bandit:~$ xxd -r data.txt | gzip -d -c | file -
/dev/stdin: bzip2 compressed data, block size = 900k
```

Gzip hints: -d means Decompress, -c means send the output through the pipe.

As you can see, this time we got a bzip2 compression. Another compressing tool with another algorithm, and we should do the same to decompress it.
```
bandit12@bandit:~$ xxd -r data.txt | gzip -d -c | bzip2 -d -c | file -
/dev/stdin: gzip compressed data, was "data4.bin", last modified: Tue Oct 16 12:00:23 2018, max compression, from Unix
```

Another gzip! Pipe it to gzip!
```
bandit12@bandit:~$ xxd -r data.txt | gzip -d -c | bzip2 -d -c | gzip -d -c | file -
/dev/stdin: POSIX tar archive (GNU)
```

Oh, we have something different this time. It's a TAR compression. TAR uses -x parameter to decompress, and -o to pipe it to the output.
```
bandit12@bandit:~$ xxd -r data.txt | gzip -d -c | bzip2 -d -c | gzip -d -c | tar -x -O | file -
/dev/stdin: POSIX tar archive (GNU)
```
Another TAR. Repeat the same step!
```
bandit12@bandit:~$ xxd -r data.txt | gzip -d -c | bzip2 -d -c | gzip -d -c | tar -x -O | tar -x -O | file -
/dev/stdin: bzip2 compressed data, block size = 900k
```
This time we got a bzip again. 
```
bandit12@bandit:~$ xxd -r data.txt | gzip -d -c | bzip2 -d -c | gzip -d -c | tar -x -O | tar -x -O | bzip2 -d -c | file -
/dev/stdin: POSIX tar archive (GNU)
```
Another tar.. This better be coming to an end.
```
bandit12@bandit:~$ xxd -r data.txt | gzip -d -c | bzip2 -d -c | gzip -d -c | tar -x -O | tar -x -O | bzip2 -d -c | tar -x -O | file -
/dev/stdin: gzip compressed data, was "data9.bin", last modified: Tue Oct 16 12:00:23 2018, max compression, from Unix
```
Gzip..
```
bandit12@bandit:~$ xxd -r data.txt | gzip -d -c | bzip2 -d -c | gzip -d -c | tar -x -O | tar -x -O | bzip2 -d -c | tar -x -O | gzip -d -c | file -
/dev/stdin: ASCII text
```

Ah, Voila! We finally hit something. We decompressed it all the way through, using different algorithms, and found the scroll of truth! Let's pipe the output to Cat, instead of file to read it:
```
bandit12@bandit:~$ xxd -r data.txt | gzip -d -c | bzip2 -d -c | gzip -d -c | tar -x -O | tar -x -O | bzip2 -d -c | tar -x -O | gzip -d -c | cat
The password is 8ZjyCRiBWFYkneahHwxCv3wb2a1ORpYL
```
And this journey has come to an end, finally. 

Level 12 ---> Level 13 Password : 8ZjyCRiBWFYkneahHwxCv3wb2a1ORpYL

# Level 13

"The password for the next level is stored in /etc/bandit_pass/bandit14 and can only be read by user bandit14. For this level, you don’t get the next password, but you get a private SSH key that can be used to log into the next level."

Now since we're user Bandit13, and the password is readable only by Bandit14, we can't get it without breaking stuff. Yet, as it's stated, we can see the SSh key in our directory. We had talked about SSh, and an SSh key is a file consisting of a random binary sequence. If you read the key with Cat, you can see it's encoded with Base64.

![PuTTY Screenshot](https://imgur.com/JZzbGpN.png)

Now, we can use SSh keys instead of a password. This way we can automatize things in a more secure way. It says we can log in to Bandit14 with this key as well, so let's do that. We will use the ssh tool to do this, it's an SSh client, just like PuTTY, but we run it on Linux's terminal.
```
bandit13@bandit:~$ ssh -i sshkey.private bandit14@bandit.labs.overthewire.org
```
"Hey ssh, here's your identifying file: sshkey.private, login to user bandit14 at the server bandit.labs.overthewire.org for me"

This is the syntax of our code, and this is the meaning. Yet, if you've tried this, you will see that it fails to connect. Why tho? Because we're trying to connect the secure shell of a server called "bandit.labs.overthewire.org". You see the problem? WE ARE ALREADY IN THIS SERVER. Searching for it outside is futile. To say "the server is in this machine" to ssh, we use the term "localhost". Localhost refers to the computer the program is running on. Let's try:
```
bandit13@bandit:~$ ssh -i sshkey.private bandit14@localhost
```

After you accept the connection, you will connect to Bandit14 as if you've got it's password and connected to it through PuTTY!

# Bandit 14

"The password for the next level can be retrieved by submitting the password of the current level to port 30000 on localhost."

Hmm, we need our current password. If you remember, we did not get this on the previous level, we just got here by using a key. But, we knew where the password was, and as we're Bandit14 now, we can access it. Let's find out:
```
bandit14@bandit:~$ cat /etc/bandit_pass/bandit14
4wcYUJFw0k0XLShlDzztnTBHiqxU3b3e
```
Yup, here's our key. Now we need to submit it to port 30000 on localhost. What does this mean? Well, I need to send a data package, as if I'm connecting to Internet. But instead, I will just send it to another port on this machine. For this task, I will use the popular tool called Netcat.

Netcat can create TCP or UDP connections, or listen to them and give you the output. We need to tell netcat to send this password, to port 30000, on localhost. Easy!
```
bandit14@bandit:~$ echo "4wcYUJFw0k0XLShlDzztnTBHiqxU3b3e" | netcat localhost 30000
Correct!
BfMYroe26WYalil77FoDi9qh59eK5xNr
```

I echoed the password and pipelined it to netcat, then told netcat to get this string from pipe and deliver it to port 30000, and here we got our password. Apparently there's a server running on port 30000, and it is programmed to return the level 15 password when it gets the level 14 password over SSh.

Level 14 ---> Level 15 Password : BfMYroe26WYalil77FoDi9qh59eK5xNr

# Level 15

"The password for the next level can be retrieved by submitting the password of the current level to port 30001 on localhost using SSL encryption."

Same thing, but with SSL encryption. Okay, what's SSL? 

<h3>SSL</h3>

SSL is a cryptographic network protocol, it encrypts the messages sent through the network, and creates a safe way to communicate, just like SSH. Yet, there are two main differences: SSL can't allow you to connect and run commands on shell alone, but it does use Certificates to verify if you're connecting really to the server you want or not. Most common usage of it is with HTTP, altogether known as HTTPS. You can see if your connection is secured by SSL on the left side of address bar of your browser. 

To send data through SSL, I will use the OpenSSL tool. OpenSSL can do a variety of things, such as creating keys, certificates, encryption/decryption and server/client connection via SSL. Last one is the feature we need, let's check it's syntax to use it.
```
openssl s_client -connect localhost:30001
```

By s_client, we mean the server/client relationship, and create the connection by -create. Localhost:300001 means the server and the port. [ServerIP]:[PortNumber] is a very commonly used notation. 

Now we have the connection, let's send the password.
```
BfMYroe26WYalil77FoDi9qh59eK5xNr
Correct!
cluFn7wTiGryunymYOu4RcffSxQluehd
```

Done!
Level 15 ---> Level 16 Password : cluFn7wTiGryunymYOu4RcffSxQluehd

# Level 16

"The credentials for the next level can be retrieved by submitting the password of the current level to a port on localhost in the range 31000 to 32000. First find out which of these ports have a server listening on them. Then find out which of those speak SSL and which don’t. There is only 1 server that will give the next credentials, the others will simply send back to you whatever you send to it."

This one requires us to do a list of things we've never done so far. Let's break it into parts:

1/- Scan ports between 31000 and 32000
2/- Find out which ones have a server listening them
3/- Find which of these listen to SSL
4/- Send the password of current level

Let's go starting from the first one. How do we scan the ports? By using our glorious tool Nmap of course. It's the short for Network Mapper, and this amazing tool creates data packets, sends them over different protocols, to different ports, and gives you a stasistic of results.

By usin Nmap, I can send packets to all ports between 31000 and 32000, and find out which ones are listening to what.
```
nmap -sV -p 31000-32000 localhost
```
This scans for given range of ports on the local host, and their services due to the -sV flag. Now it takes a little time but here's the output:
```
Starting Nmap 7.40 ( https://nmap.org ) at 2019-03-11 21:13 CET
Nmap scan report for localhost (127.0.0.1)
Host is up (0.00036s latency).
Not shown: 999 closed ports
PORT      STATE SERVICE     VERSION
31518/tcp open  ssl/echo
31790/tcp open  ssl/unknown
```
As you can see, we have 2 ports in the given range that listen to ssl, and only one will give us the answer, while the other's going to send it back to us. Can you guess which is which? Echo will reply us with whatever we send to it. Other one is unknown but it will probably do the charm: So let's create an ssl connection and send it our pw!
```
openssl s_client -connect localhost:31790
cluFn7wTiGryunymYOu4RcffSxQluehd
Correct!
-----BEGIN RSA PRIVATE KEY-----
MIIEogIBAAKCAQEAvmOkuifmMg6HL2YPIOjon6iWfbp7c3jx34YkYWqUH57SUdyJ
imZzeyGC0gtZPGujUSxiJSWI/oTqexh+cAMTSMlOJf7+BrJObArnxd9Y7YT2bRPQ
.
.
.
-----END RSA PRIVATE KEY-----

```
Instead of a password to the next level, we got a key. We had already done using a key to maintain an SSH connection, let's do the same again. I will copy the key to a file in /tmp directory, which we're allowed to write.

```
echo "-----BEGIN RSA PRIVATE ...... END RSA PRIVATE KEY-----" > /tmp/sshkey.private
ssh -i /tmp/sshkey.private bandit17@localhost
```

Now I did not copy the full key here, but this is the code, and after this we get our ssh connection to Bandit17.

# Bandit 17

"There are 2 files in the homedirectory: passwords.old and passwords.new. The password for the next level is in passwords.new and is the only line that has been changed between passwords.old and passwords.new

NOTE: if you have solved this level and see ‘Byebye!’ when trying to log into bandit18, this is related to the next level, bandit19"

Difference between two files. This time I will be quick, because this is simple and we should keep simple things simple.
```
bandit17@bandit:~$ diff passwords.new passwords.old
< kfBf3eYk5BPBRzwjqutbbfE887SVc5Yd
---
> hlbSBPAWJmL6WFDb06gpTx1pPButblOA
```

Top line is added to passwords.new, and bottom line is removed from passwords old. 

Level 17 ---> Level 18 Password : kfBf3eYk5BPBRzwjqutbbfE887SVc5Yd

# Bandit 18

"The password for the next level is stored in a file readme in the homedirectory. Unfortunately, someone has modified .bashrc to log you out when you log in with SSH."

If you've tried logging into Bandit18 with PuTTY or some other client, you will see that it terminates the connection right after establishment, and we know this is because of the modified .bashrc file in this session. Now let's see, what is .bashrc?

.bashrc is a script file, that runs with bash program each time. It's like a configuration file, in example; you start a new terminal, and it starts this script file with itself. If you put an "echo "Terminal started" " command in it, it will print "Terminal started" when you run the terminal. In bandit games, we have the OverTheWire logo and welcome messages in this file to be printed when we connect to it.

Now, somebody modified this file, and added some "terminate session" command in it. So whenever we start a terminal, it runs the .bashrc, and .bashrc tells it to close the session, so we get logged out without being able to do anything. So we need to tell it to run the terminal, but without running .bashrc file.

 In short, we can do this with ssh's -T option. This time I will use it directly instead of PuTTY, since it's harder to add command options with PuTTY. 
 
![Command Prompt Screenshot](https://imgur.com/9jbtOa6.png)

Rest is as you expected:
 
``` 
ls
readme
cat readme
IueksS7Ubh8G3DCwVzrTd8rAVOwq3M5x
```

Level 18 ---> Level 19 Password : IueksS7Ubh8G3DCwVzrTd8rAVOwq3M5x

# Level 19

"To gain access to the next level, you should use the setuid binary in the homedirectory. Execute it without arguments to find out how to use it. The password for this level can be found in the usual place (/etc/bandit_pass), after you have used the setuid binary."

What is setuid?
Setuid is a special permission, which gives users extra privileges while running an executable file. It's like the manager adding a personnel-only area another label, that "and bandit19" is written on it, so we can also enter this personnel-only area thanks to the manager!
```
drwxr-xr-x  2 root     root     4096 Oct 16 14:00 .
drwxr-xr-x 41 root     root     4096 Oct 16 14:00 ..
-rwsr-x---  1 bandit20 bandit19 7296 Oct 16 14:00 bandit20-do
-rw-r--r--  1 root     root      220 May 15  2017 .bash_logout
-rw-r--r--  1 root     root     3526 May 15  2017 .bashrc
-rw-r--r--  1 root     root      675 May 15  2017 .profile
```
Now as you see, the bandit20-do file is owned by user bandit20. It's the "bandit20 only" area, and if you look carefully, you will see an "s" in our file's permissions indicating setuid bit is set. Which means we're allowed in! 

Now, here's a summary of what we have in hand: We have a script file, called bandit20-do. It belongs to bandit20 so normally we can't use it, but there's a special permission given for this file. As another user, we can't change it but we can execute it. So let us:
```
bandit19@bandit:~$ ./bandit20-do
Run a command as another user.
  Example: ./bandit20-do id
bandit19@bandit:~$
```

Now if you didn't get it: 

[Bandit20]<<<(bandit20-do)---[Bandit19] 

Bandit20 has a program, called bandit20-do, and allows other users to use this program. His program runs commands we feed it on Bandit20's computer. Which means we gain access to it's terminal through this program! You see, misused permissions can be dangerous..

So, what else do we know? We know where the password is stored in Bandit20's computer! So let's feed this program with required commands:
```
bandit19@bandit:~$ ./bandit20-do cat /etc/bandit_pass/bandit20
GbKksEFF4yrVs6il55v6gwY5aVje5f0j
```

Level 19 ---> Level 20 Password : GbKksEFF4yrVs6il55v6gwY5aVje5f0j

# Level 20

"There is a setuid binary in the homedirectory that does the following: it makes a connection to localhost on the port you specify as a commandline argument. It then reads a line of text from the connection and compares it to the password in the previous level (bandit20). If the password is correct, it will transmit the password for the next level (bandit21)."

Now it's important to understand what this binary does by the definition: It listens to a port on localhost, which we provide to it. If that port sends the level 20's password, it gives us the next level's password.The idea is very simple to the ones we did before, if you remember. We looked up on open ports, and connected to the correct one. This time, we need to create a service, that keeps echo'ing the current password on connections. 

Here's a tool to make things easier for us: Tmux
<h3>Tmux</h3>
The terminal we control can actively run only one task at a time, and while working through an SSH connection we don't get the luxury to open two or more terminals to run more tasks. Here, we use Tmux, to divide our terminal to different parts and control more processes.

If you want to learn most of the commands, have a quick read at this page: https://hackernoon.com/a-gentle-introduction-to-tmux-8d784c404340

I will share only the commands we're going to use. First we start tmux, by writing 'tmux', obviously. Then we use combination "ctrl+b". This makes us give the next command to Tmux, instead of the terminal. By entering the quotation mark( " ==> this guy ) we split the window horizontally -you can also use '%' to split it vertically, and you can use this more than once-. 

To navigate between different terminals, you can use arrow keys, but once again, use the combination of "ctrl+b" before to give the command to Tmux.

Now what we're going to do is rather easy. In one window, we'll create echo the password of the current level to a port we choose, and in the other we're going to listen that port via "suconnect". 

![Tmux Screenshot](https://imgur.com/db3aPk7.png)

And as you can see, the binary file echoes the password for next level to the same port:

Level 20 ---> Level 21 Password : gE269g2h3mw3pwgrj0Ha9Uoqen1c9DGr

# Level 21
