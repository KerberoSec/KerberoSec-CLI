# Welcome (100 pts)

### Soal :  
<p align="center">
  <img src="https://i.imgur.com/wOnBKN8.png" alt="Welcome"></img>
</p>

### Pembahasan : 
Masuk ke dalam ssh dengan perintah :
```
$ ssh dutcf@chall.duc.tf -p 30301
```
dengan password : **ductf**  
Setelah masuk akan tampak tulisan welcome to DUCTF yang berganti setiap detiknya, seperti ini : 
<p align="center">
  <img src="https://i.imgur.com/rsUsSQX.png" alt="Welcome to DUCTF"></img>
</p>

Di Linux kita dapat menggunakan shortcut bash yaitu **ctrl + s** untuk menghentikan semua output yang ditampilkan di terminal dan **ctrl + q** untuk melanjutkannya. Sehingga didapatkan flagnya :  
<p align="center">
  <img src="https://i.imgur.com/mgI36xV.png" alt="Flag"></img>
</p>

<details>
<summary>Tekan untuk melihat flag</summary>
DUCTF{w3lc0m3_t0_DUCTF_h4v3_fun!}
</details>
