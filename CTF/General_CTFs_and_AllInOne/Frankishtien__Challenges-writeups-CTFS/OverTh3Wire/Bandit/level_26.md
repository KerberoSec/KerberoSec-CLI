# level 26

```
ssh bandit26@bandit.labs.overthewire.org -p 2220 -i private.pem
```

<img width="1000" height="672" alt="image" src="https://github.com/user-attachments/assets/3c3ec687-f9e9-4989-84fe-bc8a3d1d6bc3" />

❓ Why was the call closed immediately?

because:

Bandit26's shell is called showtext

This works:

```
more ~/text.txt
```

You have a large terminal

➡️ more View the whole file at once

➡️ Finish

➡️ The shell is locked

➡️ SSH connection lock

That's why I was in and out in two seconds 😄

✅ The correct solution (focus here 🔥)
------------------------

### 🔴 Before anything

**Make the terminal window very small**\
Make it small so that the text **does not cover the screen**

<img width="789" height="432" alt="image" src="https://github.com/user-attachments/assets/ac44af1e-a28d-4c93-8d14-ab7d77cbab72" />

<img width="361" height="256" alt="image" src="https://github.com/user-attachments/assets/cd7f8eb9-ed64-49c2-a06c-19a71e67fc63" />

```
v
```

<img width="762" height="354" alt="image" src="https://github.com/user-attachments/assets/e468596e-2020-421a-b13f-b301d9cf700f" />

```
:set shell=/bin/bash
:shell

```

<img width="1164" height="712" alt="image" src="https://github.com/user-attachments/assets/368a29c3-6faa-4156-a0af-aa79b8cc4a74" />

<img width="675" height="298" alt="image" src="https://github.com/user-attachments/assets/9a485504-f640-4faa-aea8-a098da34fccd" />

```
head bandit27-do
```

<img width="1180" height="627" alt="image" src="https://github.com/user-attachments/assets/73c1b83d-9cac-4435-8cf9-5f9e76470221" />

<img width="1258" height="691" alt="image" src="https://github.com/user-attachments/assets/b6378b99-d25b-4531-a75a-2ba0e9a8f3c9" />

----

```
./bandit27-do id
```

<img width="798" height="46" alt="image" src="https://github.com/user-attachments/assets/e959466b-8422-44de-8885-826e45c7b9c2" />

```
./bandit27-do cat /etc/bandit_pass/bandit27
```

<img width="971" height="165" alt="image" src="https://github.com/user-attachments/assets/dcfdea36-6a21-40c1-aa41-05e77ffc9379" />

```
upsNCc7vzaRDx6oZC6GiR6ERwe1MowGB
```

