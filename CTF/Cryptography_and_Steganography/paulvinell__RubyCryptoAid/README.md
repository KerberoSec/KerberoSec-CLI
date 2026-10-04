# RubyCryptoAid
Support for solving basic cryptography exercises in Ruby. Also contains some functionality for statistics.

## Examples

### Cryptopals set 1, challenge 1
[Link to exercise](https://cryptopals.com/sets/1/challenges/1)

```
irb(main):002:0> "49276d206b696c6c696e6720796f757220627261696e206c696b6520612070
6f69736f6e6f7573206d757368726f6f6d".hex_to_raw => a
=> nil
irb(main):003:0> a.value
=> "I'm killing your brain like a poisonous mushroom"
irb(main):004:0> a.to_b64(strict: true)
=> "SSdtIGtpbGxpbmcgeW91ciBicmFpbiBsaWtlIGEgcG9pc29ub3VzIG11c2hyb29t"
```

### Cryptopals set 1, challenge 2
[Link to exercise](https://cryptopals.com/sets/1/challenges/2)

```
irb(main):005:0> "1c0111001f010100061a024b53535009181c".hex_to_raw => a
=> nil
irb(main):006:0> "686974207468652062756c6c277320657965".hex_to_raw => b
=> nil
irb(main):007:0* (a ^ b) => c
=> nil
irb(main):008:0> c.value
=> "the kid don't play"
irb(main):009:0> c.to_hex
=> "746865206b696420646f6e277420706c6179"
```

### Cryptopals set 1, challenge 3
[Link to exercise](https://cryptopals.com/sets/1/challenges/3)

```ruby
a = "1b37373331363f78151b7f2b783431333d78397828372d363c78373e783a393b3736"

require 'scoring'
require 'xor'

raw_a = a.hex_to_raw
key = xor_key_brute(raw_a) do |raw_string|
  char_freq(raw_string.value)
end

# Key: X
# Flag: Cooking MC's like a pound of bacon

puts "Key: #{key.value}"
puts
puts "Flag: #{(raw_a ^ key).value}"
```

### Cryptopals set 1, challenge 8
[Link to exercise](https://cryptopals.com/sets/1/challenges/8)

```ruby
# Belonging file: data/8.txt
file_path = File.join(__dir__, 'data', '8.txt')
file = File.open(file_path)
file_data = file.read

# Calculation
ecb_index = -1

require 'raw_string'

file_data.split("\n").each_with_index do |line, index|
  if line.hex_to_raw.aes_ecb?
    ecb_index = index
    break
  end
end

# ECB at line index: 132
puts "ECB at line index: #{ecb_index}"
```
