# Kramazon

Step 1: Understanding the Challenge
-----------------------------------

We have an online store called "Kramazon" where:

-   Regular elf accounts shouldn't get Santa-priority shipping

-   There's a flaw in the checkout system

-   We need to exploit it to get Santa Priority Delivery

-   This will reveal a flag in the "Priority Route Manifest"

Step 2: Analyzing the JavaScript Code
-------------------------------------

Looking at the provided JavaScript, we see:

```js
document.getElementById("order").addEventListener("click", async () => {
  // Creates order
  const createRes = await fetch("/create-order", { method: "POST" });
  const order = await createRes.json();
  
  // Waits 3 seconds, then checks callback URL
  setTimeout(async () => {
    const callbackRes = await fetch(order.callback_url);
    const status = await callbackRes.json();
    
    function santaMagic(n) {
      return n ^ 0x37; // TODO: remove in production
    }
    
    // KEY CHECK: If user === 1, we're Santa!
    if (status.internal.user === 1) {
      alert("Welcome, Santa! Allowing priority finalize...");
    }
    
    // Waits 1 second, then finalizes
    setTimeout(async () => {
      const finalizeRes = await fetch("/finalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: status.internal.user,  // ← Sends user from callback
          order: order.order_id,
        }),
      });
      // ...
    }, 1000);
  }, 3000);
});
```

Key Observations:

1.  The code expects `status.internal.user === 1` to identify Santa

2.  It sends `user: status.internal.user` to `/finalize`

3.  There's a `santaMagic` function: `n ^ 0x37`

---

Step 3: Initial Testing
-----------------------

When we test the API:

1.  POST `/create-order` → Returns `order_id` and `callback_url`

<img width="1487" height="514" alt="image" src="https://github.com/user-attachments/assets/cfaf9df6-d6dd-4230-9f81-ccbdb9c1df9a" />

2.  GET `/status/queue/[id].json` → Returns JSON without `user` field:

<img width="1469" height="478" alt="image" src="https://github.com/user-attachments/assets/3df79da4-b779-45e8-aa96-06bc31bfd26d" />

3.  POST `/finalize` with just `order` → Shows our user is `3921`

<img width="1478" height="489" alt="image" src="https://github.com/user-attachments/assets/67e414b5-4f01-44e9-b342-0ff3a7416b79" />

Problem: The callback doesn't have a `user` field! So `status.internal.user` is `undefined`.

Step 4: Discovering Cookie Influence
------------------------------------

We notice the `auth` cookie in requests. When we try different cookies:

-   With our original cookie `BA4FBg==`: User 3921

<details>
  <summary>💥💥💥💥 solution by luck 😂😂 💥💥💥💥</summary>

1. i try to remove **`B`** from cookie **`BA4FBg==`** to be **`BA4Fg==`** and i found : 

<img width="1299" height="478" alt="image" src="https://github.com/user-attachments/assets/af53af95-8451-4c5d-a1b7-956dc61572fe" />

> ## the `userID` became **`392`** instead of **`3921`**

2. try to remove **`F`** make cookie **`BA4g==`** and i found :

<img width="1232" height="443" alt="image" src="https://github.com/user-attachments/assets/df981342-4b57-4024-9855-9260571e8910" />

> ## the `userID` became **`39`** instead of **`392`**

> ## it looks when i remove one char form cookie it remove number form userid the first char i remove it remove the **`1`** from **`userID`** LET'S put it alone to see if the **`userID`** will be **`1`** the final cookie **`Bg==`**

<img width="1399" height="492" alt="image" src="https://github.com/user-attachments/assets/3fe7b75c-4f1a-4388-8649-ec71e105bbed" />

> ## and boom 💥💥 we get the half of flag **`internal_route`** let's send request to it **`/priority/manifest/route-2025-SANTA.txt`**

<img width="1290" height="458" alt="image" src="https://github.com/user-attachments/assets/bb90cb58-9afa-47a2-8eb9-621ce4c5c932" />

> ## we found the full flag 

  
</details>

Step 5: Brute-Force Discovery
-----------------------------

We write a script to test cookies 0-99:

```python
import base64
import requests

# Test cookies 0-100
for i in range(100):
    cookie = base64.b64encode(bytes([i])).decode()
    headers = {"Content-Type": "application/json", "Cookie": f"auth={cookie}"}
    
    try:
        # Create order
        resp = requests.post("https://kramazon.csd.lol/create-order", 
                           headers=headers, json={}, timeout=5)
        if resp.status_code == 200:
            order_id = resp.json()["order_id"]
            
            # Finalize
            finalize = requests.post("https://kramazon.csd.lol/finalize",
                                   headers=headers,
                                   json={"order": order_id},
                                   timeout=5)
            result = finalize.json()
            print(f"Cookie {i} ({cookie}): {result.get('message')}")
            
            if "priority" in result and result["priority"]:
                print(f"FOUND PRIORITY! Cookie: {cookie}")
                break
    except:
        pass

```

<img width="1057" height="558" alt="image" src="https://github.com/user-attachments/assets/eb208f02-1bee-4fcb-ad44-957d4d5eb911" />

Results:

-   Cookie 0 (`AA==`): User 7, `priority:true`

-   Cookie 1 (`AQ==`): User 6

-   Cookie 2 (`Ag==`): User 5

-   Cookie 3 (`Aw==`): User 4

-   Cookie 4 (`BA==`): User 3

-   Cookie 5 (`BQ==`): User 2

-   Cookie 6 (`Bg==`): SANTA ACCESS! 🎅

Step 6: Understanding the Cookie Encoding
-----------------------------------------

From the pattern:

-   Cookie 6 → User 1 (Santa)

-   Cookie 5 → User 2

-   Cookie 4 → User 3

-   Cookie 3 → User 4

-   Cookie 2 → User 5

-   Cookie 1 → User 6

-   Cookie 0 → User 7

>[!warning]
> This suggests:` User ID = 7 - Cookie Value`
>
> Or mathematically: `User ID = Cookie Value ^ 0x07 (XOR with 7)`
>
> Check:
>
>: `6 ^ 7 = 1` ✓ (Santa)
>   
>: `5 ^ 7 = 2` ✓
>    
>: `4 ^ 7 = 3` ✓
>   
>: etc.

> ## Important: The JavaScript showed santaMagic(n) = n ^ 0x37 (XOR with 55), but the server actually uses XOR with 7 (0x07). This mismatch is the vulnerability!

<img width="1384" height="476" alt="image" src="https://github.com/user-attachments/assets/de32177e-5bc3-4b20-b6b9-986dd02a157a" />

<img width="1334" height="465" alt="image" src="https://github.com/user-attachments/assets/8b23444f-7c6d-436f-9154-6f547024ec32" />

