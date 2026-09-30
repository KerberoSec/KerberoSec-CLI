Solved by Dan after image retrieved by Vanilla
After 'Rop Me Like A Hurricane' use the vuln to get a shell, then run “set” to look at the environment variables.  You’ll see a bunch of Kubernetes-set environment variables to locate other services.  Of particular interest were these:
WHOLESOME_DROPPER_PORT=tcp://10.245.79.69:8888
WHOLESOME_DROPPER_PORT_8888_TCP=tcp://10.245.79.69:8888
WHOLESOME_DROPPER_PORT_8888_TCP_ADDR=10.245.79.69
WHOLESOME_DROPPER_PORT_8888_TCP_PORT=8888
WHOLESOME_DROPPER_PORT_8888_TCP_PROTO=tcp
WHOLESOME_DROPPER_SERVICE_HOST=10.245.79.69
WHOLESOME_DROPPER_SERVICE_PORT=8888
WHOLESOME_DROPPER_SERVICE_PORT_CUSTOM=8888
WHOLESOME_RECEIVER_PORT=tcp://10.245.37.114:8888
WHOLESOME_RECEIVER_PORT_8888_TCP=tcp://10.245.37.114:8888
WHOLESOME_RECEIVER_PORT_8888_TCP_ADDR=10.245.37.114
WHOLESOME_RECEIVER_PORT_8888_TCP_PORT=8888
WHOLESOME_RECEIVER_PORT_8888_TCP_PROTO=tcp
WHOLESOME_RECEIVER_SERVICE_HOST=10.245.37.114
WHOLESOME_RECEIVER_SERVICE_PORT=8888
WHOLESOME_RECEIVER_SERVICE_PORT_CUSTOM=8888
There was no netcat on the remote system, but it did have Bash, so after starting Bash from within Sh, we can use Bash’s pseudo-device network syntax to connect to the 
“dropper”: “cat <>/dev/tcp/10.245.79.69/8888”, from which we get a heckton of Base64.  Decoding it, we get a JPEG image, containing Pokemon:
> See wholesome.jpg
this is a substitution cipher where 2 pokemon = 1 letter and it spells 'I LIKE POCKET MONSTERS'. Send this password to the server and it gives a flag

TUCTF{M4NY_ST3PS_3QU4LS_B1G_R3W4RD}

