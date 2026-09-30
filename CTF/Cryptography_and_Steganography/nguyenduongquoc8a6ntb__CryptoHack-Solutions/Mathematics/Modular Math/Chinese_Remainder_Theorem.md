# Chinese Remainder Theorem

* **Category:** Mathematics
* **Points:** 40
* **Source:** CryptoHack

---
## 1. Description
<img width="958" height="222" alt="image" src="https://github.com/user-attachments/assets/64cbab42-07e5-4013-ab2d-4a006be9705d" />

## 2. Mathematical Background & Solution
Giải thích thuật toán **Chinese Remainder Theorem.**

> [!CAUTION]
> Thuật toán này chỉ áp dụng cho các số $n_i$ nguyên tố cùng nhau đôi một ($\gcd(n_i, n_j) = 1$).

- Cho:
  
  > $x \equiv a_1 \pmod {n_1}$ <br>
  > $x \equiv a_2 \pmod {n_2}$ <br>
  > $x \equiv a_3 \pmod {n_3}$ <br>
  > ...... <br>
  > $x \equiv a_n \pmod {n_n}$ <br>

- Biết ước chung lớn nhất của 2 số $n_i, n_j$ bất kì đôi một bằng 1. Tức là gcd($n_i,n_j$) = 1 và $n_i,n_j \in [n_1,n_2,n_3,...,n_n]$.
- Mục tiêu chúng ta là tìm ra $x$ sao cho $x \equiv a \pmod N$ với $N = n_1.n_2.n_3...n_n$
- Ta biết $x \equiv a_i \pmod {n_i} \iff x \bmod n_i = a_i$.
  - Lúc này bài toán trở thành tìm $x$ sao cho:
    
    > $x \bmod n_1 = a_1$ <br>
    > $x \bmod n_2 = a_2$ <br>
    > $x \bmod n_3 = a_3$ <br>
    > ...... <br>
    > $x \bmod n_n = a_n$
    
  - Muốn chia $x$ cho bất kỳ số $n_i$ để dư $a_i$ ta cần phải tách $x = x_1 + x_2 + x_3 + ... + x_n$ với $x_i \bmod n_i = a_i$ và $x_i \bmod n_j = 0$ $(n_j \neq n_i)$. Khi đó $x \bmod n_i = (x_1+...+x_i+...+x_n) \bmod n_i = (0 + ... + a_i + ...+0) = a_i$
  - Để tạo ra $x_i$ ta cần thực hiện 3 bước:
    
    - Tạo ra $N_i$ bằng cách lấy $N/n_i$ , số $N_i$ lúc này sẽ chia hết cho mọi số $n_j$ khác $n_i$.
      
      > Lưu ý: $N_i$ lúc này chia cho $n_i$ sẽ ra một số dư nào đó.
      
    - Để $N_i \bmod n_i = 1$ thì ta cần tìm số $M_i$ sao cho $(N_i.M_i) \bmod n_i = 1 \iff N_i.M_i \equiv 1 \pmod {n_i}$ hay nói cách khác $M_i$ chính là nghịch đảo modular của $N_i$.
    - Do $(N_i.M_i) \bmod n_i = 1$ ta chỉ cần nhân thêm $a_i$ là tạo ra $x_i$ thoả mãn $(x_i = N_i.M_i.a_i)$.
    
## 3. Python Implementation & Logic

### **Algorithm Approach:**
1. Theo đề bài ta có **list_a** = [2,3,5] và **list_n** = [5,11,17].
2. Tạo hàm **crt**(list_a,list_n).
3. Tạo mảng **list_x** rỗng
4. Chạy vòng lặp tính ra $N = n_1.n_2.n_3.n_4....n_n$.
5. Chạy tiếp vòng lặp từ 0 đến len(**list_n**).
6. Mỗi vòng lặp tính ra $N_i = N/n_i$ ; $M_i = N_i^{-1}$ và tính ra $x_i$.
7. Thêm $x_i$ vào **list_x**.
8. In ra $x \bmod N$ vì $x = \sum x_i \pmod N$.
9. Flag chính là kết quả. 

### **Python Code:**
```python
list_a = [2,3,5]
list_n = [5,11,17]

def crt(list_a,list_n):
    list_x = []

    # Tính N
    N = 1
    for i in list_n:
        N = N*i

    for i in range(len(list_n)):
        # Tính Ni, Mi, xi
        Ni = N//list_n[i]
        Mi = pow(Ni,-1,list_n[i])
        xi = Ni*Mi*list_a[i]

        list_x.append(xi)

    return sum(list_x) % N

print(crt(list_a,list_n))

