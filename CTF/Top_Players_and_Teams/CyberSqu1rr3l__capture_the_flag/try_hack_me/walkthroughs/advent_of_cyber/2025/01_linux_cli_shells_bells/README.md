```
▌  ▗           ▞▀▖▌  ▜▘     ▞▀▖▌     ▜▜     ▛▀▖   ▜▜    
▌  ▄ ▛▀▖▌ ▌▚▗▘ ▌  ▌  ▐  ▄▄▖ ▚▄ ▛▀▖▞▀▖▐▐ ▞▀▘ ▙▄▘▞▀▖▐▐ ▞▀▘
▌  ▐ ▌ ▌▌ ▌▗▚  ▌ ▖▌  ▐      ▖ ▌▌ ▌▛▀ ▐▐ ▝▀▖ ▌ ▌▛▀ ▐▐ ▝▀▖
▀▀▘▀▘▘ ▘▝▀▘▘ ▘ ▝▀ ▀▀▘▀▘     ▝▀ ▘ ▘▝▀▘ ▘▘▀▀  ▀▀ ▝▀▘ ▘▘▀▀ 
```
In this TryHackMe room, we explore the Linux command-line interface and use it to unveil
Christmas mysteries. [^1]

Which CLI command would you use to list a directory?
-----------------------------------------------------------------------------------------
The `ls` command enables us to list the contents of the current directory. Sometimes, we
want to discover hidden files and directories that start with a dot, and do that with
the `ls -a` command.

What flag did you see inside of the McSkidy's guide?
-----------------------------------------------------------------------------------------
Upon moving to the `Guide` directory, we reveal a hidden file `.guide.txt` that contains
the flag and instructions on checking the `/var/log/` log files with the `grep` command.

Which command helped you filter the logs for failed logins?
-----------------------------------------------------------------------------------------
With the `grep` command, we could look for a specific text inside the logging files.
Since we are interested in failed log in attempts, we can search in the `auth.log` file
for "Failed password" events.

What flag did you see inside the Eggstrike script?
-----------------------------------------------------------------------------------------
McSkidy left a hint in her message, that there is an "Eggsploit" on the server. In order
to find such a malicious exploit, we search for it with `find /home/socmas -name *egg*`
and discover the file under `/home/socmas/2025/eggstrike.sh`. This exploit-like script
copies unique items from the wishlist file to a temory file and then overwrites it with
an eastmas file. This results in the destruction of the wishlist file and thus an
invasion on Christmas preparations.

Which command would you run to switch to the root user?
-----------------------------------------------------------------------------------------
It is possible to switch to the root user with the `sudo su` command. 

Finally, what flag did Sir Carrotbane leave in the root bash history?
-----------------------------------------------------------------------------------------
After gaining root privileges with `sudo su`, we can move to the `/root` home directory
and print the `.bash_history` file to discover the flag and further details on the
exploit execution, in particular the file upload and download.

What is the key for the Side Quest 1 following the note in McSkidy's documents?
-----------------------------------------------------------------------------------------
From the `read-me-please.txt` note, we find out that there are further clues in the
`/home/eddi_knapp/Documents/` directory. For that, we are given the credentials to log in
as `eddi_knapp` with the password `S0mething1Sc0ming` and three more clues, so called
easter eggs, that will combine into a passcode to unlock the encrypted vault.

> 1) I ride with your session, not with your chest of files. Open the little bag your
> shell carries when you arrive.
> 2) The tree shows today; the rings remember yesterday. Read the ledger’s older pages.
> 3) When pixels sleep, their tails sometimes whisper plain words. Listen to the tail.

We are now tasked to find the fragments from these clues, join them together and use the
resulting passcode to decrypt the message.

1. **PASSFRAG1:** The hint suggests the secret is tied to the session environment, not
   the filesystem. Further, we are advised to investigate something the shell uses upon
   initialization. This makes us suspicious of the `.bashrc` configuration file and
   indeed, in the end of the file there is the desired exported variable `PASSFRAG1`.
3. **PASSFRAG2:** At first, we look at the running process with `pstree` but can not
   discover anything interesting. Then, we disover a hidden git repository `.secret_git`
   and with the hint suggesting historical entries, we examine the `git log` entries.
   There are two commits, with the first one being interesting due to "add private note".
   By using the commit identification, we can show the file from this commit with the
   command `git show d12875c8b62e089320880b9b7e41d6765818af3d`. And in turn, the private
   note from McSkidy contains the second `PASSFRAG2` for us to store.
5. **PASSFRAG3:** This clue clearly references images, so we search the `~/Pictures`
   folder and discover a hidden file `.easter_egg`. Since it is a text file, we can open
   it and discover the final key piece `PASSFRAG3` in the end of the file.

Putting these three pieces together, we can form the final passcode that is used to
unlock the encrypted vault `mcskidy_note.gpg` in the documents folder with `$ gpg --batch
--yes --passphrase-fd 0 -d mcskidy_note.txt.gpg` followed by the obtained passcode. Upon
reading McSkidy's note we are tasked with further instructions. Now, we need to replace
the contents of the `/home/socmas/2025/wishlist.txt` file with the following list to
stop the takeover glitching and save the site.

```
Hardware security keys (YubiKey or similar)
Commercial password manager subscriptions (team seats)
Endpoint detection & response (EDR) licenses
Secure remote access appliances (jump boxes)
Cloud workload scanning credits (container/image scanning)
Threat intelligence feed subscription

Secure code review / SAST tool access
Dedicated secure test lab VM pool
Incident response runbook templates and playbooks
Electronic safe drive with encrypted backups
```
```
When the wishlist is corrected, the site will show a block of ciphertext. This ciphertext can be decrypted with the following unlock key:

UNLOCK_KEY: 91J6X7R4FQ9TQPM9JX2Q9X2Z

To decode the ciphertext, use OpenSSL. For instance, if you copied the ciphertext into a file /tmp/website_output.txt you could decode using the following command:

cat > /tmp/website_output.txt
openssl enc -d -aes-256-cbc -pbkdf2 -iter 200000 -salt -base64 -in /tmp/website_output.txt -out /tmp/decoded_message.txt -pass pass:'91J6X7R4FQ9TQPM9JX2Q9X2Z'
cat /tmp/decoded_message.txt

Sorry to be so convoluted, I couldn't risk making this easy while King Malhare watches.: McSkidy
```

TBC [^2]

[^1]: https://tryhackme.com/room/linuxcli-aoc2025-o1fpqkvxti
[^2]: https://tryhackme.com/adventofcyber25/sidequest
