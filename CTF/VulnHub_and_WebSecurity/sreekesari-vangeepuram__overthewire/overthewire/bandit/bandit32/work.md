Shell we have an argument?
![Bandit32](https://github.com/sreekesari-vangeepuram/overthewire/blob/master/overthewire/bandit/bandit32/level32-%3Elevel33.png)

Let's see what we can do, here:
```
WELCOME TO THE UPPERCASE SHELL
>> ls -al
sh: 1: LS: not found
>> $SHELL
WELCOME TO THE UPPERCASE SHELL
>> $EDITOR
>> $?
sh: 1: 0: not found
>> $#
sh: 1: 0: not found
>> $?
sh: 1: 0: not found
>> $1
>> $0
$ whoami
bandit33
$ bash
bandit33@bandit:~$ cat /etc/bandit_pass/bandit33
c9c3199ddf4121b10cf581a98d51caee
bandit33@bandit:~$ exit
exit
$ exit
>> >>
```
Just like `bash` or `sh` or `zsh` or `fish` or ... we have a new & wierd shell here, which is called `UPPERCASE SHELL`!
So, firstly we tried to use a *nix command.
No positive response. But we got a clue that this `UPPERCASE SHELL` is running on `sh`.
Since the response is `stderr` driven by `sh`.
So, we tried to work with `UPPERCASE SHELL` itself, but suddenly I got an idea that "What if we try to ping the base argument" which is the shell `sh`.
Since this is running like:
```
sh  ./uppercase
$0      $1
```
Learn more about command-line arguments [here](http://linuxcommand.org/lc3_wss0120.php).
If you've checked the resource which I suggested previously [Ryan's Tutorial], then there is no need to invest your time, [here](http://linuxcommand.org/lc3_wss0120.php)...

If we try to invoke `sh` by giving our input as $0, we get the shell `sh`.
Right-after we've checked who's the user here.
It's shocking that, we've tried to enter the machine as `bandit32`.
But now we are `bandit33`.

So, that's it! This challenge's aim is to let us aware about `command-line arguments`.
Since the eligible group to read the file `/etc/bandit_pass/bandit33` is `bandit33`, we can simply read it.
COOL, right!

Hope you've learnt something new from this [if you don't know this before/didn't strike to you during the start].

Now, let's use the password `c9c3199ddf4121b10cf581a98d51caee` to log into the remote-machine as `bandit33`, again.

**Warning: Please, first try Level 33 -> Level 34! Otherwise it's useless to simply cpy-pst the command[s]/password[s].
