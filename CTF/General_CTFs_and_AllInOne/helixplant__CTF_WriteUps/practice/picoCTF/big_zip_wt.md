# Big Zip
### picoCTF: practice
` easy ` `general skills ` ` picoGym exclusive `
# 
### Summary
This exercise primarily focuses on the usage of grep [1] to search files to find the flag. Performing linear search visually would be too lengthy of a process comparatively.

### Setting and Software
This CTF was completed in the picoCTF webshell. No other software or tools were needed.

### Given Media
- zip file to download

## Execution

### Download Files
The flag is somewhere within the given zip file. We are given a link to download the zip, and are expected to search through all files in order to find our flag. To download and open files enter the following commands:<br>

**download**:<br>
` wget https://artifacts.picoctf.net/c/504/big-zip-files.zip ` <br>
**unzip**:<br>
` unzip big-zip-files.zip `

The file should now be unzipped and ready to search. Looking at the sheer amount of files and their naming conventions demonstrates the need for grep to assist us in our search. <br>

### Search for Flag

Understanding the layout of picoCTF flags, I entered the following command to find text with *"picoCTF"*:<br>
` grep -ri "picoctf" * `

Breaking this down:<br>
` grep ` | searches through files to find a specified pattern <br>
` -ri ` | ` r ` performs a recursive search, ` i ` ignore case <br>
` "picoctf ` | the pattern we wish to discover <br>
` * ` | wildcard, searches all files and directories

This will produce the following output
` big-zip-files/folder_pmbymkjcya/folder_cawigcwvgv/folder_ltdayfmktr/folder_fnpfclfyee/whzxrpivpqld.txt:information on the record will last a billion years. Genes and brains and books encode picoCTF{gr3p_15_m4g1c_ef8790dc} `

The file has text which does contain the correct flag.

## Result

### Flag
` picoCTF{gr3p_15_m4g1c_ef8790dc} `

### Thoughts
Easy CTF. Not that hard to complete, but I had issues initially with trying to find a file named flag. Searching for the actual text containing *"picoCTF"* was easier and produced the correct result asap.

## References
[1] GNU Grep: https://www.gnu.org/software/grep/ 