# Pedoman Kontribusi

Pedoman umum untuk kontribusi projek ini, mengikuti pada pedoman yang berada pada link [berikut](https://akrabat.com/the-beginners-guide-to-contributing-to-a-github-project/).

---

# Cara Kontribusi

## TL;DR

Lihat [ringkasan](#ringkasan).

## 1. Fork Repository

Pertama, buatlah _fork repository_ ke akun kamu dengan menekan tombol _fork_ di github.

![fork image](https://i.imgur.com/CWY2rtI.png)

Jika berhasil maka akan muncul _repository_ hasil _fork_ di akun kamu.

![fork done](https://i.imgur.com/OB7XIgQ.png)

## 2. Pengaturan Salinan Lokal

Setelah melakukan _fork_, _clone repository_ hasil fork tadi ke komputer / laptop kamu.

```bash
$ git clone git@github.com:[username]/Arsip-WU.git
```

Ubah direktori / buka hasil _clone_ menggunakan _text editor_, direkomendasikan menggunakan VSCode / VSCodium.

```bash
$ cd [path to dir]/Arsip-WU
$ codium . # membuka projek menggunakan vscodium
```

Ubah _upstream_ agar menunjuk projek asli,
sehingga kamu dapat mendapatkan kondisi salinan yang paling baru dari projek asli.

```bash
$ git remote add upstream git@github.com:divisi-security-poros/Arsip-WU.git
```

## 3. Tulis WriteUP

Sebelum menulis writeUP pastikan kamu telah memiliki salinan terbaru dari projek dengan menggunakan perintah

```bash
$ git pull upstream master && git push origin master
```

Selanjutnya, silahkan tulis WriteUP sesuai dengan nama kontes dan kategorinya pada branch master, atau membuat branch sendiri (optional). Jika belum tersedia, buat direktori / file tersebut. Format WriteUP disarankan menggunakan markdown berikut [format file yang direkomendasikan](#coming-soon).

Jika terdapat foto / gambar silahkan mengunggah di imgur atau google photos (tidak diperkenankan mengunggah langsung ke projek), untuk panduannya silahkan cari di [_search engine_](https://duckduckgo.com/?q=google+image+get+embed&ia=web), di [sini](https://guides.github.com/features/mastering-markdown/), atau di [sini](https://duckduckgo.com/?q=embed+imgur+github&ia=web). Jangan Lakukan _commit_ terlebih dahulu sebelum WriteUP yang kamu tulis benar-benar jadi dan ingin di-_push_ pada projek asli, cukup melakukan operasi _add_ terlebih daulu.

```bash
$ git add [something to add]
```

## 4. Membuat Pull Request

Sebelum melakukan PR, pastikan salinan projek merupakan salinan terbaru dengan mengetik,

```bash
$ git pull upstream master
```

Lalu, lakukan _commit_ baru pada salinan projek dan lakukan _push_ ke repositori github.

```bash
$ git commit -m "[Tulis Sesuatu Disini]"
$ git push -u origin master # ubah master menjadi branch lain jika kamu membuat branch baru
```

Setelah berhasil melakukan _push_, silahkan membuka PR baru pada laman repositori kamu (hasil fork) akan muncul tombol _compare & pull request_.

![Klik Pull Request](https://i.imgur.com/cXbcOkN.png)

Tulis judul dan deskripsi yang sesuai pada PR dan klik tombol _Create pull request_.

![Submit Pull Request](https://i.imgur.com/nveJmtF.png)

Tunggu _maintainer_ melakukan review terhadap PR kamu. Jika di terima maka writeUP akan diperbarui. Jika tidak, maka terdapat beberapa alasan seperti salah format, ada hal yang tidak sesuai dengan panduan ini, atau terdapat saran terhadap PR kamu agar menjadi lebih baik.

## Ringkasan

1. Lakukan _Fork_ dan _Clone_ repositori
2. Set _upstream_ salinan lokal dan perbarui salinan lokal.
3. Edit writeUP di-_branch_ master atau membuat yang baru.
4. Sebelum _commit_ dan _push_, pastikan salinan lokal merupakan versi terbaru.
5. Lakukan _commit_ dan _push_.
6. Buka PR baru.
7. Tunggu _maintainer_ melakukan review, periksa secara berkala dan jika ada revisi harap diperbaiki.
