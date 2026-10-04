# WPA Crack

```ruby
aircrack-ng dump-01.cap
```

```ruby
┌──(kali㉿kali)-[~/Downloads/ctfs/cybertatant]
└─$ aircrack-ng dump-01.cap
Reading packets, please wait...
Opening dump-01.cap
Resetting EAPOL Handshake decoder state.
Read 5887 packets.

   #  BSSID              ESSID                     Encryption

   1  26:92:C9:17:B7:C6  test                      WPA (1 handshake)

Choosing first network as target.

Reading packets, please wait...
Opening dump-01.cap
Resetting EAPOL Handshake decoder state.
Read 5887 packets.

1 potential targets

Please specify a dictionary (option -w).

                                                                                                                            

```

![Uploading image.png…]()

```ruby
aircrack-ng -w /usr/share/wordlists/rockyou.txt -b 26:92:C9:17:B7:C6 dump-01.cap
```

<img width="926" height="479" alt="image" src="https://github.com/user-attachments/assets/abfa7603-b134-407e-a0ae-756315e3dcab" />

```ruby
biscotte
```

