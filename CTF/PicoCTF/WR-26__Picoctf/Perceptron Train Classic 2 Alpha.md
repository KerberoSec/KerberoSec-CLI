<img width="782" height="707" alt="image" src="https://github.com/user-attachments/assets/1ab7b88b-f360-4866-8a4d-9d0fbdb8bfa2" />

# WRITEUP: Perceptron Train Hole in Middle

```
┌─────────────────── ─────────────────────────────────────────────────┐
│  Challenge : Perceptron Train Hole in Middle                        │
│  Category  : Artificial Intelligence / AI Foundations I             │
│  Difficulty: Easy                                                   │
│  Author    : LT 'syreal' Jones                                      │
│  Flag      : academy{h0l3_1n_m1ddl3_unl34rn4bl3_l1n34rly_5af09722}  │
│  Method    : Reverse-engineer server logic → offline sweep          │
└─────────────────────────────────────────────────────────────────────┘
```

---

## MỤC LỤC
1. [Tổng quan đề bài](#1-tổng-quan-đề-bài)
2. [Lý thuyết nền: Perceptron & tính phân tách tuyến tính](#2-lý-thuyết-nền)
3. [Bước 1: Recon giao diện web](#3-bước-1--recon-giao-diện-web)
4. [Bước 2: Phát hiện logic nằm ở server](#4-bước-2--phát-hiện-logic-nằm-ở-server)
5. [Bước 3: Lấy config.json: dataset & tham số](#5-bước-3--lấy-configjson)
6. [Bước 4: Probe /train để bẻ khóa cơ chế update](#6-bước-4--probe-train)
7. [Bước 5: Xây simulator chính xác 100%](#7-bước-5--xây-simulator)
8. [Bước 6: Sweep toàn bộ learning rate](#8-bước-6--sweep-toàn-bộ-learning-rate)
9. [Bước 7: Submit và nhận flag](#9-bước-7--submit-và-nhận-flag)
10. [Vì sao solution này tối ưu (vs chơi slider)](#10-vì-sao-solution-này-tối-ưu)
11. [Toàn bộ exploit script gộp lại](#11-script-hoàn-chỉnh)

---

## 1. Tổng quan đề bài

> Watch a perceptron learn in real time on a "hole in the middle" pattern:
> positive points surround one negative center point. The classic perceptron
> update rule still applies (only misclassified points trigger updates, with
> no weight decay), but this shape is not linearly separable by a single line.
> **Reach 88.9% accuracy to reveal the flag.**

Giao diện web cung cấp:
- Slider chọn **learning rate** trong đoạn `[0.02, 20.0]`, step `0.01`
- Nút **Run training** → mô hình train và vẽ decision boundary
- **16 bước** update mỗi lần chạy
- Đạt ≥ **88.9%** (8/9 điểm đúng) → hiện flag

Hints từ đề:
1. 16 updates/run; điểm phân loại ĐÚNG không đổi model
2. Dải lr rất rộng (0.02→20): giá trị cao làm boundary vũ dữ dội
3. Một đường thẳng KHÔNG thể cô lập điểm trung tâm → 8/9 là trần lý thuyết
4. Dùng slider quét dải và quan sát boundary

**Nhận định chiến lược:** chơi slider thủ công = thử-sai ngẫu nhiên. Thay vào đó,
reverse toàn bộ logic về máy mình rồi **quét vét** mọi giá trị lr → chắc chắn 100%.

---

## 2. Lý thuyết nền

### 2.1 Perceptron cổ điển

Mô hình dự đoán:

```
pred(x) = 1  nếu  w₁x₁ + w₂x₂ + b ≥ 0
        = 0  nếu  ngược lại
```

Quy tắc cập nhật: **chỉ áp dụng cho điểm bị phân loại SAI**:

```
err = label − pred            (∈ {−1, 0, +1})
wᵢ ← wᵢ + lr · err · xᵢ
b  ← b  + lr · err
```

Không weight decay, không momentum: đúng chữ "classic rule" như đề.

### 2.2 Vì sao 88.9% là TRẦN, không phải mục tiêu may rủi

Dataset: 8 điểm **dương** xếp vòng tròn bán kính ~3 quanh gốc tọa độ,
1 điểm **âm** duy nhất tại **tâm (0,0)**.

Để đạt 9/9 cần một đường thẳng tách `{vòng tròn}` khỏi `{tâm}`: điều **bất khả** vì tâm nằm trong bao lồi của vòng tròn:

```
        + (0,3)
   +           +
(-3,0)   ⊗(0,0)   (3,0)      ⊗ phải nằm khác phía đường thẳng
   +           +               so với TẤT CẢ dấu + → vô nghiệm
        + (0,-3)
```

Trần đạt được = 8/9 ≈ 88.9%, gồm 2 kiểu cấu hình:
- **Kiểu A:** mọi điểm đều dự đoán dương → 8 ring đúng, tâm sai (đường thẳng
  đẩy hoàn toàn ra ngoài vùng dữ liệu, ví dụ b rất lớn)
- **Kiểu B:** tâm đúng phía âm nhưng kéo theo 1 điểm ring sai cùng phía → 7+1 = 8 đúng

→ Bất kỳ lr nào khiến model sau 16 bước rơi vào một trong hai cấu hình trên đều thắng.

---

## 3. Bước 1: Recon giao diện web

```bash
curl -s --max-time 20 "http://aureolin-pixie.cylabacademy.net:53971/" -o /tmp/perceptron.html
```

HTML cho thấy các thành phần chính:

```html
<input type="range" id="lr-range" min="0.02" max="20.0" step="0.01" value="0.02" />
<button id="run-btn">Run training</button>
<canvas id="plot" width="520" height="520"></canvas>
<table> ... training log ... </table>
<script src="app.js" defer></script>
```

**Kết luận bước này:** chỉ có 1 file JS chứa toàn bộ hành vi → tải về đọc.

---

## 4. Bước 2: Phát hiện logic nằm ở server

```bash
curl -s --max-time 20 "http://aureolin-pixie.cylabacademy.net:53971/app.js" -o app.js
```

Đọc `app.js` (308 dòng), 2 phát hiện then chốt:

### Phát hiện 1: Dataset & tham số nạp từ API:
```js
async function loadConfig() {
    const res = await fetch("/config.json");
    state.points = data.points;          // ← dataset ở server!
    state.maxSteps = data.maxSteps;
    state.lrMin = data.lrMin;
    state.lrMax = data.lrMax;
    state.initialModel = data.initialModel || null;
}
```

### Phát hiện 2: Training chạy ở SERVER, client chỉ gửi lr:
```js
const res = await fetch("/train", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ learningRate: lr }),   // ← chỉ số duy nhất ta kiểm soát
});
const data = await res.json();
state.history = data.history || [];    // server trả NGUYÊN lịch sử train
state.pendingFlag = data.flag || null; // flag trả về trong JSON nếu success!
```

**Ý nghĩa chiến lược:**
- Không cần browser/slider: mọi thứ làm được bằng 2 HTTP call
- Server trả `history` đầy đủ → dùng nó để **verify simulator local khớp từng bước**
- Flag nằm ngay trong response JSON → không cần vẽ canvas

---

## 5. Bước 3: Lấy config.json

```bash
curl -s "http://aureolin-pixie.cylabacademy.net:53971/config.json" | python3 -m json.tool
```

```json
{
  "points": [
    [0, 3, 1], [2, 2, 1], [3, 0, 1],
    [2, -2, 1], [0, -3, 1], [-2, -2, 1],
    [-3, 0, 1], [-2, 2, 1],
    [0, 0, 0]          // ← điểm âm duy nhất, tại TÂM
  ],
  "maxSteps": 16,
  "lrMin": 0.02,
  "lrMax": 20.0,
  "successThreshold": 0.8888888888888888,
  "initialModel": {
    "weights": [1.0, -1.0],
    "bias": 0.0,
    "accuracy": 0.5555555555555556
  }
}
```

Format điểm: `[x, y, label]` với label ∈ {1=dương, 0=âm}.

Model khởi tạo: `w=(1, −1)`, `b=0` → accuracy đầu vào 5/9.

---

## 6. Bước 4: Probe /train

Còn 2 điều chưa biết: **thứ tự duyệt mẫu** và **công thức update thực tế**
(có thể server dùng biến thể). Gửi 1 probe với lr nhỏ để soi lịch sử:

```bash
curl -s -X POST "http://.../train" \
     -H "Content-Type: application/json" \
     -d '{"learningRate": 0.05}' | python3 -m json.tool
```

Response (rút gọn):
```
step1  point=[0,3,1]   pred=0 err=1  w=(1.00,-0.85) b=0.05
step2  point=[2,2,1]   pred=1 err=0  w=(1.00,-0.85) b=0.05  ← không đổi
step3  point=[3,0,1]   pred=1 err=0  w=(1.00,-0.85) b=0.05
step4  point=[2,-2,1]  pred=1 err=0  w=(1.00,-0.85) b=0.05
step5  point=[0,-3,1]  pred=1 err=0  w=(1.00,-0.85) b=0.05
step6  point=[-2,-2,1] pred=0 err=1  w=(0.90,-0.95) b=0.10
...
accuracy: 44.4%  success: False  history: 16 entries
```

### Giải mã ngược từng con số:

**Step 1**: khởi tạo `w=(1,−1), b=0`, điểm `[0, 3]`:
```
activation = 1·0 + (−1)·3 + 0 = −3  < 0  → pred=0, label=1
err = 1−0 = 1
w₂ = −1 + 0.05·1·3 = −0.85  ✓ khớp server
b  = 0 + 0.05·1·1 =  0.05   ✓ khớp server
```

**Step 6**: điểm `[−2, −2]` với `w=(1,−0.85), b=0.05`:
```
activation = 1·(−2) + (−0.85)(−2) + 0.05 = −0.25 < 0 → pred=0, err=1
w₁ = 1 + 0.05·(−2) = 0.90  ✓
w₂ = −0.85 + 0.05·(−2) = −0.95  ✓
b  = 0.05 + 0.05 = 0.10  ✓
```

**Thứ tự duyệt:** step k dùng `points[(k−1) % 9]`: tuần tự, vòng lặp qua epoch.
16 bước = 1 epoch đủ (9) + 7 bước đầu epoch 2.

**Log gồm cả bước KHÔNG update** (err=0 vẫn ghi history).

→ Cơ chế xác định 100%:
```python
for step in 1..16:
    x,y,label = points[(step-1) % 9]
    pred = 1 if w1*x + w2*y + b >= 0 else 0
    err  = label - pred
    if err != 0:
        w1 += lr*err*x ; w2 += lr*err*y ; b += lr*err
```

⚠️ Chi tiết tinh vi: điều kiện biên là **≥ 0 → pred 1** (activation = 0 tính
là dương). Sai 1 ký hiệu này là sweep lệch hoàn toàn với server.

---

## 7. Bước 5: Xây simulator

```python
points = [[0,3,1],[2,2,1],[3,0,1],[2,-2,1],[0,-3,1],
          [-2,-2,1],[-3,0,1],[-2,2,1],[0,0,0]]

def train(lr):
    w = [1.0, -1.0]; b = 0.0                 # từ initialModel
    for step in range(1, 17):                # maxSteps
        x, y, lab = points[(step-1) % 9]
        pred = 1 if w[0]*x + w[1]*y + b >= 0 else 0
        err = lab - pred
        if err:
            w[0] += lr*err*x
            w[1] += lr*err*y
            b     += lr*err
    correct = sum((1 if w[0]*px + w[1]*py + b >= 0 else 0) == pl
                  for px, py, pl in points)
    return correct                            # số điểm đúng cuối run
```

**Validate với probe lr=0.05:** simulator cho cùng weights từng bước như
history server trả → tin cậy tuyệt đối.

*(Python float = IEEE double giống JS Number → không lệch precision.)*

---

## 8. Bước 6: Sweep toàn bộ learning rate

Quét VÉT toàn bộ dải hợp lệ theo step của UI (0.01):

```python
winners = []
lr = 0.02
while lr <= 20.0:
    if train(lr) >= 8:
        winners.append(round(lr, 2))
    lr = round(lr + 0.01, 2)

print(len(winners))   # 1949
print(winners[:10])   # [0.14, 0.15, 0.16, ...]
```

**Kết quả: 1.949/1.999 giá trị lr đều THẮNG (~97.5%)!**

Điều này khớp cấu trúc toán học ở mục 2.2: vì đích chỉ là "rơi vào kiểu A
hoặc B", hầu hết quỹ đạo update sau 16 bước đều đạt 8/9: trừ những lr quá
nhỏ (model đứng yên) hoặc cực đại (boundary loạn xa).

Chọn **lr = 0.14** (winner đầu tiên, giá trị "hiền", tránh float kỳ).

---

## 9. Bước 7: Submit và nhận flag

```bash
curl -s -X POST "http://aureolin-pixie.cylabacademy.net:53971/train" \
     -H "Content-Type: application/json" \
     -d '{"learningRate": 0.14}' | python3 -c "
import json, sys
d = json.load(sys.stdin)
print('accuracy:', round(d['accuracy']*100, 1), '%')
print('success :', d['success'])
print('FLAG    :', d.get('flag'))
"
```

Output:
```
accuracy: 88.9 %
success : True
FLAG    : academy{h0l3_1n_m1ddl3_unl34rn4bl3_l1n34rly_5af09722}
```

✅ **FLAG: `academy{h0l3_1n_m1ddl3_unl34rn4bl3_l1n34rly_5af09722}`**

Tên flag cũng xác nhận luôn ý đồ đề bài: *"hole in middle: unlearnable linearly"*.

---

## 10. Vì sao solution này tối ưu

| Cách chơi | Số lần đoán | Chắc chắn? | Thời gian |
|---|---|---|---|
| Kéo slider mù | 5-30 lần run | Không: phụ thuộc may | 5-15 phút |
| Quan sát log + suy tay | vài lần | Gần đúng | 10-20 phút |
| **Reverse + sweep offline (bài này)** | **2 request** (probe + submit) | **100% tất định** | **~2 phút** |

Nguyên tắc tổng quát rút ra cho mọi challenge "tune parameter":
> Nếu server trả về **đủ lịch sử/quá trình** (history/log/trace), hãy dùng nó
> để clone chính xác logic về local → biến bài toán tìm kiếm online thành
> bài toán tính toán offline, giải tất định, submit 1 phát ăn ngay.

Bonus: sweep còn chỉ ra gần như MỌI giá trị đều thắng: nghĩa là đề này
thực chất dạy **cách đọc hiểu cơ chế**, chứ không phải thử-sai.

---

## 11. Script hoàn chỉnh

```python
#!/usr/bin/env python3
"""Perceptron Hole-in-Middle auto-solver"""
import json, urllib.request

BASE = "http://aureolin-pixie.cylabacademy.net:53971"

def get(path):
    with urllib.request.urlopen(BASE + path, timeout=15) as r:
        return json.loads(r.read())

def post(path, obj):
    req = urllib.request.Request(
        BASE + path,
        data=json.dumps(obj).encode(),
        headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=15) as r:
        return json.loads(r.read())

cfg = get("/config.json")
points = [tuple(p) for p in cfg["points"]]
steps  = cfg["maxSteps"]
w0, b0 = cfg["initialModel"]["weights"], cfg["initialModel"]["bias"]

def final_correct(lr):
    w = list(w0); b = float(b0)
    for k in range(steps):
        x, y, lab = points[k % len(points)]
        pred = 1 if w[0]*x + w[1]*y + b >= 0 else 0
        e = lab - pred
        if e:
            w[0] += lr*e*x; w[1] += lr*e*y; b += lr*e
    return sum((1 if w[0]*x + y*w[1] + b >= 0 else 0) == lab
               for x, y, lab in points)

# sweep
lr = cfg["lrMin"]
while lr <= cfg["lrMax"]:
    if final_correct(lr) / len(points) >= cfg["successThreshold"]:
        break
    lr = round(lr + 0.01, 2)

# submit
res = post("/train", {"learningRate": lr})
print(f"lr={lr}  acc={res['accuracy']*100:.1f}%  success={res['success']}")
print("FLAG:", res.get("flag"))
```

---
*Writeup bởi WRET26: workspace *
