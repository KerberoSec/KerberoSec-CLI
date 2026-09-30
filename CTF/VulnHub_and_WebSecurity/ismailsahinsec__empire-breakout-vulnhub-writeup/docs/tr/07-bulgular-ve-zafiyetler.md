# 07: Bulgular ve Zafiyetler

| Bulgu | Durum | Etki | Kanıt |
| --- | --- | --- | --- |
| Web kaynak kodunda gizli ipucu | Doğrulandı | Credential adayına yol açtı | HTML yorum ekran görüntüsü |
| SMB enumeration ile kullanıcı bilgisi | Doğrulandı | Credential korelasyonu sağladı | README ve SMB notu |
| Port \20000\ panel girişi | Doğrulandı | İlk erişim sağlandı | Panel ekran görüntüsü |
| Privilege escalation | Doğrulanamadı | Bilinmiyor | Kanıt yok |

`mermaid
flowchart TB
  A[HTML ipucu] --> D1[Kaynak kod temizliği]
  B[SMB enumeration] --> D2[Guest erişimi kapatma]
  C[Panel login] --> D3[MFA ve erişim kısıtlama]
  E[Yetki yükseltme: doğrulanamadı] --> D4[Log ve dosya bütünlüğü izleme]
`
