source: [here](https://youtu.be/1y-qmAMKIW4?si=B2pc2U8ELbrC-Pcl)

## What is Anacron?

- Anacron is a Linux utility that executes scheduled tacks predically, evem if the system is not running countinously.
- Anacron is suited for systems that do no run 25/7

   __Check Anacron is present or not using__
  - ```/etc/anacrontab```
  - ```rpm -qa | grep anacron``` (Redhat Centos)
  - ```dpkg -l | grep anacron``` (Ubuntu)
 
__If anacron not installed in linux then:__     
 -  ```yum install anacron```(Redhat Centos)  
 -  ```apt install anacron```(Ubuntu)

__To start a scheduled__ 
- ```less /etc/anacrontab```
- ```sudo vi /etc/anacrontab```
- Go to Endline for write down.
- ```15 5 backup_trigger /tmp/backup.sh```
- ```sudo anacron -f -d```

- ```sudo anacron -fdn```

- ```cd /var/logs```
- ```less cron```

---

## Where to use Anacron?
- Daily System Backups
- Weekly log file cleaning
- Monthly reports generation
- Software Updates
- Database Maintenance

## Sumamary 

- Purpose of Anacron is used for Scheduling periodic tasks in Linux systems that are not running 24/7, such as personal computers.
- Ideal for tasks that need to run daily, weekly, or monthly, but not at a fixed time each day.
- Functionality: Anacron cheks once a daily to see if there are any jobs scheduled to run that day. If the system was off at the scheduled time. Anacron will run the missed tasks as soon as the system is backup
- Configuration : ```/etc/anacrontab```
- Best Pactices: It's important to monitor Anacron jobs regularly by checking the logs to ensure they are executedas expected. Users should also ensure scripts and commands executed by Anacron are tested and have proper permissions set.
