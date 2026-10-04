# CHALLENGE: FIRST FIND

**DIFFICULTY:** EASY

**LINK:** [FIRST FIND](https://play.picoctf.org/practice/challenge/320?category=5&difficulty=1&originalEvent=gym&page=1)

## DESCRIPTION
Unzip this [archive](https://artifacts.picoctf.net/c/500/files.zip) and find the file named 'uber-secret.txt'.

## STEPS/SOLUTION

1. First create a directory with the name of your wish by using the command, `mkdir <directory name>`. Then navigate into it with, `cd <directory name>`.
2. Download the archive by using the `wget https://artifacts.picoctf.net/c/500/files.zip` command.
3. The challenge has specifically asked me to find a file named, 'uber-secret.txt'.
4. It is important to understand that a zip file may contain hidden files or directories that are not immediately visible. To identify all files and directories within the archive: including nested or hidden ones: without actually extracting the contents, a specific command is required. This allows you to inspect the structure of the zip file and locate files of interest, such as uber-secret.txt, without performing a full extraction.
5. The command that accomplishes this is: `unzip -la <file>`. This lists all files and directories contained in the zip, including deeply nested ones.
6. Now extract the zip file using the command, `unzip files.zip`. This will extract all the files of this zip file into a directory called files.
7. Upon descending through several layers of nested directories, the deepest directory contains the target file: uber-secret.txt. Refer to [this image](https://github.com/msvignesh-25/picoCTF-Writeups/blob/main/IMAGES/FIRST%20FIND/unzip.png).
8. At this point, you should still be in the directory you created in the first step. This directory contains both the zip file and the extracted 'files' directory.
9. Now you can proceed to enter each directory. Like, the first command must be `cd files`, then list the content of the directory using `ls` and then `cd <name>`.
10. At a certain point, the directory contents may not display the expected target file. Instead, an entry with an unusual or UTF-encoded-looking name may appear, indicating the presence of hidden items.
11. Use `ls -la` command. This command will list all the directories including hidden ones. That is, you need to enter something like, `cd .secret`.
12. Then repeat the process until you find the desired text file and then find the content of the file and submit the flag. 
