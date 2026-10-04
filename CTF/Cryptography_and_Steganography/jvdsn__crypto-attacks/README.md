## Introduction
Python implementations of cryptographic attacks and utilities.

## Requirements
* [SageMath](https://www.sagemath.org/) with Python 3.9
* [PyCryptodome](https://pycryptodome.readthedocs.io/)

You can check your SageMath Python version using the following command:
```
$ sage -python --version
Python 3.9.0
```
If your SageMath Python version is older than 3.9.0, some features in some scripts might not work.

## Usage
Unit tests are located in the `test` directory and can be executed using the `unittest` module or using `pytest`. This should not take very long, perhaps a few minutes depending on your machine.

To run a specific attack, you must add the code to the proper file before executing it.

### Example

For example, you want to attack RSA using the Boneh-Durfee attack, with the following parameters (taken from `test_rsa.py`):
```python
N = 88320836926176610260238895174120738360949322009576866758081671082752401596826820274141832913391890604999466444724537056453777218596634375604879123818123658076245218807184443147162102569631427096787406420042132112746340310992380094474893565028303466135529032341382899333117011402408049370805729286122880037249
e = 36224751658507610673165956970793195381480143363550601971796688201449789736497322700382657163240771111376677180786660893671085854060092736865293791299460933460067267613023891500397200389824179925263846148644777638774319680682025117466596019474987378275216579013846855328009375540444176771945272078755317168511
```

You add the following code at the bottom of the `boneh_durfee.py` file:
```python
import logging

# Some logging so we can see what's happening.
logging.basicConfig(level=logging.DEBUG)

N = 88320836926176610260238895174120738360949322009576866758081671082752401596826820274141832913391890604999466444724537056453777218596634375604879123818123658076245218807184443147162102569631427096787406420042132112746340310992380094474893565028303466135529032341382899333117011402408049370805729286122880037249
e = 36224751658507610673165956970793195381480143363550601971796688201449789736497322700382657163240771111376677180786660893671085854060092736865293791299460933460067267613023891500397200389824179925263846148644777638774319680682025117466596019474987378275216579013846855328009375540444176771945272078755317168511
p_bits = 512
delta = 0.26

p, q = attack(N, e, p_bits, delta=delta, m=3)
assert p * q == N
print(f"Found {p = } and {q = }")
```

Then you can simply execute the file using Sage. It does not matter where you execute it from, the Python path is automagically set (you can also call the attacks from other Python files, but then you'll have to fix the Python path yourself):
```commandline
[crypto-attacks]$ sage -python attacks/rsa/boneh_durfee.py
INFO:root:Trying m = 3, t = 1...
DEBUG:root:Generating shifts...
DEBUG:root:Creating a lattice with 11 shifts (order = 'invlex', sort_shifts_reverse = False, sort_monomials_reverse = False)...
DEBUG:root:Reducing a 11 x 11 lattice...
DEBUG:root:Reconstructing polynomials (divide_original = True, modulus_bound = False, divide_gcd = True)...
DEBUG:root:Polynomial at row 8 is constant, ignoring...
DEBUG:root:Reconstructed polynomial has gcd 1312232632720549890113031660369306919929075823824696839212183146130434668203517349691252841557097914064120078389640402109017308806168467714230057403815071456395553717020189622129706447677967264344568789118172311850383406340547579993263937406518074980025897726255316031512238322022839331135299265704052474541497687419350763703993630899191179705015113329644753599872380152055902238937889027950089072598069861391599563222633064848996619752054685734260976071760984100109990150069201501748622288840900421607423175114026653242500476408861976142751384898489130281755466581359057847077651502734556259387442296763474369957121 with polynomial at 8, dividing...
DEBUG:root:Reconstructed 10 polynomials
DEBUG:root:Computing pairwise gcds to find trivial roots...
DEBUG:root:Using Groebner basis method to find roots...
DEBUG:root:Sequence length: 10, Groebner basis length: 1
DEBUG:root:Sequence length: 9, Groebner basis length: 1
DEBUG:root:Sequence length: 8, Groebner basis length: 1
DEBUG:root:Sequence length: 7, Groebner basis length: 2
DEBUG:root:Found Groebner basis with length 2, trying to find roots...
Found p = 7866790440964395011005623971351568677139336343167390105188826934257986271072664643571727955882500173182140478082778193338086048035817634545367411924942763 and q = 11227048386374621771175649743442169526805922745751610531569607663416378302561807690656370394330458335919244239976798600743588701676542461805061598571009923
```

The parameters `m` and `t` as shown in the output log deserve special attention. These parameters are used in many lattice-based (small roots) algorithms to tune the lattice size. Conceptually, `m` (sometimes called `k`) and `t` represent the number of "shifts" used in the lattice, which is roughly equal or proportional to the number of rows. Therefore, increasing `m` and `t` will increase the size of the lattice, which also increases the time required to perform lattice reduction (currently using LLL). On the other hand, if `m` and `t` are too low, it is possible that the lattice reduction will not result in appropriate vectors, therefore wasting the time spent reducing. Hence, this is a trade-off.

In the current version of the project, `m` must always be provided by the user (the default value is set to `1`). `t` can, in some cases, be computed based on the specific small roots method used by the attack. However it can still be tweaked by the user. In general, there are two ways to use these kinds of parameters:
* Implement a loop which starts at `m = 1` until an answer is found (example below). This is a simple approach, but risks wasting time on futile computations with too small lattices.
```
m = 1
while True:
    res = attack(..., m=m)
    if res is not None:
        # The attack succeeded!
        break
    m += 1
```
* Implement a debug version of the attack you're trying to use (with known results), and determine the `m` value which results in good lattice vectors. Then directly call the attack method with the correct `m` value.

## Implemented attacks
### Approximate Common Divisor
* [x] Multivariate polynomial attack [^acd_mp]
* [x] Orthogonal based attack [^acd_ol]
* [x] Simultaneous Diophantine approximation attack [^acd_sda]

### CBC
* [x] Bit flipping attack
* [x] IV recovery attack
* [x] Padding oracle attack

### CBC + CBC-MAC
* [x] Key reuse attack (encrypt-and-MAC)
* [x] Key reuse attack (encrypt-then-MAC)
* [x] Key reuse attack (MAC-then-encrypt)

### CBC-MAC
* [x] Length extension attack

### CTR
* [x] Bit flipping attack
* [x] CRIME attack
* [x] Separator oracle attack

### ECB
* [x] Plaintext recovery attack
* [x] Plaintext recovery attack (harder variant)
* [x] Plaintext recovery attack (hardest variant)

### Elliptic Curve Cryptography
* [x] ECDSA nonce reuse attack
* [x] Frey-Ruck attack [^ecc_frey_ruck_attack]
* [x] MOV attack [^ecc_mov_attack]
* [x] Parameter recovery
* [x] Singular curve attack
* [x] Smart's attack (with curves over extension fields) [^ecc_smart_attack1] [^ecc_smart_attack2]

### ElGamal Encryption
* [x] Nonce reuse attack
* [x] Unsafe generator attack

### ElgGamal Signature
* [ ] Bleichenbacher's attack
* [ ] Khadir's attack
* [x] Nonce reuse attack

### Factorization
* [x] Base conversion factorization
* [x] Branch and prune attack [^factorization_branch_and_prune]
* [x] Complex multiplication (elliptic curve) factorization [^factorization_complex_multiplication]
* [x] Coppersmith factorization
* [x] Fermat factorization
* [x] Ghafar-Ariffin-Asbullah attack [^factorization_gaa]
* [x] Implicit factorization [^factorization_implicit]
* [x] Known phi factorization [^factorization_known_phi]
* [x] ROCA [^factorization_roca]
* [x] Shor's algorithm (classical) [^factorization_shor]
* [x] Twin primes factorization
* [x] Factorization of unbalanced moduli [^factorization_unbalanced]

### GCM
* [x] Forbidden attack [^gcm_forbidden_attack]

### Hidden Number Problem
With applications to partial (EC)DSA nonce exposure.
* [x] Extended hidden number problem [^hnp_extended_hnp]
* [ ] Fourier analysis attack
* [x] Lattice-based attack

### IGE
* [x] Padding oracle attack

### Knapsack Cryptosystems
* [x] Low density attack [^knapsack_low_density]

### Linear Congruential Generators

* [x] LCG parameter recovery
* [x] Truncated LCG parameter recovery [^lcg_truncated_parameter_recovery]
* [x] Truncated LCG state recovery [^lcg_truncated_state_recovery]

### Learning With Errors

* [x] Arora-Ge attack [^lwe_arora_ge]
* [ ] Blum-Kalai-Wasserman attack
* [ ] Lattice reduction attack

### Mersenne Twister

* [x] State recovery

### One-time Pad

* [x] Key reuse

### Pseudoprimes

* [x] Generating Miller-Rabin pseudoprimes [^pseudoprimes_miller_rabin]

### RC4

* [x] Fluhrer-Mantin-Shamir attack

### RSA

* [x] Bleichenbacher's attack [^rsa_bleichenbacher]
* [x] Bleichenbacher's signature forgery attack
* [x] Boneh-Durfee attack [^rsa_boneh_durfee]
* [x] Cherkaoui-Semmouni's attack [^rsa_cherkaoui_semmouni]
* [x] Common modulus attack
* [x] CRT fault attack
* [x] d fault attack
* [x] Desmedt-Odlyzko attack (selective forgery) [^rsa_desmedt_odlyzko]
* [x] Extended Wiener's attack [^rsa_extended_wiener_attack]
* [x] Hastad's broadcast attack
* [x] Known CRT exponents attack [^rsa_known_crt_exponents]
* [x] Partial known CRT exponents attack [^rsa_partial_known_crt_exponents]
* [x] Known private exponent attack
* [x] Low public exponent attack
* [x] LSB oracle (parity oracle) attack
* [x] Manger's attack [^rsa_manger]
* [x] Nitaj's CRT-RSA attack [^rsa_nitaj_crt_rsa]
* [x] Non coprime public exponent attack [^rsa_non_coprime_exponent]
* [x] Partial key exposure [^rsa_partial_key_exposure1] [^rsa_partial_key_exposure2] [^rsa_partial_key_exposure3] 
* [x] Related message attack
* [x] Stereotyped message attack
* [x] Wiener's attack
* [x] Wiener's attack for Common Prime RSA [^rsa_wiener_attack_common_prime]
* [x] Wiener's attack (Heuristic lattice variant) [^rsa_wiener_attack_lattice] [^rsa_wiener_attack_lattice_extended] [^small_roots_aono]

### Shamir's Secret Sharing
* [x] Deterministic coefficients
* [x] Share forgery

## Other interesting implementations
* [x] Adleman-Manders-Miller root extraction method [^adleman_manders_miller]
* [x] Fast CRT using divide-and-conquer
* [x] Fast modular inverses
* [x] Linear Hensel lifting
* [ ] Quadratic Hensel lifting
* [x] Babai's Nearest Plane Algorithm
* [x] Matrix discrete logarithm
* [x] Matrix discrete logarithm (equation)
* [x] PartialInteger
* [x] Fast polynomial GCD using half GCD

### Elliptic Curve Generation
* [x] Complex multiplication
* [x] Anomalous curves
* [x] MNT curves
* [x] Prescribed order
* [x] Prescribed trace
* [x] Supersingular curves

### Small Roots
* [x] Polynomial roots using Groebner bases
* [x] Polynomial roots using resultants
* [x] Polynomial roots using Sage variety (triangular decomposition)
* [x] Aono method (Minkowski sum lattice) [^small_roots_aono]
* [x] Blomer-May method [^small_roots_blomer_may]
* [x] Boneh-Durfee method [^rsa_boneh_durfee]
* [x] Coron method [^small_roots_coron]
* [x] Coron method (direct) [^small_roots_coron_direct]
* [x] Ernst et al. methods [^rsa_partial_key_exposure2]
* [x] Herrmann-May method (unravelled linearization) [^small_roots_herrmann_may]
* [x] Herrmann-May method (modular multivariate) [^small_roots_herrmann_may_multivariate]
* [x] Howgrave-Graham method [^small_roots_howgrave_graham]
* [x] Jochemsz-May method (modular roots) [^small_roots_jochemsz_may_modular]
* [x] Jochemsz-May method (integer roots) [^small_roots_jochemsz_may_integer]
* [x] Nitaj-Fouotsa method [^small_roots_nitaj_fouotsa]

[^acd_mp]: Galbraith D. S. et al., "Algorithms for the Approximate Common Divisor Problem" (Section 5)
[^acd_ol]: Galbraith D. S. et al., "Algorithms for the Approximate Common Divisor Problem" (Section 4)
[^acd_sda]: Galbraith D. S. et al., "Algorithms for the Approximate Common Divisor Problem" (Section 3)

[^ecc_frey_ruck_attack]: Harasawa R. et al., "Comparing the MOV and FR Reductions in Elliptic Curve Cryptography" (Section 3)
[^ecc_mov_attack]: Harasawa R. et al., "Comparing the MOV and FR Reductions in Elliptic Curve Cryptography" (Section 2)
[^ecc_smart_attack1]: Smart N. P., "The Discrete Logarithm Problem on Elliptic Curves of Trace One"
[^ecc_smart_attack2]: Hofman S. J., "The Discrete Logarithm Problem on Anomalous Elliptic Curves"

[^factorization_branch_and_prune]: Heninger N., Shacham H., "Reconstructing RSA Private Keys from Random Key Bits"
[^factorization_complex_multiplication]: Sedlacek V. et al., "I want to break square-free: The 4p: 1 factorization method and its RSA backdoor viability"
[^factorization_gaa]: Ghafar AHA. et al., "A New LSB Attack on Special-Structured RSA Primes"
[^factorization_implicit]: Nitaj A., Ariffin MRK., "Implicit factorization of unbalanced RSA moduli"
[^factorization_known_phi]: Hinek M. J., Low M. K., Teske E., "On Some Attacks on Multi-prime RSA" (Section 3)
[^factorization_roca]: Nemec M. et al., "The Return of Coppersmith’s Attack: Practical Factorization of Widely Used RSA Moduli"
[^factorization_shor]: M. Johnston A., "Shor’s Algorithm and Factoring: Don’t Throw Away the Odd Orders"
[^factorization_unbalanced]: Brier E. et al., "Factoring Unbalanced Moduli with Known Bits" (Section 4)

[^gcm_forbidden_attack]: Joux A., "Authentication Failures in NIST version of GCM"

[^hnp_extended_hnp]: Hlavac M., Rosa T., "Extended Hidden Number Problem and Its Cryptanalytic Applications" (Section 4) 

[^knapsack_low_density]: Coster M. J. et al., "Improved low-density subset sum algorithms"

[^lcg_truncated_parameter_recovery]: Contini S., Shparlinski I. E., "On Stern's Attack Against Secret Truncated Linear Congruential Generators"
[^lcg_truncated_state_recovery]: Frieze, A. et al., "Reconstructing Truncated Integer Variables Satisfying Linear Congruences"

[^lwe_arora_ge]: ["The Learning with Errors Problem: Algorithms"](https://people.csail.mit.edu/vinodv/6876-Fall2018/lecture2.pdf) (Section 1)

[^pseudoprimes_miller_rabin]: R. Albrecht M. et al., "Prime and Prejudice: Primality Testing Under Adversarial Conditions"

[^rsa_bleichenbacher]: Bleichenbacher D., "Chosen Ciphertext Attacks Against Protocols Based on the RSA Encryption Standard PKCS #1"
[^rsa_boneh_durfee]: Boneh D., Durfee G., "Cryptanalysis of RSA with Private Key d Less than N^0.292"
[^rsa_cherkaoui_semmouni]: Cherkaoui-Semmouni M. et al., "Cryptanalysis of RSA Variants with Primes Sharing Most Significant Bits"
[^rsa_desmedt_odlyzko]: Coron J. et al., "Practical Cryptanalysis of ISO 9796-2 and EMV Signatures (Section 3)"
[^rsa_extended_wiener_attack]: Dujella A., "Continued fractions and RSA with small secret exponent"
[^rsa_known_crt_exponents]: Campagna M., Sethi A., "Key Recovery Method for CRT Implementation of RSA"
[^rsa_partial_known_crt_exponents]: May A., Nowakowski J., Sarkar S., "Approximate Divisor Multiples: Factoring with Only a Third of the Secret CRT-Exponents"
[^rsa_manger]: Manger J., "A Chosen Ciphertext Attack on RSA Optimal Asymmetric Encryption Padding (OAEP) as Standardized in PKCS #1 v2.0"
[^rsa_nitaj_crt_rsa]: Nitaj A., "A new attack on RSA and CRT-RSA"
[^rsa_non_coprime_exponent]: Shumow D., "Incorrectly Generated RSA Keys: How To Recover Lost Plaintexts"
[^rsa_partial_key_exposure1]: Boneh D., Durfee G., Frankel Y., "An Attack on RSA Given a Small Fraction of the Private Key Bits"
[^rsa_partial_key_exposure2]: Ernst M. et al., "Partial Key Exposure Attacks on RSA Up to Full Size Exponents"
[^rsa_partial_key_exposure3]: Blomer J., May A., "New Partial Key Exposure Attacks on RSA"
[^rsa_wiener_attack_common_prime]: Jochemsz E., May A., "A Strategy for Finding Roots of Multivariate Polynomials with New Applications in Attacking RSA Variants" (Section 5)
[^rsa_wiener_attack_lattice]: Nguyen P. Q., "Public-Key Cryptanalysis"
[^rsa_wiener_attack_lattice_extended]: Howgrave-Graham N., Seifert J., "Extending Wiener’s Attack in the Presence of Many Decrypting Exponents"

[^adleman_manders_miller]: Cao Z. et al., "Adleman-Manders-Miller Root Extraction Method Revisited" (Section 5)

[^small_roots_aono]: Aono Y., "Minkowski sum based lattice construction for multivariate simultaneous Coppersmith's technique and applications to RSA" (Section 4)
[^small_roots_blomer_may]: Blomer J., May A., "New Partial Key Exposure Attacks on RSA" (Section 6)
[^small_roots_coron]: Coron J., "Finding Small Roots of Bivariate Integer Polynomial Equations Revisited"
[^small_roots_coron_direct]: Coron J., "Finding Small Roots of Bivariate Integer Polynomial Equations: a Direct Approach"
[^small_roots_herrmann_may]: Herrmann M., May A., "Maximizing Small Root Bounds by Linearization and Applications to Small Secret Exponent RSA"
[^small_roots_herrmann_may_multivariate]: Herrmann M., May A., "Solving Linear Equations Modulo Divisors: On Factoring Given Any Bits" (Section 3 and 4)
[^small_roots_howgrave_graham]: May A., "New RSA Vulnerabilities Using Lattice Reduction Methods" (Section 3.2)
[^small_roots_jochemsz_may_modular]: Jochemsz E., May A., "A Strategy for Finding Roots of Multivariate Polynomials with New Applications in Attacking RSA Variants" (Section 2.1)
[^small_roots_jochemsz_may_integer]: Jochemsz E., May A., "A Strategy for Finding Roots of Multivariate Polynomials with New Applications in Attacking RSA Variants" (Section 2.2)
[^small_roots_nitaj_fouotsa]: Nitaj A., Fouotsa E., "A New Attack on RSA and Demytko's Elliptic Curve Cryptosystem"
