# mipstake

![img](https://raw.githubusercontent.com/Calana2/Wargame_Writeups/refs/heads/main/pwnable.kr/Grotesque/mipstake.jpeg)

Encontré el disco y el kernel para el entorno en [este repositorio](https://people.debian.org/~aurel32/qemu/mips/).

gdbserver me dio problemas para depurar así que usé una imagen de disco y coredumps generados y los copié a mi máquina:
```
qemu-system-mips -M malta -kernel vmlinux-3.2.0-4-4kc-malta -hda debian_wheezy_mips_standard.qcow2 -hdb shared.img -append "root=/dev/sda1 console=ttyS0" -net nic -net user,hostfwd=tcp:0.0.0.0:9033-:9033 -nographic -monitor none
$ mount -o loop /dev/sdb /mnt/shared ; echo "/mnt/shared/core.%p" > /proc/sys/kernel/core_pattern ;ulimit -c unlimited
```

El programa es un servidor que lee entrada de usuario y nada más:
```C
/* WARNING: Removing unreachable block (ram,0x00 400d40) */
undefined4 main(void)

{
  uint __seed;
  int __fd;
  undefined4 uVar1;
  int client_sc;
  __pid_t pid;
  sockaddr sc_struct;
  
  __seed = time((time_t *)0x0);
  srand(__seed);
  map_fixed_rw_region();
  memset(&sc_struct,0,0x10);
  sc_struct.sa_family = 2;
  sc_struct.sa_data._0_2_ = htons(9033);
  sc_struct.sa_data[2] = '\0';
  sc_struct.sa_data[3] = '\0';
  sc_struct.sa_data[4] = '\0';
  sc_struct.sa_data[5] = '\0';
  __fd = socket(2,2,0);
  client_sc = bind(__fd,&sc_struct,0x10);
  if (client_sc < 0) {
    puts("bind error");
    uVar1 = 0;
  }
  else {
    listen(__fd,5);
    while( true ) {
      puts("no need to brute-force..");
      sleep(1);
      puts("listening...");
      client_sc = accept(__fd,(sockaddr *)0x0,(socklen_t * )0x0);
      if (client_sc < 0) break;
      printf("got client %d\n",client_sc);
      pid = fork();
      if (pid == 0) {
        alarm(60);
        handle_client_2(client_sc);
        printf("client %d exit normally\n",client_sc);
        return 0;
      }
      client_sc = rand();
      client_sc = (client_sc * 0x12341234) % 0x62b5;
      if (3 < client_sc) {
        printf("close %d\n",client_sc);
        close(client_sc);
      }
    }
    perror("[X] accept");
    uVar1 = 0xffffffff;
  }
  return uVar1;
}
```

Con un buffer overflow aquí:
```C

void handle_client_2(undefined4 client_sc)

{
  undefined buf [16];
  
  handle_client_3(client_sc,buf,0x2000);
  return;
}

void handle_client_3(int client_sc,int buffer,uint max_si ze)

{
  ssize_t num;
  uint idx;
  
  idx = 0;
  while( true ) {
    num = recv(client_sc,(void *)(buffer + idx),1,0);
    if (num != 1) {
      return;
    }
    if (*(char *)(buffer + idx) == '\n') break;
    idx = idx + 1;
    if (max_size <= idx) {
      return;
    }
  }
  return;
}
```

```
    Arch:       mips-32-big
    RELRO:      No RELRO
    Stack:      No canary found
    NX:         NX disabled
    PIE:        No PIE (0x400000)
    RWX:        Has RWX segments
```

El programa no tiene protecciones, así que lo más lógico es hacer un ret2shellcode, pero los gadgets no son muy útiles para resolver direcciones del stack.

Conocemos la dirección de una dirección RW que el programa mapea:
```C
void map_fixed_rw_region(void)
{
  mmap((void *)0x66666000,0x2000,3,0x802,0,0);
  return;
}
```

Podemos insertar nuestro shellcode ahí. A pesar de que parece de sólo lectura, [en procesadores MIPS viejos no existía algo como el bit NX](https://wzt.ac.cn/2021/09/17/mipsrop/).

`D0_You_Want_R4re_or_WellDon3?`