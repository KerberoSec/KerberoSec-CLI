# General Skills:

## Obedient Cat:
### Provided input(s): file named `flag` with no extension

Hint 3 suggests to try `$ man cat`
This opens the manual page for the `cat` command, short for "concatenate and print files", which outputs the contents of a file to std out.

Inspired by the hint, the intended solution is probably to use `$ cat flag` and grab the flag from that output.

I personally just opened the file with Nano, which displays the same information as if you were to try `$ cat flag`

## Python Wrangling:
### Provided input(s): files named `ende.py`, `pw.txt`, `flag.txt.en`

After opening `ende.py` in an editor, we can see the following interesting lines of code: 

```python	
usage_msg = "Usage: "+ sys.argv[0] +" (-e/-d) [file]"
help_msg = usage_msg + "\n" +\
	"Examples:\n" +\
	"  To decrypt a file named 'pole.txt', do: " +\	
        "'$ python "+ sys.argv[0] +" -d pole.txt'\n"
```

Reading over these, it looks like the program accepts two arguments, `-e` or `-d`, as well as a target file.

We can infer from the next line where we're told we can decrypt a file with the `-d` flag that `-e` probably encrypts.

In any case, the goal here is to find a flag: so, let's try decrypting the `flag.txt.en` (en for encrypted?) file that we've been provided.

First, we'll check what pw.txt contains: this can be done with any text editor or `$ cat pw.txt`.

In my case the pw appears to be `aa821c16aa821c16aa821c16aa821c16`, so we copy that, then run ende.py (**en**crypt, **de**crypt?) with the `-d` argument and pass it the `flag.txt.en` file.

```
$ python3.10 ende.py -d flag.txt.en
Please enter the password:
> aa821c16aa821c16aa821c16aa821c16
picoCTF{4p0110_1n_7h3_h0us3_aa821c16}
```

Voila! There we have our flag.

## Wave a flag:

### Provided input(s): a file called "warm" with no extension, which the prompt describes as a program.

One of the hints suggests that this file/program is only usable on Linux, and provides information on making it executable using `cmhod +x warm`.

Due to the fact that both my laptop and my Raspberry Pi use an ARM CPU, I'm unable to run the provided warm file, so to the PicoCTF-provided web terminal we go.

wget the `warm` file, then in the same directory run `$ chmod +x warm` to make it executable. Now, you can run it by typing `$ ./warm` in the directory it is located in.

Upon first run, it outputs "Hello user! Pass me a -h to learn what I can do!": simple enough! Try running it again but this time as `$ ./warm -h` to pass the `-h` (usually short for --help) argument.
			
`Oh, help? I actually don't do much, but I do have this flag here: picoCTF{b1scu1ts_4nd_gr4vy_755f3544}`

And just like that, we have another flag!

## Nice netcat...

### Provided input(s): `$ nc mercury.picoctf.net 43239`

Running the provided command writes a series of 2-3 digit numbers to std out. Hint 2 helpfully references reading/writing ASCII, so let's start there.

Using [this](https://codebeautify.org/ascii-to-text) ASCII to text converter, we're able to translate the output of the command to `picoCTF{g00d_k1tty!_n1c3_k1tty!_7c0821f5}`. 

One thing I did notice with this and similar flags, is that not all translation sites are created equal. Some don't handle newlines well, some don't like not having a leading 0 on the 2 digit numbers, etc., so if one site gives you gibberish or something that seems adjacent to what you want, don't hesitate to try using another site!

## Static ain't always noise

### Provided input(s): Binary file named `static`, BASH script named `ltdis.sh`

The easy option here is of course to try running the provided script: opening the script shows that running with no arguments will suggest using it as `ltdis.sh <program-file>` - easy enough.

Using `$ sh ltdis.sh static` tells us that `static` was successfully disassembled, and that the result is available at `static.ltdis.x86_64.txt`, and any strings found in the file have been written to `static.ltdis.strings.txt`.

A simple `$ cat static.ltdis.strings.txt` outputs quite a lot of strings found in the binary, so let's try filtering it, shall we?

Using grep, we can filter the output of a given command by executing it and 'piping' it into grep, like so. `$ cat static.ltdis.strings.txt | grep 'pico'` - this searches the output for any strings which match the case sensitive input, and returns only those rather than the full output.

`picoCTF{d15a5m_t34s3r_1e6a7731}` - another flag found!

## Tab, Tab, Attack

### Provided input(s): `Addadshashanammu.zip` - zipped file containing a bunch of nested subdirectories

I assume the intent here is to teach new CLI users that tab is useful for navigating directories: first just unzip the file with `$ unzip Addadshashanammu.zip`, then `$ cd A<tab>/<tab>` ad nauseam till you reach the bottom of the directory.

Alternatively, a tool I'm fond of is `tree` - you can generally get it through your package manager of choice be it brew, apt, pacman, etc., and then use it like ` $ tree` in the directory you want to see the expanded structure of. It shows all subdirectories and their nested content, so it can be helpful to visualize large/confusing directories.

With `tree` it's easy to see that the bottommost directory/file is `fang-of-haynekhtnamet` - so, let's use old faithful, `cat`, to see what's inside.

```
$ cat Addadshashanammu/Almurbalarammi/Ashalmimilkala/Assurnabitashpi/Maelkashishi/Onnissiralis/Ularradallaku/fang-of-haynekhtnamet
HH/lib64/ld-linux-x86-64.so.2GNUGNU���|�%Z6ژU=
8#TT 1tt$DN                                     Y h "libc.so.6puts__cxa_finalize__li�� ��0)@�mV``^o�(
```

Okay, that's a bunch of gibberish, so we're not quite out of the woods yet. We need to figure out what the heck that `fang ...` file is: so, let's get into the directory it's in so we have an easier time of working with it, first off.

`$ cd Addadshashanammu/Almurbalarammi/Ashalmimilkala/Assurnabitashpi/Maelkashishi/Onnissiralis/Ularradallaku`

One command we can use to try to identify the file is, well, `file` - 

``` 
$ file -I fang-of-haynekhtnamet
fang-of-haynekhtnamet: application/x-pie-executable; charset=binary
```

So, it looks like this is an executable file. If we try to execute it however we receive the message `zsh: exec format error: ./fang-of-haynekhtnamet` - this is because I'm running on an ARM system and not an x86_64 Linux machine. Trying to execute the file in the PicoCTF web terminal outputs the flag.

## Magikarp Ground Mission

### Provided input(s): `$ ssh ctf-player@venus.picoctf.net -p 58707`, SSH host to connect to after starting the instance, unique passwod.

Once SSHed into the host, we can use `$ ls` to see that in the home directory there's two files; `1of3.flag.txt` and `instructions-to-2of3.txt`. The SSH host we are connected to is a 'minimized' system without many functions that we are used to. we can use `$ unminimize` if we want to download some core packages, but for now we'll leave it minimized.

First off, we'll try `$ cat 1of3.flag.txt` to get what appears to be the first third of our flag. Easy enough so far.

Next, we'll do the same for the instructions file, which gives us the following.

`Next, go to the root of all things, more succinctly /`. Once again, easy enough: just `$ cd /` and `$ ls`, and voila: hidden amongst the system directories, we have a few more interesting items.

```
2of3.flag.txt  dev   instructions-to-3of3.txt  media  proc  sbin  tmp
bin	       etc   lib		       mnt    root  srv   usr
boot	       home  lib64		       opt    run   sys   var
```

Let's stick with old faithful and try `$ cat 2of3.flag.txt`, giving us the second third of the flag.

We do the same with the instructions file and are told `Lastly, ctf-player, go home... more succinctly ~`

Once again, easy enough: `$ cd ~` `$ ls` give us the following: `3of3.flag.txt  drop-in`.

Catting the flag gives us the final part of it, but now what's the easiest way to combine them? There's a few ways of doing this, but the easiest in my opinion is to move each file to the same directory, then cat all three in order. Let's use our home (~) directory, for example.

We can check where the files are without CDing everywhere by `ls`ing a specific directory, like so: `$ ls drop-in`, to see that the first part of the flag is there. From ~, we'll just move the file: `$ mv drop-in/1of3.flag.txt .` - mv for move, then the file we're moving, then the directory we're moving it to: `.` is short for 'current directory', which in this case is ~.

Next we'll do the same thing for the third part of the flag: `$ mv /3of3.flag.txt .`, and then an `$ ls` to make sure everything is in our home directory now. If that shows all three parts, we just need to combine them now! We can try `cat` with multiple files provided as arguments by just listing them one after the other.

```
$ cat 1of3.flag.txt 2of3.flag.txt 3of3.flag.txt
picoCTF{xxsh_
0ut_0f_\/\/4t3r_
5190b070}
```

Well, that doesn't look quite right: we can filter the output of our `cat` with the `tr`, or 'translate' command.

```
cat 1of3.flag.txt 2of3.flag.txt 3of3.flag.txt | tr -d '\n'
picoCTF{xxsh_0ut_0f_\/\/4t3r_5190b070}
```

Perfect! By piping the output of our initial `cat` to `tr` with the `-d` (for delete) argument, and then providing '\n': the newline character, as the element we want to delete, it outputs the initial `cat` output but removes the newline characters, resulting in everything coming out on one line, nice and easy to copy + paste into the flag checker. Voila!

