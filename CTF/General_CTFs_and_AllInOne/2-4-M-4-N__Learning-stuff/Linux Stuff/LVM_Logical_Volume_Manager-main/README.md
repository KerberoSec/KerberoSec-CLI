source : [here](https://youtu.be/FsSf3rmu2Cc?si=L3OEBp-atjWD-sWl)

## LVM 
LVM is used to manage volume and disk on the Linux Server.  
Logical Volumn Manager allows disks to be combined togather.  

## Examples of LVM
Like partition of disk in windows C,D drive similarly we can do the same in the linux.  

- Single disk can be divided into different partitions.
- Multiple disks combined and group the into one -> then change it into different partitions

## Advantage of LVM

- In case of disk is running out of space, you can add new disk without breaking partitions of your system.

## Posibilities of LVM
- New space can be created on a server for new project
- In case of low disk space, increase the space.
- In case of extra space allocated to a partition, capacity can be reallocated (reduce capacity in one volume group and add it to another)

## Requirement 
We need to deploy two new applications app1 and app2 on our server and need a seperate partitons and space for each applications.

## Steps of LVM for adding new space

1. Install a new Hard Disk Drive
2. Make a partiton to use it
3. Designate Physical Volume
4. Manage Volume Group (VG)
5. Manage Logical Volume(LV)
6. Apply a filesystem
7. Set a mount point

## Partition usign 'fdisk'
1. Choose ```n``` to create new.
2. Choose ```p``` to create a primary partition.
3. Choose which number of partition we need to create.
4. Press ```Enter``` twice to use the full space of the Disk.
5. We need to change the type of newly created partition type ```t```.
6. Which number of partition need to change, choose the number which we created its ```1```.
7. Here we need to change the type, we need to create LVM so we going to use the type code of LVM as 8e, if we do not know the type code Press ```L``` to list all type codes.
8. Hx code (type ```L``` to list all codes): ```8e```
9. press ```w``` for write disk and created done for partion.
10.Write the changes and exit fdisk.
11. For checking ```fdisk -l```

## Designate Physical Volumes (PV) so that it will be available to LVM as storage capacity

- Command to create a PV:  
```pvcreate /dev/sdb1```

- Display PV capacity and additional information  
```pvdisplay```

## Manage Volumes Groups (VGs)

- VG must have at least one member (vg00 is our group name and others are our PVs)  
```vgcreate vgapps /dev/sdb1 /dev/sdb2```  

- To  Display information for a VG named vg00  
```vgdisplay vgapps```

## Manage Logical Volumes (LVs)

- To create a Logical Volume
``` lvcreate -L size(1G or 1T) -n lv_name vg_name```

- To display information for a LV
```lvdisplay /dev/vgapps/lv_name```

## Apply a filesystem and set a mount point

- Run the ```mkfs.ex4``` command on the LV.
- Create a mount point by using ```mkdir```.
- Manually mount the volume using the ```mount``` command , or edit the ```/etc/fstab``` file to mount the volume automatically when the system boots.
- Use the ```df -h command``` to verify the storage capacity available.

## Extending a Disk using LVM

- For the first time we have created a VG, now we will extend it  
```vgextend vgapps/dev/sdb2```

- Add space to LV  
```lvextend -L+1G /dev/vgapps/app1-lv```

- Make this new space available to FileSystem

- Here is the basic command for ext4:  
```resize2fs /dev/vgapps/app1-lv 3T```

- Also use for XFS:  
```xfs_growfs /dev/vgapps/app1-lv (now check using df -h)```

