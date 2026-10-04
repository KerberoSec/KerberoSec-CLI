### Problem Statement
```txt
Python scripts are invoked kind of like programs in the Terminal... Can you run this Python script using this password to get the flag?
```

---

#### Contents of `flag.txt.en`
    gAAAAABgUAIWjVP_Ne1VPrHlLZKpvfaifN7qlLoN7NEzOpAl55av7sPuV8wQZj9V-6oI_x4L10O8R-b9c19INaTFrlGbT6YxQeLXd2S3FQA8HmFxU9NILpJGEtVPsGpzPAmLSsRwezRX

#### Contents of `pw.txt`
    aa821c16aa821c16aa821c16aa821c16

The challenge simply requires us to run the given script: `ende.py` and pass the `flag.txt.en` file into it.

---

###### Command
```shell
$ python3 ende.py -d flag.txt.en

Please enter the password:aa821c16aa821c16aa821c16aa821c16
```

###### Output
```txt
picoCTF{4p0110_1n_7h3_h0us3_aa821c16}
```

---

#### Decrypted flag
    picoCTF{4p0110_1n_7h3_h0us3_aa821c16}

Link to the challenge: [Python Wrangling](https://play.picoctf.org/practice/challenge/166)
