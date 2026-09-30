# Description

Here is a binary that has enough privilege to read the content of the flag file but will only let you know its hash. 
If only it could just give you the actual content!
Connect using ssh ctf-player@shape-facility.picoctf.net -p 51426 with the password, 8d076785 and run the binary named "flaghasher".
You can get a copy of the binary if you wish: scp -P 51426 ctf-player@shape-facility.picoctf.net:~/flaghasher .

# Solution

First you need to ssh into the machine with `ssh ctf-player@shape-facility.picoctf.net -p 51426` and the password provided, `8d076785`.

First thing you can do when you are in the shell is run the `ls -l` command to see that there is an executable file called `flaghasher`. When you run the executable it gives this output:

```
Computing the MD5 hash of /root/flag.txt.... 

6cc51034c4d9ec81fe8525a86ef9f3a6  /root/flag.txt
```

From here you can try to look at the flaghasher executable in Ghidra by using scp to move it on to your machine but it's not needed. You can just run strings and see this important string to consider:

```
Computing the MD5 hash of /root/flag.txt.... 
/bin/bash -c 'md5sum /root/flag.txt'
```

From here you can tell that it's simply calling md5sum on /root/flag.txt which will always run that way when running flaghasher. The next step would be to override the md5sum function and write a way to print the flag instead.

You can do that by just making your on md5sum file that uses /bit/cat to print out the contents of /root/flag.txt which is where the flag is located: `echo "/bin/cat /root/flag.txt" > md5sum`

Now that the file is created you can turn it to an excutable file with, `chmod +x md5sum`, and the use the `export PATH=.:$PATH` command to make the PATH enviroment in the current enviroment. This was done with putting "." in front of path and so it will in the current directory when searching for executables first. This will make it so it will find the version of md5sum that was saved to the home directory first and execute that.

After all of this you can run `./flaghasher` executable and after around 2 seconds it will output the flag.

Flag: `picoCTF{sy5teM_b!n@riEs_4r3_5c@red_0f_yoU_bfa4...}`