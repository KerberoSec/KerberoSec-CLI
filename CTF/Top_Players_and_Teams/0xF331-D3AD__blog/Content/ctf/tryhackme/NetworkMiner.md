
# Network Miner

## *Tool Overview 1*

- What is the total number of frames?

On case panel, hover on filename. You'll see metadata which states that there's 460 
frames.

> 460

- How many IP addresses use the same MAC address with host 145.253.2.203?

In the toolbar, sort hosts by MAC, find host ***145.253.2.203*** and count

> 2

- How many packets were sent from host 65.208.228.223?

In the content pane, just click on the "***65.208.228.223***" dropdown

> 72

- What is the name of the webserver banner under host 65.208.228.223?

Click on the "***65.208.228.223***" dropdown, then: on the "Host" dropdown

> Apache

## ***REMEMBER TO CLEAR OTHER CASE FILES***

### Switch to mx-4.pcap file

Navigate to "Credentials" tab in Toolbar.

- What is the extracted username?

> #B\Administrator

- What is the extracted password?

```
$NETNTLMv2$#B$136B077D942D9A63$FBFF3C253926907AAAAD670A9037F2A5$01010000000000000094D71AE38CD60170A8D571127AE49E00000000020004003300420001001E003000310035003600360053002D00570049004E00310036002D004900520004001E0074006800720065006500620065006500730063006F002E0063006F006D0003003E003000310035003600360073002D00770069006E00310036002D00690072002E0074006800720065006500620065006500730063006F002E0063006F006D0005001E0074006800720065006500620065006500730063006F002E0063006F006D00070008000094D71AE38CD601060004000200000008003000300000000000000000000000003000009050B30CECBEBD73F501D6A2B88286851A6E84DDFAE1211D512A6A5A72594D340A001000000000000000000000000000000000000900220063006900660073002F003100370032002E00310036002E00360036002E0033003600000000000000000000000000
```

## *Tool Overview 2*

### Switch to mx-7.pcap file

- What is the name of the Linux distro mentioned in the file associated with frame 63075?

> centos

- What is the header of the page associated with frame 75942?

> Password-Ned AB

- What is the source address of the image "ads.bmp.2E5F0FD9.bmp"?

It's the last image at "Images" tab

> 80.239.178.187

- What is the frame number of the possible TLS anomaly?

Go to "Anomalies" tab in the toolbar

> 36255

### Switch to mx-9.pcap file

- Look at the messages. Which platform sent a password reset email?

> Facebook

- What is the email address of Branson Matheson?

> branson@sandsite.org

---

## *Version Differences*

- Which version can detect duplicate MAC addresses?

> 2.7

- Which version can handle frames?

> 1.6

- Which version can provide more details on packet details?

> 1.6

---

## *Exercises*

### Use case1.pcap

- What is the OS name of the host 131.151.37.122?

> Windows: Windows NT 4

- Investigate the hosts 131.151.37.122 and 131.151.32.91.
How many data bytes were received from host 131.151.32.91 to host 131.151.37.122 through 
port 1065?

> 192

- Investigate the hosts 131.151.37.122 and 131.151.32.21.
How many data bytes were received from host 131.151.37.122 to host 131.151.32.21 through 
port 143?

> 20769

- What is the sequence number of frame 9?

Open it with NM 1.6

> 2AD77400

- What is the number of the detected "content types"?

> 2

### Use case2.pcap

Investigate the files.

- What is the USB product's brand name?

> asix

- What is the name of the phone model?

> lumia 535

- What is the source IP of the fish image?

> 50.22.95.9

- What is the password of the "homer.pwned.se@gmx.com"?

> spring2015

- What is the DNS Query of frame 62001?

> pop.gmx.com

