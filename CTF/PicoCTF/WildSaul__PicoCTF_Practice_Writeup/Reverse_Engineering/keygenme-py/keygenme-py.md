# KEYGENME-PY
###### Tags: `picoCTF 2021` `Reverse Engineering`
### DESCRIPTION
`keygenme-trial.py`
### 1. Hiểu code của `keygenme-trial.py`:
##### + Trong đoạn đầu của code, thấy có thông tin về *flag*:
```python
# GLOBALS --v
arcane_loop_trial = True
jump_into_full = False
full_version_code = ""

username_trial = "ANDERSON"
bUsername_trial = b"ANDERSON"

key_part_static1_trial = "picoCTF{1n_7h3_|<3y_of_"
key_part_dynamic1_trial = "xxxxxxxx"
key_part_static2_trial = "}"
key_full_template_trial = key_part_static1_trial + key_part_dynamic1_trial + key_part_static2_trial
```
##### + Để ý thấy trong phần *key_part_dynamic1_trial* là giá trị ẩn, cần được giải mã để hoàn thành flag:
##### + Tìm kiếm thấy trong phần `def check_key` có liên quan đến phần dynamic key kia khi chức năng chỷ yếu của hàm này để kiểm tra *dynamic key*.
```python
def check_key(key, username_trial):

    global key_full_template_trial

    if len(key) != len(key_full_template_trial):
        return False
    else:
        # Check static base key part --v
        i = 0
        for c in key_part_static1_trial:
            if key[i] != c:
                return False

            i += 1

        # TODO : test performance on toolbox container
        # Check dynamic part --v
        if key[i] != hashlib.sha256(username_trial).hexdigest()[4]:
            return False
        else:
            i += 1

        if key[i] != hashlib.sha256(username_trial).hexdigest()[5]:
            return False
        else:
            i += 1

        if key[i] != hashlib.sha256(username_trial).hexdigest()[3]:
            return False
        else:
            i += 1

        if key[i] != hashlib.sha256(username_trial).hexdigest()[6]:
            return False
        else:
            i += 1

        if key[i] != hashlib.sha256(username_trial).hexdigest()[2]:
            return False
        else:
            i += 1

        if key[i] != hashlib.sha256(username_trial).hexdigest()[7]:
            return False
        else:
            i += 1

        if key[i] != hashlib.sha256(username_trial).hexdigest()[1]:
            return False
        else:
            i += 1

        if key[i] != hashlib.sha256(username_trial).hexdigest()[8]:
            return False

```
##### + Thông tin đoạn code trên cho ta biết khi cung cấp một string với chiều dài = 8 ký tự, trong trường hợp này là `Username_trial = "ANDERSON"`  đoạn code sẽ trả về giá trị lục phân của hàm băm SHA-256 của ký tự đó. Lần lượt theo thứ tự sau: *4, 5, 3, 6, 2, 7, 1, 8*: một manh mối cho *key_part_dynamic1_trial* vì cũng có 8 ký tự.
##### + Tuy nhiên trong hàm trên chi đơn thuần là trả về giá trị *True* *False* nên ta sẽ viết một chương trình sử dụng code trên để in ra:
### 2. Viết chương trình in flag:
```python
mport hashlib
import base64

key_part_static1_trial = "picoCTF{1n_7h3_|<3y_of_"
key_part_dynamic1_trial = "xxxxxxxx"
key_part_static2_trial = "}"
key_full_template_trial = key_part_static1_trial + key_part_dynamic1_trial + key_part_static2_trial

username_trial = b"ANDERSON"

potential_dynamic_key = ""

# bắt đầu phân tích input từ đoạn nào trong key_full_template_trial:
offset = 23

# vị trí trong username_trial
positions = [4,5,3,6,2,7,1,8]

for p in positions:
    potential_dynamic_key += hashlib.sha256(username_trial).hexdigest()[p]

key = key_part_static1_trial + potential_dynamic_key + key_part_static2_trial
print(key)
print(len(key))
```
##### + Chạy chương trình trên và được flag:
```text
picoCTF{1n_7h3_|<3y_of_01582419}
32
```

