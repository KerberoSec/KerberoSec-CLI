# packer
##### Tags: `Forensics` `browser_webshell_solvable` `checksum` `grep`
### DESCRIPTION
Reverse this linux executable? [binary](https://artifacts.picoctf.net/c_titan/103/out)
##### Kiểm tra file:
```
$ file Downloads/out              
Downloads/out: ELF 64-bit LSB executable, x86-64, version 1 (GNU/Linux), statically linked, no section header
$ chmod +x Downloads/out
$ ./Downloads/out
Enter the password to unlock this file: 
```
> Như vậy chương trình yêu cầu nhập đúng mật khẩu để ra được kết quả. Nhìn vào kết quả khi kiểm tra, để ý thấy file không có `section head` như code, dữ liệu,... -> Có thể suy ra file đã bị 'nén' một số thông tin không cần thiết để giảm kích thước của file.
#### Kiểm tra file với text editor, với từ khóa 'Info':
```
...
�$Info: This file is packed with the UPX executable packer http://upx.sf.net $
�$Id: UPX 3.95 Copyright (C) 1996-2018 the UPX Team. All Rights Reserved. $
...
```
> File được nén bởi UPX, một packer chuyên dụng để nén các ứng dụng, file thực thi:
##### Giải nén:
```
$ upx -d Downloads/out
```
> Sử dụng text editor để tìm với từ khóa 'flag':
```
�������Password correct, please see flag: 7069636f4354467b5539585f556e5034636b314e365f42316e34526933535f36666639363465667d�Access denied�xeon_phi�haswell�../csu/libc-start.c�FATAL: kernel too old
```
##### Chuyển từ hex về text -> Lấy flag thành công!
