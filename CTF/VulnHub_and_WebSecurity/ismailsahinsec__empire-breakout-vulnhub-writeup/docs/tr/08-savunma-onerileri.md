# 08: Savunma Önerileri

| Aşama | Saldırgan faaliyeti | Muhtemel log | Tespit yöntemi | Savunma |
| ----- | ------------------- | ------------ | -------------- | ------- |
| Keşif | Host discovery | Firewall, IDS | Kısa sürede çoklu yoklama | Segmentasyon ve IDS alarmı |
| Web enumeration | Dizin taraması | Web access/error logs | Çok sayıda 404/403 | Rate limit, WAF, gereksiz dosyaları kaldırma |
| Kaynak inceleme | HTML yorumundan ipucu | Web access logs | Normal GET isteği | Gizli bilgi yorumlarda tutulmamalı |
| SMB enumeration | Anonymous listeleme | SMB logs | Guest/anonymous oturumlar | Guest kapatma, SMB signing |
| Panel login | Credential denemesi | Webmin/MiniServ logs, auth.log | Başarısız/başarılı giriş korelasyonu | MFA, IP allowlist, güçlü parola |
| Yerel yükseltme | Doğrulanamadı | auth.log, journal, process logs | Anormal sudo/SUID/cron değişimleri | En az ayrıcalık, dosya bütünlüğü izleme |

MITRE ATT&CK eşleştirmesi eğitim amaçlı analitik yorumdur; doğrulanamayan teknikler kesinleştirilmemiştir.
