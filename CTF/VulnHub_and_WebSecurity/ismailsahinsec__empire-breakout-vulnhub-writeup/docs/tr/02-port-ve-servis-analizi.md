# 02: Port ve Servis Analizi

## Amaç

Erişilebilir servisleri doğrulamak ve enumeration önceliğini belirlemek.

## Komut

```bash
curl -I http://10.158.174.179
curl -I http://10.158.174.179:10000
curl -I http://10.158.174.179:20000
```

## Parametreler

`-I` yalnızca HTTP başlıklarını ister ve servis canlılığını hızlı doğrular.

## Bulgu

Yerel taslaklarda HTTP, SMB ve `10000` / `20000` panel kontrolleri doğrulanır. Tam nmap çıktısı bulunmadı.

## Analiz

HTTP tek başına giriş vermedi; yönetim panelleri credential doğrulamasında önem kazandı.

## Savunma

Firewall, web access logları ve panel logları bu istekleri gösterebilir.