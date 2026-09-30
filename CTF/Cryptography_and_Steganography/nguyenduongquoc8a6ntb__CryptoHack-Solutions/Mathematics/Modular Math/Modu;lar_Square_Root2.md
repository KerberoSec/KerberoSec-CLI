# Modular Square Root

* **Category:** Mathematics
* **Points:** 35
* **Source:** CryptoHack

---
## 1. Description
<img width="997" height="108" alt="image" src="https://github.com/user-attachments/assets/a6c4469b-3c0b-4ea1-a0c7-ec1bd5b0a45c" />

## 2. Mathematical Background & Solution
- Trong dạng bài lần này mục tiêu của chúng ta tiếp tục là tìm ra $x$ sao cho $x^2 \equiv a \pmod p$ biết $a$ là **quadratic residue**.
- Do mọi số nguyên tố $p$ với ($p \neq 2$) luôn có 2 dạng $p \bmod 4 = 3$ và $p \bmod 4 = 1$ ta sẽ phân tích từng trường hợp để tìm ra $x$:
  - *Trường hợp 1:* $p \bmod 4 = 3$
    - Ta cần tìm $r$ sao cho $x^2 \equiv (a^r)^2 \equiv a \pmod p$.
      
      >: Ta có: $(a^r)^2 \equiv a \pmod p$ <br>
      > $\iff$ $a^{2r-1} \equiv 1 \pmod p$ <br>
      >: Kết hợp với tiêu chuẩn Euler: $a^{(p-1)/2} \equiv 1 \pmod p$ <br>
      >: Ta thu được: $2r-1 = (p-1)/2 \iff r = (p+1)/4$ với $(r \in N)$ <br>
      >: Thay vào phương trình ban đầu: $x \equiv \pm a^{(p+1)/4} \iff x_1 \equiv a^{(p+1)/4} \pmod p$ và $x_2 \equiv -x_1 \equiv -x_1 + p \pmod p$.
      
    - Vậy ta tìm được 2 nghiệm $x$: $x_1 \equiv a^{(p+1)/4} \pmod p$ và $x_2 \equiv p: x_1 \pmod p$.
  - *Trường hợp 2:* $p \bmod 4 = 1$
   
     > Chú thích: $a^Q = t$ ; $z^Q = c$ <br>
    
    - Trong trường hợp này ta không thể dùng tiêu chuẩn Euler để tìm $r$ vì $r \notin N$.
    - Thay vào đó ta sẽ dùng thuật toán Tonelli-Shanks để cập nhật nghiệm tạm $R$ bằng cách nhân nó với $b$ nhằm triệt tiêu sai số $t$ về 1, từ đó biến nghiệm tạm thành nghiệm đúng ($x \equiv R \pmod p$) cụ thể:
      - Ta đặt: $2r -1 = Q \iff r=(Q+1)/2$ với $Q$ là phần lẻ khi tách $p-1$ thành $Q.2^S$
       
        >: Để tìm ra $Q$ ta lấy $p-1$ chia cho 2 và sau $S$ lần ta thu được số lẻ $Q$. <br>
        >: Khi này $R \equiv a^r = a^{(Q+1)/2} \iff R^2 \equiv (a^r)^2 = a.a^Q \pmod p$ <br>

      - Trong thuật toán Tonelli-Shanks khi lấy $R$ nhân $b$ thì $R.b = a^{(Q+1)/2}.b \iff R^2.b^2=a.a^Q.b^2 = a.t.b^2$ ta thấy ẩn $a$ luôn không thay đổi và đó chính là bản chất cốt lõi của thuật toán này. Đây là lý do tại sao chúng ta không thể bình phương 2 vế vì nó sẽ làm biến $a$ bị thay đổi.
       
        >: Nhưng để duy trì sự bất biến của phương trình $R^2.b^2=a.t.b^2$ ta không chọn số b ngẫu nhiên. <br>
        >
        >: Trước đó ta cần làm rõ bậc của $t$. Bắt đầu từ tiêu chuẩn Euler ta biết rằng $a^{(p-1)/2} = a^{Q.2^{S-1}} = (a^Q)^{2^{S-1}} = t^{2^{S-1}} \equiv 1 \pmod p$ tức là $t$ mũ tối đa $2^{S-1}$ lần sẽ ra 1. Nhưng trên thực tế thì t mũ $2^k$ lần đã ra 1 rồi, hay nói cách khác $t^{2^{k-1}}=-1$ $(k \leq S-1)$ <br>
        >
        >: Để triệt tiêu dần biến $t$ thì ta phải chọn số $b^2$ cũng có bậc là $(k-1)$ vì $t^{2^{k-1}}.(b^2)^{2^{k-1}}=-1.-1=1$. <br>
        >
        >: Ta chọn số z là **quadratic non-residue** vì $(z^Q)^{2^{M-1}} \equiv -1 \pmod p$ "ta chứng minh tương tự từ tiêu chuẩn Euler đối với số **quadratic non-residue**". Lúc này ta cần gọt số mũ của $z^Q$ hay $c$ sao cho nó thành $(b^2)^{2^{k-1}}$. <br>
        >
        >: Đặt $b^2=c^x$ và thay vào phương trình $(b^2)^{2^{k-1}} = c^{2^{M-1}}$ ta thu được $c^{x.2^{k-1}} = c^{2^{M-1}} \iff x = 2^{M-k}$. Thay lại $x$ ta thu được $b^2 = c^{2^{M-k}} \iff b = c^{2^{M-k-1}}$.
   
    - Sau khi cho chạy thuật toán đến vòng lặp cuối cùng thì $x_1 = R$ và $x_2 = p: x_1$.
  
## 3. Python Implementation & Logic

### **Algorithm Approach:**
> [!CAUTION]
>: Bản chất dùng $b$ hay $b^2$ là như nhau tuỳ theo phương trình $R.b = a^{(Q+1)/2}.b \iff R^2.b^2=a.a^Q.b^2$. Trên phần giải thích tôi dùng $b^2$ để giải thích rõ sự triệt tiêu $t$, còn dưới code tôi dùng $b$ để code không quá phức tạp. <br>
>: Mỗi vòng lặp ta phải tìm lại số $k$ mới để tạo ra $b$ mới vì $t$ không phải lúc nào cũng hạ từng bậc, có lúc hạ nhiều bậc. <br>
>: Trong trường hữu hạn $Z_p$ thì gần một nửa số là **quadratic non-residue** nên cho chạy vòng lặp từ 1 đến p vẫn ổn nhưng vẫn khuyến khích dùng random số hơn. <br>
>: Ở bước tìm $k$ ta cần dùng 1 biến tạm t_temp = $t$ để tránh làm thay đổi giá trị của $t$.

1. Tải file output.txt trong file sẽ chứa số a là **quadratic residue** và p.
2. Tạo hàm tonelli_shanks($a,p$).
3. Tạo mảng rỗng **roots**
4. Tạo nhánh **if** là trường hợp $p \bmod 4 = 3$.
5. Tính $x_1 = a^{(p+1)/4} \pmod p$ và $x_2 = p: x_1$ sau đó thêm 2 nghiệm vào **roots**.
6. Tạo nhánh **else** là trường hợp $p \bmod 4 = 1$.
7. Cho chạy vòng lặp để tìm ra $Q,S$.
8. Chạy vòng lặp tìm ra $z$.
9. Đặt $t = a^Q \bmod p$; $c = z^Q \bmod p$; $R = a^{(Q+1)/2} \bmod p$; $M = S$.
10. Cho chạy vòng lặp **while** với điều kiện $t \neq 1$.
11. Trong vòng lặp **while** tạo thêm vòng lặp để cập nhật $k$ mới. (Tìm $k$ bằng cách tính số lần thực tế cần để $t^{2^k} = 1$)
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
