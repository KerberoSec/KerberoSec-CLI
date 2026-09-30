# Description

Jacky is not very knowledgable about the best security passwords and used a simple password to encrypt their BitLocker drive. 
See if you can break through the encryption!
Download the disk image here

# Solution

`wget https://challenge-files.picoctf.net/c_verbal_sleep/9e934e4d78276b12e27224dac16e50e6bbeae810367732eee4d5e38e6b2bb868/bitlocker-1.dd`

Once you have the bitlocker dd drive you can install john to use the bitlocker2john to get the hashes. One way to do this is by getting it from the GitHub page: `git clone https://github.com/openwall/john.git`

Afterward, you can run the python file on the image to get the hashes: `python3 john/run/bitlocker2john.py bitlocker-1.dd`

```
The following hashes were found:
$bitlocker$2$16$2b71884a0ef66f0b9de049a82a39d15b$1048576$12$00be8a46ead6da0106000000$60$a28f1a60db3e3fe4049a821c3aea5e4ba1957baea68cd29488c0f3f6efcd4689e43f8ba3120a33048b2ef2c9702e298e4c260743126ec8bd29bc6d58
$bitlocker$3$16$2b71884a0ef66f0b9de049a82a39d15b$1048576$12$00be8a46ead6da0106000000$60$a28f1a60db3e3fe4049a821c3aea5e4ba1957baea68cd29488c0f3f6efcd4689e43f8ba3120a33048b2ef2c9702e298e4c260743126ec8bd29bc6d58
$bitlocker$0$16$cb4809fe9628471a411f8380e0f668db$1048576$12$d04d9c58eed6da010a000000$60$68156e51e53f0a01c076a32ba2b2999afffce8530fbe5d84b4c19ac71f6c79375b87d40c2d871ed2b7b5559d71ba31b6779c6f41412fd6869442d66d
$bitlocker$1$16$cb4809fe9628471a411f8380e0f668db$1048576$12$d04d9c58eed6da010a000000$60$68156e51e53f0a01c076a32ba2b2999afffce8530fbe5d84b4c19ac71f6c79375b87d40c2d871ed2b7b5559d71ba31b6779c6f41412fd6869442d66d
```

Now that the bitlocker hashes were extracted you can use hashcat to try to get the password. First start by installing hashcat with `sudo apt install hashcat -y`. The rockyou password wordlist is typically a good place to start so you can download it with the following command:

`wget https://github.com/brannondorsey/naive-hashcat/releases/download/data/rockyou.txt`

Afterwards, by running this hashcat command you can see one of the bitlocker hashes gave the password jacqueline: `hashcat -m 22100 hashes.txt rockyou.txt`

Output:

`$bitlocker$0$16$cb4809fe9628471a411f8380e0f668db$1048576$12$d04d9c58eed6da010a000000$60$68156e51e53f0a01c076a32ba2b2999afffce8530fbe5d84b4c19ac71f6c79375b87d40c2d871ed2b7b5559d71ba31b6779c6f41412fd6869442d66d:jacqueline`

Now you can use the dislocker tool on the image. First install it with this command: `sudo apt install dislocker -y`

First make the directory in the /mnt fir the dislocker file: `sudo mkdir /mnt/dd_image`.

Then you can run the command with dislocker in this format: `sudo dislocker -V ~/bitlocker-1.dd -u"jacqueline" -- /mnt/dd_image`. Be sure to change the path to the bitlocker-1.dd file as needed.

Then create the directory for the data: `sudo mkdir /mnt/bitlocker_data`. And mount it to bitlocker data: `sudo mount -o loop /mnt/dd_image/dislocker-file /mnt/bitlocker_data`.

If you encounter `unknown filesystem type 'ntfs'` error than run `sudo apt install ntfs-3g -y` to fix and then run the mount command again. After that you can change directories to the bitlocker_data directory to see the flag:

`cd /mnt/bitlocker_data`

`cat flag.txt`

Once you are done you can use `cd -` to go back to the previous directory or change directories anywhere else and unmount the image with `sudo umount /mnt/bitlocker_data`.

Flag: `picoCTF{us3_b3tt3r_p4ssw0rd5_pl5!_324...}`