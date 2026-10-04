# endianess-v2.md
##### Tags: `Forensics` `browser_webshell_solvable` 
### DESCRIPTION
Here's a file that was recovered from a 32-bits system that organized the bytes a weird way. We're not even sure what type of file it is. Download it [here](https://artifacts.picoctf.net/c_titan/115/challengefile) and see what you can get out of it
##### Kiểm tra file:
```
$ file challangefile
challengefile: data
$ hexdump -C challengefile               
00000000  e0 ff d8 ff 46 4a 10 00  01 00 46 49 01 00 00 01  |....FJ....FI....|
00000010  00 00 01 00 43 00 db ff  06 06 08 00 08 05 06 07  |....C...........|
```
> Không rõ loại file, khi kiểm tra hexdump, thấy có header với giá trị `e0 ff d8` cùng với giá trị chữ `FJFI`, kiểm tra online sẽ thấy các tài liệu tham khảo [1](https://gist.github.com/leommoore/f9e57ba2aa4bf197ebc5) và [2](https://docs.fileformat.com/vi/image/jfif/). ==> Đây là file ảnh định dạng `.jfif`.
##### Tuy vậy, như 2 file tài liệu và dữ kiện đầu bài, file trên có vẻ như đã bị xáo trộn về thứ tự các giá trị hex. Giá trị ban đầu là như sao: `ff d8 ff e0 ...` tức là đảo 2 giá trị liền kề, hợp lại thành 1 cụm, sau đó đảo vị trí của 2 cụm liền kề với nhau.
#### Đầu tiên, lưu kết quả hexdump vào một file:
```
$ hexdump -e '16/1 "%02x " "\n"' -v challengefile | sed '/^\*$/d' > hex2reverse2.txt
$ less hex2reverse2.txt
e0 ff d8 ff 46 4a 10 00 01 00 46 49 01 00 00 01
00 00 01 00 43 00 db ff 06 06 08 00 08 05 06 07
09 07 07 07 0c 0a 08 09 0b 0c 0d 14 12 19 0c 0b
```
> `hexdump -e '16/1 "%02x " "\n"' -v file.hex`: in ra giá trị hexdump mà không sử dụng '*' hay tượng trưng cho giá trị hex lặp lại (nhiều dòng lặp lại giá trị hex == *).
> `sed '/^\*$/d`: loại bỏ các dòng chứa *.
##### Tiếp đến, viết một script python để chia lại thứ tự của 2 giá trị hex liền kề và in ra 2 giá trị đó trong 1 từ:
```python
def reorder_hex_line(line):
    hex_values = line.split()  #Chia dòng ra thành các giá trị hex riêng biệt.
    reordered_values = [hex_values[i:i+2][::-1] for i in range(0, len(hex_values), 2)]
    # Sắp xếp các dòng
    reordered_line = ' '.join(''.join(pair) for pair in reordered_values)
    return reordered_line

# In ra file 
def reorder_hex_file(input_file, output_file):
    with open(input_file, 'r') as f_in, open(output_file, 'w') as f_out:
        for line in f_in:
            reordered_line = reorder_hex_line(line.strip())
            f_out.write(reordered_line + '\n')

input_file = 'hex2reverse2.txt'
output_file = 'challengefile.txt'

reorder_hex_file(input_file, output_file)

```
##### Như vậy có nội dụng file `challengefile.txt` như sau:
```
ffe0 ffd8 4a46 0010 0001 4946 0001 0100
0000 0001 0043 ffdb 0606 0008 0508 0706
0709 0707 0a0c 0908 0c0b 140d 1912 0b0c
141d 130f 1e1d 1a1f 1c20 1a1c 2720 242e
231c 222c 3729 1c28 3134 2c30 1f27 3434
...
```
##### Sử dụng tool online để thay đổi vị trí 2 từ liên tiếp với nhau: [onlinetextools](https://onlinetexttools.com/swap-words-in-text)
> Sử dụng các setting mặc định, import file `challengefile.txt` vào.
##### Sử dụng tool [browserling](https://www.browserling.com/tools/remove-all-whitespace) để xóa khoảng trắng giữa các chữ:
```
ffd8ffe000104a46494600010100000100010000ffdb004300080606070605080707070909080a0c1...
```
#### Cuối cùng, sử dụng tool chuyển đổi giá trị hex sang ảnh: [codepen](https://codepen.io/abdhass/full/jdRNdj)
##### => Lấy flag thành công!
