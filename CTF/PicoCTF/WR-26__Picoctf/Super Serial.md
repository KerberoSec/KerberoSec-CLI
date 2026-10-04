<img width="921" height="786" alt="image" src="https://github.com/user-attachments/assets/e88e00a5-f302-4250-87af-108831af440c" />

Link : https://play.picoctf.org/practice/challenge/180?category=1&page=5&search=

# Writeup: Super Serial: picoCTF (Web Exploitation)

**Mục tiêu:** Lấy được cờ (flag) nằm ở tệp `../flag` trên server.

**Kỹ thuật cốt lõi:** Source Code Disclosure (Lộ mã nguồn) & PHP Insecure Deserialization (Giải mã vạch dữ liệu không an toàn).

---

### Bước 1: Thu thập thông tin (Reconnaissance)

Khi truy cập vào trang web, chúng ta nhận được một thông báo lỗi từ SQLite: `Fatal error: Uncaught Exception: Unable to open database...`. 
Đây thực chất là một "cú lừa" (rabbit hole) để đánh lạc hướng, nhưng nó cũng vô tình cho ta biết ứng dụng được viết bằng PHP và thư mục gốc là `/var/www/html/`.

Kiểm tra file điều hướng bot tìm kiếm `robots.txt` bằng cách truy cập `http://wily-courier.picoctf.net:62632/robots.txt`, ta thấy nội dung sau:

<img width="681" height="201" alt="image" src="https://github.com/user-attachments/assets/1b6051d4-1218-47ff-9b3d-f0e7f80f0da7" />

```text

User-agent: *

Disallow: /admin.phps

```

File `admin.phps` trả về lỗi 404 (Không tìm thấy), nhưng nó gợi ý cho chúng ta một tính năng của server: **Đuôi mở rộng `.phps` (PHP Source)**. Khi truy cập một file với đuôi `.phps`, server sẽ không thực thi đoạn code đó mà sẽ in toàn bộ mã nguồn ra màn hình.

---

### Bước 2: Đọc mã nguồn (Source Code Disclosure)

Áp dụng thủ thuật `.phps` vào trang chủ, ta truy cập `http://wily-courier.picoctf.net:62632/index.phps` và đọc được mã nguồn. 

<img width="1746" height="941" alt="image" src="https://github.com/user-attachments/assets/385309c8-fa1a-4a91-9a18-ed1ef6df0849" />

Trong `index.phps`, ta phát hiện ra trang web có gọi đến 2 file khác:

* `require_once("cookie.php");`
* 
* `header("Location: authentication.php");`

Tiếp tục sử dụng đuôi `.phps` để tải về mã nguồn của `cookie.phps` và `authentication.phps`. Lúc này, ta đã nắm trong tay toàn bộ logic của ứng dụng.

<img width="1196" height="955" alt="image" src="https://github.com/user-attachments/assets/633147b5-435d-4084-83e7-27cfb315040b" />

<img width="1866" height="947" alt="image" src="https://github.com/user-attachments/assets/77ff6d6b-f10e-47c5-84da-5b51e43bcc29" />

---

### Bước 3: Phân tích Lỗ hổng (Vulnerability Analysis)

Đọc file `cookie.php`, ta thấy cách server xử lý phiên đăng nhập (Cookie) cực kỳ thiếu an toàn:

```php

if(isset($_COOKIE["login"])){

	try{

		$perm = unserialize(base64_decode(urldecode($_COOKIE["login"])));

		$g = $perm->is_guest();

		$a = $perm->is_admin();

	}

	catch(Error $e){

		die("Deserialization error. ".$perm);

	}

}

```
* **Lỗ hổng:** Ứng dụng lấy trực tiếp giá trị từ cookie `login`, sau đó giải mã (URL Decode -> Base64 Decode) và đưa thẳng vào hàm `unserialize()` mà không hề kiểm tra tính hợp lệ.
* **Điểm mấu chốt (Trigger):** Nếu việc khởi tạo thất bại (ví dụ: đối tượng giải mã không có hàm `is_guest()`), nó sẽ văng ra lỗi (Error). Khối `catch` sẽ bắt lỗi này và chạy hàm `die("... " . $perm);`. Việc nối chuỗi `.` với một Object (`$perm`) sẽ ép Object đó biến thành một chuỗi String.

Đọc file `authentication.php`, ta tìm thấy một "vũ khí" (Gadget) hoàn hảo: class `access_log`.

```php
class access_log {
	public $log_file;

	function __construct($lf) { $this->log_file = $lf; }

	function __toString() { return $this->read_log(); }

	function read_log() { return file_get_contents($this->log_file); }
}
```
* **Magic Method `__toString()`:** Hàm này sẽ tự động chạy khi Object bị ép kiểu thành String (chính là lúc khối `catch` ở file `cookie.php` hoạt động).
  
* Hàm này gọi tiếp `read_log()`, sử dụng `file_get_contents($this->log_file);`. Nếu ta kiểm soát được biến `$log_file` thành `../flag`, ta sẽ đọc được cờ!

---

### Bước 4: Chế tạo Payload (Exploitation)

Mục tiêu là tạo ra một Object của class `access_log` với thuộc tính `$log_file` trỏ tới file cờ. Ta viết một script PHP nhỏ ở máy local (hoặc dùng các trang test PHP online) để tạo Payload:

```php

<?php

class access_log {

    public $log_file = "../flag";

}

// Khởi tạo Object

$payload = new access_log();

// Mã hóa theo đúng công thức server mong đợi: Serialize -> Base64 -> URLEncode

$cookie_value = urlencode(base64_encode(serialize($payload)));

echo $cookie_value;

?>

```

Chạy đoạn code trên, ta thu được Payload:
`TzoxMDoiYWNjZXNzX2xvZyI6MTp7czo4OiJsb2dfZmlsZSI7czo3OiIuLi9mbGFnIjt9`

---

### Bước 5: Tấn công và "Cú lừa Incomplete Object"

Bây giờ ta cần tiêm Payload này vào Cookie. Tuy nhiên, có một cái bẫy rất tinh vi ở đây: **Ta phải gửi Cookie này ở trang nào?**

* **Thất bại (Incomplete Object):** Nếu ta sửa cookie `login` và tải lại trang `index.php`, ta sẽ dính lỗi Fatal Error *"The script tried to execute a method or access a property of an incomplete object"*. Lý do là `index.php` gọi `cookie.php` (và hàm `unserialize`) **trước khi** nó biết class `access_log` là gì. PHP không thể tạo lại đối tượng vì class chưa được định nghĩa.

* **Thành công:** Ta phải truy cập vào trang `authentication.php`. Hãy nhìn vào mã nguồn của nó:

    ```php

    class access_log { ... }

    require_once("cookie.php");

    ```

  Trang này định nghĩa class `access_log` **xong rồi** mới gọi file `cookie.php`. Do đó, hàm `unserialize()` sẽ hiểu và tạo ra được Object độc hại.

**Thực thi:**

1.  Sử dụng Developer Tools (F12) trên trình duyệt, vào tab **Application** (Chrome) hoặc **Storage** (Firefox).

2.  Đi tới phần **Cookies**.

3.  Tạo hoặc sửa cookie có tên là **`login`**.

4.  Thay giá trị của cookie này bằng chuỗi Payload vừa tạo: `TzoxMDoiYWNjZXNzX2xvZyI6MTp7czo4OiJsb2dfZmlsZSI7czo3OiIuLi9mbGFnIjt9`.

5.  Truy cập thẳng vào đường dẫn: `http://wily-courier.picoctf.net:62632/authentication.php`.

<img width="1855" height="932" alt="image" src="https://github.com/user-attachments/assets/2cdf7cb1-87a3-4ace-a712-cbf4eb1b0bda" />

**Kết quả:**

Server kích hoạt lỗ hổng, cố gắng in lỗi nối với Object và trả về nội dung của file `../flag` lên màn hình trình duyệt:

<img width="1838" height="676" alt="image" src="https://github.com/user-attachments/assets/1394048e-3da5-4115-a551-b11e7b8dfe44" />

`Deserialization error. picoCTF{1_c4nn0t_s33_y0u_2fba20fa}`. Thử thách được giải quyết!

Cảm ơn tất cả mọi người đã đọc bài của mình . Chúc các bạn thành công . Wish you have all the best !!!

