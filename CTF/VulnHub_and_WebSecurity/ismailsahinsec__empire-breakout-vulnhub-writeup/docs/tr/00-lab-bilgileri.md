# 00: Lab Bilgileri

| Alan | Durum |
| --- | --- |
| Lab | Empire: Breakout / VulnHub |
| Hedef IP | `10.158.174.179` |
| Doğrulanan araçlar | `nmap`, `netdiscover`, `curl`, `gobuster`, `smbclient`, `enum4linux`, tarayıcı |
| Doğrulanan servisler | HTTP, SMB, `10000` ve `20000` üzerinde panel kontrolleri |
| Doğrulanamayanlar | Apache tam sürümü, Hydra kullanımı, user/root flag, privilege escalation zinciri |

## Kanıt Envanteri

- `assets/screenshots/01-discovery/01-target-overview.png`
- `assets/screenshots/02-enumeration/02-html-comment.png`
- `assets/screenshots/03-initial-access/04-panel-login.png`
- `evidence/sanitized-output/sanitized-notes.txt`
- `evidence/enumeration/03-smb-enum-needed.txt`

Her teknik bölüm amaç, komut, parametre, bulgu, analiz ve savunma yapısıyla yazılmıştır. Kanıtı olmayan bilgi gerçekmiş gibi sunulmamıştır.