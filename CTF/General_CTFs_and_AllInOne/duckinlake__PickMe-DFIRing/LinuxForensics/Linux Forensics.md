# [0x03] OS and account information
Заходим на машину, открываем терминал. Информация о группах, их членах, а также их gid хранится в файле `/etc/group`.  При помощи `cat` читаем файл и грепаем по нужной группе `audio`:
```powershell
sudo cat /etc/group | grep audio
```

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/LinuxForensics/img/img1.png)

Which two users are the members of the group `audio`? Format user1,user2
>ubuntu.pulse

Информация о пользователях хранится в файле `/etc/passwd`, там есть юзернейм, парольная информация, uid, gid, описание, домашняя директория и оболочка по умолчанию. Читаем файл, грепаем по нужному юзернейму `tryhackme`:
```powershell
sudo cat /etc/passwd | grep tryhackme
```

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/LinuxForensics/img/img2.png)

In the attached VM, there is a user account named tryhackme. What is the uid of this account?
> 1001

Информация о времени входа хранится о `wtmp` (также есть `btmp` с информацией о неудачных аутентификациях). Его нельзя прочитать при помощи обычных утилит (`cat`, `less`, `vim`) поскольку он бинарный, но можно прочитать при помощи `last` - показывает полную историю входов (указываем путь к файлу, есть другие флаги). Читаем файл:
```powershell
last -f /var/log/wmtp
```

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/LinuxForensics/img/img3.png)

Видим искомый заход в 20:10, который продлился до 21:43, в скобочках указано итоговое время длительности сессии.

A session was started on this machine on Sat Apr 16 20:10. How long did this session last?
> 01:32

# [0x04] System Configuration

Текущее имя машины хранится в файле `/etc/hostname`. Читаем файл, видим искомое имя

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/LinuxForensics/img/img4.png)

What is the hostname of the attached VM?
> Linux4n6

Информация про таймзону хранится в файле `/etc/timezone`, также есть `localtime` с часовым поясом. Читаем, видим искомую.

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/LinuxForensics/img/img5.png)

What is the timezone of the attached VM?
>Asia/Karachi

Активные сетевые соединения хоста можно посмотреть при помощи утилиты `netstat`. Поскольку мы ищем именно программу, нам нужно указать флаг `-p`, который выведет информацию о том, какой процесс слушает на этом адресе-порту. 
```powershell
netstat -p | grep 5901
```

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/LinuxForensics/img/img6.png)

What program is listening on the address 127.0.0.1:5901?
> Xtigervnc

Дальше к процессам. `ps` выводит просто список процессов, их pidы и тд. Вывести информацию о полном пути файла можно вывести при помощи нескольких способов: `w` выводит широкий аутпут, `f` - вывод дерева процессов, где будет полный путь:
```powershell
ps axj | grep Xtigervnc
ps af | grep Xtigervnc
```

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/LinuxForensics/img/img7.png)

What is the full path of this program?
> /usr/bin/Xtigervnc

# [0x05] Persistence mechanism
Когда запускается командная строка, выполняется определенный набор команд. `/etc/bash.bashrc` - является общим конфигурационным файлом для командной оболочки Bash. Также для каждого пользователя есть индивидуальный файл `~/.bashrc`, который запускается при запуске командной строки. В задание читаем файл пользователя `ubuntu`, там есть переменные `HISTSIZE` - это количество строк (команд), которые хранятся в памяти во время сессии bash, `HISTFILESIZE` - это количество строк (команд), которые: допускаются в файл истории при запуске сессии, сохраняются в файле истории по окончании сессии bash (для использования в будущих сессиях). Нам нужно второе значение.

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/LinuxForensics/img/img8.png)

In the bashrc file, the size of the history file is defined. What is the size of the history file that is set for the user Ubuntu in the attached machine?
> 2000

# [0x06] Evidence of Execution

Часть команд, как раз-таки хранится в файле `~/.bash_history` (в соответствии с определёнными ранее переменными). Читаем его для пользователя `tryhackeme`:
```powershell
sudo cat /home/tryhackme/.bash_history | gep apt-get
```

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/LinuxForensics/img/img9.png)

The user tryhackme used apt-get to install a package. What was the command that was issued?
> sudo apt-get instal apache2

Для текущего пользователя ищем в истории необходимую команду с `net-tools`:
```powershell
cat ~/.bash_history
```

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/LinuxForensics/img/img10.png)

What was the current working directory when the command to install net-tools was issued?
> /home/ubuntu

# [0x07] Log files

Syslog хранит информацию о системной активности, также там присутствует ротация логов, когда он доходит до определенного размера. Ищем в директории `/var/log` текущие файлы сислога, которые там есть.

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/LinuxForensics/img/img11.png)

Видим четыре файла: два заархивированных и два недавних. В логах после даты пишется хостнейм. Читаем верх (самые последние записи) текущего файла. 

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/LinuxForensics/img/img12.png)

Там нет нужного (нового) имени. Тогда при помощи qunzip разархивируем крайний файл. Читаем его верх (старые), там еще более старое имя, которое нам не подходит. Смотрим тогда последние записи: там находим искомый хостнейм. 

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/LinuxForensics/img/img13.png)

Though the machine's current hostname is the one we identified in Task 4. The machine earlier had a different hostname. What was the previous hostname of the machine?
> tryhackme
