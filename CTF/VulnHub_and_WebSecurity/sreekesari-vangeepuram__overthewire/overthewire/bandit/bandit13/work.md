This is pretty easy right!
![Bandit13](https://github.com/sreekesari-vangeepuram/overthewire/blob/master/overthewire/bandit/bandit13/level13-%3Elevel14.png)

Let's see:
```
bandit13@bandit:~$ ls
sshkey.private
bandit13@bandit:~$ ls
sshkey.private
bandit13@bandit:~$ clear

bandit13@bandit:~$ ls
sshkey.private
bandit13@bandit:~$ ssh -i sshkey.private bandit14@localhost
Could not create directory '/home/bandit13/.ssh'.
The authenticity of host 'localhost (127.0.0.1)' can't be established.
ECDSA key fingerprint is SHA256:98UL0ZWr85496EtCRkKlo20X3OPnyPSB5tB5RPbhczc.
Are you sure you want to continue connecting (yes/no)? yes
Failed to add the host to the list of known hosts (/home/bandit13/.ssh/known_hosts).
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

bandit14@bandit:~$
bandit14@bandit:~$ cat /etc/bandit_pass/bandit14
4wcYUJFw0k0XLShlDzztnTBHiqxU3b3e
bandit14@bandit:~$
```

Since we have the private-key we can simply SSH into that machine as it's user.
Read more about Secure-Shell [SSH] protocal.
I suggest its official site: `https://www.ssh.com/ssh/`.

`localhost` is nothing but the local-host-machine.

Since we are on the machine with name `bandit` where `bandit0`, `bandit1`, ... till now `bandit13` are the user in that machine.

To understand this clearly, let's go to the `/home` directory;
```
bandit14@bandit:~$ cd /home
bandit14@bandit:/home$ ls
bandit0   bandit12  bandit16  bandit2   bandit23  bandit27      bandit29      bandit30-git  bandit33  bandit7
bandit1   bandit13  bandit17  bandit20  bandit24  bandit27-git  bandit29-git  bandit31      bandit4   bandit8
bandit10  bandit14  bandit18  bandit21  bandit25  bandit28      bandit3       bandit31-git  bandit5   bandit9
bandit11  bandit15  bandit19  bandit22  bandit26  bandit28-git  bandit30      bandit32      bandit6
bandit14@bandit:/home$
```

See there are different users but the machine is same for all those user, in this scenario!
`localhost` is the simple-notaion or whatever you think, which is simply the host-machine for user[s]. 

So, hope you've learnt something new from this [if you don't know this before/didn't strike to you during the start].

Now, let's continue in the  remote-machine as `bandit14`, since we've logged-in already as `bandit14`.
If you've logged-out of it, the use the password `4wcYUJFw0k0XLShlDzztnTBHiqxU3b3e` which we found at `/etc/bandit_pass/bandit14` to login.

**Warning: Please, first try Level 14 -> Level 15! Otherwise it's useless to simply cpy-pst the command[s]/password[s].
