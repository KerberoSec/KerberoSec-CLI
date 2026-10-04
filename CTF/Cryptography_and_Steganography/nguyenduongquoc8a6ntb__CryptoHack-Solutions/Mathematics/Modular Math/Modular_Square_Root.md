# Modular Square Root

* **Category:** Mathematics
* **Points:** 35
* **Source:** CryptoHack

---
## 1. Description
<img width="997" height="108" alt="image" src="https://github.com/user-attachments/assets/a6c4469b-3c0b-4ea1-a0c7-ec1bd5b0a45c" />

## 2. Mathematical Background & Solution
Giải thích thuật toán Tonelli-Shanks:
  * Muốn tìm $x$ sao cho $x^2 \equiv a \pmod p$ ta cần tìm $r$ để $x^2 \equiv (a^r)^2 \equiv a \pmod p$.
  * Ta đã biết $p$ ($p \neq 2$) là số nguyên tố và chỉ có 2 dạng $p \bmod 4 = 3$ và $p \bmod 4 = 1$.
    - *Trường hợp 1*: $p \bmod 4 = 3$
      
      > 📌 **Lưu ý quan trọng:**
      > Ở TH1 thì $r$ chắc chắn là số nguyên nên ta dễ dàng tìm được $r$. Với TH2, $r$ là số mũ không nguyên nên bắt buộc phải dùng thuật toán Tonelli-Shanks.
      
      * Ta biết khi $a$ là **quadratic residue** thì $a^{(p-1)/2} \equiv 1 \pmod p$.
      * Biến đổi $(a^k)^2 \equiv a \pmod p$ thành $a^{2r-1} \equiv 1 \pmod p$.
      * Kết hợp ta thu được: $r = (p+1)/4 \iff x_1 = a^{(p+1)/4} \bmod p$ và $x_2 = p: x_1$.
    - *Trường hợp 2*: $p \bmod 4 = 1$
      * Mục tiêu lúc này cũng là tìm $r$ sao cho $a^{2r-1} \equiv 1 \pmod p$.
      * Ta liên hệ định lý Fermat nhỏ và thấy $a^{p-1} \equiv a^{2r-1} \equiv 1 \pmod p$.
      * Nhưng nếu gán $2r-1=p-1$ thì $r = p/2$ là một số không nguyên, ta quyết định tách $p-1$ thành $Q.2^S$
        
        - Để tách $p-1$ thành $Q.2^S$ ta sẽ lấy $p-1$ chia 2 và sau S lần kết quả sẽ là một số lẻ Q.
          
      * Do không thể dùng $p-1$ ta quyết định tách phần lẻ $Q$ của $p-1$ gán nó bằng $2r-1$ tức $2r-1 = Q$ để làm nghiệm tạm.
      * Khi đó nghiệm tạm $R \equiv a^{(Q+1)/2} \pmod p$ hay $R^2 \equiv a^{Q+1} = a.a^Q \pmod p$.

      > 📌 **Lưu ý quan trọng:**
      >: Ta chọn $2r-1=Q$ vì Q là một số lẻ (nó sẽ làm k nguyên) và khi $(a^Q)^{2^{S-1}}$ chắc chắn ra 1 vì $(a^Q)^{2^{S-1}} \equiv a^{(p-1)/2} \equiv 1 \pmod p$.<br>
      >: Nghiệm tạm thường sẽ chưa phải là nghiệm đúng.

      * Ta dễ dàng nhận thấy để biến $x^2 \equiv R^2 \equiv a \pmod p \iff x^2 \equiv a.a^Q \equiv a \pmod p$ **thì** $a^Q$ phải bằng 1.
      * Mục tiêu bài toán lúc này trở thành làm thế nào để biến $a^Q = 1$ trong $R^2 \equiv a.a^Q \pmod p$.
        
        * Ta không thể trực tiếp bình phương 2 vế để làm mất $a^Q$ được vì nó sẽ làm thay đổi biến $a$.
        * Lúc này thuật toán Tonelli-Shanks sẽ phát huy tác dụng:
          * Ta cần tìm một số $b^2$ sao cho khi nhân $b^2$ cho cả 2 vế của phương trình $R^2 \equiv a.a^Q \pmod p$ ta sẽ làm cho $a^Q$ nhỏ dần và phải tiến tới 1.
            
          * Để tạo ra được $b$ ta cần tìm một số z là **quadratic non-residue**. Ta chọn $z$ vì nó có tính chất $(z^Q)^{2^{M-1}}$ sẽ ra -1. <br>
          
          
          > 📌 **Lưu ý quan trọng:**
          >: Số bình phương ra số 1 chỉ có -1 và 1.<br>
          >: Đối với $a^Q$ thì thường bình phương $2^k$ ($2^k < 2^{S-1}$) là nó đã ra 1 rồi, tức là thực tế chỉ cần $(a^Q)^{2^{k-1}}$ là ra -1.
          
 
          * Muốn cho $a^Q$ và $b^2$ triệt tiêu nhau thì $(a^Q)^{2^{k-1}} = (b^2)^{2^{k-1}} = -1$ khi này $(a^Q)^{2^{k-1}}.(b^2)^{2^{k-1}} = 1$.
            
            * Mà ta phải biến đổi $(z^Q)^{2^{M-1}}$ sao cho nó bằng $(b^2)^{2^{k-1}}$, để làm được điều đó ta cần biến đổi phương trình $(z^Q)^{2^{M-1}} = (b^2)^{2^{k-1}}$ thành $b^2 = (z^Q)^{2^{M-k}}$ bằng cách đặt $b^2 = (z^Q)^x$ và tìm $x$.
           
            * Lúc này ta cho chạy vòng lặp cứ mỗi vòng lặp tìm $k$ mới từ đó suy ra $b^2$ mới sau đó đem nhân với $R^2$ đến khi $a^Q$ và $b^2$ triệt tiêu nhau thì $R^2 \equiv x^2 \equiv a \pmod p \iff x_1 = R \bmod p$ và $x_2 = p: x_1$

            
    
## 3. Python Implementation & Logic

### **Algorithm Approach:**
> [!CAUTION]
>: Trong đoạn code dưới dùng $b$ để đơn giản hoá bài toán vì $R.b = a^{(Q+1)/2}.b \iff R^2.b^2 = a.a^Q.b^2$ <br>
>: Ở bước tìm $k$ ta cần dùng 1 biến tạm $t$ = t_temp để tránh làm thay đổi giá trị của $t$.
1. Tải file output.txt trong file sẽ chứa số a là **quadratic residue** và p.
2. Tạo hàm tonelli_shanks($a,p$).
3. Tạo mảng rỗng **roots**
4. Tạo nhánh **if** là trường hợp $p \bmod 4 = 3$.
5. Tính $x_1 = a^{(p+1)/4} \pmod p$ và $x_2 = p: x_1$ sau đó thêm 2 nghiệm vào **roots**.
6. Tạo nhánh **else** là trường hợp $p \bmod 4 = 1$.
7. Cho chạy vòng lặp để tìm ra $Q,S$.
8. Chạy vòng lặp tìm ra $z$.
9. Đặt $t = a^Q \bmod p$; $c = z^Q \bmod p$; $R = a^{(Q+1)/2} \bmod p$; $M = S$.
10. Cho chạy vòng lặp **while** với điều kiện $t != 1$.
11. Trong vòng lặp **while** tạo thêm vòng lặp để cập nhật $k$ mới. (Tìm $k$ bằng cách tính số lần thực tế cần để $t^2^k = 1)
12. Tính $b = c^{2^{M-k-1}}$.
13. Cập nhật các giá trị $R = (R.b) \bmod p$; $c = b^2 \bmod p$; $t = (t.c) \pmod p$, $M = k$.
14. Thêm 2 nghiệm $x_1 = R, x_2 = p: R$ vào danh sách **roots**.
15. Flag là nghiệm nhỏ hơn.

### **Python Code:**
```python
a = 8479994658316772151941616510097127087554541274812435112009425778595495359700244470400642403747058566807127814165396640215844192327900454116257979487432016769329970767046735091249898678088061634796559556704959846424131820416048436501387617211770124292793308079214153179977624440438616958575058361193975686620046439877308339989295604537867493683872778843921771307305602776398786978353866231661453376056771972069776398999013769588936194859344941268223184197231368887060609212875507518936172060702209557124430477137421847130682601666968691651447236917018634902407704797328509461854842432015009878011354022108661461024768
p = 30531851861994333252675935111487950694414332763909083514133769861350960895076504687261369815735742549428789138300843082086550059082835141454526618160634109969195486322015775943030060449557090064811940139431735209185996454739163555910726493597222646855506445602953689527405362207926990442391705014604777038685880527537489845359101552442292804398472642356609304810680731556542002301547846635101455995732584071355903010856718680732337369128498655255277003643669031694516851390505923416710601212618443109844041514942401969629158975457079026906304328749039997262960301209158175920051890620947063936347307238412281568760161

def tonelli_shanks(a,p):
    roots = []
    if p % 4 == 3:
        x1 = pow(a,(p+1)//4,p)
        x2 = p: x1
        roots.append(x1)
        roots.append(x2)
    else:

    # Tìm Q,S
        Q = p-1
        S = 0
        while Q % 2 == 0:
            Q = Q//2
            S += 1
    # Tìm z
        z = 0
        for i in range(p):
            if pow(i,(p-1)//2,p) == p-1:
                z = i
                break

        t = pow(a,Q,p)
        c = pow(z,Q,p)
        R = pow(a,(Q+1)//2,p)
        M = S
        while t != 1:
        # Tìm k
            t_temp = t
            k = 0
            for i in range(1,M):
                t_temp = pow(t_temp,2,p)
                if t_temp == 1:
                    k = i
                    break
        # Tính b
            b = pow(c,2**(M-k-1),p)

        # Cập nhật biến
            R = (R*b) % p
            c = (b*b) % p
            t = (t*c) % p
            M = k

        roots.append(R)
        roots.append(p-R)

    return roots

print(min(tonelli_shanks(a,p)))

        

