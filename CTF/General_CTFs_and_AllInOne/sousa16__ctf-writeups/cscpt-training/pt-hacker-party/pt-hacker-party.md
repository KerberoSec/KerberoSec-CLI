## Portuguese Hacker Party

[Link to challenge](https://training.cybersecuritychallenge.pt/challenges#Portuguese%20Hacker%20Party-6)

Write-up:

1. The source code includes a Dockerfile and a index.php. 
The Dockerfile indicates that the flag is probably in /flag.txt, while the index.php
shows us the possibility of exploring a race condition, as the check and include operations are separate,
creating a time window for the attack.

2. We can craft a script (race-condition.py) that sends a safe payload that pass checks while it 
sends a malicious payload that hopefully alters the file contents after the check and before the include.

3. Running the script shows us the flag: **CSCPT{r4c3_4g41n5t_7h3_m4ch1n3}** 