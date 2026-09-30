# 10: Komut Referansı

Bu komutlar yalnızca yerel VulnHub laboratuvarı için belgelenmiştir.

`ash
ip a
nmap -sn <LOCAL_SUBNET>
netdiscover -r <LOCAL_SUBNET>
curl -I http://10.158.174.179
curl http://10.158.174.179smbclient -L //10.158.174.179 -N
enum4linux -a 10.158.174.179smbclient //10.158.174.179/IPC$ -U <USERNAME>
curl -I http://10.158.174.179:10000
curl -I http://10.158.174.179:20000
``n
Dizin keşfi komutları temizlenmiş not dosyasında korunmuştur. Kullanıcı adı ve parola değerleri yayımlanmadı; yalnızca lab-only credential olarak ele alındı.
