##

## when open page found button 

<img width="1650" height="566" alt="image" src="https://github.com/user-attachments/assets/bd8b56b7-c608-4ac7-b9f0-189e5666720c" />

```html
   <div class="container">
        
    <a href="/a04adb225ce0e3f2732efa132137ee0b">
        <button>Click Me</button>
    </a>

    </div>
```

## when click on it found another button

```html
   <div class="container">
        
    <a href="/07fa8100cb067da686ccb5bcf8c7e2bd">
        <button>Click Me</button>
    </a>

    </div>
```

## script to automait it 

```python 

import requests
import re

def follow_the_button(start_hash, base_url):
    """
    Starts from a known hash and follows the chain of 'Click Me' buttons
    until it finds a page that doesn't contain another button link.
    """
    visited = set()  # To avoid infinite loops if the chain cycles
    current_hash = start_hash
    
    while current_hash not in visited:
        visited.add(current_hash)
        
        # Construct the full URL for the current hash
        url = f"{base_url}/{current_hash}"
        print(f"[*] Visiting: {url}")
        
        try:
            response = requests.get(url, timeout=10)
            response.raise_for_status()  # Check for HTTP errors
        except requests.exceptions.RequestException as e:
            print(f"[!] Error fetching {url}: {e}")
            break
        
        # Check if this page contains the flag
        # Look for the Flag{} format in the page content
        flag_match = re.search(r'Flag\{[^}]+\}', response.text)
        if flag_match:
            print(f"\n[+] FLAG FOUND: {flag_match.group(0)}")
            return flag_match.group(0)
        
        # Search for the next hash in the page's HTML
        # This regex looks for the pattern found in the href attribute
        next_hash_match = re.search(r'href="/([0-9a-f]{32})"', response.text)
        
        if not next_hash_match:
            print(f"\n[!] No next hash found on {url}. This might be the end.")
            print("[*] Page content (first 500 chars):")
            print(response.text[:500])
            break
        
        current_hash = next_hash_match.group(1)
        print(f"[*] Next hash found: {current_hash}")
    
    if current_hash in visited:
        print("[!] Detected a loop in the chain. No flag found.")
    
    return None

# ===== CONFIGURATION =====
# Set your starting point (the first hash you found)
START_HASH = "96fab95bba130fefd7f14810f6984bab"  # Replace with your actual first hash

# Set the base URL (the part before the hash)
# For a typical CTF challenge hosted on a single domain, it might be:
BASE_URL = "http://cdcomeg23g7mi8v4kj6zqroxi6v9y873o8mombwzy-web.cybertalentslabs.com/"  # <<< REPLACE THIS
# If you are accessing it via a browser at an address like:
# http://cdcomeg23g7mi8v4k873oywmtwzy0873o8mombwzy-web.cybertalentslabs.com/2873e0d63b...
# Then the BASE_URL is: "http://cdcomeg23g7mi8v4k873oywmtwzy0873o8mombwzy-web.cybertalentslabs.com"
# =========================

if __name__ == "__main__":
    print("[*] Starting to follow the button maze...")
    flag = follow_the_button(START_HASH, BASE_URL)
    
    if flag:
        print("\n[+] Success! Challenge solved.")
    else:
        print("\n[-] No flag found automatically. Manual inspection may be needed.")

```

## but machine ended fast so we need fast script

<img width="1296" height="227" alt="image" src="https://github.com/user-attachments/assets/6ced3771-b50b-4b19-9350-f39854564cca" />

```python

import aiohttp
import asyncio
import re
import time
from collections import deque

async def follow_maze_fast(start_hash, base_url, session, max_pages=5000):
    """Fast async version to follow the maze."""
    visited = set()
    queue = deque([start_hash])
    base_url = base_url.rstrip('/')
    
    while queue and len(visited) < max_pages:
        current_hash = queue.popleft()
        if current_hash in visited:
            continue
            
        visited.add(current_hash)
        url = f"{base_url}/{current_hash}"
        
        try:
            async with session.get(url, timeout=aiohttp.ClientTimeout(total=2)) as resp:
                html = await resp.text()
                
                # Check for flag first
                flag_match = re.search(r'Flag\{[^}]+\}', html)
                if flag_match:
                    print(f"\n[+] FLAG FOUND: {flag_match.group(0)}")
                    return flag_match.group(0), len(visited)
                
                # Check for 404 - this might be the end
                if resp.status == 404:
                    print(f"\n[!] 404 at {url} - This is likely the endpoint!")
                    print(f"[*] Page content (first 2000 chars):")
                    print(html[:2000])
                    
                    # Search for any encoded data
                    import base64
                    b64_pattern = r'[A-Za-z0-9+/=]{20,}'
                    for match in re.findall(b64_pattern, html):
                        try:
                            decoded = base64.b64decode(match).decode('utf-8', errors='ignore')
                            if 'flag' in decoded.lower():
                                print(f"\n[*] Base64 decoded: {decoded[:500]}")
                        except:
                            pass
                    
                    # Check for other encodings
                    hex_pattern = r'(?:[0-9a-fA-F]{2}){20,}'
                    hex_matches = re.findall(hex_pattern, html)
                    for h in hex_matches[:3]:  # Check first few
                        try:
                            hex_decoded = bytes.fromhex(h).decode('utf-8', errors='ignore')
                            if 'flag' in hex_decoded.lower():
                                print(f"\n[*] Hex decoded: {hex_decoded[:500]}")
                        except:
                            pass
                    
                    return None, len(visited)
                
                # Find next hash
                next_hash = re.search(r'href="/([0-9a-f]{32})"', html)
                if next_hash and next_hash.group(1) not in visited:
                    queue.append(next_hash.group(1))
                    
        except asyncio.TimeoutError:
            print(f"[!] Timeout: {url}")
            continue
        except Exception as e:
            print(f"[!] Error {url}: {e}")
            continue
        
        # Progress indicator
        if len(visited) % 50 == 0:
            print(f"[*] Visited {len(visited)} pages...")
    
    return None, len(visited)

async def main():
    START_HASH = "8d13cf4dfa0921c32dbb9542c97867ee"
    BASE_URL = "http://cdcomeg23g7mi8v4kj6zqroxi6v9y873o8mombwzy-web.cybertalentslabs.com/"
    
    print(f"[*] Starting ASYNC traversal (much faster!)")
    print(f"[*] Starting hash: {START_HASH}")
    
    connector = aiohttp.TCPConnector(limit_per_host=10)  # Increase concurrency
    timeout = aiohttp.ClientTimeout(total=15*60)  # 15 minute timeout
    
    async with aiohttp.ClientSession(connector=connector, timeout=timeout) as session:
        start_time = time.time()
        flag, pages_visited = await follow_maze_fast(START_HASH, BASE_URL, session)
        elapsed = time.time() - start_time
        
        print(f"\n{'='*60}")
        print(f"[*] Finished in {elapsed:.1f} seconds")
        print(f"[*] Pages visited: {pages_visited}")
        
        if flag:
            print(f"[+] SUCCESS: {flag}")
        else:
            print(f"[-] No flag found in {pages_visited} pages")
            print(f"[*] The 404 page at the end likely contains the flag or a clue")

if __name__ == "__main__":
    asyncio.run(main())

```

<img width="1056" height="666" alt="image" src="https://github.com/user-attachments/assets/5db93908-358b-4550-a146-608f68fc5587" />

