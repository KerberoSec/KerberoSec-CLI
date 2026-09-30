# Level 7
###### User: *natas7* Pass: *jmxSiH3SP6Sonf8dv66ng8v1cIEdjXWr*
+ Inspect trang, thấy có comment: ‘<!-- hint: password for webuser natas8 is in /etc/natas_webpass/natas8 -->’  -> truy cập địa chỉ trên -> pass

# Level 8
###### User: *natas8* Pass: *a6bZCNYwdKqN5cGP11ZdtPg0iImQQhAB*
+ Tương tự như level 6, ta sẽ kiểm tra qua phần source code, có dòng như sau:
```
return bin2hex(strrev(base64_encode($secret)));
```
+ có sẵn encodedSecret: `3d3d516343746d4d6d6c315669563362`
+ secret: đoạn input người dùng sẽ nhập vào
+ bin2hex: chuyển chuỗi từ nhị phân sang hệ thập lục phân
+ strrev: đảo ngược chuỗi
+ base64_encode: mã hóa bằng base64
-> Để ra được secret:
```
echo <encodedSecret> | xxd -r -p | rev | base64 -d
```
+ Submit và nhận được pass cho level tiếp theo.
