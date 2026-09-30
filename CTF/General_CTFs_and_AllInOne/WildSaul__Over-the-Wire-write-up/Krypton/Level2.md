# Level 2
##### Trong level này, mật khẩu cho level tiếp theo là một ciphertext được mã hóa theo `Ceaser Cipher`.
##### Đầu tiên, tạo một thư mục tạm thời, gắn symbol link với file `krypton3` và `keyfile.dat`:
```
$ mktemp -d
/tmp/tmp.BRHDocU6Ky
$ cd /tmp/tmp.BRHDocU6Ky
$ ln -s /krypton/krypton2/keyfile.dat
$ ln -s /krypton/krypton2/krypton3
$ chmod 777 .
```
##### Vì không biết key để giải mã `krypton3`, viết một script để bruteforce:
##### Tạo file `result` để nhận kết quả và cho `encrypt` xử lý tiếp
```
$ #!/bin/bash
for ((i = 0; i < 24; i++)); do
  # Chạy file encrypt
  $(/krypton/krypton2/encrypt result)
  result=$(cat ciphertext)
  # Kiểm tra xem chương trình chạy thành công không.
  if [[ $? -eq 0 ]]; then
    # In kết quả ra màn hình
    echo "Encryption result: $result"

    # copy nội dung file ciphertext vào result
    cp ciphertext result
  else
    echo "Error: Encryption failed."
  fi
done
Encryption result: CAESARISEASY
Encryption result: OMQEMDUEQMEK
Encryption result: AYCQYPGQCYQW
Encryption result: MKOCKBSCOKCI
Encryption result: YWAOWNEOAWOU
Encryption result: KIMAIZQAMIAG
Encryption result: WUYMULCMYUMS
Encryption result: IGKYGXOYKGYE
Encryption result: USWKSJAKWSKQ
Encryption result: GEIWEVMWIEWC
Encryption result: SQUIQHYIUQIO
Encryption result: ECGUCTKUGCUA
Encryption result: QOSGOFWGSOGM
Encryption result: CAESARISEASY
Encryption result: OMQEMDUEQMEK
Encryption result: AYCQYPGQCYQW
Encryption result: MKOCKBSCOKCI
Encryption result: YWAOWNEOAWOU
Encryption result: KIMAIZQAMIAG
Encryption result: WUYMULCMYUMS
Encryption result: IGKYGXOYKGYE
Encryption result: USWKSJAKWSKQ
Encryption result: GEIWEVMWIEWC
Encryption result: SQUIQHYIUQIO
```
-> Pass cho level 2 là `CAESARISEASY`
