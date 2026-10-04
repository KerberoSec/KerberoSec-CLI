# miro
## Challenge details
|       Event        | Challenge | Category | Points  |
|:-------------------|:----------|:---------|:-------:|
|  codegate quals 2018     |     miro      |    Crypto      |    612     |

### Description
> Do you wanna play the game? :D   
### Attachments
> `client.py`  
> `miro.pcap`
## Solution
查看client.py和miro.pcap，感觉是通过解密ssl流量，从而获取client.py中u和l的明文。
在miro.pcap中，我们首先生成证书，Server Hello,Certificate, Server Hello Done >> Secure Socket Layer >> TLSv1.2 Record Layer: Handshake Protocol: Certificate >> Handshake Protocol: Certificate >> Certificates (754 bytes) >> Certificate  
右击导出为public.der  
用openssl查看信息openssl x509 -inform DER -in public.der -text  
看到Signature Algorithm: sha256WithRSAEncryption  
于是再用openssl将其转换成pem格式  
从pem中读取n和e，用费马分解法分解n，从而计算出d，再生成私钥  
在wireshark中选中 Edit >> Preferences >> Protocols >> ssl 将刚刚生成的私钥添加进去  
查看application data解密出来的信息, 填充完整client.py  
```python
elif user_input == "l":
  tls_client.send("27692894751dba96ab78121842b9c74b6191fd8c838669a395f65f3db45c03e2\n")  
```
和
```python
if user_input == "u":
  tls_client.send("9de133535f4a9fe7de66372047d49865d7cdea654909f63a193842f36038d362\n")
```
走通迷宫后得到flag
Flag is {C4n_y0u_d3crypt_th3_P4ck3t??}
