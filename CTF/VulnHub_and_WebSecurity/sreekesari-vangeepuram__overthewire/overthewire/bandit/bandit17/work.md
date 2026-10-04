Another simple challenge.
![Bandit17](https://github.com/sreekesari-vangeepuram/overthewire/blob/master/overthewire/bandit/bandit17/level17-%3Elevel18.png)

First let's login to the remote-machine with the private-key, by saving it in our local-machine with read-only permissions for owner-only!
```
$ nano private.key
$ chmod 600 private.key 
$ ls
private.key
$ ssh -i private.key bandit17@bandit.labs.overthewire.org -p 2220
This is a OverTheWire game server. More information on http://www.overthewire.org/wargames

Linux bandit.otw.local 5.4.8 x86_64 GNU/Linux

      ,----..            ,----,          .---.
     /   /   \         ,/   .`|         /. ./|
    /   .     :      ,`   .'  :     .--'.  ' ;
   .   /   ;.  \   ;    ;     /    /__./ \ : |
  .   ;   /  ` ; .'___,/    ,' .--'.  '   \' .
  ;   |  ; \ ; | |    :     | /___/ \ |    ' '
  |   :  | ; | ' ;    |.';  ; ;   \  \;      :
  .   |  ' ' ' : `----'  |  |  \   ;  `      |
  '   ;  \; /  |     '   :  ;   .   \    .\  ;
   \   \  ',  /      |   |  '    \   \   ' \ |
    ;   :    /       '   :  |     :   '  |--"
     \   \ .'        ;   |.'       \   \ ;
  www. `---` ver     '---' he       '---" ire.org

Welcome to OverTheWire!

If you find any problems, please report them to Steven or morla on
irc.overthewire.org.

--[ Playing the games ]--

  This machine might hold several wargames.
  If you are playing "somegame", then:

    * USERNAMES are somegame0, somegame1, ...
    * Most LEVELS are stored in /somegame/.
    * PASSWORDS for each level are stored in /etc/somegame_pass/.

  Write-access to homedirectories is disabled. It is advised to create a
  working directory with a hard-to-guess name in /tmp/.  You can use the
  command "mktemp -d" in order to generate a random and hard to guess
  directory in /tmp/.  Read-access to both /tmp/ and /proc/ is disabled
  so that users can not snoop on eachother. Files and directories with
  easily guessable or short names will be periodically deleted!

  Please play nice:

    * don't leave orphan processes running
    * don't leave exploit-files laying around
    * don't annoy other players
    * don't post passwords or spoilers
    * again, DONT POST SPOILERS!
      This includes writeups of your solution on your blog or website!

--[ Tips ]--

  This machine has a 64bit processor and many security-features enabled
  by default, although ASLR has been switched off.  The following
  compiler flags might be interesting:

    -m32                    compile for 32bit
    -fno-stack-protector    disable ProPolice
    -Wl,-z,norelro          disable relro

  In addition, the execstack tool can be used to flag the stack as
  executable on ELF binaries.

  Finally, network-access is limited for most levels by a local
  firewall.

--[ Tools ]--

 For your convenience we have installed a few usefull tools which you can find
 in the following locations:

    * gef (https://github.com/hugsy/gef) in /usr/local/gef/
    * pwndbg (https://github.com/pwndbg/pwndbg) in /usr/local/pwndbg/
    * peda (https://github.com/longld/peda.git) in /usr/local/peda/
    * gdbinit (https://github.com/gdbinit/Gdbinit) in /usr/local/gdbinit/
    * pwntools (https://github.com/Gallopsled/pwntools)
    * radare2 (http://www.radare.org/)
    * checksec.sh (http://www.trapkit.de/tools/checksec.html) in /usr/local/bin/checksec.sh

--[ More information ]--

  For more information regarding individual wargames, visit
  http://www.overthewire.org/wargames/

  For support, questions or comments, contact us through IRC on
  irc.overthewire.org #wargames.

  Enjoy your stay!

bandit17@bandit:~$
```
We are in, now what shall we do?

Let's see, what we can do...
```
bandit17@bandit:~$ diff passwords.old passwords.new 
42c42
< w0Yfolrc5bwjS4qw5mq1nnQi6mF03bii
---
> kfBf3eYk5BPBRzwjqutbbfE887SVc5Yd
```

`diff` is a very famous and useful tool to identify the differences/changes implemented between two/more files...

Well there's also another method which is useful to complete this challenge with the knowledge of tools used in out previous challenges.
Let's see how it's done:
```
bandit17@bandit:~$ sort passwords.* | uniq -u
kfBf3eYk5BPBRzwjqutbbfE887SVc5Yd
w0Yfolrc5bwjS4qw5mq1nnQi6mF03bii
bandit17@bandit:~$ grep kfBf3eYk5BPBRzwjqutbbfE887SVc5Yd passwords.old 
bandit17@bandit:~$ grep kfBf3eYk5BPBRzwjqutbbfE887SVc5Yd passwords.new
kfBf3eYk5BPBRzwjqutbbfE887SVc5Yd
bandit17@bandit:~$ grep w0Yfolrc5bwjS4qw5mq1nnQi6mF03bii passwords.new 
bandit17@bandit:~$ grep w0Yfolrc5bwjS4qw5mq1nnQi6mF03bii passwords.old
w0Yfolrc5bwjS4qw5mq1nnQi6mF03bii
```
So, from the challenge statement, the password in passwords.new and is the only line that has been changed between <h3>passwords.old</h3> and <h3>passwords.new</h3>.
Since the changed line is `w0Yfolrc5bwjS4qw5mq1nnQi6mF03bii` which is replaced with `kfBf3eYk5BPBRzwjqutbbfE887SVc5Yd`.
So, the password is : `kfBf3eYk5BPBRzwjqutbbfE887SVc5Yd`.

Hope you've learnt something new from this [if you don't know this before/didn't strike to you during the start].

Now, let's use the password `kfBf3eYk5BPBRzwjqutbbfE887SVc5Yd` to log into the remote-machine as `bandit18`.

**Warning: Please, first try Level 18 -> Level 19! Otherwise it's useless to simply cpy-pst the command[s]/password[s].
