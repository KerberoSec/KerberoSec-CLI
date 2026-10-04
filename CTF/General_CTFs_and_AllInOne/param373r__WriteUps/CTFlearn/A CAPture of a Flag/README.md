# A CAPture of a Flag
## About

### General Information

__Challenge Description__: This isn't what I had in mind, when I asked someone to capture a flag... can you help? You should check out WireShark.

__Challege Category__: FORENSICS

__Challenge Difficulty__: Medium

__Skills__: None

__Tools__: Wireshark

Download the file [here.](https://mega.nz/#!3WhAWKwR!1T9cw2srN2CeOQWeuCm0ZVXgwk-E2v-TrPsZ4HUQ_f4)

## Solution

If you don't know about wireshark or haven't used it before, I highly recommend you to check out [references](#References) before else you may not be able to understand what am I doing here. Also, just convert the file's extension to .pcap, so that wireshark could analyze its content.

So starting with the basic analysis: Let's apply filter for ```http``` first, because most of the communication is handled on this protocol.

![Image1](https://github.com/iParamjotSingh/WriteUps/blob/master/CTFlearn/A%20CAPture%20of%20a%20Flag/1.png)

Right click on the first packet > Follow > TCP stream. Now here start analyzing all the streams. Once you have gone through these streams, you might have noticed something suspicious on stream no. 5 with a GET request to address ```/?msg=ZmxhZ3tBRmxhZ0luUENBUH0=```. 

![Image2](https://github.com/iParamjotSingh/WriteUps/blob/master/CTFlearn/A%20CAPture%20of%20a%20Flag/2.png)

This is a base64 cipher, after decrypting it... You will get your flag.

![Image3](https://github.com/iParamjotSingh/WriteUps/blob/master/CTFlearn/A%20CAPture%20of%20a%20Flag/3.png)

__Flag__: flag{AFlagInPCAP} 

## References

[Guide to Wireshark](https://www.wireshark.org/docs/wsug_html_chunked/)
