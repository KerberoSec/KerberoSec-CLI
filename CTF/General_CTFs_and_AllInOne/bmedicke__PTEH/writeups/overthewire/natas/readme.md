# Natas

https://overthewire.org/wargames/natas/

* all passwords are stored in `/etc/natas_webpass/.`
* each level has a #:
  * level URLs are: http://natas#.natas.labs.overthewire.org
  * usernames: `natas#`

## 0

```sh
curl http://natas0.natas.labs.overthewire.org/ # 401
curl -u natas0:natas0 http://natas0.natas.labs.overthewire.org/ # gtVrDuiDfck831PqWsLEZy5gyDz1clto
```

## 0-1

```sh
curl -u natas1:gtVrDuiDfck831PqWsLEZy5gyDz1clto http://natas1.natas.labs.overthewire.org/
# ZluruAthQk7Q2MqmDeTiUij2ZvWy2mBi
```

## 1-2

```sh
curl -u natas1:ZluruAthQk7Q2MqmDeTiUij2ZvWy2mBi http://natas2.natas.labs.overthewire.org/
```
