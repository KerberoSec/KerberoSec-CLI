# WLAN (Network: 150)
  
The challenge file can be downloaded here.  
The goal of this challenge is find the IP address of the server that requested by client.  
  
We got the wireless packets captured file.  
*[Image: 802.11]*  
  
Try to convert .pcapng to .pcap file and decrypt the packets.  
*[Image: aircrack]*  
  
There is only 1 ESSID in the PCAP file, that is the target!  
And the password of that access point is `pass1234`.  
*[Image: password]*  
  
Next, decrypt the PCAP file with `airdecap-ng`.  
*[Image: decap]*  
  
We got the new decrypted file, `WLANcapture-dec.pcap`.  
Open with Wireshark.  
*[Image: flag]*

The destination server's IP is 192.168.11.202.  
The flag is flag{192.168.11.202}
