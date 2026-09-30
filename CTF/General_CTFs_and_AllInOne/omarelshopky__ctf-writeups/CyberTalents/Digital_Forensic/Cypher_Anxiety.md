# Challenge Name:
 [*Cypher Anxiety*](https://cybertalents.com/challenges/forensics/cypher-anxiety)
 
# Challenge Description
An image was leaked from a babies store. the manager is so annoyed because he needs to identify the image to fire charges against the responsible employee. the key is the md5 of the image

Link: [https://s3-eu-west-1.amazonaws.com/talentchallenges/Forensics/find+the+image.zip](https://s3-eu-west-1.amazonaws.com/talentchallenges/Forensics/find+the+image.zip)

## Answer
* Download the file
* Unzip it then use wireshark to analyze the packet
```sh
unzip find+the+image.zip
wireshark 'find the image.pcap'
```
* scroll down while watch packet in hexa there is a message let's follow tcp steam
```
Hey bro
Sup supp, are we ready
yeah, u got the files?
yes but i think the channel is not secured
the UTM will block the file transfer as the DLP module is active
ok we can use cryptcat
ok what the password then
let it be P@ssawordaya
hhh, ok
listen on 7070 and ill send you the file , bye
bye
```
* They will send the image usnig port 7070 with cryptcat with password= 'P@ssawordaya'
* Filter the packets to get only ones in port 7070
```
tcp.port == 7070
```
* Follow tcp stream, convert it to raw then save it, I will call it 'cryptData'
* open cryptcat listener in port 7070 pipe it's input to file I call it 'decryptData'
```sh
cryptcat -k P@ssawordaya -l -p 7070 > decryptData
```
* In another terminal make nc connection with port 7070 then pipe the cryptData to it
```sh
nc localhost 7070 < cryptData
```
* Now we have the image, from description they mention that the flag is md5 of the image 
```sh
cat decryptData | md5sum
```
* You got the Flag

 ## The Flag
 > 3beef06be834f3151309037dde4714ec
