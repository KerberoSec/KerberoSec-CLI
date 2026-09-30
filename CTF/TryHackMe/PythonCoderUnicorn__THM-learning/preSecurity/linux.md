
# Linux Fundamentals 

Linux commands
```
echo
whoami

man ls
ls -h

cd
cat
pwd

touch
mkdir
cp
mv
rm

cp note note2   
mv note note2
```

- `find -name passwords.txt`
- `find -name fileName.py`
- `find -name *.txt `
- `find -FileName *.txt`

wordcount:    
- `wc -l <file> `

grep (search): 
- `grep "THM" <file>`

determine the file type:
`file <fileName>` 

- `nano myfile`    inside nano Ctrl == ^

## SHELL OPERATORS

- &     allows running commands in background of terminal
- &&    combines commands
- `>`   redirector, output command
- `>>`  same output command, appending data

- echo passwords >> password123
- echo passwords123 >> tryhackme

## Linux part 2

secure shell (SSH) connect to a remote linux machine.
your linux machine + attackbox

1. IP address of remote machine
2. credentials for login 

### PERMISSIONS

- ls -lh
- su user2
- user2

```
/etc    stores system files used by linux 
/var    variable data, accessed by services or apps
/root   home for root system user
/tmp    temporary directory, any user can write to this folder
```

### DOWNLOADING FILES

wget:

- `wget https://assets.tryhackme.com/additional/linux-fundamentals/part3/myfile.txt`

TRANSFER FILES FROM HOST:

- secure copy `SCP`
- copy files & directories your system to remote system
- copy files & directories from remote system to your system

IP address
- remote system
- name of file on local system  (notes1.txt)
- name for file on remote system (transferred.txt)

- `scp important.txt ubuntu@x.x.x.x.30:/home/ubuntu/transferred.txt`
- `scp ubuntu@x.x.x.x.30:/home/ubuntu/documents.txt notes.txt` 

SERVING FILES FROM HOST:

- `python3 -m http.server`
- `wget http://127.0.0.1:8000/file`

## PROCESSES 101

programs running on the machine managed by the kernel 
each process has an ID (PID)

- view processes `ps`
- see all processes `ps aux`
- process stats `top`

Managing processes:

- kill a command `kill PID_NUM`  kill 1332
- `SIGTERM` kill process AND cleanup
- `SIGKILL` kill process no cleanup 
- `SIGSTOP` stop/suspend process 

PID 0 = system init system boot 👢 `systemd`
then child processes  controlled by `systemd` but diff process

- web servers, database server or FTP servers start on boot

manually start Apache server then system launch apache2 on boot:

- `systemctl [option] [service]`
- systemctl start apache2
- systemctl stop apache2
- systemctl enable apache2
- systemctl disable apache2

### Intro Back/Foregrounding

- background state process
- foreground state process    `echo` , `echo &` => returns PID

- Ctrl + Z background a process 

- `ps aux | less`
- `thm{processes}`

### System Automation

- `cron` process 
- `crontabs` file 

```
MIN   what minute to execute
HOUR  what hour to execute
DOM   day of month 
MON   what month of year
CMD   the command to be executed 
```

backup file every 12 hours: 
- `0 *12 * * * cp -R /home/../Documents /var/backups/`
- https://crontab-generator.org/
- `crontab -e` to edit 

## Package Management

software submissions as 'apt' repository /etc/apt/

- `add-apt-repository`

----

Task: add the text editor Sublime Text to our Ubuntu machine

- integrity by GPG _Gnu Privacy Guard_ keys for safety of software

1. Let's download the GPG key and use apt-key to trust it:  `wget -qO - https://download.sublimetext.com/sublimehq-pub.gpg | sudo apt-key add -`
2. now add Sublime Text 3's repository to our apt sources list.
3. create a file named sublime-text.list in /etc/apt/sources.list.d and enter the repository information. `touch sublime-text.list`
4. `/etc/apt/sources.list.d` open and paste in `deb https://download.sublimetext.com/ apt/stable` 
5. `apt update`
6. `apt install sublime`

## System Logs 

`cd /var/logs`

rotating process of auto managing logs

- access log
- error log

