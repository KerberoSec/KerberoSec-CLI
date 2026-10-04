```
   ___  _____  ___             _         _   _                _   _           _   _             
  / __\/__   \/ _ \           /_\  _   _| |_| |__   ___ _ __ | |_(_) ___ __ _| |_(_) ___  _ __  
 / _\    / /\/ /_)/  _____   //_\\| | | | __| '_ \ / _ \ '_ \| __| |/ __/ _` | __| |/ _ \| '_ \ 
/ /     / / / ___/  |_____| /  _  \ |_| | |_| | | |  __/ | | | |_| | (_| (_| | |_| | (_) | | | |
\/      \/  \/              \_/ \_/\__,_|\__|_| |_|\___|_| |_|\__|_|\___\__,_|\__|_|\___/|_| |_|
```
An authenticated file exchange achieved through FTP. Recover the password used by the 
user. [^1]

Solution
-----------------------------------------------------------------------------------------
Upon downloading the challenge resource, we immediately see that we should use a network
capture analyzing tool and start `wireshark ch1.pcap`. The captured traffic contains only
*105* packets with mostly the TCP and FTP [^2] protocols present. \
We start by following the TCP stream and obtain the following intercept with the password
used by the user as follows.
```
220-QTCP at fran.csg.stercomm.com.
220 Connection will close if idle more than 5 minutes.
USER cdts3500
331 Enter password.
PASS cdts3500
230 CDTS3500 logged on.
SYST
215  OS/400 is the remote operating system. The TCP/IP version is "V5R2M0".
SITE NAMEFMT
250  Now using naming format "0".
PWD
257 "CDTS3500" is current library.
PASV
227 Entering Passive Mode (10,20,144,151,62,141).
RETR qgpl/apkeyf.apkeyf
150 Retrieving member APKEYF in file APKEYF in library QGPL.
250 File transfer completed successfully.
QUIT
221 QUIT subcommand received.
```

[^1]: https://www.root-me.org/en/Challenges/Network/FTP-authentication
[^2]: https://www.rfc-editor.org/info/rfc959/
