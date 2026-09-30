<img width="835" height="710" alt="image" src="https://github.com/user-attachments/assets/fc236f64-b7c0-40f0-8897-bb972cd370dd" />

# WRITEUP: Perceptron Train Classic 1

```
┌──────────────────────────────────────────────────────────────────────┐
│  Challenge : Perceptron Train Classic 1                              │
│  Category  : Artificial Intelligence / AI Foundations I              │
│  Difficulty: Easy                                                    │
│  Author    : LT 'syreal' Jones                                       │
│  Flag      : academy{perceptron_classic_5rates_789ebf70}             │
│  Method    : Pipeline chuẩn reverse → sweep → submit (lần thứ 3)     │
│  Requests  : 6 tổng cộng (1 recon + 5 submit): zero thử-sai online  │
│  Time      : ~90 giây                                                │
└──────────────────────────────────────────────────────────────────────┘
```

---

## MỤC LỤC
1. [Tổng quan & vị trí trong series](#1-tổng-quan--vị-trí-trong-series)
2. [Phân tích dataset: cụm tách rời hoàn toàn](#2-phân-tích-dataset)
3. [Bước 1: Recon config.json](#3-bước-1--recon-configjson)
4. [Bước 2: Tái sử dụng simulator (không cần diff)](#4-bước-2--tái-sử-dụng-simulator)
5. [Bước 3: Sweep: hiện tượng 100% winner](#5-bước-3--sweep-hiện-tượng-100-winner)
6. [Bước 4: Submit 5 rate](#6-bước-4--submit-5-rate)
7. [Flag](#7-flag)
8. [Phân tích thống kê trọn series 3 bài](#8-phân-tích-thống-kê-trọn-series)
9. [Script solver hoàn chỉnh](#9-script-solver-hoàn-chỉnh)

---

## 1. Tổng quan & vị trí trong series

> Watch a perceptron learn using the classic update rule: only misclassified
> points trigger updates, with no weight decay. In this variant you must find
> **5 successful learning rates** (each reaching **100% accuracy**) before the
> flag is revealed.

Yêu cầu giống hệt Classic 2 Alpha: **5 learning rate khác nhau, mỗi cái đạt
100% accuracy**. Khác biệt duy nhất nằm ở dataset: và chính nó quyết định độ
khó thực tế của bài.

Đây là bài **dễ nhất trong series**, vì hint 3 đã tự tiết lộ:

> *Overshooting is harder in this dataset because the clusters are well
> separated*: cụm tách rời tốt thì overshoot khó giết được run.

---

## 2. Phân tích dataset

8 điểm từ `config.json`:

```
ÂM (0): 4 điểm              DƯƠNG (+1): 4 điểm
──────────────────           ──────────────────
(-4, -2)                     (3, 4)
(-3, -4)                     (4, 2)
(-2, -3)                     (2, 3)
(-3, -1)                     (3, 1)
```

Vẽ lên mặt phẳng:

```
  y
  4 │                       ⊕(3,4)
  3 │                  ⊕(2,3)
  2 │                            ⊕(4,2)
  1 │                          ⊕(3,1)
  0 └──────────────────────────────────── x
 -1 │      ⊖(-3,-1)
 -2 │   ⊖(-4,-2)
 -3 │         ⊖(-2,-3)
 -4 │      ⊖(-3,-4)
```

Hai cụm nằm chéo nhau qua đường chéo phụ `y = −x`, khoảng cách giữa cụm gần
nhất (`⊖(−2,−3)` ↔ `⊕(2,3)`... thực ra là cặp `(−2,−3)`: `(3,1)` / `(−1)`: `(1)`)
rất lớn so với bán kính từng cụm.

**Vì sao điều này quan trọng với perceptron:**

| Thuộc tính | Hệ quả lên quỹ đạo training |
|---|---|
| Margin rộng | Boundary phải dịch/xoay rất xa mới "đâm" vào vùng dữ liệu |
| Init `w=(1,−1), b=0` | Đường thẳng đầu tiên CHÍNH XÁC vuông góc hướng tách hai cụm |
| Cụm đối xứng qua gốc | Update từ điểm nào cũng đẩy w theo hướng đúng |

Init `w=(1,−1), b=0` cho `act = x − y`:
- Điểm dương `(3,4)`: act = −1 < 0 → pred 0 → SAI → update kéo về phía dương
- Điểm âm `(−3,−1)`: act = −3+1 = −2 < 0 → pred 0 → ĐÚNG, không đụng

→ Ngay vòng đầu model đã bị "kéo" đúng chiều bởi các điểm sai; margin rộng
chặn cả hai kiểu thất bại:
1. **lr quá nhỏ**: vẫn kịp hội tụ trong 16 bước vì chỉ cần vài bước ngắn
2. **lr quá lớn**: overshoot văng xa nhưng vùng an toàn rộng nên rơi xuống
   đâu cũng vẫn tách đúng 2 lớp

---

## 3. Bước 1: Recon config.json

```bash
curl -s --max-time 15 \
  "http://aureolin-pixie.cylabacademy.net:61015/config.json" | python3 -m json.tool
```

```json
{
  "points": [
    [-4,-2,0], [-3,-4,0], [-2,-3,0], [-3,-1,0],
    [3,4,1],  [4,2,1],  [2,3,1],  [3,1,1]
  ],
  "maxSteps": 16,
  "lrMin": 0.02,
  "lrMax": 20.0,
  "successTarget": 5,
  "successCount": 0,
  "initialModel": {
    "weights": [1.0, -1.0],
    "bias": 0.0,
    "accuracy": 0.5
  }
}
```

Cùng bộ tham số với Alpha: `maxSteps=16`, cần 5 rate, init giống hệt.
8 điểm / 16 bước = duyệt đúng 2 epoch trọn vẹn: quỹ đạo cân, không cắt ngang.

## 4. Bước 2: Tái sử dụng simulator (không cần diff)

Đây là lần thứ ba trong series. Sau hai bài, pipeline đã được chứng minh:
cùng nền tảng, cùng endpoint `POST /train {learningRate}`, cùng cơ chế
(duyệt tuần tự, `act ≥ 0 → pred 1`, chỉ update khi sai). Config trả về đúng
lược đồ cũ với dataset mới → **bỏ qua bước diff app.js**, nhảy thẳng sweep:

```python
pts = [(-4,-2,0),(-3,-4,0),(-2,-3,0),(-3,-1,0),
       (3,4,1),(4,2,1),(2,3,1),(3,1,1)]

def perfect(lr):
    w = [1.0, -1.0]; b = 0.0            # từ initialModel
    for k in range(16):                  # maxSteps
        x, y, lab = pts[k % len(pts)]
        pred = 1 if w[0]*x + w[1]*y + b >= 0 else 0
        e = lab - pred
        if e:                            # classic rule
            w[0] += lr*e*x; w[1] += lr*e*y; b += lr*e
    return all((1 if w[0]*x + w[1]*y + b >= 0 else 0) == lab
               for x, y, lab in pts)
```

---

## 5. Bước 3: Sweep: hiện tượng 100% winner

```python
winners, lr = [], 0.02
while lr <= 20.0:
    if perfect(lr):
        winners.append(round(lr, 2))
    lr = round(lr + 0.01, 2)
```

Kết quả:

```
[+] 1999 winners, first 10:
    [0.02, 0.03, 0.04, 0.05, 0.06, 0.07, 0.08, 0.09, 0.1, 0.11]
```

**1999/1999 giá trị hợp lệ đều thắng: tỷ lệ 100%.**

Không còn "hành lang rời rạc" như Alpha (16%), không còn phụ thuộc cửa sổ hội
tụ như Hole in Middle (97.5% nhờ lối thoát cấu trúc). Ở đây **mọi** quỹ đạo,
từ lr=0.02 (dịch chậm) đến lr=20.0 (nhảy khủng), đều kết thúc ở trạng thái
tách đúng 8/8 sau 16 bước.

Diễn giải từng vùng:

| Vùng lr | Hành vi boundary | Kết quả |
|---|---|---|
| 0.02: 0.1 | Trượt mượt về vị trí tách, vài bước đầu là chính | ✅ 100% |
| 0.1: ~5 | Hội tụ nhanh rồi đứng yên (mọi điểm đúng → hết update) | ✅ 100% |
| ~5: 20 | Nhảy lớn qua lại hai bên nhưng margin rộng nuốt hết | ✅ 100% |

Điểm mấu chốt: perceptron **ngừng update khi mọi điểm đúng**. Với cụm tách
rời, trạng thái "đúng" chiếm phần lớn không gian tham số mà quỹ đạo đi qua: khác hẳn Alpha nơi biên giới giữa các lớp dày đặc điểm dữ liệu.

---

## 6. Bước 4: Submit 5 rate

Gộp sweep + submit vào một script, lấy 5 winner đầu tiên:

```
[*] lr=0.02 acc=100% count=1/5
[*] lr=0.03 acc=100% count=2/5
[*] lr=0.04 acc=100% count=3/5
[*] lr=0.05 acc=100% count=4/5
[*] lr=0.06 acc=100% count=5/5
[FLAG] academy{perceptron_classic_5rates_789ebf70}
```

Bộ đếm `successCount` server-side tăng đều, flag trả về ngay ở request thứ 5.

---

## 7. Flag

```
academy{perceptron_classic_5rates_789ebf70}
```

---

## 8. Phân tích thống kê trọn series

Sweep offline cả 3 bài cho ba con số kể trọn câu chuyện thiết kế đề:

| Bài | Tỷ lệ lr thắng | Margin | Đích | Bài học cốt lõi |
|---|---|---|---|---|
| Hole in Middle | 1949/1999 = **97.5%** | ❌ vô nghiệm | 8/9 | Đích nới lỏng bù cho dữ liệu không tách được |
| Classic 2 Alpha | 320/1999 = **16%** | Hẹp | 12/12 × 5 | Mép hẹp + đòi tuyệt đối → hành lang hội tụ hẹp |
| Classic 1 (bài này) | 1999/1999 = **100%** | Rộng | 8/8 × 5 | Cụm tách rời → mọi đường đều về đích |

Ba mức độ khó thực tế của cùng một cơ chế: chỉ đổi **dataset** và **ngưỡng
đích**:

```
Khó thực tế  =  f(margin dataset, độ gắt ngưỡng, số rate yêu cầu)

Hole in Middle : margin âm (vô nghiệm)  + ngưỡng nới   → dễ
Classic 2 Alpha: margin hẹp             + ngưỡng gắt   → khó nhất series
Classic 1      : margin rộng            + ngưỡng gắt   → dễ nhất series
```

**Quy trình chuẩn đã đóng khung** (dùng lại cho mọi challenge cùng loại):
1. `GET /config.json` → dataset + init + tham số đích
2. So sánh lược đồ config với các phần trước → tái sử dụng simulator
3. Sweep toàn dải lr offline (Python double ≡ JS Number)
4. Submit đủ số winner theo `successTarget`: flag tự về

Tổng thời gian bài này: **~90 giây**, trong đó 60 giây chờ curl.

---

## 9. Script solver hoàn chỉnh

```python
#!/usr/bin/env python3
"""Perceptron Classic 1 auto-solver: sweep + submit 5 rates"""
import json, urllib.request

BASE = "http://aureolin-pixie.cylabacademy.net:61015"

def get(path):
    with urllib.request.urlopen(BASE + path, timeout=15) as r:
        return json.loads(r.read())

def post(obj):
    req = urllib.request.Request(
        BASE + "/train", data=json.dumps(obj).encode(),
        headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=15) as r:
        return json.loads(r.read())

cfg = get("/config.json")
pts   = cfg["points"]
steps = cfg["maxSteps"]
w0    = cfg["initialModel"]["weights"]
b0    = cfg["initialModel"]["bias"]

def perfect(lr):
    w = list(w0); b = float(b0)
    for k in range(steps):
        x, y, lab = pts[k % len(pts)]
        pred = 1 if w[0]*x + w[1]*y + b >= 0 else 0
        e = lab - pred
        if e:
            w[0] += lr*e*x; w[1] += lr*e*y; b += lr*e
    return all((1 if w[0]*x + w[1]*y + b >= 0 else 0) == lab
               for x, y, lab in pts)

winners, lr = [], cfg["lrMin"]
while lr <= cfg["lrMax"]:
    if perfect(lr):
        winners.append(round(lr, 2))
    lr = round(lr + 0.01, 2)
print(f"[+] {len(winners)} winning rates")

for lr in winners[:cfg["successTarget"]]:
    res = post({"learningRate": lr})
    print(f"[*] lr={lr} acc={res['accuracy']*100:.0f}% "
          f"count={res.get('successCount')}/{cfg['successTarget']}")
    if res.get("flag"):
        print("[FLAG]", res["flag"])
        break
```

---
*Writeup bởi WRET26*
