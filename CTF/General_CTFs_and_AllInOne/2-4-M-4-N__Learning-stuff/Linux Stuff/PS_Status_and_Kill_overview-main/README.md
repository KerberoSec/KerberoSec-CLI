source : [here](https://youtu.be/vvZcssOpuIk?si=A59knCsnydOSjNrA)

## PS (Process Status)
used to display all the running process in the linux system.  

```ps``` = show the process of current shell  
PID: unique process ID
TTY: Terminal type of user logged in to  
TIME: amount of CPU in min and sec that process has been running  
CMD: name of the command that launched the progran.  

- __To see the running processes__  
```ps -e```  
```ps -a```  
```ps -ef| ef``` for full format

- __To see all running process in BSD (Berkeley Software Distribution) format.  
Ideally it gives you more information.__  
```ps aux```  
```ps -ef | grep httpd```  

- __To see the process by username__  
```ps -u root```  
```ps -G kali```  

- __To see the process tree__  
```ps -ejH```  
```ps -ejH | grep httpd```

---

## Kill Overview 

```kill options PID```  
- Options = signal name or N0.  
- PID = Process ID  

To see all the signal names  
```kill -l```  

__Most widely used kill commands__  

```kill PID```  
```kill -1 PID``` (to restart the process)  
```kill -2 PID``` (interrupt from keyboard like Ctrl+C)  
```kill -9 PID``` (forcefully terminate the process)  
```kill -15 PID``` (kill process gracefully)  

