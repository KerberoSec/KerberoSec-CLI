source: [here](https://youtu.be/YuTfG-mVRlA?si=kYzXNrHPEHf1lYvE)

## Netstat (Network Monitoring and Troubleshooting)

Netstat is a command line network utility that displays:

- network connetions for TCP, UDP
- routing tables.
- a number of network interface.
- network protocol statistics.

## Case 
To identify number of connection on a given port or IP.
- ```netstat -putan | grep <PORT/IP>```

## Netstat Command 

(t-tcp, u-udp, n-numerical addr, l-listning port, p-PID programname)

- To see all the sockets  
```netstat -a | more```
- List all the TCP ports  
```netstat -at```
- List all the TCP v6 ports  
```netstat -6at```
- List all the UDP ports  
```netstat -au```
- List all listning ports  
```netstat -l```
- To view the numerical address  
```netstat -p```
- To view the PID of the Programme of connection  
```netstat -p```
- To view the routing table  
```netstat -r```
- To check number of connection from a specific IP  
```netstat -an | grep <IP>```
- To get the list of all the interface  
```netstat -i```
- Which port a process is using?  
```netstat -ap | grep <process_name>```
- How to see statistics by protocol?  
```netstat -s```
