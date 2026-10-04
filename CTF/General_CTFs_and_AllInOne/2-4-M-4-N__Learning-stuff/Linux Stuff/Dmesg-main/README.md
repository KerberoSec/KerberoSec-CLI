## System Monitoring

### dmesg command
linux utility that displays kernel-related messages retrived from the kernel ring buffer.  
the ring buffer stores information about hardware, device driver initialization, and messages from kernel modules that take place during system startup.  

# dmesg command overview

- ```dmesg ```
- ```dmesg -HTx | more ``` (Human readable, timestamp, decode)
- ```dmesg | more ```
- ```dmesg | less ```
- ```dmesg | head -10 ```
- ```dmesg | tail -10 ```

### To better way for use dmesg command

```dmesg | grep search_string```  

Search related to  
- memory
- usb
- sda
- ram
- tty
- error

### For live monitoring

- ```dmesg -w```

### To clear the ring buffer

- ```dmesg -c```

### To filter the message based on different level

- ```dmesg -l emerg/alert/crit/err/warn/notice/info/debug```
- ```dmesg -l emerg```
