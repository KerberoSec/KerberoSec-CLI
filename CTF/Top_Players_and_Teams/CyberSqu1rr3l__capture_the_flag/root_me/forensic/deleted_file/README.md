```
░███████              ░██               ░██                      ░██    ░██████████░██░██            
░██   ░██             ░██               ░██                      ░██    ░██           ░██            
░██    ░██  ░███████  ░██  ░███████  ░████████  ░███████   ░████████    ░██        ░██░██  ░███████  
░██    ░██ ░██    ░██ ░██ ░██    ░██    ░██    ░██    ░██ ░██    ░██    ░█████████ ░██░██ ░██    ░██ 
░██    ░██ ░█████████ ░██ ░█████████    ░██    ░█████████ ░██    ░██    ░██        ░██░██ ░█████████ 
░██   ░██  ░██        ░██ ░██           ░██    ░██        ░██   ░███    ░██        ░██░██ ░██        
░███████    ░███████  ░██  ░███████      ░████  ░███████   ░█████░██    ░██        ░██░██  ░███████  
```                                                                                                     
Your cousin found a USB drive in the library this morning. He's not very good with
computers, so he's hoping you can find the owner of this stick! 
The flag is the owner's identity in the form `firstname_lastname`. [^1]

Solution
-----------------------------------------------------------------------------------------                                                                                                
First, we verify the `sha256sum` of the compressed file *ch39.gz* to be correct and then
decompress the file with `gunzip -d`. This results in a *POSIX* tar archive, in which
there is a `usb.image` *Master Boot Record* (MBR) from the USB drive. We start by 
checking the disk label type with `fdisk -l usb.image` and thus find out, that it uses
*dos*, i.e. MBR.
```
Disk usb.image: 31 MiB, 32505856 bytes, 63488 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disklabel type: dos
Disk identifier: 0x00000000
```
Here, we can see that the MBR occupies 512 bytes of the disk which we now want to restore
by various means, such as `dd` and `sfdisk`. However, none of the attempts lead to 
anything fruitful and even trying to `mount` the disk does not yield any contents.
Then, we are reminded the the challenge is hinting us to look for deleted files directly
and we proceed to extract a list of files and folders, including the deleted ones with
`fls -r usb.image` which we obtained from a blog explaining disk image study. [^2]
```
r/r 3:	USB         (Volume Label Entry)
r/r * 5:	anonyme.png
v/v 1013699:	$MBR
v/v 1013700:	$FAT1
v/v 1013701:	$FAT2
V/V 1013702:	$OrphanFiles
```
Here, we spot a deleted image *anonyme.png* which can be extracted for further 
investigation through `icat usb.image 5 > anonyme.png`. Now, the image itself does not
feature anything interesting in particular, but the metadata does indeed. We view the
picture's metadata with `exiftool anonyme.png` and thus spot the creator which is also
the flag for this challenge

[^1]: https://www.root-me.org/en/Challenges/Forensic/Deleted-file
[^2]: https://heisenberk.github.io/Study-Disk-Image/
