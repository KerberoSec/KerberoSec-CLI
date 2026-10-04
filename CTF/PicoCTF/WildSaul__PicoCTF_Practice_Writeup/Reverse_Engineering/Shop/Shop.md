# SHOP
##### Tags: `picoCTF 2021` `Reverse Engineering`
### DESCRIPTION:
Best Stuff: Cheap Stuff, Buy Buy Buy... Store Instance: [source](https://mercury.picoctf.net/static/f7b8db17d0891fb38c01a716052d1c04/source). The shop is open for business at `nc mercury.picoctf.net 24851`.
### Hiểu chương trình và đoạn code.
##### + Source thuộc ELF 32-bit file nên cần decompiler để đọc file.
##### + Sau khi kết nối qua `nc` , chương trình sẽ trông như sau: 
```bash
$ nc mercury.picoctf.net 24851.
Welcome to the market!
=====================
You have 40 coins
        Item            Price   Count
(0) Quiet Quiches       10      12
(1) Average Apple       15      8
(2) Fruitful Flag       100     1
(3) Sell an Item
(4) Exit
Choose an option: 

```
##### + Để ý thấy Fruitful flag là một đối tượng có thể chứa flag, nên ta sẽ tìm cách mua được nó:
##### + Đọc hint thì có nói phải luôn luôn kiểm tra các trường hợp rìa khi lập trình, thử như sau: 
```
You have 40 coins
        Item            Price   Count
(0) Quiet Quiches       10      12
(1) Average Apple       15      8
(2) Fruitful Flag       100     1
(3) Sell an Item
(4) Exit
Choose an option: 
0
How many do you want to buy?
-20
You have 240 coins
        Item            Price   Count
(0) Quiet Quiches       10      32
(1) Average Apple       15      8
(2) Fruitful Flag       100     1
(3) Sell an Item
(4) Exit
Choose an option: 
2
How many do you want to buy?
1
Flag is:  [112 105 99 111 67 84 70 123 98 52 100 95 98 114 111 103 114 97 109 109 101 114 95 53 51 50 98 99 100 57 56 125]
```
##### + Flag được viết dưới dạng thập phân, chuyển đổi sang ASCII:
```bash
$ for dec in 112 105 99 111 67 84 70 123 98 52 100 95 98 114 111 103 114 97 109 109 101 114 95 53 51 50 98 99 100 57 56 125; do                                
    printf \\$(printf '%03o' $dec)
done

picoCTF{b4d_brogrammer_532bcd98}
```
##### + Lấy flag thành công!
