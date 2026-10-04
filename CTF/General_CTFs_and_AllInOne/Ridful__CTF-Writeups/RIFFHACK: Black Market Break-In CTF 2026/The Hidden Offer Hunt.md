# CTF Writeup: The Hidden Offer Hunt (Medium)

## Challenge Overview

- **Name:** The Hidden Offer Hunt
    
- **Category:** Web / HTML Injection / Client-Side Logic
    
- **Difficulty:** Medium
    
- **Description:** "Some offers never appear in the public catalog. Can you find the signal that makes one surface?"
    
- **Hint:** "Plant HTML in the contact form; look for special badges."
    

## Technical Analysis & Discovery

### 1. Client-Side Code Review

By analyzing the frontend JavaScript bundle (`app/marketplace/page-53bc8ef6435a4fda.js`), a specific condition was found within the vendor rendering logic:

JavaScript

```
const m = ["riffhack-labs"];
// ...
m.includes(e.vendor) && jsx("span", {
  className: "badge badge-trusted",
  "data-issued-by": "riffhack",
  children: "Trusted Vendor"
})
```

This snippet indicates that the application dynamically renders a **"Trusted Vendor"** badge if the vendor matches `"riffhack-labs"`. The application looks for elements containing the attribute `data-issued-by="riffhack"`.

### 2. Identifying the Injection Vector

The hint instructed to _"Plant HTML in the contact form"_. Combining this with the discovery of the trusted badge logic, the application likely parses input from the form and renders it elsewhere (or processes it via a backend bot/system) without proper sanitization, making it vulnerable to **HTML Injection**.

By mimicking the target element structure, an attacker can trick the system into recognizing a forged trusted status.

## Exploitation

To trigger the hidden listing and surface the flag, the following HTML payload was injected into the vulnerable contact form field:

HTML

```
<span class="badge badge-trusted" data-issued-by="riffhack">Trusted Vendor</span>
```

### Result

Upon submission, the injected HTML successfully rendered or was processed by the backend simulation, causing the hidden "Request Vendor Quote" interface to surface for the restricted vendor.

The hidden panel revealed a tailored offer code containing the flag:

> **Flag:** `bitflag{0c34n5_11_c0up0n_h31st}`

<img width="535" height="342" alt="image" src="https://github.com/user-attachments/assets/5c5ad269-c692-481e-9612-a8a9df50f79e" />
