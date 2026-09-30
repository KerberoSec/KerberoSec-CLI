Get Connected﻿

To connect to our network, you need to download the OpenVPN GUI open-source application and import your VPN configuration file.  

On TryHackMe you can deploy virtual machines that you can use to hack into and learn from. However, to access these machines you need to be connected to our network. You do this through using a VPN (similar to how you would connect to a work or school computer from home).

This VPN should be connected from your hacking machine, directly to the THM network. If your machine is a virtual machine, run the steps for the virtual machine, not the host machine.

Firstly, go to the [access](https://tryhackme.com/access) page and download your VPN configuration file. Then read the task that is suited for your computer.

---

![](https://i.imgur.com/Qthg4bL.png)  

OpenVPN: Windows

﻿    1. [Download](https://openvpn.net/client-connect-vpn-for-windows/) the OpenVPN GUI application.

    2. Install the OpenVPN GUI application. Then open the installer file and follow the setup wizard.

![](https://i.imgur.com/gc5LHiN.png)

3. Open and run the OpenVPN GUI application as Administrator.

![](https://i.imgur.com/Ewx3C6r.png)

4. The application will start running in the system tray. It's at the bottom of your screen, near the clock. Right click on the application and click **Import File**.

    ![](https://i.imgur.com/p5QIRY5.png)

5. Select the configuration file you downloaded earlier (download from the [access](https://tryhackme.com/access) page)

6. Now right click on the application again, select your file and click **Connect**

    ![](https://i.imgur.com/jEhge7c.png)

And that's it! You should be successfully connected. To disconnect, follow step 6 and click **disconnect**.

---
![](https://i.imgur.com/P3iTKAy.png)  
OpenVPN: MacOS  

﻿    1. [Download](https://openvpn.net/downloads/openvpn-connect-v2-macos.dmg) OpenVPN for MacOS.

    2. Install the OpenVPN GUI application, by opening the dmg file and following the setup wizard.

        ![](https://i.imgur.com/N9X8xLH.png)

    3. Open and run the OpenVPN GUI application.

    4. The application will start running and appear in your top bar. Right click on the application and click **Import File ->**     **Local file.**

        ![](https://i.imgur.com/swsESJP.png)

    5. Select the configuration file you downloaded earlier (download from your [access](https://tryhackme.com/access) page).

    6. Now right click on the application again, select your file and click **connect**.

        ![](https://i.imgur.com/oAbgfVz.png)

    And that's it! You should be successfully connected! To disconnected, follow step 6 and click **disconnect.**

---
![](https://i.imgur.com/wHi05Do.png)  

OpenVPN: Linux  

﻿   1. Download OpenVPN by running the following command in your terminal: `sudo apt install openvpn`

2. Locate the **full path** to your VPN configuration file (download from the [access](https://tryhackme.com/access) page), normally in your Downloads folder.

3. Use your OpenVPN file with the following command: `sudo openvpn /path-to-file/file-name.ovpn`

And that's it! You should be successfully connected.

---
If you are unable to connect to our network through the VPN, you can deploy a Kali-based AttackBox machine and control it in your browser. The AttackBox button is available in the room you are in and located on the top-right side.  You can then access all TryHackMe machines through that machine. Free users can deploy the machine for 1 hour a day, [subscribers](https://tryhackme.com/why-subscribe) have unlimited access.

![Image showing how to start the AttackBox.](https://tryhackme-images.s3.amazonaws.com/user-uploads/5fc2847e1bbebc03aa89fbf2/room-content/d83965ad832b44e8dcca6b5bdb8d847f.png)  

An in-browser window will then appear, wait for your machine to load, and you will be able to access machines through the Kali Linux machine without being connected to a VPN.

---
You can check if you're connected to our network by a green tick next to connected on the Network Information table on the [access](https://tryhackme.com/access) page. 

Now verify that you're connected by deploying a machine and accessing its website. Deploy the machine on this task (**it will take a few minutes to boot**). Go to [http://MACHINE_IP](http://MACHINE_IP): can you see a website?

What is the flag displayed on the deployed machine's website?

**flag: `flag{connection_verified}`**