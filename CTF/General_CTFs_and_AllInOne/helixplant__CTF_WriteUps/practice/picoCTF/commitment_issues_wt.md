# Commitment Issues
### picoCTF: practice
` easy ` `general skills` `picoCTF 2024`
# 
### Summary
This exercise primarily focuses on the usage of git [1] to find the flag. Git is a version control tool used regularly by developers. In various CTF events, there are usually hidden flags within old git commits.

### Setting and Software
This CTF was completed in the picoCTF webshell. No other software or tools were needed.

### Given Media
- zip file to download

## Execution

### Download Files
The flag is somewhere within the given zip file. A link is given to download the zip, and it is be expected to be found within. To download and open files enter the following commands:<br>

**download**:<br>
` wget https://artifacts.picoctf.net/c_titan/137/challenge.zip `<br>
**unzip**:<br>
` unzip challenge.zip `

### Search for Flag

#### Initial Search
Given the wording of the challenge it can be inferred that this challenge will require the utilization of git. This is confirmed with the hints as well. 

After performing the file download and unzip, there is a directory which is revealed, titled ***drop-in***. Inspecting this directory reveals there is exactly one file titled ***message.txt***. It is likely that the flag can be found somewhere within this file.

Reviewing the contents within it displays the following message: ***"TOP SCERET"***. Given that there is no other information found within this file, it is a good idea to start exploring ways to recover previous versions.

#### Git
The flag is likely within a previous version of the ***message.txt*** file. To see all previous commits I entered the following: 
<br>`git log`

Breaking this down:<br>
` git ` | calls git <br>
` log ` | shows previous commits  <br>

This displays the following results:

<p style="text-align: center; font-style: italic;">Figure 1: Commit Log</p> 

*[Image: figure 1: commit log]*

Here we see two different commits, the current one where sensitive information was removed, and the first iteration which contained the flag. I want to go to the first commit to see if the flag is contained within this text file.

Git allows for viewing of previous commits, given that this is a version control software. To view this commit, I need the commit id. This is the long string of characters in yellow after the word commit found in *Figure 1*. To view this specific commit I entered the following:
<br>`git checkout ea859bf3b5d94ee74ce5ee1afa3edd7d4d6b35f0`

Breaking this down:<br>
` git ` | calls git <br>
` checkout ` | shows previous commits  <br>
`ea859bf3b5d94ee74ce5ee1afa3edd7d4d6b35f0 ` | commit id

After executing this command, I am given a message stating I am successfully in the previous commit. This means I now have access to the old version of ***message.txt*** file. Viewing the contents of this file now reveals the flag.

## Result

### Flag
` picoCTF{s@n1t1z3_cf09a485} `

### Thoughts
I enjoyed this exercise. Being able to utilize Git is important in the development of software. I use version control for most of my projects through GitHub. It is fun to do a bit of forensic work to find the hidden flag!

## References
[1] Git: https://git-scm.com/ 

## All Steps: DIY
`-$ wget https://artifacts.picoctf.net/c_titan/137/challenge.zip`: USER gets file<br>
`...downloaded successfully` - SYSTEM downloads<br>
`-$ unzip challenge.zip` --- USER unzips the file just downloaded<br>
`...unzipped successfully` - SYSTEM unzips the file<br>
`-$ ls` --- USER views files<br>
`... challenge.zip drop-in` - SYSTEM displays files and directories being challenge.zip and drop-in (both directories)<br>
`-$ cd drop-in` --- USER changes directory to drop-in<br>
`... changes directory` - SYSTEM changes to drop-in directory<br>
`-$ ls`<br>
`... message.txt` - SYSTEM displays files and directories being message.txt (file)  <br>
`-$ cat message.txt` --- USER calls to display contents within message.txt<br>
`... TOP SCERET` - SYSTEM displays message.txt contents<br>
`-$ git log` --- USER requests all commit ids<br>
`... ` - SYSTEM displays all commit ids<br>
`-$ git checkout ea859bf3b5d94ee74ce5ee1afa3edd7d4d6b35f0 ` --- USER heads to previous commit <br>
`... ` - SYSTEM loads previous commit <br>
`-$ cat message.txt` --- USER calls to display contents within message.txt <br>
`... picoCTF{s@n1t1z3_cf09a485}` - SYSTEM displays message.txt contents

## All Steps: To the Treasure
`-$ wget https://artifacts.picoctf.net/c_titan/137/challenge.zip`: USER gets file<br>
`...downloaded successfully` - SYSTEM downloads<br>
`-$ unzip challenge.zip` --- USER unzips the file just downloaded<br>
`...unzipped successfully` - SYSTEM unzips the file<br>
`-$ cd drop-in` --- USER changes directory to drop-in<br>
`... changes directory` - SYSTEM changes to drop-in directory<br>
`-$ git checkout ea859bf3b5d94ee74ce5ee1afa3edd7d4d6b35f0 ` --- USER heads to previous commit <br>
`... ` - SYSTEM loads previous commit <br>
`-$ cat message.txt` --- USER calls to display contents within message.txt <br>
`... picoCTF{s@n1t1z3_cf09a485}` - SYSTEM displays message.txt contents