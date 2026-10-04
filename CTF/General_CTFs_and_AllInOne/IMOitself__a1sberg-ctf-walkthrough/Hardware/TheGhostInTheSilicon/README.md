(NOTE: this was done on termux so i kinda forgor the steps slightly)
1. Looking at the timestamps:
* `5.00000250000125e-07`
* `1.00000050000025e-06`
* `1.5000007500003748e-06`
* `...`

- The delta between each sample is precisely `0.0000005` seconds ($500$ nanoseconds). This means the logic analyzer or oscilloscope sampled the pin at **2 MHz** ($2,000,000$ samples per second).

2. we use termux, so install pre-compiled python packages using `tur-repo` because `pip install` takes too looong to install.
```bash
pkg install tur-repo -y
pkg update -y
pkg install python-numpy python-pandas matplotlib -y
```

3. we need to see the shape of the data. Is it UART, PWM, etc.
```bash
python checker.py
```

4. looking at the `plot.png` graph reveals a Pulse Width Modulation (PWM) based encoding.
<br>this is exactly why generating a plot is the most critical first step in **hardware reversing**. 

* 1. **The Period is Constant:** Every full bit cycle (one High pulse + one Low pulse) takes exactly **0.001 seconds (1 millisecond)**.
* 2. **The Data is in the Width:**
  - The first high pulse goes from `~0.00005s` to `~0.0003s` (Width = **250 microseconds**).
  - The second high pulse goes from `~0.00105s` to `~0.0018s` (Width = **750 microseconds**).
  - The third high pulse goes from `~0.00205s` to `~0.0023s` (Width = **250 microseconds**).

- This means the data is being transmitted by varying how long the LED stays on! 
* **Short Pulse (250µs High, 750µs Low)** = Represents a `0` bit.
* **Long Pulse (750µs High, 250µs Low)** = Represents a `1` bit.

5. decode the data using `decrypt.py`