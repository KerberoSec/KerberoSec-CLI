<img width="942" height="686" alt="image" src="https://github.com/user-attachments/assets/f5e85eea-4b05-4bff-b7ad-ded5ce639c04" />

Link:https://play.picoctf.org/practice/challenge/766?category=5&page=1&search=

Dưới đây là Write-up (hướng dẫn giải) chi tiết và dễ hiểu cho thử thách **"Undo"** của picoCTF 2026, dựa trên chính những bước bạn đã thực hành.

OS: Kali Linux
---

# Write-up: Thử thách "Undo" (picoCTF)

### 1. Thông tin chung
* **Tên thử thách:** Undo
* **Thể loại:** General Skills (Kỹ năng chung)
* **Mục tiêu:** Đảo ngược (reverse) một chuỗi các phép biến đổi văn bản trong Linux để khôi phục lại Flag gốc.
* **Công cụ sử dụng:** Terminal (Netcat) và các lệnh xử lý văn bản cơ bản của Linux (`base64`, `rev`, `tr`).

### 2. Bắt đầu thử thách
Để bắt đầu, bạn mở Terminal và sử dụng lệnh `nc` (Netcat) để kết nối đến máy chủ của picoCTF theo địa chỉ được cung cấp:
```bash
nc foggy-cliff.picoctf.net 49269
```
*(Lưu ý: Port 55904 có thể thay đổi mỗi lần bạn khởi động lại Instance).*

Hệ thống sẽ chào mừng bạn và đưa ra lần lượt từng "Step". 
Tại mỗi bước, hệ thống sẽ cho bạn xem hình dáng hiện tại của Flag, một câu Gợi ý (Hint), và yêu cầu bạn nhập **câu lệnh Linux** để đảo ngược quá trình đó.

---

### 3. Chi tiết từng bước giải (Step-by-Step)

#### **Step 1: Giải mã Base64**
* **Current flag:** ` KTZvNHFycnE4LWZhMDFnQHplMHNmYTRlRy1nazNnLXRhMWZlcmlyRShTR1BicHZj`
* **Hint:** Base64 encoded the string. (Chuỗi đã được mã hóa Base64)
* **Câu lệnh giải quyết:** ```bash
    base64 -d
    ```
* **Giải thích:** `base64` là thuật toán mã hóa dữ liệu thành các ký tự văn bản cơ bản. Lệnh `base64 -d` (`-d` viết tắt của decode) sẽ báo cho hệ thống biết hãy dịch ngược chuỗi Base64 này trở lại dạng văn bản thô.

#### **Step 2: Đảo ngược chuỗi (Reverse)**
* **Current flag:** `)6o4qrrq8-fa01g@ze0sfa4eG-gk3g-ta1ferirE(SGPbpvc`
* **Hint:** Reversed the text. (Văn bản đã bị lật ngược)
* **Câu lệnh giải quyết:** ```bash
    rev
    ```
* **Giải thích:** Chuỗi lúc này đang bị viết ngược từ phải sang trái.
   Trong Linux, lệnh `rev` (reverse) có chức năng đọc các ký tự của một chuỗi và in chúng ra theo thứ tự ngược lại, đưa các ký tự về đúng vị trí ban đầu.

#### **Step 3: Thay thế ký tự (Dấu gạch ngang thành gạch dưới)**
* **Current flag:** `cvpbPGS(Eriref1at-g3kg-Ge4afs0ez@g10af-8qrrq4o6)`
* **Hint:** Replaced underscores with dashes. (Đã thay thế dấu gạch dưới `_` bằng dấu gạch ngang `-`)
* **Câu lệnh giải quyết:** ```bash
    tr '-' '_'
    ```
* **Giải thích:** Lệnh `tr` (translate) là một công cụ cực kỳ mạnh mẽ để thay thế hoặc xóa ký tự.
  Gợi ý cho biết người ra đề đã biến dấu `_` thành `-`, vì vậy chúng ta dùng lệnh `tr` để đảo ngược lại: Tìm mọi dấu gạch ngang `-` và biến nó thành dấu gạch dưới `_`.

#### **Step 4: Thay thế ký tự (Dấu ngoặc đơn thành ngoặc nhọn)**
* **Current flag:** `cvpbPGS(Eriref1at_g3kg_Ge4afs0ez@g10af_8qrrq4o6)`
* **Hint:** Replaced curly braces with parentheses. (Đã thay thế dấu ngoặc nhọn `{}` bằng dấu ngoặc đơn `()`)
* **Câu lệnh giải quyết:** ```bash
    tr '()' '{}'
    ```
* **Giải thích:** Định dạng chuẩn của Flag luôn là `picoCTF{...}`.
   Gợi ý cho biết cặp ngoặc nhọn đã bị đổi thành ngoặc đơn. Ta tiếp tục dùng lệnh `tr` để yêu cầu hệ thống biến dấu `(` thành `{` và dấu `)` thành `}`.

#### **Step 5: Giải mã ROT13**
* **Current flag:** `cvpbPGS{Eriref1at_g3kg_Ge4afs0ez@g10af_8qrrq4o6}`
* **Hint:** Applied ROT13 to letters. (Đã áp dụng mã hóa ROT13 cho các chữ cái)
* **Câu lệnh giải quyết:** ```bash

### 4. Kết quả

Sau khi nhập thành công lệnh ở Step 5 

Hoặc sử dụng [ROT13](https://rot13.com/) để decode 

Hệ thống sẽ in ra thông báo `Correct!` và hiển thị cho bạn dòng **Flag cuối cùng** (Bắt đầu bằng `picoCTF{...}`).

Flag hiển thị : >>> picoCTF{Revers1ng_t3xt_Tr4nsf0rm@t10ns_8deed4b6}

<img width="1013" height="715" alt="image" src="https://github.com/user-attachments/assets/bf86697e-9343-4ead-a8a0-156d11830730" />
 
<img width="1008" height="898" alt="image" src="https://github.com/user-attachments/assets/6a163b8e-3ba4-47ff-8eae-a3ef7f1f8005" />
 
* **Giải thích:** ROT13 là một dạng mã hóa thay thế đơn giản, trong đó mỗi chữ cái bị dịch chuyển đi 13 vị trí trong bảng chữ cái (chữ A thành N, B thành O...).
  Vì bảng chữ cái tiếng Anh có 26 chữ, nên việc "dịch 13 bước" để mã hóa hay giải mã là **hoàn toàn giống nhau**. 
  Lệnh `tr` ở trên báo cho hệ thống ánh xạ lại toàn bộ bảng chữ cái: Nửa đầu (`a-m`, `A-M`) đổi thành nửa sau (`n-z`, `N-Z`) và ngược lại.
  Các con số và ký tự đặc biệt (`{`, `}`, `_`, `@`) không nằm trong điều kiện này nên được giữ nguyên.

  #### Cảm ơn các bạn đã đọc bài viết của tôi . Chúc các bạn giải thử thách thành công . Wish you have all the best!!!!!!!!!!!

