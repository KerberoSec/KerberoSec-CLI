source : [here](https://youtu.be/Ync6SdB51Z4?si=gMb694MnUPsVGPkc)

## What is Cron Jobs?

A cron job is a scheduled task that allows you to run scripts or commands at specified intervals.  

## Why use Cron Jobs?  

- Cron jobs automate repetitive tass, ensuring they run at scheduled times without manual intervention.
- Ex: Backing up files, Running system maintance, or sending email reports.

## How does Cron Works?  

- Cron uses a daemon (a background process) called cron to execute scheduled tasks.
- The configuration for these tasks is stored in a file called a crontab.
- Name of the service is:```cron```

## Managing Cron tab Entries  

- Command to edit crontab : ```crontab -e```
- How to view your current cron jobs : ```crontab -l``` (Cron tabs is user specific)  
- Deleting cron jobs wit ```crontab -r``` (Warning: it will remove all the jobs)

- __Basic Format of a Cron Job__
- ```***** /usr/bin/python3 /path/to/task.py```
- __Explanation of the syntax:__
- Cron-Stars-explain  
- ```minutes hour day(month) month day(week) command.``` [Crontab-guru](https://crontab.guru/#)  
- Cron-Stars-workflow  

---

## Special Strings in Cron  

- Using ```@reboot```, ```@daily``` , ```@hourly``` , etc.., for easy scheduling.
- Example : Running a script at reboot.  
- ```@reboot /path/to/script.sh```  
- common_special_strings  

---

## Redirect Output of Task  

```***** /bin/some/directory > /tmp/listing.txt 2>81```  

---

## Environment Variables in Cron 

setting specific environment variables for a cron job.  

- set PATH in crontab
- PATH=```/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin```
- Cron job entries below
- ```***** /path/to/script.sh```

---

## Common issues and Troubleshooting Tips

- check log under ```/var/log/cron```  

