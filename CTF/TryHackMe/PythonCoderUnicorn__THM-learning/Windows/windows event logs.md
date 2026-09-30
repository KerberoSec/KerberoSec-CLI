
Powershell `wevtutil.exe`
the help page is `wevtutil.exe /?`

```
el    list log names
gl    get log config info
sl    set log
ep    eunum event publishers
gp    get publisher
im    install manifest event publishers
um    uninstall event publishers
qe    query events
gli   get log status info
epl   export log
al    archive log exported log
cl    clear a log

-- options
/{r}:VALUE   run command on remote computer
/{u}:VALUE   username
/{p}:VALUE   password
/{a}:VALUE   authentication
/uni:T|F     output unicode

```

`wevtutil.exe`

```
wevtutil.exe el | find /c /v ""
1071

event log, log file , structured query

/lf:true

Xpath query

-- wevtutil qe Application /c:3 /rd:true /f:text
application

event read direction

maximum number of events to read

```

