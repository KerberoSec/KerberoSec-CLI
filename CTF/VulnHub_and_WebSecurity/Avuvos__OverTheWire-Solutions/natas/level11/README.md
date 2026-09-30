# Natas Level 11 -> 12

## Goal

Find the password for natas12.

## Key Concept

XOR encryption with known plaintext attack / cookie manipulation.

## Solution

The application uses XOR encryption to protect cookie data. The cookie is created with:

```php
function saveData($d) {
    setcookie("data", base64_encode(xor_encrypt(json_encode($d))));
}

$defaultdata = array("showpassword"=>"no", "bgcolor"=>"#ffffff");
```

The XOR encryption uses a repeating key:

```php
function xor_encrypt($in) {
    $key = '<censored>';
    for($i=0;$i<strlen($in);$i++) {
        $outText .= $in[$i] ^ $key[$i % strlen($key)];
    }
    return $outText;
}
```

### The Vulnerability

We know the default plaintext (`{"showpassword":"no","bgcolor":"#ffffff"}`) and have the encrypted cookie. Since XOR is reversible:

```
ciphertext = plaintext ⊕ key
key = plaintext ⊕ ciphertext
```

We can recover the encryption key by XORing the known plaintext with the ciphertext.

The password is revealed when `showpassword` is `"yes"`:

```php
if($data["showpassword"] == "yes") {
    print "The password for natas12 is <censored><br>";
}
```

### Approach

1. Decode the base64 cookie to get the ciphertext
2. Encode the known default data as JSON bytes (matching PHP's `json_encode` format)
3. XOR plaintext with ciphertext to extract the key
4. Find the smallest repeating key pattern
5. Encrypt the desired payload (`{"showpassword":"yes","bgcolor":"#ffffff"}`) using the recovered key
6. Base64 encode and set as the cookie
7. Extract the password from the response

`solve.py`

```bash
uv run natas/level11/solve.py
```
