# Vault
Usually form types are related to SQLi so lets just brute force some common payloads.         
`admin` / `1' or 1='1` gives a QR code, which leads to a troll youtube page.          
But look into sessionID cookie and decode the base64 value `ZW5jcnlwdENURntpX0g0dDNfaW5KM2M3aTBuNX0%3D`    
And we get the flag!

<details>
  <summary>FLAG</summary>   
   
   When decoded, it gives: `encryptCTF{i_H4t3_inJ3c7i0nNX0}`

</details>
