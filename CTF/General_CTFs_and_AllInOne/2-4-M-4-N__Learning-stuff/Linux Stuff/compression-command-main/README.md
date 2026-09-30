source : [here](https://youtu.be/q7_kgvJsk0s?si=Qx52ITwwXrvpV0uF)

## What is File compression?

file compression reduces the size of files by encoding their data more efficiently.  
This is expecially useful for backup, storage and file transfer.

### Compress file

- To compression a file : ```gzip filename```
- To decompress a file: ```gunzip filename.tar.gz```

### Compress Directory

- Creating a tar archive : ```tar -cvf folder_output.tar foldername/```
- Compressing the tar archive with gzip : ```gzip folder_output.tar```
- compressing a tar.gz archive in single command : ```tar -czvf folder_output.tar.gz foldername/```
- Decompressing a tar.gz archive in single command : ```tar -xzvf folder_output.tar.gz foldername/```
- Decompressing a tar.bz2 archive : ```tar -xjvf filename.tar.bz2```

---

- To show compressed file without decompressing : ```tar -tzvf filename.tar.gz```
- To show zipped file info without unzipping : ```zipinfo files.zip```
- Unzip a zipped file as list: ```unzip -l files.zip```
- to show .gz file as like output : ```zcat file1.gz```
