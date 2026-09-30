```
▞▀▖  ▌         ▐      ▗▀▖ ▞▀▖   ▌         ▛▀▖          ▀▛▘        ▌  
▙▄▌▞▀▌▌ ▌▞▀▖▛▀▖▜▀  ▞▀▖▐   ▌  ▌ ▌▛▀▖▞▀▖▙▀▖ ▙▄▘▙▀▖▞▀▖▛▀▖  ▌▙▀▖▝▀▖▞▀▖▌▗▘
▌ ▌▌ ▌▐▐ ▛▀ ▌ ▌▐ ▖ ▌ ▌▜▀  ▌ ▖▚▄▌▌ ▌▛▀ ▌   ▌  ▌  ▛▀ ▙▄▘  ▌▌  ▞▀▌▌ ▖▛▚ 
▘ ▘▝▀▘ ▘ ▝▀▘▘ ▘ ▀  ▝▀ ▐   ▝▀ ▗▄▘▀▀ ▝▀▘▘   ▘  ▘  ▝▀▘▌    ▘▘  ▝▀▘▝▀ ▘ ▘
```
Get ready for the Advent of Cyber 2025 with the "Advent of Cyber Prep Track", a series of
warm-up tasks aimed to get beginners ready for this year's event on TryHackMe. [^1]

Challenge 1: Password Pandemonium
-----------------------------------------------------------------------------------------
McSkidy's old password `P@ssw0rd123` has been flagged as insecure. It is our objective to
create a new password that passes all system checks. Therefore, we need to make sure the
password has at least 12 characters and features at least one uppercase, lowercase, 
number and symbol. One such credential that was not in the breach database could be
`H4fooBar303!`.

Challenge 2: The Suspicious Chocolate.exe
-----------------------------------------------------------------------------------------
Upon scanning the mysterious `chocolate.exe` file with VirusTotal, one vendor detects
a `MalhareTrojan`. The file should thus be classified as malicious.

Challenge 3: Welcome to the AttackBox!
-----------------------------------------------------------------------------------------
This introductory task requires us to navigate the command line to view the flag.
We list the directory with `ls`, use `cd challenges` to change the directory and read the
text file with `cat welcome.txt`.

Challenge 4: The CMD Conundrum
-----------------------------------------------------------------------------------------
Similar to the previous task, we now use the Windows command prompt to find the hidden
file. With `dir` we get a listing of the files and directories and get suspicious of the
`mystery_data` folder. Upon moving to this directory with `cd` we uncover the hidden flag
with `dir /a` and `type hidden_flag.txt`.

Challenge 5: Linux Lore
-----------------------------------------------------------------------------------------
We repeat the process of finding hidden files in Linux and are given clear instructions
where to look. First, we use `cd /home/mcskidy` to change the directory. Then, we show
all files with `ls -la` and reveal the flag with `cat .secret_message`.

Challenge 6: The Leak in the List
-----------------------------------------------------------------------------------------
McSkidy suspects his account might have been part of a breach and in order to find out,
we use his email address `mcskidy@tbfc.com` in the simulated "Have I Been Pwned" website.
The email address has been found in the simulated breach record `hopsec[.]io`.

Challenge 7: WiFi Woes in Wareville
-----------------------------------------------------------------------------------------
The router password needs to be secured. For that, we log in to the security settings of
the router with the credentials `admin` and `admin` to then change the password to a new
one, for example `GrR43@St0nG#`.

Challenge 8: The App Trap
-----------------------------------------------------------------------------------------
By reviewing the list of connected apps, we discover the permission "Password Vault" in
the Easmas Scheduler app. Due to its malicious nature, we revoke this permission and are
rewarded with the flag.

Challenge 9: The Chatbot Confession
-----------------------------------------------------------------------------------------
In this adversarial machine learning attack, we uncover sensitive information. In the
chat with the FestiveBot, a URL to the staging admin, email credentials and a service
token are revealed which should not have happened.

Challenge 10: The Bunny’s Browser Trail
-----------------------------------------------------------------------------------------
Here, we are expected to read the provided web log entries and uncover a GET request to
the sensitive `/admin/panel` from an unusual `BunnyOS` host which is to be classified as
unusual.

[^1]: https://tryhackme.com/room/adventofcyberpreptrack
