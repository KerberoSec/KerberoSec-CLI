# Eavesdrop
## Description

Download this [packet](https://artifacts.picoctf.net/c/359/capture.flag.pcap) capture and find the flag.

### SOLVING
* This challenge provided a .pcap file. Let’s inspect the .pcap file using **wireshark**
* Next, follow the TCP stream. 

![Picture](https://github.com/fadelmuharam/picoCTF22/blob/master/Eavesdrop/images/Screenshot_2022-05-19_03-09-15.png)

* We can see that this stream contains a conversation that have a shell command to decode a file named `"file.des3"`. Let's note this command
```bash
openssl des3 -d -salt -in file.des3 -out file.txt -k supersecretpassword123
```
* Our job now is to search for file.des3
* By increasing the TCP Stream to 2, we find a datastream starting with **"Salted....."**

![Picture](https://github.com/fadelmuharam/picoCTF22/blob/master/Eavesdrop/images/Screenshot_2022-05-19_03-34-54.png)

* Next, we convert this data to it’s raw format and save it as `"file.des3"`.

![Picture](https://github.com/fadelmuharam/picoCTF22/blob/master/Eavesdrop/images/Screenshot_2022-05-19_03-39-45.png)

* Run the command we noted down before to decrypt the file. If the decryption is success, the file.txt will contains the flag.

![Picture](https://github.com/fadelmuharam/picoCTF22/blob/master/Eavesdrop/images/Screenshot_2022-05-19_03-48-05.png)