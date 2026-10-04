# Bandit Level 1

## Part I

Enter the following command in your Terminal :  

```bash
ls -la
# List information about the FILEs with the author of each file and also without ignoring entries (files) starting with .
```
```bash
cat readme
# Concatenate files and print on the standard output
```
```bash
realpath readme
# Return the canonicalised absolute pathname 
```

```bash
# Exit the session then
scp -P 2220 bandit0@bandit.labs.overthewire.org:/home/bandit0/readme <LocalMachinePATH>
# <LocalMachinePATH> : your temporary file to copy the ascii text
# Password           : bandit0
```
We are using realpath and [scp commands](https://linuxize.com/post/how-to-use-scp-command-to-securely-transfer-files/) to copy ***readme*** file from OTW server to our Machine, and using it for the next Level.

## Part II

The ***host*** to which you need to connect is *bandit.labs.overthewire.org*, on ***port*** 2220. The ***username*** is *bandit1* and the ***password*** is the text from readme [Part 1](https://github.com/Reda-BELHAJ/OverTheWire/blob/main/Bandit/Bandit0-9/Level1.md#part-i). 

1. Enter the following command:  

```bash
	ssh bandit.labs.overthewire.org -p 2220 -l bandit1
	# OR ssh bandit1@bandit.labs.overthewire.org -p 2220
	# password: boJ9jbbUNNfktd78OOpsqOltutMc3MY1
```
2. Enter the password as shown in the comment of bash.
