# aesy

### Desccription :

Please aes-decrypt the flag for me: key: 8e29bd9f7a4f50e2485acd455bd6595ee1c6d029c8b3ef82eba0f28e59afcf9f ciphertext: abcdd57efb034baf82fc1920a618e6a7fa496e319b4db1746b7d7e3d1198f64f

## Solution

This challenge was very simple, just decrypt ciphertext using given key in AES in ECB mode, you can use `https://gchq.github.io/CyberChef/` for decrypt the flag.

go to the [link](https://gchq.github.io/CyberChef/) search for AES decrypt, enter ciphertext and key and change mode to ECB, and Booom you have your flag

#### flag :   amateursCTF{w0w_3cb_a3s_1s_fun}