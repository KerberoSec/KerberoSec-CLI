# Tryhackme-Ice-Writeup

## Lab Information

Room URL: https://tryhackme.com/room/ice

## Note

### This Writeup won't be having the tryhackme answers !!

### Take this as Reference and enjoy yourself inside the room..

## Tools Used : nmap 👁️ Msfconsole😈

| Method | 
| ------------- | 
| Connect 🔗  |
| Recon 👁️ | 
| Gain Access 🔑  |
| Escalate 🚀 | 
| Looting 🤑 |
| Post Exploitation 🥂 | 

# Connect

Go to: https://tryhackme.com/room/ice

Connect to tryhackme and you will be provident with the target IP !!

If everything goes fine and you have the IP we are good to go !!

# Recon

### Scan for the Open Ports using Threader 3000
![image](https://user-images.githubusercontent.com/46339839/184345483-548e7a94-a2a6-422d-8e76-67f72b8b7f18.png)

## Run nmap scan on Open Ports

![image](https://user-images.githubusercontent.com/46339839/184345690-467a8431-9a75-49be-9da2-8a10d4a56abd.png)
![image](https://user-images.githubusercontent.com/46339839/184345756-bd55bad7-4602-4492-b618-3f529765b6b2.png)

After running the nmap scan we could see the 8000 is running the icecast streaming media server

# Gain Access

### Search on CVE DB

Now we have found the port for the icecast server so we can now search for the CVE DB for any know vulnerability.
![image](https://user-images.githubusercontent.com/46339839/184346115-9b79ece5-d3de-49b1-bbb4-7c70cd4ee5d2.png)

we could see that it has Execution code overflow vulnerability

### Search for exploit in msfconsole

![image](https://user-images.githubusercontent.com/46339839/184346310-35753e29-da83-49dc-b602-b18073c2412a.png)

### Configure exploit

![image](https://user-images.githubusercontent.com/46339839/184346347-d46f2dfb-e2c3-4342-9903-74c62e3fae0b.png)

### Getting Meterpreter

![image](https://user-images.githubusercontent.com/46339839/184346413-8c1547ad-f9d1-4365-8e22-f0a0c2a92b5c.png)

# Escalate

### Get info on Target Machine

![image](https://user-images.githubusercontent.com/46339839/184346534-18b8ab07-252d-4cac-8260-4a8be07e72bd.png)

### Search for Local Exploit

![image](https://user-images.githubusercontent.com/46339839/184346579-ab0c27aa-b7da-4b8b-855d-d8cf8629a0f8.png)

### Configure Local exploit
![image](https://user-images.githubusercontent.com/46339839/184346612-4ad01479-9294-4fa3-9802-2cd1cc012249.png)

### Exploit and Check privilege
![image](https://user-images.githubusercontent.com/46339839/184346659-fd78d96b-d273-4e58-95e5-c0b478997c46.png)
![image](https://user-images.githubusercontent.com/46339839/184346673-6ca82fde-bf1b-4137-a26c-052b7391af17.png)

# Looting

### check for running process
![image](https://user-images.githubusercontent.com/46339839/184346734-9fa4ab5f-63f9-48df-9265-6569d5bd296a.png)

### Migrate to spoolsv.exe
![image](https://user-images.githubusercontent.com/46339839/184346806-4aaa1ae6-d328-4e9e-9b39-9150f3ae3766.png)

### Load Kiwi (Password Dump tool)

![image](https://user-images.githubusercontent.com/46339839/184346877-8ffae6d1-1aa8-4f77-b31a-fe2e34f435f1.png)

### Check for Kiwi commands using help
![image](https://user-images.githubusercontent.com/46339839/184346948-46331d79-1d02-4b69-98a8-86ae8a63d301.png)

### Get credentials 
![image](https://user-images.githubusercontent.com/46339839/184347003-b35091d1-06e6-4e16-9f80-5668eb25b438.png)

# Post Exploitation

### Hash Dump
![image](https://user-images.githubusercontent.com/46339839/184347103-c9931e2b-a0ac-4dbc-9c78-5ad9a70373d1.png)

### Enable RDP
![image](https://user-images.githubusercontent.com/46339839/184347152-54ba016e-7095-45b0-a78e-fe34d0346b72.png)

