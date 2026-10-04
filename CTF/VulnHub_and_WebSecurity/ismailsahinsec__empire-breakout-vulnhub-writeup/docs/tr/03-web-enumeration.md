# 03: Web Enumeration

## Amaç

Varsayılan görünen web içeriğinde gizli ipucu veya yönetim yolu olup olmadığını anlamak.

## Komut

HTTP içerik kontrolü \curl\ ile, dizin keşfi ise yerel kanıt dosyalarında belirtilen wordlist tabanlı araçla yapılmıştır. Tam komutlar \vidence/sanitized-output/sanitized-notes.txt\ içindedir.

## Bulgu

Yerel taslaklar HTML kaynak kodunda gizli yorum/ipucu bulunduğunu belirtir. Korunan Apache durum endpointi başarılı giriş noktası sağlamamıştır.

*[Image: HTML yorum kanıtı]*

## Analiz

Gizli ipucu credential adayı olarak ele alındı ve SMB bulgularıyla ilişkilendirildi.

## Savunma

Web access/error logları çok sayıda 404/403 ve wordlist davranışını gösterebilir. Hassas yorumlar kaynak kodda bırakılmamalıdır.
