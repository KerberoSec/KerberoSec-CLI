source : [here](https://youtu.be/djR1Q_bVHok?si=elUGv3HBHtvjlP_i)

## What ar links?

A connection between a file name and actual data on the disk like it's a shortcut.

Example:  

- Type on terminal : ```ln -s dirA/dirB/dirC/dirD/file.txt outputfile```
- Then show output on terminal by typing : ```cat outputfile```

## Types of links

1) Hard link : ```ln file_path file_hard_link_name```
2) Soft link : ```ln -s file_path file_link_name```

### Soft Link

Link will be removed if original file is deleted or removed.

### Hard Link

Deleting, renaming or removing the original file will not effect the link.

