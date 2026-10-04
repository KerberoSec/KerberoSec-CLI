# UnderPass (HTB) CTF write-up

## Objective

This is a write-up for UnderPass, an easy level difficulty vulnerable machine on HackTheBox.
Note that at the time of this publication the machine is still active, so big spoilers and hints are to be used with caution.
To access the full document with explanation, please download the PDF file from above.

### Skills Learned

- UDP port scanning
- What is daloRadius and how does it work.
- MD5 hash cracking
- Mosh service, operation, and privilege escalation.

### Tools Used

- Kali Linux, and through it:
  - nmap
  - snmpwalk
  - hashcat
  - ssh
  - scp
  - manual PE enumeration
  - LinPEAS
  - mosh service
- daloRADIUS
  
## Steps

1. UDP port scanning:

![3-nmap-udp](https://github.com/user-attachments/assets/2d624ae8-ba69-4a8d-9c82-9f3e7940637d)

2. daloRADIUS login:

![7-login-succ](https://github.com/user-attachments/assets/851d2034-39fb-4a08-a8db-3b4ab7ee6445)

3. Users list:

![9-users-list](https://github.com/user-attachments/assets/04177023-8c80-418a-b040-5eecc7946088)

4. MD5 hash cracking:

![10-hashcat](https://github.com/user-attachments/assets/146c4fe1-36f0-40a3-975f-dcafd211956c)
![11-hash-cracked](https://github.com/user-attachments/assets/d1a0cefc-0a3c-4e60-8fce-a781f586cc22)

5. SSH & User flag:

![12-ssh-user-1](https://github.com/user-attachments/assets/bb62069c-2a2d-4495-9c75-d00b728a23ec)
![13-user-flag](https://github.com/user-attachments/assets/ec149de6-753b-4d6b-b67d-368a64818140)

6. scp file transfer of LinPEAS:

![16-scp](https://github.com/user-attachments/assets/f7e75509-90e5-4014-b845-c38fefa50a08)

7. LinPEAS result:
   
![18-linpeas-5-pe](https://github.com/user-attachments/assets/7e59f8e6-6269-40d2-bd49-f0351772162c) 

8. Mosh as sudo:

![18-linpeas-6-mosh](https://github.com/user-attachments/assets/3071c542-33a5-4396-a52c-daaf8bba76a1)

9. Mosh connection:

![21-mosh-connect](https://github.com/user-attachments/assets/99b60fcd-cde6-4926-ab8a-23f50112e82a)

10. Root & the flag

![22-root](https://github.com/user-attachments/assets/8bbb2f6b-9ac8-44e1-a429-3e300bd74951)
![23-root-flag](https://github.com/user-attachments/assets/1d229032-fd65-4538-a6a3-7eae39b06e94)

