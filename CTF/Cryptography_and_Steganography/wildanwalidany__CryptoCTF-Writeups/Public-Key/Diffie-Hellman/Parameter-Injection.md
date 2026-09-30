# Parameter Injection

Platform: Cryptohack

> Now it's time to calculate a shared secret using data received from your friend Alice. Like before, we will be using the NIST parameters:
> You're in a position to not only intercept Alice and Bob's DH key exchange, but also rewrite their messages. Think about how you can play with the DH equation that they calculate, and therefore sidestep the need to crack any discrete logarithm problem.
> Use the script from "Diffie-Hellman Starter 5" to decrypt the flag once you've recovered the shared secret.

Connect at

```bash
nc socket.cryptohack.org 13371
```

## Solution

The normal scenario of this protocol is:

```console
A->B
Send "p", "g", "A"
B->A
Send "B"
A->B
Send AES-CBC(SHA1(s)[0:16], iv=random(16), msg) + iv
B->A
Send AES-CBC(SHA1(s)[0:16], iv=random(16), A's msg) + iv
```

We can manipulate the desired Key Exchange value using `MITM Attack`
Based on modulo arithmetic properties `a^b (mod a) = 0`, we replace the value of `A` and `B` to the value of `p`. So the Shared Key can be calculated using `K = p^a (mod p) = 0`.

MITM Scenario:

```console
A->M
Send "p", "g", "A"
M->B
Send "p", "g", "p"
B->M
Send "B"
M->A
Send "p"
A->M
Send AES-CBC(SHA1(s)[0:16], iv=random(16), msg) + iv
M->B
Relay that to B
B->M
Send AES-CBC(SHA1(s)[0:16], iv=random(16), A's msg) + iv
M->A
Relay that to A
```

```console
┌──(meld㉿meld)-[~]
└─$ nc socket.cryptohack.org 13371
Intercepted from Alice: {"p": "0xffffffffffffffffc90fdaa22168c234c4c6628b80dc1cd129024e088a67cc74020bbea63b139b22514a08798e3404ddef9519b3cd3a431b302b0a6df25f14374fe1356d6d51c245e485b576625e7ec6f44c42e9a637ed6b0bff5cb6f406b7edee386bfb5a899fa5ae9f24117c4b1fe649286651ece45b3dc2007cb8a163bf0598da48361c55d39a69163fa8fd24cf5f83655d23dca3ad961c62f356208552bb9ed529077096966d670c354e4abc9804f1746c08ca237327ffffffffffffffff", "g": "0x02", "A": "0x47789f44c8fba4c08dc8caab4b63d3f82e8ceba3572a0a9ceff1b9a0c4fa204502fa5c45c34d641f6f96089f6c1124e103b71fee34c95e65bfa276f0549fc3ed879d3d87526609841ed736f2847b2730c434d9f6917836bfa37959842e9c801249c776dececf6cb6a46d21eb1255ffaccd7e6553da448a432c6462718f7ced3878c14e7d66315e4d4093694af5d04590cbfba495f047fd06e487862735fa6380d0b6f48841e2b8cdc12700c71b45965e62bc52a2df6e418090309770fb0ebfcc"}
Send to Bob:  {"p": "0xffffffffffffffffc90fdaa22168c234c4c6628b80dc1cd129024e088a67cc74020bbea63b139b22514a08798e3404ddef9519b3cd3a431b302b0a6df25f14374fe1356d6d51c245e485b576625e7ec6f44c42e9a637ed6b0bff5cb6f406b7edee386bfb5a899fa5ae9f24117c4b1fe649286651ece45b3dc2007cb8a163bf0598da48361c55d39a69163fa8fd24cf5f83655d23dca3ad961c62f356208552bb9ed529077096966d670c354e4abc9804f1746c08ca237327ffffffffffffffff", "g": "0x02", "A": "0xffffffffffffffffc90fdaa22168c234c4c6628b80dc1cd129024e088a67cc74020bbea63b139b22514a08798e3404ddef9519b3cd3a431b302b0a6df25f14374fe1356d6d51c245e485b576625e7ec6f44c42e9a637ed6b0bff5cb6f406b7edee386bfb5a899fa5ae9f24117c4b1fe649286651ece45b3dc2007cb8a163bf0598da48361c55d39a69163fa8fd24cf5f83655d23dca3ad961c62f356208552bb9ed529077096966d670c354e4abc9804f1746c08ca237327ffffffffffffffff"}
Intercepted from Bob: {"B": "0xa44aaa36381e0fd5f40b4248aedbcbb7f6f61e6b1ca6206bbeac1af8ad4367b0478a01f9282338b741865ba6b71a919806a140bfb4ab0bfb81099c84746db56f2d7972ac5e5205fa7c8cfe4ecc298312947db9f3e0833f3fbd638218cef8dacb6e2c5f535c6c08b04fbde9eaee890c2820c4469f17687a8d3b4af9cd27af0380462ed72e7ea391659f40078a5336e0586e7b64aa421d469454001227c0ecaeceade0598f65cc3cbb558e5b4c624bf49d78aed09771c5abb90394e5cb6d330860"}
Send to Alice: {"B": "0xffffffffffffffffc90fdaa22168c234c4c6628b80dc1cd129024e088a67cc74020bbea63b139b22514a08798e3404ddef9519b3cd3a431b302b0a6df25f14374fe1356d6d51c245e485b576625e7ec6f44c42e9a637ed6b0bff5cb6f406b7edee386bfb5a899fa5ae9f24117c4b1fe649286651ece45b3dc2007cb8a163bf0598da48361c55d39a69163fa8fd24cf5f83655d23dca3ad961c62f356208552bb9ed529077096966d670c354e4abc9804f1746c08ca237327ffffffffffffffff"}
Intercepted from Alice: {"iv": "833bb0f041c931e47cf0fa36c3aead6f", "encrypted_flag": "e59bf709e87e911ae04f57e68a6ebc324aada43cedbf7d8a46a5fe371785f352"}
```

Use the [decrypt](https://github.com/wildanwalidany/CryptoCTF-Writeups/blob/main/Public-Key%20Cryptography/Diffie-Hellman/Starter_5.md) from Starter 5 to decrypt the encrypted_flag.

**flag:** `crypto{n1c3_0n3_m4ll0ry!!!!!!!!}`

## References

<https://cryptopals.com/sets/5/challenges/34>
