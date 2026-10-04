<a name="top"></a>

<p align="center"> 
  <a href="https://www.linkedin.com/in/clarence-fong" target="_blank">
    <img width="50" height="50" alt="LinkedIn" src="https://github.com/user-attachments/assets/7ab6e12b-ca8a-4aa6-8f10-79ba89d485b5" />
  </a>
  <a href="mailto:abc1230940@gmail.com">
    <img width="50" height="50" alt="Gmail" src="https://github.com/user-attachments/assets/4e0491ce-239c-413c-b433-74a5ff48f231" />
  </a>
  <a href="https://www.instagram.com/cyberbrexel?igsh=MXNxeWJid2VxZWxxaw%3D%3D&utm_source=qr" target="_blank">
    <img width="50" height="50" alt="Instagram Old" src="https://github.com/user-attachments/assets/62e4672b-d424-4489-a204-c301040905a3" />
  </a>
  <a href="https://discordapp.com/users/cyberbrexel" target="_blank">
    <img width="50" height="50" alt="Discord" src="https://github.com/user-attachments/assets/f76173ca-fad3-4390-bca1-5c2305bc748e" />
  </a>
  <a href="https://www.reddit.com/user/abc1230940/" target="_blank">
    <img width="50" height="50" alt="Reddit" src="https://github.com/user-attachments/assets/6e9bd985-dfa3-4349-b966-4cf49362bd61" />
  </a>
</p> <br>

<h2 align="center"> CyberDefenders Write-up: PacketMaze </h2>
<h2 id="scenario"> Scenario </h2>
<p> A company's internal server has been flagged for unusual network activity, with multiple outbound connections to an unknown external IP. Initial analysis suggests possible data exfiltration. Investigate the provided network logs to determine the source and method of compromise. </p>
<p align="right">(<a href="#top">Back to Top</a>)</p>

<h2 id="tools-used"> Tools Used </h2>
<ol>
  <li> Wireshark </li>
  <li> <a href="https://macvendorlookup.com/"> MAC Lookup </a> </li>
</ol>
<p align="right">(<a href="#top">Back to Top</a>)</p>

<h2 id="questions"> Questions </h2>
<p> <strong> 1. What is the FTP password? </strong> </p>
<p> First, we opened the pcap file in Wireshark and navigated to <strong>Tools -> Credentials </strong>. </p>
<img width="783" height="272" alt="Screenshot 2026-06-22 182441" src="https://github.com/user-attachments/assets/ab996ec8-9c2b-4c9f-8dbf-84054d75f465" />
<p> 3 packets revealed the same user "kali" via the FTP protocol. Therefore we selected 1 of them and followed the TCP stream of the packet. </p>
<img width="376" height="365" alt="Screenshot 2026-06-22 183005" src="https://github.com/user-attachments/assets/06431846-f7be-4550-96c1-3a9a45925b2f" />
<p> The FTP password of the user kali was <strong>AfricaCTF2021</strong>. </p> 
<br>
<p> <strong> 2. What is the IPv6 address of the DNS server used by 192.168.1.26? </strong></p>
<p> We can find the dns packets queried by 192.168.1.26 using display filter. </p>
<pre> <code lang="text"> dns && ip.src==192.168.1.26 </code> </pre>
<img width="1482" height="278" alt="Screenshot 2026-06-22 184637" src="https://github.com/user-attachments/assets/53928b92-0d67-41fc-98ff-394288e09f32" />
<p> 192.168.1.26 made DNS queries to the same destination. Therefore, we can check one of those packets. </p>
<img width="947" height="217" alt="Screenshot 2026-06-22 184940" src="https://github.com/user-attachments/assets/677110b1-4a03-469b-9a3d-b886d7522e55" />
<p> According to the detailed information of the packet, we identified that the Ipv4 and the Mac address of the DNS server was 192.168.1.10 and ca:0b:ad:ad:20:ba respectively. Therefore, we can find the Ipv6 of the DNS server using its MAC address in the display filter. </p>
<pre> <code lang="text"> ipv6 && eth.dst==ca:0b:ad:ad:20:ba </code> </pre>
<img width="942" height="188" alt="Screenshot 2026-06-22 185851" src="https://github.com/user-attachments/assets/f064bca9-c3fe-4e16-8b72-df0d75674c23" />
<p> We clicked one of those packet and looked at the ipv6 of the DNS server, which was <strong>fe80: c80b:adff:feaa:1db7</strong>. </p>
<br>
<p> <strong> 3. What domain is the user looking up in packet 15174? </strong> </p>
<img width="403" height="52" alt="Screenshot 2026-06-22 190358" src="https://github.com/user-attachments/assets/5639149a-1125-4d6b-93fb-260e3cf40fb9" />
<p> First, we navigated to <strong>Go -> Go to Packet...</strong> and entered 15174 then pressed Go to Packet. </p>
<img width="358" height="46" alt="Screenshot 2026-06-22 190430" src="https://github.com/user-attachments/assets/3853f8f9-b5df-472f-a3f6-443d984e37a6" />
<p> We located the DNS query for the domain <strong>www.7-zip.org</strong>. </p>
<br>
<p> <strong> 4. How many UDP packets were sent from 192.168.1.26 to 24.39.217.246? </strong> </p>
<p> We can find the total number of the udp packets using the display filter. </p>
<pre> <code lang="text"> udp && ip.src==192.168.1.26 && ip.dst==24.39.217.246 </code> </pre>
<img width="263" height="38" alt="Screenshot 2026-06-22 190920" src="https://github.com/user-attachments/assets/208e7ce4-6892-458d-869e-e671637ca80d" />
<p> The displayed packets were shown at the bottom right of the window and was <strong>10</strong>. </p>
<br>
<p> <strong> 5. What is the MAC address of the system under investigation in the PCAP file? </strong> </p>
<p> The MAC address of the investigated system can be found in one of the screenshot in Q2. </p>
<img width="947" height="217" alt="Screenshot 2026-06-22 184940" src="https://github.com/user-attachments/assets/677110b1-4a03-469b-9a3d-b886d7522e55" />
<p> The MAC address was <strong>c8:09:a8:57:47:93</strong>. </p>
<br>
<p> <strong> 6. What was the camera model name used to take picture 20210429_152157.jpg? </strong> </p>
<p> First, we can find the packet related to "20210429_152157.jpg" using the display filter. </p>
<pre> <code lang="text"> frame contains "20210429_152157.jpg" </code> </pre>
<img width="1206" height="197" alt="Screenshot 2026-06-22 192033" src="https://github.com/user-attachments/assets/5eac25fb-34ac-48e1-bf00-f85d646c07ec" />
<p> According to the result, the picture was uploaded from the investigated system 192.168.1.26 to the FTP server 192.168.1.20. We can navigate to <strong>File -> Export Objects -> FTP-DATA...</strong> to retrieve the picture. </p>
<img width="937" height="682" alt="Screenshot 2026-06-22 192728" src="https://github.com/user-attachments/assets/dbdaa396-bd93-486a-9f8a-0abbb43a9b69" />
<p> we saved the image and <strong>right clicked the image -> Properties -> Details</strong> and can find the Camera model. </p>
<img width="533" height="622" alt="Screenshot 2026-06-22 193055" src="https://github.com/user-attachments/assets/92125739-e15f-4569-88d4-e2c2d0fe613b" />
<p> The Camera model of this picture was <strong>LM-Q725K</strong>. </p>
<br>
<p> <strong> 7. What is the ephemeral public key provided by the server during the TLS handshake in the session with the session ID: da4a0000342e4b73459d7360b4bea971cc303ac18d29b99067e46d16cc07f4ff? </strong> </p>
<p> We can find the targeted TLS handshake packet using display filter. </p>
<pre> <code lang="text"> tls.handshake.session_id==da4a0000342e4b73459d7360b4bea971cc303ac18d29b99067e46d16cc07f4ff </code> </pre>
<img width="1648" height="177" alt="Screenshot 2026-06-22 193610" src="https://github.com/user-attachments/assets/d5e0e3eb-1cb7-48ca-afcf-cc5f7e485fcd" />
<p> We clicked the packet to find the ephemeral public key. </p>
<img width="1867" height="463" alt="Screenshot 2026-06-22 193742" src="https://github.com/user-attachments/assets/747181ef-5e74-4655-bfac-462c8ed80e58" />
<p> The public key was <strong>04edcc123af7b13e90ce101a31c2f996f471a7c8f48a1b81d765085f548059a550f3f4f62ca1f0e8f74d727053074a37bceb2cbdc7ce2a8994dcd76dd6834eefc5438c3b6da929321f3a1366bd14c877cc83e5d0731b7f80a6b80916efd4a23a4d</strong>. This key which was generated by the server was used for encryption for this specific session. </p>
<br>
<p> <strong> 8. What is the first TLS 1.3 client random that was used to establish a connection with protonmail.com? </strong> </p>
<p> We can find the targeted packet related to "protonmail.com" using the display filter. </p>
<pre> <code lang="text"> tls && frame contains "protonmail.com" </code> </pre>
<img width="1247" height="357" alt="Screenshot 2026-06-22 223337" src="https://github.com/user-attachments/assets/3ad4df69-c3b6-48ce-8d1b-e1e2fb5bbc01" />
<p> We clicked the first packet to find the client random. </p>
<img width="820" height="298" alt="Screenshot 2026-06-22 194652" src="https://github.com/user-attachments/assets/cd463dbd-d963-4272-850c-56f1eaeef867" />
<p> The client random was <strong>24e92513b97a0348f733d16996929a79be21b0b1400cd7e2862a732ce7775b70</strong>. The client random and server random were used for generation of a secret key to encrypt and decrypt the network traffic between the host and the domain protonmail.com. </p>
<br>
<p> <strong> 9. Which country is the manufacturer of the FTP server’s MAC address registered in? </strong> </p>
<p> Since we knew the IP address of the FTP server from the previous question, we can find the related packets using display filter. </p>
<pre> <code lang="text"> ftp && ip.addr==192.168.1.20 </code> </pre>
<img width="1425" height="682" alt="Screenshot 2026-06-22 195621" src="https://github.com/user-attachments/assets/74b276e2-a940-45f7-bf45-e4baa08f382e" />
<p> We can click the first packet to find the MAC address of the FTP server. </p>
<img width="945" height="130" alt="Screenshot 2026-06-22 195750" src="https://github.com/user-attachments/assets/f279c98b-a540-4f99-82cd-3e22f984a316" />
<p> The MAC address of the FTP server was 08:00:27:a6:1f:86. In order to find the manufacturer of the server, we can query <a href="https://macvendorlookup.com/"> MAC Address Lookup </a>. </p>
<img width="1236" height="790" alt="Screenshot 2026-06-22 200225" src="https://github.com/user-attachments/assets/7c533726-9b65-48f6-bbd8-c5121dc19672" />
<p> By searching the MAC address, the manufacturer of the FTP server was in <strong>United States</strong>. </p>
<br>
<p> <strong> 10. What time was a non-standard folder created on the FTP server on the 20th of April? </strong> </p>
<p> To view the actual contents, file transfers, or detailed directory listings from the FTP server, we can use display filter quering FTP-DATA (Port 20). </p>
<pre> <code lang="text"> ftp-data </code> </pre>
<img width="1380" height="678" alt="Screenshot 2026-06-22 201220" src="https://github.com/user-attachments/assets/21f871a5-f3ca-46f9-a23c-2058e769aeda" />
<p> We can click the first LIST packet showing the metadata of the files and directories. </p>
<img width="712" height="207" alt="Screenshot 2026-06-22 201159" src="https://github.com/user-attachments/assets/d4a555e3-12bc-4c53-91c7-dabf89147825" />
<p> The "non-standard" folder created should be ftp. The creation time was Apr 20 <strong>17:53</strong>. </p>
<br>
<p> <strong> 11. What URL was visited by the user and connected to the IP address 104.21.89.171? </strong> </p>
<p> To find the related HTTP packet, we can use the display filter. </p>
<pre> <code lang="text"> http && ip.dst==104.21.89.171 </code> </pre>
<img width="1013" height="180" alt="Screenshot 2026-06-22 201950" src="https://github.com/user-attachments/assets/bbcf5e1c-3f35-435c-bff7-ad5efa10073e" />
<p> We can follow the HTTP stream to find the URL visited to the targeted destination. </p>
<img width="1305" height="185" alt="Screenshot 2026-06-22 202042" src="https://github.com/user-attachments/assets/2bedee98-1e74-43b9-b0cb-bca380bee369" />
<p> The visited URL was <strong>hxxp[://]dfir[.]science/</strong>. </p>
<p align="right">(<a href="#top">Back to Top</a>)</p>

<h2 id="reference"> Reference </h2>
<p> <a href="https://cyberdefenders.org/blueteam-ctf-challenges/achievements/abc1230940/packetmaze/"> CyberDefenders: PacketMaze Lab </a> </p>
<p align="right">(<a href="#top">Back to Top</a>)</p>
