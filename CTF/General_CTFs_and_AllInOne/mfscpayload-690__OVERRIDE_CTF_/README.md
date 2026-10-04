# OVERRIDE CTF: Zer0_Downtime_

This repository contains our complete working notes, scripts, artifacts, and analysis from **OVERRIDE CTF**, organized by **IEEE SB CE Kallooppara** in collaboration with **Offenso Hackers Academy**, **IEEE Computer Society SBC CE Kallooppara**, and **Cyber Club CE Kallooppara**.

We successfully completed the event as team **Zer0_Downtime_**.

---

## Event Snapshot

- **Event:** OVERRIDE CTF
- **Format:** High-intensity, timed Capture The Flag
- **Date:** February 28
- **Duration:** 7 Hours (9:00 AM: 4:00 PM)
- **Domains Covered:** Web Exploitation, Cryptography, Forensics, OSINT, and more

> Hack smart. Move fast. Override the system.

---

## Team Zer0_Downtime_

We participated as a 4-member developer/security team:

<table>
	<tr>
		<td align="center">
			<a href="https://github.com/Aaromal665">
				<img src="https://github.com/Aaromal665.png?size=140" width="120" height="120" style="border-radius:50%;" alt="Aaromal V" /><br/>
				<b>Aaromal V</b>
			</a>
		</td>
		<td align="center">
			<a href="https://github.com/unknownguyoffline">
				<img src="https://github.com/unknownguyoffline.png?size=140" width="120" height="120" style="border-radius:50%;" alt="Abhishek H" /><br/>
				<b>Abhishek H</b>
			</a>
		</td>
	</tr>
	<tr>
		<td align="center">
			<a href="https://github.com/mfscpayload-690">
				<img src="https://github.com/mfscpayload-690.png?size=140" width="120" height="120" style="border-radius:50%;" alt="Aravind Lal" /><br/>
				<b>Aravind Lal</b>
			</a>
		</td>
		<td align="center">
			<a href="https://github.com/Madhavs225">
				<img src="https://github.com/Madhavs225.png?size=140" width="120" height="120" style="border-radius:50%;" alt="Madhav S" /><br/>
				<b>Madhav S</b>
			</a>
		</td>
	</tr>
</table>

---

## Technical Work in This Repo

This repo is not just a write-up; it includes practical CTF-solving pipelines and tooling used during the competition.

### 1) Forensics + Steganography Workflow

- Polyglot analysis of challenge files (e.g., PNG + PCAP layering)
- Stego checks across channels and bit planes
- JPEG/PNG extraction, marker parsing, and hidden payload validation
- Network artifact extraction from packet captures

Key scripts/artifacts:

- `analyze.py`
- `deep_analysis.py`
- `extract_pcap.py`
- `jsteg_extract.py`
- `silent_transfer_prompt.md`
- `capture.pcap`
- `challenge`

### 2) Web/API Security Testing

- Endpoint probing and behavior mapping
- Auth/access-control and parameter tampering attempts
- Request timing and response-based signal checks

Relevant scripts:

- `pot.sh`
- `POT.sh`
- `test.sh`

### 3) Crypto/Encoding Experiments

- Symbol/emoji substitution mapping
- Encoded text decoding attempts and transformation chains

Relevant files:

- `Truth.txt`
- `3moj1.txt`
- `B1ind.txt`

### 4) Extracted Outputs and Working Data

- `extracted/`
- `foremost_out/`
- `CTF/` (analysis scripts + generated results)

---

## Screenshot

Leaderboard/team screenshot:

![offenso ctf Zer0_Downtime_](https://github.com/user-attachments/assets/75788ce8-756c-43dd-9967-3dce93eb5a91)

---

## Notes

- This repository is maintained as a technical archive of our OVERRIDE CTF run.
- It includes raw artifacts and iterative scripts created during live challenge solving.
