The VM can be found at https://drive.google.com/open?id=1VtW70-BzprozQi63CCnHXO89czouHZz-

What is the name of the built-in administrator account?  
acsc2017{defAdmin}  
Go into computer management and then accounts  

What is the computers MAC address?  (Put in the format ##-##-##-##-##-##)  
00-0C-29-49-5E-DB  
Open a command prompt and enter the ipconfig /all  

There is a file called flag in the base directory for the drive.  What's the flag?  
acsc2017{MountThePartition}  
Go into Computer Management and Disk Management.  Mount Disk 0 Parition 3 and view the file  

What is the IP address for the DNS server for the computer?  
10.50.12.12   
Open a command prompt and enter ipconfig /all  

What date/time was windows installed (use format MMDDYYYY HHMMSS)  
07162017 195311  
Open Command prompt and enter systeminfo  

What is the version of the operating system?  
10.0.15063  
Open Command prompt and enter systeminfo  

What is the computers name?  
WhatsMyName  
 
What is the maximum password age (in days)?  
65  
Administrative Tools > Local Security Policy > Security Settings > Account Policies > Password Policy  

Admin deleted an account.  What is the SID of the account that was deleted?  
S-1-5-21-2833193197-2555894616-3088220344-1000   
View the Windows security logs and do a search for event ID 4726 (A user account was deleted).  

You notice a command prompt flash across the screen about every 5 minutes  
acsc2017{CronIsBetter}  
View the scheduled tasks and you'll find the job Show the Flag.  Find the file it executes (C:\Program Files\task.bat) and you'll see the flag 
 
