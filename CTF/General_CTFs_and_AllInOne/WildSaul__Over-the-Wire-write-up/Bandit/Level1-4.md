# Level 0: 4
```
Độ khó: 1/10
Level: 34
Kết nối: SSH
Host: bandit.labs.overthewire.org
Port: 2220
```
### Level 0
###### User: *bandit0* ; Password: *bandit0*
```
ssh bandit0@bandit.labs.overthewire.org -p 2220 (sau khi được prompt mật khẩu thì nhập bandit0)
ls
cat readme
```
##### Key: `NH2SXQwcBdpmTEzi3bvBHMM9H66vVXjL`

### Level 1
###### User: *bandit1* ; Password: *NH2SXQwcBdpmTEzi3bvBHMM9H66vVXjL*
```
ssh...
ls
cat ./- 
```
###### ./- : file có ký tự đặc biệt "-"
##### Key: `rRGizSaX8Mk1RTb1CNQoXTcYZWU6lgzi`

### Level 2
###### User: *bandit2* ; Password: _rRGizSaX8Mk1RTb1CNQoXTcYZWU6lgzi_
```
ssh...
ls
cat "spaces in this file name"
```
###### Sử dụng dấu "" cho file vì tên file có dấu cách ở giữa.
##### Key: `aBZ0W5EmUfAf7kHTQeOwd8bauFJ2lAiG`

### Level 3
###### User: *bandit3* ; Password: *aBZ0W5EmUfAf7kHTQeOwd8bauFJ2lAiG*
```
ssh...
ls; cd inhere
ls -la
cat .hidden
```
###### Sử dụng `ls -la` để hiện tất cả các file bao gồm file ẩn.
##### Key: *2EW7BBsr6aMMoJ2HjW067dm8EgX26xNe*

### Level 4
###### User: *bandit4* ; Password: *2EW7BBsr6aMMoJ2HjW067dm8EgX26xNe*
```
ssh...
ls; cd inhere
file ./-file*
cat ./-file07
```
###### file./-file*: liệt kê loại của tất cả các file bắt đầu bằng file. Kết quả cho người đọc được là: `ASCII text`
##### Key: *lrIWWI6bB37kxfiCQZqUdOIYfr6eEeqR*

