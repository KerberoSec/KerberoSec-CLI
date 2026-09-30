

# Nmap basics

previous module covered
- enumerate targets
- discover live hosts
- reverse DNS lookup

this module covers
- Nmap live host discovery
- Nmap basic port scans
- Nmap advanced port scans
- Nmap post port scans

1. enumerate targets
2. discover live hosts
3. reverse DNS lookup
4. scan ports
5. detect versions
6. detect OS 
7. trace route
8. scripts
9. write output

## TCP and UDP ports

- specific port = specific services 
- port 53 = DNS
- port 22 = ssh
- nmap has 6 port states

## TCP flags

- URG = urgent flag pointer , urgent incoming data
- ACK = acknowledgement flag , a receipt of a TCP segment
- PSH = push flag asking TCP to pass the data to the app quickly
- RST = reset flag, reset connection
- SYN = synch flag init a TCP 3-way handshake
- FIN = sender has no more data to send

## Nmap

- port list: `-p 22,80,443`
- port range: `-p1-1023`
- `-p-` will scan ALL ports
- `-F` scans top 100 ports
- `-T5` is fastest scan, `-T0` slowest avoid IDS
- `--min-rate <num>`
- `--max-rate <num>`
- 

