### Level 1
> User: *leviathan1* ; Password: *PPIfmI1qsA*
##### Sau khi đăng nhập, thăm dò trong thư mục:
```
leviathan1@gibson:~$ ls -la
total 36
...
-r-sr-x---  1 leviathan2 leviathan1 15072 Oct  5  2023 check
...
leviathan1@gibson:~$ file check
check: setuid ELF 32-bit LSB executable, Intel 80386, version 1 (SYSV), dynamically linked, interpreter /lib/ld-linux.so.2, BuildID[sha1]=c7acb418cff514a706855be5cb59e985ca67b6d3, for GNU/Linux 3.2.0, not stripped
```
> file có SetUID, hay là khi thi hành file, ta sẽ có quyền hạn của chủ, hay trong trường hợp này là leviathan2.
##### Chạy file và sẽ thấy yêu cầu mật khẩu. Điều này có nghĩa là file check đang so sánh input của người dùng với một mật khẩu có sẵn. Sử dụng `ltrace` để xem chương trình vận hành: 
```
leviathan1@gibson:~$ ltrace ./check
__libc_start_main(0x80491e6, 1, 0xffffd694, 0 <unfinished ...>
printf("password: ")                                                                   ...
strcmp("1\n\n", "sex")                                                                                            = -1
puts("Wrong password, Good Bye ..."Wrong password, Good Bye ...
)                                                                              = 29
+++ exited (status 0) +++
```
> So sánh input xem liệu có trùng với từ khóa "sex" hay không.
##### Chạy lại chương trình với mật khẩu "sex", ta sẽ vào được shell của người dùng `leviathan2`:
```
$ whoami
leviathan2
$ cat /etc/leviathan_pass/leviathan2
mEh5PNl10e
```
-> Mật khẩu: `mEh5PNl10e`
