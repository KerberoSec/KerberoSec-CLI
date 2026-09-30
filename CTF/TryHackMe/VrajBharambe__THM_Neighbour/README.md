# TryHackMe Neighbour CTF Walkthrough/writeup
[TryHackMe:- Neighbour](https://tryhackme.com/room/neighbour) </br>
</br>We have to exploit IDOR(Insecure Direct Object Reference) vulnerability.

## Visit the IP

![Home](https://user-images.githubusercontent.com/52680483/202448554-df225f28-e6e7-4d43-bd84-473ee039405e.JPG)

As you can see we landed on login page and it is asking for credentials, which we don't have.</br>
At bottom it asks us to press <b>Ctrl + U</b>.

## Inspect/View-source 

![inspect](https://user-images.githubusercontent.com/52680483/202450489-e735ff22-eefd-4073-baff-0dba256193b6.png)

As we can see <b>Credentials</b> for <b>guest</b> login are given. </br>

## Login as Guest

![user](https://user-images.githubusercontent.com/52680483/202450958-c3db97f3-744b-40fc-b78e-86575bd03c63.JPG)

## Inspecting URL

````
http://10.10.***.***/profile.php?user=guest
````
As you can see the <b>get</b> parameter in URL is pointing toward <b>user=guest</b>, but what if we try to change the username in the URL.
As mentioned earlier this challenge is IDOR so let's try changing the <b>guest</b> user to <b>admin</b>. </br>

## Modifying the URL parameter
````
http://10.10.***.***/profile.php?user=admin
````
Lets type this into URL bar and hit <b>Enter</b>.</br>

![Admin](https://user-images.githubusercontent.com/52680483/202458518-e35bbbb2-1277-4dff-b646-36cb25947c54.png)

</br><b><i>BOOM!!!</i><b> We got the <b>Flag.<b>.

Thanks to [TryHackMe](https://tryhackme.com/) for providing such an awesome cybersecurity practicing platform :heart:.
