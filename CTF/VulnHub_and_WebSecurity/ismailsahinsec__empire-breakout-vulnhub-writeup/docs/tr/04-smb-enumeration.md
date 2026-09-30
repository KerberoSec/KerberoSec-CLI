# 04: SMB Enumeration

## Amaç

Web tarafındaki ipucunun kullanıcı veya parola ile ilişkili olup olmadığını anlamak.

## Komut

```bash
smbclient -L //10.158.174.179 -N
enum4linux -a 10.158.174.179
smbclient //10.158.174.179/IPC$ -U <USERNAME>
```

## Parametreler

\-L\ paylaşım listesini ister, \-N\ anonymous deneme yapar, \-a\ kapsamlı enumeration modudur.

## Bulgu

Yerel taslaklar anonymous SMB denemesi ve kullanıcı bilgisinin SMB enumeration ile ilişkilendirildiğini belirtir. Kullanıcı adı ve parola placeholder olarak bırakılmıştır.

## Analiz

SMB’den elde edilen kullanıcı bilgisi web ipucuyla birleştirilerek panel denemesine geçildi.

## Savunma

SMB logları anonymous listeleme ve IPC$ oturum denemelerini gösterebilir. Guest erişimi kapatılmalı ve SMB signing uygulanmalıdır.
