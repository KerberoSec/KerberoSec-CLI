# PhishNet

## 1. What is the originating IP address of the sender?

```eml
X-Originating-IP: [45.67.89.10]
...
X-Sender-IP: 45.67.89.10
```

> **ANSWER:** 45.67.89.10

## 2. Which mail server relayed this email before reaching the victim?

```eml
Received: from mail.business-finance.com ([203.0.113.25])
	by mail.target.com (Postfix) with ESMTP id ABC123;
	Mon, 26 Feb 2025 10:15:00 +0000 (UTC)
Received: from relay.business-finance.com ([198.51.100.45])
	by mail.business-finance.com with ESMTP id DEF456;
	Mon, 26 Feb 2025 10:10:00 +0000 (UTC)
Received: from finance@business-finance.com ([198.51.100.75])
	by relay.business-finance.com with ESMTP id GHI789;
	Mon, 26 Feb 2025 10:05:00 +0000 (UTC)
```

> **ANSWER:** 203.0.113.25

## 3. What is the sender's email address?

```eml
From: "Finance Dept" <finance@business-finance.com>
```

> **ANSWER:** `finance@business-finance.com`

## 4. What is the 'Reply-To' email address specified in the email?

```eml
Reply-To: <support@business-finance.com>
```

> **ANSWER:** `support@business-finance.com`

## 5. What is the SPF (Sender Policy Framework) result for this email?

```eml
Authentication-Results: spf=pass (domain business-finance.com designates 45.67.89.10 as permitted sender)
```

> **ANSWER:** pass

## 6. What is the domain used in the phishing URL inside the email?

```html
  <p>For your convenience, you can download the full invoice and payment instructions from the link below:</p>
  <p><a href="https://secure.business-finance.com/invoice/details/view/INV2025-0987/payment">Download Invoice</a></p>
```

> **ANSWER:** `secure.business-finance.com`

## 7. What is the fake company name used in the email?

```html
  <p>Best regards,<br>Finance Department<br>Business Finance Ltd.</p>
```

> **ANSWER:** Business Finance Ltd.

## 8. What is the name of the attachment included in the email?

```http
Content-Type: application/zip; name="Invoice_2025_Payment.zip"
Content-Disposition: attachment; filename="Invoice_2025_Payment.zip"
```

> **ANSWER:** `Invoice_2025_Payment.zip`

## 9. What is the SHA-256 hash of the attachment?

```sh
$ printf 'UEsDBBQAAAAIABh/WloXPY4qcxITALvMGQAYAAAAaW52b2ljZV9kb2N1bWVudC5wZGYuYmF0zL3ZzuzIsR18LQN+h62DPujWX0e7' | b64 -d | sha256sum
8379c41239e9af845b2ab6c27a7509ae8804d7d73e455c800a551b22ba25bb4a  -
```

> **ANSWER:** 8379c41239e9af845b2ab6c27a7509ae8804d7d73e455c800a551b22ba25bb4a

## 10. What is the filename of the malicious file contained within the ZIP attachment?

```sh
$ printf 'UEsDBBQAAAAIABh/WloXPY4qcxITALvMGQAYAAAAaW52b2ljZV9kb2N1bWVudC5wZGYuYmF0zL3ZzuzIsR18LQN+h62DPujWX0e7' | b64 -d > Invoice_2025_Payment.zip

$ 7z l Invoice_2025_Payment.zip

7-Zip 25.01 (x64) : Copyright (c) 1999-2025 Igor Pavlov : 2025-08-03
 64-bit locale=en_US.UTF-8 Threads:4 OPEN_MAX:40000, ASM

Scanning the drive for archives:
1 file, 75 bytes (1 KiB)

Listing archive: Invoice_2025_Payment.zip

--
Path = Invoice_2025_Payment.zip
Type = zip
ERRORS:
Unexpected end of archive
Physical Size = 75
Characteristics = Local

   Date      Time    Attr         Size   Compressed  Name
------------------- ----- ------------ ------------  ------------------------
2025-02-26 15:56:48 .....      1690811      1249907  invoice_document.pdf.bat
------------------- ----- ------------ ------------  ------------------------
2025-02-26 15:56:48            1690811      1249907  1 files

Errors: 1
```

> **ANSWER:** `invoice_document.pdf.bat`

## 11. Which MITRE ATT&CK techniques are associated with this attack?

[Phishing: Spearphishing Attachment](https://attack.mitre.org/techniques/T1566/001/)

> **ANSWER:** T1566.001

