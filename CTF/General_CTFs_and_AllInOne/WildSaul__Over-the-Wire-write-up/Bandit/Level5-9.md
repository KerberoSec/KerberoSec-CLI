# LEVEL 5: 9
### Level 5
###### User: *bandit5* ; Password: *lrIWWI6bB37kxfiCQZqUdOIYfr6eEeqR*
```
ls; cd inhere
find /home/bandit5/inhere -type f -size 1033c -exec file{}; | grep -E "ASCII text|UTF-8 text"
cat maybehere07/.file2
```
###### dòng lệnh 2 được dùng để tìm file kích cỡ 1033 bytes, không thể chạy (un-executable) và có thể đọc được (human-readable)

##### Key: `P4L4vucdmLnm8I7Vl7jG1ApGSfjYKqJU`

### Level 6
###### User: *bandit6* ; Password: *P4L4vucdmLnm8I7Vl7jG1ApGSfjYKqJU*
```
find / -type f -user bandit7 -group bandit6 -size 33c 2>/dev/null
cat /var/lib/dpkg/info/bandit7.password
```
###### tìm file sở hữu bởi user bandit7, group bandit6 và có size 33 bytes.
###### `2>/dev/null`: không hiện lỗi Permission Denied.
##### Key: `z7WtoNQU2XfjmMtWA8u5rN4vzqu4v99S`

### Level 7
###### User: *bandit7* ; Password: *z7WtoNQU2XfjmMtWA8u5rN4vzqu4v99S*
```
ls; cat data.txt | grep “millionth” 
```
###### key nằm cạnh từ ‘millionth’
##### Key: `TESKZC0XvTetK0S9xNwm25STk5iWrBvP`

### Level 8
###### User: *bandit8* ; Password: *TESKZC0XvTetK0S9xNwm25STk5iWrBvP*
```
sort data.txt | uniq -u
```
###### Tìm dòng không trùng lặp trong file.
##### Key:  `EN632PlfYiZbn3PhVK3XOGSlNInNE00t`

### Level 9
###### User: *bandit9* ; Password: *EN632PlfYiZbn3PhVK3XOGSlNInNE00t*
```
ls
strings data.txt | grep -P '={3,}.*[[:print:]]' 
```
###### tìm key trong file khi cạnh key là các dấu ‘=’.
##### Key: `G7w8LIi6J3kTb8A7j9LgrywtEUlyyp6s`
