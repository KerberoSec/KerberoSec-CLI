# nooter

```python
from flask import Flask, render_template, request, redirect, url_for, session
import sqlite3
from sqlite3 import Error
import string
import random
import re

class Database:
    def __init__(self, db):
        self.db = db
        try:
            self.conn = sqlite3.connect(self.db, check_same_thread=False)
        except:
            self.conn = None

    def gen_random(self) -> str:
        letters = string.ascii_lowercase
        result_str = ''.join(random.choice(letters) for i in range(15))
        return result_str

    def execute_statement(self, create_table_sql) -> str:
        try:
            c = self.conn.cursor()
            return c.execute(create_table_sql)
        except Error as e:
            return e

    def create_tables(self) -> str:
        create_user_table = """
            CREATE TABLE IF NOT EXISTS user(
                id integer PRIMARY KEY,
                username text NOT NULL,
                password text NOT NULL
            );
        """
        create_user_note = """
            CREATE TABLE IF NOT EXISTS notes(
                username text NOT NULL,
                notes text NOT NULL
            );
        """
        create_flag_table = """
            CREATE TABLE IF NOT EXISTS flag(
                flag text NOT NULL
            );
        """
        if self.conn is not None:
            self.execute_statement(create_user_table)
            self.execute_statement(create_flag_table)
            self.execute_statement(create_user_note)
            return "Tables have been created"
        else:
            return "Something went wrong"

    def insert(self, statement, *args) -> bool:
        try:
            sql = statement
            curs = self.conn.cursor()
            curs.execute(sql, (args))
            self.conn.commit()
            return True
        except:
            return False   
        
    def select(self, statement, *args) -> list:
        curs = self.conn.cursor()
        curs.execute(statement, (args))
        rows = curs.fetchall()
        result = []
        for row in rows:
            result.append(row)
        return result

app = Flask(__name__)
app.config['SECRET_KEY'] = 'e66b6950164958de940d9d117f665c98'

def blacklist(string):
    string = string.lower()
    blocked_words = ['exec', 'load', 'blob', 'glob', 'union', 'join', 'like', 'match', 'regexp', 'in', 'limit', 'order', 'hex', 'where']
    for word in blocked_words:
        if word in string:
            return True
    return False

@app.route('/', methods=['GET', 'POST'])
def index():
    if 'loggedin' in session:
        msg = ''
        if request.method == 'POST' and 'note' in request.form:
            note = request.form['note']
            if blacklist(note):
                msg = 'Forbidden word detected'
            else:
                query = db.insert("INSERT INTO notes(username, notes) VALUES(?,'%s')" % note, session['username'])
                if query is not True:
                    msg = 'Something went wrong'
        notes = db.select("SELECT notes FROM notes WHERE username = ?", session['username'])

        return render_template('home.html', username=session['username'], notes=notes, msg=msg)
    return redirect(url_for('login'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    msg = ''
    if request.method == 'POST' and 'username' in request.form and 'password' in request.form:
        username = request.form['username']
        password = request.form['password']

        account = db.select("SELECT * FROM user where username = ? and password = ?", username, password)
        if account:
            session['loggedin'] = True
            session['id'] = account[0][0]
            session['username'] = account[0][1]

            return redirect(url_for('index'))
        else:
            msg = 'Incorrect username/password!'

    return render_template('index.html', msg=msg)

@app.route('/register', methods=['GET', 'POST'])
def register():
    msg = ''
    if request.method == 'POST' and 'username' in request.form and 'password' in request.form:
        username = request.form['username']
        password = request.form['password']
        
        account = db.select("SELECT * FROM user where username = ? and password = ?", username, password)
        if account:
            msg = 'Account already exists!'
        elif not re.match(r'[A-Za-z0-9]+', username):
            msg = 'Username must contain only characters and numbers!'
        elif not username or not password:
            msg = 'Please fill out the form!'
        else:
            db.insert("INSERT INTO user(username, password) Values (?,?)", username, password)
            msg = 'You have successfully registered!'
    elif request.method == 'POST':
        msg = 'Please fill out the form!'
        
    return render_template('register.html', msg=msg)

@app.route('/logout')
def logout():
    session.pop('loggedin', None)
    session.pop('id', None)
    session.pop('username', None)
    return redirect(url_for('login'))

if '__main__' == __name__:
    db = Database('./sqlite.db')
    db.create_tables()
    db.insert("INSERT INTO flag(flag) VALUES (?)", "FlagY{fake_flag}")
    app.run(host='0.0.0.0', port=5000)
```

---

## 1) ملخص سريع لبنية الكود المهمة

- فيه Database class اللي بيفتح اتصال بـ SQLite (sqlite.db) ويحتوي على دوال: create_tables(), ``insert()``, ``select()`` وغيرها.

- الجداول: ``user(id, username, password)``, ``notes(username, notes)``, ``flag(flag)``.

- الـ route الأساسي الضعيف هو إضافة الملاحظة:

```python
query = db.insert("INSERT INTO notes(username, notes) VALUES(?,'%s')" % note, session['username'])
```

هنا: ``note`` يُحقن داخل السلسلة النصية قبل تنفيذ الاستعلام. بعد كده ``session['username']`` يمرَّر كـ parameter للـ ``?``.

- فيه دالة ``blacklist()`` التي تفحص وجود مجموعة كلمات محظورة في الـ note بعد ``string.lower()`` وتمنع إذا وُجدت.

## 2) فين الثغرة بالضبط؟

الثغرة بسبب الاستخدام المباشر لـ ``string formatting`` ``("%s" % note)`` لبناء الاستعلام: بدلاً من تمرير قيمة ``note`` كـ placeholder parameter.
ببساطة: أنت تكتب جزء من SQL داخل المتغير ``note`` فيتحول إلى جزء من الاستعلام النهائي → SQL injection.

مثال: لو ``session['username']=' victim'`` و``note = test' || (SELECT flag FROM flag) || '``
الاستعلام النهائي سيكون:

```python
INSERT INTO notes(username, notes) VALUES('victim','test' || (SELECT flag FROM flag) || '')
```

هذا يسمح بتشغيل تعابير SQL داخل قيمة الـ notes.

## 3) ليه محاولات UNION كانت تفشل أو ترجع "Something went wrong"؟

ثلاث أسباب رئيسية:

1.مشكلة multi-statement / Syntax

- لو استخدمت ``'); UNION SELECT ...; --`` هتقفل قيمة الـ ``insert (');)`` وتبدأ جملة جديدة (UNION ...). لكن ``sqlite3`` عبر ``execute()`` عادة لا يسمح بتنفيذ أكثر من عبارة واحدة في نفس الاتصال أو سيرورة التنفيذ → يطير exception.

2. Mismatch في عدد الأعمدة

- ``UNION SELECT`` لازم يرجع نفس عدد الأعمدة كالجملة الأصلية. عندما تحاول عمل ``UNION SELECT username, password`` بينما الاستعلام الأصلي متوقع قيمة واحدة داخل عمود ``notes`` → خطأ.

3. الـ blacklist

- بعض محاولاتك احتوت كلمات محظورة مثل union أو كلمات أخرى؛ الـ ``blacklist()`` تعمل على ``.lower()`` وتمنع وجود أي كلمة من القائمة في النص.

لهذا محاولات ``UNION`` التقليدية كانت تؤدي لخطأ (الـ ``insert()`` يلتقط الاستثناء ويرجع False في تطبيق التحدي، وعلى UI تظهر رسالة عامة ``"Something went wrong")``.

## 4) لماذا الـ bypass الذي استخدمناه نجح؟

المفتاح: إنتاج قيمة واحدة صالحة تدخل كحقل ``notes`` دون فتح جملة SQL جديدة ودون استخدام كلمات محظورة.

الـ ``payload`` الناجح كان (مثال):

```python
test' || (SELECT group_concat(username || ':' || password) FROM user) || '
```

مثال الاستعلام النهائي بعد الاستبدال:

```python
INSERT INTO notes(username, notes) VALUES('victim','test' || (SELECT group_concat(username || ':' || password) FROM user) || '')
```

<img width="1214" height="775" alt="image" src="https://github.com/user-attachments/assets/b6925ea7-d463-4653-8f78-3a8ece2eaa56" />

