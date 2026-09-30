### 1 Смотрим исходники

По исходникам определяем, что перед нами [Benaloh cryptosystem](https://en.wikipedia.org/wiki/Benaloh_cryptosystem)

### 2 Смотрим на генерацию ключа

```python
def q_(p, l, r):
	while True:
		q = gmpy.next_prime(p+ri(l//4))
		if gmpy.gcd((q-1), r) == 1:
			return q
```

При генерации параметра `n=pq` `p` и `q` недалеко отстоят друг от друга, значит, по публичному ключу можно будет определить приватный, разложив `n` на множители [методом Ферма](https://en.wikipedia.org/wiki/Fermat%27s_factorization_method) или просто перебором делителей в окрестности `sqrt(n)`.

### 3 Пишем код

Раскладываем `n` на множители

```python
def sqrt(n):
	x = n
	y = (x + 1) // 2
	while y < x:
		x = y
		y = (x + n // x) // 2
	return x

def findP(n):
	a=sqrt(n)
	if a%2 == 0:
		a+=1
	i = a
	while True:
		if n%i == 0:
			return i
		i+=2
```

Реализуем расшифрование:

```python
def d(c, k, r, n):
	fi, x = k
	a = pow(c, fi//r, n)
	for m in range(r):
		if pow(x, m, n) == a:
			return m

ct = open("ct.txt").read()

key, ct = ct.split('\n')

n, x = [ int(a, 10) for a in key.split(" ") ]

p = findP(n)
q = n // p
fi = (p-1)*(q-1)

ct = [ int(a, 10) for a in ct.split(" ") ]

pt = ''.join([A[d(c, (fi, x), len(A), n)] for c in ct])
print(pt)
```

### 4 Думаем

В результате расшифрования мы получили белиберду, но уже в виде ASCII-символов. Замечаем в коде зашифрования:

```
out = reduce(lambda x, y: str(x) + " " + str(y), [ (a * b) % n for a, b in zip(ct, cycle(ck))])
```

То есть шифр-образ открытого текста перемножался с итерацией шифр-образом некого ключа. 

Вспомним, что криптосистема Бенало гомоморфная, а значит умножение в пространстве образов соответствует сложению в пространстве прообразов. Таким образом, полученная белиберда: это текст, зашифрованный шифром Виженера.

### 5 Получаем ответ

Расчехляем Cryptool, находим ключ, из текста достаем секретное слово, сдаем его в качестве флага.

