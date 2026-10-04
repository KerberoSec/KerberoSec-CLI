# Unlock (Binary: 150)

The challenge file can be download here.  
  
I use `tree` command to view the stucture of files, and the private key `server.key` was found.  
*[Image: tree command]*
  
The `unlock.pcapng` is the main challenge file, open it with Wireshark.  
From the `unlock.pcapng` file ,there is the GET request to read `flag.txt` and the server redirect user in order to use HTTPS instead of HTTP.  
*[Image: http]*
  
From this point, I knew that the challenge is to decrypt the TLS packets.  
Next, add the `server.key` into Wireshark.
*[Image: Add a private key into wireshark]*
  
Now I can read the TLS by right clicking > Follow > TLS Stream.  
*[Image: https]*
  
The flag is flag{cf8236571e9dd3bcaf44b188bba4f15d}
