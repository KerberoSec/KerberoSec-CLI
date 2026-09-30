source : [here](https://youtu.be/HxVVVvoXWSs?si=3MfOdoztHMLNrwv7)

### Types of File in Linux

There are seven (7) types of file in linux

| File Symbol |  File Type  |
| ----- | ------|
| - | Regular file |
| d | Directory |
| l | Link |
| c | Device File |
| s | Socket |
| p | FIFO or Named Pipe |
| d | Block device |

- __socket ```s``` : Special file to enable communications between two processes.__  
Find under ```/run/``` folder  
Example :
- ```/run/chrony/chronyd.sock```  
- ```find / -type s```
make sure before run this command user should have root access.  
- ```ls -l /run/gssproxy.sock``` run this command for check which kind of file is this.  

- __p FIFO or Named-pipe : Send data from one process to another so that receiving process reads the data first-in-first-out manner.__  
Can be created using ```mkfifo``` command.  
Example:  
- ```find / -type p```  
- ```ls -l /run/systemd/inaccessible/fifo```  

- __b block device file : A file that refers to a device.__
Find under ```/dev/```  
Example:  
```/dev/sda1```  
```find / -type b```

- __c character device file : We can create using mknod command. These files are present in /dev folder File that reads/writes data in character by character.__  
 Example:  
```/dev/input/mouse2```  

