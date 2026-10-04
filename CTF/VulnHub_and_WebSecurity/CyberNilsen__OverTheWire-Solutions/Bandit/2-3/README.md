# 🔁 Bandit Level 2 → Level 3

Reading the goal, I find it's kind of the same as the last level. Therefore, we have to run the same command again. But instead of writing the full thing myself, I just typed `cat --` and pressed `Tab` to let the terminal autocomplete the filename. This shows you can either use tab completion or manually escape the spaces in the filename.

The password for the next level is stored in a file called --spaces in this filename-- located in the home directory

bandit2@bandit:~$ ls  
--spaces in this filename--  

bandit2@bandit:~$ cat ./--spaces\ in\ this\ filename--  
MNk8KNH3Usiio41PRUEoDFPqfxLPlSmx  

bandit2@bandit:~$
