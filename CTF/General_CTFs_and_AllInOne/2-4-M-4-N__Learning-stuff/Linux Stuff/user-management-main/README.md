source : [here](https://youtu.be/vLuFkesBPcM?si=Zy6mylqSd3b8LfDg)

## Linux User Account Management

- __Topics__  
```useradd```  
```userdel```  
```usermod```  
```groupadd```  
```groupdel```  

- __Files__  
``` /etc/passwd```  
``` /etc/group```  
``` /etc/shadow```

### How to Create a USER?
- ```useradd user_name```
- ```useradd -g group_name -s /bin/bash -c "description" -m -d /home/user_name user_name```

### How to check user information or USER created or not?
- ```id <user_name>```
- ```less /etc/group```

### How to delete user?

- ```user del <name_of_user>```
- ```user del -r``` (Will remove home directory)
- ```user del -f``` (force delete even if the user is logged in)

### To add a user to a new group,but default group will remain same

- ```usermod -G <GROUPNAME> <User_Name>```

### To change the default group

- ```userdel -g <Group_name> <user_name>```

### Some Others USERMOD amd Groups options

- ```-m -d``` (To move the content of home folder to this new folder)
- ```-p``` (we can use passwd command also)
- ```-s``` (shell type)
- ```-L -U``` (Lock Unlock a user)

__Examples__

- ```usermod -m -d /home/New_user user```  

__How to add groups__

- ```groupadd <group_names>```
- ```groupdel <group_name>```

