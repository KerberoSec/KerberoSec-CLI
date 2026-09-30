# Noxious

## 1. Its suspected by the security team that there was a rogue device in Forela's internal network running responder tool to perform an LLMNR Poisoning attack. Please find the malicious IP Address of the machine.

1. Filter `llmnr` (or `udp.port == 5355`)
2. See that requests for `DCC01` are made (likely a typo of `DC01` for a Domain Controller)
3. See responses for `DCC01`
4. There's a response for `DCC01` from `172.17.79.135` (attacker) to `172.17.79.136` (victim)

> **ANSWER:** 172.17.79.135

## 2. What is the hostname of the rogue machine?

1. Filter `ip.addr == 172.17.79.135` and scroll (or filter `ip.addr == 172.17.79.135 && !llmnr && !tcp`)
2. See that there are some DHCP requests
3. Follow the DHCP requests, and we find that `udp.stream eq 593` has `kali` and `localdomain`

> **ANSWER:** kali

## 3. Now we need to confirm whether the attacker captured the user's hash and it is crackable!! What is the username whose hash was captured?

1. Revisiting the LLMNR response, we see that the attacker returned `fe80::2068:fe84:5fc8:efb7` for the `DCC01` request
2. Filter `ipv6.dst == fe80::2068:fe84:5fc8:efb7`
3. We see some `SMB2` "Session Setup Request" packets containing the user and their hash

> **ANSWER:** john.deacon

## 4. In NTLM traffic we can see that the victim credentials were relayed multiple times to the attacker's machine. When were the hashes captured the First time?

1. Filter `ipv6.dst == fe80::2068:fe84:5fc8:efb7 && smb2`
2. Find the 1st `NTLMSSP_AUTH` packet
3. Check its "UTC Arrival Time"

> **ANSWER:** 2024-06-24 11:18:30

## 5. What was the typo made by the victim when navigating to the file share that caused his credentials to be leaked?

> **ANSWER:** DCC01

## 6. To get the actual credentials of the victim user we need to stitch together multiple values from the ntlm negotiation packets. What is the NTLM server challenge value?

1. Filter `ntlmssp.ntlmserverchallenge && ipv6.src == fe80::2068:fe84:5fc8:efb7`
2. View the 1st packet (`NTLMSSP_CHALLENGE`)
3. Get challenge value in: SMB2 > Session Setup Response > Security Blob > GSS-API > Simple Protected Negotiation > negTokenArg > NLTM Secure Service Provider > NTLM Server Challenge

> **ANSWER:** 601019d191f054f1

## 7. Now doing something similar find the NTProofStr value.

1. Filter `ntlmssp.ntlmclientchallenge && ipv6.dst == fe80::2068:fe84:5fc8:efb7`
2. View the 1st packet
3. Get challenge value in: SMB2 > Session Setup Response > Security Blob > GSS-API > Simple Protected Negotiation > negTokenArg > NLTM Secure Service Provider > NTLM Response > NTLMv2 Response > NTProofStr

> **ANSWER:** c0cc803a6d9fb5a9082253a04dbd4cd4

## 8. To test the password complexity, try recovering the password from the information found from packet capture. This is a crucial step as this way we can find whether the attacker was able to crack this and how quickly.

1. Filter `ntlmssp && ipv6.dst == fe80::2068:fe84:5fc8:efb7`
2. From finding the challenge and response, we can see that we need to crack an NTLMv2 hash, which is mode `5600` or `27100` in [`hashcat`](https://hashcat.net/wiki/doku.php?id=example_hashes).

Following [How to extract NTLM Hashes from Wireshark Captures for cracking with Hashcat](https://www.youtube.com/watch?v=lhhlgoMjM7o), we can figure out the necessary `hashcat` input.

- User: `john.deacon`
- Domain: `FORELA`
- Challenge: `601019d191f054f1`
- HMAC-MD5: `c0cc803a6d9fb5a9082253a04dbd4cd4`
- Response: `c0cc803a6d9fb5a9082253a04dbd4cd4010100000000000080e4d59406c6da01cc3dcfc0de9b5f2600000000020008004e0042004600590001001e00570049004e002d00360036004100530035004c003100470052005700540004003400570049004e002d00360036004100530035004c00310047005200570054002e004e004200460059002e004c004f00430041004c00030014004e004200460059002e004c004f00430041004c00050014004e004200460059002e004c004f00430041004c000700080080e4d59406c6da0106000400020000000800300030000000000000000000000000200000eb2ecbc5200a40b89ad5831abf821f4f20a2c7f352283a35600377e1f294f1c90a001000000000000000000000000000000000000900140063006900660073002f00440043004300300031000000000000000000`
- Format: `User::Domain:Server Challenge:HMAC-MD5 (NTProofStr):NTLMv2 Response (without HMAC)`

`hash.txt` file:
```
john.deacon::FORELA:601019d191f054f1:c0cc803a6d9fb5a9082253a04dbd4cd4:010100000000000080e4d59406c6da01cc3dcfc0de9b5f2600000000020008004e0042004600590001001e00570049004e002d00360036004100530035004c003100470052005700540004003400570049004e002d00360036004100530035004c00310047005200570054002e004e004200460059002e004c004f00430041004c00030014004e004200460059002e004c004f00430041004c00050014004e004200460059002e004c004f00430041004c000700080080e4d59406c6da0106000400020000000800300030000000000000000000000000200000eb2ecbc5200a40b89ad5831abf821f4f20a2c7f352283a35600377e1f294f1c90a001000000000000000000000000000000000000900140063006900660073002f00440043004300300031000000000000000000
```

```sh
hashcat -a0 -m5600 hash.txt rockyou.txt
```

> **ANSWER:** `NotMyPassword0K?`

## 9. Just to get more context surrounding the incident, what is the actual file share that the victim was trying to navigate to?

Filter `ip.src == 172.17.79.136 && smb2`, and find a non-standard file among the requests.

> **ANSWER:** `\\DC01\DC-Confidential`
