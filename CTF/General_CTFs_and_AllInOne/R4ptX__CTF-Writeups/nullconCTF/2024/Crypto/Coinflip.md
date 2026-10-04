# Challenge

The challenge was about attacking a random number generation based on a cubic equation.
The equation corresponding to the PRNG was of the form: s(i+1) = a*s(i) (mod m)
and the generated bits were blocks of 64 bits corresponding to the state s(i).

Here is the source code of the challenge.

```python
#!/usr/bin/env python3
import os
import sys
from Crypto.Util.number import bytes_to_long, getRandomNBitInteger
import math

flag = open('flag','r').read().strip()
N = 64

def log(*err_messages):
	'''function for debugging purposes'''
	logs = open('err.log','a')
	for msg in err_messages:
		if type(msg) == bytes: msg = hexlify(msg).decode()
		logs.write(msg)
	logs.write('\n=====\n')
	logs.close()

class CRG(object):
	"""Cubic Random Generator"""

	def __init__(self, n):
		'''n - bitlength of state'''
		self.n = n
		self.m = getRandomNBitInteger(n)
		while True:
			self.a = bytes_to_long(os.urandom(n >> 3)) % self.m # n/8 bytes
			if math.gcd(self.a, self.m) == 1: break
		while True:
			self.state = bytes_to_long(os.urandom(n >> 3)) % self.m # n/8 bytes
			if math.gcd(self.state, self.m) == 1: break
		self.buffer = []

	def next(self):
		if self.buffer == []:
			self.buffer = [int(bit) for bit in bin(self.state)[2:].zfill(self.n)]
			self.state = self.a * pow(self.state, 3, self.m) % self.m
			#log('new state: ', self.state)
		return self.buffer.pop(0)

def loop():
	balance = 2
	coin = ['head','tails']
	crg = CRG(N)
	while True:
		if balance == 0:
			print('I do not talk to broke people.')
			return
		if balance >= 1000000000:
			print(f'Wow, here is your flag: {flag}')
			return
		print(f'How much do you want to bet? (you have {balance})')
		sys.stdout.flush()
		amount = int(sys.stdin.buffer.readline().strip())
		if amount > balance or amount <= 0:
			print('Ugh, cheater!')
			return
		print('What is your bet?')
		sys.stdout.flush()
		bet = sys.stdin.buffer.readline().strip().decode()
		if bet == coin[crg.next()]:
			print('you win')
			balance += amount
		else:
			print('you lose')
			balance -= amount

if __name__ == '__main__':
	try:
		loop()
	except Exception as err:
		print('Something went wrong')
		log('ERROR: ', repr(err))
```

# Solution

The idea of the challenge is simply to mount a probabilistic attack on the PRNG.
The steps are the following:
1. Recover 256 = 4*64 bits probabilistically
2. Then, we know s(i) for 0 <= i <= 3
3. From the values of the s(i)'s, recover the parameters of the PRNG m and a.
4. Find the value of s(5) and bet all of your money for each bet on the bits of s(5).
That was unexpected but step 4. seemed to work probabilistically, but since, that was enough to get the flag. 

Here is the solving script used:

```python

import sys
from math import gcd
from Crypto.Util.number import inverse
from pwn import remote
from time import sleep

def read_balance(line):
    if line[-2] == ')':
        line = line.split(" ")
        return int(line[-1][:-2])
    else:
        raise IndexError('Trying to read the balance in a wrong line')
    
def bit_from_result(result_line):
    if "win" in result_line:
        return 0
    else:
        return 1

def int_to_bin_list(n):
    return [int(bit) for bit in bin(n)[2:].zfill(64)]

def bin_list_to_int(bin_list):
    # convert a bin list to an integer
    return int(''.join(str(bit) for bit in bin_list), 2)

def reverse_list(liste):
    res = []
    for i in range(len(liste)):
        res.append(liste[len(liste)-1-i])
    return res

print(reverse_list([1,2,4,5,5]))

def reconstruct_first_states(bits_list):
    # Reconstruct the first four states from the first 256 bits
    liste_1 = bits_list[:64]
    liste_2 = bits_list[64:128]
    liste_3 = bits_list[128:192]
    liste_4 = bits_list[192:]
    assert len(liste_1)==64 and len(liste_2)==64 and len(liste_3)==64 and len(liste_4)==64
    return bin_list_to_int(liste_1), bin_list_to_int(liste_2), bin_list_to_int(liste_3), bin_list_to_int(liste_4)

def collect_bits(io):
    # Collect 64*4 = 256 bits in total
    bits_list = []
    while len(bits_list) < 256:
        bet_value_question = io.recvline().decode()
        balance = read_balance(bet_value_question)
        io.sendline(b"1") # send the whole balance
        bet_guess_question = io.recvline().decode()
        io.sendline(b'head') # always guessing 'head' in this first step
        result_guess = io.recvline().decode()
        bits_list.append(bit_from_result(result_guess))
    return bits_list

def compute_m(s0, s1, s2, s3):
    from math import gcd
    m_candidate = gcd(pow(s0,3)*s2-pow(s1,4), pow(s1,3)*s3-pow(s2,4))
    return m_candidate

def compute_a(s0, s1, s2, s3, m):
    a_candidate = (pow(s0, -3, m)*s1)%m
    return a_candidate

def final_preds(io, next_bits):
    for i in range(len(next_bits)):
        bet_value_question = io.recvline().decode()
        print(bet_value_question)
        balance = read_balance(bet_value_question)
        io.sendline(str(balance).encode()) # send the whole balance
        bet_guess_question = io.recvline().decode()
        if next_bits[i] == 0:
            io.sendline(b'head')
        else:
            io.sendline(b'tails')
        result_guess = io.recvline().decode()

def main():
    while True:
        try:
            io = remote("52.59.124.14", "5032")
            first_bits = collect_bits(io)
            s0, s1, s2, s3 = reconstruct_first_states(first_bits)
            m = compute_m(s0, s1, s2, s3)
            a = compute_a(s0, s1, s2, s3, m)
            s4 = (pow(s3, 3, m)*a)%m
            next_bits = int_to_bin_list(s4)
            final_preds(io, next_bits)
            break
            io.close()
        except:
            continue
main()
```