source : [here](https://youtu.be/XMYcB0mB0Rs?si=GPPEc5CxtY8WWmLy)

## What is Package Management?

package management refers to the system used to install, update, remove, and manage software packages, ensuring a centralized and organized way to handle software dependencies and installations, making system maintenance easier

## Package Management Tools:
- ```yum```
- ```dnf```
- ```rpm```
- ```apt```

manage software using ```yum```/```dnf``` and ```rpm``` for Red Hat-Based Linux systems like CentOS.  
```apt``` for debian based like ubuntu, kali etc  

---

- Yum is the primary package management tool for redhat.
- Yum performs dependency resolution when installing, updating and removing software
- Yum can manage package from installed repositories in the system or from ```.rpm``` packages  

__Examples:__

### Yum Package Manager

- How to install and remove a package?  
```yum install nginx -y```  
```yum remove nginx```

- How to upgrade or update a package?  
```yum upgrade package```  
```yum update package```

- What is the difference between ```update``` and ```upgrade```?
```upgrade```: will delete old packages
```update```: Keep the old packages, we can rollback

- You can see all the options using  
```yum -option```  
```yum check-updates```

### Package Rollback

- To see the past work done related to packages, which will show you the activity with date and time?
```yum history```
- We can simply undo or redo any action using
```yum history undo/redo <id>```

### RPM Package Manager

- Using ```rpm```, you can install, uninstall and query individual software packages.
- Issue: It cannot manage dependency resolution like ```yum```.
- ```rpm``` maintains a database of installed packages, which enables powerful and fast queries.

- To install, upgrade or delete an ```.rpm``` package using ```rpm```  

```rpm -i package-file```  
```rpm -U package-file```  
```rpm -ivh package-file```
```rpm -evh package-file```  
(```v```= verbose, ```h```= hash to show progress)  

- To query all the installed packages  
```rpm -qa```
- To query  specific installed packages  
```rpm -qa | grep ksh```
- More info about the package
```rpm -qi <package_name```
- Info about config files for a package
```rpm -qc <package_name```

### DNF DANDIFIED YUM Package Manager

- ```sudo dnf list available```
- ```sudo dnf list available | wc -l```
- ```sudo dnf list installed```

- ```sudo dnf update/upgrade```
- ```sudo dnf install package_name```
- ```sudo dnf remove package_name```

- ```sudo dnf info package_name```
- ```sudo dnf search package```

### APT package Manager

- ```apt install package_name```
- ```apt remove package_name```
- ```apt autoremove (to remove the dependencies)```
- ```apt update (to update all the repo)```
- ```apt-cache search apache```

