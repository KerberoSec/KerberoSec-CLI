source : [here](https://youtu.be/bR8SAS60QnY?si=4c7NMO5ev4EVyeo6)

## What is Firewall?

A firewall is a network security system that monitors and controls incoming and outgoing network traffic based on the rules defined.  
Basically used to determine and block untrusted network to access out system.  

## Types of Firewall

__1) Software Based__  
Running on Operating system  
__2)Hardware Based__  
A dedicated appliance with Firewall software between two different networks (mostly used by network team)  

## Tools on Linux for managing Firewall

1. ```iptables```
2. ```firewalld``` - Newer version of centos, Redhat, Fedora etc

## CHECK IF FIREWALLD SERVICE IS INSTALLED?
```rpm -qa | grep firewalld```  

## How to STOP/START firewalled service?

1. ```systemctl start/enable firewalld```
2. ```systemctl stop/disable firewalld```
3. ```systemctl status firewalld```
4. ```systemctl restart firewalld```

### Check the rules of firewalld
```firewall-cmd --list-all```

### Listning of all the services firewalld is aware of:
```firewall-cmd --get-services```

### To reload the config of firewalled
```firewall-cmd --reload```

### Firewall has multiple zones, to get list
```firewall-cmd --get-zones```

### To see the lsit of active zones
```firewall-cmd --get-active-zones```

### To get firewall rules for a specific zone
```firewall-cmd --zone=public --list-all```

---

### To add or remove a  service
```firewall-cmd --add-service=name_of_service```  
```firewall-cmd --remove-service=name_of_service```

### To reload the config
```firewall-cmd --reload```

### To add or remove a service permanently

```firewall-cmd --add-service=name_of_service --permanent```  
```firewall-cmd --remove-service=name_of_service --permanent```

### To add or remove a port

```firewall-cmd --add-port=20201/tcp```  
```firewall-cmd --remove-port=2021/tcp```

### To block incomming traffic from an IP

```firewall-cmd --add-rich-rule='rule family="ipv4" source address="192.168.0.0" reject'```

### To block outgoing traffic to a IP or URL

```firewall-cmd --direct --add-rule ipv4 filter OUTPUT 0 -d 157.240.242.35 -j DROP```

### How to block ICMP incoming traffic

```firewall-cmd --add-icmp-block-inversion```

