Great Common Divisor

Algoritmul lui Euclid se bazează pe principiul că cel mai mare divizor comun al două numere nu se schimbă dacă înlocuim numărul mai mare cu restul împărțirii acestuia la numărul mai mic.

**Pașii sunt:**

1. Împarți $a$ la $b$ și afli restul ($r$).

2. Înlocuiești $a$ cu $b$ și $b$ cu restul $r$.

3. Repeți procesul până când restul devine $0$.

4. Ultimul rest diferit de zero este $gcd(a, b)$.

```
def gcd(a, b):
    while b:
        a, b = b, a % b
    return a

# Testare
a = 66528
b = 52920
print(f"GCD-ul numerelor {a} și {b} este: {gcd(a, b)}")
```

### Extended GCD
Let aa and bb be positive integers.  
  
The extended Euclidean algorithm is an efficient way to find integers u,vu,v such that  
  
a⋅u+b⋅v=gcd⁡(a,b)a⋅u+b⋅v=gcd(a,b)  
  
 Later, when we learn to decrypt RSA ciphertexts, we will need this algorithm to calculate the modular inverse of the public exponent.  
  
Using the two primes p=26513,q=32321p=26513,q=32321, find the integers u,vu,v such that  
  
p⋅u+q⋅v=gcd⁡(p,q)p⋅u+q⋅v=gcd(p,q)  
  
Enter whichever of uu and vv is the lower number as the flag.  
  
 Knowing that p,qp,q are prime, what would you expect gcd⁡(p,q)gcd(p,q) to be? For more details on the extended Euclidean algorithm, check out [this page](https://web.archive.org/web/20230511143526/http://www-math.ucdenver.edu/~wcherowi/courses/m5410/exeucalg.html).

```
def extended_gcd(a, b):
    if a == 0:
        return b, 0, 1
    else:
        gcd, x1, y1 = extended_gcd(b % a, a)
        
        # Calculăm u și v pe baza rezultatelor anterioare
        u = y1 - (b // a) * x1
        v = x1
        
        return gcd, u, v

# Datele din problema ta:
p = 26513
q = 32321

gcd, u, v = extended_gcd(p, q)

print(f"GCD: {gcd}")
print(f"u: {u}")
print(f"v: {v}")
print(f"Verificare: {p}*({u}) + {q}*({v}) = {p*u + q*v}")
```

To solve this, we will use the **Extended Euclidean Algorithm**. Since p=26513 and q=32321 are both prime numbers, their greatest common divisor (GCD) must be **1**.

Our goal is to find integers u and v such that:

26513u+32321v=1

Step 1: The Standard Euclidean Algorithm

First, we perform the division steps to confirm the GCD and establish the relationships between the numbers.

1. 32321=1⋅26513+5808

2. 26513=4⋅5808+3281

3. 5808=1⋅3281+2527

4. 3281=1⋅2527+754

5. 2527=3⋅754+265

6. 754=2⋅265+224
7. 265=1⋅224+41
8. 224=5⋅41+19

9. 41=2⋅19+3

10. 19=6⋅3+1

Step 2: Back-Substitution (Extended Algorithm)

Now, we work backward from the last equation to express 1 as a linear combination of p and q.

- 1=19−6(3)

- Substitute 3=41−2(19): 1=19−6(41−2⋅19)=13(19)−6(41)

- Substitute 19=224−5(41): 1=13(224−5⋅41)−6(41)=13(224)−71(41)

- Substitute 41=265−1(224): 1=13(224)−71(265−224)=84(224)−71(265)

- Substitute 224=754−2(265): 1=84(754−2⋅265)−71(265)=84(754)−239(265)

- Substitute 265=2527−3(754): 1=84(754)−239(2527−3⋅754)=801(754)−239(2527)

- Substitute 754=3281−1(2527): 1=801(3281−2527)−239(2527)=801(3281)−1040(2527)

- Substitute 2527=5808−1(3281): 1=801(3281)−1040(5808−3281)=1841(3281)−1040(5808)

- Substitute 3281=26513−4(5808): 1=1841(26513−4⋅5808)−1040(5808)=1841(26513)−8404(5808)

- Substitute 5808=32321−1(26513): 1=1841(26513)−8404(32321−26513)=10245(26513)−8404(32321)

Results From the final equation:

- u=10245
- v=−8404

Comparing the two values, the lower number is **-8404**.

## Modular Arithmetic

Imagine you lean over and look at a cryptographer's notebook. You see some notes in the margin:  
  
4 + 9 = 1  
5: 7 = 10  
2 + 3 = 5  
  
At first you might think they've gone mad. Maybe this is why there are so many data leaks nowadays you'd think, but this is nothing more than modular arithmetic modulo 12 (albeit with some sloppy notation).  
  
You may not have been calling it modular arithmetic, but you've been doing these kinds of calculations since you learnt to tell the time (look again at those equations and think about adding hours).  
  
Formally, "calculating time" is described by the theory of congruences. We say that two integers are congruent modulo m if a≡bmodma≡bmodm.  
  
Another way of saying this, is that when we divide the integer aa by mm, the remainder is bb. This tells you that if mm divides aa (this can be written as m∣am∣a) then a≡0modma≡0modm.  
  
Calculate the following integers:  
  
11≡xmod611≡xmod6  
8146798528947≡ymod178146798528947≡ymod17  
  
The solution is the smaller of the two integers, (x,y)(x,y), you obtained after reducing by the modulus.

```
print(11 % 6)                # Output: 5
print(8146798528947 % 17)    # Output: 4
```

1. Calculul pentru x

Avem ecuația:

11≡x(mod6)

Pentru a-l găsi pe x, împărțim 11 la 6:

- 11=1⋅6+5
- Restul este **5**.

Prin urmare, **x=5**.

2. Calculul pentru y

Avem un număr mult mai mare:

8146798528947≡y(mod17)

Deși numărul pare intimidant, procesul este același: calculăm restul împărțirii acestui număr la 17.

Folosind împărțirea lungă sau un calculator:

- 8146798528947÷17=479223442879 rest 4.
- Verificare: 479223442879⋅17=8146798528943.
- Diferența până la numărul original: 8146798528947−8146798528943=4.

Prin urmare, **y=4**.

## Modular Artithmetic 2

We'll pick up from the last challenge and imagine we've picked a modulus pp, and we will restrict ourselves to the case when pp is prime.  
  
The integers modulo pp define a field, denoted FpFp​.  
  
If the modulus is not prime, the set of integers modulo nn define a ring.  
  
A finite field FpFp​ is the set of integers 0,1,...,p−10,1,...,p−1, and under both addition and multiplication there are inverse elements b+b+​ and b∗b∗​ for every element aa in the set, such that a+b+=0a+b+​=0 and a⋅b∗=1a⋅b∗​=1.  
  
 Note that the identity element for addition and multiplication is different! This is because the identity when acted with the operator should do nothing: a+0=aa+0=a and a⋅1=aa⋅1=a.  
  
Lets say we pick p=17p=17. Calculate 317mod17317mod17. Now do the same but with 517mod17517mod17.  
  
What would you expect to get for 716mod17716mod17? Try calculating that.  
  
This interesting fact is known as Fermat's little theorem. We'll be needing this (and its generalisations) when we look at RSA cryptography.  
  
Now take the prime p=65537p=65537. Calculate 27324678765465536mod6553727324678765465536mod65537.  
  
Did you need a calculator?

Această provocare ne introduce în eleganța **Micii Teoreme a lui Fermat** (Fermat's Little Theorem). Aceasta este una dintre acele "scurtături" matematice care fac criptografia modernă posibilă.

1. Experimentul cu p=17

Să verificăm calculele propuse:

- **317(mod17):** Dacă ridici 3 la puterea 17, obții un număr uriaș, dar în aritmetica modulară, rezultatul este surprinzător de simplu: **3**.
    
- **517(mod17):** Similar, rezultatul este **5**.
    

Acesta este prima parte a teoremei: pentru orice număr întreg a, avem ap≡a(modp).

2. Ce se întâmplă cu 716(mod17)?

Observăm că exponentul (16) este exact p−1. Conform celei de-a doua forme a teoremei:

ap−1≡1(modp)

(atât timp cât p nu îl divide pe a).

Deci, fără să calculăm efectiv 716, ne așteptăm ca rezultatul să fie **1**.

3. Marea Provocare: 27324678765465536(mod65537)

Să analizăm numerele date:

- p=65537 (Acesta este un număr prim celebru, numit număr Fermat).
- Baza a=273246787654.
- Exponentul e=65536.

Observăm imediat că **65536=65537−1**. Adică exponentul este exact p−1.

Deoarece 65537 este prim și nu divide baza noastră (baza nu se termină în 7 sau alte criterii evidente, dar fiind prim și atât de mare, probabilitatea e practic nulă), putem aplica direct Mica Teoremă a lui Fermat:

ap−1≡1(modp)

**Rezultatul este: 1**

## Modular Inverting

As we've seen, we can work within a finite field Fp​, adding and multiplying elements, and always obtain another element of the field.  
  
For all elements gg in the field, there exists a unique integer dd such that g⋅d≡1modpg⋅d≡1modp.  
  
This is the multiplicative inverse of gg.  
  
**Example**: 7⋅8=56≡1mod117⋅8=56≡1mod11  
  
What is the inverse element: d=3−1d=3−1 such that 3⋅d≡1mod133⋅d≡1mod13?  
  
 Think about the little theorem we just worked with. How does this help you find the inverse of an element?
 
1. [Bézout's_identity](https://en.wikipedia.org/wiki/B%C3%A9zout%27s_identity)3d≡1mod13⇔∃ k∈Zt.c3d=1+13k
2. [Euclidean algorithm](https://en.wikipedia.org/wiki/Euclidean_algorithm) 13=4∗3+1⟹3(−4)=1+(−1)13
3. d=9≡−4mod13 is a solution

deci d=9

## Quadratic Residues

We've looked at multiplication and division in modular arithmetic, but what does it mean to take the square root modulo an integer?  
  
For the following discussion, let's work modulo p=29p=29. We can take the integer a=11a=11 and calculate a2=5mod29a2=5mod29.  
  
As a=11,a2=5a=11,a2=5, we say the square root of 55 is 1111.  
  
This feels good, but now let's think about the square root of 1818. From the above, we know we need to find some integer aa such that a2=18a2=18  
  
Your first idea might be to start with a=1a=1 and loop to a=p−1a=p−1. In this discussion pp isn't too large and we can quickly check all options.  
  
Have a go, try coding this and see what you find. If you've coded it right, you'll find that for all a∈Fp∗a∈Fp∗​ you never find an aa such that a2=18a2=18.  
  
What we are seeing, is that for the elements of Fp∗Fp∗​, not every element has a square root. In fact, what we find is that for roughly one half of the elements of Fp∗Fp∗​, there is no square root.  
  
We say that an integer xx is a _Quadratic Residue_ if there exists an aa such that a2≡xmodpa2≡xmodp. If there is no such solution, then the integer is a _Quadratic Non-Residue_.  
  
In other words, xx is a quadratic residue when it is possible to take the square root of xx modulo an integer pp.  
  
In the below list there are two non-quadratic residues and one quadratic residue.  
  
Find the quadratic residue and then calculate its square root. Of the two possible roots, submit the smaller one as the flag.  
  
If a2=xa2=x then (−a)2=x(−a)2=x. So if xx is a quadratic residue in some finite field, then there are always two solutions for aa.  
  
p=29ints=[14,6,11]p=29ints=[14,6,11]

```
p = 29
ints = [14, 6, 11]
qr = [a for a in range(p) if pow(a,2,p) in ints]
print(f"flag {min(qr)}")
```

