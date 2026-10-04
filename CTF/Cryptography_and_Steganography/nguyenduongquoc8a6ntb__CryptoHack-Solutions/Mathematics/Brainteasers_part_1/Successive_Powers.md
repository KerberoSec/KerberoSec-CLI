# Successive Powers

* **Category:** Mathematics
* **Points:** 60
* **Source:** CryptoHack

---
## 1. Description
<img width="996" height="115" alt="image" src="https://github.com/user-attachments/assets/1dc5148c-e68b-4f47-b1aa-a506f6075bdb" />

## 2. Mathematical Background & Solution
- Theo đề bài ta có:
  
  > $x^k \bmod p = 588$ <br>
  > $x^{k+1} \bmod p = 665$ <br>
  > $x^{k+2} \bmod p = 216$ <br>
  > $x^{k+3} \bmod p = 113$ <br>
  > $x^{k+4} \bmod p = 642$ <br>
  > ......

- Chúng ta có thể biến đổi thành:

  > $x^k \equiv 588 \pmod p$ (1) <br> 
  > $x^{k+1} \equiv 665 \pmod p$ (2) <br> 
  > $x^{k+2} \equiv 216 \pmod p$ (3) <br>
  > $x^{k+3} \equiv 113 \pmod p$ (4) <br>
  > $x^{k+4} \equiv 642 \pmod p$ (5) <br>
  > ......

- Ta xét ba phương trình (1),(2) và (3):
  > 
  >: Thay (1) vào (2) và (3):
  >: $588x \equiv 665 \pmod p$ <br>
  >: $588x^2 \equiv 216 \pmod p$
  > 
  >: Nhân 588 vào hai vế phương trình $588x^2 \equiv 216 \pmod p:$ <br>
  >: $(588x)^2 \equiv 216.588 \pmod p$ <br>
  >   $\iff 665^2 \equiv 127008 \pmod p$ <br>
  >   $\iff 665^2: 127008 \equiv 0 \pmod p$ <br>
  >   $\iff 315217 \equiv 0 \pmod p$

- Ta làm tương tự với các phương trình (2),(3),(4) và (3),(4),(5):
  >: Thu được:
  >: $-28489 \equiv 0 \pmod p$ <br>
  >: $-125903 \equiv 0 \pmod p$

- Ba số ta tìm được ở trên đều là bội số của $p$ (hay $p$ là ước chung của chúng) vì vậy:
  > $p = gcd(315217,-28489,-125903)$

- Lấy từ phương trình $588x \equiv 665 \pmod p$ ta biến đổi và thu được: $x \equiv 665.588^{-1} \pmod p$ với $588^{-1}$ là nghịch đảo modular của 588.

## 3. Python Implementation & Logic

### **Algorithm Approach:**
> [!CAUTION]
>: Ta cần tìm $p$ là số có 3 chữ số do vậy ước chung lớn nhất của 3 số khác nhau khả năng cao sẽ ra $p$. Trong trường hợp $p$ chưa phải 3 chữ số thì ta sẽ tìm tiếp số thứ 4 và tìm ước chung lớn nhất của nó với 3 số kia.
>: Hàm **pow()** có thể tìm nghịch đảo modular trong phiên bản python 3.8+.

1. Tự tạo hàm **gcd()** hoặc dùng thư viện math.
2. Tính $p$ và $x$.
3. In ra flag với định dạng **crypto{p,x}**

### **Python Code:**
```python
# Tạo hàm gcd()
def gcd(a,b):
    a,b = abs(a),abs(b)
    while b!=0:
        a,b = b,a%b
    return a

# Tính p,x
p = gcd(gcd(315217,-28489),-125903)
x = (665 * pow(588,-1,p)) % p

# In flag
print(f"crypto{{{p},{x}}}")   

