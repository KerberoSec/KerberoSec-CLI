***Login into Bandit10!***
```bash
ssh bandit10@bandit.labs.overthewire.org -p 2220
```
**Password:** 6zPeziLdR2RKNdNYFNb6nVCKzphlXHBM

in this level, you have to decode the string given in data.txt file by rotation of 13 position,
after copying the data from data.txt you can decode this online otherwise
type the following command:
```bash
apt install hxtools
```
Now, exit the server
then type this command including the data.txt content given below:
```bash
echo Gur cnffjbeq vf WIAOOSFzMjXXBC0KoSKBbJ8puQm5lIEi | rot13
```
You'll get the password of level 12

**Password:** JVNBBFSmZwKKOP0XbFXOoW8chDz5yVRv

Now,

```bash
exit
```