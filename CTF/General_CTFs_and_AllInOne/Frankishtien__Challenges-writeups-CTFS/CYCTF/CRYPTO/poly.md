# poly

```python
import socket

def solve_challenge():
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.connect(("0.cloud.chals.io", 18382))
    
    # Buffer to collect data
    buffer = ""
    
    while True:
        data = s.recv(1024).decode()
        if not data:
            break
            
        buffer += data
        print(data, end="")
        
        # Check if we need to send input
        if "enter list of coff" in buffer:
            lines = buffer.split('\n')
            # Extract p and ff from earlier lines
            p_line = None
            ff_line = None
            for line in lines:
                if line.isdigit() or (line.startswith('-') and line[1:].isdigit()):
                    p_line = line
                elif line.startswith('['):
                    ff_line = line
            
            if p_line and ff_line:
                p = int(p_line)
                ff = eval(ff_line)
                print(f"\nParsed: p={p}, ff={ff}")
                
                # Send the polynomial coefficients
                # We'll use x + ff[i] for i=0,1,2
                static_ff = [11362360, 12292047, 13221734, 14151421, 15081108]
                
                # Use the actual ff values we received
                poly_coeffs = [1, ff[0]]  # x + ff[0]
                poly_str = ",".join(map(str, poly_coeffs))
                print(f"Sending: {poly_str}")
                s.send((poly_str + '\n').encode())
                buffer = ""
        
        # Break if we see the flag or completion
        if "flag" in buffer.lower() or "done" in buffer.lower():
            break
    
    s.close()

if __name__ == "__main__":
    solve_challenge()
```

<img width="1185" height="361" alt="image" src="https://github.com/user-attachments/assets/e27b758e-a89e-4fef-8352-4494e82607bf" />

```python
# reconstruct_flag.py
ff = [
    6537308465486925816189,
    21366863478306246108806,
    26074820876388456040641,
    5168596814191753081521,
    19914716372836213281555
]

# نحدد حجم الـ chunks كأقصى طول bit من العناصر (آمن وسهل)
chunk_bits = max(x.bit_length() for x in ff)
print("chunk_bits =", chunk_bits)

L = 0
for i, v in enumerate(ff):
    L |= (v << (i * chunk_bits))

# نحسب طول البايت اللازم ثم نحول إلى بايتس ونفك التكويد
blen = (L.bit_length() + 7) // 8
flag_bytes = L.to_bytes(blen, 'big')
try:
    flag = flag_bytes.decode('utf-8')
except Exception:
    flag = flag_bytes.decode('latin-1', errors='replace')

print("Flag:", flag)

```

```
CyCTF{b5120aa4765ecaa5308eb0d2fa839141bca5762a}
```

