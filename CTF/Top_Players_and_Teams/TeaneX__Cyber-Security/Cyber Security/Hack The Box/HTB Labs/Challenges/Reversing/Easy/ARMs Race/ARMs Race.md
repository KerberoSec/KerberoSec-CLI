# 🏍HTB Challenge: ARMs Race Write-up

- **Category:** Reversing
- **Difficulty:** EASY
- **Tools Used:** `Python`
- **Platform:** Hack The Box
- **Flag:** `HTB{un1c0Rn_0R_C4p5T0nE_0R_qeMU_5ubPR0cE55_0r_F0r90TTen_0Ld_R45berry_4NyTH1N9_BUt_n0_M4nu4LLy}`

---
## 🔍 Challenge Description

> The famous hacker Script K. Iddie has finally been caught after many years of cybercrime. Before he was caught, he released a server sending mysterious data, and promised his 0-days to anyone who could solve his multi-level hacking challenge. Now everyone is in an ARMs race to get his exploits. Can you be the one to solve Iddie's puzzle?

**Input:**

```bash
nc 83.136.251.68 34737
```

**Output:**

```
Level 1/50: 370301e3ee1c0fe3e11f45e3a42e07e3162847e3010000e0020000e0cf1500e3921e45e3582306e3352948e3900100e0900200e040160fe3181548e3ab2d06e3ce244fe3000060e2261d0ee34d1d46e3b42905e31c274ce3000060e2941204e3db144de379240fe32b254ee3010040e00200c0e05d1d01e3cf1449e38a240ae325214be3010000e0020000e0de140ce3eb1c47e30d2206e3192e49e3010080e1020080e1a1150de3fd1a4de3712c03e3f92545e3010020e0020020e0911908e3311142e3bf2407e35c2343e3010080e00200a0e091170ce3641f4ce366230de3462644e3010080e1020080e1c61301e302194be3ee2b09e3942f4ae3010080e1020080e1aa1a09e3b01e41e3bc2902e33e2d44e3010080e00200a0e04b1200e3d91643e3872203e31d2d4ce3900100e0900200e041160fe36b1741e3732601e3102d4de3010040e00200c0e03a1d06e335154ee39b2f03e32f2940e3010000e0020000e04d1003e3bc1749e3302b0fe3732345e3010040e00200c0e0ce1d0ee35e1142e3d22a0ce3b42f48e3010080e00200a0e0171b02e3e31643e3212406e3892e40e3010080e00200a0e0601f0ce3bc1b40e30c2408e3112f43e3010080e1020080e1f51c0fe3f41a40e3b3270fe3c52948e3010000e0020000e0

Timeout! You took too long to provide input.
```

---

We start at **Level 1/50**, and we can predict that after passing **Level 50**, we will receive a **flag**.  
The hexadecimal string provided at each level represents **ARM instructions**.  
We are required to **calculate the value of register R0** after executing these instructions.

To solve this, we will use **sockets** to connect to the remote server.  
At each level, we receive the hex-encoded ARM shellcode, compute the result for `R0`, and send it back to the server.

### Possible server responses:

- **"Timeout! You took too long to provide input"**: This happens when the response is sent too slowly.
    
- **"Value not recognized"**: This occurs if the result we send is not a valid hexadecimal value.
    
- **"Wrong answer"**: This indicates that the result sent is incorrect.
    
- **"Level  /50"**: This means we got the correct result and have progressed to the next level.
    

---
## 🚀Script created to solve the challenge:

**Input:**
```bash
nano ARMS.py 
```
### 📄 `ARMS.py`
```py
import socket
from capstone import *

def recvuntil(sock, delim=b'\n'):
    data = b''
    while not data.endswith(delim):
        data += sock.recv(1)
    return data

def HexToArm(data):
    data = data.upper()
    csarmv7 = Cs(CS_ARCH_ARM, CS_MODE_ARM)
    csarmv7.detail = True
    disassembly = []
    for insn in csarmv7.disasm(bytes.fromhex(data), 0):
        disassembly.append(f"{insn.mnemonic} {insn.op_str}")
    R0, R1, R2 = 0, 0, 0
    for line in disassembly:
        if "mov" in line:
            value = int(line.split("#")[1].strip(), 16)
            if "r0" in line:
                R0 = value
            elif "r1" in line:
                R1 = value if "movw" in line or "mov " in line else (R1 + (value << 16))
            elif "r2" in line:
                R2 = value if "movw" in line or "mov " in line else (R2 + (value << 16))
        if any(op in line for op in ["r0, r0, #0", "r0, r0, r1"]):
            action = line.split()[0]
            if action == "add":
                R0 += R1 + R2
            elif action == "sub":
                R0 = (R0 - R1 - R2) + 0xFFFFFFFF
            elif action == "and":
                R0 &= R1 & R2
            elif action == "eor":
                R0 ^= R1 ^ R2
            elif action == "mul":
                R0 *= R1 * R2  # Fixed multiplication operation
            elif action == "orr":
                R0 |= R1 | R2
            elif action == "rsb":
                R0 = 0x100000000 - R0
    return hex(R0 & 0xFFFFFFFF)

def main():
    host = "IP ADDR"
    port = <PORT NUMBER>

    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.connect((host, port))

    for i in range(50):
        response = recvuntil(sock)
        decoded_response = response.decode()
        print(decoded_response)

        if "Wrong answer" in decoded_response:
            sock.close()
            break

        colon_index = decoded_response.find(': ')
        content = decoded_response[colon_index + 1:].strip()
        response = recvuntil(sock, b'Register r0:')
        decoded_response = response.decode()
        result = HexToArm(content)
        sock.send((result + '\n').encode())
        print(decoded_response + result + "\n")

    # Keep the socket open and attempt to receive the flag
    while True:
        response = recvuntil(sock)
        decoded_response = response.decode()
        print(decoded_response)

        if "Flag" in decoded_response:
            print("Flag received:", decoded_response)
            break

    sock.close()

if __name__ == "__main__":
    main()
```

**Input:**
```bash
python3 ARMS.py
```

**Output:**
```
Level 1/50: 370301e3241c00e373184be3352e03e3dc294ee3010080e00200a0e0b71906e3c41e46e3dd2b0de3052a47e3010020e0020020e06b1505e3c31c4fe31b230de3c12745e3010040e00200c0e0eb1c0fe36c114ae3fc2c04e3b32d43e3010000e0020000e03d130ce3921644e37b2501e3fc2144e3010000e0020000e011120be3a01b4ae35a2b08e3682e46e3010080e00200a0e09e110de3e51442e3b52103e3f72a4fe3010020e0020020e0ee1202e3061e4ce34e2001e3e32440e3010080e1020080e13b1f0ae351194ae3e62007e3ed2845e3000060e2ea1300e337164fe38d2109e3332646e3000060e28f1004e3fd1d4de39d2804e3ce2442e3010020e0020020e0621a0ee3941e41e3862b0fe314204fe3010080e1020080e145180de3511140e3672f0de3d72845e3010000e0020000e0e31e05e3dd1644e34f2104e3632148e3010080e1020080e123160ce3d61841e3752b03e3fe2e48e3010020e0020020e064150ae3f31a45e3232a02e3012344e3010040e00200c0e0141f02e3521049e3742f0fe3ed2049e3010080e00200a0e0471b08e3711649e3862a09e31d2248e3010040e00200c0e03b1e06e3591d41e3be2906e313214ee3010020e0020020e0111406e358154fe3ce2d01e31f2e41e3000060e2
```

---

#### Output for Level 50:

```
Level 50/50: 370301e342180be345174ce3932504e3092b43e3010020e0020020e06e1b0ae30b1640e372270de3ea264de3900100e0900200e0fe1a02e3711b4be3f12401e3f62c47e3900100e0900200e0cb1206e3e5184de374240a0e0bd1f00e3251f4ae35b2fa0e3712a4ae3010040e00200c0e0ef1a09e34e1c41e30f2503e3f62647e3010040e00200c0e03e1301e3ef184be32f2207e3292742e3010080e1020080e12e160ee397114de33620a0e3fb2445e30100206e31f200de3f22c49e3000060e2e8170de3a91d4ee342200de3b02c41e3010040e00200c0e0541405e353184ae3e42508e3672844e3000060e21d1a05e3291143e3132006e31e2246e3010000e0020000e03d130ae3f61c42e3162309e305c110ee3ee1e42e3b02b07e3b7254be3010080e00200a0e0391203e3691c42e3452b00e312274de3010080e00200a0e0511509e3b61047e3242703e30b214ee3000060e2d91506e3191744e3e92709e32e2d48e3010080e1020080e16342c4ce3010040e00200c0e0e71e07e3db1043e30b220ae3fb2546e3010020e0020020e0181c0ee3d41943e3a22707e35c2e4ae3900100e0900200e09d110be3d2154ee3ed2b05e3072043e3010080e00200a0e08d1d0de3cc134ee30e270a0e078170ae35c1041e3c62c09e364294ae3010000e0020000e07d130be3931b4ce35a2d03e3c02445e3900100e0900200e0d81400e3d01644e3f8210be36f2341e3900100e0900200e0e4100fe3641b4ae37c280ae3ba2941e3900100be35a2201e3732e46e3010000e0020000e0cd1208e3cc1b4de3282907e3a12d4ae3000060e2121308e3ca164fe3ca2e02e3c02c45e3010020e0020020e0f3120ae3991a40e30f2b03e38b2946e3010000e0020000e012120ee35d1b42e30020020

HTB{un1c0Rn_0R_C4p5T0nE_0R_qeMU_5ubPR0cE55_0r_F0r90TTen_0Ld_R45berry_4NyTH1N9_BUt_n0_M4nu4LLy}
```

### ✅ Flag

```text

HTB{un1c0Rn_0R_C4p5T0nE_0R_qeMU_5ubPR0cE55_0r_F0r90TTen_0Ld_R45berry_4NyTH1N9_BUt_n0_M4nu4LLy}

```
## 🛠️ Tools Used

- `Python`

 ## 🔑Key Takeaways

- **Understanding ARM instruction set is critical.**
    
- **Knowing how to debug ARM binaries on x86** (QEMU, GDB-multiarch) **is essential.**
    
- **Capstone helps to simulate and reverse engineer instruction flow.**
    
- **Bitwise and arithmetic transformations are common tricks in these challenges.**

## 🏷️ Tags

#ReverseEngineering #ARMsRace #ARMs #BinaryExploitation #HackTheBox #CTF 

[[Reverse Engineering]]