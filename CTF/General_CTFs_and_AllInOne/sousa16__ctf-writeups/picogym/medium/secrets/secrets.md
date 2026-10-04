## Secrets

[Link to challenge](https://play.picoctf.org/practice/challenge/296)

Write-up:

1. Using browser inspection, we can see there is a css file located in /secret/assets/
   
2. Navigating to /secret/, we see there is a css file located in /secret/hidden/
   
3. Once again, navigating to /secret/hidden/ shows us there is a file in /secret/hidden/supperhiden/

4. Navigating to /secret/hidden/supperhiden/ reveals the flag hidden in the HTML: **picoCTF{succ3ss_@h3n1c@10n_51b260fe}**