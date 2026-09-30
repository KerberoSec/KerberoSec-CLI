
# Writeup: WP{ctF}TPd

In this challenge we are given a minimal FTP server implementation in C.

## Step 1: Investigate

First, let's connect to the FTP server. We will notice that:
1. Username and password seem not relevant but we need to specify some random one
2. There is no PASSIVE mode implemented.
3. We can upload and download new files, the user running the server is `ctf`
4. There is a path traversal. We can download any file readable by `ftp`, or upload to any directory writable by `ftp`
5. There is a file named `flag` that has no permissions set (not readable) but belong to the FTP user.
6. We can not download nor overwrite the file `flag`

## Step 2: Exploitation strategy

We can deduce that the file `flag` contains the flag, and we need some way to read it.
In order to do that, we need to give us the read permissions (file belongs to us).
For giving us the read permissions we need to find some vulnerability in the FTP server that allows us to run chmod.

## Step 3: Find the vulnerability

By reversing the code we see that the server is never calling chmod in any way.
This means we need to fine an RCE vulnerability in the FTP server, and execute chmod.

We notice that:
1. There is a custom chunk allocator
2. The server is freeing all chunks when the control connection is closed
3. All commands are put on a list and then executed in order
4. upload and download operations are asynchronous in separate threads.
5. There is a race condition when closing the control connection, because already buffered commands will still be executed even if all chunks where freed.
6. So there is a use after free

## Step 4: Exploit
(see exploit.py)