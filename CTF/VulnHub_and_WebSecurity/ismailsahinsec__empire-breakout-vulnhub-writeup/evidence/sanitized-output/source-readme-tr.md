# Empire: Breakout: VulnHub Write-up

[🇬🇧 English version](../../README_EN.md)

> **Empire: Breakout** VulnHub makinesinin **Kali Linux** kullanılarak çözülmüş adım adım analizidir.
>
> Bu repo sadece komut dökümü değildir. Çözüm sırasında kullanılan **düşünce akışını**, **pivot mantığını** ve **servisler arası ilişki kurma pratiğini** göstermek için hazırlanmıştır.

---

## İçindekiler

- [Proje Hakkında](#proje-hakkında)
- [Hedef Makine](#hedef-makine)
- [Amaç](#amaç)
- [Yöntem Özeti](#yöntem-özeti)
- [Kullanılan Araçlar](#kullanılan-araçlar)
- [Adım Adım Çözüm](#adım-adım-çözüm)
- [Önemli Çıkarımlar](#önemli-çıkarımlar)
- [Öğrenilen Dersler](#öğrenilen-dersler)
- [Repo Yapısı](#repo-yapısı)
- [Yasal ve Etik Not](#yasal-ve-etik-not)

---

## Proje Hakkında

Bu repo, VulnHub üzerinde yayınlanan ve eğitim amacıyla hazırlanmış **Empire: Breakout** sanal makinesinin çözüm sürecini belgelemek için oluşturulmuştur.

Bu write-up'ın amacı sadece sonuca gitmek değildir. Aynı zamanda:

- neden belirli bir komutun kullanıldığını göstermek
- alınan çıktının ne anlattığını yorumlamak
- bir servisten elde edilen verinin başka bir serviste nasıl kullanıldığını açıklamak
- gerçek pentest düşünce yapısının nasıl geliştiğini göstermek

Bu nedenle bu repo yalnızca komutlardan değil, **yorumlama** ve **karar verme mantığından** da oluşur.

---

## Hedef Makine

- **Makine:** Empire: Breakout
- **Platform:** VulnHub
- **Kategori:** Boot2Root / Pentest Lab
- **Çözüm Ortamı:** Kali Linux

---

## Amaç

Bu makinedeki amaç, açık servisleri tespit etmek, doğru giriş noktasını bulmak ve farklı servislerden elde edilen bulguları birleştirerek erişimi doğrulamaktı.

Bu çözümdeki kritik nokta şuydu:

> Tek bir servise takılı kalmadan, web tarafında bulunan ipucunu SMB enumeration ile birleştirip doğru yönetim paneline ulaşmak.

---

## Yöntem Özeti

Çözüm şu mantıkla ilerledi:

1. Ağdaki hedef cihazı tespit etme
2. Açık servisleri doğrulama
3. Web tarafındaki gizli ipucunu çıkarma
4. Gizli veriyi decode etme
5. SMB üzerinden kullanıcı bilgisini toplama
6. Kullanıcı adı + parola kombinasyonunu doğrulama
7. Doğru yönetim panelinde giriş yapma

### Zincir

```text
Web → Gizli veri → SMB → Kullanıcı adı → Panel → Giriş
```

---

## Kullanılan Araçlar

- `ip a`
- `nmap`
- `netdiscover`
- `curl`
- `gobuster`
- `smbclient`
- `enum4linux`
- tarayıcı

---

## Adım Adım Çözüm

### 1. Ağ bilgisini öğrenme

Önce saldırı makinesinin IP adresi öğrenildi:

```bash
sudo su
ip a
```

Ardından ağ bloğu çıkarıldı ve aktif cihazlar keşfedildi:

```bash
nmap -sn <LOCAL_SUBNET>
```

Alternatif:

```bash
netdiscover -r <LOCAL_SUBNET>
```

---

### 2. Web servisinin doğrulanması

Hedefte web servisinin aktif olup olmadığını görmek için HTTP başlıkları kontrol edildi:

```bash
curl -I http://<TARGET_IP>
```

Buradan **Apache** çalıştığı anlaşıldı.

Sonrasında ana sayfa içeriği çekildi:

```bash
curl http://<TARGET_IP>
```

İlk bakışta varsayılan Apache sayfası gibi görünüyordu. Ancak kaynak kodda gizli bir HTML yorum satırı bulundu.

---

### 3. HTML comment içindeki ipucunun çıkarılması

Sayfanın içinde bilerek saklanmış bir veri vardı.

Bu aşama önemliydi çünkü:

- sayfa ilk bakışta boş görünüyordu
- asıl ipucu kaynak kod içindeydi
- görünür içerikten çok, gizli içerik değerliydi

---

### 4. Gizli verinin çözülmesi

Bulunan metnin **Brainfuck benzeri** bir yapı olduğu fark edildi ve decode edildikten sonra bir credential adayı elde edildi.

Bu verinin ne olduğu ilk anda net değildi. Şunlardan biri olabilirdi:

- parola
- path
- farklı bir erişim anahtarı

Bu yüzden doğrudan sonuca atlamak yerine kontrollü şekilde test edildi.

---

### 5. Web tarafında dizin keşfi

Gizli bir giriş noktası veya dizin olup olmadığını görmek için şu taramalar yapıldı:

```bash
gobuster dir -u http://<TARGET_IP> -w /usr/share/seclists/Discovery/Web-Content/common.txt
gobuster dir -u http://<TARGET_IP> -w /usr/share/seclists/Discovery/Web-Content/big.txt
```

Sonuçlarda klasik Apache dosyaları ve dizinleri görüldü, ancak asıl giriş noktası web root altında çıkmadı.

Bu şu anlama geliyordu:

- web kökü doğrudan giriş vermiyordu
- başka bir servise pivot etmek gerekiyordu

---

### 6. Korumalı endpoint testleri

Daha sonra `server-status` gibi endpoint'ler test edildi:

```bash
curl -I http://<TARGET_IP>/server-status
curl -H "X-Forwarded-For: 127.0.0.1" http://<TARGET_IP>/server-status
```

Bu girişimler başarısız oldu ama yine de bilgi verdi:

- endpoint gerçekten vardı
- basit spoofing ile aşılamıyordu

---

### 7. SMB tarafına pivot

Sonraki adımda SMB enumeration yapıldı:

```bash
smbclient -L //<TARGET_IP> -N
enum4linux -a <TARGET_IP>
```

Buradan iki kritik bilgi çıktı:

- anonim SMB erişimi mümkün görünüyordu
- geçerli bir sistem kullanıcısı vardı

Bu bilgi, web tarafında bulunan gizli veri ile birleşince anlam kazandı.

---

### 8. Credential doğrulama

Elde edilen kullanıcı adı ve çözülmüş değer birlikte test edildi:

```bash
smbclient //<TARGET_IP>/IPC$ -U <USERNAME>
```

Giriş başarılı oldu ve böylece bulunan verinin gerçekten geçerli bir credential olduğu doğrulandı.

Her ne kadar `IPC$` içinde kullanılabilir bir dosya bulunmasa da iki kritik bilgi kesinleşti:

- kullanıcı adı doğruydu
- parola doğruydu

Bu, çözümün en önemli kırılma noktalarından biriydi.

---

### 9. Yönetim panellerinin kontrolü

Açık yönetim servisleri ayrıca test edildi:

```bash
curl -I http://<TARGET_IP>:10000
curl -I http://<TARGET_IP>:20000
```

Her iki servisin de **MiniServ tabanlı** panel olduğu görüldü ve HTTPS gerektiği anlaşıldı.

Doğru hedefler:

```text
https://<TARGET_IP>:10000
https://<TARGET_IP>:20000
```

`10000` portunda giriş başarısız oldu. Ancak aynı credential `20000` portunda çalıştı ve erişim sağlandı.

Buradan çıkan önemli sonuç şuydu:

- geçerli credential her serviste çalışmak zorunda değildir
- credential doğrulandıktan sonra doğru servis ayrıca bulunmalıdır

---

## Önemli Çıkarımlar

Bu makinede başarı tek bir exploit'ten gelmedi. Başarı, **bulgular arasında ilişki kurabilmekten** geldi.

Temel mantık şuydu:

- web tek başına yeterli değildi
- SMB tek başına yeterli değildi
- yönetim paneli tek başına yeterli değildi
- ama hepsi birleştirildiğinde doğru zincir ortaya çıktı

Bu yüzden bu çalışma, özellikle başlangıç seviyesinde **enumeration mantığını geliştirmek** için değerlidir.

---

## Öğrenilen Dersler

- Varsayılan görünen sayfalar bile kritik ipucu saklayabilir
- Kaynak kod incelemesi çoğu zaman görünür içerikten daha değerlidir
- Bir servisten gelen bilgi başka bir servisin anahtarı olabilir
- Başarısız denemeler de ilerleme sağlar
- Pentest'te asıl beceri komut ezberi değil, çıktıyı doğru yorumlamaktır

---

## Repo Yapısı

```text
empire-breakout-vulnhub-writeup/
├── ../../README_EN.md
├── README.tr.md
├── images/
│   ├── 01-target-overview.png
│   ├── 02-html-comment.png
│   ├── 03-smb-enum.png
│   └── 04-panel-login.png
├── notes/
│   └── sanitized-notes.txt
└── LICENSE
```

---

## Yasal ve Etik Not

Bu repo yalnızca **eğitim amacıyla**, **yetkili lab ortamında** ve **VulnHub üzerinde kasıtlı olarak zafiyetli şekilde yayınlanmış bir makine** kapsamında hazırlanmıştır.

Buradaki bilgiler:

- gerçek sistemlere karşı izinsiz kullanım için değildir
- yalnızca kontrollü laboratuvar ve öğrenme ortamlarında değerlendirilmelidir

Gerçek sistemlerde test yapılacaksa mutlaka açık izin alınmalıdır.

---

## Son Söz

Bu çalışma benim için sadece bir makine çözümü değildi.

Aynı zamanda şu farkı daha net anlamamı sağladı:

> Pentest'te asıl beceri sadece araç kullanmak değil, her çıktının sana ne anlattığını okuyabilmektir.

