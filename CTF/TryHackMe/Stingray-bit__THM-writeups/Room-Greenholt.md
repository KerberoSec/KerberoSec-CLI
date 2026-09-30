
[TryHackMe | The Greenholt Phish](https://tryhackme.com/room/phishingemails5fgjlzxc)

## TryHackMe | The Greenholt Phish Walkthrough

### Key Questions and Answers

- **Email’s Timestamp:** `06/10/2020 05:58`.
- **Email Sender:** Mr. James Jackson.
- **Sender's Email Address:** `info@mutawamarine.com`.
- **Reply-to Email Address:** `info.mutawamarine@mail.com`.
- **Originating IP:** `192.119.71.157`.
- **Owner of the Originating IP:** Hostwinds LLC.
- **SPF Record for the Return-Path Domain:**
  ```plaintext
  v=spf1 include:spf.protection.outlook.com -all
  ```
- **DMARC Record for the Return-Path Domain:**
  ```plaintext
  v=DMARC1; p=quarantine; fo=1
  ```
- **Name of the Attachment:** `SWT_#09674321___PDF___.CAB`.
- **Attachment File Size:** `400.26 KB`.
- **Actual File Extension of the Attachment:** `rar`.
