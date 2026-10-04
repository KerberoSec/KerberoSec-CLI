# CHALLENGE: CREDSTUFF

**DIFFICULTY:** MEDIUM

**LINK:** [credstuff](https://play.picoctf.org/practice/challenge/261?category=2&originalEvent=70&page=1)

## DESCRIPTION
We found a leak of a blackmarket website's login credentials. Can you find the password of the user `cultiris` and successfully decrypt it?
Download the leak [here](https://artifacts.picoctf.net/c/151/leak.tar).
The first user in `usernames.txt` corresponds to the first password in `passwords.txt`. The second user corresponds to the second password, and so on.

## STEPS/SOLUTION

1. Before proceeding with the challenge, create a directory in the picoCTF webshell and navigate into the directory. 
2. Download the archive file by using **wget** command.
3. This is a tar archive file. So decompress the file by using the command, `tar -xvf leak.tar`. Here, x stands for extract (to execute the extraction operation); v stands for verbose (to print the information on the screen as the extraction happens and this includes what directories are created and where the files are located); f stands for file (remember, file name should only come after this f). 
4. Now if the ls command is executed, a directory called leak would have been created. Navigating into the directory, the two files mentioned in the challenge description can be found. 
5. The challenge description is to find the password of the user `cultiris`. Thus, using the command, `grep -n "cultiris" usernames.txt`, would return the line number where the word **cultiris** is found. 
6. At this stage, we have obtained at which line, the desired username is present. Now the aim is to find whatever content is present at this line number in the **passwords.txt** file. 
7. The sed command, which stands for stream editor, is a text manipulation utility. It is used to perform operations like searching, inserting and even deleting text in files. 
8. Suppose the line number observed using `grep` command in 5th step is **10**. The command that is to be used to find the password corresponding to the user is, `sed -n '10p' passwords.txt`.
9. This command would return some text which is in ROT13 cipher format. Use [CyberChef](https://gchq.github.io/CyberChef/) to decrypt the cipher. This decoded text is the correct password and also the flag to be submitted. 

