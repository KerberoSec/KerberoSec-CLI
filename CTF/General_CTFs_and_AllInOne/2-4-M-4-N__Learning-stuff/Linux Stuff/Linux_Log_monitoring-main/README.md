source:[here](https://youtu.be/tA-32BLjrFA?si=-dWEnXQuKS2uP-3N)

## What are log files?

A log file stores events, processes, manages, and other data from applications, operating systems, or devices.  
They provide information based on the actions performed by users, playing an important role in monitoring

## Log directory in linux

- /var/log

## Common Log file that are important to remind

- boot
- chron
- secure
- maillog
- httpd
- messages

## To see latest log

- ``` tail -f cron```

## How to see "error" in log file?

- ```grep -i "error" error_log```
- ```egrep -i "error|warning" error_log```
- ```cat error_log | grep -i "error"```

## How to create and send errors in a text file?

- ```cat error_log : grep -I "error" > logs_anaylysis.txt```

