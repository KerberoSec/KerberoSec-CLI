# Wave a flag Writeup

Now it's your first real challenge with the Linux terminal, you'll learn how to execute programs and to change their permissions which will be useful in many CTFs later.

Let's start by downloading the program with the classic `wget https://mercury.picoctf.net/static/f95b1ee9f29d631d99073e34703a2826/warm` and we can see that if we list all the files with `ls` there's a thing called "warm" in there.

Now try to run the program by doing `./warm`, why doesn't it work?

That's because the program is not executable, but we can fix this by doing `chmod +x warm`.

`chmod` is a command that allows you to change permissions on a file or program using these flags:

* `+x` makes it executable;
* `+r` makes it readable;
* `+w` makes it writeable.

If we execute the program again it tells us something...

Output: `Hello user! Pass me a -h to learn what I can do!`

Let's do what it says: `./warm -h`

Output: `Oh, help? I actually don't do much, but I do have this flag here: picoCTF{b1scu1ts_4nd_gr4vy_f0668f62}`

Nice! We have our flag!

This CTF teaches us the importance of the flags in a program or tool, especially the `-h` flag is very useful when we're dealing with an unfamiliar program because it tells us the basic commands and useful info. Many tools also have a manual which has all the features explained and can be accessed with `man <tool name here>` on your Linux terminal.
