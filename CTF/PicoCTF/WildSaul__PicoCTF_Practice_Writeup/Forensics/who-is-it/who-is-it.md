# Who is it
##### Tags: `picoCTF 2023` `Forensics` `email`
### DESCRIPTION
Someone just sent you an email claiming to be Google's co-founder Larry Page but you suspect a scam. Can you help us identify whose mail server the email actually originated from? Download the email file [here](https://artifacts.picoctf.net/c/499/email-export.eml). Flag: picoCTF{FirstnameLastname}
##### Đây là một chanllenge liên quan đến thu thập thông tin dựa trên các thông tin cho sẵn.
##### Xem file báo cáo email:
```
...
Received-SPF: pass (google.com: domain of lpage@onionmail.org designates 173.249.33.206 as permitted sender) client-ip=173.249.33.206;
...
```
##### Để ý thấy đây là một dòng tin SPF: Sender Policy Framework, một cơ chế xác thực dùng để xác nhận tin nhắn được gửi đi từ server email được ủy quyền, trong trường hợp này là server với địa chỉ `173.249.33.206`
##### Kiểm tra thông tin IP với chương trình `whois`:
```
$ whois 173.249.33.206
...
created:        2009-12-09T13:41:08Z
last-modified:  2021-09-14T10:49:04Z
source:         RIPE # Filtered

person:         Wilhelm Zwalina
address:        Contabo GmbH
address:        Aschauer Str. 32a
...
```
##### => Như vậy tên người gửi thật là `Wilhelm Zwalina`. Lấy flag thành công!
