# 05: İlk Erişim

## Amaç

Doğrulanan credential adayının hangi servis üzerinde geçerli olduğunu belirlemek.

## Komut

```bash
curl -I http://10.158.174.179:10000
curl -I http://10.158.174.179:20000
```

Tarayıcı hedefleri \https://10.158.174.179:10000\ ve \https://10.158.174.179:20000\.

## Bulgu

Yerel README taslaklarına göre \10000\ portunda giriş başarısız olmuş, aynı lab-only credential \20000\ portunda çalışmıştır. Credential yayımlanmamıştır.

*[Image: Panel giriş kanıtı]*

## Analiz

Credential doğrulaması bağlama bağlıdır; bu labda doğrulanmış ilk erişim noktası \20000\ portudur.

## Savunma

Panel logları başarısız ve başarılı oturum açma denemelerini gösterebilir. MFA, IP allowlist ve güçlü parola politikası önerilir.
