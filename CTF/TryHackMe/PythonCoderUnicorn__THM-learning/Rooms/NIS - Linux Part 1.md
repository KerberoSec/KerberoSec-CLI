
#Linux 

- https://tryhackme.com/room/nislinuxone
- `cd` command is removed from use
- SSH `chad:Infinity121`

What is the user you are logged in to in the first room of Linux Fundamentals Part 1?
- `tryhackme`

What badge do you receive when you complete all the Linux Fundamentals rooms?
- `cat linux.txt`

## ls

- `ls -x-y-z`
- `ls -xyz`

How do you run the ls command?
- `ls`

How do you run the ls command to show all the files inside the folder?
- `ls -a`

How do you run the ls command to not show the current directory and the previous directory in the output? (almost everything)
- `ls -A`

How do you show the information in a long listing format using ls?
- `ls -l`

How do you show the size in readable format? e.g. k, Mb, etc
- ` ls -h`

how do you do a recursive ls?
- `ls --recursive`

how many files did you locate in the home folder of the user? (non-hidden and not inside other folders)
- 13

## cat

since cat is removed, use `tac` `tac --help`
```
tac [option] ... [file] ...

-b  --before   attach separator before not after
-r  --regex    separator as regular expression
-s             use STRING as separator instead of \n
```

other commands
- `head`
- `tail`
- `xxd` output the hex dump into a file and convert from hex to ASCII
- base64 the text and convert it ASCII `base64 file.txt | base64 --decode`

  
What is the content of cat.txt?
- `head cat.txt`
- ` THM{11adbee391acdffee901} `

What is the content of tac.txt?
- ` THM{acab0111aaa687912139} `

What is the content of head.txt?
- ` THM{894abac55f7962abc166} `

What is the content of tail.txt?
- ` THM{1689acafdd20751acff6} `

What is the content of the xxd.txt?
- ` THM{fac1aab210d6e4410acd} `

What is the content of base64.txt?
- ` THM{aa462c1b2d44801c0a31} `

## find

find a file by name in current directory  
- `find . -name *.txt`
- `find / -type f -name "*.qmd"`

find file based on SUID or SGID
- `find / -type f \(-perm -4000 -o -perm -2000\) -exec ls -l {} \;`

how many .txt files did you find in the current directory?
- `find . -name '*.txt'`
- 8

how many SUID files have you found inside the home folder?
- 0

## grep

get text from files
- `grep 'word' file`

how many times does the word "hacker" appear in the grep files?
- `grep 'hacker' grep*.txt`
- 15

## sudo

sudo command allows certain users to execute a command as another user, according to settings in the /etc/sudoers file. By default, **sudo** requires that users authenticate themselves with a password of another user.

## chmod

The **chmod** command sets the permissions of files or directories.
- user
- group
- other
All of them can rather read, write or execute a file. Permission to do so can be granted using chmod.

0 stands for "no permission."
1 stands for "execute";
2 stands for "write";
4 stands for "read".

`chmod 777 file`
`chmod 600 id_rsa`

## echo

echo is the most fundamental command found in most operating systems. It used to prints text to standard output, for example, terminal. It is mostly used in bash scripts in order to display output directly to user's console.

`echo "$( [command] )"`

what command would you use to echo the word "Hackerman"?
- `echo "Hackerman" `

## xargs

**xargs** command builds and executes command lines from standard input. It allows you to run the same command on a large number of files.

xargs is often used with the find command, in order to easily interact with its input.

`find /tmp -name test -type f -print | xargs /bin/rm -f`

display files in the tmp directory and print them out and remove these files
- ` **** / ***** *.*** ***** * ****** * ***** /***/*** `
- `find /  -name *.bak -type f -print | xargs /bin/cat`

## hexeditor

Hexeditor is an awesome tool designed to read and modify hex of a file, this comes in handy especially when it comes to troubleshooting magic numbers for files such as JPG, WAV and any other types of files.
- `apt install ncurses-hexedit`

A few resources I use for tasks that involve analysing files and fixing the magic number I use the following resources:

[https://en.wikipedia.org/wiki/List_of_file_signatures](https://en.wikipedia.org/wiki/List_of_file_signatures)  

https://en.wikipedia.org/wiki/List_of_file_signatures

https://gist.github.com/leommoore/f9e57ba2aa4bf197ebc5

https://www.garykessler.net/library/file_sigs.html

## curl

The **curl** command transfers data to or from a network server, using one of the supported protocols (HTTP, HTTPS, FTP, FTPS, SCP, SFTP, TFTP, DICT, TELNET, LDAP or FILE). It is designed to work without any user interaction, so could be ideally used in a shell script.

`curl http://www.ismycomputeron.com/`

-o to save the file under a different name
`curl -o loginpage.html https://tryhackme.com/login`

Or, you might be interested in fetching the headers silently?  
`curl -I -s https://tryhackme.com`

How would you grab the headers silently of` [https://tryhackme.com](https://tryhackme.com/)` but `grepping` only the HTTP status code?
- ` curl -I -s https://tryhackme.com | grep HTTP `

## wget

The **wget** command downloads files from HTTP, HTTPS, or FTP connection a network.

` wget http://somewebsite.com/files/images.zip `

Adding a `-b` switch will allow us to run wget in the background and return the terminal to its initial state.  
`wget -b http://www.example.org/files/images.zip`

```
wget https://tryhackme.com/flag.txt

  
What command would you run to download recursively up to level 5 from https://tryhackme.com ?

wget -r -l 5 https://tryhackme.com
```

## tar

**tar** is a command that allows creating, maintain, modify, and extracts files that are archived in the tar format.

` tar -xf archive.tar` 
-x extract files
-f file name 

`tar -xf tarball.tar`
`head flag.txt`
` THM{C0FFE1337101} `

## gzip

**gzip**: a file format and a software application used for file compression and decompression. gzip-compressed files have .gz extension.

A gzip file can be decompressed using a simple `gzip -d file.gz` command, where -d stands for decompress.

What is the content of gzip.txt?
- `gzip -d gzip.txt.gz`
- `head gzip.txt`
- ` THM{0AFDECC951A} `

## 7zip

**7-Zip** is a free and open-source file archiver, a utility used to place groups of files within compressed containers known as "archives".

**7z** is as simple as the **gzip** or **tar** and you can use the following command:  
  
`7z x file.zip` to extract the file

This tool comes in handy as it works with a lot more file extensions than other tools. You name the archive extension and 7z should be the tool for you.

- `7z zip.7z`
- `head 7zip.txt`
- ` THM{526accdf94} `

## Binwalk

**binwalk** allows users to analyze and extract firmware images and helps in identifying code, files, and other information embedded in those, or inside another file, taking as an example steganography.

A simple command such as `binwalk file` allows us to perform a simple file scan and identify code information.

`binwalk -e file` allows us to extract files from firmware. This method is usually used in CTFs, where some important information can be hidden within the file.

`binwalk -Me` file does the same as`-e`, but recursively.

- `binwalk -Me binwalk.png`
- `head /home/chad/_binwalk.png.extracted/binwalk.txt`
- ` THM{af5548a12bc2de} `