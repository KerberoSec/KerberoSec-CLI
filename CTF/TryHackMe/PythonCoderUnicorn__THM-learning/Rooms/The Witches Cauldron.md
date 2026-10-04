#cryptography 

Witch Alice seeking secret potion recipe
friend Bob has secret
obstacle Goblin Eve wants to steal it

2 of the same base ingredients into Alice & Bob cauldron

empty base mixture
add 3 ingredients to Alice = `cipherwort, owlfeather, expon star`
add 3 ingredients to Bob = `ancient pearl, cryptic coral, ethereal leaf`

mix secret mix with base mix
create a mix that hides Alice | Bob secret ingredients

give Alice public mix to Bob
give Bob public mix to Alice

empty mix from each cauldron
add Alice secret & Bob public to make shared secret mix
add Bob secret and Alice public to make shared secret mix

use Bob shared secret mix in his cauldron to encrypt his recipe
give Alice the encrypted recipe through Eve
use Alice shared secret mix in her cauldron to decrypt Bob recipe

` THM{y0u_br3w3d_7h3_53cr37} `

---

```
base_potion 
secret_potions = alice_secret + bob_secret 
public_potions = alice_public + bob_public

exchange_keys = base_potion + secret_potions + public_potions
```

- Diffie-Hellman parameters `opensssl dhparam -out dhparams.pen 2048`

Alice private key 
- `openssl genpkey - paramfile dhparams.pen -out alice_private.pem`
Bob private key
- `openssl genpkey -paramfile dhparams.pem -out bob_private.pem`

Alice & Bob public potions calculated
- Alice public key `A` = `(g^a) % p`
- Bob public key `B` = `(g^b) % p`

Alice public key: 
- `openssl pkey -in alice_private.pem -pubout -out alice_public.pem`
Bob public key:
- `openssl pkey -in bob_private.pem -pubout - out bob_public.pem`

these public keys can be shared online

```
exchange_public_potions = bob_public + alice_public
secret_potions = alice_secret + bob_secret

shared_secret_potions_keys = exchange_public_potions + shared_potions
```

Alice uses Bob public key
- `shared_secret_key = (B^a) % p`
Bob uses Alice public key
- `shared_secret_key = (A^b) % p`

Get the shared secret key: Alice
`openssl pkeyutl -derive -inkey alice_private.pem -peerkey bob_public.pem -out shared_secret.bin`

Get the shared secret key: Bob
`openssl pkeyutl -derive -inkey bob_private.pem -peerkey alice_public.pem -out shared_secret.bin`

Mathematically, this is because calculating the shared secret requires calculating a discrete logarithm problem. Given **_A_**, **_g_**, and **_p_**, it's computationally infeasible to determine **_a_** from the equation **A = (ga) % p**. The same applies to **_B_**, **_b_**, **_g_**, and **_p_**.

Eve cannot recreate the shared secret without access to the private potions (private keys). This ensures the confidentiality and security of the shared secret, allowing Alice and Bob to communicate securely.

It is important to note that Diffie-Hellman is simply a key exchange protocol, not an encryption algorithm.

```
encryption_recipe = bob_recipe + shared_secret
decryption_bob_recipe = encryption_recipe + shared_secret
```

Encryption Using the Shared Secret Key

` openssl enc -aes-256-cbc -pass file:shared_secret.bin -in recipe.txt -out encrypted_recipe.enc `

To summarize, this command uses the **AES-256-CBC** encryption algorithm and a shared secret key file (**shared_secret.bin**) to encrypt the contents of **recipe.txt**. The encrypted result is saved in `encrypted_recipe.enc`.

Decryption Using the Shared Secret Key

` openssl aes-256-cbc -d -in encrypted_recipe.enc -pass file:shared_secret.bin -out recipe.txt `

This command uses the same **AES-256-CBC** encryption algorithm and shared secret key file (**shared_secret.bin**) to decrypt the contents of `encrypted_recipe.enc`. The result is saved back into **recipe.txt**.

---

Bob encrypted a spell using a shared secret

all file `/root/Room/cauldron` 

Bob used `AES-256-CBC` 

` alice.key  bob.public  encrypted_spell.enc`

` openssl pkeyutl -derive -inkey alice_private.pem -peerkey bob_public.pem -out shared_secret.bin `

`openssl aes-256-cbc -d -in encrypted_spell.enc -pass file:shared_secret.bin -out recipe.txt ` need to have "file:"

` THM{525403e42fbda51dfd0572025d78062f} `

