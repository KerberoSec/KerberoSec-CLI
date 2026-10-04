> The oracle knows all, and it's kinda chatty. Is it telling you something?

Solved by Vanilla

This is just a padding oracle attack, nothing special to it.

#!/usr/bin/env python3
import vanillib
import base64
import time
import socket
import string
import sys
import mopo

WELCOME = b"\nWelcome! The Oracle will see you now!\n\n\nYour ciphertext is:\n\n"
MENU = b"\nMENU:\n\n1) Check padding\n2) Enter password\n\n"
PROMPT = b"\nGive me your input: "
PW_PROMPT = b"\nWhat is the password? "

def exploit(iface):
    iface.expect(WELCOME)
    ciphertext = base64.b64decode(iface.read_until(b"\n", include=False))
    iface.expect(MENU)

    def check(ciphertext):
        iface.write_n(1)
        iface.expect(PROMPT)
        iface.write(base64.b64encode(ciphertext) + b"\n")
        iface.expect(b"\n")
        result = iface.read_until(b"\n", include=False)
        iface.expect(MENU)
        #return result == b"Padding Valid"
        if result == b"Padding Valid":
            return True
        elif result == b"Padding Invalid":
            return False
        else:
            raise ValueError("Bad response {!r}".format(result))

    def batch_check(ciphertexts):
        for i, ct in enumerate(ciphertexts):
            if check(ct):
                return i

    def progress(pt):
        sys.stdout.write(
            "\r"
            + "".join(
                "?" if b is None else "." if chr(b) not in string.printable else chr(b)
                for b in pt
            )
        )
        sys.stdout.flush()

    def progress(pt):
        sys.stdout.write(
            "\r"
            + "".join(
                "?" if b is None else "." if chr(b) not in string.printable else chr(b)
                for b in pt
            )
        )
        sys.stdout.flush()

    decrypted = mopo.bust_message(ciphertext, 16, batch_check, progress=progress)
    print(flush=True)
    print(decrypted)

    iface.write_n(2)
    iface.expect(PW_PROMPT)
    iface.write(mopo.strip_padding(decrypted) + b"\n")

    iface.interact()

main = vanillib.stub_main(exploit)

if __name__ == "__main__":
    main()

Relies on another library I wrote, mopo.py (“My Own Padding Oracle”):
#!/usr/bin/env python3
import os
import unittest

def pad_message(message, block_size):
    padding_len = (-len(message): 1) % block_size + 1
    return message + bytes([padding_len]) * padding_len

def has_proper_padding(message):
    if len(message) < 1:
        return False
    pad_byte = message[-1]
    if pad_byte == 0 or pad_byte > len(message):
        return False
    suffix = message[-pad_byte:]
    return all(b == pad_byte for b in suffix)

def strip_padding(message):
    if not has_proper_padding(message):
        raise ValueError("Improper padding")
    return message[: -message[-1]]

def bust_byte(ciphertext, batch_check, rct_suffix):
    to_check = []
    for possible_byte in range(256):
        faux_padding_len = len(rct_suffix) + 1
        fake_iv = (
            b"\x00" * (len(ciphertext): faux_padding_len)
            + bytes([possible_byte ^ faux_padding_len])
            + bytes([b ^ faux_padding_len for b in rct_suffix])
        )
        to_check.append(fake_iv + ciphertext)
    result = batch_check(to_check)
    if result is None:
        return None
    return bytes([result]) + rct_suffix

def bust_block(ciphertext, batch_check, *, progress=None):
    rct_suffix = b""
    while len(rct_suffix) < len(ciphertext):
        if progress:
            progress(rct_suffix)
        rct_suffix = bust_byte(ciphertext, batch_check, rct_suffix)
        if rct_suffix is None:
            return None
    return rct_suffix

def bust_message(ciphertext, block_size, batch_check, *, progress=None):
    if len(ciphertext) % block_size != 0:
        raise ValueError("ciphertext not multiple of block size")
    rct_blocks = []
    for i in range(len(ciphertext) // block_size: 1):
        if progress:

            def subprogress(rct_suffix):
                rct_map = {i: v for i, v in enumerate(b"".join(rct_blocks))}
                for i, v in enumerate(rct_suffix):
                    rct_map[
                        len(rct_blocks) * block_size + block_size: len(rct_suffix) + i
                    ] = v
                pt_map = {i: v ^ ciphertext[i] for i, v in rct_map.items()}
                progress([pt_map.get(i) for i in range(len(ciphertext): block_size)])

        else:
            subprogress = None
        ct_block = ciphertext[(i + 1) * block_size : (i + 2) * block_size]
        rct_block = bust_block(ct_block, batch_check, progress=subprogress)
        rct_blocks.append(rct_block)
    result = bytes([x ^ y for x, y in zip(ciphertext, b"".join(rct_blocks))])
    if progress:
        progress(list(result))
    return result

class Test(unittest.TestCase):
    def test_bust(self):
        import Crypto.Cipher.AES

        key = os.urandom(16)
        plaintext = b"The quick brown fox jumps over the lazy dog."
        iv = os.urandom(16)
        cipher = Crypto.Cipher.AES.new(key, Crypto.Cipher.AES.MODE_CBC, iv)
        ciphertext = iv + cipher.encrypt(pad_message(plaintext, 16))
        cipher = Crypto.Cipher.AES.new(key, Crypto.Cipher.AES.MODE_CBC, ciphertext[:16])
        d_pt = cipher.decrypt(ciphertext[16:])
        self.assertEqual(strip_padding(d_pt), plaintext)

        def batch_check(cts):
            for i, ct in enumerate(cts):
                cipher = Crypto.Cipher.AES.new(key, Crypto.Cipher.AES.MODE_CBC, ct[:16])
                if has_proper_padding(cipher.decrypt(ct[16:])):
                    return i

        d2_pt = bust_message(ciphertext, 16, batch_check)
        self.assertEqual(strip_padding(d2_pt), plaintext)

def main():
    import time
    import sys
    import string
    import Crypto.Cipher.AES

    key = os.urandom(16)
    plaintext = b"The quick brown fox jumps over the lazy dog."
    iv = os.urandom(16)
    cipher = Crypto.Cipher.AES.new(key, Crypto.Cipher.AES.MODE_CBC, iv)
    ciphertext = iv + cipher.encrypt(pad_message(plaintext, 16))
    cipher = Crypto.Cipher.AES.new(key, Crypto.Cipher.AES.MODE_CBC, ciphertext[:16])
    d_pt = cipher.decrypt(ciphertext[16:])
    assert strip_padding(d_pt) == plaintext

    def batch_check(cts):
        for i, ct in enumerate(cts):
            time.sleep(0.001)
            cipher = Crypto.Cipher.AES.new(key, Crypto.Cipher.AES.MODE_CBC, ct[:16])
            if has_proper_padding(cipher.decrypt(ct[16:])):
                return i

    def progress(pt):
        sys.stdout.write(
            "\r"
            + "".join(
                "?" if b is None else "." if chr(b) not in string.printable else chr(b)
                for b in pt
            )
        )
        sys.stdout.flush()

    d2_pt = bust_message(ciphertext, 16, batch_check, progress=progress)
    print(flush=True)
    assert strip_padding(d2_pt) == plaintext

if __name__ == "__main__":
    # unittest.main()
    main()

Flag: TUCTF{D0nt_l3t_y0ur_s3rv3r_g1v3_f33db4ck}

