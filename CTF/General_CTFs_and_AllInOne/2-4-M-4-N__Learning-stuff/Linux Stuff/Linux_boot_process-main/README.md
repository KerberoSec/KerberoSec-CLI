source : [here](https://youtu.be/sebgrmiYdk4?si=NQUZIoVeRy__Bqph)

## BIOS  
- Basic I/O system.  
- First Program that executed which is stored in read-only memory on motherboard of computer.
- Perform POST (Power-on self-Test) verify the hardware components and peripheral to ensure if computer is in working condition.
- Check for bootable device like pendrive, hardisk, etc.  
- Handover control to first sector of device i.e. MBR.  

Apart from BIOS, ```UEFI``` (Unified Extensible Firmware Interface) is used.  

---

## MBR  

- Master Boot Record  
- 512 bytes, first sector of any bootable device contains machine code instructions to boot a machine and having following info  
   - Boot Loader (446 bytes)  
   - Partition Table (64 bytes)  
   - Error Checking (2 bytes)  
- It will load the boot loader into the memory and handover to it.  

---

## GRUB  

- Grand Unified Bootloader
- Load ```/boot/grub2/grub.cfg``` at boot time
- At this stage, User will see GUI asking different OS or kernels configured to boot.
- Once you selected the kernel, it locates the corresponding kernel binary.
```/boot/vmlinuz-<kernel-version>```
- Main job is to load kernel and ```initrd/initramfs``` image into memory.
- Once load kernel in RAM, it passes control to it.

In RHEL7  
Default boot loader is GRUB2  
GRUB is for x86 architecture, it could be different for others arch like for Inter Itanium: ELI  

---

## Kernel  

- First kernel is loaded into read-only mode
- Initramfs/initrd gets decompressed and then it first loads temporary file systems.
- Initrd then detects and load the drivers from temporary filesystem to load actual file system.
- Mount other partitions like LVM, RAID etc and unmount itself.
- Once main filesystem is mounted, kernel initialize the first process init/SystemD.
User can find these images under ```/boot``` folder

---

## SystemD  
- First service loaded with process ID 1
- ```ps -ef | grep systemd```
- Start all required processes  
```/etc/systemd/system/default.target```
- bring the system to run-level/targets (6-0)

- User can find the difference runlevels files under  
```/usr/lin/systemd/system```  
```ls -l runlevel*```  
- To check the current default target(run-level)  
```systemctl get-default```
