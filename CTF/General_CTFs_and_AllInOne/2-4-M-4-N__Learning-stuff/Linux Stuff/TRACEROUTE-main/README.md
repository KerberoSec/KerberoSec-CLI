source: [here](https://youtu.be/up3bcBLZS74?si=QIAGjAyIwwVqLvED)

# What is Traceroute

Tracks the route packets on how the data travels on internet from your computer to destination.  
The only required parameter is the name or IP address o the destination host

- ```traceroute ip```

- Default packet length is 60bytes to change it  
```traceroute -q 1 google.com```
- Default port is 33434, to change it  
```tracerouter -p 21101 google.com```
- To use IPv6 or 4  
```traceroute -4/6 google.com```
- To route through HOP/gate  
```tracerouter -g 192.168.42.45 google.com```
