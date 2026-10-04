# Extended GCD

* **Category:** General
* **Points:** 20
* **Source:** CryptoHack

---
## 1. Description
<img width="983" height="178" alt="image" src="https://github.com/user-attachments/assets/b2230c5a-9bfc-482b-b408-fc6ac657f427" />

## 2. Mathematical Background & Solution
> Chú thích: <br>
>: $a$ và $b$ là hai số cần tìm $gcd(a,b)$. <br>
>: $r_n$ là số dư. <br>
>: $q_n$ là thương số.

> [!CAUTION]
> Thuật toán Euclid mở rộng dùng được cho mọi số a,b không cần là hai số nguyên tố cùng nhau.

- Thuật toán Euclid mở rộng là thuật toán giúp ta tìm ra $x$, $y$ và $gcd(a,b)$ biết **$a.x+b.y = gcd(a,b)$**. Cụ thể:
  
  - Chúng ta đã biết trong thuật toán Euclid ta sẽ thực hiện thao tác chia lấy dư giữa 2 số $a$ và $b$ (a,b được cập nhật liên tục) đến khi số dư bằng 0 ta tìm được $gcd(a,b)$.
    
    >: Bắt đầu bằng thao tác: $(a \bmod b = r_1) \to (b \bmod r_1 = r_2) \to (r_1 \bmod r_2 = r_3) \to ... \to (r_{n-2} \bmod r_{n-1} = r_n)$ khi đó $r_{n-1}$ chính là $gcd(a,b)$. <br>
    >
    >: Ta có thể viết lại mỗi thao tác chia lấy dư thành: <br>
    >   $r_1 = a: b.q_1$ <br>
    >   $r_2 = b: r_1.q_2$ <br>
    >   $r_3 = r_1: r_2.q_3$ <br>
    >   ...... <br>
    >   $r_n = (r_{n-2}): (r_{n-1}).q_n$

  - Thuật toán Euclid cho chúng ta biết hai dữ kiện quan trọng: $r_n = a.x_n + b.y_n$ và $r_n = (r_{n-2}): (r_{n-1}).q_n$
  - Kết hợp hai dữ kiện trên ta thu được:
    
    >  $r_n = (a.x_{n-2} + b.y_{n-2}): (a.x_{n-1} + b.y_{n-1}).q_n$ <br>
    >
    > $\iff r_n = a.x_{n-2} + b.y_{n-2}: a.x_{n-1}.q_n: b.y_{n-1}.q_n$ <br>
    >
    > $\iff r_n = a.[(x_{n-2}): (x_{n-1}).q_n] + b.[(y_{n-2}): (y_{n-1}).q_n]$

  - Như vậy cứ mỗi vòng lặp ta cập nhật biến $x_n$, $y_n$ tương ứng. Thì ở vòng lặp cuối ta sẽ thu được $a.x + b.y = gcd(a,b)$ với $x = x_n$ , $y = y_n$ và $gcd(a,b) = r_{n-1}$.
    
## 3. Python Implementation & Logic

### **Algorithm Approach:**
> [!CAUTION]
>: Để tạo ra $r_1$ ta cần đặt $a = a.1 + b.0$ và $b = a.0 + b.1$ khi này $r_1 = a.(1-0.q_1) + b.(0-1.q_1)$ <br>
>: Không quan trọng $a>b$ hay $a<b$ vì Euclid tự đảo vị trí ở vòng lặp đầu tiên. <br>
>: Với đề bài trên người ta dùng $p,q$ để thay cho $a,b$ và dùng $u,v$ để thay $x,y$.

1. Tạo hàm **extended_gcd**(a,b).
2. Đặt $x_0 = 1$ , $x_1 = 0$ , $y_0 = 0$ và $y_1 = 1$.
3. Cho chạy vòng lặp **while** với điều kiện $b \neq 0$.
4. Mỗi vòng lặp tính $q_n$ và cập nhật $a = b$ , $b = a \bmod b$. Tiếp đó cập nhật $x_n = (x_{n-2})-(x_{n-1}).q_n$ và $y_n = (y_{n-2})-(y_{n-1}).q_n$.
5. Khi vòng lặp kết thúc thì $a = gcd(a,b)$ , $b=0$ và tìm được $x = x_0$ , $y = y_0$.
6. Flag là **min**(x,y).

### **Python Code:**
```python
p = 26513
q = 32321

def extended_gcd(a,b): # a.x + b.y = gcd(a,b)
    x0,x1 = 1,0
    y0,y1 = 0,1
    while b != 0:
        # Tính q
        q = a//b

        # Thuật toán Euclid cập nhật a,b
        a,b = b,a%b

        # Cập nhật x,y
        x0,x1 = x1,x0-x1*q
        y0,y1 = y1,y0-y1*q

    return a,x0,y0

print(extended_gcd(p,q))

    
