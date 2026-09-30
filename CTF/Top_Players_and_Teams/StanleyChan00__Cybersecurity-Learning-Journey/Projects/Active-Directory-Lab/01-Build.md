# Phase 1: Building the Network

Much of the hard work was done in [Phase 0](00-Plan-and-Structure.md) so this phase was relatively simple and just comprised of following my plan, using the intuitive GUI, and basic troubleshooting of any issues that arose.

## Getting the DC started 

I started off by building the DC. As planned, I gave it 3GB of RAM, 2 CPUs, and up to 50GB of storage using my external SSD. If any of the machines are too slow, I could always add more RAM as well. 

<img width="1888" height="862" alt="Memory and CPU" src="https://github.com/user-attachments/assets/90d73da2-766d-4ea3-bb91-227df8d7a381" />

After this, I set up the 2 network adapters according to plan. The 1st NIC connected to the NAT to give us internet access while the 2nd connected internally to form the LAN with the client machine, which I will add later on. 

The 2nd NIC will be named `ADLAN`.

<img width="1886" height="936" alt="NIC1" src="https://github.com/user-attachments/assets/3ad2bae0-e56c-400b-9c82-2e058645f93e" />

<img width="1886" height="936" alt="NIC2" src="https://github.com/user-attachments/assets/065e2f30-24e6-4d39-91e0-0159c3dcbb73" />

I also deselected the floppy disk in the boot order so it would boot up the Windows Server ISO on the Optical and then write it on the hard disk after. 

<img width="1886" height="936" alt="Boot" src="https://github.com/user-attachments/assets/d7019b22-d046-42b4-a09b-aae70a727a6e" />

I then selected the Desktop Experience OS to install so that I could have the GUI to learn optimally with.

 <img width="2276" height="1694" alt="DE" src="https://github.com/user-attachments/assets/05a3d67e-4063-4f9b-8911-15ce6378c5fb" />

After setting up a simple password, we now have the Window's Server booted up and are now ready to begin!

<img width="2068" height="1632" alt="Start" src="https://github.com/user-attachments/assets/28276434-9118-4ece-a64b-11ffccf69b41" />

### Setting Up the Network & AD Structure

First, I did an initial `ipconfig` as well as a few `ping` tests to check out the initial network as well as test our initial internet connection.

<img width="1948" height="1080" alt="Initial Network" src="https://github.com/user-attachments/assets/181901be-d33d-49f9-ae23-5e6deb5b2d64" />

Everything is already going smoothly. The internet works through the NAT from my NIC1. I was able to ping `google.com` as well as `8.8.8.8`.

However, I still had to set up the 2nd NIC, which I did here. 

<img width="2056" height="1516" alt="ADLAN DC IP Settings" src="https://github.com/user-attachments/assets/4e6f5a7e-e03d-4098-af00-00afbe359cd7" />

As planned, I used `10.10.10.10` as the static IP, a standard subnet mask, and then set the DNS server to point to itself. After setting it up and confirming it through the `ipconfig` command, I then went on to install AD DS and also changed the machine name to `DC`. 

<img width="2056" height="1516" alt="Install AD DS" src="https://github.com/user-attachments/assets/8e437672-3c4e-4f29-b05f-f6d85d5b2547" />

I then made the domain and called it `circle.lab` and restarted the machine.

 <img width="2056" height="1516" alt="Circle Login" src="https://github.com/user-attachments/assets/5beb2a08-b32e-4eda-95b4-53f0c45402ff" />

 From here, I had to set up the rest of the network so that the client could obtain an IP automatically via DHCP as well as have internet with the DC acting as the router. 

 So I installed RRAS as well as DHCP on the machine.

 <img width="2056" height="1516" alt="RRAS   DHCP" src="https://github.com/user-attachments/assets/518d2d53-8de3-4148-8d2a-a445c9244476" />

 I then set up the DHCP scope as planned.

 <img width="2056" height="1516" alt="DHCP Scope" src="https://github.com/user-attachments/assets/47e3e365-6a54-49cd-806a-38fed9ed537a" />

 To finish up the network, I went to set the DNS forwarder to google and noticed that it already automatically set my host IP as the forwarder. So I promptly removed it and set `8.8.8.8` as the forwarder instead.

<img width="2056" height="1516" alt="DNS fowarder IP host" src="https://github.com/user-attachments/assets/4d53695f-1e76-43f9-afe9-3ae413fee668" />

<img width="2056" height="1516" alt="DNS fowarder google" src="https://github.com/user-attachments/assets/96fc8800-3cfa-41aa-aa5d-ad1114f8ad5c" />

After this, the network setup has been finished! So I took a snapshot just in case.

<img width="2056" height="1516" alt="Snapshot" src="https://github.com/user-attachments/assets/57e91855-7080-454a-9fad-0e7ee60fc562" />

Lastly, the AD structure. Being able to see the GUI as well as the built-in containers is an advantage that I did not have in phase 0. 

So here, I created a new OU for the "circle" company and added all the OUs under it to distinguish from the built-in containers where everything gets dumped in. 

I created a Security Groups OU, named `groups`, which comprised of `Admins` and `Staff`.

I created a `Machines` OU, which will be where the client is. Lastly, I created the `Users` OU, which had a separate `IT` and `Staff` OU within.

I made 2 staff users named `Staff-1` and `Staff-2` as well as the main IT-Admin account, named `IT-Admin`. I made all simple passwords so that it's easily memorable.

<img width="2056" height="1516" alt="Staff" src="https://github.com/user-attachments/assets/5b3bc8d0-f23a-4a60-a553-6943cb610992" />

Just for simple variety of set up and experience, I made it so that the staff would have to change the password at login while the IT-admin did not. 

<img width="2056" height="1516" alt="IT-Admin" src="https://github.com/user-attachments/assets/b8f165a8-daca-4608-89b2-e75e60156e40" />

<img width="2056" height="1516" alt="Staff Creation" src="https://github.com/user-attachments/assets/8a7e7168-a5d5-42e7-ae00-8346716d00fb" />

After this, most of phase 1 is now done! We now just have to set up the Client Machine.

## Setting Up the Client Machine

Just like the DC, I set up the client machine with 2 CPUs, 3gb of RAM, as well as up to 50gb of storage. I then set up the network adapter as planned, connecting internally and ensuring it is named the same as the 2nd NIC in the DC: `ADLAN`

<img width="1572" height="1092" alt="Client NIC" src="https://github.com/user-attachments/assets/dc245816-7688-46e4-82b6-4d2a10338633" />

Doing this allowed me to connect automatically to the LAN from the DC once the machine has been booted up, since we already set the whole network up with the DC prior. 

I did a few `ping` tests and diagnostics to confirm everything is working before changing the name of the machine and joining the domain.

<img width="2182" height="1654" alt="Client Initial Ping" src="https://github.com/user-attachments/assets/7bb8878d-179e-4143-970f-41de0b1a31c1" />

<img width="2002" height="1218" alt="Client Initial ipconfig" src="https://github.com/user-attachments/assets/7287c28b-d37c-418e-973a-75866be3ee7d" />

Finally, I joined the domain using the IT-Admin account.

<img width="2002" height="1218" alt="Join-Domain" src="https://github.com/user-attachments/assets/c4690ed2-e936-43c7-a978-f48c5ae5b664" />

In attempting to login to the DC on the IT-Admin account, I encountered a small issue of failing to being allowed to login.

<img width="2010" height="1628" alt="IT-Admin login fail DC" src="https://github.com/user-attachments/assets/6eb811a5-bf20-4f26-a50a-09a9d2f172ce" />

I realized that although I created Admin OUs and added the IT account into it, I never actually made that IT account into a Domain Admin. 

So I promptly fixed that issue on the DC by going into the built-in Users container and adding the IT-Admin account as an Admin. That fixed the issue and I was able to login. 

<img width="2010" height="1628" alt="Fixed Login " src="https://github.com/user-attachments/assets/d29945a3-125a-49e6-b093-02ade7e67beb" />

I then logged into the first Staff account to ensure that it works and subsequently changed the password at the prompt.

<img width="2010" height="1628" alt="Change Password Staf--1" src="https://github.com/user-attachments/assets/a46fdb82-9d47-42b0-8dbd-699801eb0c55" />

I did one last test of the network to ensure everything is working correctly.

<img width="2010" height="1628" alt="Testing Network" src="https://github.com/user-attachments/assets/135c56df-b4c0-4ae5-aea5-411d7ab0e79c" />

Here is what the finished AD stucture looks like as I added the client machine(WKS01) into the new machines OU.

<img width="2010" height="1628" alt="Finished AD Setup" src="https://github.com/user-attachments/assets/0d37523f-9c06-4a12-aa10-1cd0800e49c8" />

## File Sharing and GPOs

After that, I installed 2 RSAT utilities so that I could manage GPOs and do some AD work on the client machine using the IT-Admin account 

 <img width="1346" height="1218" alt="RSAT" src="https://github.com/user-attachments/assets/6cd8086c-b32e-4562-a484-c3bc5835ae99" />

Then, I enabled the recycle bin for more potential tickets in Phase 2.

<img width="1346" height="1218" alt="Recycle Bin" src="https://github.com/user-attachments/assets/3a7637b4-9230-42ac-970d-6f74d7460ec5" />

### File Sharing 

First, I made the network discoverable on both machines to allow for file sharing.

<img width="1346" height="1218" alt="Network Discovery" src="https://github.com/user-attachments/assets/12251f8d-74c7-4187-9c1a-73be99423da4" />

Then I created two folders on the DC that I will be using for sharing: 

* Public: Will act like a README for the general public of our company. Admins can alter this folder while everyone else can only read the contents.
* Staff: This will be the shared folder that all Staff can use. They are free to write and alter the contents within.

Once I created these folders and a simple test txt file within, I went to managing NTFS permissions.

I disabled inheritance to avoid any wonky rights issues and then gave the proper privileges to the staff and IT-admins respectively.

<img width="1346" height="1218" alt="IT-Admin Full Control" src="https://github.com/user-attachments/assets/0cff528a-5119-4f7b-b579-f91862734f4b" />

After this, I managed the share permissions and did the same thing for each folder before finally getting these folders shared.

<img width="1102" height="1014" alt="Share Permissions " src="https://github.com/user-attachments/assets/de12cdc5-780b-4190-bd30-1549e8fb5768" />

Now, I needed to test that these file shares were working.

So I logged into the Staff account on WKS01, checked if I could see the folders, and then checked to see if I had the proper permission levels for those folders as a Staff account. 

Everything worked perfectly. I was able to alter the txt file for the staff account while being unable to do so on the public folder.

<img width="1582" height="1288" alt="Staff File Altered" src="https://github.com/user-attachments/assets/529afe45-3647-44fa-a184-61f16dfbde91" />

<img width="1582" height="1288" alt="Unable to Alter Public" src="https://github.com/user-attachments/assets/e57087db-9d88-4514-9f1f-fc7e33c4fca1" />

### GPOs

The last part of Phase 1 is setting a couple GPOs and ensuring that works as well.

The first thing I did was alter the Default Domain Policy. I added a lockout policy so that users who have 5 invalid attempts would get locked out of the account for 30 minutes. This also gives me potential tickets that I can work on in Phase 2.

<img width="1582" height="1288" alt="Lockout GPO" src="https://github.com/user-attachments/assets/66e3a869-44df-4f3f-8629-df37a71a510e" />

Finally, I added one last GPO which mapped our shared drives. 

After adding in the GPO, using `gpupdate /force`, and signing out/in again, Phase 1 has finally been completed with 2 successfully mapped shared drives!

<img width="1646" height="910" alt="gpupdate" src="https://github.com/user-attachments/assets/e501d2e8-51e3-4d20-a265-cb252397a2da" />

<img width="1646" height="1144" alt="Shared Drives Mapping " src="https://github.com/user-attachments/assets/29a1b456-4068-4af7-bf6c-150b6d3d43d6" />

 

