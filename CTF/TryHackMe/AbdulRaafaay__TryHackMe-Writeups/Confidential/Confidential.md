# TryHackMe: Confidential Writeup

> **Challenge**: Confidential  
> **Description**: A secret case file from self-proclaimed "black hat hackers" hides a confidential invite code. Can you find it?  

---

## 🖥️ Deploying the Machine
I started the attackbox and navigated to the confidential file located at:

```

/home/ubuntu/confidential

````

---

## 📂 Transferring the File

To analyze the file on my Kali Linux machine, I set up a temporary web server on the attackbox:

```bash
python3 -m http.server 8080
````

Then, on Kali, I downloaded the file using `wget`:

```bash
wget http://<attackbox-ip>:8080/<filename>
```

Now the PDF file was available locally for analysis.

---

## 🔍 Analyzing the PDF

### Step 1: Listing Images in the PDF

I used `pdfimages` to check for embedded images:

```bash
pdfimages -list Repdf.pdf
```

This confirmed the presence of hidden images.

### Step 2: Extracting Images

To extract them, I ran:

```bash
pdfimages -all Repdf.pdf extracted
```

This produced three images:
`extracted-000.png`, `extracted-001.png`, and `extracted-002.png`.

### Step 3: Finding the QR Code

Opening the first image:

```bash
xdg-open extracted-000.png
```

This revealed a **QR code**.

---

## 🚩 Obtaining the Flag

I scanned the QR code with my phone and it contained the final flag:

✅ `flag{<redacted>}`

---

## 🎯 Conclusion

This challenge reinforced:

* Using `http.server` and `wget` to transfer files between environments
* Leveraging `pdfimages` to inspect hidden data in PDFs
* Extracting and analyzing images to uncover secrets