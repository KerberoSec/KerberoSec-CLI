source : [here](https://youtu.be/D_CvoPsKvsA?si=4BBkNR21-lVUzgXA)

## Remote Synchronization

A utility for efficiently transferring anf synchronizing files across different systems or locations.  
It's known for its speed, flexibility and efficiency.

### RSYNC feature
optimize files transfers by sending only the changes made, and ensure that file permissions, ownership and timestamps are preserved.

### RSYNC SYNTAX 
- ```rsync [options] source destination```
- ```rsync file.csv root@ipaddress:/tmp/rsync/```

__options__

- ```-a``` or ```--archive``` for archiving files.
- ```-v``` or ```--verbose``` for verbose output.
- ```-z``` or ```--compress``` for compression.
- ```--progress``` to show progress during transfer.
- ```-b``` taking backup before delete
- ```-d``` delete files before copying
- ```--backup-dir=/tmp/``` -> ```rsync --backup-dir=/tmp/rsync/archive/ file.csv root@ipaddress:/tmp/rsync/```

## To create a history of backups

- ```rsync --backup-dir=/tmp/rsync/archive/$(date +%Y%m%d-%H%M%S) file.csv root@ipaddress:/tmp/rsync/```

