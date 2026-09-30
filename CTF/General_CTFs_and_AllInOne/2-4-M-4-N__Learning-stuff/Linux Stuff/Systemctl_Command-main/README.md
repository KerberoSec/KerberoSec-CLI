source : [here](https://youtu.be/--w38cgP3kY?si=A0XOWa9S-bCW13u8)

## What is systemctl?
IT is used to control the status of the services. Control systemd system.  

Example: ```systemctl status httpd```  

---

- To check start or stop the service  
-> ```sudo systemctl start/stop httpd```

- To restart the service  
-> ```sudo systemctl restart httpd```  

---
  
```sudo systemctl enable httpd```  
- Enabling a service causes the system to start the service upon reboot or whenever a computer starts up.
- The enable subcommand does not start the particular service immediately.
- You need admin rights

To enable and start at same time  
-> ```sudo systemctl enable --now sshd```  

To check if a service is enabled?  
-> ```sudo systemctl is-enable sshd```  

```sudo systemctl disable sshd```  
- Disabling a service
- One can manually start the service

To prevent the service to start  
-> ```sudo systemctl mask sshd```  

To check if a service is enabled?
-> ```sudo systemctl unmask sshd```  

---

## Computer Control Commands

-> ```systemctl poweroff```  
-> ```systemctl reboot```  
-> ```systemctl -i reboot``` (ignoring logged-in useres)  

---

## To list the sockets in memory available for interprocess communication (IPC)  
-> ```systemctl list-sockets```  
-> ```systemctl --show-types list-sockets```  

-> ```systemctl --show-types list-sockets 'systemd*'```  
-> ```systemctl --show-types list-sockets --all```  

__To get active/running process information__  
-> ```systemctl | grep -i running```  

