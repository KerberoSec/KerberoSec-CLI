# Enumeration

## URL Path

### Custom Script

We can use Python packages including `requests` and `BeautifulSoup` to crawl the URL links appearing on the site.

{% code title="url_crawler.py" %}
```python
#!/usr/bin/python3

import click
import requests
import sys
from urllib.parse import urlparse
from bs4 import BeautifulSoup as bs

requests.packages.urllib3.disable_warnings()

class Crawler:
    def __init__(self, base_url):
        self.links = set()
        self.base_url = base_url
        self.host = urlparse(base_url).netloc

    def crawl(self, url=None, level=0):
        if not url:
            url = self.base_url

        if url in self.links:
            return
        else:
            try:
                res = requests.get(url, verify=False)
            except:
                return
            self.links.add(url)
            print(' '*level+url)
            soup = bs(res.text, 'lxml')

            for attr in ['href', 'src']:
                elements = [l.get(attr) for l in soup.select(f"[{attr}]") ]
                for h in elements:
                    if h.startswith('/'):
                        url = self.base_url + h
                        self.crawl(url, level=level+1)
                    elif self.host in h:
                        self.crawl(h, level=level+1)
                        
    def write(self, wordlist):
        with open(wordlist, 'w') as f:
            for l in self.links:
                f.write(l+'\n')

@click.command()
@click.argument('url')
@click.argument('output')
def main(url, output):
    c = Crawler(url)
    c.crawl()
    c.write(output)

main()
```
{% endcode %}
