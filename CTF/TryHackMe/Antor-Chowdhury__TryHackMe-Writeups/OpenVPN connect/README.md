# How to connect TryHackMe labs on main machine with OpenVPN

First thing we have to do is to click the profile icon and then click on Access.Then click on Machines and select the VPN Server which is closest to your region (for me it was IN-Regular-1). 

If we check the Access Details we can see the Server Status is checked but we are not connected yet. Now let's download the chosen VPN Server Configuration file. 

After that on the downloading folder we will write this command : 

`sudo openvpn Dark.SouL.ovpn`

Here the downloaded file will have your **TryHackMe account name.ovpn** 

After executing the command if we get something like `Initialization Sequence Completed` that means we are connected to the vpn. Now refresh the tryhackme page and you will see u are connected. If it still shows **Not connected** then to check the connection we can type `ifconfig` in the termianl and there we can see a new interface named **tun0** . Or else we can run a machine in *TryHackMe* and paste the ip address in the web-browser to see the connection. 