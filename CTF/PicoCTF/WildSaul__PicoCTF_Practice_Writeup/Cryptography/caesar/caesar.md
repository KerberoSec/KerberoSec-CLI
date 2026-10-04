# caesar
##### Tags: `picoCTF 2021` `Cryptography`
### DESCRIPTION
##### Decrypt this [message](https://jupiter.challenges.picoctf.org/static/6385b895dcb30c74dbd1f0ea271e3563/ciphertext).
##### Đây là một chanllenge liên quan đến mật mã Caesar. 
> Caesar là một trong những kỹ thuật mã hóa đơn giản và phổ biến nhất. Đây là một dạng mật mã thay thế, trong đó mỗi ký tự trên văn bản thô sẽ được thay bằng một ký tự khác, có vị trí cách nó một khoảng xác định trong bảng chữ cái.
##### Vì bài không cho dữ kiện rằng sẽ shift bao nhiêu ký tự và bảng chữ cái chỉ có thể shift được 24 lần, nên sẽ tạo một chương trình 'bruteforce' mật mã này:
``` python
def caesar_decode(ciphertext):
    decrypted_messages = []
    for shift in range(26):
        decrypted_message = ""
        for char in ciphertext:
            if char.isalpha():
                shifted_char = chr(((ord(char) - ord('a' if char.islower() else 'A') - shift) % 26) + ord('a' if char.islower() else 'A'))
                decrypted_message += shifted_char
            else:
                decrypted_message += char
        decrypted_messages.append(decrypted_message)
    return decrypted_messages

def main():
    ciphertext = input("Enter the ciphertext: ")
    decrypted_messages = caesar_decode(ciphertext)
    for i, message in enumerate(decrypted_messages):
        print(f"Shift {i}: {message}")

if __name__ == "__main__":
    main()

```
##### Chạy chương trình và dán đoạn chuỗi được mã hóa vào:
```
python ceasar-bruteforce.py 
Enter the ciphertext: dspttjohuifsvcjdpoabrkttds
Shift 0: dspttjohuifsvcjdpoabrkttds
Shift 1: crossingtherubiconzaqjsscr
Shift 2: bqnrrhmfsgdqtahbnmyzpirrbq
Shift 3: apmqqglerfcpszgamlxyohqqap
Shift 4: zolppfkdqeboryfzlkwxngppzo
Shift 5: ynkooejcpdanqxeykjvwmfooyn
Shift 6: xmjnndiboczmpwdxjiuvlennxm
Shift 7: wlimmchanbylovcwihtukdmmwl
Shift 8: vkhllbgzmaxknubvhgstjcllvk
Shift 9: ujgkkafylzwjmtaugfrsibkkuj
Shift 10: tifjjzexkyvilsztfeqrhajjti
Shift 11: sheiiydwjxuhkrysedpqgziish
Shift 12: rgdhhxcviwtgjqxrdcopfyhhrg
Shift 13: qfcggwbuhvsfipwqcbnoexggqf
Shift 14: pebffvatgurehovpbamndwffpe
Shift 15: odaeeuzsftqdgnuoazlmcveeod
Shift 16: nczddtyrespcfmtnzyklbuddnc
Shift 17: mbyccsxqdrobelsmyxjkatccmb
Shift 18: laxbbrwpcqnadkrlxwijzsbbla
Shift 19: kzwaaqvobpmzcjqkwvhiyraakz
Shift 20: jyvzzpunaolybipjvughxqzzjy
Shift 21: ixuyyotmznkxahoiutfgwpyyix
Shift 22: hwtxxnslymjwzgnhtsefvoxxhw
Shift 23: gvswwmrkxlivyfmgsrdeunwwgv
Shift 24: furvvlqjwkhuxelfrqcdtmvvfu
Shift 25: etquukpivjgtwdkeqpbcsluuet
```
##### => `Shift 1` tạo ra chuỗi có ý nghĩa. Lấy flag thành công!
