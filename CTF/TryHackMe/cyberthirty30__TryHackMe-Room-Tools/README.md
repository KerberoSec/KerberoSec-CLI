# TryHackMe Room Tools

## **Fools Mate TryHackMe**

| Room Name | Difficulty | Creator | Subscription Type |
| :---- | :---- | :---- | :---- |
| [Fools Mate](https://tryhackme.com/room/foolsmate) | Easy | TryHackMe & DrGonz0 | Free |
| [Fools Mate, Revenge](https://tryhackme.com/room/foolsm8v2) | Medium | TryHackMe & DrGonz0 | Free |

   

#### Fools Mate: How to Run It
1. **Default Run (Sends `a1` to `a8`):**
```bash
Linux
python3 fools_mate.py 10.10.186.130
python3 fools_mate_revenge.py 10.10.186.130

Windows
py fools_mate.py 10.10.186.130
py fools_mate_revenge.py 10.10.186.130

```

2. **Custom Positions Run:**
```bash
Linux
python3 fools_mate.py 10.10.186.130 --from-pos b2 --to-pos g5
python3 fools_mate_revenge.py 10.10.186.130 --from-pos b2 --to-pos g5

Windows
py  fools_mate.py 10.10.186.130 --from-pos b2 --to-pos g5
py  fools_mate_revenge.py 10.10.186.130 --from-pos b2 --to-pos g5
```

### Fools Mate: Results:
```bash
py fools_mate.py 10.10.186.130

======================================================================================

   █████████  █████ █████ ███████████  ██████████ ███████████    ████████     █████
  ███░░░░░███░░███ ░░███ ░░███░░░░░███░░███░░░░░█░░███░░░░░███  ███░░░░███  ███░░░███
 ███     ░░░  ░░███ ███   ░███    ░███ ░███  █ ░  ░███    ░███ ░░░    ░███ ███   ░░███
░███           ░░█████    ░██████████  ░██████    ░██████████     ██████░ ░███    ░███
░███            ░░███     ░███░░░░░███ ░███░░█    ░███░░░░░███   ░░░░░░███░███    ░███
░░███     ███    ░███     ░███    ░███ ░███ ░   █ ░███    ░███  ███   ░███░░███   ███
 ░░█████████     █████    ███████████  ██████████ █████   █████░░████████  ░░░█████░
  ░░░░░░░░░     ░░░░░    ░░░░░░░░░░░  ░░░░░░░░░░ ░░░░░   ░░░░░  ░░░░░░░░     ░░░░░░

                                                                                                  
    [+] Target Mover API Tool
    [+] Author: cyber30
    [+] Room: Fools Mate TryHackMe
    [+] Date Created:   2026-07-05
    [+] Date:   2026-07-05
======================================================================================

[*] Sending request to http://10.10.186.130/api/move...
[*] Payload: {'from': 'a1', 'to': 'a8'}

[+] Status Code: 200
[+] Response Body:
{"ok":true,"move":"a1a8","fen":"R5k1/5ppp/8/8/8/8/5PPP/6K1 b - - 1 1","status":"checkmate","turn":"b","winner":"white","flag":"THM{...}
```
