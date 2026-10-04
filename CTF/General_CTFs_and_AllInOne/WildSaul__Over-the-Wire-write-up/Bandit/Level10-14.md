# Level 10: 14
### Level 10
###### User: *bandit10* ; Password: *G7w8LIi6J3kTb8A7j9LgrywtEUlyyp6s*
```
ls
base64 -d -i data.txt 
```
###### file định dạng base64.
##### Key: `6zPeziLdR2RKNdNYFNb6nVCKzphlXHBM`

### Level 11
###### User: *bandit11* ; Password: *6zPeziLdR2RKNdNYFNb6nVCKzphlXHBM*
```
ls
cat data.txt
echo <thông tin trong data.txt> | tr ‘A-Za-z’ ‘N-ZA-Mn-za-m’
```
###### Đảo theo ROT 13
##### Key: `JVNBBFSmZwKKOP0XbFXOoW8chDz5yVRv`

### Level 12
###### User: *bandit12 ; Password: *JVNBBFSmZwKKOP0XbFXOoW8chDz5yVRv*
```
ls; mkdir /tmp/abc 
cp data.txt /tmp/abc/data.txt 
cd ../.. ; cd /tmp/abc
```
###### Tạo thư mục trong /tmp để thực hiện giải nén vì đây là file trong máy wargame cho phép ta thực thi các lệnh.
##### + Những bước dưới sẽ được thực hiện nhiều lần cho đến khi dạng của file là ASCII text.
```
file data.txt (xem dạng của file)
# nếu file là .gunzip
mv data.txt data.gz; gzip -d data.gz
# nếu file là .bzip2
mv data.txt data.bz (nếu dạng của file là bzip2) ; bzip2 -d data.gz
# nếu file là .tar 
mv data.txt data.tar (nếu dạng của file là tar) ; tar -xvf data.txt
ls; file data 
# lặp lại bước trên cho đến khi file có định dạng ASCII text.
cat data
```
##### Key: `wbWdlBxEir4CaE8LaPhauuOo6pwRmrDw`
