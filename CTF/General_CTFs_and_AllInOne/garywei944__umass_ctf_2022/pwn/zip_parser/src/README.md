```bash
sudo docker build -t umass_ctf_2022/zip_parser .
sudo docker run -d -p 7293:7293 --rm -it umass_ctf_2022/zip_parser
```