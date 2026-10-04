# Basic Commands for Kali 
## 1. File & Directory Commands
| Command  | Usage                          | Example              |
| -------- | ------------------------------ | -------------------- |
| `pwd`    | Show current directory         | `pwd`                |
| `ls`     | List files/folders             | `ls`                 |
| `ls -la` | Show hidden files with details | `ls -la`             |
| `cd`     | Change directory               | `cd Downloads`       |
| `mkdir`  | Create folder                  | `mkdir test`         |
| `rmdir`  | Remove empty folder            | `rmdir test`         |
| `rm`     | Delete file                    | `rm file.txt`        |
| `rm -rf` | Delete folder forcefully       | `rm -rf test`        |
| `cp`     | Copy files                     | `cp a.txt b.txt`     |
| `mv`     | Move/Rename file               | `mv old.txt new.txt` |
| `touch`  | Create empty file              | `touch demo.txt`     |
| `cat`    | Display file content           | `cat file.txt`       |
| `nano`   | Open text editor               | `nano file.txt`      |

## 2. User & Permission Commands
| Command  | Usage                | Example                     |
| -------- | -------------------- | --------------------------- |
| `whoami` | Show current user    | `whoami`                    |
| `id`     | Show user ID info    | `id`                        |
| `sudo`   | Run as administrator | `sudo apt update`           |
| `passwd` | Change password      | `passwd`                    |
| `chmod`  | Change permissions   | `chmod 777 file.sh`         |
| `chown`  | Change ownership     | `sudo chown user:user file` |

### Permission Numbers
| Number | Meaning                |
| ------ | ---------------------- |
| 7      | Read + Write + Execute |
| 6      | Read + Write           |
| 5      | Read + Execute         |
| 4      | Read only              |

## 3. Network Commands
| Command          | Usage                  | Example                 |
| ---------------- | ---------------------- | ----------------------- |
| `ifconfig`       | Show network info      | `ifconfig`              |
| `ip a`           | Show IP address        | `ip a`                  |
| `ping`           | Check connectivity     | `ping google.com`       |
| `netstat -tulnp` | Show open ports        | `netstat -tulnp`        |
| `ss -tulnp`      | Alternative to netstat | `ss -tulnp`             |
| `curl`           | Fetch website data     | `curl google.com`       |
| `wget`           | Download files         | `wget url`              |
| `nslookup`       | DNS lookup             | `nslookup google.com`   |
| `traceroute`     | Trace network path     | `traceroute google.com` |

## 4. Package Management Commands
| Command                    | Usage                      |
| -------------------------- | -------------------------- |
| `sudo apt update`          | Update package list        |
| `sudo apt upgrade`         | Upgrade installed packages |
| `sudo apt install package` | Install package            |
| `sudo apt remove package`  | Remove package             |
| `sudo apt autoremove`      | Remove unused packages     |

## 5. Process Management Commands
| Command   | Usage                  | Example           |
| --------- | ---------------------- | ----------------- |
| `ps`      | Show running processes | `ps aux`          |
| `top`     | Live process monitor   | `top`             |
| `htop`    | Better process viewer  | `htop`            |
| `kill`    | Stop process           | `kill 1234`       |
| `killall` | Kill by process name   | `killall firefox` |

## 6. System Information Commands
| Command         | Usage               |
| --------------- | ------------------- |
| `uname -a`      | System information  |
| `hostname`      | Show hostname       |
| `date`          | Show date/time      |
| `cal`           | Show calendar       |
| `uptime`        | System running time |
| `free -h`       | RAM usage           |
| `df -h`         | Disk usage          |
| `du -sh folder` | Folder size         |

## 7. Search Commands
| Command   | Usage                    | Example                 |
| --------- | ------------------------ | ----------------------- |
| `find`    | Search files             | `find / -name test.txt` |
| `locate`  | Fast file search         | `locate file.txt`       |
| `grep`    | Search text inside files | `grep admin users.txt`  |
| `history` | Show command history     | `history`               |

## 8. Compression Commands
| Command    | Usage            |
| ---------- | ---------------- |
| `zip`      | Compress files   |
| `unzip`    | Extract zip      |
| `tar -cvf` | Create tar file  |
| `tar -xvf` | Extract tar file |

## 9. Important Kali Linux Commands for Cybersecurity
| Command      | Usage                     |
| ------------ | ------------------------- |
| `nmap`       | Network scanning          |
| `hydra`      | Password attack tool      |
| `msfconsole` | Start Metasploit          |
| `wireshark`  | Packet analysis           |
| `airmon-ng`  | WiFi monitoring           |
| `sqlmap`     | SQL injection testing     |
| `nikto`      | Web vulnerability scanner |

## 10. Service Commands
| Command                    | Usage         |
| -------------------------- | ------------- |
| `systemctl start service`  | Start service |
| `systemctl stop service`   | Stop service  |
| `systemctl status service` | Check status  |
| `service apache2 start`    | Start Apache  |

## 11. Useful Shortcuts
| Shortcut   | Usage                |
| ---------- | -------------------- |
| `Ctrl + C` | Stop running command |
| `Ctrl + Z` | Pause process        |
| `Ctrl + L` | Clear terminal       |
| `Tab`      | Auto-complete        |
| `↑ / ↓`    | Previous commands    |

