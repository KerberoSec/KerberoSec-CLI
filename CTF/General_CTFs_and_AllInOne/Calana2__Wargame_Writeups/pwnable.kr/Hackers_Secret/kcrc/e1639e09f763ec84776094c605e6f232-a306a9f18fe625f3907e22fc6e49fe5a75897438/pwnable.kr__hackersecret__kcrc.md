# kcrc
![img](https://raw.githubusercontent.com/Calana2/Wargame_Writeups/refs/heads/main/pwnable.kr/Hackers_Secret/kcrc.png)

# kcrc

Acerca de las protecciones:
- Leyendo de `/proc/kallsyms` vemos que no hay KASLR 
- `kread` accede directamente al buffer de usuario sin usar `copy_to_user` así que no hay SMAP
- Una lectura a `/proc/cpuinfo` muestra que tampoco hay KPTI o SMEP

Igual esto se puede saber viendo el comando usado para lanzar el entorno virtualizado:
```C
#include <stdio.h>

int main(int argc, char* argv[], char* envp[]){
        system("qemu-system-i386 -smp 2 -kernel /home/kcrc/bzImage -initrd /home/kcrc/ramdisk.img -append \"root=/dev/ram rw console=ttyS0 rdinit=/bin/ash\" -nographic -monitor /dev/null");
        return 0;
}
```

Acerca de las funciones del módulo:
- `kwrite` lee de un buffer que debe ser de exactamente 12 bytes. Los primeros 4 bytes o doble-palabra representan un código de operación o `op`; existen dos códigos de operación válidos: 0xadd y 0xde1. El primero permite rellenar `kcrc` usando un puntero a bytes y un número de rondas dadas por el usuario. La segunda cambia el valor del byte apuntado por `idx` a 0 y decrementa el índice.
- `kread` devuelve el contenido de `kcrc`.

Vulnerabilidades:
- Condición de carrera en `kwrite` que permite sobreescribir al propio `idx`. (OOB write)
- Lectura arbitraria con `kwrite` y `kread`. Se puede crear un crc usando de buffer la dirección objetivo y luego hacer fuerza bruta para obtener los bytes originales. (OOB read)

No podemos sobreescribir el puntero `procfile`, que se encuentra a continuación de `kcrc` por la condición en `kwrite`. Pero sí podemos leerlo para obtener la dirección de la estructura `proc_dir_entry` de este módulo. Hecho esto ajustamos `idx=(0xc880f180 - &procfile + 0x34) / 4` (offset 0x34 sacado por medio del análisis estático del módulo) para sobreescribir `proc_dir_entry->read_proc` o `proc_dir_entry->write_proc` con la dirección de una función maliciosa en userland para escalar privilegios. Luego llamamos a `kread` para desencadenar el paso final.
```C
struct proc_dir_entry {
	unsigned int low_ino;
	umode_t mode;
	nlink_t nlink;
	kuid_t uid;
	kgid_t gid;
	loff_t size;
	const struct inode_operations *proc_iops;
	/*
	 * NULL ->proc_fops means "PDE is going away RSN" or
	 * "PDE is just created". In either case, e.g. ->read_proc won't be
	 * called because it's too late or too early, respectively.
	 *
	 * If you're allocating ->proc_fops dynamically, save a pointer
	 * somewhere.
	 */
	const struct file_operations *proc_fops;
	struct proc_dir_entry *next, *parent, *subdir;
	void *data;
	read_proc_t *read_proc;
	write_proc_t *write_proc;
	atomic_t count;		/* use count */
	int pde_users;	/* number of callers into module in progress */
	struct completion *pde_unload_completion;
	struct list_head pde_openers;	/* who did ->open, but not ->release */
	spinlock_t pde_unload_lock; /* proc_fops checks and pde_users bumps */
	u8 namelen;
	char name[];
};
```

Antes de eso, para controlar el contenido de `kcrc` hace falta un algoritmo para invertir crc32. Encontré la misma tabla de búsqueda usada por el reto [en este sitio](https://crccalc.com/?crc=123456789&method=CRC-32/ISO-HDLC&datatype=ascii&outtype=hex). Leí [este genial tutorial](http://www.danielvik.com/2010/10/calculating-reverse-crc.html) para invertir CRC32. El creador comparte al final el código fuente, el cual adapté para este reto.

Este reto me hizo escribir un exploit relativamente largo y tedioso.

`N1c3_w0rk_Kern3l_pwn3r`
