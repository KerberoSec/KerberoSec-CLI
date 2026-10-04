# TryHackMe TryHeartMe Writeup

---

## create account and login 

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluQGV4YW1wbGUuY29tIiwicm9sZSI6ImFkbWluIiwiY3JlZGl0cyI6OTk5OTksImlhdCI6MTc3MTE5Njk4NSwidGhlbWUiOiJ2YWxlbnRpbmUifQ.xEfdQJt_gLkf7Gex5TKEbmnlpw4P3h07YMtZp7uFjM0
```

<img width="1235" height="454" alt="image" src="https://github.com/user-attachments/assets/1f666b86-fd97-4ff8-a63c-4f3fecb340fe" />

## try to change `role` and  `credits`

<img width="763" height="564" alt="image" src="https://github.com/user-attachments/assets/3bb16075-2991-4c2d-a115-8d195c4d89a0" />

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluQGV4YW1wbGUuY29tIiwicm9sZSI6ImFkbWluIiwiY3JlZGl0cyI6OTk5OTksImlhdCI6MTc3MTE5Njk4NSwidGhlbWUiOiJ2YWxlbnRpbmUifQ.xEfdQJt_gLkf7Gex5TKEbmnlpw4P3h07YMtZp7uFjM0
```

## gobuster 

```
gobuster dir -w /usr/share/wordlists/dirb/common.txt -u http://10.66.158.33:5000 
```

<img width="1373" height="607" alt="image" src="https://github.com/user-attachments/assets/37e15617-d02f-4d9b-b35b-63a68a3fb4b0" />

 
## now visit `/admin` with new jwt :

<img width="1917" height="633" alt="image" src="https://github.com/user-attachments/assets/5d557adc-b870-43df-a06f-bd215cad94bf" />

## when click **`open valentine flag`**

<img width="1848" height="682" alt="image" src="https://github.com/user-attachments/assets/988b739b-3cd3-4fdf-a1b8-e5d30b8c84f9" />

## click buy 

<img width="1436" height="513" alt="image" src="https://github.com/user-attachments/assets/47ab9d68-1467-4ab4-bd4d-68c995b7df3d" />

